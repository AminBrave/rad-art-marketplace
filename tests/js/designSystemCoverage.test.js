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

test('project stylesheets define tokens, base rules and only approved layout/component selectors', () => {
    assert.equal((css.match(/:root\s*\{/g) ?? []).length, 1);
    assert.ok(stylesheetFiles.length >= 1, 'Expected the complete stylesheet tree to be included.');
    // Keep component-specific CSS scoped to the shared hero/workspace primitives;
    // all other presentation should remain in semantic Tailwind utilities.
    const approvedProjectSelectors = new Set([
        '.rd-bleed',
        '.rd-workspace-main',
        '.rd-page-frame',
        '.rd-page-frame--workspace',
        '.rd-container',
        '.rd-container--reading',
        '.rd-container--full',
        '.rd-hero-surface',
        '.rd-hero-surface--grid',
        '.rd-unified-hero',
        '.rd-unified-hero__title-wrap',
        '.rd-unified-hero__inner',
        '.rd-unified-hero--compact',
        '.rd-workspace-content',
        '.rd-home-hero',
        '.rd-discovery-hero',
        '.rd-message-bubble',
        '.rd-message-bubble--own',
        '.rd-message-bubble--peer',
    ]);
    for (const path of stylesheetFiles) {
        const source = readFileSync(path, 'utf8');
        const selectors = matchesWithLines(source, /(?:^|,)\s*\.[a-zA-Z_][\w-]*(?:[^{}]*)\{/gm);
        const violations = selectors.filter(({ value }) =>
            (value.match(/\.[a-zA-Z_][\w-]*/g) ?? []).some((className) => !approvedProjectSelectors.has(className)),
        );
        assert.deepEqual(
            violations,
            [],
            relative(root, path) + ' may define only explicitly approved project layout/component selectors.',
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
        assert.match(tailwind, new RegExp(`['"]${key}['"]\s*:`), `Missing canonical Tailwind spacing key: ${key}`);
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
    assert.ok(layout.includes("'mt-0 py-4'"), 'Every shared Section must enforce zero top margin and 16px block padding.');
    assert.ok(layout.includes("calc(var(--rd-space-unit) * ${gap})"));
    assert.equal(layout.split("calc(var(--rd-space-unit) * ${gap})").length - 1, 2, "Flex and Grid must share token-backed numeric gaps.");
});

test('semantic section spacing is explicit and component-owned', () => {
    assert.doesNotMatch(css, /(^|\n)\s*section\s*\{/m, 'Native section elements must not receive global layout spacing.');
    assert.ok(!css.includes('.rd-workspace-content {'), 'Workspace containers cannot add section padding outside the shared primitive.');
    assert.ok(!css.includes('.rd-chat-shell'), 'Chat shell spacing must be owned by its Tailwind layout classes, not a CSS override.');
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
    const appSources = frontendFiles.filter((path) => path.replaceAll('\\', '/').includes('/app/'));
    const breadcrumbConsumers = appSources
        .filter((path) => /<Breadcrumbs|aria-label=\{t\(["']مسیر صفحه/.test(readFileSync(path, 'utf8')))
        .map((path) => relative(root, path).replaceAll('\\', '/'))
        .sort();
    assert.deepEqual(breadcrumbConsumers, [...breadcrumbPages].sort(), 'Breadcrumbs may only be consumed by public discovery routes.');
    const editorial = readFileSync(resolve(root, 'resources/js/app/EditorialPages.jsx'), 'utf8');
    assert.doesNotMatch(editorial.slice(editorial.indexOf('export function AdminEditorialPage()')), /<Breadcrumbs/, 'Admin editorial tools must not show breadcrumbs.');
    const primitives = readFileSync(resolve(root, 'resources/js/components/ui/primitives.jsx'), 'utf8');
    assert.ok(primitives.includes('export function DiscoveryHero'));
    assert.ok(primitives.includes('export function UnifiedHero'));
    assert.ok(primitives.includes('<UnifiedHero'), 'All hero wrappers must delegate to the canonical implementation.');
    assert.ok(css.includes('.rd-unified-hero'));
    assert.ok(css.includes('.rd-hero-surface--grid::before'), 'Hero surfaces must expose the shared grid layer.');
    assert.ok(css.includes('linear-gradient(to right, var(--rd-hero-line) 1px, transparent 1px)'));
    assert.ok(!css.includes('.rd-unified-hero__title-wrap::before'), 'Hero titles must remain free of the removed square motif.');
    assert.ok(css.includes('radial-gradient(ellipse at 88% 8%, var(--rd-hero-glow), transparent 38%)'));
    assert.ok(css.includes('linear-gradient(125deg, var(--rd-hero-background), var(--rd-hero-background-alt))'));
    assert.ok(!/\bsection\s*\{/.test(css), 'Native section elements must not receive global layout spacing.');
    assert.ok(!css.includes('.rd-unified-hero--workspace'), 'Workspace heroes must not use a contained-width modifier.');
    assert.ok(primitives.includes("surface = 'grid'"));
    assert.match(primitives, /export function PageHeader\(props\)\s*\{\s*return <UnifiedHero \{\.\.\.sharedHeroDefaults\} \{\.\.\.props\} \/>;\s*\}/);
    assert.match(primitives, /export function DiscoveryHero\(props\)\s*\{\s*return <UnifiedHero \{\.\.\.sharedHeroDefaults\} bleed=\{false\} \{\.\.\.props\} \/>;\s*\}/);
    assert.match(primitives, /export function WorkspaceHero\(props\)\s*\{\s*return <UnifiedHero \{\.\.\.sharedHeroDefaults\} \{\.\.\.props\} \/>;\s*\}/);
    assert.ok(primitives.includes('compact: false'), 'All hero wrappers must inherit the compact variant from the shared defaults.');
    assert.ok(primitives.includes('breadcrumbs, actions, media, children'), 'The canonical hero must support the shared content contract.');
    assert.ok(!css.includes('.rd-workspace-content > section'), 'Workspace section spacing must be owned by explicit layout primitives.');
    assert.ok(!css.includes('.rd-workspace-content {'), 'Workspace Containers must not override the shared Section vertical rhythm.');
    assert.ok(!css.includes('.rd-page-frame--workspace .rd-container {'), 'Workspace Containers must own their own page gutters.');
    assert.ok(layouts.includes("'rd-workspace-page w-full min-w-0"), 'Workspace page shell must not constrain the route to the header width or add outer gutters.');
    assert.ok(!layouts.includes("'mx-auto w-full max-w-content px-page-gutter py-5"), 'Workspace pages must not inherit the old constrained outer shell.');
    for (const path of ['resources/js/app/AdminWorkspace.jsx', 'resources/js/app/ArtistWorkspaceOverview.jsx', 'resources/js/app/BuyerWorkspace.jsx', 'resources/js/app/ArtworkStudio.jsx', 'resources/js/app/RoutingPages.jsx', 'resources/js/app/EditorialPages.jsx']) {
        const source = readFileSync(resolve(root, path), 'utf8');
        assert.ok(source.includes('rd-workspace-content'), path + ' must use the shared workspace spacing shell.');
        assert.doesNotMatch(source, /<PageHeader bleed=\{false\}/, path + ' must not constrain a page hero inside its content container.');
    }
    assert.ok(!css.includes('data-shape='));
    const home = readFileSync(resolve(root, 'resources/js/app/HomePage.jsx'), 'utf8');
    assert.ok(home.includes('rd-home-hero'));
    assert.ok(home.includes('aspect-[3/4]'), 'Homepage artwork must retain its 3:4 portrait ratio.');
    assert.ok(home.includes('mediaPosition="before"'), 'Homepage media must stack before the hero copy on mobile.');
    assert.ok(primitives.includes("mediaPosition === 'before' && 'order-first lg:order-last'"), 'The shared hero must support mobile-first media ordering.');
    assert.ok(css.includes('grid-template-columns: minmax(0, 1fr);'), 'The mobile homepage hero must use a single column.');
    assert.ok(css.includes('aspect-ratio: 3 / 4'), 'Mobile hero artwork must retain the portrait ratio.');
    const catalogue = readFileSync(resolve(root, 'resources/js/app/ArtworkCatalogue.jsx'), 'utf8');
    const archiveStart = catalogue.indexOf('aria-label={t("آرشیو آثار و نتایج")}');
    const archiveEnd = catalogue.indexOf('</Section>', archiveStart);
    const archiveSection = catalogue.slice(archiveStart, archiveEnd);
    assert.ok(archiveStart >= 0 && archiveEnd > archiveStart);
    assert.ok(archiveSection.includes('آرشیو آثار'));
    assert.ok(archiveSection.includes('artworks.map'));
    assert.ok(archiveSection.includes('بارگذاری آثار بیشتر'));
    assert.ok(archiveSection.includes('Showing '));
    assert.ok(!css.includes('aspect-ratio: auto'), 'Hero media must not override its intrinsic aspect ratio.');
    const directory = readFileSync(resolve(root, 'resources/js/app/ArtistDirectoryPage.jsx'), 'utf8');
    const directorySectionStart = directory.indexOf('aria-labelledby="artist-directory-heading"');
    const directorySectionEnd = directory.indexOf('</Container>', directorySectionStart);
    assert.ok(directory.slice(directorySectionStart, directorySectionEnd).includes('صفحه‌بندی هنرمندان'));

    const layout = readFileSync(resolve(root, 'resources/js/app/Layouts.jsx'), 'utf8');
    assert.ok(layout.includes('rd-chat-shell'));
    assert.ok(!css.includes('.rd-chat-shell'), 'Chat shell spacing must not depend on global CSS overrides.');
    const artist = readFileSync(resolve(root, 'resources/js/app/ArtistProfilePage.jsx'), 'utf8');
    assert.ok(!artist.includes('برای ارسال پیام مستقیم، از حساب خریدار استفاده کنید'));
    assert.ok(artist.includes("descriptionTag.setAttribute('content'") && artist.includes('پورتفولیوی عمومی'), 'The portfolio phrase remains in the SEO description metadata.');
    assert.doesNotMatch(artist, /t\([\"']پورتفولیوی عمومی[\"']\)/, 'The SEO-only portfolio phrase is not rendered as visible page copy.');
    assert.ok(!artist.includes('اثر بارگذاری‌شده'));
});

test('homepage content sections separate semantic section rhythm from Container width', () => {
    const home = readFileSync(resolve(root, 'resources/js/app/HomePage.jsx'), 'utf8');
    assert.match(home, /<Section spacing="regular" aria-labelledby="recent-works-title">\s*<Container width="wide">/);
    assert.match(home, /<Section spacing="regular" aria-labelledby="artists-title">\s*<Container width="wide">/);
    assert.doesNotMatch(home, /<Container as="section"/, 'Container must not be used as a substitute for the semantic Section primitive.');
});

test('artwork studio workspace spacing belongs to its content Container', () => {
    const studio = readFileSync(resolve(root, 'resources/js/app/ArtworkStudio.jsx'), 'utf8');
    assert.match(studio, /<Section spacing="none">\s*<Container width="wide" className="rd-workspace-content space-y-workspace-relaxed">/);
    assert.doesNotMatch(studio, /<Section spacing="none" className="rd-workspace-content space-y-workspace-relaxed">/,
        'The workspace rhythm must live on the constrained content Container, not the full-width Section.');
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

test('every semantic Section enforces py-4 and zero top margin', () => {
    const layout = readFileSync(resolve(root, 'resources/js/components/ui/layout.jsx'), 'utf8');
    assert.match(layout, /className=\{cn\('min-w-0', bleed && 'rd-bleed', className, 'mt-0 py-4'\)\}/);
    assert.ok(layout.includes('data-section-spacing={spacing ?? \'regular\'}'), 'Legacy spacing values remain observable but no longer alter section geometry.');
    const sectionImplementation = layout.slice(layout.indexOf('export const Section'), layout.indexOf('export const Inset'));
    assert.doesNotMatch(sectionImplementation, /py-section|py-0|py-section-compact|py-section-relaxed/);
});

test('every frontend Section usage declares explicit spacing ownership', () => {
    const implicitSpacing = frontendFiles.flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return matchesWithLines(source, /<Section\b(?:(?!>).)*>/gs)
            .filter(({ value }) => !/\bspacing\s*=/.test(value))
            .map((match) => ({ file: relative(root, path), ...match }));
    });
    assert.deepEqual(implicitSpacing, [], 'Every Section call site must declare spacing explicitly.');
});

test('page compositions use explicit shared Section spacing ownership', () => {
    const migrated = [
        ['resources/js/app/HomePage.jsx', 'regular'],
        ['resources/js/app/ArtistProfilePage.jsx', 'regular'],
        ['resources/js/app/ArtworkDetailPage.jsx', 'regular'],
        ['resources/js/app/EditorialPages.jsx', 'regular'],
        ['resources/js/app/ArtistWorkspaceOverview.jsx', 'none'],
        ['resources/js/app/BuyerWorkspace.jsx', 'none'],
        ['resources/js/app/AdminWorkspace.jsx', 'none'],
        ['resources/js/app/ArtworkStudio.jsx', 'none'],
        ['resources/js/app/RoutingPages.jsx', 'none'],
    ];
    for (const [path, spacing] of migrated) {
        const source = readFileSync(resolve(root, path), 'utf8');
        assert.match(source, /import \{[^}]*\bSection\b[^}]*\} from ['"]\.\.\/components\/ui['"]/,
            path + ' must import the shared Section primitive.');
        assert.doesNotMatch(source, /<section\b|<\/section>/,
            path + ' must not rely on native section tag styling.');
        assert.ok(source.includes('spacing="' + spacing + '"'),
            path + ' must declare its intended section spacing.');
    }
});


test('public and workspace routes share the full-width PageShell primitive', () => {
    const layout = readFileSync(resolve(root, 'resources/js/components/ui/layout.jsx'), 'utf8');
    const barrel = readFileSync(resolve(root, 'resources/js/components/ui/index.js'), 'utf8');
    const layouts = readFileSync(resolve(root, 'resources/js/app/Layouts.jsx'), 'utf8');
    assert.match(layout, /export const PageShell = forwardRef/);
    assert.match(layout, /className=\{cn\('rd-page-frame'.*'min-w-0 w-full'/);
    assert.ok(barrel.includes('PageShell'), 'PageShell must be exported through the shared UI entry point.');
    assert.ok(layouts.includes('<PageShell as="main" id="main-content">'), 'Public routes must retain a semantic main landmark.');
    assert.ok(layouts.includes('<PageShell as="main" id="main-content">\n                <Outlet />\n            </PageShell>'), 'The public PageShell must close immediately after its route outlet with its component tag.');
    assert.ok(layouts.includes('<PageShell variant="workspace">'), 'Workspace routes must use the same route-frame primitive.');
    assert.doesNotMatch(layouts, /className="rd-page-frame(?: rd-page-frame--workspace)?"/,
        'Route layouts must not duplicate PageShell implementation classes.');
});


test('semantic section landmarks are separated from Container width and gutters', () => {
    const containerAsSection = frontendFiles.flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return matchesWithLines(source, /<Container\b(?:(?!>).)*\bas\s*=\s*['"]section['"](?:(?!>).)*>/gs)
            .map((match) => ({ file: relative(root, path), ...match }));
    });
    assert.deepEqual(containerAsSection, [], 'Use Section for semantic landmarks and Container for content width/gutters.');

    const directory = readFileSync(resolve(root, 'resources/js/app/ArtistDirectoryPage.jsx'), 'utf8');
    const gallery = readFileSync(resolve(root, 'resources/js/app/ArtworkGallery.jsx'), 'utf8');
    assert.match(directory, /<Section spacing="none" aria-labelledby="artist-directory-heading">\s*<Container width="wide">/);
    assert.match(gallery, /<Section spacing="relaxed" id="artworks">\s*<Container width="wide">/);
});


test('related artwork section composes the shared SectionHeader pattern', () => {
    const detail = readFileSync(resolve(root, 'resources/js/app/ArtworkDetailPage.jsx'), 'utf8');
    assert.match(detail, /import \{[^}]*\bSectionHeader\b[^}]*\} from ['"]\.\.\/components\/ui['"]/);
    assert.ok(detail.includes('<SectionHeader'), 'Related artwork heading must use the shared primitive.');
    assert.ok(detail.includes('title={t("آثار مرتبط")}'), 'The related artwork title must be preserved.');
    assert.ok(detail.includes('description={t("آثاری از همین دسته یا همین هنرمند")}'), 'The supporting description must be preserved.');
    assert.ok(detail.includes('actions={<Link to="/artworks"'), 'The browse-all action must remain available.');
    assert.doesNotMatch(detail, /<div className="flex flex-wrap items-end justify-between gap-3">/);
});


test('SectionHeader is reused for catalogue and related-artwork section headings', () => {
    const catalogue = readFileSync(resolve(root, 'resources/js/app/ArtworkCatalogue.jsx'), 'utf8');
    const detail = readFileSync(resolve(root, 'resources/js/app/ArtworkDetailPage.jsx'), 'utf8');
    assert.match(catalogue, /import \{[^}]*\bSectionHeader\b[^}]*\} from ['"]\.\.\/components\/ui['"]/);
    assert.ok(catalogue.includes('<SectionHeader'), 'Catalogue filter heading must use the shared heading pattern.');
    assert.ok(detail.includes('<SectionHeader'), 'Related artworks must use the shared heading pattern.');
});

test('FormField preserves caller-provided aria-describedby references', () => {
    const primitives = readFileSync(resolve(root, 'resources/js/components/ui/primitives.jsx'), 'utf8');
    assert.match(primitives, /children\?\.\props\?\.\['aria-describedby'\]/);
    assert.match(primitives, /\.split\(\/\\s\+\/\)/);
    assert.ok(primitives.includes("'aria-describedby': describedBy"));
});

test('image and avatar fallbacks reset when their source changes', () => {
    const layout = readFileSync(resolve(root, 'resources/js/components/ui/layout.jsx'), 'utf8');
    const feedback = readFileSync(resolve(root, 'resources/js/components/ui/feedback.jsx'), 'utf8');
    assert.match(layout, /useEffect\(\(\) => setFailed\(false\), \[src\]\)/);
    assert.match(feedback, /useEffect\(\(\) => \{\s*setLoadedSrc\(null\);\s*setFailedSrc\(null\);\s*\}, \[imageSrc\]\)/);
    assert.ok(feedback.includes('fetchpriority={fetchPriority}'));
});

test('Pagination exposes localized navigation and page labels', () => {
    const navigation = readFileSync(resolve(root, 'resources/js/components/ui/navigation.jsx'), 'utf8');
    const showcase = readFileSync(resolve(root, 'resources/js/app/ComponentShowcase.jsx'), 'utf8');
    assert.ok(navigation.includes('ariaLabel ='));
    assert.ok(navigation.includes('previousLabel ='));
    assert.ok(navigation.includes('nextLabel ='));
    assert.ok(navigation.includes('pageLabel ='));
    assert.ok(showcase.includes('pageLabel={(number) => locale === "en"'));
    assert.ok(showcase.includes('const { t, locale } = useLanguage();'));
});

test('Tailwind radius utilities map to semantic radius tokens', () => {
    assert.match(tailwind, /sm: 'var\(--rd-radius-sm\)'/);
    assert.match(tailwind, /md: 'var\(--rd-radius-md\)'/);
    assert.match(tailwind, /full: 'var\(--rd-radius-pill\)'/);
    assert.match(tailwind, /control: 'var\(--rd-radius-md\)'/);
    assert.match(tailwind, /card: 'var\(--rd-radius-lg\)'/);
});

test('important CSS overrides are restricted to the reduced-motion safety contract', () => {
    const importantRules = [...css.matchAll(/!important/g)];
    assert.equal(importantRules.length, 4, 'Only the four reduced-motion overrides should require !important.');
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?scroll-behavior: auto !important;[\s\S]*?animation-duration: 0\.01ms !important;[\s\S]*?animation-iteration-count: 1 !important;[\s\S]*?transition-duration: 0\.01ms !important;/);
});



test('all semantic sections use the shared primitive and have no caller-owned top margin', () => {
    const nativeSections = frontendFiles.flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return matchesWithLines(source, /<section\b|<\/section>/g)
            .map((match) => ({ file: relative(root, path), ...match }));
    });
    assert.deepEqual(nativeSections, [], 'Use the shared Section primitive instead of raw section tags.');

    const localSpacingOverrides = frontendFiles.flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        return matchesWithLines(source, /<Section\\b(?:(?!>).)*>/gs)
            .filter(({ value }) => /(?:^|\s)-?(?:m(?:t|b|y|x|s|e)?|p(?:y|t|b)?)-[^\s"'\x60}]+/.test(value))
            .map((match) => ({ file: relative(root, path), ...match }));
    });
    assert.deepEqual(
        localSpacingOverrides,
        [],
        'Section call sites must not add margins or vertical padding; the shared Section primitive owns the complete vertical rhythm.',
    );
});

test('Radix dropdown and select overlays do not isolate or get trapped under the header', () => {
    const navigation = readFileSync(resolve(root, 'resources/js/components/ui/navigation.jsx'), 'utf8');
    const primitives = readFileSync(resolve(root, 'resources/js/components/ui/primitives.jsx'), 'utf8');
    assert.match(navigation, /<DropdownMenuPrimitive\.Portal>[\s\S]*?<DropdownMenuPrimitive\.Content/);
    assert.ok(navigation.includes('modal={false}'), 'DropdownMenu must remain non-modal.');
    assert.match(primitives, /<SelectPrimitive\.Root\s+modal=\{false\}/, 'Select must not aria-hide or inert the application header.');
    assert.match(primitives, /<SelectPrimitive\.Portal>[\s\S]*?<SelectPrimitive\.Content/);
    assert.ok(css.includes('--rd-layer-popover: 120;'), 'Portaled popovers must use the shared overlay layer.');
});
