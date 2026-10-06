import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canWarmImages, ImagePreloader, readerImageUrls } from '../src/lib/image-preload.ts';
import { families, loadDeck } from '../src/lib/decks.ts';

function fixture() {
  const started: { src: string; decoding: string; fetchPriority: string; finish: () => void; fail: () => void }[] = [];
  const warmer = new ImagePreloader(() => {
    let finish!: () => void;
    let fail!: () => void;
    const ready = new Promise<void>((resolve, reject) => { finish = resolve; fail = () => reject(new Error('artwork unavailable')); });
    const image = { src: '', decoding: 'auto' as HTMLImageElement['decoding'], fetchPriority: 'auto' as HTMLImageElement['fetchPriority'], decode: () => ready, finish, fail };
    started.push(image);
    return image;
  });
  return { warmer, started };
}

test('warming deduplicates image requests and never exceeds two concurrent loads', async () => {
  const { warmer, started } = fixture();
  const a = warmer.preload('a');
  assert.equal(warmer.preload('a', 'high'), a);
  const b = warmer.preload('b');
  const c = warmer.preload('c');
  assert.deepEqual(started.map(image => image.src), ['a', 'b']);
  assert.equal(started[0].fetchPriority, 'high');
  assert.equal(started[0].decoding, 'async');
  started[0].finish();
  assert.equal(await a, true);
  assert.equal(started.length, 3);
  started[1].finish(); started[2].finish();
  assert.deepEqual(await Promise.all([b, c]), [true, true]);
  assert.equal(await warmer.preload('a'), true);
  assert.equal(started.length, 3);
  warmer.dispose();
});

test('intent promotion jumps ahead of background images; failures are optional', async () => {
  const { warmer, started } = fixture();
  const a = warmer.preload('a'); const b = warmer.preload('b');
  const background = warmer.preload('background');
  const intent = warmer.preload('intent');
  assert.equal(warmer.preload('intent', 'high'), intent);
  started[0].fail();
  assert.equal(await a, false);
  assert.equal(started[2].src, 'intent');
  assert.equal(started[2].fetchPriority, 'high');
  started[1].finish();
  assert.equal(await b, true);
  assert.equal(started[3].src, 'background');
  started[2].finish(); started[3].finish();
  assert.deepEqual(await Promise.all([intent, background]), [true, true]);
  assert.equal(await warmer.preload('a'), false);
  assert.equal(started.length, 4);
  warmer.dispose();
});

test('disposing resolves queued work without starting more image requests', async () => {
  const { warmer, started } = fixture();
  const active = [warmer.preload('a'), warmer.preload('b')];
  const queued = warmer.preload('c');
  warmer.dispose();
  assert.equal(await queued, false);
  assert.equal(await warmer.preload('d'), false);
  started.forEach(image => image.finish());
  assert.deepEqual(await Promise.all(active), [false, false]);
  assert.equal(started.length, 2);
});

test('data-saver and slow connections disable optional warming', () => {
  assert.ok(canWarmImages());
  assert.ok(canWarmImages({ effectiveType: '4g' }));
  assert.equal(canWarmImages({ saveData: true }), false);
  for (const effectiveType of ['slow-2g', '2g', '3g']) assert.equal(canWarmImages({ effectiveType }), false);
});

test('hidden-page pause holds queued images and resumes without duplicate requests', async () => {
  const { warmer, started } = fixture();
  warmer.setPaused(true);
  const pending = warmer.preload('a');
  assert.equal(started.length, 0);
  warmer.setPaused(false);
  assert.equal(started.length, 1);
  const second = warmer.preload('b');
  const queued = warmer.preload('c');
  warmer.setPaused(true);
  started[0].finish(); started[1].finish();
  assert.deepEqual(await Promise.all([pending, second]), [true, true]);
  assert.equal(started.length, 2);
  warmer.setPaused(false);
  assert.equal(started[2].src, 'c');
  started[2].finish();
  assert.equal(await queued, true);
  warmer.dispose();
});

test('the rolling window includes both active faces, deduplicates, and stays bounded', () => {
  const deck = loadDeck(families[0], families[0].defaultVersion);
  const sephiroth = deck.cards.find(card => card.name.startsWith('Sephiroth'))!;
  const forest = deck.cards.find(card => card.name === 'Forest')!;
  const cards = [sephiroth, forest, forest, deck.commander, ...deck.cards];
  const urls = readerImageUrls(cards, 0);
  for (const face of sephiroth.metadata.faces) assert.ok(urls.includes(face.images!.large));
  assert.equal(urls.filter(url => url === forest.metadata.faces[0].images!.large).length, 1);
  assert.ok(urls.length <= 6);
  assert.equal(readerImageUrls([forest], 0).length, 1);
  assert.deepEqual(readerImageUrls([], 0), []);
});
