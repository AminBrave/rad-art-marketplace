import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const css = read('../../resources/css/app.css');
const tailwind = read('../../tailwind.config.js');
const components = read('../../components.json');
const primitives = read('../../resources/js/components/ui/primitives.jsx');
const dialog = read('../../resources/js/components/ui/Dialog.jsx');
const cards = read('../../resources/js/components/ui/cards.jsx');
const feedback = read('../../resources/js/components/ui/feedback.jsx');
const themeProvider = read('../../resources/js/components/theme-provider.jsx');
const input = read('../../resources/js/components/ui/input.jsx');
const table = read('../../resources/js/components/ui/table.jsx');
const uiIndex = read('../../resources/js/components/ui/index.js');

test('shadcn semantic color tokens are defined for RAD light and dark modes', () => {
    for (const token of ['--background:', '--foreground:', '--card:', '--popover:', '--primary:', '--secondary:', '--muted:', '--accent:', '--destructive:', '--border:', '--input:', '--ring:']) {
        assert.ok(css.includes(token), `Missing semantic token: ${token}`);
    }
    assert.match(css, /\.dark\s*\{/);
    assert.match(css, /--background:\s*45 4% 14%/);
    assert.match(css, /--primary:\s*16 51% 47%/);
    assert.doesNotMatch(css, /--color-(?:canvas|ink|terracotta|sand|olive|paper|surface)/);
});

test('Tailwind and shadcn configuration use standard semantic colors and class-based dark mode', () => {
    assert.ok(tailwind.includes("darkMode: ['class']"));
    for (const token of ['background:', 'foreground:', 'card:', 'primary:', 'secondary:', 'muted:', 'accent:', 'destructive:', 'ring:']) {
        assert.ok(tailwind.includes(token), `Missing Tailwind semantic color: ${token}`);
    }
    assert.doesNotMatch(tailwind, /\b(?:terracotta|sand|olive|paper|canvas|surface|danger|subtle):/);
    const config = JSON.parse(components);
    assert.equal(config.tailwind.cssVariables, true);
    assert.equal(config.tsx, false);
    assert.equal(config.style, 'new-york');
});

test('shared primitives follow shadcn component contracts and preserve accessible form states', () => {
    assert.ok(primitives.includes('@radix-ui/react-slot'));
    assert.ok(primitives.includes('focus-visible:ring-ring'));
    assert.ok(primitives.includes('aria-busy={loading || undefined}'));
    assert.ok(primitives.includes("'aria-describedby':"));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
    assert.ok(input.includes('focus-visible:ring-ring'));
    assert.ok(input.includes("type === 'checkbox'"));
    assert.ok(table.includes('caption-bottom text-sm'));
    for (const component of ['Input', 'Textarea', 'Select', 'Label', 'Table', 'TableRow', 'TableCell', 'Card', 'Alert']) {
        assert.ok(uiIndex.includes(`export { ${component}`), `Missing shared component export: ${component}`);
    }
});

test('Radix interaction primitives and product cards consume semantic tokens', () => {
    assert.ok(dialog.includes('@radix-ui/react-dialog'));
    assert.ok(dialog.includes('bg-background'));
    assert.ok(cards.includes('bg-card'));
    assert.ok(cards.includes('bg-muted'));
    assert.ok(feedback.includes('role="alert"'));
    assert.ok(feedback.includes('bg-card'));
});

test('theme provider persists the selected mode and applies the root class', () => {
    assert.ok(themeProvider.includes("const STORAGE_KEY = 'rad-theme'"));
    assert.ok(themeProvider.includes("root.classList.toggle('dark', theme === 'dark')"));
    assert.ok(themeProvider.includes('localStorage.setItem(STORAGE_KEY, theme)'));
    assert.ok(themeProvider.includes('meta[name="theme-color"]'));
});

test('application screens use shared shadcn controls instead of raw interactive HTML controls', () => {
    const screens = [
        'AdminWorkspace.jsx', 'App.jsx', 'ArtistDirectoryPage.jsx', 'ArtistProfilePage.jsx',
        'ArtistWorkspaceOverview.jsx', 'ArtworkCatalogue.jsx', 'ArtworkDetailPage.jsx',
        'ArtworkGallery.jsx', 'ArtworkStudio.jsx', 'AuthPage.jsx', 'BuyerWorkspace.jsx',
        'ComponentShowcase.jsx', 'ContactArtistForm.jsx', 'DesignFoundation.jsx',
        'EditorialPages.jsx', 'HomePage.jsx', 'InquiryCenter.jsx', 'Layouts.jsx',
        'MessagingCenter.jsx', 'PublicInfoPages.jsx', 'RoutingPages.jsx',
    ];
    for (const screen of screens) {
        const source = read(`../../resources/js/app/${screen}`);
        assert.doesNotMatch(source, /<(?:button|input|textarea|select|table)\b/, 'Raw interactive element remains in ' + screen);
        assert.doesNotMatch(source, /\/\s+className=/, 'Malformed self-closing component in ' + screen);
    }
});
