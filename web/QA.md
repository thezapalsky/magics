# Viewer verification

Last checked: **6 October 2026**, on macOS arm64, isolated Node 24.21.0,
pnpm 10.17.1, and a real Chromium browser driven by `agent-browser`.
This records local evidence, not a public deployment or an Arena-client verification.

## Automated checks

| Check | Result |
| --- | --- |
| `pnpm check` | Astro and Svelte: zero errors/warnings |
| `pnpm test` | 12 tests passed |
| `pnpm build` | Eight valid 100-card snapshots, ten HTML pages, eight text exports |
| Static HTML | Every commander and grid card exists before hydration |
| Export preservation | Every generated text export exactly matches the parsed tracked source |
| JavaScript budget | All generated JS bundles combined: **under 24 KiB gzip**, below 100 KiB |
| Filtering unit benchmark | **0.07–0.15 ms** averages across local runs for a 100-entry fixture |
| Root paper validator | One commander + 99 main-deck cards |
| Cloudflare dry run | Assets-only packaging succeeds, with no bindings; nothing published |

Tests cover both list formats, BOM/CRLF, repeated basics, printing suffixes and foil,
digital `A-` names/rules, full and front-face double-faced names, malformed lists,
missing metadata, duplicate nonbasics, search, land-last ordering, and empty results.
Validation also checks commander color identity and the unchanged paper release.

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
- Stacks persist after reloading through the local layout preference. Unsupported
  stored values fall back to the server-rendered grid.
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

Clipboard writes were denied by the isolated headless browser. The UI correctly offered
the download fallback. Generated download contents are verified; successful clipboard
writing still needs a normal browser with clipboard permission (loopback or HTTPS).

## Repeat before publishing

1. Run the documented check/test/build commands and the root paper validator.
2. Start the production preview and review the home, all four defaults, and an older version.
3. Check search, type filter, name sort, reset, both faces, keyboard focus/Escape,
   copy and download. Check mana-stack hover/focus, saved layout preference,
   and reader arrow/wheel/native scroll navigation. Compare the downloaded text with its tracked source.
4. Review a narrow screen and reduced motion. Trigger an image error and confirm
   that the named placeholder does not change the frame dimensions.
5. Inspect requests: no runtime card-data API traffic. Confirm the JS gzip budget.
6. Run the assets-only deployment dry run. Public deployment and remote pushes
   require separate explicit authorization; neither is performed by the CI workflow.

The paper release remains **0.3.2**; the simulator **0.3.3** remains a test target.
No release files, game evidence, tags, or experiment decisions are changed by the viewer.
