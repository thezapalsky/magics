# Lathril Arena mirror — crafting plan

- Status: partially completed; **7 of 9 original craft swaps user-confirmed**, 2 pending. The Arena Entomber alignment is partially complete, with Mazemind Tome still pending.
- Recorded: 2026-09-02.
- Paper target: released [`0.3.1`](decklist.txt), with Vile Entomber replacing Assert Perfection. The original crafting plan targeted `0.3.0`.
- Arena format: 100-card Brawl.
- Goal: reproduce the paper deck as closely as Arena availability and owned cards allow, for practice and card familiarity. This is not an independent Arena power-upgrade plan or a paper release.

## Evidence and limits

The plan comes from the user's Arena export, subsequent deck screenshots, paper-card photos, and the replacement discussion. The 2026-09-05 screenshot shows **100/100 cards** and the expected 35 lands, confirming the earlier cleanup visually. A fresh text export has not been supplied, so the complete current list has not been machine-compared with the target.

The user's last explicitly reported wildcard balance was **0 common / 10 uncommon / 0 rare / 6 mythic**, before the three confirmed swaps. The current balance is unconfirmed: the latest Wishclaw Talisman update does not specify whether it was already owned, opened, or crafted using a newly earned rare wildcard. Do not infer a new balance or subtract a rare wildcard from the earlier zero balance. Check collection ownership and the selected printing's craft prompt before spending any wildcards; skip cards already owned or crafted since that report.

On 2026-09-02, the user confirmed completing **Worn Powerstone in / Jaspera Sentinel out** and **Llanowar Tribe in / Llanowar Visionary out**, then also confirmed **Wishclaw Talisman in / Elvish Visionary out**. This confirms those three swaps, not the other six queue entries or the earlier 107-to-100 cleanup.

On 2026-09-04, the user confirmed completing **Scarblade Scout in / A-Harald, King of Skemfar out** and **Springleaf Drum in / Tamiyo's Safekeeping out**. These confirmations do not verify the current complete Arena list or the other pending swaps. The Drum printing and resulting wildcard balance remain unconfirmed.

On 2026-09-05, the user confirmed completing **Maelstrom Pulse in / Skemfar Shadowsage out** and noticed that **Primal Might in / Felling Blow out** was already complete. The screenshot confirms both results. It also shows Vile Entomber and Assert Perfection present, with Village Rites absent, so Mazemind Tome's remaining swap is unambiguously **Tome in / Assert Perfection out**.

Also on 2026-09-02, the user confirmed finding a physical copy of **Vile Entomber**, then confirmed completing paper **0.3.1**: Vile Entomber in / Assert Perfection out. [EXP-001](../../experiments/EXP-001-vile-entomber/README.md) is adopted. This does not confirm the discussed temporary Arena swap for Village Rites in Mazemind Tome's slot; Arena alignment remains pending a separate confirmation or export.

Primal Might is now confirmed complete from the user's statement and screenshot; do not craft or swap it again.

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
| Done — user-confirmed and screenshot-confirmed | [Primal Might](https://scryfall.com/card/fdn/643/primal-might) | Rare | Felling Blow | Exact paper card |
| Done — user-confirmed and screenshot-confirmed | [Maelstrom Pulse](https://scryfall.com/card/fdn/661/maelstrom-pulse) | Rare | Skemfar Shadowsage | Exact paper card |
| Pending | [Mazemind Tome](https://scryfall.com/card/fdn/676/mazemind-tome) | Rare | Assert Perfection | Exact paper card |
| Done — user-confirmed | [Wishclaw Talisman](https://scryfall.com/card/fdn/617/wishclaw-talisman) | Rare | Elvish Visionary | Exact paper card |

*Springleaf Drum: use the common version the user found in Arena when budgeting common wildcards. An [uncommon ECL printing](https://scryfall.com/card/ecl/260/springleaf-drum) also exists; if selectable in the Arena craft screen, it can use an available uncommon wildcard instead. These are alternative printings of the same single deck slot, not two crafts.

### Remaining wildcard budget

Assuming both pending cards are unowned; the seven completed swaps are excluded:

| Common | Uncommon | Rare | Mythic |
|---|---:|---:|---:|---:|
| 1 | 0 | 1 | 0 |

The remaining crafts require common/rare wildcards unless the cards are already owned. No uncommon or mythic wildcards are needed. The Drum printing and updated wildcard balance remain unconfirmed even though its swap is complete.

## Entomber alignment with paper 0.3.1 — one swap remaining

The 2026-09-05 screenshot confirms this current state:

- Vile Entomber is present.
- Village Rites is absent.
- Assert Perfection remains as the Mazemind Tome placeholder.

The only remaining action for this alignment is **Mazemind Tome in / Assert Perfection out**. Do not remove Village Rites again or add another Entomber. The final target contains both Entomber and Tome and excludes both Assert Perfection and Village Rites.

## How the three substitutes differ

These preserve selected abilities, not identical power or play patterns:

- **Sol Ring → Worn Powerstone:** both artifacts tap for two colorless mana. Powerstone costs three mana rather than one and enters tapped, so it does not reproduce Sol Ring's early acceleration.
- **Commander's Sphere → Letter of Acceptance:** both are three-mana artifacts that make colored mana and can be sacrificed to draw. Sphere's sacrifice costs no mana and does not require tapping; Letter requires two mana and tapping, so it cannot also tap for mana in that activation.
- **Elvish Aberration → Llanowar Tribe:** both are Elves that tap for three green mana. Tribe is a 3/3 costing GGG; Aberration is a 4/5 costing 5G. Tribe has no Forestcycling, cannot serve as the same early land-search option, and cannot be found with Fierce Empath. Its lower cost also changes development speed.

These replace the earlier loose proxies Jaspera Sentinel, Paradise Druid, and Llanowar Visionary. Do not interpret Arena results with these substitutions as controlled tests of the unchanged paper deck.

## 107-to-100 cleanup — visually confirmed complete

The 2026-09-05 screenshot shows 100/100 cards, with 12 Swamps, 16 Forests, and seven nonbasic lands for 35 lands total. It also shows Vile Entomber retained and Village Rites absent. This visually confirms the intended cleanup result. Do not apply these historical cuts again:

- 1 Swamp (13 → 12).
- 1 Golgari Guildgate.
- 1 Deadly Dispute.
- 1 Poison-Tip Archer.
- 1 Stoic Grove-Guide.
- 1 Elfsworn Giant.
- 1 Village Rites (instead of the original Vile Entomber cut).

The remaining two one-for-one swaps preserve the confirmed 100-card and 35-land counts.

## Completion checklist

- [x] Worn Powerstone in / Jaspera Sentinel out — user-confirmed 2026-09-02.
- [x] Llanowar Tribe in / Llanowar Visionary out — user-confirmed 2026-09-02.
- [x] Wishclaw Talisman in / Elvish Visionary out — user-confirmed 2026-09-02.
- [x] Scarblade Scout in / A-Harald, King of Skemfar out — user-confirmed 2026-09-04.
- [x] Springleaf Drum in / Tamiyo's Safekeeping out — user-confirmed 2026-09-04.
- [x] Primal Might in / Felling Blow out — user- and screenshot-confirmed 2026-09-05.
- [x] Maelstrom Pulse in / Skemfar Shadowsage out — user- and screenshot-confirmed 2026-09-05.
- [ ] Confirm the current Arena list and which cards are already owned.
- [x] Confirm the earlier cleanup leaves exactly 100 cards, including Lathril, and 35 lands — screenshot-confirmed 2026-09-05.
- [ ] Confirm which Springleaf Drum printing was used and the updated wildcard balance.
- [x] Confirm Entomber's inclusion in Arena and which Tome placeholder remains — Entomber present; Assert Perfection is the placeholder.
- [ ] Complete the two pending one-for-one swaps and confirm the updated wildcard balance.
- [ ] Obtain a fresh Arena text export and compare it with the released paper list, retaining the three documented substitutions and identifying any other differences.

The paper release is now `0.3.1`, and EXP-001 is adopted by user decision. Completing the remaining Arena-only plan does not create another paper release or prove any play-test result; do not change the paper version or lists without a separate paper-deck decision.
