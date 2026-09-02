# MTG Deck Lab

This repository is the source of truth for paper deck releases, candidate changes, and play-test evidence.

## Current release

- Deck: Lathril, Blade of the Elves
- Version: `0.3.1`
- Canonical list: `decks/lathril/decklist.txt`
- Forge export: `decks/lathril/forge.dck`

Release `0.3.1` adds Vile Entomber and removes Assert Perfection. The user confirmed completing this paper change on 2026-09-02; [EXP-001](experiments/EXP-001-vile-entomber/README.md) is adopted by user decision, not by a claim that its play-test criteria were met.

Only released lists change the version in `VERSION`. Experiments keep their own candidate list until a decision is made.

## Arena practice mirror

The [Lathril Arena crafting plan](decks/lathril/arena-crafting-plan.md) now targets paper `0.3.1` and tracks the missing cards, Arena-only substitutes, proposed swaps, and last reported wildcard budget. Arena completion remains unverified; a paper release does not confirm that the Arena swaps have been made.

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
