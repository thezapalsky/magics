# Deck viewer guidance

The root AGENTS.md applies. This directory is a read-only presentation layer, not a second deck editor.

- Work from `/Users/mikolaj/Developer/magics`, not the abandoned Documents/ChatGPT copy.
- Keep frontend work under `web/`; the root README, ignore rules and CI may reference it.
- Do not modify deck releases, simulation scripts/results, `VERSION`, or experiment decisions for a UI task.
- Manifest statuses are explicit. Arena targets are not verified exports or ownership claims.
- The Spider-Man binder owns its verified snapshot in `collections/spider-man/inventory.json`; preserve that video-verified order and ownership. `collections/spider-man/scene-layout.json` is the separate, explicitly proposed four-pocket rearrangement with both panoramas. Keep all 93 character identities, the fixed 79-card SPM target and optional SPE separate from gallery/scene extras. Display each character once and assign every pocket: join the smaller scene across facing pages 2-3, fill its remaining pockets with gallery cards, and split the larger scene sequentially across pages 4-6 until the 3x3 binder upgrade. Use owned regular Miles/Punk in their scene positions; preserve desired scene printings as optional upgrade targets. Only genuinely missing or unconfirmed cards need placeholders. Ordered cards and artwork proxies are not owned printings. Scene Miles/Gwen use their reverse faces. Do not mark the proposed physical arrangement verified without new evidence.
- Use pinned Node/pnpm and the lockfile. Run package commands with `web/` as the working directory.
- Keep builds network-independent. Refresh the checked-in card cache only explicitly.
- Preserve digital `A-` identities and all faces. New overrides require primary-source provenance.
- Keep controls restrained and artwork-led. No results dashboard, comparisons, editing, or draw testing in v1.
- Use factual copy. Keep the grid, mana stacks, simple text list and artwork-only reader; do not repeat printed rules visually.
- Keep each deck as a separate link in the two-column desktop shelf, one column on mobile. The home All / Paper / Arena buttons filter the existing links; All is the default. Do not combine covers or add a hover chooser unless requested again.
- Default to Mana stacks; selector order is Mana stacks, Card browser, Grid, List. Lands/no-cost cards trail the mana columns.
- Keep image warming bounded, idle after initial load, and sensitive to data-saver/slow connections and hidden tabs. No whole-deck upfront preload.
- Test stack hover/focus, saved layout choice, reader arrows/wheel/native scroll, both faces and focus confinement.
- Inspect real desktop and narrow-screen previews; verify focus, Escape, exports, missing images and reduced motion.
- Before committing run `pnpm check`, `pnpm test`, `pnpm build`, root deck validation and `git diff --check`.
- Commit validated coherent milestones. Do not push, tag, or run `pnpm deploy` without explicit user authorization.
