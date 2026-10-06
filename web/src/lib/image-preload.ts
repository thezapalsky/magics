import type { DisplayCard } from './types.ts';

interface ConnectionHint { saveData?: boolean; effectiveType?: string }
type WarmImage = Pick<HTMLImageElement, 'src' | 'decoding' | 'fetchPriority' | 'decode'>;
type Priority = 'high' | 'low';
interface Job {
  url: string;
  priority: Priority;
  promise: Promise<boolean>;
  resolve: (loaded: boolean) => void;
  image?: WarmImage;
}

export function canWarmImages(connection?: ConnectionHint): boolean {
  return !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '');
}

/** Current card (both faces), then a small rolling window. Never the whole deck. */
export function readerImageUrls(cards: DisplayCard[], index: number): string[] {
  const nearby = [index, index + 1, index - 1, index + 2, index + 3];
  return [...new Set(nearby.flatMap(position => {
    const card = cards[position];
    const faces = position === index ? card?.metadata.faces : card?.metadata.faces.slice(0, 1);
    return faces?.map(face => face.images?.large ?? face.images?.normal).filter((url): url is string => !!url) ?? [];
  }))];
}

/** Browser image requests share its normal HTTP cache, without a card-data API. */
export class ImagePreloader {
  private createImage: () => WarmImage;
  private jobs = new Map<string, Job>();
  private completed = new Map<string, boolean>();
  private queue: Job[] = [];
  private active = 0;
  private disposed = false;
  private paused = false;
  // Retain only a small decoded window; don't keep an entire deck of bitmaps in memory.
  private decoded = new Map<string, WarmImage>();

  constructor(createImage: () => WarmImage = () => new Image()) { this.createImage = createImage; }

  preload(url: string | undefined, priority: Priority = 'low'): Promise<boolean> {
    if (!url || this.disposed) return Promise.resolve(false);
    if (this.completed.has(url)) {
      const image = this.decoded.get(url);
      if (image) { this.decoded.delete(url); this.decoded.set(url, image); }
      return Promise.resolve(this.completed.get(url)!);
    }
    const pending = this.jobs.get(url);
    if (pending) {
      if (priority === 'high') {
        pending.priority = 'high';
        if (pending.image) pending.image.fetchPriority = 'high';
      }
      return pending.promise;
    }
    let resolve!: Job['resolve'];
    const promise = new Promise<boolean>(done => { resolve = done; });
    const job: Job = { url, priority, promise, resolve };
    this.jobs.set(url, job);
    this.queue.push(job);
    this.pump();
    return promise;
  }

  private pump() {
    if (this.disposed || this.paused) return;
    while (this.active < 2 && this.queue.length) {
      // Explicit hover/focus/open intent jumps ahead of background requests.
      const urgent = this.queue.findIndex(job => job.priority === 'high');
      const [job] = this.queue.splice(urgent < 0 ? 0 : urgent, 1);
      this.active++;
      void this.load(job);
    }
  }

  private async load(job: Job) {
    let loaded = false;
    try {
      const image = this.createImage();
      job.image = image;
      image.decoding = 'async';
      image.fetchPriority = job.priority;
      image.src = job.url;
      await image.decode();
      loaded = !this.disposed;
      if (loaded) {
        this.decoded.set(job.url, image);
        if (this.decoded.size > 8) this.decoded.delete(this.decoded.keys().next().value!);
      }
    } catch { /* Visible CardImage owns the readable failure state; warming is optional. */ }
    finally {
      if (!this.disposed) this.completed.set(job.url, loaded);
      this.jobs.delete(job.url);
      job.resolve(loaded);
      this.active--;
      this.pump();
    }
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (!paused) this.pump();
  }

  dispose() {
    this.disposed = true;
    for (const job of this.queue) job.resolve(false);
    this.queue = [];
    this.jobs.clear();
    this.completed.clear();
    this.decoded.clear();
    // At most two in-flight image requests finish normally; no further work starts.
  }
}
