import type { CardMetadata, DisplayCard } from './types.ts';

export type BinderSection = 'Heroes' | 'Allies & Supporting Cast' | 'Villains';
export type BinderStatus = 'owned' | 'missing';
export interface BinderEntry {
  slot: number;
  section: BinderSection;
  name: string;
  set: 'SPM' | 'SPE';
  collectorNumber: string;
  rarity: string;
  status: BinderStatus;
  placeholder: 'printed' | 'label' | null;
  observedCollectorNumber: string | null;
}
export interface GalleryEntry {
  slot: number;
  name: string;
  set: 'SPM' | 'MAR';
  collectorNumber: string;
  status: 'owned';
}
export interface BinderInventory {
  schemaVersion: 1;
  title: string;
  updatedAt: string;
  verifiedAt: string;
  evidence: { source: string; kind: string; coverage: string; limits: string };
  rules: {
    mainSet: 'SPM'; mainTarget: 79; optionalSet: 'SPE'; optionalSlots: 14;
    pocketsPerPage: 4; galleryPages: 2; artworkPreference: string[];
    oneDisplayCopyPerName: true; marCharacterReprintsIncluded: false;
  };
  gallery: GalleryEntry[];
  entries: BinderEntry[];
}
export interface BinderCard extends DisplayCard {
  page: number;
  pocket: number;
  characterSlot: number | null;
  section: BinderSection | 'Gallery' | 'Scene extras';
  status: BinderStatus;
  placeholder: BinderEntry['placeholder'];
  rarity: string;
  sceneId?: string;
  sceneTitle?: string;
  availability?: 'owned' | 'proxy' | 'ordered';
  identityStatus?: BinderStatus;
}
export interface SceneCard {
  name: string; set: 'SPM' | 'SPE'; collectorNumber: string;
  characterSlot?: number; gallerySlot?: number;
  row: number; column: number; page: number; pocket: number;
  availability: 'owned' | 'proxy' | 'ordered'; faceIndex: number;
}
export interface BinderScene {
  id: string; title: string; rows: number; columns: number;
  arrangement: 'spread' | 'sequence';
  source: string; sourceImage?: string; note: string; cards: SceneCard[];
}
export interface BinderScenePlan {
  schemaVersion: 1; title: string; status: 'planned'; plannedAt: string;
  pageCount: number; characterStartPage: number; characterStartPocket: number;
  gallery: { slot: number; page: number; pocket: number }[];
  scenes: BinderScene[];
}
export interface BinderPage { number: number; sections: string[]; pockets: (BinderCard | null)[] }
export interface BinderFilters {
  query: string;
  status: 'all' | BinderStatus;
  set: 'all' | 'SPM' | 'SPE' | 'Gallery' | 'Scenes';
}

export function binderStats(inventory: BinderInventory) {
  const main = inventory.entries.filter(card => card.set === 'SPM');
  const bonus = inventory.entries.filter(card => card.set === 'SPE');
  const mainOwned = main.filter(card => card.status === 'owned').length;
  const bonusOwned = bonus.filter(card => card.status === 'owned').length;
  return {
    mainOwned, mainTarget: inventory.rules.mainTarget, mainMissing: main.length - mainOwned,
    bonusOwned, bonusReserved: bonus.length - bonusOwned,
    owned: mainOwned + bonusOwned, slots: inventory.entries.length,
    missing: inventory.entries.filter(card => card.status === 'missing').length,
    percent: Math.round(mainOwned / inventory.rules.mainTarget * 100),
  };
}

export function printingKey(set: string, collectorNumber: string) {
  return `${set.toLowerCase()}/${collectorNumber}`;
}

export function referencePrinting(card: { collectorNumber: string; observedCollectorNumber?: string | null }) {
  return card.observedCollectorNumber
    ? card.observedCollectorNumber : card.collectorNumber;
}

const fold = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').replaceAll('’', "'").toLowerCase();

export function matchesBinderCard(card: BinderCard, filters: BinderFilters): boolean {
  if (filters.status !== 'all' && card.status !== filters.status) return false;
  if (filters.set === 'Gallery' && card.section !== 'Gallery') return false;
  if (filters.set === 'Scenes' && !card.sceneId) return false;
  if ((filters.set === 'SPM' || filters.set === 'SPE') &&
      (card.characterSlot === null || card.set?.toUpperCase() !== filters.set)) return false;
  const needle = fold(filters.query.trim());
  return !needle || fold(`${card.name} ${card.metadata.faces.map(face => face.name).join(' ')} ${card.section}`).includes(needle);
}

export function makeBinderPages(cards: BinderCard[], pageCount: number): BinderPage[] {
  return Array.from({ length: pageCount }, (_, index) => {
    const number = index + 1;
    const onPage = cards.filter(card => card.page === number);
    return { number, sections: [...new Set(onPage.map(card => card.section))],
      pockets: Array.from({ length: 4 }, (_, pocket) => onPage.find(card => card.pocket === pocket + 1) ?? null) };
  });
}

export function displayBinderCard(card: BinderEntry | GalleryEntry, metadata: CardMetadata): BinderCard {
  const gallery = !('section' in card);
  return {
    key: `${gallery ? 'gallery' : 'character'}-${card.slot}`, quantity: 1,
    name: card.name, set: card.set.toLowerCase(), collectorNumber: metadata.collectorNumber, metadata,
    page: Math.ceil(card.slot / 4) + (gallery ? 0 : 2), pocket: (card.slot - 1) % 4 + 1,
    characterSlot: gallery ? null : card.slot, section: gallery ? 'Gallery' : card.section,
    status: card.status, placeholder: gallery ? null : card.placeholder, rarity: gallery ? '' : card.rarity,
  };
}
