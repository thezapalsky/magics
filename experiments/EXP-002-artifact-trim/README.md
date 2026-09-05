# EXP-002 — reduce generic artifacts

- Status: `adopted`
- Baseline: `0.3.1`
- Adopted release: `0.3.2`
- Experiment revision: `exp.1`
- Started: 2026-09-05
- Adopted: 2026-09-05, by explicit user decision after completing the physical swaps.

## Card availability

The user found physical copies of Changeling Wayfinder, Risky Research, and Scarblade's Malice while checking the unscanned paper collection, then confirmed placing all three into the paper deck. The removed cards were physically present in paper `0.3.1`.

Arena availability does not establish Arena ownership. All three additions exist in Arena, but their current Arena collection and completed-swap state remain unconfirmed while the user checks craftability.

## Adopted change

```diff
- 1 Basilisk Collar
- 1 Mazemind Tome
- 1 Ravenous Amulet
+ 1 Changeling Wayfinder
+ 1 Risky Research
+ 1 Scarblade's Malice
```

## Hypothesis

Replacing three generic artifacts will reduce hands containing mana-hungry setup pieces that do not build the Elf board. The replacements should improve early decisions and keep more draws connected to the deck's primary or secondary plans:

- Changeling Wayfinder counts as an Elf and searches a basic land into hand when it enters.
- Risky Research surveils two and draws two cards immediately, helping find action or place a creature into the graveyard for recursion.
- Scarblade's Malice is a one-mana combat trick that can turn a dying creature into a 2/2 Elf token.

The artifact count falls from 13 to 10. The released list gains one Elf creature card and an additional way to create an Elf token.

## Tradeoffs

- Removing Mazemind Tome loses repeatable scrying and up to four delayed draws.
- Removing Basilisk Collar loses reusable deathtouch and lifelink.
- Removing Ravenous Amulet loses a sacrifice outlet and its delayed life-loss payoff.
- Changeling Wayfinder puts a basic land into hand rather than onto the battlefield, so it fixes land drops but does not ramp.
- Risky Research costs 2 life and is a one-shot spell.
- Scarblade's Malice creates its token only if the targeted creature dies that turn.

The change favors immediate utility, Elf presence, and smoother sequencing over reusable but slower artifacts. It also moves the deck away from the sacrifice plan that the user prefers to keep in the separate Sephiroth deck.

## Post-release observation protocol

Record at least 12 paper Commander games before judging another structural change. For each game, note:

1. whether the opening hand contained two or more artifacts;
2. whether the deck missed an early land drop;
3. whether an added card was drawn and useful;
4. whether a removed card would clearly have been better;
5. whether the deck developed at least three Elves by turn five; and
6. whether card access, protection, or recovery failed.

Cover at least four games against creature-heavy decks, four against removal or board wipes, and four against other strategies. These observations guide tuning but are not a statistically significant win-rate study.

## Success criteria

- Fewer hands are clogged by artifacts that require further mana or creatures to become useful.
- Changeling Wayfinder regularly secures a needed land drop while contributing to Elf count.
- Risky Research usually turns into two relevant cards or meaningfully improves the graveyard.
- Scarblade's Malice either creates an Elf after a trade or makes combat materially better often enough to justify losing reusable Equipment.
- The deck does not repeatedly miss the reusable effects of the removed artifacts.

## Decision

Adopted as paper `0.3.2` after the user explicitly confirmed completing all three physical swaps. This is a preference-based tuning decision informed by awkward hands in the Arena practice mirror. No controlled paper results or completion of the post-release protocol are claimed.

Pending decision: none for the release. Future evidence may support a separate revision experiment.
