# Viewer verification

Last checked: **6 October 2026**, on macOS arm64, isolated Node 24.21.0,
pnpm 10.17.1, and a real Chromium browser driven by `agent-browser`.
This records local evidence, not a public deployment or an Arena-client verification.

## Automated checks

| Check | Result |
| --- | --- |
| `pnpm check` | Astro and Svelte: zero errors/warnings |
| `pnpm test` | 23 tests passed |
| `pnpm build` | Nine valid 100-card snapshots, eleven HTML pages, nine text exports |
| Static HTML | Every commander and mana-stack card exists before hydration; selector order is stacks/browser/grid |
| Export preservation | Every generated text export exactly matches the parsed tracked source |
| JavaScript budget | All generated JS bundles combined: **under 25 KiB gzip**, below 100 KiB |
| Filtering unit benchmark | **0.07–0.15 ms** averages across local runs for a 100-entry fixture |
| Root paper validator | One commander + 99 main-deck cards |
| Cloudflare dry run | Assets-only packaging succeeds, with no bindings; nothing published |

Tests cover both list formats, BOM/CRLF, repeated basics, printing suffixes and foil,
digital `A-` names/rules, full and front-face double-faced names, malformed lists,
missing metadata, duplicate nonbasics, search, land-last ordering, and empty results.
Validation also checks commander color identity and agreement between the paper default,
canonical list, and VERSION. Release tests verify the exact six adopted swaps, synchronized
Forge/import/experiment exports, preserved baseline, and the three paper-to-Arena proxies.

## Browser checks

- Reviewed the artwork-led home and deck layouts at **1440 × 1000**, **390 × 844**,
  and **320 × 740**. No horizontal overflow after fixing the narrow-screen commander glow.
- Home links expose all four default decks. Version selection navigates to a distinct saved URL.
- Search updates the grid, including a readable empty state and working reset.
- Card-type filtering and name sorting work; default mana ordering leaves lands last.
- Commander/card inspection works; Sephiroth's two faces have separate text/images.
- `A-Skemfar Avenger` uses the sourced Arena rule without “nontoken,” and links
  to Wizards' rebalance rather than presenting paper rules as the digital variant.
- Native dialog focus starts on Close. Tab/Shift+Tab stay in the modal; Escape restores
  the opening card's focus and restores page scrolling.
- Reduced-motion emulation yields zero-duration tile transitions.
- An injected image `error` event removes the failed image, keeps a named placeholder,
  and leaves its **132 × 183.92 px** frame unchanged. This is a controlled UI error-state
  check, not an end-to-end outage test of the external artwork provider.
- Search-to-next-frame measurements for four queries: **8.3–20.3 ms**. Commander
  modal opening: **15.4 ms**. These are local samples, not a device-independent guarantee.
- Resource entries show **zero `api.scryfall.com` requests** during browsing/interactions.
  Recorded artwork URLs remain external image requests; details are bundled locally.
- No application page errors reported in the browser session.

## Layout and reader update

- Removed the promotional home/deck copy; the temporary home heading is “My decks.”
- Checked all 73 main-deck tiles in the paper mana columns: quantities total 99,
  lands are last, and a title-strip hover or keyboard focus reveals the complete card
  above the stack (`z-index: 100`). Search for “wurm” narrows the columns correctly.
- Stacks persist after reloading through the local layout preference. Missing/unsupported
  stored values now fall back to the server-rendered stacks.
- The full-screen reader shows the card image and source link, not a visible duplicate
  name/type/rules block. Arrow keys and wheel gestures advance/backtrack; Home/End
  reach the boundaries; native feed scrolling updates the active card.
- Sephiroth's Flip control changes the image and accessible title to One-Winged Angel.
- An explicit Tab/Shift+Tab loop keeps focus in the reader. Escape returns to the
  original card/layout control. Browser testing identified and fixed the focus-wrap issue.
- Desktop and 390/320 px mobile layouts fit without document-level horizontal overflow.
  Mana columns deliberately scroll horizontally within their own container.
- Layout-change samples: **12.3 and 19.6 ms** to the next frame. Reader open: **15.8 ms**.
  The art-only reader still made **zero card-data API requests**, with three image
  elements for the active card and adjacent cards.
- Injecting an image error in the reader produces a named fallback with its
  **488 × 680 px** frame unchanged.
- Mobile-sized layout and native scroll behaviour were checked in Chromium;
  a physical touchscreen swipe test is still recommended before publishing.

Files changed for this layout update (all under `web/`):

- UI: `src/components/CardBrowser.svelte`, `src/components/DeckViewer.svelte`,
  `src/pages/index.astro`, `src/layouts/Layout.astro`.
- Copy/grouping: `data/decks.json`, `src/lib/card-utils.ts`.
- Verification: `scripts/check-static.ts`, `tests/decks.test.ts`.
- Guidance/evidence: `README.md`, `AGENTS.md`, `QA.md`.

## Default layout and image warm-up update

- Mana stacks is the default before hydration; controls are ordered Mana stacks,
  Card browser, Grid. Verified that an old `magics-card-view=grid` preference no longer
  overrides the new default; a new Grid choice persists under `magics-card-view-v2`.
- The paper deck's last column contains **35 lands, 9 unique entries**, including all
  utility lands and both grouped basics. The “Lands →” button scrolls fully right and
  focuses that heading, at both 1440 px and 390 px. No document-level overflow at 320 px.
- Nonland cards without a printed mana cost sort before the final lands column.
  There are none in the four current defaults; fixture tests distinguish these from
  `{0}` and `{X}` spells and check preservation of all 99 main-deck copies in every snapshot.
- Before opening the reader, four large-image resource entries existed for its opening
  window. The commander was complete with **672 px natural width** immediately after
  opening; the next card (Bushwhack) was also complete when reached. The window advanced
  to five large-image entries. These are readiness checks in the existing local browser
  session, not a cold-network speed/bandwidth benchmark; cache retention varies by browser.
- Unit tests cover deduplication, two-load concurrency, intent priority, failures,
  cleanup, hidden-page pause/resume, slow/data-saver policy and both active faces.
  The application retains at most eight warmed decoded images, not the whole deck.
- Rechecked full-screen mobile art, reader End boundary, Sephiroth's back face,
  Tab confinement and image-error fallback. The error check removes the image but
  preserves the **272 × 379.02 px** mobile frame at 320 px viewport width. Card-data API requests remain zero.

This follow-up changes `src/lib/image-preload.ts`, `tests/image-preload.test.ts`,
`src/lib/card-utils.ts`, `src/components/DeckViewer.svelte`,
`src/components/CardBrowser.svelte`, `scripts/check-static.ts`,
`tests/decks.test.ts`, `README.md`, `AGENTS.md`, and this evidence file only.

Clipboard writes were denied by the isolated headless browser. The UI correctly offered
the download fallback. Generated download contents are verified; successful clipboard
writing still needs a normal browser with clipboard permission (loopback or HTTPS).

## Paper 0.3.3 release recording

- Recorded only after explicit user confirmation that the six paper swaps were already
  complete. This is a paper adoption in EXP-006, not a release inferred from viewer work.
- The home paper tile now links to `/decks/paper-lathril/0.3.3/`, with Released status,
  100 cards and 35 lands. All six additions are present; all six removals are absent.
- Version selection reaches the preserved 0.3.2 and 0.3.1 URLs; 0.3.2 still displays its
  original removed cards. Arena 0.3.3 remains a Test target with its source unchanged.
- Reviewed the new default at 1440 × 1000 and 390 × 844. No document-level overflow;
  mobile search for Woodland Weavemaster finds its single card. No card-data API requests.
- The new paper text export matches the canonical deck, Forge export and adopted candidate.
  Both paper and Arena contain Wood Elves. Their only three differences remain
  Sol Ring / Mind Stone, Commander's Sphere / The Soul Stone, and Risky Research /
  Cost of Brilliance. No game or simulation evidence has been changed.

Files changed for this adoption: VERSION, root/deck release notes and changelog,
canonical paper/Forge lists, a new `paper-0.3.3.txt` snapshot, EXP-006 baseline/candidate/
decision and an empty observation log, the experiment index and EXP-005 alignment notes,
import/crafting guidance, and the viewer manifest, validation tests/scripts and documentation.
Historical exports, Arena lists and the metadata cache are unchanged.

## Cloudflare GitHub CI/CD preparation

- The user selected Cloudflare's native GitHub connection (Workers Builds), not a
  manual-first deployment or a GitHub Actions deployment token.
- `pnpm deploy:check` passed the shared CI command: zero Astro/Svelte diagnostics,
  21 passing tests, nine validated snapshots, eleven pages, exact exports, the root
  paper validator and **24.5 KiB gzip** combined JavaScript. Wrangler's dry run read
  42 asset files with no bindings and did not upload anything.
- The local Cloudflare runtime at `127.0.0.1:8787` passed **33 HTTP checks** covering
  all nine deck routes and exports, 307 trailing-slash redirects, custom true 404s,
  security/CSP headers and immutable caching for a hashed JavaScript bundle.
  `/AGENTS.md`, `/.env` and `/_headers` were not served as files.
- A real Chromium session reviewed search and the artwork-only reader under those
  headers at **1440 × 1000** and **390 × 844**. Version selection reached 0.3.2;
  paper 0.3.3 search/inspection found Woodland Weavemaster. The mobile document
  width remained 390 px, artwork loaded, errors/console were empty, and card-data
  API requests remained zero. Evidence images are in ignored `test-results/`.
- `wrangler preview --help` confirms the installed CLI supports the documented
  native preview command; no public preview command was executed.
- GitHub `main` still lacked the viewer when checked. Remote publishing/merging,
  Cloudflare GitHub consent, connection activation and the first remote build remain
  pending. The existing local Pages login was not changed; native CI uses Cloudflare's
  own build authorization. No account IDs or tokens were written to the repository.

Files for this preparation: `.github/workflows/viewer.yml`, `web/package.json`,
`web/scripts/check-cloudflare.ts`, `web/README.md`, `web/DEPLOY.md`, and this QA record.
Deck sources, release versions, the card cache and the dependency lockfile are unchanged.

## Paper home-cover printing

- The Paper Lathril home tile uses the exact user-selected **FDN 349** artwork,
  verified against Scryfall's printing endpoint and added to the checked-in cache.
  No other cache entries were refreshed or replaced.
- Other family tiles retain their original commander artwork. Deck-page commanders,
  exports, canonical lists, VERSION and experiments are unchanged.
- Validation fails for missing metadata, a different printing/commander identity,
  or missing cover artwork. Refresh includes the explicit cover printing and cannot
  use name-only fallback for it. Static checks verify each tile's actual image URL.
- All **23 tests** and the complete dry-run preflight pass; combined JavaScript stays
  at 24.5 KiB gzip. The local Cloudflare smoke check still passes 33 requests.
- Real Chromium screenshots reviewed at 1440 × 1000 and 390 × 844 show the new
  artwork loaded and labels readable. Mobile document width remains 390 px; no
  console/page errors or runtime card-data API requests. Screenshots are ignored.

Files for this cover change: `web/data/decks.json`, `web/data/cards.json`,
`web/src/lib/types.ts`, `web/src/lib/decks.ts`, `web/src/pages/index.astro`,
`web/scripts/refresh-cards.ts`, `web/scripts/validate.ts`, `web/scripts/check-static.ts`,
`web/tests/decks.test.ts`, `web/README.md`, and this QA record.

## Repeat before publishing

1. Run the documented check/test/build commands and the root paper validator.
2. Start the production preview and review the home, all four defaults, and an older version.
3. Check search, type filter, name sort, reset, both faces, keyboard focus/Escape,
   copy and download. Check mana-stack hover/focus, saved layout preference,
   and reader arrow/wheel/native scroll navigation. Compare the downloaded text with its tracked source.
4. Review a narrow screen and reduced motion. Trigger an image error and confirm
   that the named placeholder does not change the frame dimensions.
5. Inspect requests: no runtime card-data API traffic. Confirm the JS gzip budget.
6. Run the assets-only deployment dry run and local Cloudflare smoke check. Public
   activation and remote pushes require explicit authorization. The GitHub validation
   workflow does not publish; the native Cloudflare connection publishes after activation.

The paper release is now **0.3.3**, adopted by explicit user confirmation in EXP-006;
the simulator **0.3.3** remains a test target. The earlier viewer-only updates did not
adopt a paper release. No game evidence, tags, remote pushes or deployments were added.
