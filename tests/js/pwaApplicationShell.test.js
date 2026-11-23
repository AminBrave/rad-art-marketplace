import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'));
const worker = readFileSync(resolve(root, 'public/sw.js'), 'utf8');
const entry = readFileSync(resolve(root, 'resources/js/app.jsx'), 'utf8');
const blade = readFileSync(resolve(root, 'resources/views/app.blade.php'), 'utf8');

test('PWA manifest declares a Persian RTL standalone application', () => {
    assert.equal(manifest.lang, 'fa');
    assert.equal(manifest.dir, 'rtl');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.start_url, '/');
    assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192' && icon.type === 'image/png'));
    assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose.includes('maskable')));
});

test('PWA worker never caches private navigation or API responses', () => {
    assert.match(worker, /url\.pathname\.startsWith\('\/api\/'\)/);
    assert.match(worker, /request\.mode === 'navigate'/);
    assert.match(worker, /caches\.match\('\/offline\.html'\)/);
    assert.match(worker, /APP_SHELL = \[[^\]]*offline\.html/);
    assert.ok(worker.includes('pwa-icon-192.png'));
    assert.ok(worker.includes('pwa-icon-512.png'));
    assert.match(worker, /versionedAsset = url\.pathname\.startsWith\('\/build\/'\)/);
    assert.doesNotMatch(worker, /cache\.put\(request, copy\)[\s\S]*request\.mode === 'navigate'/);
});

test('PWA is linked from Blade and registered by the production entrypoint', () => {
    assert.match(blade, /rel="manifest" href="\/manifest\.webmanifest"/);
    assert.match(blade, /apple-mobile-web-app-capable/);
    assert.match(blade, /apple-touch-icon" sizes="192x192" href="\\/pwa-icon-192\\.png"/);
    assert.match(entry, /navigator\.serviceWorker\.register\('\/sw\.js'/);
});
