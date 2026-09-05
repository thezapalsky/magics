# EXP-003 — Competitive Brawl benchmark

- Status: `testing` (the 1,000-game benchmark is complete; no paper change is proposed)
- Paper release represented: `0.3.2`
- Arena mirror snapshot: paper `0.3.2` with the three documented legality substitutions and temporary Cost of Brilliance proxy
- Run date: 2026-09-05
- Candidate release: none; this benchmark does not propose a paper-deck change

## Question

How does the current Lathril Arena practice mirror behave in Forge against a broad set of decks representative of the current Competitive Brawl field?

This is a stress test of the current list, not a claim that Forge reproduces the Arena ladder or human play.

## Benchmark selection

Competitive Brawl is the relevant Arena queue because it is ranked, uses a 100-card singleton deck with a commander, starts at 25 life, and matches by Constructed rank and rating rather than deck composition.

The ten-opponent pool deliberately spans both prominent commanders and different strategic demands:

| Opponent | Broad strategy | Snapshot source |
|---|---|---|
| Nashi, Illusion Gadgeteer | Sultai control/value | [BrawlREC](https://archidekt.com/decks/24616753/nashi_illusion_gadgeteer_brawlrec) |
| Yuriko, the Tiger's Shadow | Dimir tempo | [BrawlREC](https://archidekt.com/decks/24498053/yuriko_the_tigers_shadow_brawlrec) |
| Grist, the Hunger Tide | Golgari creature/graveyard | [AetherHub](https://aetherhub.com/Metagame/Historic-Brawl/Deck/grist-the-hunger-tide-1363731/) |
| Emry, Lurker of the Loch | Mono-blue artifact combo | [MTGDecks](https://mtgdecks.net/Historic-Brawl/emry-lurker-of-the-loch-decklist-by-rezreh-3020729) |
| Katara, Waterbending Master | Mono-blue control/tempo | [BrawlREC](https://archidekt.com/decks/24498061/katara_waterbending_master_brawlrec) |
| Merry, Esquire of Rohan | Boros legendary aggro | [BrawlREC](https://archidekt.com/decks/24584869/merry_esquire_of_rohan_brawlrec) |
| Phelia, Exuberant Shepherd | Mono-white blink/taxes | [MTGGoldfish Arena export](https://www.mtggoldfish.com/deck/arena_download/7912152) |
| Raffine, Scheming Seer | Esper tempo | [MTGDecks Platinum list](https://mtgdecks.net/Historic-Brawl/raffine-scheming-seer-decklist-by-novos-3012866) |
| Rofellos, Llanowar Emissary | Mono-green ramp | [BrawlREC](https://archidekt.com/decks/24495903/rofellos_llanowar_emissary_brawlrec) |
| Spider-Man 2099 | Izzet control/value | [MTGDecks Platinum list](https://mtgdecks.net/Historic-Brawl/spider-man-2099-decklist-by-sol4r1s-3002028) |

Current community reporting identified Nashi, Yuriko, and Emry as especially high-volume commanders, while a current metagame guide listed Emry, Katara, Merry, Nashi, Spider-Man 2099, and Yuriko among established top strategies. Grist and Raffine add high-performing Golgari and Esper tests; Phelia and Rofellos add white disruption and green ramp.

Meta and rules sources, accessed 2026-09-05:

- [Wizards: Introducing Competitive Brawl](https://magic.wizards.com/en/news/mtg-arena/introducing-ranked-brawl)
- [Untapped Competitive Brawl overview](https://mtga.untapped.gg/constructed/competitive-brawl)
- [Untapped Emry archetype page](https://mtga.untapped.gg/constructed/competitive-brawl/archetypes/1510/emry-lurker-of-the-loch)
- [MTGAZone guide to the Competitive Brawl metagame](https://mtgazone.com/guide-to-the-competitive-brawl-metagame/)
- [September 1 community meta update](https://www.reddit.com/r/MagicArena/comments/1w4cf3e/weekly_meta_update_for_comp_brawl_timeless/)
- [First Competitive Brawl season report](https://www.reddit.com/r/mtgbrawl/comments/1vc22fn/the_first_official_comp_brawl_season_comes_to_a/)

## Lathril list under test

The tracked Forge snapshot is `decks/lathril-arena-0.3.2.dck`. It matches `decks/lathril/exports/arena-target-0.3.2.txt` except that **Cost of Brilliance** replaces **Risky Research**, matching the user's latest Arena export while the exact common remains unowned.

The paper-to-Arena substitutions are:

```text
Sol Ring             -> Mind Stone
Commander's Sphere   -> The Soul Stone
Elvish Aberration    -> Llanowar Tribe
Risky Research       -> Cost of Brilliance (temporary ownership proxy)
```

## Protocol

- Forge version: `2.0.14-SNAPSHOT-08.08`
- Java: `17.0.17`
- Format: Forge `Brawl`, one-on-one
- Games: 100 against each of ten opponents, 1,000 total
- Seating control: two 50-game batches per opponent with deck order reversed
- Maximum game time: 120 seconds; full-match timeouts are manually recorded as draws
- Fixed seeds: 32001–32020, one per batch
- AI profile: Forge default for both decks
- Smoke tests: one uncounted game per imported list before the benchmark

## Results

| Opponent | Lathril W-L-D | Win rate | Decisive win rate | Avg. turn | Full timeouts | Celestial Reunion AI failures |
|---|---:|---:|---:|---:|---:|---:|
| Nashi | 49-51-0 | 49.0% | 49.0% | 10.80 | 0 | 7 |
| Yuriko | 56-43-1 | 56.0% | 56.6% | 9.69 | 1 | 9 |
| Grist | 31-67-2 | 31.0% | 31.6% | 8.90 | 2 | 20 |
| Emry | 74-26-0 | 74.0% | 74.0% | 8.90 | 0 | 11 |
| Katara | 82-18-0 | 82.0% | 82.0% | 10.67 | 0 | 11 |
| Merry | 31-68-1 | 31.0% | 31.3% | 7.96 | 1 | 7 |
| Phelia | 29-70-1 | 29.0% | 29.3% | 9.06 | 1 | 15 |
| Raffine | 53-47-0 | 53.0% | 53.0% | 9.48 | 0 | 11 |
| Rofellos | 25-74-1 | 25.0% | 25.3% | 7.49 | 1 | 6 |
| Spider-Man 2099 | 56-44-0 | 56.0% | 56.0% | 10.09 | 0 | 9 |
| **Aggregate** | **486-508-6** | **48.6%** | **48.9%** | **9.30** | **6** | **106** |

Lathril won 248 of 500 games when listed first and 238 of 500 when listed second. That two-point difference is small relative to the matchup variation.

The aggregate decisive result is close to even, but the spread is the useful finding: Forge Lathril performed poorly against fast creature pressure, white disruption, and explosive green ramp, while it appeared very strong against Emry and Katara. The latter results should not be read as real matchup advantages because Forge explicitly handles control and combo worse than straightforward creature decks.

Six games hit the 120-second full-match limit. Forge printed a winner after its own `Stopping slow match as draw` line; those six winner credits were removed and the games were recorded as draws. The AI also failed to play Celestial Reunion 106 times, always reducing confidence in Lathril's measured performance. Eight other card-play failures were logged: Detective's Phoenix six times, Ironheart, Clever Champion once, and Bloodline Bidding once.

Machine-readable results are in `results.csv`; the exact deck snapshots are under `decks/`; the 20 counted batch logs are retained under `raw/`. Smoke-test logs are not included.

## Interpretation

Within this exact Forge setup, the aggregate estimate is relatively precise: 486 wins in 994 decisive games gives a rough 95% binomial interval of 45.8%–52.0%. That interval describes repeated Forge runs only. It does not absorb deck-source selection, AI competence, card-specific bugs, ladder matchmaking, or human decision quality.

The result supports using the simulator to learn card sequencing and identify obviously awkward openings. It does not support claiming the deck is “Platinum strength,” nor does it justify a paper change by itself. Real Arena and paper observations remain the higher-value evidence.

## Important limitations

- Forge says its AI is best with aggro and midrange, poor-to-OK with control, and poor with most combo. Emry, Katara, Spider-Man 2099, Nashi, Yuriko, and Raffine will not be piloted like strong human players.
- Forge's `Brawl` implementation may not reproduce every Competitive Brawl rule detail. In particular, Arena Competitive Brawl has no free mulligan, while normal Brawl does.
- The current Arena mirror is not the exact paper list because of the four documented substitutions above.
- These are repeated AI games from fixed deck snapshots, not independent human ladder matches. The result measures Forge behavior, not the user's expected Arena rank or win rate.
- Opponent sources are representative public lists, not one standardized tournament dataset. Two lists were explicitly recorded at Platinum; the others were selected for current metagame prominence or strategic coverage.
- The per-matchup sample is 100. Near 50%, its rough 95% margin of error is about ten percentage points even before simulator bias.
- Forge repeatedly logged `AI failed to play Celestial Reunion`; this is a material, directional bug against Lathril.
