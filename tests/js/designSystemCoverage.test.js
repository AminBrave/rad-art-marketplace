import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const css = readFileSync(resolve(root, 'resources/css/app.css'), 'utf8');
const tailwind = readFileSync(resolve(root, 'tailwind.config.js'), 'utf8');
const layouts = readFileSync(resolve(root, 'resources/js/app/Layouts.jsx'), 'utf8');

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
        '.rd-container',
        '.rd-container--reading',
        '.rd-container--full',
        '.rd-hero-surface',
        '.rd-discovery-hero',
        '.rd-message-bubble',
        '.rd-message-bubble--own',
        '.rd-message-bubble--peer',
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


test('numeric Tailwind spacing utilities resolve through the canonical Rademan spacing unit', () => {
    assert.ok(css.includes('--rd-space-unit: 0.25rem;'));
    assert.ok(css.includes('--rd-space-4: calc(var(--rd-space-unit) * 4);'));
    for (const key of [
        '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9',
        '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44',
        '48', '52', '56', '60', '64', '72', '80', '96',
    ]) {
        assert.match(tailwind, new RegExp(`['"]${key}['"]\\s*:`), `Missing canonical Tailwind spacing key: ${key}`);
    }
    assert.ok(tailwind.includes("'4': 'var(--rd-space-4)'"));
    assert.ok(tailwind.includes("'page-gutter': 'var(--rd-page-gutter)'"));
});

test('semantic layout tiers are token-backed and shared primitives use them', () => {
    const layout = readFileSync(resolve(root, 'resources/js/components/ui/layout.jsx'), 'utf8');
    for (const token of [
        '--rd-layout-page-padding', '--rd-layout-page-top', '--rd-layout-page-top-wide',
        '--rd-layout-section-compact', '--rd-layout-section-relaxed', '--rd-layout-section-regular',
        '--rd-layout-section-wide', '--rd-layout-content-gap', '--rd-layout-group-gap',
        '--rd-layout-workspace-gap', '--rd-layout-workspace-gap-relaxed', '--rd-layout-component-gap',
    ]) {
        assert.ok(css.includes(token + ':'), `Missing semantic layout token: ${token}`);
        assert.ok(tailwind.includes(token), `Tailwind does not expose semantic layout token: ${token}`);
    }
    assert.ok(layout.includes("py-section sm:py-section-wide"));
    assert.ok(layout.includes("calc(var(--rd-space-unit) * ${gap})"));
    assert.equal(layout.split("calc(var(--rd-space-unit) * ${gap})").length - 1, 2, "Flex and Grid must share token-backed numeric gaps.");
});

test('all semantic sections receive consistent vertical padding by default', () => {
    assert.match(css, /section\s*\{\s*padding-block:\s*var\(--rd-layout-section\);/);
    assert.match(css, /section\s*\{\s*padding-block:\s*var\(--rd-layout-section-wide\);/);
    assert.ok(css.includes('.rd-chat-shell section'));
});
test('public discovery pages share the same hero system and breadcrumbs stay out of workspaces', () => {
    const discoveryPages = [
        'resources/js/app/HomePage.jsx',
        'resources/js/app/ArtistDirectoryPage.jsx',
        'resources/js/app/ArtworkCatalogue.jsx',
        'resources/js/app/ArtistProfilePage.jsx',
        'resources/js/app/ArtworkDetailPage.jsx',
        'resources/js/app/EditorialPages.jsx',
    ];
    for (const path of discoveryPages) {
        const source = readFileSync(resolve(root, path), 'utf8');
        assert.ok(source.includes('DiscoveryHero'), path + ' must use the shared discovery hero.');
    }
    const breadcrumbPages = [
        'resources/js/app/ArtistDirectoryPage.jsx',
        'resources/js/app/ArtworkCatalogue.jsx',
        'resources/js/app/ArtistProfilePage.jsx',
        'resources/js/app/ArtworkDetailPage.jsx',
        'resources/js/app/EditorialPages.jsx',
    ];
    for (const path of breadcrumbPages) {
        const source = readFileSync(resolve(root, path), 'utf8');
        assert.ok(source.includes('<Breadcrumbs'), path + ' must place breadcrumbs inside its discovery hero.');
    }
    for (const path of [
        'resources/js/app/AdminWorkspace.jsx',
        'resources/js/app/ArtistWorkspaceOverview.jsx',
        'resources/js/app/ArtworkStudio.jsx',
        'resources/js/app/BuyerWorkspace.jsx',
        'resources/js/app/RoutingPages.jsx',
        'resources/js/app/Layouts.jsx',
    ]) {
        const source = readFileSync(resolve(root, path), 'utf8');
        assert.doesNotMatch(source, /<Breadcrumbs|مسیر صفحه/, path + ' must not show dashboard/workspace breadcrumbs.');
    }
    const appSources = frontendFiles.filter((path) => path.includes('/app/'));
    const breadcrumbConsumers = appSources
        .filter((path) => /<Breadcrumbs|aria-label=\{t\(["']مسیر صفحه/.test(readFileSync(path, 'utf8')))
        .map((path) => relative(root, path))
        .sort();
    assert.deepEqual(breadcrumbConsumers, [...breadcrumbPages].sort(), 'Breadcrumbs may only be consumed by public discovery routes.');
    const editorial = readFileSync(resolve(root, 'resources/js/app/EditorialPages.jsx'), 'utf8');
    assert.doesNotMatch(editorial.slice(editorial.indexOf('export function AdminEditorialPage()')), /<Breadcrumbs/, 'Admin editorial tools must not show breadcrumbs.');
    const primitives = readFileSync(resolve(root, 'resources/js/components/ui/primitives.jsx'), 'utf8');
    assert.ok(primitives.includes('export function DiscoveryHero'));
    assert.ok(primitives.includes('export function UnifiedHero'));
    assert.ok(primitives.includes('return <UnifiedHero'));
    assert.ok(css.includes('.rd-unified-hero'));
    assert.ok(css.includes('linear-gradient(var(--rd-hero-grid-line) 1px, transparent 1px)'));
    assert.ok(css.includes('radial-gradient(ellipse at 88% 8%, var(--rd-hero-glow), transparent 38%)'));
    assert.ok(css.includes('linear-gradient(125deg, var(--rd-hero-background), var(--rd-hero-background-alt))'));
    assert.ok(!css.includes('data-shape='));
    const home = readFileSync(resolve(root, 'resources/js/app/HomePage.jsx'), 'utf8');
    assert.ok(home.includes('rd-home-hero'));
    assert.ok(home.includes('aspect-[3/4]'), 'Homepage artwork must retain its 3:4 portrait ratio.');
    assert.ok(css.includes('aspect-ratio: 3 / 4'), 'Mobile hero artwork must retain the portrait ratio.');
    const catalogue = readFileSync(resolve(root, 'resources/js/app/ArtworkCatalogue.jsx'), 'utf8');
    const archiveStart = catalogue.indexOf('aria-label={t("آرشیو آثار و نتایج")}');
    const archiveEnd = catalogue.indexOf('</Section>', archiveStart);
    const archiveSection = catalogue.slice(archiveStart, archiveEnd);
    assert.ok(archiveStart >= 0 && archiveEnd > archiveStart);
    assert.ok(archiveSection.includes('آرشیو آثار'));
    assert.ok(archiveSection.includes('artworks.map'));
    assert.ok(archiveSection.includes('بارگذاری آثار بیشتر'));
    const directory = readFileSync(resolve(root, 'resources/js/app/ArtistDirectoryPage.jsx'), 'utf8');
    const directorySectionStart = directory.indexOf('aria-labelledby="artist-directory-heading"');
    const directorySectionEnd = directory.indexOf('</Container>', directorySectionStart);
    assert.ok(directory.slice(directorySectionStart, directorySectionEnd).includes('صفحه‌بندی هنرمندان'));

    const layout = readFileSync(resolve(root, 'resources/js/app/Layouts.jsx'), 'utf8');
    assert.ok(layout.includes('rd-chat-shell'));
    assert.ok(css.includes('.rd-chat-shell section'));
    const artist = readFileSync(resolve(root, 'resources/js/app/ArtistProfilePage.jsx'), 'utf8');
    assert.ok(!artist.includes('برای ارسال پیام مستقیم، از حساب خریدار استفاده کنید'));
    assert.ok(!artist.includes('پورتفولیوی عمومی'));
    assert.ok(!artist.includes('اثر بارگذاری‌شده'));
});

test('page-level compositions use the shared Container instead of duplicated max-width wrappers', () => {
    const pagePaths = [
        'resources/js/app/AdminWorkspace.jsx',
        'resources/js/app/ArtworkStudio.jsx',
        'resources/js/app/EditorialPages.jsx',
        'resources/js/app/ArtistWorkspaceOverview.jsx',
        'resources/js/app/RoutingPages.jsx',
    ];
    for (const path of pagePaths) {
        const source = readFileSync(resolve(root, path), 'utf8');
        assert.doesNotMatch(source, /mx-auto w-full max-w-content space-y-(?:6|7|8)/);
    }
});

test('compact messaging spacing uses the canonical scale except for the safe-area calculation', () => {
    const composer = readFileSync(resolve(root, 'resources/js/app/MessageComposer.jsx'), 'utf8');
    const timeline = readFileSync(resolve(root, 'resources/js/app/MessageTimeline.jsx'), 'utf8');
    for (const value of ['p-[.45rem]', 'gap-[.35rem]', 'p-[.35rem]']) assert.ok(!composer.includes(value), `Unexpected arbitrary composer spacing: ${value}`);
    for (const value of ['px-[.15rem]', 'mt-[.55rem]']) assert.ok(!timeline.includes(value), `Unexpected arbitrary timeline spacing: ${value}`);
    assert.ok(composer.includes('pb-[max(.5rem,env(safe-area-inset-bottom))]'));
});

test('workspace header and messaging viewport share responsive shell geometry tokens', () => {
    assert.ok(css.includes('--rd-workspace-header-height: 4.5rem;'));
    assert.ok(css.includes('--rd-workspace-header-height-wide: 5rem;'));
    assert.ok(layouts.includes('min-h-[var(--rd-workspace-header-height)]'));
    assert.ok(layouts.includes('sm:min-h-[var(--rd-workspace-header-height-wide)]'));
    assert.ok(layouts.includes('100dvh-var(--rd-workspace-header-height)'));
    assert.ok(layouts.includes('100dvh-var(--rd-workspace-header-height-wide)'));
    assert.doesNotMatch(layouts, /100dvh-4\.5rem|100dvh-5rem/);
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
