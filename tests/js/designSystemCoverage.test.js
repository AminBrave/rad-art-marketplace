import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const css = readFileSync(resolve(root, 'resources/css/app.css'), 'utf8');
const tailwind = readFileSync(resolve(root, 'tailwind.config.js'), 'utf8');

function walk(directory) {
    return readdirSync(directory).flatMap((name) => {
        const path = resolve(directory, name);
        return statSync(path).isDirectory() ? walk(path) : [path];
    });
}

const frontendFiles = walk(resolve(root, 'resources/js'))
    .filter((path) => ['.js', '.jsx'].includes(extname(path)));
const bladeFiles = walk(resolve(root, 'resources/views'))
    .filter((path) => path.endsWith('.blade.php'));
const stylesheetFiles = walk(resolve(root, 'resources'))
    .filter((path) => extname(path) === '.css');
const presentationFiles = [...frontendFiles, ...bladeFiles].sort();
const rawPaletteClass = /(?:^|[\s'"\x60])(?:[a-z][\w-]*:)*(?:bg|text|border|ring|fill|stroke|shadow)-(?:red|green|blue|amber|emerald|orange|yellow|purple|pink|indigo|cyan|teal|lime|sky|rose|violet|fuchsia|stone|zinc|gray|slate|neutral)-\d{2,3}(?:\/\d{1,3})?(?=$|[\s'"\x60])/g;
const arbitraryHexClass = /\b(?:bg|text|border|ring|fill|stroke|shadow)-(?:\[[^\]]*#(?:[0-9a-f]{3,8})[^\]]*\])/gi;
const legacyClass = /\b(?:app-skeleton|rad-messaging|composer-shell|message-edit-shell|message-artwork-card__[\w-]*|related-artworks-(?:chip|strip)__[\w-]*|message-conversation-avatar-link)\b|\bra-[\w-]+/g;

function matchesWithLines(source, pattern) {
    return [...source.matchAll(pattern)].map((match) => ({
        line: source.slice(0, match.index).split('\n').length,
        value: match[0].trim(),
    }));
}

function describeViolations(pattern) {
    return presentationFiles.flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return matchesWithLines(source, pattern).map((match) => ({
            file: relative(root, path),
            ...match,
        }));
    });
}

test('design-system coverage discovers every frontend and Blade presentation source', () => {
    const relativePaths = presentationFiles.map((path) => relative(root, path).replace(/\\/g, '/'));
    assert.ok(frontendFiles.length > 0, 'Expected frontend source files to be discovered.');
    assert.ok(bladeFiles.length >= 1, 'Expected Blade presentation templates to be included.');
    assert.ok(relativePaths.includes('resources/js/app.jsx'));
    assert.ok(relativePaths.includes('resources/js/app/AppRouter.jsx'));
    assert.ok(relativePaths.includes('resources/js/components/ui/primitives.jsx'));
    assert.ok(relativePaths.includes('resources/views/app.blade.php'));
    assert.ok(relativePaths.includes('resources/views/sitemap.blade.php'));
});

test('every discovered presentation source avoids deprecated palette-shade utilities', () => {
    const violations = describeViolations(rawPaletteClass);
    assert.deepEqual(violations, [], 'Deprecated named palette shades found; use the Rademan semantic token layer.');
});

test('presentation sources do not embed hex colors in Tailwind utility classes', () => {
    const violations = describeViolations(arbitraryHexClass);
    assert.deepEqual(violations, [], 'Replace arbitrary hex utilities with RAD semantic tokens or intentional documented content colors.');
});

test('presentation sources do not depend on removed component-specific CSS classes', () => {
    const violations = describeViolations(legacyClass);
    assert.deepEqual(violations, [], 'Legacy presentation classes must be migrated to shared utilities.');
});

test('project stylesheets define tokens, base rules and only approved layout primitives', () => {
    assert.equal((css.match(/:root\s*\{/g) ?? []).length, 1);
    assert.ok(stylesheetFiles.length >= 1, 'Expected the complete stylesheet tree to be included.');
    const approvedLayoutClasses = new Set([
        '.rd-bleed',
        '.rd-workspace-main',
        '.rd-page-frame',
        '.rd-page-frame--workspace',
        '.rd-container--reading',
    ]);
    for (const path of stylesheetFiles) {
        const source = readFileSync(path, 'utf8');
        const selectors = matchesWithLines(source, /(?:^|,)\s*\.[a-zA-Z_][\w-]*(?:[^{}]*)\{/gm);
        const violations = selectors.filter(({ value }) =>
            (value.match(/\.[a-zA-Z_][\w-]*/g) ?? []).some((className) => !approvedLayoutClasses.has(className)),
        );
        assert.deepEqual(
            violations,
            [],
            relative(root, path) + ' may define only documented page/container/bleed layout primitives.',
        );
    }
    assert.doesNotMatch(css, /\.ra-[\w-]+|\.rad-messaging|\.app-boot|\.app-skeleton/);
});
test('Tailwind scans every presentation source family and defines accessible skeleton motion', () => {
    assert.ok(tailwind.includes("'./resources/**/*.blade.php'"));
    assert.ok(tailwind.includes("'./resources/**/*.js'"));
    assert.ok(tailwind.includes("'./resources/**/*.jsx'"));
    assert.ok(tailwind.includes("'skeleton-shimmer'"));
    assert.ok(tailwind.includes("'skeleton-shimmer': 'skeleton-shimmer 1.35s ease-in-out infinite'"));
    assert.ok(css.includes('--color-skeleton-base:'));
    assert.ok(css.includes('--color-skeleton-highlight:'));
});

test('Blade first-paint skeletons use the shared shimmer and reduced-motion contract', () => {
    const blade = readFileSync(resolve(root, 'resources/views/app.blade.php'), 'utf8');
    assert.match(blade, /\$skeletonClass\s*=\s*'[^']*animate-skeleton-shimmer[^']*motion-reduce:animate-none[^']*'/);
    assert.match(blade, /class="\{\{ \$skeletonClass \}\}/);
    assert.doesNotMatch(blade, /app-skeleton/);
});

test('inline color styling is token-backed rather than hardcoded', () => {
    const literalInlineColors = /style=\{\{[^}]*\b(?:color|backgroundColor|borderColor)\s*:\s*['"\x60]#(?:[0-9a-f]{3,8})/gim;
    const violations = describeViolations(literalInlineColors);
    assert.deepEqual(violations, [], 'Inline color values must resolve through RAD CSS variables.');
});
