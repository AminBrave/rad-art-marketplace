import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const css = read('resources/css/app.css');
const components = read('resources/css/rademan.css');
const entry = read('resources/js/app.jsx');
const tailwind = read('tailwind.config.js');
const primitives = read('resources/js/components/ui/primitives.jsx');
const layout = read('resources/js/components/ui/layout.jsx');
const navigation = read('resources/js/components/ui/navigation.jsx');
const feedback = read('resources/js/components/ui/feedback.jsx');
const cards = read('resources/js/components/ui/cards.jsx');
const home = read('resources/js/app/HomePage.jsx');
const catalogue = read('resources/js/app/ArtworkCatalogue.jsx');
const pages = ['resources/js/app/ArtworkDetailPage.jsx', 'resources/js/app/ArtistDirectoryPage.jsx', 'resources/js/app/ArtistProfilePage.jsx', 'resources/js/app/AuthPage.jsx', 'resources/js/app/PublicInfoPages.jsx', 'resources/js/app/BuyerWorkspace.jsx', 'resources/js/app/ArtistWorkspaceOverview.jsx', 'resources/js/app/AdminWorkspace.jsx', 'resources/js/app/MessagingCenter.jsx'].map(read);
const layouts = read('resources/js/app/Layouts.jsx');
const router = read('resources/js/app/AppRouter.jsx');
const theme = read('resources/js/app/ThemeContext.jsx');
const messaging = read('resources/js/app/MessagingCenter.jsx');

test('light, dark and system themes use the new Rademan semantic palette', () => {
    for (const token of ['--rd-canvas:', '--rd-surface:', '--rd-surface-2:', '--rd-text:', '--rd-text-2:', '--rd-line:', '--rd-accent:', '--rd-link:', '--rd-radius-3:', '--rd-nav-rail:', '--rd-nav-mobile:']) {
        assert.ok(css.includes(token), 'Missing token ' + token);
    }
    assert.ok(css.includes(":root[data-theme='dark']"));
    assert.ok(css.includes('@media(prefers-color-scheme:dark)'));
    assert.ok(css.includes('--rd-canvas:#000'));
    assert.ok(css.includes('--rd-surface:#121212'));
    assert.ok(css.includes('--rd-accent:#0064d9'));
});

test('Tailwind aliases resolve through the new semantic tokens', () => {
    for (const token of ['var(--rd-canvas)', 'var(--rd-text)', 'var(--rd-accent)', 'var(--rd-link)', 'var(--rd-surface)', 'var(--rd-line)', 'var(--rd-positive)']) {
        assert.ok(tailwind.includes(token), 'Missing semantic alias ' + token);
    }
    assert.ok(css.includes('--color-ink:var(--rd-text)'));
    assert.ok(css.includes('--color-paper:var(--rd-surface)'));
});

test('shared primitives expose semantic slots and retain accessible interaction behavior', () => {
    for (const component of ['data-ui="button"', 'data-ui="badge"', 'data-ui="page-heading"', 'data-ui="section-heading"', 'data-ui="workspace-hero"', 'data-ui="surface"', 'data-ui="metric"', 'data-ui="form-field"', 'data-ui="input"', 'data-ui="textarea"', 'data-ui="select"', 'data-ui="checkbox"']) {
        assert.ok(primitives.includes(component), 'Missing component contract ' + component);
    }
    for (const slot of ['data-ui="box"', 'data-ui="flex"', 'data-ui="grid"', 'data-ui="container"', 'data-ui="card"', 'data-ui="avatar"', 'data-ui="table"']) assert.ok(layout.includes(slot), 'Missing layout primitive ' + slot);
    for (const slot of ['data-ui="tabs-list"', 'data-ui="menu-content"', 'data-ui="menu-trigger"', 'data-ui="breadcrumbs"']) assert.ok(navigation.includes(slot), 'Missing navigation primitive ' + slot);
    for (const slot of ['data-ui="skeleton"', 'data-ui="empty-state"', 'data-ui="error-state"', 'data-ui="toast"', 'data-ui="media-image"']) assert.ok(feedback.includes(slot), 'Missing feedback primitive ' + slot);
    for (const behavior of ['aria-busy={loading || undefined}', "'aria-describedby': describedBy", "'aria-invalid': error ? true", 'SelectPrimitive.Root', 'CheckboxPrimitive.Root', 'focus-visible:outline']) {
        assert.ok(primitives.includes(behavior), 'Missing accessibility contract ' + behavior);
    }
});

test('Discover and catalogue use a feed-first composition with semantic filters and results', () => {
    assert.ok(home.includes('data-page="home"'));
    assert.ok(home.includes('home-intro'));
    assert.ok(home.includes('home-categories'));
    assert.ok(home.includes('home-feed'));
    assert.ok(home.includes('home-creators'));
    assert.ok(catalogue.includes('data-page="artwork-catalogue"'));
    assert.ok(catalogue.includes('data-ui="filter-panel"'));
    assert.ok(catalogue.includes('data-ui="artwork-grid"'));
    for (const page of pages) assert.ok(page.includes('data-page='), 'A feature route is missing its page composition marker.');
});

test('artwork and artist cards are image-led and preserve canonical destinations', () => {
    assert.ok(cards.includes('data-ui="artwork-card"'));
    assert.ok(cards.includes('data-ui="artwork-media"'));
    assert.ok(cards.includes('data-ui="artist-card"'));
    assert.ok(cards.includes('MediaImage src={artwork.image_url}'));
    assert.ok(cards.includes('/artworks/'));
    assert.ok(cards.includes('/artists/'));
    assert.ok(cards.includes('formatArtworkPrice(artwork.price)'));
});

test('the application shell covers Discover and authenticated role navigation', () => {
    for (const slot of ['public-navigation-rail', 'public-bottom-navigation', 'authenticated-bottom-navigation', 'data-ui="workspace-shell"']) {
        assert.ok(layouts.includes(slot), 'Missing shell slot ' + slot);
    }
    for (const rule of ['data-testid=public-navigation-rail', 'data-testid=authenticated-bottom-navigation', '@media(min-width:1280px)', '@media(max-width:767px)', 'env(safe-area-inset-bottom)', 'display-mode:standalone']) {
        assert.ok(components.includes(rule), 'Missing responsive rule ' + rule);
    }
    assert.ok(theme.includes("THEMES = ['system', 'light', 'dark']"));
});

test('public and authenticated route groups remain unchanged', () => {
    for (const route of ['path="/"', 'path="/artworks"', 'path="/artworks/:slug"', 'path="/artists"', 'path="/artists/:slug"', 'path="/collections"', 'path="/dashboard/artist"', 'path="/dashboard/buyer"', 'path="/admin"']) {
        assert.ok(router.includes(route), 'Missing route ' + route);
    }
    assert.ok(messaging.includes('data-page="messaging"'));
    assert.ok(messaging.includes('onSelectThread'));
});

test('legacy CSS adapters are absent from the production entry', () => {
    assert.ok(entry.includes("import '../css/rademan.css';"));
    assert.ok(!entry.includes('instagram.css'));
    assert.ok(!entry.includes('application-shell.css'));
    assert.ok(!components.includes('Instagram-inspired design layer'));
});
