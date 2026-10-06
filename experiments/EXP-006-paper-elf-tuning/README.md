# EXP-006 — Paper Elf tuning 0.3.3

- Status: `adopted`
- Baseline: released paper `0.3.2`, preserved in `baseline.txt`.
- Candidate / adopted release: paper `0.3.3`, saved in `decklist.txt`.
- Experiment revision: `exp.1`
- Recorded and adopted: 2026-10-06.
- Decision basis: the user confirmed the physical swaps were already completed and explicitly requested recording the release. The original physical swap date is not established here.
- Related Arena iteration: [EXP-005](../EXP-005-arena-elf-tuning/README.md), revision exp.2. Arena's approved test target is separate from this paper release.

## Exact adopted diff

| Remove from paper 0.3.2 | Add to paper 0.3.3 |
|---|---|
| Llanowar Stalker | Sylvan Ranger |
| Elvish Aberration | Wood Elves |
| Vengeful Bloodwitch | Skemfar Shadowsage |
| Adaptive Automaton | Morcant's Loyalist |
| Vampiric Rites | Elvish Visionary |
| Iron-Shield Elf | Woodland Weavemaster |

One copy of each is exchanged. Lathril remains the commander; all 35 lands and the other 58 nonland slots remain unchanged. Sol Ring, Commander's Sphere and Risky Research stay in paper. Enormous Energy Blade is not added.

## Hypothesis

Favor Elf-based land access, immediate draw, mana development and tribal payoffs to reduce awkward early hands while retaining Lathril's Elfball plan. This is one bundled six-swap tuning iteration, not a controlled causal test of each card.

## Tradeoffs

- Sylvan Ranger supplies a basic land to hand rather than ramping, and needs green mana first.
- Wood Elves replaces Elvish Aberration's large mana-producing body and Forestcycling with earlier land-based ramp.
- Elvish Visionary replaces Vampiric Rites' repeatable sacrifice/draw outlet with one immediate draw and an Elf body.
- Skemfar Shadowsage costs more than Vengeful Bloodwitch and rewards an Elf board instead of creature deaths.
- Morcant's Loyalist requires both colors; Adaptive Automaton's flexible creature-type choice is lost.
- Woodland Weavemaster has summoning sickness and restricts how its mana can be spent.

## Post-release observation protocol and success criteria

During ordinary paper Commander games, optionally record missed early land drops, unavailable colors, cards stranded in hand, and whether an added card helped development. Note occasions when a removed effect would have been preferable.

The intended improvement is smoother development without repeatedly missing the removed ramp, draw or payoff effects. No fixed sample, measured improvement, win rate, simulation result, or fulfilled play-test criterion is claimed. `games.csv` contains a header only until real observations are supplied; historical results for other lists are unchanged.

## Decision

Adopted by explicit user confirmation and recording request on 2026-10-06, not by statistical evidence. Pending release decision: none. Later tuning requires another versioned experiment.

The canonical paper list, Forge export, VERSION, release notes and new paper import snapshot are synchronized to this list. Historical 0.3.1/0.3.2 exports remain unchanged.

## Paper versus Arena 0.3.3

| Released paper | Saved Arena test target |
|---|---|
| Sol Ring | Mind Stone |
| Commander's Sphere | The Soul Stone |
| Risky Research | Cost of Brilliance |

Cost of Brilliance is the recorded ownership/wildcard proxy, not a legality substitute. Both lists now contain Wood Elves; the Elvish Aberration / Llanowar Tribe difference is gone. The other 97 card copies match. The Arena target is not a newly verified client export or live collection check.

## Files updated for this recording

```text
VERSION
README.md
CHANGELOG.md
decks/lathril/decklist.txt
decks/lathril/forge.dck
decks/lathril/README.md
decks/lathril/arena-crafting-plan.md
decks/lathril/exports/README.md
decks/lathril/exports/paper-0.3.3.txt
experiments/README.md
experiments/EXP-005-arena-elf-tuning/README.md
experiments/EXP-006-paper-elf-tuning/README.md
experiments/EXP-006-paper-elf-tuning/baseline.txt
experiments/EXP-006-paper-elf-tuning/decklist.txt
experiments/EXP-006-paper-elf-tuning/games.csv
web/data/decks.json
web/scripts/validate.ts
web/scripts/check-static.ts
web/tests/decks.test.ts
web/README.md
web/QA.md
```

Validation: the root validator passes for the canonical list and both experiment lists; all release exports agree; the diff is exactly six one-for-one swaps. The viewer passes check, 21 tests and build (nine snapshots, eleven pages, nine text exports; 24.5 KiB gzip JavaScript). Desktop/mobile preview, historical-version navigation, search and the new export link were checked in a real browser. No push, tag, deployment, or simulation is part of this recording.
