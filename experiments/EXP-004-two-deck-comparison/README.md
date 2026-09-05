# EXP-004 — Two-deck Competitive Brawl comparison

- Status: `testing`
- Run date: 2026-09-05
- Candidate paper release: none
- Inputs: two user-supplied 100-card Brawl lists
- Opponent field: exact ten opponent snapshots copied from [EXP-003](../EXP-003-competitive-brawl-benchmark/README.md)

## Question

How do the supplied Sephiroth sacrifice deck and supplied alternate Lathril Elf deck compare against the same broad Competitive Brawl field used in EXP-003?

This is a controlled simulator comparison. It is not a claim that Forge reproduces Arena ladder play or human decision quality.

## Input decks

- **Sephiroth Sacrifice Supplied** — mono-black sacrifice/aristocrats list led by Sephiroth, Fabled SOLDIER.
- **Lathril Alternate Supplied** — Golgari Elf-focused list led by Lathril, Blade of the Elves, with Sephiroth as a supporting creature.

Both inputs were converted directly from the user’s text exports, with no card substitutions or tuning changes. Each validated as exactly one commander plus 99 main-deck cards.

## Opponent field

The ten opponent snapshots are unchanged from EXP-003:

Nashi, Yuriko, Grist, Emry, Katara, Merry, Phelia, Raffine, Rofellos, and Spider-Man 2099.

Their sources, strategic labels, and online references are documented in [EXP-003](../EXP-003-competitive-brawl-benchmark/README.md). Their exact Forge files are copied into this experiment’s `decks/opponents/` directory.

## Protocol

- Forge version: `2.0.14-SNAPSHOT-08.08`
- Java: `17.0.17`
- Format: Forge `Brawl`, one-on-one
- Games: 100 against each opponent per input, 2,000 total
- Seating control: two 50-game batches per matchup with deck order reversed
- Maximum game time: 120 seconds; full-match timeouts are manually recorded as draws
- Fixed seeds: 33001–33040, one per batch
- AI profile: Forge default for both decks
- Smoke tests: one uncounted match per supplied deck before the benchmark

## Results

The run is complete. `results.csv` contains one row per input/opponent matchup plus an aggregate row for each input. The raw Forge output for every counted batch is retained under `raw/`.

| Input | W-L-D | Win rate (all games) | Decisive win rate | Average turn | Full timeouts | AI card-play failures |
|---|---:|---:|---:|---:|---:|---:|
| Sephiroth Sacrifice Supplied | 478-522-0 | 47.8% | 47.8% | 9.12 | 0 | 6 opponent-side |
| Lathril Alternate Supplied | 688-309-3 | 68.8% | 69.0% | 8.65 | 3 | 1 input-side, 5 opponent-side |

| Opponent | Sephiroth W-L-D | Lathril alternate W-L-D |
|---|---:|---:|
| Nashi | 69-31-0 | 84-16-0 |
| Yuriko | 58-42-0 | 75-25-0 |
| Grist | 26-74-0 | 61-37-2 |
| Emry | 69-31-0 | 92-8-0 |
| Katara | 81-19-0 | 87-13-0 |
| Merry | 30-70-0 | 56-44-0 |
| Phelia | 22-78-0 | 54-45-1 |
| Raffine | 50-50-0 | 70-30-0 |
| Rofellos | 15-85-0 | 39-61-0 |
| Spider-Man 2099 | 58-42-0 | 70-30-0 |

The supplied alternate Lathril list outperformed the supplied Sephiroth list by 210 wins over this field (68.8% versus 47.8%). The gap is descriptive of these Forge snapshots, not a claim about human Arena ladder strength. The largest shared difficulty was Rofellos; Sephiroth also struggled with Phelia and Grist, while the alternate Lathril list was positive against every opponent except Rofellos.

## Limitations

- Forge’s AI is strongest with aggro and midrange and weaker with control and combo. The opponent field includes both, so matchup-specific numbers have unequal reliability.
- Forge’s `Brawl` mode may not reproduce every Competitive Brawl rule detail, including Arena’s no-free-mulligan rule.
- EXP-004 recorded 11 AI card-play warnings (1 on the supplied alternate Lathril side and 10 on opponent sides) and three full-match timeout draws, all in alternate Lathril matchups. These warnings are retained in the CSV and raw logs rather than silently discarded.
- These are repeated AI games from fixed public snapshots, not independent human ladder matches. Use the side-by-side comparison to identify broad patterns and awkward matchups, not to claim an Arena rank.
