<script lang="ts">
  import { onMount } from 'svelte';
  import CardImage from './CardImage.svelte';
  import CardBrowser from './CardBrowser.svelte';
  import Mana from './Mana.svelte';
  import { cardTypes, groupByMana, isCardView, selectCards, type CardView } from '../lib/card-utils.ts';
  import type { DisplayCard, LoadedDeck } from '../lib/types.ts';

  let { deck }: { deck: LoadedDeck } = $props();
  let query = $state('');
  let type = $state('All');
  let sort = $state('mana');
  let filtersOpen = $state(false);
  let exportOpen = $state(false);
  let copied = $state('');
  let view: CardView = $state('grid');
  let browser: { openAt(index: number, trigger: HTMLElement): Promise<void> };
  const views: { id: CardView; label: string }[] = [{ id: 'grid', label: 'Grid' }, { id: 'stacks', label: 'Mana stacks' }, { id: 'browse', label: 'Card browser' }];
  let visible = $derived(selectCards(deck.cards, query, type, sort));
  let visibleCopies = $derived(visible.reduce((sum, card) => sum + card.quantity, 0));
  let manaGroups = $derived(groupByMana(visible));
  let browseCards = $derived([deck.commander, ...visible]);

  function inspect(card: DisplayCard, event: MouseEvent) {
    void browser.openAt(browseCards.findIndex(item => item.key === card.key), event.currentTarget as HTMLElement);
  }
  function chooseView(next: CardView, event: MouseEvent) {
    view = next;
    try { localStorage.setItem('magics-card-view', next); } catch { /* The controls work without storage permission. */ }
    if (next === 'browse') void browser.openAt(0, event.currentTarget as HTMLElement);
  }
  onMount(() => {
    try { const saved = localStorage.getItem('magics-card-view'); if (isCardView(saved)) view = saved; } catch { /* Keep the server-rendered grid. */ }
  });
  function changeVersion(event: Event) {
    window.location.assign(`/decks/${deck.family.id}/${(event.currentTarget as HTMLSelectElement).value}/`);
  }
  async function copyDeck() {
    try {
      await navigator.clipboard.writeText(deck.exportText);
      copied = 'Decklist copied';
    } catch { copied = 'Clipboard unavailable — use Download text instead.'; }
  }
  let downloadUrl = $derived(`/exports/${deck.family.id}-${deck.snapshot.version}.txt`);
</script>

<section class="deck-intro" aria-labelledby="deck-title">
  <div class="intro-copy">
    <a class="back-link" href="/">← All decks</a>
    <div class="eyebrow">{deck.family.medium} <span> / </span> {deck.family.format}</div>
    <h1 id="deck-title">{deck.family.title}<span class="title-period">.</span></h1>
    <p class="commander-name">{deck.commander.name}</p>
    <div class="deck-facts"><span><strong>{deck.total}</strong> cards</span><span><strong>{deck.landCount}</strong> lands</span><span class="status"><i></i>{deck.snapshot.status}</span></div>
    <p class="snapshot-note">{deck.snapshot.note}</p>
  </div>
  <button class="commander-preview" aria-label={`Inspect commander: ${deck.commander.name}`} onclick={(event) => inspect(deck.commander, event)}>
    <span class="commander-halo" aria-hidden="true"></span>
    <CardImage src={deck.commander.metadata.faces[0].images?.normal} alt={deck.commander.name} eager />
    <span class="commander-caption">Your commander <span>↗</span></span>
  </button>
</section>

<section class="deck-content" aria-label="Decklist">
  <div class="toolbar">
    <label class="search-box"><span aria-hidden="true">⌕</span><span class="sr-only">Search cards</span><input type="search" placeholder="Search cards" bind:value={query} /></label>
    <div class="toolbar-actions">
      <button class:active={filtersOpen || type !== 'All' || sort !== 'mana'} class="control" onclick={() => { filtersOpen = !filtersOpen; exportOpen = false; }} aria-expanded={filtersOpen} aria-controls="filters">Filter & sort <span aria-hidden="true">↓</span></button>
      <label class="version-control"><span class="sr-only">Deck version</span><select value={deck.snapshot.version} onchange={changeVersion}>{#each deck.family.versions as version}<option value={version.version}>v{version.version}</option>{/each}</select></label>
      <button class:active={exportOpen} class="control export-control" onclick={() => { exportOpen = !exportOpen; filtersOpen = false; }} aria-expanded={exportOpen} aria-controls="export-menu">Export <span aria-hidden="true">↗</span></button>
    </div>
  </div>
  {#if filtersOpen}
    <div id="filters" class="disclosure">
      <label>Card type<select bind:value={type}><option>All</option>{#each cardTypes as value}<option>{value}</option>{/each}</select></label>
      <label>Order<select bind:value={sort}><option value="mana">Mana value</option><option value="name">Name</option></select></label>
      <button class="text-button" onclick={() => { query = ''; type = 'All'; sort = 'mana'; }}>Reset</button>
    </div>
  {/if}
  {#if exportOpen}
    <div id="export-menu" class="disclosure export-menu">
      <p>{deck.family.medium === 'Paper' ? 'Paper list · ManaBox text. Not an Arena import.' : 'Arena-format text · also readable by ManaBox. Importing does not confirm ownership.'}</p>
      <button class="control" onclick={copyDeck}>Copy decklist</button>
      <a class="control" href={downloadUrl} download>Download text ↓</a>
      <span role="status">{copied}</span>
    </div>
  {/if}
  <div class="grid-heading">
    <div class="view-controls" role="group" aria-label="Card layout">{#each views as option}<button class:active={view === option.id} aria-pressed={view === option.id} onclick={(event) => chooseView(option.id, event)}>{option.label}</button>{/each}</div>
    <span role="status" aria-live="polite">{visibleCopies} cards <span class="subtle">· {visible.length} unique</span></span>
  </div>
  {#if view === 'grid'}
    <div class="card-grid">
    {#each visible as card, index (card.key)}
      <button class="card-tile" onclick={(event) => inspect(card, event)} aria-label={`Inspect ${card.name}${card.quantity > 1 ? `, ${card.quantity} copies` : ''}`}>
        <span class="card-art"><CardImage src={card.metadata.faces[0].images?.normal} alt={card.name} eager={index < 6} />{#if card.quantity > 1}<span class="quantity">×{card.quantity}</span>{/if}{#if card.metadata.faces.length > 1}<span class="flip-badge" aria-hidden="true">↻</span>{/if}</span>
        <span class="card-name">{card.name}</span>
        <span class="card-mana"><Mana cost={card.metadata.faces[0].manaCost} /></span>
      </button>
    {/each}
    </div>
  {:else if view === 'stacks'}
    <p class="stack-note">Mana value columns. X counts as 0. Hover or focus to reveal; tap to browse.</p>
    <div class="mana-columns" role="region" aria-label="Cards grouped by mana value">
      {#each manaGroups as group (group.id)}
        <section class="mana-column" aria-labelledby={`mana-${group.id}`}>
          <h2 id={`mana-${group.id}`}>{group.label}<span>{group.quantity}</span></h2>
          <ol class="stack-pile">
            {#each group.cards as card, index (card.key)}
              <li style={`--stack-order: ${index}`}>
                <button class="stack-card" onclick={(event) => inspect(card, event)} aria-label={`Inspect ${card.name}${card.quantity > 1 ? `, ${card.quantity} copies` : ''}`}>
                  <CardImage src={card.metadata.faces[0].images?.normal} alt={card.name} eager={index < 2} />
                  {#if card.quantity > 1}<span class="stack-quantity">×{card.quantity}</span>{/if}
                </button>
              </li>
            {/each}
          </ol>
        </section>
      {/each}
    </div>
  {:else}
    <button class="browse-launch" onclick={(event) => void browser.openAt(0, event.currentTarget)}>
      <span class="launch-art"><CardImage src={deck.commander.metadata.faces[0].images?.normal} alt={deck.commander.name} /></span>
      <span>Browse cards <span aria-hidden="true">→</span></span>
    </button>
  {/if}
  {#if visible.length === 0}
    <div class="empty-state"><span aria-hidden="true">◇</span><h3>No matching cards.</h3><p>Try another name, type, or bit of rules text.</p><button class="control" onclick={() => { query = ''; type = 'All'; }}>Clear search & filters</button></div>
  {/if}
  <noscript><p class="noscript-note">Enable JavaScript for search, layouts, card browsing and version selection.</p></noscript>
</section>

<CardBrowser cards={browseCards} bind:this={browser} />

<style>
  .deck-intro { display: grid; grid-template-columns: 1fr 210px; gap: 5rem; padding: 2.6rem 0 3.5rem; align-items: center; }
  .back-link { display: inline-block; color: var(--muted); font-size: .8rem; margin-bottom: 2.8rem; }
  .back-link:hover { color: var(--text); }
  .eyebrow { font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); font-weight: 600; }
  .eyebrow span { color: var(--line); margin: 0 .5rem; }
  h1 { font-family: var(--serif); font-size: clamp(2.8rem, 5vw, 4.8rem); line-height: 1.12; font-weight: 400; letter-spacing: -.045em; margin: .5rem 0 .65rem; }
  .title-period { color: var(--accent); }
  .commander-name { color: var(--text); font-size: .95rem; margin: 0; }
  .deck-facts { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; color: var(--muted); font-size: .78rem; margin-top: 1.3rem; }
  .deck-facts strong { color: var(--text); font-weight: 500; }
  .status { display: inline-flex; align-items: center; gap: .4rem; }
  .status i { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
  .snapshot-note { color: var(--muted); opacity: .85; font-size: .72rem; max-width: 34rem; line-height: 1.6; margin-top: 1.3rem; }
  .commander-preview { position: relative; border: 0; background: none; padding: 0; width: 180px; justify-self: center; margin-top: 2.6rem; text-align: left; cursor: pointer; transition: transform 180ms ease; }
  .commander-preview:hover { transform: translateY(-4px) rotate(1deg); }
  .commander-halo { position: absolute; inset: -3rem; background: radial-gradient(ellipse, #52624444, transparent 70%); pointer-events: none; }
  .commander-caption { display: flex; justify-content: space-between; color: var(--muted); font-size: .67rem; margin-top: .8rem; }
  .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.1rem 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .search-box { display: flex; align-items: center; flex: 1; min-width: 0; gap: .75rem; }
  .search-box > span:first-child { color: var(--accent); font-size: 1.5rem; line-height: 1; }
  .search-box input { width: 100%; max-width: 28rem; border: 0; color: var(--text); background: transparent; font-size: .8rem; padding: .5rem 0; outline-offset: 5px; }
  .search-box input::placeholder { color: var(--muted); opacity: .8; }
  .toolbar-actions { display: flex; align-items: center; gap: .45rem; }
  .control, .version-control select { display: inline-flex; align-items: center; justify-content: center; gap: .7rem; font-size: .72rem; color: var(--muted); background: transparent; border: 1px solid var(--line); border-radius: 6px; padding: .6rem .75rem; cursor: pointer; min-height: 36px; }
  .control:hover, .control.active { background: var(--panel); color: var(--text); border-color: #515a49; }
  .version-control select { color: var(--text); padding-right: .6rem; }
  .version-control select option { background: var(--bg); }
  .disclosure { display: flex; align-items: end; flex-wrap: wrap; gap: 1rem; padding: 1rem; margin-top: .5rem; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; font-size: .75rem; }
  .disclosure label { display: grid; gap: .4rem; color: var(--muted); }
  .disclosure select { background: var(--bg); color: var(--text); border: 1px solid var(--line); padding: .5rem; border-radius: 4px; min-width: 150px; }
  .text-button { color: var(--accent); background: none; border: none; padding: .65rem; cursor: pointer; font-size: .75rem; }
  .export-menu { align-items: center; }
  .export-menu p { flex-basis: 100%; margin: 0; color: var(--muted); }
  .export-menu [role=status] { color: var(--accent); font-size: .72rem; }
  .grid-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin: 2rem 0 1.4rem; }
  .view-controls { display: flex; border: 1px solid var(--line); border-radius: 7px; padding: 3px; }
  .view-controls button { border: 0; border-radius: 4px; background: none; color: var(--muted); font-size: .72rem; padding: .55rem .7rem; cursor: pointer; }
  .view-controls button.active { background: #36402e; color: var(--text); }
  .grid-heading > span { font-size: .72rem; color: var(--muted); }
  .subtle { opacity: .7; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 1.8rem 1.1rem; }
  .card-tile { display: flex; flex-direction: column; width: 100%; min-width: 0; padding: 0; border: 0; background: none; text-align: left; cursor: pointer; border-radius: 8px; transition: transform 160ms ease; }
  .card-tile:hover { transform: translateY(-5px); }
  .card-art { display: block; width: 100%; position: relative; box-shadow: 0 7px 14px #0003; border-radius: 9px; }
  .quantity, .flip-badge { position: absolute; bottom: .5rem; right: .5rem; color: #f4f0e2; background: #161b16e8; border: 1px solid #ffffff22; border-radius: 5px; padding: .25rem .45rem; font-size: .8rem; backdrop-filter: blur(8px); }
  .flip-badge { left: .5rem; right: auto; font-size: .95rem; }
  .card-name { display: block; font-size: .73rem; line-height: 1.4; color: var(--text); margin: .7rem 0 .4rem; }
  .card-mana { min-height: 1.2rem; }
  .empty-state { padding: 5rem 1rem; text-align: center; color: var(--muted); }
  .empty-state > span { font-size: 2rem; color: var(--accent); }
  .empty-state h3 { font: 400 1.6rem var(--serif); color: var(--text); }
  .empty-state p { font-size: .85rem; }
  .noscript-note { color: var(--muted); font-size: .8rem; }
  .stack-note { color: var(--muted); font-size: .7rem; margin: -.3rem 0 1.5rem; line-height: 1.6; }
  .mana-columns { display: flex; gap: 1.3rem; align-items: flex-start; overflow: auto; padding: 8px 10px 20px; margin: -8px -10px; scrollbar-width: thin; scrollbar-color: #526044 transparent; }
  .mana-column { flex: 0 0 176px; min-width: 0; }
  .mana-column h2 { font-size: .8rem; font-weight: 500; margin: 0 0 1rem; display: flex; justify-content: space-between; color: var(--text); }
  .mana-column h2 span { color: var(--muted); font-size: .7rem; }
  .stack-pile { padding: 0; margin: 0; list-style: none; }
  .stack-pile li { position: relative; height: 42px; z-index: var(--stack-order); }
  .stack-pile li:last-child { height: auto; aspect-ratio: 488 / 680; }
  .stack-pile li:has(.stack-card:hover), .stack-pile li:focus-within { z-index: 100; }
  .stack-card { position: relative; display: block; width: 100%; padding: 0; border: 0; border-radius: 9px; background: transparent; cursor: pointer; box-shadow: 0 -3px 12px #0004; transition: transform 130ms ease; }
  .stack-card:hover, .stack-card:focus-visible { transform: translateY(-4px); box-shadow: 0 5px 24px #000a; }
  .stack-quantity { position: absolute; right: .4rem; top: .4rem; padding: .15rem .35rem; border-radius: 4px; background: #161b16e8; font-size: .65rem; }
  .stack-card :global(.image-placeholder) { justify-content: flex-start; gap: .2rem; padding: .5rem; font-size: .7rem; }
  .stack-card :global(.placeholder-mark) { display: none; }
  .browse-launch { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; width: 100%; padding: 2rem; border: 1px solid var(--line); border-radius: 9px; background: none; cursor: pointer; color: var(--accent); font-size: .85rem; }
  .launch-art { display: block; width: 176px; }
  @media (max-width: 720px) {
    .deck-intro { grid-template-columns: 1fr 120px; gap: 1.2rem; padding-top: 1.7rem; padding-bottom: 2rem; }
    .back-link { margin-bottom: 1.8rem; }
    .commander-preview { width: 110px; }
    .commander-halo { inset: -.5rem; }
    .deck-facts { gap: .6rem 1rem; font-size: .72rem; }
    .toolbar { flex-wrap: wrap; }
    .search-box { flex-basis: 100%; }
    .toolbar-actions { width: 100%; justify-content: space-between; }
    .card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.4rem .85rem; }
    .mana-column { flex-basis: 154px; }
    .mana-columns { gap: 1rem; }
  }
  @media (max-width: 460px) {
    .deck-intro { grid-template-columns: 1fr 92px; gap: .9rem; }
    .commander-preview { width: 88px; margin-top: .5rem; }
    .commander-caption { font-size: .6rem; }
    .commander-caption span { display: none; }
    .commander-name { font-size: .8rem; line-height: 1.5; }
    .snapshot-note { font-size: .65rem; }
    .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.4rem 1rem; }
    .grid-heading > span { font-size: .65rem; }
  }
  @media (prefers-reduced-motion: reduce) { .card-tile, .commander-preview, .stack-card { transition: none; } .card-tile:hover, .commander-preview:hover, .stack-card:hover, .stack-card:focus-visible { transform: none; } }
</style>
