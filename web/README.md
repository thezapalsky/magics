# Magics deck viewer

A static, read-only Astro + Svelte viewer for the decklists in this repository.
No server, database, login, live collection tracking, simulation UI, or runtime card-data API is needed.

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
| Paper Lathril | 0.3.2 | Canonical paper release |
| Arena simulator | 0.3.3 | Approved test target, not a verified client export |
| Elves | 4.1 | Saved user-exported Arena snapshot |
| Sacrifice | 3.0 | Saved user-exported Arena snapshot |

Older named snapshots remain selectable. The Arena families have their own version names;
the website does not renumber them or treat the repository's paper `VERSION` as their version.
Paper 0.3.3 is not published by this feature.

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
The overlay shows the displayed artwork printing and any differing saved printing.
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

Validate packaging without publishing:

```sh
pnpm exec wrangler deploy --dry-run --outdir test-results/deploy
```

**Do not run the following until the user explicitly authorizes public deployment.**
After signing into the intended Cloudflare account, publishing is:

```sh
pnpm deploy
```

The initial URL is `https://magics-viewer.<account-subdomain>.workers.dev`; Wrangler returns the
actual account-specific address after an authorized deployment. No paid domain is required.
Static asset requests/storage currently have [no additional charge](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).
An optional future Git integration must use the repository root checkout, `web/` as build root,
`pnpm install --frozen-lockfile && pnpm build` as build command, and explicit production approval.
The included GitHub workflow only checks/builds; it has no deployment or write permissions.

## Verification

- `pnpm check`: Astro/TypeScript and Svelte diagnostics.
- `pnpm test`: parser, source/export preservation, digital rules, sorting/search, and local-filter budget.
- `pnpm build`: all eight snapshots, static HTML/text routes, and a combined JavaScript gzip ceiling of 100 KiB.
- Browser checklist/evidence: [QA.md](QA.md). Review it after changing interactions, images, or layout.
- Root `scripts/validate-deck.sh` remains the existing paper validator; it is not changed for the website.

Website changes do not authorize deck releases, tags, remote pushes, or deployment.
