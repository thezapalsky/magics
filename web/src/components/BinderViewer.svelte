<script lang="ts">
  import { onMount } from 'svelte';
  import CardImage from './CardImage.svelte';
  import CardBrowser from './CardBrowser.svelte';
  import { makeBinderPages, matchesBinderCard, type BinderCard, type BinderFilters } from '../lib/binder-utils.ts';
  import type { loadBinder } from '../lib/binder.ts';

  let { inventory, stats, cards }: Omit<ReturnType<typeof loadBinder>, 'pages'> = $props();
  let query = $state('');
  let status: BinderFilters['status'] = $state('all');
  let set: BinderFilters['set'] = $state('all');
  let ready = $state(false);
  let browser: { openAt(index: number, trigger: HTMLElement): Promise<void> };
  let filters = $derived({ query, status, set });
  let pages = $derived(makeBinderPages(cards, inventory.rules.galleryPages + Math.ceil(inventory.entries.length / 4)));
  let matching = $derived(cards.filter(card => matchesBinderCard(card, filters)));
  let visiblePages = $derived(pages.filter(page => page.pockets.some(card => card && matchesBinderCard(card, filters))));
  let filtered = $derived(Boolean(query.trim()) || status !== 'all' || set !== 'all');
  const positions = ['Top left', 'Top right', 'Bottom left', 'Bottom right'];

  function inspect(card: BinderCard, event: MouseEvent) {
    void browser.openAt(matching.findIndex(item => item.key === card.key), event.currentTarget as HTMLElement);
  }
  function reset() { query = ''; status = 'all'; set = 'all'; }
  onMount(() => { ready = true; });
</script>

<section class="binder-intro" aria-labelledby="binder-title">
  <a class="back-link" href="/">← My decks</a>
  <p class="eyebrow">The character collection</p>
  <h1 id="binder-title">Spider-Man<span>.</span></h1>
  <p class="intro-note">One character, one place. Heroes, allies and villains in their permanent pockets.</p>
  <div class="collection-progress">
    <div class="main-progress">
      <div class="progress-heading"><h2>Main collection <span>SPM</span></h2><span class="percent">{stats.percent}%</span></div>
      <p><strong>{stats.mainOwned}<span> / {stats.mainTarget}</span></strong> legendary creatures <span class="remaining">{stats.mainMissing} to find</span></p>
      <progress value={stats.mainOwned} max={stats.mainTarget} aria-label={`SPM collection: ${stats.mainOwned} of ${stats.mainTarget} owned`}></progress>
    </div>
    <div class="bonus-progress"><h2>The extras <span>SPE</span></h2><p><strong>{stats.bonusOwned}</strong> bonus cards</p><span>{stats.bonusReserved} reserved spaces · optional additions</span></div>
  </div>
  <p class="inventory-note">Checked {inventory.verifiedAt} · {stats.slots} character slots · 4 pockets per page · 2 opening gallery pages</p>
</section>

<section class="binder-controls" aria-label="Filter binder cards">
  <label class="search"><span class="sr-only">Search binder cards</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Find a character…" bind:value={query} disabled={!ready} /></label>
  <div class="status-filters" role="group" aria-label="Ownership">
    {#each [{ value: 'all', label: 'All cards' }, { value: 'owned', label: 'Owned' }, { value: 'missing', label: 'Missing' }] as option}
      <button type="button" aria-pressed={status === option.value} onclick={() => status = option.value as BinderFilters['status']} disabled={!ready}>{option.label}</button>
    {/each}
  </div>
  <label class="set-filter"><span class="sr-only">Card set</span><select aria-label="Card set" bind:value={set} disabled={!ready}><option value="all">All sets + gallery</option><option value="SPM">SPM · main collection</option><option value="SPE">SPE · optional extras</option><option value="Gallery">Opening gallery</option></select></label>
</section>
<div class="results-heading">
  <p role="status" aria-live="polite"><strong>{matching.length}</strong> {matching.length === 1 ? 'card' : 'cards'} {filtered ? 'matching' : 'in the binder'} · {visiblePages.length} {visiblePages.length === 1 ? 'page' : 'pages'}</p>
  {#if filtered}<button class="reset" onclick={reset}>Clear filters ↺</button>{:else}<span>Gallery first, then Heroes → Allies → Villains</span>{/if}
</div>
{#if filtered && matching.length}<p class="filter-note">Other cards stay dimmed in their original pockets.</p>{/if}

{#if !matching.length}
  <div class="empty-results"><h2>No cards match.</h2><p>Try another name, set or ownership filter.</p><button onclick={reset}>Show the full binder</button></div>
{:else}
  <div class="binder-pages">
    {#each visiblePages as page (page.number)}
      <section class="binder-page" aria-labelledby={`page-${page.number}`} data-binder-page={page.number}>
        <div class="page-heading"><h2 id={`page-${page.number}`}>Page {String(page.number).padStart(2, '0')}</h2><span>{page.sections.map(section => section === 'Allies & Supporting Cast' ? 'Allies' : section).join(' / ')}</span></div>
        <div class="pocket-grid">
          {#each page.pockets as card, pocket}
            {#if card}
              {@const match = matchesBinderCard(card, filters)}
              <article class="pocket" class:missing={card.status === 'missing'} class:dimmed={!match} data-binder-slot={card.characterSlot ?? `gallery-${pocket + (page.number - 1) * 4 + 1}`} data-pocket={pocket + 1}>
                <button class="card-art" onclick={event => inspect(card, event)} disabled={!ready || !match} aria-label={`Inspect ${card.name}, ${card.status === 'owned' ? 'owned' : card.placeholder === 'label' ? 'reserved space' : 'printed proxy'}. Page ${page.number}, ${positions[pocket]}.`}>
                  <CardImage src={card.metadata.faces[0].images?.normal} alt={card.name} eager={page.number === 1 && pocket < 2} />
                  {#if card.placeholder === 'label'}<span class="reserved-label"><span>Reserved</span><strong>{card.name}</strong><small>{card.set?.toUpperCase()} {card.collectorNumber?.padStart(4, '0')}</small></span>{/if}
                </button>
                <div class="pocket-info"><div class="pocket-label"><span class="pocket-set">{card.set?.toUpperCase()} {card.collectorNumber?.padStart(4, '0')}</span><span class="card-status" class:is-owned={card.status === 'owned'}><i></i>{card.status === 'owned' ? 'Owned' : card.placeholder === 'label' ? 'Reserved' : 'Proxy'}</span></div><h3>{card.name}</h3><span class="slot-number">{card.characterSlot ? `Slot ${String(card.characterSlot).padStart(2, '0')}` : 'Display gallery'}</span></div>
              </article>
            {:else}
              <div class="empty-pocket" data-pocket={pocket + 1} aria-label={`Empty pocket, page ${page.number}, ${positions[pocket]}`}><span aria-hidden="true">◇</span><span>Empty pocket</span></div>
            {/if}
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/if}

<section class="binder-notes" aria-labelledby="collection-notes">
  <div><h2 id="collection-notes">Room for the next find.</h2><p>A new card replaces its proxy or label. The main goal stays at 79 SPM names; SPE cards are optional. The opening gallery sits outside those counts.</p><p>Display preference: full-art / showcase → foil → regular. Artwork is a reference where the physical printing has not been identified; foil finishes are unverified.</p></div>
  <div class="missing-downloads"><h3>Missing-card print lists</h3><a href="/exports/spider-man-spm.txt" download>SPM · {stats.mainMissing} missing ↗</a><a href="/exports/spider-man-spe.txt" download>SPE · {stats.bonusReserved} reserved ↗</a><span>One copy per name, with padded collector numbers.</span></div>
</section>
<CardBrowser bind:this={browser} cards={matching} warmAt={() => {}} />

<style>
  .binder-intro { padding: 2.5rem 0 2rem; }
  .back-link { color: var(--muted); font-size: .75rem; }
  .back-link:hover { color: var(--accent); }
  .eyebrow { margin: 2.3rem 0 .65rem; color: var(--accent); text-transform: uppercase; font-size: .65rem; letter-spacing: .13em; }
  h1 { font: 400 clamp(3rem, 6vw, 5.2rem)/1.1 var(--serif); letter-spacing: -.045em; margin: 0; }
  h1 > span { color: var(--accent); }
  .intro-note { font-size: .85rem; color: var(--muted); line-height: 1.7; margin: .9rem 0 2rem; }
  .collection-progress { display: grid; grid-template-columns: 1.6fr 1fr; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding-block: 1.5rem; gap: 2rem; }
  .collection-progress h2 { font-weight: 500; font-size: .8rem; margin: 0; }
  .collection-progress h2 span { font-size: .6rem; margin-left: .5rem; color: var(--muted); }
  .progress-heading { display: flex; align-items: center; justify-content: space-between; }
  .percent { color: var(--accent); font-size: .75rem; }
  .main-progress p { display: flex; flex-wrap: wrap; gap: .5rem; align-items: baseline; font-size: .7rem; color: var(--muted); margin: 1rem 0; }
  .main-progress strong { font: 400 2.1rem var(--serif); color: var(--text); letter-spacing: -.04em; }
  .main-progress strong span { color: var(--muted); font-size: 1.3rem; }
  .remaining { margin-left: auto; }
  progress { appearance: none; width: 100%; height: 4px; display: block; border: 0; border-radius: 3px; overflow: hidden; background: var(--line); }
  progress::-webkit-progress-bar { background: var(--line); } progress::-webkit-progress-value { background: var(--accent); } progress::-moz-progress-bar { background: var(--accent); }
  .bonus-progress { border-left: 1px solid var(--line); padding-left: 2rem; }
  .bonus-progress p { font-size: .75rem; margin: 1rem 0 .4rem; }
  .bonus-progress strong { font: 400 2rem var(--serif); margin-right: .4rem; }
  .bonus-progress > span, .inventory-note { font-size: .65rem; color: var(--muted); line-height: 1.7; }
  .inventory-note { margin: 1rem 0 0; }
  .binder-controls { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; padding: .5rem 0 1rem; }
  .search { display: flex; align-items: center; flex: 1 1 200px; border: 1px solid var(--line); border-radius: 6px; padding-left: .8rem; color: var(--muted); min-width: 0; }
  .search input { width: 100%; min-width: 0; background: transparent; border: 0; padding: .85rem .65rem; color: var(--text); font-size: .8rem; }
  .search input::placeholder { color: var(--muted); }
  .search:focus-within { border-color: var(--accent); }
  .status-filters { display: flex; border: 1px solid var(--line); border-radius: 6px; padding: 3px; }
  .status-filters button { border: 0; background: transparent; color: var(--muted); padding: .65rem .8rem; min-height: 38px; font-size: .7rem; border-radius: 3px; cursor: pointer; }
  .status-filters button[aria-pressed='true'] { color: var(--bg); background: var(--accent); }
  select { min-height: 46px; max-width: 100%; background: var(--bg); color: var(--text); padding: .6rem .8rem; border: 1px solid var(--line); border-radius: 6px; font-size: .7rem; }
  .results-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; color: var(--muted); font-size: .65rem; padding-bottom: .75rem; }
  .results-heading p { margin: .5rem 0; } .results-heading strong { color: var(--text); font-weight: 500; }
  .reset { background: none; color: var(--accent); border: 0; padding: .6rem 0; font-size: .7rem; cursor: pointer; }
  .filter-note { color: var(--muted); font-size: .7rem; margin: 0 0 1rem; }
  .binder-pages { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; align-items: start; }
  .binder-page { padding: 1.2rem; border: 1px solid var(--line); border-radius: 10px; background: linear-gradient(135deg, #2a32254d, #1c211b66); }
  .page-heading { display: flex; justify-content: space-between; gap: .5rem; align-items: baseline; margin-bottom: 1rem; }
  .page-heading h2 { font-size: .7rem; font-weight: 500; margin: 0; }
  .page-heading > span { text-align: right; color: var(--muted); font-size: .6rem; }
  .pocket-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.2rem .85rem; }
  .pocket { min-width: 0; }
  .card-art { position: relative; display: block; width: 100%; padding: 0; border: 0; background: transparent; cursor: pointer; border-radius: 9px; }
  .card-art:not(:disabled):hover { box-shadow: 0 0 0 2px var(--accent); }
  .missing .card-art :global(.image-frame) { filter: grayscale(1); opacity: .65; }
  .dimmed { opacity: .2; }
  .dimmed .card-art { cursor: default; }
  .pocket-info { padding-top: .7rem; }
  .pocket-label { display: flex; justify-content: space-between; flex-wrap: wrap; gap: .35rem; align-items: center; font-size: .52rem; letter-spacing: .04em; }
  .pocket-set { color: var(--muted); }
  .card-status { display: inline-flex; align-items: center; gap: .3rem; color: #d2bb8a; }
  .card-status i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
  .card-status.is-owned { color: var(--accent); }
  .pocket h3 { font-size: .72rem; font-weight: 500; line-height: 1.5; margin: .4rem 0 .25rem; overflow-wrap: anywhere; }
  .slot-number { color: var(--muted); font-size: .55rem; }
  .reserved-label { position: absolute; inset: 18% 9%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: .8rem; padding: .7rem; background: #20251df2; border: 1px dashed #7b8060; border-radius: 4px; }
  .reserved-label > span { color: #d2bb8a; font-size: .55rem; letter-spacing: .1em; text-transform: uppercase; }
  .reserved-label strong { font: 400 clamp(.8rem, 1.6vw, 1.1rem)/1.4 var(--serif); }
  .reserved-label small { font-size: .55rem; color: var(--muted); }
  .empty-pocket { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .65rem; aspect-ratio: 488 / 680; color: #849079; border: 1px dashed var(--line); border-radius: 8px; font-size: .6rem; }
  .empty-pocket span:first-child { font-size: 1.7rem; opacity: .6; }
  .empty-results { padding: 4rem 1rem; text-align: center; border: 1px dashed var(--line); border-radius: 8px; }
  .empty-results h2 { font: 400 2rem var(--serif); } .empty-results p { color: var(--muted); font-size: .8rem; }
  .empty-results button { margin-top: .5rem; border: 1px solid var(--line); border-radius: 5px; padding: .75rem 1rem; color: var(--accent); background: var(--panel); cursor: pointer; }
  .binder-notes { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; padding-top: 2.5rem; margin-top: 2.5rem; border-top: 1px solid var(--line); }
  .binder-notes h2 { font: 400 1.7rem var(--serif); margin: 0 0 1rem; letter-spacing: -.03em; }
  .binder-notes p { font-size: .75rem; color: var(--muted); line-height: 1.8; max-width: 55ch; }
  .missing-downloads { display: flex; flex-direction: column; align-items: start; gap: .8rem; }
  .missing-downloads h3 { font-size: .75rem; font-weight: 500; margin: 0 0 .2rem; }
  .missing-downloads a { font-size: .75rem; color: var(--accent); text-decoration: underline; text-underline-offset: 4px; }
  .missing-downloads > span { font-size: .6rem; color: var(--muted); line-height: 1.8; }
  @media (max-width: 720px) { .binder-pages { grid-template-columns: 1fr; } .binder-page { padding: 1rem; } .binder-controls { gap: .65rem; } .search { flex-basis: 100%; } .set-filter { flex: 1; } select { width: 100%; } .binder-notes { grid-template-columns: 1fr; gap: 1.5rem; } .reserved-label strong { font-size: 1rem; } }
  @media (max-width: 460px) { .collection-progress { gap: 1.2rem; grid-template-columns: 1fr; } .bonus-progress { border-left: 0; padding-left: 0; border-top: 1px solid var(--line); padding-top: 1.2rem; } .bonus-progress p { display: inline-block; margin-right: .5rem; } .bonus-progress h2 { margin-bottom: .25rem; } .eyebrow { margin-top: 1.8rem; } .binder-page { padding: .75rem; } .pocket-grid { gap: 1rem .65rem; } .status-filters { flex: 1 1 100%; } .status-filters button { flex: 1; } .pocket h3 { font-size: .68rem; } .reserved-label { gap: .5rem; } .reserved-label strong { font-size: .8rem; } .page-heading > span { max-width: 65%; } }
</style>
