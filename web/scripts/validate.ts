import { families, loadCache, loadCover, loadDeck, readSource } from '../src/lib/decks.ts';
import { parseDeck } from '../src/lib/parser.ts';

const cache = loadCache();
const ids = new Set<string>();
let versions = 0;
for (const family of families) {
  if (!/^[a-z0-9-]+$/.test(family.id) || ids.has(family.id)) throw new Error(`Invalid or duplicate deck ID ${family.id}`);
  ids.add(family.id);
  if (!family.versions.some(item => item.version === family.defaultVersion)) throw new Error(`Missing default version: ${family.id}`);
  loadCover(loadDeck(family, family.defaultVersion, cache), cache);
  const seen = new Set<string>();
  for (const snapshot of family.versions) {
    if (!/^\d+\.\d+(?:\.\d+)?$/.test(snapshot.version) || seen.has(snapshot.version)) throw new Error(`Invalid or duplicate version: ${family.id}/${snapshot.version}`);
    seen.add(snapshot.version);
    const deck = loadDeck(family, snapshot.version, cache);
    const identity = (name: string) => name.normalize('NFC').replaceAll('’', "'");
    for (const card of [deck.commander, ...deck.cards]) {
      const wanted = identity(card.name);
      const actual = identity(card.metadata.name);
      if (wanted !== actual && wanted !== actual.split(' // ')[0]) throw new Error(`Incorrect card identity: ${card.name}`);
      if (!card.metadata.faces.length || card.metadata.faces.some(face => !face.name || !face.typeLine)) throw new Error(`Incomplete metadata: ${card.name}`);
      if (card.metadata.colorIdentity.some(color => !deck.commander.metadata.colorIdentity.includes(color))) throw new Error(`Color identity mismatch: ${card.name}`);
    }
    console.log(`${family.id}/${snapshot.version}: ${deck.total} cards, ${deck.landCount} front-face lands (${snapshot.status})`);
    versions++;
  }
}
const signature = (deck: ReturnType<typeof parseDeck>) => JSON.stringify([deck.commander.name, ...deck.entries.map(card => `${card.quantity} ${card.name}`).sort()]);
for (const release of [
  { id: 'paper-lathril', canonical: 'decks/lathril/decklist.txt', version: 'VERSION' },
  { id: 'paper-sacrifice', canonical: 'decks/sacrifice/decklist.txt', version: 'decks/sacrifice/VERSION' },
]) {
  const paper = families.find(item => item.id === release.id);
  if (!paper || paper.medium !== 'Paper') throw new Error(`Missing paper family: ${release.id}`);
  const current = parseDeck(readSource(paper.versions.find(item => item.version === paper.defaultVersion)!.source));
  if (signature(current) !== signature(parseDeck(readSource(release.canonical)))) throw new Error(`Published paper snapshot differs from the canonical release: ${release.id}`);
  if (readSource(release.version).trim() !== paper.defaultVersion) throw new Error(`Paper manifest default differs from ${release.version}`);
}
console.log(`Validated ${versions} snapshots; both paper defaults match their canonical lists and version files.`);
