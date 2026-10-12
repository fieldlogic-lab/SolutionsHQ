import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webAppManifest } from '../lib/pwa/manifest.ts';

test('installed app stays in the same origin and standalone scope', () => {
  assert.equal(webAppManifest.id, '/');
  assert.equal(webAppManifest.start_url, '/');
  assert.equal(webAppManifest.scope, '/');
  assert.equal(webAppManifest.display, 'standalone');
  assert.equal(webAppManifest.prefer_related_applications, false);
});

test('installation icons are actual PNGs matching advertised dimensions', async () => {
  for (const icon of webAppManifest.icons) {
    const bytes = await readFile(new URL(`../public${icon.src}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    const dimensions = `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
    assert.equal(dimensions, icon.sizes);
  }
  assert.ok(webAppManifest.icons.some(icon => icon.purpose === 'maskable'));
});
