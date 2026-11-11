import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../../tailwind.config.js', import.meta.url), 'utf8');
const primitives = readFileSync(new URL('../../resources/js/components/ui/primitives.jsx', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../../resources/js/components/ui/cards.jsx', import.meta.url), 'utf8');
const feedback = readFileSync(new URL('../../resources/js/components/ui/feedback.jsx', import.meta.url), 'utf8');
const publicPages = ['ArtworkCatalogue.jsx', 'ArtistDirectoryPage.jsx', 'ArtworkDetailPage.jsx'].map((file) => readFileSync(new URL('../../resources/js/app/' + file, import.meta.url), 'utf8'));
const layouts = readFileSync(new URL('../../resources/js/app/Layouts.jsx', import.meta.url), 'utf8');

test('semantic palette, typography, spacing and layout tokens have one CSS source', () => {
    for (const token of [
        '--color-canvas', '--color-ink', '--color-terracotta', '--color-terracotta-strong',
        '--color-sand', '--color-olive', '--color-paper', '--color-text-muted',
        '--color-border', '--color-success', '--color-danger', '--color-warning', '--color-info',
        '--color-success-surface', '--color-danger-surface', '--color-warning-surface', '--color-info-surface', '--color-accent-surface', '--color-inverse-text', '--color-message-own', '--color-message-peer',
        '--font-persian', '--font-latin', '--text-base', '--leading-copy',
        '--space-1', '--space-4', '--space-8', '--radius-md', '--content-width',
        '--page-gutter', '--control-height-md', '--artwork-ratio',
    ]) {
        assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing design token: ${token}`);
    }
});

test('Tailwind semantic aliases reference CSS variables rather than duplicate literal values', () => {
    for (const alias of ['canvas:', 'terracotta:', 'muted:', 'warning:', 'info:', 'success: {', 'danger: {', 'warning: {', 'info: {', 'accent: {', 'inverse:', 'fontSize:', 'lineHeight:', 'spacing:']) {
        assert.ok(tailwind.includes(alias), `Missing Tailwind alias: ${alias}`);
    }
    assert.ok(tailwind.includes('var(--color-canvas)'));
    assert.ok(tailwind.includes('var(--text-base)'));
    assert.ok(tailwind.includes('var(--space-4)'));
});

test('shared primitives use centralized component contracts and expose accessible states', () => {
    assert.ok(css.includes('.ra-button--primary'));
    assert.ok(css.includes('.ra-button--danger'));
    assert.ok(css.includes('.ra-control:focus-visible'));
    assert.ok(css.includes('.ra-control[aria-invalid='));
    assert.ok(primitives.includes('ra-button'));
    assert.ok(primitives.includes('aria-busy={loading || undefined}'));
    assert.ok(primitives.includes("'aria-describedby': describedBy"));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
});

test('shared content and feedback components use semantic surface and state contracts', () => {
    assert.ok(cards.includes('bg-surface-muted'));
    assert.ok(cards.includes('border border-border'));
    assert.ok(cards.includes('ra-artwork-frame'));
    assert.ok(feedback.includes('ra-state--empty'));
    assert.ok(feedback.includes('ra-state--error'));
    assert.ok(feedback.includes('ra-state--success'));
});

test('RAD visual tokens are declared in one canonical root block', () => {
    assert.equal((css.match(/:root\s*\{/g) ?? []).length, 1);
    assert.ok(css.includes('--color-message-own:'));
    assert.ok(css.includes('--color-success-surface:'));
});

test('shared layout, surface, button, badge and form contracts are defined centrally', () => {
    for (const contract of [
        '.ra-page--wide', '.ra-page--reading', '.ra-page-header__title',
        '.ra-section-header__title', '.ra-surface--muted', '.ra-surface--interactive',
        '.ra-badge--success', '.ra-badge--danger', '.ra-form-field__error',
        '.ra-control--textarea', '.ra-workspace-content',
    ]) {
        assert.ok(css.includes(contract), 'Missing component contract: ' + contract);
    }
    for (const component of ['PageContainer', 'PageHeader', 'SectionHeader', 'Surface', 'StatusBadge']) {
        assert.ok(primitives.includes('function ' + component), 'Missing shared component: ' + component);
    }
});

test('public catalogue, artist directory and artwork detail use shared page layout primitives', () => {
    assert.ok(publicPages[0].includes('PageContainer') && publicPages[0].includes('PageHeader'));
    assert.ok(publicPages[1].includes('PageContainer') && publicPages[1].includes('SectionHeader'));
    assert.ok(publicPages[2].includes('PageContainer'));
});

test('public and role-based workspaces expose the shared application shell contracts', () => {
    for (const contract of ['ra-public-shell', 'ra-public-header', 'ra-workspace-shell', 'ra-workspace-header', 'ra-workspace-sidebar', 'ra-workspace-content']) {
        assert.ok(layouts.includes(contract), 'Missing application shell contract: ' + contract);
    }
});
