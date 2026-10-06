<script lang="ts">
  import { onMount, tick } from 'svelte';
  import CardImage from './CardImage.svelte';
  import type { DisplayCard } from '../lib/types.ts';

  let { cards }: { cards: DisplayCard[] } = $props();
  let dialog: HTMLDialogElement;
  let feed: HTMLDivElement | undefined = $state();
  let opened = $state(false);
  let activeIndex = $state(0);
  let faceIndex = $state(0);
  let opener: HTMLElement | null = null;
  let previousOverflow = '';
  let current = $derived(cards[activeIndex]);
  let currentFace = $derived(current?.metadata.faces[faceIndex]);

  export async function openAt(index: number, trigger: HTMLElement) {
    if (!cards.length) return;
    opener = trigger;
    activeIndex = Math.max(0, Math.min(index, cards.length - 1));
    faceIndex = 0;
    opened = true;
    await tick();
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    feed?.scrollTo({ top: activeIndex * feed.clientHeight, behavior: 'instant' });
  }

  function moveTo(index: number, instant = false) {
    if (!feed || index < 0 || index >= cards.length) return;
    feed.scrollTo({ top: index * feed.clientHeight,
      behavior: instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function scrolled() {
    if (!feed?.clientHeight) return;
    const index = Math.max(0, Math.min(Math.round(feed.scrollTop / feed.clientHeight), cards.length - 1));
    if (index !== activeIndex) {
      const focused = document.activeElement as HTMLElement;
      // A departing slide becomes inert, and a boundary arrow becomes disabled.
      // Move their focus to a stable control before either can discard it.
      if (focused.closest('.card-slide') ||
        (index === 0 && focused.getAttribute('aria-label') === 'Previous card') ||
        (index === cards.length - 1 && focused.getAttribute('aria-label') === 'Next card')) {
        dialog.querySelector<HTMLButtonElement>('.close-browser')?.focus({ preventScroll: true });
      }
      activeIndex = index; faceIndex = 0;
    }
  }
  function closed() {
    opened = false;
    document.body.style.overflow = previousOverflow;
    opener?.focus();
  }
  function keydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')]
        .filter(element => !element.closest('[inert]') && element.getClientRects().length > 0);
      if (controls.length) {
        event.preventDefault();
        const position = controls.indexOf(document.activeElement as HTMLElement);
        const next = position < 0 ? (event.shiftKey ? controls.length - 1 : 0)
          : (position + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next].focus({ preventScroll: true });
      }
      return;
    }
    const directions: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (event.key in directions) { event.preventDefault(); moveTo(activeIndex + directions[event.key]); }
    else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); moveTo(event.key === 'Home' ? 0 : cards.length - 1, true);
    }
  }

  // One wheel gesture advances one card. Native vertical scrolling remains
  // available to touch swipes, with CSS snap points at each complete card.
  function wheelNavigation(node: HTMLDivElement) {
    let accumulated = 0;
    let blockedUntil = 0;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (performance.now() < blockedUntil) return;
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : 1);
      if (Math.abs(accumulated) < 40) return;
      moveTo(activeIndex + Math.sign(accumulated));
      accumulated = 0;
      blockedUntil = performance.now() + 450;
    };
    node.addEventListener('wheel', wheel, { passive: false });
    return { destroy() { node.removeEventListener('wheel', wheel); } };
  }
  onMount(() => {
    const resize = () => { if (dialog.open && feed) feed.scrollTo({ top: activeIndex * feed.clientHeight, behavior: 'instant' }); };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  });
</script>

<dialog bind:this={dialog} class="card-browser" onclose={closed} onkeydown={keydown}
  aria-labelledby="card-browser-title" aria-describedby="card-browser-help">
  {#if opened && currentFace}
    <h2 id="card-browser-title" class="sr-only">{currentFace.name}</h2>
    <p id="card-browser-help" class="sr-only">Scroll or swipe to browse. Arrow keys change cards. Escape closes the browser.</p>
    <button class="close-browser" aria-label="Close card browser" onclick={() => dialog.close()}>×</button>
    <div class="card-feed" bind:this={feed} use:wheelNavigation onscroll={scrolled} data-active-index={activeIndex}>
      {#each cards as card, index (card.key)}
        {@const face = card.metadata.faces[index === activeIndex ? faceIndex : 0]}
        <section class="card-slide" aria-label={face.name} aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
          <div class="reader-art">
            {#key `${card.key}-${face.name}`}
              <CardImage src={Math.abs(index - activeIndex) <= 1 ? (face.images?.large ?? card.metadata.faces[0].images?.large) : undefined}
                alt={face.name} eager={index === activeIndex} />
            {/key}
          </div>
          <div class="sr-only">{face.manaCost}. {face.typeLine}. {face.oracleText}</div>
          <div class="reader-footer">
            {#if card.metadata.faces.length > 1}
              <button class="flip-card" aria-label={`Flip ${card.name}`} onclick={() => faceIndex = (faceIndex + 1) % card.metadata.faces.length}>Flip card ↻</button>
            {/if}
            {#if card.metadata.digitalRebalanced}
              <a href={card.metadata.rulesSource} target="_blank" rel="noopener noreferrer">Arena rules source ↗</a>
            {:else}
              <a href={card.metadata.scryfallUrl} target="_blank" rel="noopener noreferrer">View on Scryfall ↗</a>
            {/if}
          </div>
        </section>
      {/each}
    </div>
    <span class="reader-position" role="status" aria-live="polite"><span class="sr-only">{currentFace.name}, card </span>{activeIndex + 1} / {cards.length}</span>
    <nav class="browser-navigation" aria-label="Browse deck cards">
      <button aria-label="Previous card" disabled={activeIndex === 0} onclick={() => moveTo(activeIndex - 1)}>↑</button>
      <button aria-label="Next card" disabled={activeIndex === cards.length - 1} onclick={() => moveTo(activeIndex + 1)}>↓</button>
    </nav>
  {/if}
</dialog>

<style>
  .card-browser { position: fixed; inset: 0; width: 100%; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; overflow: hidden; border: 0; background: #171c16; color: var(--text); }
  .card-browser::backdrop { background: #0b100be8; }
  .card-feed { height: 100%; overflow-y: auto; scroll-snap-type: y mandatory; overscroll-behavior: contain; scrollbar-width: none; }
  .card-feed::-webkit-scrollbar { display: none; }
  .card-slide { height: 100%; scroll-snap-align: start; scroll-snap-stop: always; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 3rem 1.5rem 4rem; }
  .reader-art { width: min(488px, calc((100dvh - 160px) * 488 / 680), calc(100vw - 48px)); border-radius: 10px; box-shadow: 0 16px 64px #0007; }
  .reader-footer { display: flex; align-items: center; justify-content: center; gap: 1.5rem; font-size: .75rem; color: var(--accent); }
  .reader-footer a { padding: .5rem 0; }
  .flip-card { background: none; border: 0; color: var(--accent); padding: .5rem 0; cursor: pointer; }
  .close-browser { position: absolute; z-index: 2; top: 1rem; right: 1rem; width: 44px; height: 44px; border: 1px solid var(--line); border-radius: 50%; background: var(--panel); color: var(--text); font-size: 1.6rem; cursor: pointer; }
  .reader-position { position: absolute; bottom: 1.5rem; left: 1.5rem; font-size: .75rem; color: var(--muted); pointer-events: none; }
  .browser-navigation { position: absolute; right: 2rem; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: .75rem; }
  .browser-navigation button { width: 44px; height: 44px; border: 1px solid #59634d; border-radius: 50%; background: var(--panel); color: var(--accent); font-size: 1.3rem; cursor: pointer; }
  .browser-navigation button:disabled { opacity: .3; cursor: default; }
  @media (max-width: 600px) { .browser-navigation { top: auto; bottom: .8rem; right: 1rem; transform: none; flex-direction: row; gap: .5rem; } .reader-position { bottom: 1.7rem; left: 1rem; } }
</style>
