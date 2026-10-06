import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { families, loadCache, loadDeck } from '../src/lib/decks.ts';

const cache = loadCache();
const home = readFileSync(resolve('dist/index.html'), 'utf8');
for (const family of families) {
  assert.ok(home.includes(`/decks/${family.id}/${family.defaultVersion}/`));
  for (const snapshot of family.versions) {
    const deck = loadDeck(family, snapshot.version, cache);
    const html = readFileSync(resolve(`dist/decks/${family.id}/${snapshot.version}/index.html`), 'utf8');
    // These elements must be present in the HTML before any client JavaScript runs.
    assert.equal((html.match(/class="card-tile(?:\s|")/g) ?? []).length, deck.cards.length);
    assert.equal((html.match(/class="commander-preview(?:\s|")/g) ?? []).length, 1);
    assert.ok(html.includes('The ninety-nine'));
    assert.ok(html.includes(deck.snapshot.status));
    assert.equal(readFileSync(resolve(`dist/exports/${family.id}-${snapshot.version}.txt`), 'utf8'), deck.exportText);
  }
}
assert.ok(readFileSync(resolve('dist/404.html'), 'utf8').includes('No deck at this address.'));
console.log('Static HTML includes every deck before hydration; all eight text exports match their sources.');
