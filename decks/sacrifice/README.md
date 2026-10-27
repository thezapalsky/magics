# Sacrifice — Sephiroth, Fabled SOLDIER

Paper version: **3.0.0**. Built deck confirmed and recorded **27 October 2026**.

The user confirmed building the paper deck with exactly the card choices and
quantities in the saved [Arena Sacrifice 3.0 snapshot](../arena/sacrifice-3.0.txt).
No cards were swapped. The original assembly date is not established.

Paper `3.0.0` expresses the existing `3.0` deck generation in the repository's
three-part paper version format; it does not indicate a tuning change. The Arena
snapshot keeps its original name and contents. Lathril remains at `0.3.3` in the
root `VERSION`; this deck has its own [VERSION](VERSION).

## Deck records

- [decklist.txt](decklist.txt): canonical paper list, one commander and 99 cards.
- [exports/paper-3.0.0.txt](exports/paper-3.0.0.txt): import-ready names and quantities for ManaBox or a playtest print list.
- [forge.dck](forge.dck): synchronized Forge export of this same list.

The deck has **31 Swamps**, plus Bojuka Bog, Command Tower, Reliquary Tower and
Witch's Cottage: **35 dedicated lands**. Fell the Profane and Malakir Rebirth
also have playable land faces and remain in the list as their front-face names.

The paper export omits Arena set codes and collector numbers because physical
printings and which copies are originals versus playtest prints have not been
fully inventoried. Building the deck does not establish ownership of every
official printing. The record preserves all 100 card choices, not an assumed
purchase list or inventory.

## Plan and evidence

Develop expendable or recurring creatures, sacrifice them for mana and cards,
and turn deaths into life loss through Sephiroth, Bastion of Remembrance and
related payoffs. Drivnod supports the death triggers; the recursion package
reuses creatures and rebuilds after interaction.

This is a user-confirmed paper build, not an experiment or a claim of improved
performance. Historical Forge results in EXP-004 used an earlier Arena list and
are not paper results for this version. No paper games are recorded yet.

Future swaps need their own explicitly accepted version. The discussed Vengeful
Bloodwitch for Gixian Infiltrator swap remains a suggestion; it is not part of
this confirmed build.

## Verification

On 2026-10-27, Scryfall's collection endpoint resolved all 70 distinct names as
paper-available, Commander-legal cards with black or colorless identity. This is
a dated database check, not a printing-ownership claim or sanctioned-event
approval for playtest prints. Source: [Scryfall card collection API](https://scryfall.com/docs/api/cards/collection).

Validate the canonical list from the repository root:

```sh
./scripts/validate-deck.sh decks/sacrifice/decklist.txt
```

The website's validation also checks this deck's version and canonical list.
Regression tests compare its commander and quantities with Arena Sacrifice 3.0,
its paper export, and its Forge export.
