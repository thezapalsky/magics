# EXP-005 — Arena Elf tuning 0.3.3

- Status: planned
- Recorded: 2026-10-01
- Baseline: last confirmed Arena simulator 0.3.2, including Cost of Brilliance instead of Risky Research.
- Candidate: Arena simulator 0.3.3, approved by the user for testing.
- Paper release: unchanged at 0.3.2. This is not a paper release.
- Client edits/import and card ownership for the additions are not independently verified.

## Exact changes

| Remove | Add |
|---|---|
| Llanowar Stalker | Sylvan Ranger |
| Llanowar Tribe | Wood Elves |
| Vengeful Bloodwitch | Skemfar Shadowsage |
| Adaptive Automaton | Morcant's Loyalist |
| Vampiric Rites | Elvish Visionary |
| Mind Stone | Woodland Weavemaster |

Keep The Soul Stone, Thoughtweft Charge, Deathbloom Gardener and all 35 lands.
Enormous Energy Blade is excluded. No increase to 37 lands is adopted.

## Hypothesis and tradeoffs

Test whether more Elf-based land access, immediate draw and tribal payoffs make hands smoother.
This is a bundled tuning iteration, not an isolated causal test of each card.
Ranger needs two mana including green; Wood Elves needs three. Neither rescues every bad opening.
Removing Tribe loses three-mana production; removing Mind Stone loses immediate unrestricted ramp and later draw.
Weavemaster has summoning sickness and Elf-only spending restrictions.
Loyalist requires both colours; Shadowsage costs more than Bloodwitch.
Visionary replaces repeatable sacrifice-based draw with an immediate card and Elf body.

## Protocol and success criteria

Use ordinary Arena games; no automated simulation or fixed statistical sample is required.
Optionally record missed early land drops, unavailable colours and cards stranded in hand.
Assess whether development feels smoother without repeatedly missing the removed effects.
No results or improvement are claimed. The earlier mana problems are anecdotal user observations.

## Pending decision

User decides whether to retain/revise the Arena iteration and separately whether to change paper.
The current paper canonical list, Forge export, VERSION and historical benchmarks remain untouched.

## Files

baseline.txt preserves the Arena baseline; decklist.txt is the complete candidate.
Import-ready copy: ../../decks/lathril/exports/arena-test-0.3.3.txt.
