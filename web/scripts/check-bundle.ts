import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const dir = new URL('../dist/_astro/', import.meta.url);
const files = readdirSync(dir).filter(file => file.endsWith('.js'));
const total = files.reduce((sum, file) => sum + gzipSync(readFileSync(join(dir.pathname, file))).length, 0);
console.log(`All JavaScript bundles combined: ${(total / 1024).toFixed(1)} KiB gzip (budget: 100 KiB).`);
if (total > 100 * 1024) throw new Error('JavaScript budget exceeded');
