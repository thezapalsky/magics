# MTG Deck Lab

This repository is the source of truth for paper deck releases, candidate changes, and play-test evidence.

## Current release

- Deck: Lathril, Blade of the Elves
- Version: `3.0.0`
- Canonical list: `decks/lathril/decklist.txt`
- Forge export: `decks/lathril/forge.dck`

Only released lists change the version in `VERSION`. Experiments keep their own candidate list until a decision is made.

## Versioning

Deck releases use `X.Y.Z`:

- `X` — major rebuild: commander, color identity, or primary game plan changes.
- `Y` — tested functional release: a card package or meaningful strategic change is adopted.
- `Z` — correction or micro-tuning that does not change the deck's plan, such as a list correction, printing metadata, or basic-land allocation.

Candidate versions use a prerelease suffix, for example `3.1.0-exp.1`. If the experiment is accepted, it becomes `3.1.0`. If the proposed cut changes, the next candidate becomes `3.1.0-exp.2`.

## Workflow

1. Keep the released deck unchanged.
2. Create `experiments/EXP-NNN-short-name/` with a hypothesis and candidate list.
3. Record games in the experiment log and in `logs/games.csv`.
4. Decide: adopt, revise, or reject.
5. If adopted, update the canonical deck, `VERSION`, Forge export, and `CHANGELOG.md`.
6. Commit the release and create a Git tag such as `lathril-v3.1.0`.

Run `scripts/validate-deck.sh` before releasing a list.

