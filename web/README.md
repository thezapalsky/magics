# Magics deck viewer

A static, read-only Astro + Svelte viewer for the decklists in this repository.
No server, database, login, live collection tracking, simulation UI, or runtime card-data API is needed.

## Home shelf

Paper Lathril and its Arena practice target share one shelf slot, with two half-width
links. Hovering either cover or focusing its link reveals the three documented proxy
swaps; the “97 shared cards / 3 swaps” disclosure also opens by tap or Enter/Space.
Escape, leaving the group or clicking outside closes it. A native details fallback
works without JavaScript. The four deck destinations, statuses and cover printings
remain distinct; Arena is still a test target, not a verified client export.

The shared count is generated from both default source lists, including quantities
and commander, ignoring printings but retaining digital variants. Proxy mappings are
checked against that exact diff at build time. If a default changes, review the mapping
in `src/lib/deck-relation.ts`; a stale relation fails rather than publishing false copy.

## Card layouts

- **Mana stacks** (default): overlapping columns by mana value, with lands last. X contributes zero
  to mana value, not zero to the entire spell cost. Hover or keyboard focus raises a full
  card; tap/click opens the reader. Nonland cards with no mana cost get a separate trailing
  column, before lands; spells costing `{0}` or only `{X}` stay in the zero-mana column.
  Every unique utility land and the grouped basics are included. Overflowing columns
  show “Scroll sideways to see more cards” on desktop or “Swipe to see more cards” on
  mobile, with previous/next buttons advancing one column. A partial next column cues
  scrolling; arrows disable at the edges and the navigation hides when all columns fit.
  Native scrolling/swiping remains available. Keyboard users can Tab to the arrows and
  activate them with Enter/Space; reduced motion uses immediate rather than smooth movement.
- **Card browser**: a full-screen, artwork-only reader, starting with the commander.
  Scroll the wheel, swipe vertically, use the next/previous buttons, or press arrow keys.
  Home/End go to the first/last card; Escape closes and restores focus. Double-faced
  cards have a Flip button; the bottom source link opens the displayed printing.
- **Grid**: the original full-card gallery, third in the layout selector.

The chosen layout is saved on the visitor's device, not in the repo or a server.
The preference key is now `magics-card-view-v2`: old choices start on stacks once,
then any new explicit choice persists. Missing/unsupported values use stacks.
The reader follows the current search/filter/order and shows grouped basics once.
Rules remain available to screen readers, without duplicating printed text visually.

### Image warm-up

After the initial page load, idle time warms the commander and the first few large images.
Hover/focus prioritizes the intended card. Browsing warms both active faces, one previous
card and three ahead. Requests are deduplicated with at most two speculative loads at a
time; explicit intent goes ahead of background work. Only eight decoded bitmaps are retained;
the browser manages its usual HTTP image cache. There is no full-deck upfront download,
service worker, API call, or permanent storage.

Optional warming is disabled when the browser reports data-saver or a slow connection
(3G or lower), and no new warm-up starts in a hidden tab. Normal visible artwork still loads.
Network hints/cache retention vary by browser, so a cold connection or rapid jump to an
unvisited card can still wait for artwork. Image failures remain readable placeholders.

## Local development

Run commands from this directory (`web/`). Use Node **24.21.0**, pinned in `.nvmrc`, and pnpm **10.17.1**.
Do not change the global Homebrew Node installation to work around its current missing-library failure.
If using nvm, `nvm install` followed by `nvm use` selects the pinned runtime for the shell.
Enable/use Corepack for the package-manager version recorded in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Development opens at `http://127.0.0.1:4321`. For the production output:

```sh
pnpm check
pnpm test
pnpm build
pnpm preview --port 4321
```

Astro 7 manages preview as a background process. Use `pnpm exec astro preview status`,
`pnpm exec astro preview logs`, and `pnpm exec astro preview stop` to inspect or stop it.
All servers bind to loopback; starting a preview does not publish the site.

## Sources of truth

`data/decks.json` explicitly selects the public deck families, versions, statuses, and source files:

| Family | Default | Meaning |
| --- | --- | --- |
| Paper Lathril | 0.3.3 | Canonical paper release |
| Arena simulator | 0.3.3 | Approved test target, not a verified client export |
| Elves | 4.1 | Saved user-exported Arena snapshot |
| Sacrifice | 3.0 | Saved user-exported Arena snapshot |

Older named snapshots remain selectable. The Arena families have their own version names;
the website does not renumber them or treat the repository's paper `VERSION` as their version.
Paper 0.3.3 was recorded on 6 October 2026 after the user's explicit adoption confirmation;
see [EXP-006](../experiments/EXP-006-paper-elf-tuning/README.md). The viewer mirrors that release
and preserves older versions; website development alone does not authorize deck adoption.

The paper family's `coverPrinting` selects [Lathril FDN 349](https://scryfall.com/card/fdn/349/lathril-blade-of-the-elves)
for its **home-page cover only**. Its cached artwork is independent of the tracked commander
printing and export. Other tiles use their saved commander artwork. Exact cover printing,
commander identity and artwork must validate; cover refreshes cannot silently substitute another printing.

`pnpm validate` checks every selected list for one commander, 99 main-deck cards,
singleton nonbasics, commander color identity, complete and matching card identities,
valid manifest routes, and agreement between the default paper snapshot and its canonical list/`VERSION`.
Land counts and default grouping use the **front-face** type. Modal spell/land cards stay in their spell group;
both faces are available in inspection and type/rules search.

Exports retain source quantities, exact names (including `A-`), set/collector information,
and foil markers. Repeated basics are grouped visually, not rewritten in the export.
When multiple basic printings are grouped, the first saved printing represents their artwork.
Paper exports are labelled for ManaBox, not as Arena-compatible lists.

## Card metadata

`data/cards.json` is the checked-in, timestamped card cache. Builds read it locally.
Only this explicit command needs access to Scryfall:

```sh
pnpm refresh:cards
pnpm validate
pnpm test
pnpm build
```

The refresh batches collection lookups, sets identification/Accept headers, and paces requests.
It verifies exact card names and prefers saved printings. Placeholder collector number `0`, missing
printings, or a verified name-only source can use an exact-name printing fallback.
The export preserves the saved printing; the reader's source link points to the displayed
artwork printing, which may differ when an exact-name fallback was necessary.
Unresolved/ambiguous identities stop the refresh; the previous complete cache is preserved.
Commit the refreshed cache with any related manifest change. Do not run refresh on page requests or in CI.

Two saved Arena variants are currently absent from Scryfall's card API:
`A-Skemfar Avenger` and `A-Harald, King of Skemfar`.
Their explicit records in `data/digital-overrides.json` use the paper base for unchanged attributes,
and [Wizards' published Arena rebalance](https://magic.wizards.com/en/news/mtg-arena/alchemy-rebalancing-april-7-2022)
for their distinct rules and official card images. The inspection overlay identifies and links this source.
Unknown `A-` cards still fail resolution; never globally strip the prefix or substitute paper rules.
These are sourced snapshot rules, not a live Arena-client or legality check.

Images load directly from the recorded Scryfall/Wizards URLs and are not downloaded on a card-data refresh.
Images are therefore the remaining external dependency. Reserved aspect ratios prevent image layout shifts;
missing artwork leaves the name visible. Search and rules inspection still work without those services.

## Adding a version

1. Follow the repository release/experiment rules; never alter an old saved list to become a new version.
2. Add the new saved source to the appropriate family's `versions` in `data/decks.json`.
3. Choose its status, note, and default explicitly. Do not call an Arena target a verified export.
4. Refresh metadata only if new source identities were added, then check/test/build.
5. Review desktop/mobile preview, inspect the diff, and commit the coherent change.

URLs are `/decks/<family-id>/<version>/`; copied/downloaded lists are generated static files
at `/exports/<family-id>-<version>.txt`. There is no public data-write API.

## Cloudflare: static assets only

`wrangler.jsonc` deploys `dist/` as **Workers Static Assets** under `magics-viewer`.
There is no Worker script, SSR adapter, paid binding, database, or `run_worker_first` setting.
It includes a true 404 page, cache rules for hashed bundles, and basic security headers.
Its production Custom Domain is declared as **`magics.zapalsky.com`**; DNS/HTTPS are not
changed by local builds or dry runs. Confirm zone ownership/conflicts before first activation.

Validate packaging without publishing:

```sh
pnpm deploy:check
```

This runs check/test/build and a non-uploading Wrangler dry run. To exercise Cloudflare's
actual local static-assets routing and `_headers` handling, run `pnpm preview:cloudflare`,
then `pnpm test:cloudflare` in a second terminal. The preview binds only to `127.0.0.1:8787`.

The chosen publishing workflow is **Cloudflare's native GitHub connection (Workers Builds)**:
`main` builds/deploys production; other branches create previews when enabled. Use build root
`web/`, `pnpm install --frozen-lockfile && pnpm ci:build`, deploy command
`pnpm exec wrangler deploy`, and preview command `pnpm exec wrangler preview`.
Pin the runtime/build variables and follow the activation checklist in [DEPLOY.md](DEPLOY.md).
The full repository must be checked out because builds read deck sources outside `web/`.

The included GitHub workflow validates/builds and checks Cloudflare packaging without publishing.
It has read-only permissions and needs no Cloudflare secret. Cloudflare repeats validation before
its own deployment; the remote Git connection must be explicitly activated in its dashboard.
**It is prepared, not yet connected or published.** Pushing, merging and first activation need approval.
Native CI/CD does not use or require changing the existing local Wrangler login.

Once activated, `magics.zapalsky.com` follows the latest successful `main` deployment.
Native branch previews use separate URLs; the empty `previews` configuration does not
claim the production hostname. Cloudflare manages the custom-domain DNS/certificate.

The initial URL is `https://magics-viewer.<account-subdomain>.workers.dev`; verify the actual
address returned by an authorized build. No paid domain is required. Static asset requests/storage
currently have [no additional charge](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).
`pnpm deploy` remains an approval-gated manual fallback, not the primary publishing method.

## Verification

- `pnpm check`: Astro/TypeScript and Svelte diagnostics.
- `pnpm test`: parser, source/export preservation, digital rules, sorting/search, and local-filter budget.
- `pnpm build`: all selected snapshots, static HTML/text routes, and a combined JavaScript gzip ceiling of 100 KiB.
- Browser checklist/evidence: [QA.md](QA.md). Review it after changing interactions, images, or layout.
- Root `scripts/validate-deck.sh` remains the existing paper validator; it is not changed for the website.

Website changes do not authorize deck releases, tags, remote pushes, or deployment.
