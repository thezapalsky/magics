export interface DeckVersion {
  version: string;
  status: string;
  source: string;
  note: string;
}

export interface DeckFamily {
  id: string;
  title: string;
  subtitle: string;
  medium: 'Paper' | 'Arena';
  format: 'Commander' | 'Brawl';
  description: string;
  defaultVersion: string;
  coverPrinting?: { name: string; set: string; collectorNumber: string };
  versions: DeckVersion[];
}

export interface DeckEntry {
  quantity: number;
  name: string;
  set?: string;
  collectorNumber?: string;
  foil?: boolean;
}

export interface ParsedDeck {
  commander: DeckEntry;
  entries: DeckEntry[];
}

export interface CardFace {
  name: string;
  manaCost: string;
  typeLine: string;
  oracleText: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  images?: { small: string; normal: string; large: string; artCrop: string };
}

export interface CardMetadata {
  id: string;
  oracleId?: string;
  name: string;
  manaValue: number;
  colors: string[];
  colorIdentity: string[];
  set: string;
  collectorNumber: string;
  scryfallUrl: string;
  rulesSource?: string;
  digitalRebalanced?: boolean;
  faces: CardFace[];
}

export interface CardCache {
  schemaVersion: 1;
  updatedAt: string;
  cards: Record<string, CardMetadata>;
}

export interface DisplayCard extends DeckEntry {
  key: string;
  metadata: CardMetadata;
}

export interface LoadedDeck {
  family: DeckFamily;
  snapshot: DeckVersion;
  commander: DisplayCard;
  cards: DisplayCard[];
  exportText: string;
  total: number;
  landCount: number;
}
