import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readBinderInventory } from '../src/lib/binder.ts';
import { printingKey, referencePrinting } from '../src/lib/binder-utils.ts';
import { normalizeName } from '../src/lib/parser.ts';
import type { CardFace, CardMetadata } from '../src/lib/types.ts';

// Import only from a local, already-downloaded public catalogue. No collection
// identifiers are sent to a remote API, and the existing deck cache is untouched.
const input = process.argv[2];
if (!input) throw new Error('Usage: pnpm import:binder-cards /path/to/public-catalogue.json');
interface PublicCard {
  id: string; oracle_id?: string; name: string; lang: string; set: string; collector_number: string;
  cmc: number; colors?: string[]; color_identity: string[]; scryfall_uri: string;
  mana_cost?: string; type_line: string; oracle_text?: string; power?: string; toughness?: string;
  loyalty?: string; image_uris?: Record<string, string>; card_faces?: PublicCard[];
}
const catalogue = JSON.parse(readFileSync(resolve(input), 'utf8')) as PublicCard[];
if (!Array.isArray(catalogue)) throw new Error('Expected a public catalogue JSON array');
const inventory = readBinderInventory();
const cards: Record<string, CardMetadata> = {};
for (const entry of [...inventory.gallery, ...inventory.entries]) {
  const number = referencePrinting(entry);
  const matches = catalogue.filter(card => card.lang === 'en' && card.set === entry.set.toLowerCase() && card.collector_number === number);
  if (matches.length !== 1 || normalizeName(matches[0].name) !== normalizeName(entry.name)) throw new Error(`Unresolved exact binder printing: ${entry.name}`);
  const card = matches[0];
  const images = (uris?: Record<string, string>): CardFace['images'] => uris ? {
    small: uris.small, normal: uris.normal, large: uris.large, artCrop: uris.art_crop,
  } : undefined;
  const face = (item: PublicCard): CardFace => ({
    name: item.name, manaCost: item.mana_cost ?? '', typeLine: item.type_line, oracleText: item.oracle_text ?? '',
    ...(item.power !== undefined && { power: item.power }), ...(item.toughness !== undefined && { toughness: item.toughness }),
    ...(item.loyalty !== undefined && { loyalty: item.loyalty }), ...(item.image_uris && { images: images(item.image_uris) }),
  });
  const faces = card.card_faces?.map(face) ?? [face(card)];
  if (card.image_uris && !faces[0].images) faces[0].images = images(card.image_uris);
  cards[printingKey(entry.set, number)] = {
    id: card.id, oracleId: card.oracle_id, name: card.name, manaValue: card.cmc,
    colors: card.colors ?? [], colorIdentity: card.color_identity, set: card.set,
    collectorNumber: number, scryfallUrl: card.scryfall_uri.split('?')[0], faces,
  };
}
const cache = { schemaVersion: 1, updatedAt: new Date().toISOString(),
  source: 'Scryfall public bulk catalogue; exact printings matched locally, no remote collection lookup.', cards };
writeFileSync(resolve('data/binder-cards.json'), JSON.stringify(cache, null, 2) + '\n');
console.log(`Imported ${Object.keys(cards).length} binder printings from the local public catalogue. Deck cache unchanged.`);
