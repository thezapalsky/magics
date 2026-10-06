<script lang="ts">
  import { tick } from 'svelte';
  import CardImage from './CardImage.svelte';
  import Mana from './Mana.svelte';
  import { cardTypes, selectCards } from '../lib/card-utils.ts';
  import type { DisplayCard, LoadedDeck } from '../lib/types.ts';

  let { deck }: { deck: LoadedDeck } = $props();
  let query = $state('');
  let type = $state('All');
  let sort = $state('mana');
  let filtersOpen = $state(false);
  let exportOpen = $state(false);
  let copied = $state('');
  let selected = $state<DisplayCard | null>(null);
  let faceIndex = $state(0);
  let dialog: HTMLDialogElement;
  let opener: HTMLElement | null = null;
  let visible = $derived(selectCards(deck.cards, query, type, sort));
  let visibleCopies = $derived(visible.reduce((sum, card) => sum + card.quantity, 0));
  let face = $derived(selected?.metadata.faces[faceIndex]);

  async function inspect(card: DisplayCard, event: MouseEvent) {
    opener = event.currentTarget as HTMLElement;
    selected = card;
    faceIndex = 0;
    await tick();
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  function close() { dialog.close(); }
  function closed() { selected = null; document.body.style.overflow = ''; opener?.focus(); }
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
    <p class="deck-description">{deck.family.description}</p>
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
    <label class="search-box"><span aria-hidden="true">⌕</span><span class="sr-only">Search cards</span><input type="search" placeholder="Find a card, an Elf, a little magic…" bind:value={query} /></label>
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
  <div class="grid-heading"><h2>The ninety-nine</h2><span role="status" aria-live="polite">{visibleCopies} cards <span class="subtle">· {visible.length} unique</span></span></div>
  <div class="card-grid">
    {#each visible as card, index (card.key)}
      <button class="card-tile" onclick={(event) => inspect(card, event)} aria-label={`Inspect ${card.name}${card.quantity > 1 ? `, ${card.quantity} copies` : ''}`}>
        <span class="card-art"><CardImage src={card.metadata.faces[0].images?.normal} alt={card.name} eager={index < 6} />{#if card.quantity > 1}<span class="quantity">×{card.quantity}</span>{/if}{#if card.metadata.faces.length > 1}<span class="flip-badge" aria-hidden="true">↻</span>{/if}</span>
        <span class="card-name">{card.name}</span>
        <span class="card-mana"><Mana cost={card.metadata.faces[0].manaCost} /></span>
      </button>
    {/each}
  </div>
  {#if visible.length === 0}
    <div class="empty-state"><span aria-hidden="true">◇</span><h3>No matching cards.</h3><p>Try another name, type, or bit of rules text.</p><button class="control" onclick={() => { query = ''; type = 'All'; }}>Clear search & filters</button></div>
  {/if}
  <noscript><p class="noscript-note">The complete deck is visible below. Enable JavaScript for search, filters, card inspection and version selection.</p></noscript>
</section>

<dialog bind:this={dialog} class="card-dialog" onclose={closed} onclick={(event) => { if (event.target === dialog) close(); }} aria-labelledby="card-detail-title">
  {#if selected && face}
    <div class="dialog-inner">
      <button class="close-dialog" aria-label="Close card details" onclick={close}>×</button>
      <div class="detail-art">
        {#key `${selected.metadata.id}-${faceIndex}`}<CardImage src={face.images?.large ?? selected.metadata.faces[0].images?.large} alt={face.name} eager />{/key}
      </div>
      <div class="detail-copy">
        <div class="eyebrow">{selected === deck.commander ? 'Commander' : `${selected.quantity} ${selected.quantity === 1 ? 'copy' : 'copies'} in this deck`}</div>
        <h2 id="card-detail-title">{face.name}</h2>
        <Mana cost={face.manaCost} />
        <p class="detail-type">{face.typeLine}</p>
        <div class="oracle-text">{#each face.oracleText.split('\n') as paragraph}<p>{paragraph}</p>{/each}</div>
        {#if face.power !== undefined}<p class="card-stats">{face.power} / {face.toughness}</p>{/if}
        {#if face.loyalty !== undefined}<p class="card-stats">Loyalty {face.loyalty}</p>{/if}
        {#if selected.metadata.faces.length > 1}<div class="face-controls" aria-label="Card faces">{#each selected.metadata.faces as item, index}<button class:active={faceIndex === index} class="control" onclick={() => faceIndex = index} aria-pressed={faceIndex === index}>{index === 0 ? 'Front face' : 'Other face'} ↻</button>{/each}</div>{/if}
        <p class="printing-note">Artwork: {selected.metadata.set.toUpperCase()} #{selected.metadata.collectorNumber}{#if selected.set && (selected.set !== selected.metadata.set || selected.collectorNumber !== selected.metadata.collectorNumber)}<br />Saved printing: {selected.set.toUpperCase()} #{selected.collectorNumber}{/if}{#if selected.foil} · foil{/if}</p>
        {#if selected.metadata.digitalRebalanced}<p class="printing-note">Arena-rebalanced variant. Rules and card image sourced from Wizards’ published change.</p><a class="detail-source" href={selected.metadata.rulesSource} target="_blank" rel="noopener noreferrer">Arena rules source ↗</a>{:else}<a class="detail-source" href={selected.metadata.scryfallUrl} target="_blank" rel="noopener noreferrer">View on Scryfall ↗</a>{/if}
      </div>
    </div>
  {/if}
</dialog>

<style>
  .deck-intro { display: grid; grid-template-columns: 1fr 210px; gap: 5rem; padding: 2.6rem 0 3.5rem; align-items: center; }
  .back-link { display: inline-block; color: var(--muted); font-size: .8rem; margin-bottom: 2.8rem; }
  .back-link:hover { color: var(--text); }
  .eyebrow { font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); font-weight: 600; }
  .eyebrow span { color: var(--line); margin: 0 .5rem; }
  h1 { font-family: var(--serif); font-size: clamp(2.8rem, 5vw, 4.8rem); line-height: 1.12; font-weight: 400; letter-spacing: -.045em; margin: .5rem 0 .65rem; }
  .title-period { color: var(--accent); }
  .commander-name { color: var(--text); font-size: .95rem; margin: 0; }
  .deck-description { max-width: 35rem; color: var(--muted); line-height: 1.75; font-size: .88rem; margin: 1.3rem 0; }
  .deck-facts { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; color: var(--muted); font-size: .78rem; }
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
  .grid-heading { display: flex; align-items: baseline; justify-content: space-between; margin: 2rem 0 1.4rem; }
  .grid-heading h2 { margin: 0; font-family: var(--serif); font-weight: 400; font-size: 1.35rem; }
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
  .card-dialog { max-width: 830px; width: calc(100% - 2rem); max-height: calc(100dvh - 3rem); overflow-y: auto; padding: 0; background: #22251f; border: 1px solid #4c5444; border-radius: 15px; color: var(--text); }
  .card-dialog::backdrop { background: #080b08d9; backdrop-filter: blur(9px); }
  .dialog-inner { position: relative; display: grid; grid-template-columns: minmax(0, 310px) minmax(0, 1fr); gap: 2rem; padding: 2rem; }
  .close-dialog { position: absolute; z-index: 2; top: .5rem; right: .5rem; width: 36px; height: 36px; border-radius: 50%; color: var(--text); background: #30362c; border: 1px solid #55614a; cursor: pointer; font-size: 1.5rem; }
  .detail-copy { padding-top: 1.3rem; }
  .detail-copy h2 { font: 400 1.7rem / 1.2 var(--serif); margin: .7rem 0 1rem; }
  .detail-type { font-size: .78rem; color: var(--muted); padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
  .oracle-text { font-size: .82rem; line-height: 1.75; }
  .oracle-text p { margin: .75rem 0; }
  .card-stats { text-align: right; font-family: var(--serif); font-size: 1.3rem; }
  .face-controls { display: flex; gap: .5rem; flex-wrap: wrap; margin: 1.5rem 0; }
  .printing-note { color: var(--muted); font-size: .65rem; line-height: 1.8; margin-top: 1.5rem; }
  .detail-source { color: var(--accent); font-size: .75rem; }
  @media (max-width: 720px) {
    .deck-intro { grid-template-columns: 1fr 120px; gap: 1.2rem; padding-top: 1.7rem; padding-bottom: 2rem; }
    .back-link { margin-bottom: 1.8rem; }
    .commander-preview { width: 110px; }
    .commander-halo { inset: -.5rem; }
    .deck-description { font-size: .8rem; }
    .deck-facts { gap: .6rem 1rem; font-size: .72rem; }
    .toolbar { flex-wrap: wrap; }
    .search-box { flex-basis: 100%; }
    .toolbar-actions { width: 100%; justify-content: space-between; }
    .card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.4rem .85rem; }
    .dialog-inner { grid-template-columns: 1fr; gap: 1rem; padding: 1.5rem; }
    .detail-art { width: min(240px, 100%); margin: auto; }
    .detail-copy { padding-top: 0; }
  }
  @media (max-width: 460px) {
    .deck-intro { grid-template-columns: 1fr 92px; gap: .9rem; }
    .commander-preview { width: 88px; margin-top: .5rem; }
    .commander-caption { font-size: .6rem; }
    .commander-caption span { display: none; }
    .commander-name { font-size: .8rem; line-height: 1.5; }
    .deck-description { display: none; }
    .snapshot-note { font-size: .65rem; }
    .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.4rem 1rem; }
    .grid-heading h2 { font-size: 1.2rem; }
    .grid-heading > span { font-size: .65rem; }
  }
  @media (prefers-reduced-motion: reduce) { .card-tile, .commander-preview { transition: none; } .card-tile:hover, .commander-preview:hover { transform: none; } }
</style>
