import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { families, loadCache, loadCover, loadDeck } from '../src/lib/decks.ts';
import { CARD_VIEWS } from '../src/lib/card-utils.ts';
import { loadBinder, missingBinderText, sceneProxyText } from '../src/lib/binder.ts';

const cache = loadCache();
const home = readFileSync(resolve('dist/index.html'), 'utf8');
assert.equal((home.match(/class="deck-cover(?:\s|")/g) ?? []).length, families.length);
assert.ok(!home.includes('data-deck-choice'));
assert.ok(!home.includes('data-deck-pair'));
assert.ok(!home.includes('shared cards'));
assert.ok(!home.includes('Paper to Arena substitutions'));
assert.ok(home.includes('aria-label="Deck platform"'));
for (const platform of ['all', 'paper', 'arena']) assert.ok(home.includes(`data-deck-filter="${platform}"`));
for (const family of families) {
  assert.ok(home.includes(`/decks/${family.id}/${family.defaultVersion}/`));
  assert.ok(home.includes(`data-deck-medium="${family.medium.toLowerCase()}"`));
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
    assert.ok(html.includes('Scroll sideways to see more cards'));
    assert.ok(html.includes('Swipe to see more cards'));
    assert.ok(html.includes('aria-label="Scroll to previous column"'));
    assert.ok(html.includes('aria-label="Scroll to next column"'));
    assert.ok(html.includes('id="mana-columns"'));
    assert.ok(!html.includes('jump-special'));
    assert.ok(html.includes(deck.snapshot.status));
    assert.equal(readFileSync(resolve(`dist/exports/${family.id}-${snapshot.version}.txt`), 'utf8'), deck.exportText);
  }
}
// Each family has its own destination and chosen commander printing.
const homeFamilies = families;
const covers = [...home.matchAll(/<(?:div|span)[^>]*class="cover-art"[^>]*>([\s\S]*?)<\/(?:div|span)>/g)].map(match => match[1]);
assert.equal(covers.length, homeFamilies.length);
for (const [index, family] of homeFamilies.entries()) {
  const image = loadCover(loadDeck(family, family.defaultVersion, cache), cache).faces[0].images?.artCrop;
  if (image) assert.ok(covers[index].includes(image), `Incorrect home artwork: ${family.id}`);
}
assert.ok(readFileSync(resolve('dist/404.html'), 'utf8').includes('No deck at this address.'));
const snapshotCount = families.reduce((count, family) => count + family.versions.length, 0);
const binder = loadBinder();
const binderHtml = readFileSync(resolve('dist/collections/spider-man/index.html'), 'utf8');
assert.ok(home.includes('href="/collections/spider-man/"'));
assert.equal((binderHtml.match(/data-binder-page="/g) ?? []).length, binder.scenePlan.pages.length);
assert.equal((binderHtml.match(/data-binder-slot="/g) ?? []).length, binder.scenePlan.cards.length);
assert.equal((binderHtml.match(/class="scene-grid(?:\s|")/g) ?? []).length, 2);
assert.ok(binderHtml.includes('Both scenes · proposed'));
assert.ok(binderHtml.includes('Video-verified layout'));
assert.ok(binderHtml.includes('data-binder-slot="93"'));
for (const card of binder.scenePlan.cards) assert.ok(binderHtml.includes(`data-binder-slot="${card.characterSlot ?? card.key}"`));
for (const set of ['SPM', 'SPE'] as const) assert.equal(readFileSync(resolve(`dist/exports/spider-man-${set.toLowerCase()}.txt`), 'utf8'), missingBinderText(set));
assert.equal(readFileSync(resolve('dist/exports/spider-man-scenes.txt'), 'utf8'), sceneProxyText());
assert.equal(readFileSync(resolve('../collections/spider-man/scene-proxies.txt'), 'utf8'), sceneProxyText());
console.log(`Static HTML includes every deck before hydration; all ${snapshotCount} text exports match their sources.`);
assert.equal((binderHtml.match(/class="empty-pocket(?:\s|")/g) ?? []).length, 0);
console.log('Static binder includes both scenes, all 104 planned entries, 26 full page sides and all three exact character/scene exports before hydration.');
