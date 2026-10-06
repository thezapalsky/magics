import { writeFile, rename } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { families, readSource, cachePath } from '../src/lib/decks.ts';
import { cardKey, normalizeName, parseDeck } from '../src/lib/parser.ts';
import type { CardCache, CardFace, CardMetadata, DeckEntry } from '../src/lib/types.ts';

type ApiImages = Record<string, string>;
interface ApiFace {
  name: string; mana_cost?: string; type_line: string; oracle_text?: string;
  power?: string; toughness?: string; loyalty?: string; image_uris?: ApiImages;
}
interface ApiCard extends ApiFace {
  id: string; oracle_id?: string; cmc: number; colors?: string[]; color_identity: string[];
  set: string; collector_number: string; scryfall_uri: string; card_faces?: ApiFace[];
}
type Identifier = { name: string } | { set: string; collector_number: string };
interface DigitalOverride { baseName: string; set: string; collectorNumber: string; oracleText: string; image: string; rulesSource: string; verifiedAt: string }
const overrides: Record<string, DigitalOverride> = JSON.parse(readFileSync(new URL('../data/digital-overrides.json', import.meta.url), 'utf8'));

const entries = new Map<string, DeckEntry>();
for (const family of families) {
  for (const version of family.versions) {
    const deck = parseDeck(readSource(version.source));
    for (const entry of [deck.commander, ...deck.entries]) entries.set(cardKey(entry), entry);
  }
}

async function collection(identifiers: Identifier[]): Promise<ApiCard[]> {
  const cards: ApiCard[] = [];
  // Batches, explicit headers, and pacing keep refreshes small and courteous.
  for (let offset = 0; offset < identifiers.length; offset += 75) {
    const response = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: {
        'User-Agent': 'MagicsDeckViewer/0.1 (github.com/thezapalsky/magics)',
        'Accept': 'application/json', 'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifiers: identifiers.slice(offset, offset + 75) }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Scryfall returned ${response.status}. Refresh stopped; existing cache is unchanged.`);
    const result = await response.json() as { data: ApiCard[] };
    cards.push(...result.data);
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  return [...new Map(cards.map(card => [card.id, card])).values()];
}

function matchesName(card: ApiCard, entry: DeckEntry): boolean {
  const wanted = normalizeName(entry.name);
  const actual = normalizeName(card.name);
  return actual === wanted || actual.split(' // ')[0] === wanted;
}

function metadata(card: ApiCard): CardMetadata {
  const images = (uris?: ApiImages): CardFace['images'] => uris ? {
    small: uris.small, normal: uris.normal, large: uris.large, artCrop: uris.art_crop,
  } : undefined;
  const face = (item: ApiFace): CardFace => ({
    name: item.name, manaCost: item.mana_cost ?? '', typeLine: item.type_line,
    oracleText: item.oracle_text ?? '',
    ...(item.power !== undefined && { power: item.power }),
    ...(item.toughness !== undefined && { toughness: item.toughness }),
    ...(item.loyalty !== undefined && { loyalty: item.loyalty }),
    ...(item.image_uris && { images: images(item.image_uris) }),
  });
  const faces = card.card_faces?.map(face) ?? [face(card)];
  // Split/adventure faces share one printed image; transforming cards have two.
  if (card.image_uris && !faces[0].images) faces[0].images = images(card.image_uris);
  return {
    id: card.id, ...(card.oracle_id && { oracleId: card.oracle_id }), name: card.name,
    manaValue: card.cmc, colors: card.colors ?? [], colorIdentity: card.color_identity,
    set: card.set, collectorNumber: card.collector_number,
    scryfallUrl: card.scryfall_uri.split('?')[0], faces,
  };
}

const exactIds = [...entries.values()].filter(entry => !overrides[entry.name]).map(entry => entry.set && entry.collectorNumber !== '0'
  ? { set: entry.set, collector_number: entry.collectorNumber! }
  : { name: entry.name });
const initial = await collection(exactIds);
const resolved = new Map<string, ApiCard>();
const pending = new Map<string, DeckEntry>();
for (const [key, entry] of entries) {
  if (overrides[entry.name]) continue;
  const candidates = initial.filter(card => matchesName(card, entry) && (
    !entry.set || entry.collectorNumber === '0' ||
    (card.set === entry.set && card.collector_number === entry.collectorNumber)
  ));
  if (candidates.length === 1) resolved.set(key, candidates[0]);
  else pending.set(key, entry);
}
const fallbackNames = [...new Set([...pending.values()].map(entry => entry.name))];
const fallback = await collection(fallbackNames.map(name => ({ name })));
for (const [key, entry] of pending) {
  const candidates = fallback.filter(card => matchesName(card, entry));
  if (candidates.length !== 1) throw new Error(`Missing or ambiguous identity: ${entry.name}. Existing cache is unchanged.`);
  resolved.set(key, candidates[0]);
  console.warn(`Name-verified artwork fallback: ${entry.name} (${entry.set ?? 'no set'} ${entry.collectorNumber ?? ''}) -> ${candidates[0].set} ${candidates[0].collector_number}`);
}
const cache: CardCache = {
  schemaVersion: 1, updatedAt: new Date().toISOString(),
  cards: Object.fromEntries([...resolved].sort(([a], [b]) => a.localeCompare(b)).map(([key, card]) => [key, metadata(card)])),
};
// Only these explicitly sourced Arena variants may use a paper base record.
// Unknown A- cards still fail resolution; stripping A- globally is forbidden.
const digitalEntries = [...entries].filter(([, entry]) => overrides[entry.name]);
const bases = await collection(digitalEntries.map(([, entry]) => ({ name: overrides[entry.name].baseName })));
for (const [key, entry] of digitalEntries) {
  const override = overrides[entry.name];
  const base = bases.filter(card => normalizeName(card.name) === override.baseName);
  if (base.length !== 1) throw new Error(`Cannot resolve digital base for ${entry.name}`);
  const card = metadata(base[0]);
  card.id = `arena-rebalanced:${entry.name}`;
  card.name = entry.name;
  card.set = override.set;
  card.collectorNumber = override.collectorNumber;
  card.digitalRebalanced = true;
  card.rulesSource = override.rulesSource;
  card.faces[0].name = entry.name;
  card.faces[0].oracleText = override.oracleText;
  card.faces[0].images = {
    small: override.image, normal: override.image, large: override.image,
    artCrop: card.faces[0].images?.artCrop ?? override.image,
  };
  cache.cards[key] = card;
  console.log(`Sourced digital override: ${entry.name} (Wizards, verified ${override.verifiedAt})`);
}
// A completed refresh replaces the cache atomically, never leaving half a deck.
await writeFile(`${cachePath}.tmp`, `${JSON.stringify(cache, null, 2)}\n`);
await rename(`${cachePath}.tmp`, cachePath);
console.log(`Cached ${resolved.size} source identities across ${families.length} deck families.`);
