import assert from 'node:assert/strict';
import test from 'node:test';
import { families, loadCache, loadDeck } from '../src/lib/decks.ts';
import { compareDeckCards, lathrilRelation } from '../src/lib/deck-relation.ts';

const cache = loadCache();
const paper = loadDeck(families.find(family => family.id === 'paper-lathril')!, '0.3.3', cache);
const arena = loadDeck(families.find(family => family.id === 'arena-simulator')!, '0.3.3', cache);

test('homepage relation matches the latest source lists and three documented swaps', () => {
  const relation = lathrilRelation(paper, arena);
  assert.equal(relation.sharedCount, 97);
  assert.deepEqual(relation.substitutions, [
    { paper: 'Sol Ring', arena: 'Mind Stone' },
    { paper: "Commander's Sphere", arena: 'The Soul Stone' },
    { paper: 'Risky Research', arena: 'Cost of Brilliance' },
  ]);
});

test('comparison counts repeated basics and ignores printings and DFC aliases', () => {
  const copy = structuredClone(paper);
  copy.commander.set = 'another-printing';
  copy.cards.find(card => card.name.startsWith('Sephiroth'))!.name = 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel';
  assert.deepEqual(compareDeckCards(paper, copy), { sharedCount: 100, paperOnly: [], arenaOnly: [] });
  copy.cards.find(card => card.name === 'Forest')!.quantity -= 1;
  assert.deepEqual(compareDeckCards(paper, copy), {
    sharedCount: 99, paperOnly: [{ name: 'Forest', quantity: 1 }], arenaOnly: [],
  });
});

test('comparison keeps rebalanced variants distinct', () => {
  const copy = structuredClone(paper);
  copy.cards.find(card => card.name === 'Wood Elves')!.metadata.name = 'A-Wood Elves';
  assert.deepEqual(compareDeckCards(paper, copy), {
    sharedCount: 99, paperOnly: [{ name: 'Wood Elves', quantity: 1 }],
    arenaOnly: [{ name: 'A-Wood Elves', quantity: 1 }],
  });
});

test('stale mappings and different commanders fail closed', () => {
  const copy = structuredClone(arena);
  copy.cards.find(card => card.name === 'Mind Stone')!.metadata.name = 'Worn Powerstone';
  assert.throws(() => lathrilRelation(paper, copy), /no longer match/);
  assert.throws(() => lathrilRelation(paper, paper), /no longer match/);
  const otherCommander = structuredClone(arena);
  otherCommander.commander.metadata.name = 'Sephiroth, Fabled SOLDIER';
  assert.throws(() => lathrilRelation(paper, otherCommander), /no longer match/);
});
