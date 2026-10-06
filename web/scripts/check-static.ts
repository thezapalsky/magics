import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { families, loadCache, loadCover, loadDeck } from '../src/lib/decks.ts';
import { CARD_VIEWS } from '../src/lib/card-utils.ts';

const cache = loadCache();
const home = readFileSync(resolve('dist/index.html'), 'utf8');
for (const family of families) {
  assert.ok(home.includes(`/decks/${family.id}/${family.defaultVersion}/`));
  const cover = loadCover(loadDeck(family, family.defaultVersion, cache), cache);
  if (cover.faces[0].images?.artCrop) assert.ok(home.includes(cover.faces[0].images.artCrop));
  for (const snapshot of family.versions) {
    const deck = loadDeck(family, snapshot.version, cache);
    const html = readFileSync(resolve(`dist/decks/${family.id}/${snapshot.version}/index.html`), 'utf8');
    // These elements must be present in the HTML before any client JavaScript runs.
    assert.equal((html.match(/class="stack-card(?:\s|")/g) ?? []).length, deck.cards.length);
    assert.equal((html.match(/class="commander-preview(?:\s|")/g) ?? []).length, 1);
    assert.ok(html.includes('Card layout'));
    const controls = html.slice(html.indexOf('aria-label="Card layout"'), html.indexOf('aria-label="Card layout"') + 900);
    assert.ok(controls.includes('aria-pressed="true"'));
    const positions = CARD_VIEWS.map(view => controls.indexOf(`>${view.label}</button>`));
    assert.ok(positions.every((position, index) => position >= 0 && (!index || position > positions[index - 1])));
    assert.ok(html.includes('id="mana-lands"'));
    assert.ok(html.includes(deck.snapshot.status));
    assert.equal(readFileSync(resolve(`dist/exports/${family.id}-${snapshot.version}.txt`), 'utf8'), deck.exportText);
  }
}
const covers = [...home.matchAll(/class="cover-art"[^>]*>([\s\S]*?)<\/div>/g)].map(match => match[1]);
assert.equal(covers.length, families.length);
for (const [index, family] of families.entries()) {
  const image = loadCover(loadDeck(family, family.defaultVersion, cache), cache).faces[0].images?.artCrop;
  if (image) assert.ok(covers[index].includes(image), `Incorrect home artwork: ${family.id}`);
}
assert.ok(readFileSync(resolve('dist/404.html'), 'utf8').includes('No deck at this address.'));
const snapshotCount = families.reduce((count, family) => count + family.versions.length, 0);
console.log(`Static HTML includes every deck before hydration; all ${snapshotCount} text exports match their sources.`);
