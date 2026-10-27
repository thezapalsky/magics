# Magics — handoff for the next agent

Prepared **27 October 2026**. This document carries the current project state and
decisions into a new cloud checkout. It is context, not a request to start another
feature, research task, deck change or deployment.

## Start here

- Repository: <https://github.com/thezapalsky/magics>.
- Published baseline: `main` at `b3fd96aa8ba7084a2eae7899c42c636094ff7942`, merging
  [PR #3 — Add Paper Sacrifice and filter decks by platform](https://github.com/thezapalsky/magics/pull/3).
- Production: <https://magics.zapalsky.com/>. The new home filters, Paper Sacrifice
  page and byte-exact paper export were verified live after that merge.
- Read `AGENTS.md`, `README.md`, and `web/AGENTS.md` before editing. Inspect the
  actual checkout and Git status; newer repository state takes precedence over
  this dated handoff. Use the cloud checkout's real path, not a Mac-specific path.
- The Mac source checkout is `/Users/mikolaj/Developer/magics`. The old
  `Documents/ChatGPT/magics` checkout is abandoned and must not be used.
- These handoff notes are on the local `codex/cloud-handoff` documentation branch.
  They are not part of the published baseline until separately pushed/reviewed.
  Paste or attach this file when starting the cloud task; do not assume the cloud
  agent can read local files or see an unpublished branch.

## Current decks

| Deck | Version/status | Tracked source |
|---|---|---|
| Paper Lathril | 0.3.3, released | `decks/lathril/decklist.txt` |
| Paper Sacrifice, Sephiroth | 3.0.0, built and confirmed | `decks/sacrifice/decklist.txt` |
| Arena Lathril simulator | 0.3.3, approved test target | `decks/lathril/exports/arena-test-0.3.3.txt` |
| Arena Elves | 4.1, saved user export | `decks/arena/elves-4.1.txt` |
| Arena Sacrifice | 3.0, saved user export | `decks/arena/sacrifice-3.0.txt` |

Each list contains one commander and 99 cards. The Arena simulator target has not
been re-exported from the client to verify its present contents or ownership.

Root `VERSION` is **Lathril 0.3.3**. Paper Sacrifice has its own
`decks/sacrifice/VERSION` (**3.0.0**), README, Forge export and
`exports/paper-3.0.0.txt`. The user confirmed actually building Paper Sacrifice
with **no swaps** from Arena Sacrifice 3.0. The three-part paper version expresses
the same deck generation, not an upgrade. Physical printing choices and the
original-versus-proxy breakdown are not fully inventoried.

Paper Sacrifice has 31 Swamps plus four other dedicated lands, totaling 35.
Malakir Rebirth and Fell the Profane additionally have playable land faces.

The Lathril mirror differs from paper in exactly these three slots:

| Paper | Arena simulator |
|---|---|
| Sol Ring | Mind Stone |
| Commander's Sphere | The Soul Stone |
| Risky Research | Cost of Brilliance |

The last row is an ownership/wildcard workaround. Read the tracked lists and
`decks/lathril/exports/README.md` instead of reconstructing decks from conversation.

## Decisions to preserve

- Paper Lathril is an Elfball deck built around the user's collection. Preserve
  that direction and distinguish it from the separate sacrifice strategy.
- The user likes The Soul Stone and does not want to remove it from the relevant
  decks. They are comfortable using playtest prints for casual paper play.
- **Vengeful Bloodwitch replacing Gixian Infiltrator was suggested, not adopted.**
  Gixian remains in both confirmed Sacrifice lists. Hungry Ghoul was found in the
  physical collection but is not in those lists. Multiversal Passage was also
  discussed as a Lathril candidate and was not adopted.
- Reported physical finds include Infernal Vessel, Fake Your Own Death and Hungry
  Ghoul. Do not infer a complete collection or authentic-card ownership from deck
  inclusion. Older pasted scans were incomplete and one was merged/mis-scanned.
- The user does not want to rescan the entire physical collection. Ask for a
  focused check of a few candidates when collection information is missing.
- The user reported reaching Platinum 3 with Sephiroth and feeling that it played
  better than Elves; the Lathril mirror had awkward early mana. These are
  qualitative user observations, not a measured win rate or completed game log.
- Prior wildcard balances and price estimates are historical. Verify current
  ownership, craftability, legality and prices before relying on them.

## Forge is inactive for this continuation

The user explicitly said they will not use Forge in the new thread unless they
set it up again on another machine. Leave the old run reports out of the active
handoff and do not resume simulations, install Forge/Java, or schedule benchmark
runs. Existing experiment outputs in Git are historical archives, not outstanding
work or current deck-strength estimates.

Only `scripts/validate-deck.sh` is currently tracked as a shell runner; there is no
reusable Forge benchmark runner script in the repository. Do not claim that a
cloud simulation environment exists. A future Forge setup needs a new user request.

The structural validator understands the canonical `// COMMANDER` / `// DECK`
format. It is not an Arena-export parser. Website validation handles Arena text.

## Website and deployment

- Astro + Svelte + TypeScript under `web/`, generated as a static site. No database,
  dynamic server, editing workflow or simulation UI.
- Five independent home tiles: two Paper and three Arena. **All / Paper / Arena**
  filters show 5 / 2 / 3 tiles. All is the default. Two columns on desktop, one on mobile.
- Keep the warm charcoal/green styling and factual copy. The user rejected vague
  promotional text and combined paper/Arena hover-choice tiles.
- Card layouts: **Mana stacks** by default, then **Card browser**, **Grid**, **List**.
  The reader shows card images and a Scryfall link rather than repeating rules visually.
- `web/data/decks.json` selects source files and versions. Card metadata is checked
  in at `web/data/cards.json`; builds and interactions require no card-data API.
  Artwork still loads from external image URLs. Refresh metadata only explicitly.
- Paper Sacrifice reused the existing Arena metadata through 59 name-only keys.
  The 228 pre-existing records and their timestamp were preserved. Keep `A-` Arena
  variants distinct; they are not interchangeable with paper cards.
- Hosting is **Cloudflare Workers Static Assets**, not Pages. Project name:
  `magics-viewer`; native GitHub integration publishes successful `main` builds to
  `magics.zapalsky.com`. Feature branches have separate previews. No paid backend
  or runtime bindings were added.
- Read `web/DEPLOY.md` and `web/QA.md`. Use feature branches and reviewable changes.
  Commits are required for coherent changes; future pushes, merges and tags still
  need the authorization required by `AGENTS.md`. No direct production upload is needed.

## Build and verification

Use Node **24.21.0** (`web/.nvmrc`) and pnpm **10.17.1** (`web/package.json`).
Provision the appropriate runtime for the actual cloud machine; Mac binaries,
keychain credentials, local servers and installed apps do not transfer implicitly.

From the repository root:

```sh
./scripts/validate-deck.sh decks/lathril/decklist.txt
./scripts/validate-deck.sh decks/sacrifice/decklist.txt
cd web
pnpm install --frozen-lockfile
pnpm ci:build
pnpm preview --port 4321
```

Last verified for PR #3: zero diagnostics, **31 passing tests**, ten validated
100-card snapshots, twelve HTML pages, ten exact text exports, **25.4 KiB** combined
gzip JavaScript. Desktop, 390px and 320px browser checks covered filters, search,
the reverse face, keyboard activation, Escape/focus restoration and export controls.
Cloudflare packaging and 36 local route/export/header checks passed. GitHub and
Cloudflare production checks passed after the approved merge.

## Token and print lists to preserve

The user requested one copy of each distinct token type for Paper Lathril 0.3.3
and Sacrifice 3.0, shared types deduplicated, plus a Sephiroth emblem and **10 extra
Swamps**. These ten are a printing request, not a change to the deck's 31 Swamps.
The lists below preserve the previously checked set/collector choices. No print PDF
was produced. Token quantities in play can be represented with dice and separate
tapped/untapped groups; print extra shared markers if both decks need them at once.

### Shared by both decks, including the emblem

```text
1 Insect (TFDN) 21
1 Sephiroth, One-Winged Angel Emblem (TFIN) 24
```

### Lathril only

```text
1 Elf Warrior (TFDN) 19
1 Elf (TECL) 4
1 Shapeshifter (TECL) 1
1 Worm (TECL) 9
1 Map (TLCI) 17
```

### Sacrifice only

```text
1 Treasure (TLCI) 18
1 Faerie (TECL) 5
1 Zombie (TVOW) 8
1 Zombie (TINR) 11
1 Rat (TWOE) 7
1 Servo (TKLD) 6
1 Goat (TSOC) 4
1 Human Soldier (THOB) 2
1 Wicked // Cursed (TWOE) 17
```

### Additional basics for Sacrifice

```text
10 Swamp (FIN) 300
```

Combined: **15 distinct token types + one emblem + ten Swamps = 26 printed cards**.
TVOW 8 is a normal Zombie; TINR 11 has decayed. Both are needed. The Faerie is
blue-black with flying; the Insect is black-green with flying. The Shapeshifter
has changeling and is not an artifact; Servo is an artifact creature. Use the
Wicked half of the Wicked/Cursed Role card. Worm is not Wurm.

### Optional reverse-face references

```text
1 Sephiroth, Fabled SOLDIER (FIN) 115
1 Malakir Rebirth (ZNR) 111
1 Fell the Profane (MH3) 244
```

These optional references are separate from the 26-card accessory total. Avoid
duplicating front faces if the main-deck printing job already includes them.

Printing preferences discussed: A4, 100% / Actual Size, crop marks, no Fit scaling.
Leave Skip Basic Lands off when printing the ten Swamps. Cards are approximately
63 x 88 mm; Standard 66 x 91 mm is the outer sleeve size. The printer is low quality
and the user prints on ordinary paper; they disliked a huge diagonal watermark.

With transparent sleeves, a front-face paper insert can sit in front of a normal
Magic card so the back is uniform. Keep reverse-face printouts outside the deck as
overlays/references; do not shuffle them in as additional cards. Actual double-faced
cards need opaque sleeves or official substitute cards to conceal them in the library.
The user asked about Ultra PRO Standard sleeves; a purchase was not confirmed.

Dice can track token quantities and counters. Soul Stone's harnessed designation is
not a counter: a simple reminder marker suffices. Rules/policy questions should be
checked against official sources rather than inferred from a watermark or print quality:

- [Wizards: playtest cards and proxies](https://magic.wizards.com/en/news/announcements/proxies-policy-and-communication-2016-01-14)
- [Wizards: Spider-Man release notes, including harness](https://magic.wizards.com/en/news/feature/spider-man-release-notes)
- [Wizards: substitute cards](https://magic.wizards.com/en/news/feature/kaldheim-release-notes-2021-01-22)

## What is still outside the repository

There is no complete collection inventory or measured human-game dataset. Older
large collection exports in the chat include uncertain scans. The original OLX
scan/value report is a local attachment, not a complete collection or a current
price source; it has not been bundled into this handoff. Ask for a focused source
only when the user's next task depends on it.

The application work and production deployment are complete. No new deck swap,
benchmark, price check, inventory scan or website feature is pending. Receive the
handoff, inspect the current repository, and follow the user's next request.
