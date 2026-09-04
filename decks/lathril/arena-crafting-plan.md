# Lathril Arena mirror — crafting plan

- Status: partially completed; **5 of 9 original craft swaps user-confirmed**, 4 pending. The additional Arena Entomber alignment is unconfirmed.
- Recorded: 2026-09-02.
- Paper target: released [`0.3.1`](decklist.txt), with Vile Entomber replacing Assert Perfection. The original crafting plan targeted `0.3.0`.
- Arena format: 100-card Brawl.
- Goal: reproduce the paper deck as closely as Arena availability and owned cards allow, for practice and card familiarity. This is not an independent Arena power-upgrade plan or a paper release.

## Evidence and limits

The plan comes from the user's Arena export, subsequent deck screenshots, paper-card photos, and the replacement discussion. The latest screenshot showed **107/100 cards**; the earlier seven-card cleanup below was proposed, but a final 100-card export has not been supplied. Do not treat this document as a verified current Arena decklist.

The user's last explicitly reported wildcard balance was **0 common / 10 uncommon / 0 rare / 6 mythic**, before the three confirmed swaps. The current balance is unconfirmed: the latest Wishclaw Talisman update does not specify whether it was already owned, opened, or crafted using a newly earned rare wildcard. Do not infer a new balance or subtract a rare wildcard from the earlier zero balance. Check collection ownership and the selected printing's craft prompt before spending any wildcards; skip cards already owned or crafted since that report.

On 2026-09-02, the user confirmed completing **Worn Powerstone in / Jaspera Sentinel out** and **Llanowar Tribe in / Llanowar Visionary out**, then also confirmed **Wishclaw Talisman in / Elvish Visionary out**. This confirms those three swaps, not the other six queue entries or the earlier 107-to-100 cleanup.

On 2026-09-04, the user confirmed completing **Scarblade Scout in / A-Harald, King of Skemfar out** and **Springleaf Drum in / Tamiyo's Safekeeping out**. These confirmations do not verify the current complete Arena list or the other pending swaps. The Drum printing and resulting wildcard balance remain unconfirmed.

Also on 2026-09-02, the user confirmed finding a physical copy of **Vile Entomber**, then confirmed completing paper **0.3.1**: Vile Entomber in / Assert Perfection out. [EXP-001](../../experiments/EXP-001-vile-entomber/README.md) is adopted. This does not confirm the discussed temporary Arena swap for Village Rites in Mazemind Tome's slot; Arena alignment remains pending a separate confirmation or export.

Primal Might remains pending in this tracker because its Arena swap has not been explicitly confirmed. If it has already replaced Felling Blow, three original crafts remain rather than four; do not craft or swap it twice.

The linked Arena printings and Brawl legality were checked using Scryfall on 2026-09-02. Printing availability does not establish collection ownership. The Arena client's actual craft prompt takes precedence over a database rarity assumption.

## Craft and swap queue

For each pending row, craft **one copy** only if unowned. Replace the named Arena placeholder one-for-one; do not add these on top of an oversized list. Do not repeat completed swaps. The pending removals assume the last discussed Arena list has not otherwise changed.

| Status | Craft/add | Wildcard | Remove from Arena | Paper card represented |
|---|---|---|---|---|
| Done — user-confirmed | [Worn Powerstone](https://scryfall.com/card/mh3/298/worn-powerstone) | Uncommon | Jaspera Sentinel | Sol Ring — substitute |
| Done — user-confirmed | [Llanowar Tribe](https://scryfall.com/card/j21/598/llanowar-tribe) | Uncommon | Llanowar Visionary | Elvish Aberration — substitute |
| Done — user-confirmed | [Springleaf Drum](https://scryfall.com/card/lrw/261/springleaf-drum) | Common* | Tamiyo's Safekeeping | Exact paper card |
| Done — user-confirmed | [Scarblade Scout](https://scryfall.com/card/ecl/118/scarblade-scout) | Common | A-Harald, King of Skemfar | Exact paper card |
| Pending | [Letter of Acceptance](https://scryfall.com/card/stx/256/letter-of-acceptance) | Common | Paradise Druid | Commander's Sphere — substitute |
| Pending | [Primal Might](https://scryfall.com/card/fdn/643/primal-might) | Rare | Felling Blow | Exact paper card |
| Pending | [Maelstrom Pulse](https://scryfall.com/card/fdn/661/maelstrom-pulse) | Rare | Skemfar Shadowsage | Exact paper card |
| Pending | [Mazemind Tome](https://scryfall.com/card/fdn/676/mazemind-tome) | Rare | Assert Perfection after the temporary Entomber swap; otherwise see alignment below | Exact paper card |
| Done — user-confirmed | [Wishclaw Talisman](https://scryfall.com/card/fdn/617/wishclaw-talisman) | Rare | Elvish Visionary | Exact paper card |

*Springleaf Drum: use the common version the user found in Arena when budgeting common wildcards. An [uncommon ECL printing](https://scryfall.com/card/ecl/260/springleaf-drum) also exists; if selectable in the Arena craft screen, it can use an available uncommon wildcard instead. These are alternative printings of the same single deck slot, not two crafts.

### Remaining wildcard budget

Assuming all four pending cards are unowned; the five completed swaps are excluded:

| Common | Uncommon | Rare | Mythic |
|---|---:|---:|---:|---:|
| 1 | 0 | 3 | 0 |

The remaining crafts require common/rare wildcards unless the cards are already owned. No uncommon or mythic wildcards are needed. The Drum printing and updated wildcard balance remain unconfirmed even though its swap is complete.

## Entomber alignment with paper 0.3.1 — Arena completion unconfirmed

Vile Entomber is owned in Arena, so it adds no craft cost. The temporary route discussed while Mazemind Tome is missing is:

1. If Entomber is absent, add it and remove Village Rites. This keeps Assert Perfection temporarily in the slot still awaiting Tome.
2. When Tome is acquired, add Tome and remove Assert Perfection, keeping Entomber. Do not remove Village Rites a second time.

If Entomber is already present, do not add a duplicate; verify the current list and which placeholder remains. If the direct paper swap (Entomber in / Assert Perfection out) has already been made in Arena instead, Tome should replace Village Rites. These are alternative routes to the same final list, not cumulative extra cuts.

The temporary route trades the missing Tome's draw/selection role for graveyard setup; it is not an ability-equivalent replacement. Only a fresh export or explicit Arena confirmation should mark this route completed. The final target includes both Entomber and Tome, and excludes both Assert Perfection and Village Rites.

## How the three substitutes differ

These preserve selected abilities, not identical power or play patterns:

- **Sol Ring → Worn Powerstone:** both artifacts tap for two colorless mana. Powerstone costs three mana rather than one and enters tapped, so it does not reproduce Sol Ring's early acceleration.
- **Commander's Sphere → Letter of Acceptance:** both are three-mana artifacts that make colored mana and can be sacrificed to draw. Sphere's sacrifice costs no mana and does not require tapping; Letter requires two mana and tapping, so it cannot also tap for mana in that activation.
- **Elvish Aberration → Llanowar Tribe:** both are Elves that tap for three green mana. Tribe is a 3/3 costing GGG; Aberration is a 4/5 costing 5G. Tribe has no Forestcycling, cannot serve as the same early land-search option, and cannot be found with Fierce Empath. Its lower cost also changes development speed.

These replace the earlier loose proxies Jaspera Sentinel, Paradise Druid, and Llanowar Visionary. Do not interpret Arena results with these substitutions as controlled tests of the unchanged paper deck.

## 107-to-100 cleanup for the temporary Arena route — completion unconfirmed

The last screenshot showed Entomber already included. The original `0.3.0` cleanup would have removed it; that cut is superseded for the new `0.3.1` target. If still starting from the pictured 107-card list and using the temporary route above, keep one Entomber and use these seven cuts. Check the current deck first; do not repeat an already-applied cut:

- 1 Swamp (13 → 12).
- 1 Golgari Guildgate.
- 1 Deadly Dispute.
- 1 Poison-Tip Archer.
- 1 Stoic Grove-Guide.
- 1 Elfsworn Giant.
- 1 Village Rites (instead of the original Vile Entomber cut).

Removing those seven from the pictured 107-card deck would leave 100 cards with 35 lands and retain Entomber. The remaining one-for-one craft swaps preserve that count, with Tome eventually replacing Assert Perfection. If the old cleanup already removed Entomber, use the Entomber in / Village Rites out swap on the resulting 100-card deck instead. Do not apply both full cleanup routes blindly.

## Completion checklist

- [x] Worn Powerstone in / Jaspera Sentinel out — user-confirmed 2026-09-02.
- [x] Llanowar Tribe in / Llanowar Visionary out — user-confirmed 2026-09-02.
- [x] Wishclaw Talisman in / Elvish Visionary out — user-confirmed 2026-09-02.
- [x] Scarblade Scout in / A-Harald, King of Skemfar out — user-confirmed 2026-09-04.
- [x] Springleaf Drum in / Tamiyo's Safekeeping out — user-confirmed 2026-09-04.
- [ ] Confirm the current Arena list and which cards are already owned.
- [ ] Confirm the earlier cleanup leaves exactly 100 cards, including Lathril, and 35 lands.
- [ ] Confirm which Springleaf Drum printing was used and the updated wildcard balance.
- [ ] Confirm Entomber's inclusion in Arena and which Tome placeholder remains (Assert Perfection or Village Rites).
- [ ] Complete the four pending one-for-one swaps and confirm the updated wildcard balance.
- [ ] Obtain a fresh Arena text export and compare it with the released paper list, retaining the three documented substitutions and identifying any other differences.

The paper release is now `0.3.1`, and EXP-001 is adopted by user decision. Completing the remaining Arena-only plan does not create another paper release or prove any play-test result; do not change the paper version or lists without a separate paper-deck decision.
