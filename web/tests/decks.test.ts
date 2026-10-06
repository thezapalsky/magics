import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { families, loadCache, loadDeck, readSource } from '../src/lib/decks.ts';
import { exportDeck, parseDeck } from '../src/lib/parser.ts';
import { CARD_VIEWS, DEFAULT_CARD_VIEW, groupBasicCopies, groupByMana, isCardView, isLand, selectCards } from '../src/lib/card-utils.ts';

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

test('mana columns preserve every card and quantity, with X at zero and lands last', () => {
  const deck = loadDeck(families[0], families[0].defaultVersion);
  const groups = groupByMana(selectCards(deck.cards));
  assert.equal(groups.at(-1)!.id, 'lands');
  assert.equal(groups.reduce((sum, group) => sum + group.quantity, 0), 99);
  assert.equal(groups.reduce((sum, group) => sum + group.cards.length, 0), deck.cards.length);
  // Celestial Reunion is XG: X contributes zero, while G contributes one.
  assert.ok(groups.find(group => group.id === '1')!.cards.some(card => card.name === 'Celestial Reunion'));
  const zeroMana = { ...deck.cards[0], metadata: { ...deck.cards[0].metadata, manaValue: 0 } };
  assert.equal(groupByMana([zeroMana])[0].id, '0');
  assert.ok(groups.at(-1)!.cards.every(isLand));
  assert.deepEqual(groupByMana([]), []);
});

test('only supported card layouts may be restored from browser storage', () => {
  assert.equal(DEFAULT_CARD_VIEW, 'stacks');
  assert.deepEqual(CARD_VIEWS.map(view => view.id), ['stacks', 'browse', 'grid']);
  for (const mode of ['grid', 'stacks', 'browse']) assert.ok(isCardView(mode));
  for (const mode of [null, '', 'unknown', 1, {}]) assert.equal(isCardView(mode), false);
});

test('no-cost spells have a trailing column, distinct from zero-mana spells and lands', () => {
  const deck = loadDeck(families[0], families[0].defaultVersion);
  const base = deck.cards.find(card => !isLand(card))!;
  const withCost = (name: string, manaCost: string) => ({ ...base, name, key: name,
    metadata: { ...base.metadata, manaValue: 0, faces: [{ ...base.metadata.faces[0], manaCost }] } });
  const noCost = withCost('No-cost fixture', '');
  const zero = withCost('Zero-mana fixture', '{0}');
  const x = withCost('X-only fixture', '{X}');
  const forest = deck.cards.find(card => card.name === 'Forest')!;
  const groups = groupByMana([forest, noCost, zero, x, base]);
  assert.deepEqual(groups.map(group => group.id), ['0', String(base.metadata.manaValue), 'no-cost', 'lands']);
  assert.deepEqual(groups[0].cards.map(card => card.name), [zero.name, x.name]);
  assert.equal(groups.at(-2)!.label, 'No mana cost');
  assert.equal(groups.at(-1)!.quantity, forest.quantity);
  for (const family of families) for (const version of family.versions) {
    const snapshot = loadDeck(family, version.version);
    const columns = groupByMana(selectCards(snapshot.cards));
    assert.equal(columns.reduce((sum, column) => sum + column.quantity, 0), 99);
    assert.equal(columns.at(-1)!.quantity, snapshot.landCount);
  }
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
