# MTG Deck Lab

This repository is the source of truth for paper deck releases, candidate changes, and play-test evidence.

## Interactive deck viewer

The [static deck viewer](web/README.md) lives alongside the deck records. It displays the released
paper Lathril list, the Arena simulator target, and saved Elves/Sacrifice snapshots, with artwork,
search, card details, historical versions, and text exports. It does not edit decks or run simulations.
See its README for local preview, validation, and the prepared Cloudflare static-hosting configuration.
Public deployment and remote pushes require explicit authorization.

## Current release

- Deck: Lathril, Blade of the Elves
- Version: `0.3.3`
- Canonical list: `decks/lathril/decklist.txt`
- Forge export: `decks/lathril/forge.dck`
- Import files: [paper for ManaBox](decks/lathril/exports/paper-0.3.3.txt) and [Arena test target](decks/lathril/exports/arena-test-0.3.3.txt), with [instructions and the exact target diff](decks/lathril/exports/README.md).

Release `0.3.3` records the user's completed six-swap Elf tuning iteration: Sylvan Ranger, Wood Elves, Skemfar Shadowsage, Morcant's Loyalist, Elvish Visionary and Woodland Weavemaster replace Llanowar Stalker, Elvish Aberration, Vengeful Bloodwitch, Adaptive Automaton, Vampiric Rites and Iron-Shield Elf. [EXP-006](experiments/EXP-006-paper-elf-tuning/README.md) was adopted by user confirmation on 2026-10-06, not by measured play-test criteria. All 35 lands remain unchanged.

Only released lists change the version in `VERSION`. Experiments keep their own candidate list until a decision is made.

## Arena practice mirror

The [Lathril Arena crafting plan](decks/lathril/arena-crafting-plan.md) now describes paper `0.3.3` and the saved [Arena 0.3.3 test target](decks/lathril/exports/arena-test-0.3.3.txt). Its only differences are Mind Stone for Sol Ring, The Soul Stone for Commander's Sphere, and Cost of Brilliance as the recorded ownership/wildcard proxy for Risky Research. Both contain Wood Elves; the old Elvish Aberration / Llanowar Tribe difference is gone. The target is not a newly verified client export. [EXP-003](experiments/EXP-003-competitive-brawl-benchmark/README.md) preserves historical Forge results for the older Arena snapshot; those results are not relabelled as 0.3.3 evidence.

Other current Arena snapshots are tracked under [decks/arena](decks/arena): [Sacrifice 3.0](decks/arena/sacrifice-3.0.txt) and [Elves 4.0](decks/arena/elves-4.0.txt). The earlier supplied versions remain preserved in [EXP-004](experiments/EXP-004-two-deck-comparison/README.md) for benchmark reproducibility.

## Versioning

Deck releases use `X.Y.Z`. While the project is still below `1.0.0`, the current line is:

- `0` — the deck project is still evolving toward its first stable release.
- `3` — the third established deck generation, historically called V3.
- `Z` — an accepted tuning change to V3; the first such change is `0.3.1`.

An experiment names its intended release, for example `0.3.2`, while its status remains `planned` or `testing`. If the proposal changes materially before release, track that as experiment revision `exp.2` without pretending the target release has been accepted.

## Workflow

1. Keep the released deck unchanged.
2. Create `experiments/EXP-NNN-short-name/` with a hypothesis and candidate list.
3. Record games in the experiment log and in `logs/games.csv`.
4. Decide: adopt, revise, or reject.
5. If adopted, update the canonical deck, `VERSION`, Forge export, and `CHANGELOG.md`.
6. Commit the release. Create a Git tag such as `lathril-v0.3.1` only when authorized; pushing also requires explicit authorization.

Run `scripts/validate-deck.sh` before releasing a list.
