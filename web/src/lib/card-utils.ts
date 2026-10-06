import type { DisplayCard } from './types.ts';

export function isLand(card: DisplayCard): boolean {
  // Front-face type determines the default group for modal double-faced cards.
  return /\bLand\b/.test(card.metadata.faces[0].typeLine);
}

export const cardTypes = ['Creature', 'Artifact', 'Enchantment', 'Instant', 'Sorcery', 'Planeswalker', 'Land'] as const;

export type CardView = 'grid' | 'stacks' | 'browse';
export function isCardView(value: unknown): value is CardView {
  return value === 'grid' || value === 'stacks' || value === 'browse';
}

export function groupByMana(cards: DisplayCard[]): { id: string; label: string; cards: DisplayCard[]; quantity: number }[] {
  const groups = new Map<string, DisplayCard[]>();
  for (const card of cards) {
    const id = isLand(card) ? 'lands' : String(card.metadata.manaValue);
    const entries = groups.get(id) ?? [];
    entries.push(card);
    groups.set(id, entries);
  }
  return [...groups].sort(([a], [b]) => a === 'lands' ? 1 : b === 'lands' ? -1 : Number(a) - Number(b))
    .map(([id, cards]) => ({ id, label: id === 'lands' ? 'Lands' : `${id} mana`, cards,
      quantity: cards.reduce((sum, card) => sum + card.quantity, 0) }));
}

export function groupBasicCopies(entries: DisplayCard[]): DisplayCard[] {
  const grouped = new Map<string, DisplayCard>();
  for (const card of entries) {
    const basic = /\bBasic\b/.test(card.metadata.faces[0].typeLine);
    const key = basic ? card.metadata.oracleId ?? card.metadata.id : card.key;
    const existing = grouped.get(key);
    if (existing) existing.quantity += card.quantity;
    else grouped.set(key, { ...card });
  }
  return [...grouped.values()];
}

export function selectCards(cards: DisplayCard[], query = '', type = 'All', sort = 'mana'): DisplayCard[] {
  const search = query.trim().toLocaleLowerCase();
  return cards.filter(card => {
    const faces = card.metadata.faces;
    const matchesSearch = !search || [card.name, ...faces.flatMap(face => [face.name, face.typeLine, face.oracleText])].join(' ').toLocaleLowerCase().includes(search);
    return matchesSearch && (type === 'All' || faces.some(face => new RegExp(`\\b${type}\\b`).test(face.typeLine)));
  }).toSorted((a, b) => {
    const landOrder = Number(isLand(a)) - Number(isLand(b));
    if (landOrder) return landOrder;
    if (sort === 'mana' && a.metadata.manaValue !== b.metadata.manaValue) return a.metadata.manaValue - b.metadata.manaValue;
    return a.name.localeCompare(b.name, 'en');
  });
}
