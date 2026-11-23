import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const base = readFileSync(resolve(root, 'resources/css/app.css'), 'utf8');
const system = readFileSync(resolve(root, 'resources/css/rademan.css'), 'utf8');
const entry = readFileSync(resolve(root, 'resources/js/app.jsx'), 'utf8');

function walk(directory) {
    return readdirSync(directory).flatMap((name) => {
        const path = resolve(directory, name);
        return statSync(path).isDirectory() ? walk(path) : [path];
    });
}

const sources = [
    ...walk(resolve(root, 'resources/js')).filter((path) => ['.js', '.jsx'].includes(extname(path))),
    ...walk(resolve(root, 'resources/views')).filter((path) => path.endsWith('.blade.php')),
];
const stylesheetFiles = walk(resolve(root, 'resources')).filter((path) => extname(path) === '.css');

test('the new design foundation is loaded once and the old adapter architecture is gone', () => {
    assert.ok(entry.includes("import '../css/rademan.css';"));
    assert.ok(!entry.includes('instagram.css'));
    assert.ok(!entry.includes('application-shell.css'));
    assert.ok(base.includes('--rd-canvas:#fafafa'));
    assert.ok(base.includes(":root[data-theme='dark']"));
    assert.ok(system.includes('Rademan app-first component language'));
    assert.equal(stylesheetFiles.some((path) => path.endsWith('instagram.css')), false);
    assert.equal(stylesheetFiles.some((path) => path.endsWith('application-shell.css')), false);
});

test('the complete presentation surface is discovered for design-system coverage', () => {
    const paths = sources.map((path) => relative(root, path).replace(/\\/g, '/'));
    assert.ok(paths.includes('resources/js/app/AppRouter.jsx'));
    assert.ok(paths.includes('resources/js/app/HomePage.jsx'));
    assert.ok(paths.includes('resources/js/app/ArtworkCatalogue.jsx'));
    assert.ok(paths.includes('resources/js/app/ArtistProfilePage.jsx'));
    assert.ok(paths.includes('resources/js/app/MessagingCenter.jsx'));
    assert.ok(paths.includes('resources/js/components/ui/primitives.jsx'));
    assert.ok(paths.includes('resources/views/app.blade.php'));
});

test('the new app shell defines responsive rails, mobile tabs, standalone safe areas and shared page primitives', () => {
    for (const contract of ['public-navigation-rail', 'authenticated-bottom-navigation', 'data-ui=workspace-hero', 'data-ui=surface', 'data-ui=metric', '@media(min-width:1280px)', '@media(max-width:767px)', 'env(safe-area-inset-bottom)', 'display-mode:standalone']) {
        assert.ok(system.includes(contract), 'Missing shell contract ' + contract);
    }
});

test('the design system remains semantic and avoids deprecated palette shade utilities', () => {
    const forbidden = /(?:^|[\s'"\x60])(?:[a-z][\w-]*:)*(?:bg|text|border|ring)-(?:red|green|blue|amber|emerald|orange|yellow|purple|pink|indigo|cyan|teal|lime|sky|rose|violet|fuchsia|stone|zinc|gray|slate|neutral)-\d{2,3}/g;
    const violations = sources.flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return [...source.matchAll(forbidden)].map((match) => relative(root, path) + ': ' + match[0]);
    });
    assert.deepEqual(violations, []);
    const retiredVocabulary = /(?:--color-(?:terracotta|sand|olive)|\b(?:bg|text|border)-(?:terracotta|sand|olive)(?:-strong)?\b)/;
    for (const path of sources) {
        assert.doesNotMatch(readFileSync(path, 'utf8'), retiredVocabulary, relative(root, path) + ' still contains retired design tokens.');
    }
    const tailwind = readFileSync(resolve(root, 'tailwind.config.js'), 'utf8');
    assert.doesNotMatch(tailwind, /editorial-(?:1|2|3|4|5|6|8|10|12|16|20|24)/);
});

test('the app shell preserves Blade PWA metadata and reduced-motion behavior', () => {
    const blade = readFileSync(resolve(root, 'resources/views/app.blade.php'), 'utf8');
    assert.match(blade, /rel="manifest" href="\\/manifest\\.webmanifest"/);
    assert.match(blade, /apple-mobile-web-app-capable/);
    assert.ok(base.includes('prefers-reduced-motion:reduce'));
});
