# AGENTS.md

## Purpose

This repository tracks released paper Magic: The Gathering decklists, candidate changes, and play-test evidence. Treat the files in the repository as the source of truth; do not reconstruct a deck from chat memory when a tracked list exists.

These instructions apply to the entire repository.

## Repository map

- `VERSION` — current released version only.
- `decks/<deck>/decklist.txt` — canonical released paper list.
- `decks/<deck>/forge.dck` — simulator export of the same released list.
- `decks/<deck>/README.md` — deck identity and release summary.
- `decks/<deck>/exports/` — versioned import-ready text snapshots and their instructions; distinguish exact paper lists from Arena targets and document all substitutions.
- `experiments/EXP-NNN-short-name/` — isolated candidate list, hypothesis, evidence, and decision.
- `logs/games.csv` — cross-experiment game history.
- `CHANGELOG.md` — released changes, not unaccepted ideas.
- `scripts/validate-deck.sh` — structural Commander deck validator.

## Current deck direction

Lathril is primarily an Elfball deck: develop Elves, make mana and tokens, attack with Lathril, and threaten her ten-Elf activation. Graveyard recursion and Massacre Wurm are secondary tools. Do not turn the deck into a sacrifice/aristocrats deck or remove Elf density, token production, mana engines, protection, or reliable interaction without a clearly stated experiment or a new user decision.

The user's current direction overrides this paragraph whenever they explicitly change it.

## Invariants

1. Never edit a released deck merely to demonstrate a candidate change. Put the candidate in an experiment directory.
2. Keep `VERSION` on the latest accepted release. Prerelease experiment numbers belong in experiment documentation, not `VERSION`.
3. A Commander list must contain exactly one commander and 99 main-deck cards, with no duplicate nonbasic cards.
4. Preserve exact card spelling and quantities. Confirm uncertain names, Oracle text, color identity, and format legality before relying on them.
5. Keep `decklist.txt` and `forge.dck` synchronized when releasing a change.
6. Do not invent game, draw, matchup, or simulation results. Leave unknown fields blank and label anecdotal observations as such.
7. Inspect `git status` before editing and preserve unrelated user changes.
8. Keep import snapshots tied to the release named in their filenames. For a new release, add new version-named snapshots and refresh README links; do not silently replace old snapshots with a different release. Validate paper exports against the canonical list and Arena target exports against only the documented substitutions. Never describe a target export as the user's verified current or fully owned Arena deck.

## Versioning

Use deck versions in `X.Y.Z` form. While the repository is below `1.0.0`:

- `0` — the deck project is still evolving toward its first stable release.
- `Y` — the established deck generation; V3 is the `0.3.x` line.
- `Z` — an accepted tuning release within that generation.

An experiment names its intended release, such as `0.3.1`, while remaining explicitly marked `planned` or `testing`. Track materially revised proposals with an experiment revision such as `exp.2`; do not update `VERSION` until the candidate is accepted.

Release tags use `lathril-vX.Y.Z`.

## Experiment workflow

Before proposing a card swap, read the canonical deck, the deck README, and relevant active or completed experiments.

For a new experiment:

1. Use the next unused stable ID: `EXP-NNN-short-name`.
2. Copy the complete canonical list to the experiment directory.
3. Change only the cards named in the proposed diff.
4. Add a `README.md` containing status, baseline, candidate version, exact diff, hypothesis, tradeoffs, protocol, success criteria, and pending decision.
5. Add `games.csv` with fields that measure the hypothesis. Do not prefill a controlled result from a different list or an incompletely remembered game.
6. Validate the candidate and show that its diff from the baseline is exactly the intended change.
7. Keep unrelated tuning in separate experiments so the result remains attributable.

Use the statuses `planned`, `testing`, `adopted`, `revised`, or `rejected`.

## Releasing an accepted experiment

Only release a change after the user accepts it or the experiment's agreed success criteria and decision process clearly authorize adoption. Then update together:

1. the canonical `decklist.txt`;
2. the matching `forge.dck`;
3. `VERSION`;
4. the deck and root README release references;
5. `CHANGELOG.md`;
6. the experiment status and decision.

Run validation before calling the release complete. Commit the release as a coherent change. Create a release tag only when tagging is authorized, and never push to a remote unless the user explicitly asks.

## Required checks

Run these from the repository root as applicable:

```sh
./scripts/validate-deck.sh decks/lathril/decklist.txt
./scripts/validate-deck.sh experiments/EXP-NNN-short-name/decklist.txt
diff -u decks/lathril/decklist.txt experiments/EXP-NNN-short-name/decklist.txt
git diff --check
git status --short
```

`diff` normally exits with status 1 when the candidate intentionally differs; inspect the output rather than treating that expected difference as a failed deck validation.

## Git commit policy

- Commit every major, coherent change after its relevant validation passes unless the user explicitly asks not to commit.
- Keep separate concerns in separate commits when practical; do not mix deck changes, experiment evidence, and unrelated cleanup.
- Inspect `git status` and the staged diff before committing. Stage only files belonging to the intended change.
- Use concise messages that describe the outcome, such as `experiment: expand Vile Entomber test protocol` or `release: publish Lathril v0.3.1`.
- Preserve unrelated user changes and never amend, rebase, force-push, or rewrite existing history unless explicitly requested.
- A commit does not authorize a release tag or remote push. Those remain separate actions.

## Editing and reporting

- Prefer small, reviewable changes and plain-text formats already used by the repository.
- Explain strategic recommendations in terms of the deck's actual plan and the proposed card's opportunity cost.
- Separate confirmed facts, inferences, and unverified play observations.
- Report the exact files changed, validation performed, current release, and candidate version.
- Follow the commit policy above, but do not silently tag, push, rewrite history, delete experiments, or clean unrelated files.
