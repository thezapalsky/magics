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
- Version: `0.3.2`
- Canonical list: `decks/lathril/decklist.txt`
- Forge export: `decks/lathril/forge.dck`
- Import files: [paper for ManaBox](decks/lathril/exports/paper-0.3.2.txt) and [Arena target](decks/lathril/exports/arena-target-0.3.2.txt), with [instructions and the exact target diff](decks/lathril/exports/README.md).

Release `0.3.2` removes three generic artifacts and adds Changeling Wayfinder, Risky Research, and Scarblade's Malice. The user confirmed completing these physical paper swaps on 2026-09-05; [EXP-002](experiments/EXP-002-artifact-trim/README.md) is adopted by user decision, not by a claim that its play-test criteria were met.

Only released lists change the version in `VERSION`. Experiments keep their own candidate list until a decision is made.

## Arena practice mirror

The [Lathril Arena crafting plan](decks/lathril/arena-crafting-plan.md) now targets paper `0.3.2`. The latest Arena export uses Mind Stone for Sol Ring, The Soul Stone for Commander's Sphere, and Llanowar Tribe for Elvish Aberration. Cost of Brilliance temporarily occupies Risky Research's slot while the user is one common wildcard short. [EXP-003](experiments/EXP-003-competitive-brawl-benchmark/README.md) benchmarks that exact Arena snapshot in Forge without changing the released paper list.

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
