import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Cloudflare ships only static assets and scopes the custom hostname to production', () => {
  const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
  assert.equal(config.name, 'magics-viewer');
  assert.equal(config.workers_dev, true);
  assert.equal(config.main, undefined);
  assert.deepEqual(config.assets, {
    directory: './dist',
    html_handling: 'auto-trailing-slash',
    not_found_handling: '404-page',
  });
  assert.deepEqual(config.routes, [{ pattern: 'magics.zapalsky.com', custom_domain: true }]);
  // Native Worker Previews share top-level assets but not production routes.
  assert.deepEqual(config.previews, {});
  for (const binding of ['kv_namespaces', 'r2_buckets', 'd1_databases', 'durable_objects', 'containers']) {
    assert.equal(config[binding], undefined);
  }
});
