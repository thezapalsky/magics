import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSource } from './decks.ts';
import { normalizeName } from './parser.ts';
import { binderStats, displayBinderCard, makeBinderPages, printingKey, referencePrinting, type BinderInventory } from './binder-utils.ts';
import type { CardCache } from './types.ts';

export function readBinderInventory(): BinderInventory {
  const inventory = JSON.parse(readSource('collections/spider-man/inventory.json')) as BinderInventory;
  validateBinderInventory(inventory);
  return inventory;
}

export function validateBinderInventory(inventory: BinderInventory): void {
  if (inventory.schemaVersion !== 1 || inventory.rules.mainTarget !== 79 || inventory.rules.optionalSlots !== 14 ||
      inventory.rules.pocketsPerPage !== 4 || inventory.rules.galleryPages !== 2 ||
      inventory.entries.length !== 93 || inventory.gallery.length !== 8) throw new Error('Invalid binder scope');
  const identities = new Set<string>();
  for (const [index, card] of inventory.entries.entries()) {
    if (card.slot !== index + 1) throw new Error('Binder slots must be consecutive and ordered');
    const id = normalizeName(card.name);
    if (identities.has(id)) throw new Error(`Duplicate binder character: ${card.name}`);
    identities.add(id);
    if (!['SPM', 'SPE'].includes(card.set)) throw new Error(`Unexpected character set: ${card.set}`);
    if (!['Heroes', 'Allies & Supporting Cast', 'Villains'].includes(card.section)) throw new Error('Invalid binder section');
    if (!['owned', 'missing'].includes(card.status) ||
        (card.status === 'owned' ? card.placeholder !== null : !['printed', 'label'].includes(card.placeholder ?? ''))) {
      throw new Error(`Invalid ownership/placeholder: ${card.name}`);
    }
  }
  if (inventory.entries.filter(card => card.set === 'SPM').length !== 79 ||
      inventory.entries.filter(card => card.set === 'SPE').length !== 14) throw new Error('SPM and SPE scopes must remain separate');
  for (const [index, card] of inventory.gallery.entries()) {
    if (card.slot !== index + 1 || card.status !== 'owned') throw new Error('Invalid gallery pocket');
  }
}

export function loadBinder() {
  const inventory = readBinderInventory();
  const cache = JSON.parse(readFileSync(resolve(process.cwd(), 'data/binder-cards.json'), 'utf8')) as CardCache;
  if (cache.schemaVersion !== 1) throw new Error('Unsupported binder card cache');
  const cards = [...inventory.gallery, ...inventory.entries].map(card => {
    const number = referencePrinting(card);
    const metadata = cache.cards[printingKey(card.set, number)];
    if (!metadata || normalizeName(metadata.name) !== normalizeName(card.name) ||
        metadata.set !== card.set.toLowerCase() || metadata.collectorNumber !== number || !metadata.faces[0]?.images) {
      throw new Error(`Missing or mismatched binder artwork: ${card.name} (${card.set} ${number})`);
    }
    return displayBinderCard(card, metadata);
  });
  return { inventory, stats: binderStats(inventory), cards,
    pages: makeBinderPages(cards, inventory.rules.galleryPages + Math.ceil(inventory.entries.length / 4)) };
}

export function missingBinderText(set: 'SPM' | 'SPE'): string {
  const inventory = readBinderInventory();
  return inventory.entries.filter(card => card.set === set && card.status === 'missing')
    .map(card => `1 ${card.name} (${card.set}) ${card.collectorNumber.padStart(4, '0')}`).join('\n') + '\n';
}
