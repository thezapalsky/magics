# Lathril import-ready lists

## Current release 0.3.2

Paper release: `0.3.2`. Prepared 2026-09-05.

| File | Use | Contents |
|---|---|---|
| [paper-0.3.2.txt](paper-0.3.2.txt) | Import the physical deck into ManaBox | Exact released paper deck: 1 commander + 99 cards. |
| [arena-target-0.3.2.txt](arena-target-0.3.2.txt) | Import the intended practice deck into Arena | Paper release with only the three documented Arena substitutions below; 1 commander + 99 cards. |

### Exact paper-to-Arena target differences

| Paper 0.3.2 | Arena target 0.3.2 |
|---|---|
| Sol Ring | Worn Powerstone |
| Commander's Sphere | Paradise Druid |
| Elvish Aberration | Llanowar Tribe |

The other 97 card copies match paper `0.3.2`, including Changeling Wayfinder, Risky Research, and Scarblade's Malice. Letter of Acceptance and Mazemind Tome are not in the current target. Paradise Druid is retained deliberately because the user rejected Letter of Acceptance as a weak substitute.

The Arena target is not a verified export of the user's current deck or a statement that every card is owned. At the latest report, Risky Research still required one common wildcard; the user confirmed using owned Cost of Brilliance as its temporary proxy and removing Assert Perfection. The Changeling Wayfinder and Scarblade's Malice swaps still need explicit completion confirmation.

Both current files use `Commander` / `Deck` headings and quantity-plus-name lines without set codes, so they can be imported into ManaBox. The Arena target can also be imported into Arena. After importing, verify Lathril is the commander and the total is 100 before crafting anything.

The paper export was synchronized from the canonical released list. All three new additions were checked as Arena-available and Brawl-legal on 2026-09-05; this database check does not establish ownership or a successful client import.

## Archived 0.3.1 notes

Paper release: `0.3.1`. Prepared 2026-09-02.

| File | Use | Contents |
|---|---|---|
| [paper-0.3.1.txt](paper-0.3.1.txt) | Import the physical deck into ManaBox | Exact released paper list: 1 commander + 99 cards. |
| [arena-target-0.3.1.txt](arena-target-0.3.1.txt) | Import the intended practice deck into Arena (or view it in ManaBox) | Paper release with only the three Arena substitutions below; 1 commander + 99 cards. |

Both files contain only `Commander` / `Deck` section headers and quantity-plus-name card lines. Set codes and collector numbers are omitted so the import is not tied to a particular printing.

The paper file is not an Arena-compatible deck: it retains the three paper cards listed below. The Arena file is a **target**, not an export of the user's verified current deck or a statement that all cards are owned. Neither file changes the user's installed apps automatically.

## Exact paper-to-Arena target differences

| Paper 0.3.1 | Arena target 0.3.1 |
|---|---|
| Sol Ring | Worn Powerstone |
| Commander's Sphere | Letter of Acceptance |
| Elvish Aberration | Llanowar Tribe |

The other 97 card copies, including commander Lathril and Vile Entomber, match the paper release. Both lists contain Mazemind Tome and omit Assert Perfection and Village Rites. Both retain the paper mana base: 16 Forest, 12 Swamp, and the same seven nonbasic lands (35 lands total). These substitutions are not identical in abilities or power; see the [crafting plan](../arena-crafting-plan.md#how-the-three-substitutes-differ).

## Import into Arena

1. Open `arena-target-0.3.1.txt` and copy the entire contents.
2. In Arena, open Decks and choose Import.
3. Verify Lathril is the commander, the format is 100-card Brawl, and the deck contains exactly 100 cards.
4. Review the missing cards and individual craft costs before spending wildcards. In particular, check which Springleaf Drum printing the client selected.

Do not assume the target is immediately playable with the current collection. The [crafting tracker](../arena-crafting-plan.md) records confirmed swaps separately from pending ones, including the temporary Entomber/Tome-slot route. The final target here includes both cards; it is not that temporary budget list.

Source: [Wizards' Arena importing guide](https://mtgarena-support.wizards.com/hc/en-us/articles/360049857771-Importing-a-Deck).

## Import into ManaBox

1. Open `paper-0.3.1.txt` and copy the entire contents.
2. In ManaBox's decks screen, use the add/import control and select text import.
3. Paste the text, choose Commander as the format, and name the deck `Lathril 0.3.1 - Paper`.
4. Verify the Commander section contains Lathril and the complete deck totals 100 cards. If the importer does not assign the commander automatically, move Lathril from the main deck to that section.

ManaBox supports quantity/name text imports and treats set codes and collector numbers as optional. The same Arena target text can be imported into ManaBox as a separate practice list; do not overwrite the physical deck with it.

Sources: [ManaBox import/export guide](https://www.manabox.app/guides/decks/import-export/), [ManaBox commander setup](https://www.manabox.app/guides/decks/getting-started/).

## Verification and maintenance

- The paper export matches the canonical [`decklist.txt`](../decklist.txt) and [`forge.dck`](../forge.dck).
- Both exports were checked for 1 commander, 99 main-deck cards, and no duplicate nonbasic cards; the Arena diff is exactly the three substitutions above.
- All 74 distinct Arena target card names resolved in Scryfall and were listed as Brawl-legal on 2026-09-02. This is a database check, not a successful in-client import or a collection-ownership check.
- App imports have not been exercised in the user's clients; verify the imported result before crafting or playing.
- These are versioned release snapshots. Create new version-named files for later releases instead of silently changing these to a different deck version. Keep canonical paper edits in `decklist.txt` and its synchronized Forge export.
