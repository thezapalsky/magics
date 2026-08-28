# EXP-001 — Vile Entomber reanimation package

- Status: `testing`
- Baseline: `3.0.0`
- Candidate: `3.1.0-exp.1`
- Started: 2026-08-28

## Proposed change

```diff
- 1 Assert Perfection
+ 1 Vile Entomber
```

## Hypothesis

Vile Entomber will make the existing graveyard package more reliable by putting the best creature for the situation into the graveyard. Its highest-ceiling line is Massacre Wurm followed by Zombify, especially against token decks. It can also stock a target for Graveshifter or set up other recursion.

The cost is adding a four-mana non-Elf that can be low-impact when no recursion is available.

## Why cut Assert Perfection

Assert Perfection is sorcery-speed interaction that needs a creature already in play and large enough to win the fight. The released deck still has multiple removal spells after the cut, and this choice preserves its Elves, token production, and mana sources.

Stalactite Dagger is not the first cut because it creates a Changeling token, which counts as an Elf. Commander's Sphere is not the first cut because the candidate adds another four-mana spell and still needs reliable development.

## Origin observation

In an Arena game, Vile Entomber put Massacre Wurm into the graveyard and Zombify returned it, producing a reported win around turn four against a 1/1 Squirrel/token deck. This was the reason to create the experiment, but it was not a controlled game with this exact paper list and its precise turn and mana sequence have not been independently reconstructed.

## Test protocol

1. Play at least 12 games with the candidate list.
2. Do not make the final decision until Vile Entomber has been cast at least four times.
3. Log the card buried, whether recursion was available, and whether the line produced meaningful value within two turns.
4. Note games where Assert Perfection would probably have been better.
5. Keep all other cards unchanged during this experiment.

## Success criteria

Adopt the change as `3.1.0` if:

- at least three of the first four casts create meaningful card, board, or game-winning value within two turns;
- the card finds useful targets beyond only the ideal Massacre Wurm plus Zombify line; and
- the lost cheap interaction does not become a repeated problem.

Revise the experiment if Vile Entomber performs well but Assert Perfection proves to be the wrong cut. Reject it if the card is repeatedly stranded without recursion or its four-mana non-Elf body noticeably harms normal Elf development.

## Decision

Pending play-test evidence.

