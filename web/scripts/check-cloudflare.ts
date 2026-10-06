import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { families, loadCache, loadDeck } from '../src/lib/decks.ts';

// Deliberately local-only: this check never publishes or probes a remote account.
const origin = 'http://127.0.0.1:8787';
const cache = loadCache();
let requests = 0;

async function request(path: string, expectedStatus = 200): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(new URL(path, origin), {
      redirect: 'manual', signal: AbortSignal.timeout(5000),
    });
  } catch (cause) {
    throw new Error('Cloudflare preview unavailable. Build first, then run pnpm preview:cloudflare in another terminal.', { cause });
  }
  assert.equal(response.status, expectedStatus, `${path}: HTTP status`);
  requests++;
  return response;
}

function securityHeaders(response: Response): void {
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  const policy = response.headers.get('content-security-policy') ?? '';
  assert.ok(policy.includes("connect-src 'self'"));
  assert.ok(policy.includes('https://cards.scryfall.io'));
  assert.ok(policy.includes('https://media.wizards.com'));
  assert.ok(policy.includes("frame-ancestors 'none'"));
}

const homeResponse = await request('/');
securityHeaders(homeResponse);
assert.match(homeResponse.headers.get('content-type') ?? '', /text\/html/);
const home = await homeResponse.text();
let snapshots = 0;
for (const family of families) {
  assert.ok(home.includes(`/decks/${family.id}/${family.defaultVersion}/`));
  for (const snapshot of family.versions) {
    const deck = loadDeck(family, snapshot.version, cache);
    const path = `/decks/${family.id}/${snapshot.version}/`;
    const response = await request(path);
    securityHeaders(response);
    const html = await response.text();
    assert.equal((html.match(/class="stack-card(?:\s|")/g) ?? []).length, deck.cards.length);
    assert.ok(html.includes(deck.snapshot.status));
    const exported = await request(`/exports/${family.id}-${snapshot.version}.txt`);
    securityHeaders(exported);
    assert.equal(await exported.text(), deck.exportText);
    const redirect = await request(path.slice(0, -1), 307);
    const location = redirect.headers.get('location');
    assert.ok(location);
    assert.equal(new URL(location, origin).pathname, path);
    snapshots++;
  }
}

const asset = readdirSync(new URL('../dist/_astro/', import.meta.url)).find(file => file.endsWith('.js'));
assert.ok(asset, 'Expected a hashed client JavaScript asset');
const assetResponse = await request(`/_astro/${asset}`);
securityHeaders(assetResponse);
assert.match(assetResponse.headers.get('content-type') ?? '', /(?:text|application)\/javascript/);
assert.match(assetResponse.headers.get('cache-control') ?? '', /max-age=31536000/);
assert.match(assetResponse.headers.get('cache-control') ?? '', /immutable/);

for (const path of ['/not-a-deck/', '/AGENTS.md', '/.env', '/_headers']) {
  const response = await request(path, 404);
  securityHeaders(response);
  assert.ok((await response.text()).includes('No deck at this address.'));
}

console.log(`Cloudflare local smoke check passed: ${snapshots} deck routes/exports, redirects, true 404s, security and cache headers (${requests} requests). Nothing published.`);
