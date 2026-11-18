import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBinder, missingBinderText, readBinderInventory, validateBinderInventory } from '../src/lib/binder.ts';
import { binderStats, matchesBinderCard } from '../src/lib/binder-utils.ts';

test('the verified binder keeps the main target, bonus scope and gallery separate', () => {
  const { inventory, stats, cards, pages } = loadBinder();
  assert.deepEqual(stats, { mainOwned: 60, mainTarget: 79, mainMissing: 19, bonusOwned: 8,
    bonusReserved: 6, owned: 68, slots: 93, missing: 25, percent: 76 });
  assert.equal(inventory.evidence.source, 'IMG_8150.MOV');
  assert.equal(cards.length, 101); // Eight gallery cards, including two Passage printings.
  assert.equal(pages.length, 26);
  assert.deepEqual(pages[25].pockets.map(card => card?.name ?? null), ['Vulture, Scheming Scavenger', null, null, null]);
  assert.equal(new Set(cards.filter(card => card.characterSlot !== null).map(card => card.metadata.oracleId)).size, 93);
  assert.equal(cards.filter(card => card.name === 'Multiversal Passage').length, 2);
});

test('SPE spaces and the gallery offset preserve physical pocket coordinates', () => {
  const { cards } = loadBinder();
  for (const [slot, page, pocket] of [[2, 3, 2], [4, 3, 4], [44, 13, 4], [53, 16, 1], [60, 17, 4], [65, 19, 1]]) {
    const card = cards.find(card => card.characterSlot === slot)!;
    assert.equal(card.page, page); assert.equal(card.pocket, pocket);
    assert.equal(card.status, 'missing'); assert.equal(card.placeholder, 'label');
  }
  assert.equal(cards.find(card => card.key === 'gallery-8')!.page, 2);
  assert.equal(cards.find(card => card.key === 'gallery-8')!.pocket, 4);
});

test('filters distinguish bonuses from main cards and keep original slot numbers', () => {
  const { cards } = loadBinder();
  const select = (status: 'all' | 'owned' | 'missing', set: 'all' | 'SPM' | 'SPE' | 'Gallery', query = '') =>
    cards.filter(card => matchesBinderCard(card, { status, set, query }));
  assert.equal(select('all', 'SPM').length, 79);
  assert.equal(select('all', 'SPE').length, 14);
  assert.equal(select('all', 'Gallery').length, 8);
  assert.equal(select('owned', 'all').length, 76);
  assert.deepEqual(select('missing', 'SPE').map(card => card.characterSlot), [2, 4, 44, 53, 60, 65]);
  assert.equal(select('all', 'SPM', 'ghost-spider').length, 1);
  assert.equal(select('all', 'SPM', 'arana').length, 1);
  assert.equal(select('missing', 'Gallery').length, 0);
});

test('acquiring a bonus leaves the mandatory progress and every slot unchanged', () => {
  const inventory = structuredClone(readBinderInventory());
  const before = inventory.entries.map(card => [card.slot, card.name]);
  inventory.entries[1].status = 'owned'; inventory.entries[1].placeholder = null;
  validateBinderInventory(inventory);
  assert.equal(binderStats(inventory).mainOwned, 60);
  assert.equal(binderStats(inventory).bonusOwned, 9);
  assert.deepEqual(inventory.entries.map(card => [card.slot, card.name]), before);
});

test('duplicate identities, reordered slots and treating proxies as owned fail validation', () => {
  const duplicate = structuredClone(readBinderInventory()); duplicate.entries[1].name = duplicate.entries[0].name;
  assert.throws(() => validateBinderInventory(duplicate), /Duplicate binder character/);
  const moved = structuredClone(readBinderInventory()); moved.entries[0].slot = 2;
  assert.throws(() => validateBinderInventory(moved), /consecutive/);
  const proxy = structuredClone(readBinderInventory()); proxy.entries[0].status = 'owned';
  assert.throws(() => validateBinderInventory(proxy), /ownership\/placeholder/);
});

test('missing exports include only missing names, use zeros and retain double-faced names', () => {
  const main = missingBinderText('SPM');
  assert.equal(main.trim().split('\n').length, 19);
  assert.ok(main.includes('1 Peter Parker // Amazing Spider-Man (SPM) 0010'));
  assert.ok(!main.includes('Spider-Byte')); assert.ok(!main.includes('Shocker'));
  const bonus = missingBinderText('SPE');
  assert.equal(bonus.trim().split('\n').length, 6);
  for (const number of ['0004', '0025', '0003', '0023', '0022', '0024']) assert.ok(bonus.includes(`(SPE) ${number}\n`));
});
