import { normalizeName } from './parser.ts';
import type { LoadedDeck } from './types.ts';

type CardDifference = { name: string; quantity: number };
type ComparableDeck = Pick<LoadedDeck, 'commander' | 'cards'>;

// Cached canonical names ignore printing/export aliases while keeping A- variants.
export function compareDeckCards(paper: ComparableDeck, arena: ComparableDeck) {
  const quantities = (deck: ComparableDeck) => {
    const cards = new Map<string, number>();
    for (const card of [deck.commander, ...deck.cards]) {
      const name = normalizeName(card.metadata.name);
      cards.set(name, (cards.get(name) ?? 0) + card.quantity);
    }
    return cards;
  };
  const left = quantities(paper);
  const right = quantities(arena);
  let sharedCount = 0;
  const paperOnly: CardDifference[] = [];
  const arenaOnly: CardDifference[] = [];
  for (const name of [...new Set([...left.keys(), ...right.keys()])].sort()) {
    const paperQuantity = left.get(name) ?? 0;
    const arenaQuantity = right.get(name) ?? 0;
    sharedCount += Math.min(paperQuantity, arenaQuantity);
    if (paperQuantity > arenaQuantity) paperOnly.push({ name, quantity: paperQuantity - arenaQuantity });
    if (arenaQuantity > paperQuantity) arenaOnly.push({ name, quantity: arenaQuantity - paperQuantity });
  }
  return { sharedCount, paperOnly, arenaOnly };
}

// Documented proxy relationships, not arbitrary pairings. Fail a future build
// rather than publish stale explanation if either default changes beyond them.
const substitutions = [
  { paper: 'Sol Ring', arena: 'Mind Stone' },
  { paper: "Commander's Sphere", arena: 'The Soul Stone' },
  { paper: 'Risky Research', arena: 'Cost of Brilliance' },
] as const;

export function lathrilRelation(paper: ComparableDeck, arena: ComparableDeck) {
  const diff = compareDeckCards(paper, arena);
  const matches = (cards: CardDifference[], side: 'paper' | 'arena') =>
    cards.length === substitutions.length && substitutions.every(swap =>
      cards.some(card => card.name === swap[side] && card.quantity === 1));
  if (normalizeName(paper.commander.metadata.name) !== normalizeName(arena.commander.metadata.name) ||
      !matches(diff.paperOnly, 'paper') || !matches(diff.arenaOnly, 'arena')) {
    throw new Error('Lathril defaults no longer match the documented proxies. Review the homepage relation.');
  }
  return { sharedCount: diff.sharedCount, substitutions };
}
