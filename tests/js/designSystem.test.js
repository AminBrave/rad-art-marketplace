import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const css = read('resources/css/app.css');
const system = read('resources/css/rademan.css');
const tailwind = read('tailwind.config.js');
const primitives = read('resources/js/components/ui/primitives.jsx');
const layout = read('resources/js/components/ui/layout.jsx');
const navigation = read('resources/js/components/ui/navigation.jsx');
const cards = read('resources/js/components/ui/cards.jsx');
const feedback = read('resources/js/components/ui/feedback.jsx');
const routes = read('resources/js/app/AppRouter.jsx');
const shell = read('resources/js/app/Layouts.jsx');
const messaging = read('resources/js/app/MessagingCenter.jsx');
const docs = read('AI/DESIGN-SYSTEM.md');

test('semantic design tokens define a complete responsive light and dark application', () => {
    for (const token of ['--rd-canvas:', '--rd-surface:', '--rd-surface-2:', '--rd-text:', '--rd-text-2:', '--rd-text-3:', '--rd-line:', '--rd-accent:', '--rd-link:', '--rd-positive:', '--rd-negative:', '--rd-radius-3:', '--rd-gutter:', '--rd-nav-rail:', '--rd-nav-mobile:']) {
        assert.ok(css.includes(token), 'Missing token ' + token);
    }
    assert.ok(css.includes(":root[data-theme='dark']"));
    assert.ok(css.includes('@media(prefers-color-scheme:dark)'));
    assert.ok(css.includes('--color-success-surface:'));
    assert.ok(css.includes('--color-message-own:'));
});

test('Tailwind utilities are aliases of the new semantic token set', () => {
    for (const token of ['var(--rd-canvas)', 'var(--rd-text)', 'var(--rd-accent)', 'var(--rd-link)', 'var(--rd-surface)', 'var(--rd-line)', 'var(--rd-positive)', 'var(--rd-negative)']) {
        assert.ok(tailwind.includes(token), 'Missing token alias ' + token);
    }
});

test('component primitives provide semantic slots without losing Radix accessibility behavior', () => {
    for (const slot of ['data-ui="button"', 'data-ui="badge"', 'data-ui="page-heading"', 'data-ui="section-heading"', 'data-ui="workspace-hero"', 'data-ui="metric"', 'data-ui="surface"', 'data-ui="form-field"', 'data-ui="input"', 'data-ui="textarea"', 'data-ui="select"', 'data-ui="checkbox"']) {
        assert.ok(primitives.includes(slot), 'Missing UI slot ' + slot);
    }
    for (const contract of ['aria-busy={loading || undefined}', "'aria-describedby': describedBy", "'aria-invalid': error ? true", 'SelectPrimitive.Root', 'CheckboxPrimitive.Root', 'focus-visible:outline']) {
        assert.ok(primitives.includes(contract), 'Missing interaction contract ' + contract);
    }
    for (const slot of ['data-ui="box"', 'data-ui="flex"', 'data-ui="grid"', 'data-ui="container"', 'data-ui="section"', 'data-ui="avatar"', 'data-ui="card"', 'data-ui="callout"', 'data-ui="progress"', 'data-ui="table"', 'data-ui="data-list"']) {
        assert.ok(layout.includes(slot), 'Missing layout slot ' + slot);
    }
    for (const slot of ['data-ui="tabs-list"', 'data-ui="tabs-trigger"', 'data-ui="menu-content"', 'data-ui="menu-trigger"', 'data-ui="pagination"']) {
        assert.ok(navigation.includes(slot), 'Missing navigation slot ' + slot);
    }
    for (const slot of ['data-ui="skeleton"', 'data-ui="empty-state"', 'data-ui="error-state"', 'data-ui="success-state"', 'data-ui="toast"', 'data-ui="media-image"']) {
        assert.ok(feedback.includes(slot), 'Missing feedback slot ' + slot);
    }
    for (const component of ['export const Box', 'export const Grid', 'export const Container', 'export function Avatar', 'export const Card', 'export const Callout', 'export const Progress']) {
        assert.ok(layout.includes(component), 'Missing layout primitive ' + component);
    }
});

test('content cards are image-first and keep their canonical route destinations and price formatting', () => {
    assert.ok(cards.includes('data-ui="artwork-card"'));
    assert.ok(cards.includes('data-ui="artwork-media"'));
    assert.ok(cards.includes('data-ui="artist-card"'));
    assert.ok(cards.includes('MediaImage src={artwork.image_url}'));
    assert.ok(cards.includes('/artworks/'));
    assert.ok(cards.includes('/artists/'));
    assert.ok(cards.includes('formatArtworkPrice(artwork.price)'));
});

test('responsive shell supports public discovery, all role workspaces and safe-area-aware mobile navigation', () => {
    for (const contract of ['public-navigation-rail', 'public-bottom-navigation', 'authenticated-bottom-navigation', 'data-ui="workspace-shell"']) {
        assert.ok(shell.includes(contract), 'Missing navigation contract ' + contract);
    }
    for (const contract of ['data-testid=public-navigation-rail', 'data-testid=authenticated-bottom-navigation', '@media(min-width:1280px)', '@media(max-width:767px)', 'env(safe-area-inset-bottom)', 'display-mode:standalone']) {
        assert.ok(system.includes(contract), 'Missing responsive style ' + contract);
    }
});

test('all current public, buyer, artist and admin route groups remain registered', () => {
    for (const route of ['path="/"', 'path="/artworks"', 'path="/artworks/:slug"', 'path="/artists"', 'path="/artists/:slug"', 'path="/collections"', 'path="/dashboard/artist"', 'path="/dashboard/buyer"', 'path="/admin"']) {
        assert.ok(routes.includes(route), 'Missing route ' + route);
    }
});

test('messaging remains a canonical feature with conversation selection and contextual composer', () => {
    assert.ok(messaging.includes('data-page="messaging"'));
    assert.ok(messaging.includes('onSelectThread'));
    assert.ok(messaging.includes('setReplyTo'));
    assert.ok(messaging.includes('selectedFile'));
    assert.ok(messaging.includes('pendingArtwork'));
    assert.ok(messaging.includes('sendMessage') || messaging.includes('mutateAsync'));
});

test('feedback and documentation use the new design-system language', () => {
    assert.ok(feedback.includes('animate-skeleton-shimmer'));
    assert.ok(feedback.includes('ToastPrimitive.Viewport'));
    assert.ok(docs.includes('Rademan application system'));
    assert.ok(docs.includes('Buyer Studio'));
    assert.ok(docs.includes('WCAG 2.2 AA'));
});

test('legacy visual adapters are not part of the production bundle', () => {
    const entry = read('resources/js/app.jsx');
    assert.ok(entry.includes("import '../css/rademan.css';"));
    assert.ok(!entry.includes('instagram.css'));
    assert.ok(!entry.includes('application-shell.css'));
});
