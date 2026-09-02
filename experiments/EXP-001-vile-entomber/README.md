# EXP-001 — Vile Entomber reanimation package

- Status: `adopted`
- Baseline: `0.3.0` (preserved at Git commit `e6dd695`, path `decks/lathril/decklist.txt`).
- Adopted release: `0.3.1`
- Experiment revision: `exp.1`
- Started: 2026-08-28
- Adopted: 2026-09-02, by explicit user decision.

## Card availability

On 2026-09-02, the user confirmed finding a physical copy of Vile Entomber, so ownership of at least one paper copy is confirmed. Arena ownership was established by the user's earlier Arena deck and play report.

The user subsequently confirmed completing paper `0.3.1`, adopting the exact swap below. The Arena-only temporary swap and final Arena contents remain unconfirmed. Ownership and paper adoption do not establish Arena completion.

## Adopted change

```diff
- 1 Assert Perfection
+ 1 Vile Entomber
```

## Hypothesis

Vile Entomber will make the existing graveyard package more reliable by putting the best creature for the situation into the graveyard. Its highest-ceiling line is Massacre Wurm followed by Zombify, especially against token decks. It can also stock a target for Graveshifter or set up other recursion.

The cost is adding a four-mana non-Elf that can be low-impact when no recursion is available.

## Why cut Assert Perfection

Assert Perfection is sorcery-speed interaction that needs a creature already in play and enough power after its +1/+0 bonus to deal lethal damage. Its damage is one-way, not a fight. The released deck still has multiple removal spells after the cut, and this choice preserves its Elves, token production, and mana sources.

Stalactite Dagger is not the first cut because it creates a Changeling token, which counts as an Elf. Commander's Sphere is not the first cut because the candidate adds another four-mana spell and still needs reliable development.

## Origin observation

In an Arena game, Vile Entomber put Massacre Wurm into the graveyard and Zombify returned it, producing a reported win around turn four against a 1/1 Squirrel/token deck. This was the reason to create the experiment, but it was not a controlled game with this exact paper list and its precise turn and mana sequence have not been independently reconstructed.

## Original test protocol

Retained for reference. No logged results establish completion of this protocol; the user chose adoption independently of it.

1. Play at least 30 games with the candidate list.
2. Do not make the final decision until Vile Entomber has been cast at least ten times, even if that requires more than 30 games.
3. Cover all six matchup families below, with each family appearing among the opposing decks in at least five games. One Commander pod may count toward several families.
4. Log the card buried, whether recursion was available, and whether the line produced meaningful value within two turns.
5. Note games where Assert Perfection would probably have been better.
6. Keep all other cards unchanged during this experiment.

### Matchup families

1. Go-wide tokens or creature swarm.
2. Creature midrange, tribal, or big-mana threats.
3. Voltron or other tall-threat decks.
4. Control, board-wipe-heavy, or stax decks.
5. Combo or spellslinger decks.
6. Graveyard or reanimator decks.

This is a practical deckbuilding screen, not a statistically significant win-rate study. Under ideal independent-game assumptions, detecting an increase from a 25% to a 35% multiplayer win rate at 95% confidence and 80% power would require about 329 games with each version. Commander pod composition and politics add further noise. A card-level estimate is more useful here: roughly 33 actual Vile Entomber casts would estimate a 75% useful-impact rate to within about 15 percentage points at 95% confidence.

## Original evidence-based success criteria

The proposed evidence-based route to adopting `0.3.1` required:

- at least seven of the first ten casts create meaningful card, board, or game-winning value within two turns;
- the card finds useful targets beyond only the ideal Massacre Wurm plus Zombify line; and
- the lost cheap interaction does not become a repeated problem.

Revise the experiment if Vile Entomber performs well but Assert Perfection proves to be the wrong cut. Reject it if the card is repeatedly stranded without recursion or its four-mana non-Elf body noticeably harms normal Elf development.

## Decision

Adopted as paper `0.3.1` on 2026-09-02 after the user explicitly confirmed completing the Vile Entomber in / Assert Perfection out swap. The reason is the user's preference to play the reanimation package while retaining the Elf core.

This decision does not claim that the original success criteria were met or that a statistically significant improvement was demonstrated. At adoption, `games.csv` and the cross-experiment game log contain no recorded game results. They remain unchanged rather than backfilled with the earlier anecdote.

The candidate decklist and candidate Forge export are preserved as the proposal's archived artifacts; the released deck and matching release-named Forge export live under `decks/lathril/`. No release tag or remote push is implied by adoption.
