import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSource } from './decks.ts';
import { normalizeName } from './parser.ts';
import { binderStats, displayBinderCard, makeBinderPages, printingKey, referencePrinting, type BinderInventory, type BinderScenePlan, type BinderCard } from './binder-utils.ts';
import type { CardCache, CardMetadata } from './types.ts';

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
  const artwork = (card: { name: string; set: string; collectorNumber: string; observedCollectorNumber?: string | null }): CardMetadata => {
    const number = referencePrinting(card);
    const metadata = cache.cards[printingKey(card.set, number)];
    if (!metadata || normalizeName(metadata.name) !== normalizeName(card.name) ||
        metadata.set !== card.set.toLowerCase() || metadata.collectorNumber !== number || !metadata.faces[0]?.images) {
      throw new Error(`Missing or mismatched binder artwork: ${card.name} (${card.set} ${number})`);
    }
    return metadata;
  };
  const cards = [...inventory.gallery, ...inventory.entries].map(card => displayBinderCard(card, artwork(card)));
  const plan = readBinderScenePlan();
  const plannedCards: BinderCard[] = plan.gallery.map(position => {
    const original = cards.find(card => card.key === `gallery-${position.slot}`);
    if (!original) throw new Error('Unknown scene-plan gallery card');
    return { ...original, page: position.page, pocket: position.pocket };
  });
  const movedCharacters = new Set<number>();
  for (const scene of plan.scenes) for (const entry of scene.cards) {
    const original = entry.characterSlot !== undefined
      ? cards.find(card => card.characterSlot === entry.characterSlot)
      : entry.gallerySlot !== undefined ? cards.find(card => card.key === `gallery-${entry.gallerySlot}`) : undefined;
    if ((entry.characterSlot !== undefined || entry.gallerySlot !== undefined) &&
        (!original || original.name !== entry.name || original.set !== entry.set.toLowerCase())) {
      throw new Error(`Scene identity mismatch: ${entry.name}`);
    }
    const metadata = artwork(entry);
    if (!Number.isInteger(entry.faceIndex) || !metadata.faces[entry.faceIndex]?.images) throw new Error('Invalid scene face');
    if (entry.availability === 'owned' && original && (original.status !== 'owned' || original.collectorNumber !== entry.collectorNumber)) {
      throw new Error(`Unverified owned scene printing: ${entry.name}`);
    }
    if (entry.characterSlot !== undefined) movedCharacters.add(entry.characterSlot);
    plannedCards.push({
      key: original?.key ?? `scene-${entry.set.toLowerCase()}-${entry.collectorNumber}`,
      quantity: 1, name: entry.name, set: entry.set.toLowerCase(), collectorNumber: entry.collectorNumber,
      metadata, initialFaceIndex: entry.faceIndex, page: entry.page, pocket: entry.pocket,
      characterSlot: entry.characterSlot ?? null, section: original?.section ?? 'Scene extras',
      status: entry.availability === 'owned' ? 'owned' : 'missing',
      placeholder: null, rarity: original?.rarity ?? 'Rare',
      sceneId: scene.id, sceneTitle: scene.title, availability: entry.availability,
      ...(original && { identityStatus: original.status }),
    });
  }
  cards.filter(card => card.characterSlot !== null && !movedCharacters.has(card.characterSlot)).forEach((card, index) => {
    const offset = plan.characterStartPocket - 1 + index;
    plannedCards.push({ ...card, page: plan.characterStartPage + Math.floor(offset / 4), pocket: offset % 4 + 1 });
  });
  validateBinderSceneLayout(plan, cards, plannedCards);
  plannedCards.sort((a, b) => a.page - b.page || a.pocket - b.pocket);
  return { inventory, stats: binderStats(inventory), cards,
    pages: makeBinderPages(cards, inventory.rules.galleryPages + Math.ceil(inventory.entries.length / 4)),
    scenePlan: { ...plan, cards: plannedCards, pages: makeBinderPages(plannedCards, plan.pageCount) } };
}

export function readBinderScenePlan(): BinderScenePlan {
  return JSON.parse(readSource('collections/spider-man/scene-layout.json')) as BinderScenePlan;
}

export function validateBinderSceneLayout(plan: BinderScenePlan, verified: BinderCard[], planned: BinderCard[]) {
  if (plan.schemaVersion !== 1 || plan.status !== 'planned' ||
      !Number.isInteger(plan.characterStartPage) || plan.characterStartPage < 1 || plan.characterStartPage > plan.pageCount ||
      !Number.isInteger(plan.characterStartPocket) || plan.characterStartPocket < 1 || plan.characterStartPocket > 4 ||
      plan.pageCount !== Math.ceil(planned.length / 4) || plan.scenes.length !== 2 || planned.length !== 104) throw new Error('Invalid scene-plan scope');
  const positions = new Set<string>();
  const keys = new Set<string>();
  for (const card of planned) {
    const position = `${card.page}/${card.pocket}`;
    if (!Number.isInteger(card.page) || card.page < 1 || card.page > plan.pageCount ||
        !Number.isInteger(card.pocket) || card.pocket < 1 || card.pocket > 4 || positions.has(position)) {
      throw new Error('Invalid or overlapping scene-plan pocket');
    }
    if (keys.has(card.key)) throw new Error('A scene-plan card is displayed twice');
    positions.add(position); keys.add(card.key);
  }
  for (let index = 0; index < planned.length; index++) {
    if (!positions.has(`${Math.floor(index / 4) + 1}/${index % 4 + 1}`)) throw new Error('Scene plan must fill every pocket without gaps');
  }
  for (const original of verified) if (!keys.has(original.key)) throw new Error(`Lost binder entry: ${original.name}`);
  for (const scene of plan.scenes) {
    if (scene.columns !== 3 || ![2, 3].includes(scene.rows) || scene.cards.length !== scene.rows * scene.columns) throw new Error('Incomplete scene');
    const coordinates = new Set<string>();
    const firstPage = Math.min(...scene.cards.map(card => card.page));
    if (!['spread', 'sequence'].includes(scene.arrangement)) throw new Error('Invalid scene arrangement');
    if (scene.arrangement === 'spread' && firstPage % 2 !== 0) throw new Error('Joined scenes must begin on an even left-hand page');
    for (const card of scene.cards) {
      const coordinate = `${card.row}/${card.column}`;
      const offset = (card.row - 1) * scene.columns + card.column - 1;
      const page = scene.arrangement === 'spread'
        ? firstPage + Math.floor((card.row - 1) / 2) * 2 + Math.floor((card.column - 1) / 2)
        : firstPage + Math.floor(offset / 4);
      const pocket = scene.arrangement === 'spread'
        ? ((card.row - 1) % 2) * 2 + (card.column - 1) % 2 + 1 : offset % 4 + 1;
      if (!Number.isInteger(card.row) || card.row < 1 || card.row > scene.rows ||
          !Number.isInteger(card.column) || card.column < 1 || card.column > scene.columns ||
          coordinates.has(coordinate) || card.page !== page || card.pocket !== pocket ||
          !['owned', 'proxy', 'ordered'].includes(card.availability)) throw new Error('Scene artwork order or availability is invalid');
      coordinates.add(coordinate);
    }
  }
}

export function missingBinderText(set: 'SPM' | 'SPE'): string {
  const inventory = readBinderInventory();
  return inventory.entries.filter(card => card.set === set && card.status === 'missing')
    .map(card => `1 ${card.name} (${card.set}) ${card.collectorNumber.padStart(4, '0')}`).join('\n') + '\n';
}

export function sceneProxyText(): string {
  return readBinderScenePlan().scenes.flatMap(scene => scene.cards).filter(card => card.availability === 'proxy')
    .map(card => `1 ${card.name} (${card.set}) ${card.collectorNumber.padStart(4, '0')}`).join('\n') + '\n';
}
