import type { DeckEntry, ParsedDeck } from './types.ts';

export function normalizeName(name: string): string {
  return name.normalize('NFC').replaceAll('’', "'").trim();
}

export function cardKey(entry: DeckEntry): string {
  return JSON.stringify([normalizeName(entry.name), entry.set ?? null, entry.collectorNumber ?? null]);
}

export function parseDeck(text: string): ParsedDeck {
  let section: 'commander' | 'deck' | undefined;
  const commander: DeckEntry[] = [];
  const entries: DeckEntry[] = [];
  for (const [index, raw] of text.replace(/^\uFEFF/, '').split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    const heading = /^(?:\/\/\s*)?(commander|deck)$/i.exec(line);
    if (heading) {
      section = heading[1].toLowerCase() as 'commander' | 'deck';
      continue;
    }
    if (line.startsWith('//')) continue;
    const match = /^(\d+)\s+(.+)$/.exec(line);
    if (!match || !section) throw new Error(`Invalid deck line ${index + 1}: ${line}`);
    const quantity = Number(match[1]);
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error(`Invalid quantity on line ${index + 1}`);
    let name = match[2];
    const printing = /\s+\(([a-z0-9]{2,6})\)\s+(\S+?)(\s+\*F\*)?$/i.exec(name);
    const entry: DeckEntry = { quantity, name: '' };
    if (printing) {
      name = name.slice(0, printing.index);
      entry.set = printing[1].toLowerCase();
      entry.collectorNumber = printing[2];
      if (printing[3]) entry.foil = true;
    } else if (name.endsWith(' *F*')) {
      name = name.slice(0, -4);
      entry.foil = true;
    }
    entry.name = name.normalize('NFC').trim();
    (section === 'commander' ? commander : entries).push(entry);
  }
  if (commander.length !== 1 || commander[0].quantity !== 1) throw new Error('Expected exactly one commander');
  if (entries.reduce((sum, entry) => sum + entry.quantity, 0) !== 99) throw new Error('Expected exactly 99 main-deck cards');
  return { commander: commander[0], entries };
}

export function exportDeck(deck: ParsedDeck): string {
  const line = (entry: DeckEntry) => `${entry.quantity} ${entry.name}${entry.set ? ` (${entry.set.toUpperCase()}) ${entry.collectorNumber}` : ''}${entry.foil ? ' *F*' : ''}`;
  return `Commander\n${line(deck.commander)}\n\nDeck\n${deck.entries.map(line).join('\n')}\n`;
}
