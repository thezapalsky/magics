import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { families, loadCache, loadDeck, readSource } from '../src/lib/decks.ts';
import { exportDeck, parseDeck } from '../src/lib/parser.ts';
import { groupBasicCopies, isLand, selectCards } from '../src/lib/card-utils.ts';

test('every snapshot is complete, source-preserving and cached', () => {
  const cache = loadCache();
  assert.equal(families.length, 4);
  for (const family of families) for (const snapshot of family.versions) {
    const deck = loadDeck(family, snapshot.version, cache);
    assert.equal(deck.total, 100);
    assert.equal(deck.exportText, exportDeck(parseDeck(readSource(snapshot.source))));
    assert.ok(deck.cards.every(card => card.metadata.faces.length));
  }
});

test('search covers rules, type and names; lands sort last; empty results work', () => {
  const deck = loadDeck(families[0], families[0].defaultVersion);
  const sorted = selectCards(deck.cards);
  const firstLand = sorted.findIndex(isLand);
  assert.ok(sorted.slice(firstLand).every(isLand));
  assert.ok(selectCards(deck.cards, 'Sol Ring').some(card => card.name === 'Sol Ring'));
  assert.ok(selectCards(deck.cards, '', 'Creature').every(card => card.metadata.faces.some(face => face.typeLine.includes('Creature'))));
  assert.ok(selectCards(deck.cards, 'graveyard').length > 0);
  assert.deepEqual(selectCards(deck.cards, 'not-a-real-card'), []);
});

test('invalid snapshots, missing metadata, duplicate nonbasics fail closed', () => {
  assert.throws(() => loadDeck(families[0], '99.9'));
  assert.throws(() => loadDeck(families[0], families[0].defaultVersion, { schemaVersion: 1, updatedAt: '', cards: {} }), /Missing card metadata/);
  const cache = structuredClone(loadCache());
  const sol = Object.values(cache.cards).find(card => card.name === 'Sol Ring')!;
  const signet = Object.values(cache.cards).find(card => card.name === 'Arcane Signet')!;
  sol.oracleId = signet.oracleId;
  assert.throws(() => loadDeck(families[0], families[0].defaultVersion, cache), /Duplicate nonbasic/);
});

test('digital variants keep their names and their sourced rebalanced rules', () => {
  const deck = loadDeck(families.find(family => family.id === 'elves')!, '4.1');
  const avenger = deck.cards.find(card => card.name === 'A-Skemfar Avenger')!;
  const harald = deck.cards.find(card => card.name === 'A-Harald, King of Skemfar')!;
  assert.equal(avenger.metadata.name, avenger.name);
  assert.ok(avenger.metadata.digitalRebalanced);
  assert.doesNotMatch(avenger.metadata.faces[0].oracleText, /nontoken/);
  assert.match(harald.metadata.faces[0].oracleText, /seven/);
  assert.match(harald.metadata.rulesSource!, /magic.wizards.com/);
});

test('repeated basics combine visually without mutating source entries', () => {
  const deck = loadDeck(families[0], families[0].defaultVersion);
  const forest = deck.cards.find(card => card.name === 'Forest')!;
  const entries = [{ ...forest, quantity: 6 }, { ...forest, quantity: 10, key: 'another-printing' }];
  const combined = groupBasicCopies(entries);
  assert.equal(combined.length, 1);
  assert.equal(combined[0].quantity, 16);
  assert.equal(entries[0].quantity, 6);
  assert.equal(entries[1].quantity, 10);
});

test('100-card local filtering stays below the interaction budget', () => {
  const deck = loadDeck(families[0], families[0].defaultVersion);
  const fixture = [...deck.cards, ...deck.cards].slice(0, 100);
  const start = performance.now();
  for (let i = 0; i < 100; i++) selectCards(fixture, i % 2 ? 'elf' : '', 'All', 'mana');
  const average = (performance.now() - start) / 100;
  console.log(`Filter/sort average: ${average.toFixed(2)} ms on a 100-entry fixture`);
  assert.ok(average < 100);
});
