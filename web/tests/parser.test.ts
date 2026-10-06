import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDeck, exportDeck, cardKey } from '../src/lib/parser.ts';

const deck = (commander: string, entries: string, headings = ['Commander', 'Deck']) => `${headings[0]}\n1 ${commander}\n\n${headings[1]}\n${entries}`;

test('canonical headings, CRLF, BOM, repeated basics, exact quantities', () => {
  const parsed = parseDeck(`\uFEFF${deck('Lathril, Blade of the Elves', '98 Forest\n1 Sol Ring', ['// COMMANDER', '// DECK']).replaceAll('\n', '\r\n')}`);
  assert.equal(parsed.entries[0].quantity, 98);
  assert.equal(parsed.commander.name, 'Lathril, Blade of the Elves');
  assert.deepEqual(parseDeck(exportDeck(parsed)), parsed);
});

test('printing suffixes, zero collector placeholders, foil, and A- names', () => {
  const parsed = parseDeck(deck('Sephiroth, Fabled SOLDIER (FIN) 115', '97 Swamp (ANB) 116\n1 A-Harald, King of Skemfar (KHM) 212\n1 Paradise Druid (SPG) 0 *F*'));
  assert.deepEqual(parsed.entries[2], { quantity: 1, name: 'Paradise Druid', set: 'spg', collectorNumber: '0', foil: true });
  assert.equal(parsed.entries[1].name, 'A-Harald, King of Skemfar');
  assert.deepEqual(parseDeck(exportDeck(parsed)), parsed);
});

test('double-faced full names and front-face names remain distinct source keys', () => {
  const parsed = parseDeck(deck('Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel', '99 Swamp'));
  assert.match(parsed.commander.name, / \/\/ /);
  assert.notEqual(cardKey(parsed.commander), cardKey({ quantity: 1, name: 'Sephiroth, Fabled SOLDIER' }));
});

test('reject malformed lines, unknown sections, wrong totals and commanders', () => {
  for (const text of ['1 Lathril\n99 Forest', deck('Lathril', '98 Forest'), deck('Lathril', '99 Forest\nSideboard'), deck('Lathril', '0 Forest\n99 Swamp'), 'Commander\n2 Lathril\nDeck\n99 Forest']) {
    assert.throws(() => parseDeck(text));
  }
});
