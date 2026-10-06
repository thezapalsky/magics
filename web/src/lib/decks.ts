import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { cardKey, exportDeck, parseDeck } from './parser.ts';
import { groupBasicCopies, isLand } from './card-utils.ts';
import type { CardCache, DeckFamily, DisplayCard, LoadedDeck } from './types.ts';

// Package scripts run from web/. Do not use import.meta.url here: Astro's
// prerender bundler relocates this module into dist/.prerender/.
const webRoot = process.cwd();
export const repoRoot = resolve(webRoot, '..');
export const cachePath = resolve(webRoot, 'data/cards.json');
export const families: DeckFamily[] = JSON.parse(readFileSync(resolve(webRoot, 'data/decks.json'), 'utf8'));

export function readSource(source: string): string {
  const path = resolve(repoRoot, source);
  if (relative(repoRoot, path).startsWith('..')) throw new Error(`Source outside repository: ${source}`);
  return readFileSync(path, 'utf8');
}

export function loadCache(): CardCache {
  const cache = JSON.parse(readFileSync(cachePath, 'utf8')) as CardCache;
  if (cache.schemaVersion !== 1) throw new Error('Unsupported card cache. Run pnpm refresh:cards.');
  return cache;
}

export function loadDeck(family: DeckFamily, version: string, cache = loadCache()): LoadedDeck {
  const snapshot = family.versions.find(item => item.version === version);
  if (!snapshot) throw new Error(`Unknown version ${family.id}/${version}`);
  const parsed = parseDeck(readSource(snapshot.source));
  const display = (entry: typeof parsed.commander): DisplayCard => {
    const key = cardKey(entry);
    const metadata = cache.cards[key];
    if (!metadata) throw new Error(`Missing card metadata for ${entry.name}. Run pnpm refresh:cards.`);
    return { ...entry, key, metadata };
  };
  const commander = display(parsed.commander);
  const entries = parsed.entries.map(display);
  const copies = new Map<string, number>([[commander.metadata.oracleId ?? commander.metadata.id, 1]]);
  for (const card of entries) {
    const id = card.metadata.oracleId ?? card.metadata.id;
    const count = (copies.get(id) ?? 0) + card.quantity;
    if (count > 1 && !/\bBasic\b/.test(card.metadata.faces[0].typeLine)) throw new Error(`Duplicate nonbasic card: ${card.name}`);
    copies.set(id, count);
  }
  const cards = groupBasicCopies(entries);
  return {
    family, snapshot, commander, cards, exportText: exportDeck(parsed),
    total: 1 + cards.reduce((sum, card) => sum + card.quantity, 0),
    landCount: cards.filter(isLand).reduce((sum, card) => sum + card.quantity, 0),
  };
}
