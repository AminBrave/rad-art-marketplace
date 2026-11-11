import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../../tailwind.config.js', import.meta.url), 'utf8');
const components = readFileSync(new URL('../../components.json', import.meta.url), 'utf8');
const button = readFileSync(new URL('../../resources/js/components/ui/button.jsx', import.meta.url), 'utf8');
const primitives = readFileSync(new URL('../../resources/js/components/ui/primitives.jsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('../../resources/js/components/ui/field.jsx', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../../resources/js/components/ui/cards.jsx', import.meta.url), 'utf8');
const card = readFileSync(new URL('../../resources/js/components/ui/card.jsx', import.meta.url), 'utf8');
const feedback = readFileSync(new URL('../../resources/js/components/ui/feedback.jsx', import.meta.url), 'utf8');

test('New York light and dark themes expose complete semantic roles', () => {
    for (const token of [
        '--background', '--foreground', '--card', '--card-foreground',
        '--popover', '--popover-foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
        '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
        '--border', '--input', '--ring', '--chart-1', '--chart-5',
        '--sidebar', '--sidebar-foreground', '--sidebar-primary', '--sidebar-border',
    ]) {
        assert.ok(css.includes(token), `Missing New York semantic token: ${token}`);
    }
    assert.match(css, /\[data-theme='new-york'\]\.dark/);
    assert.match(css, /prefers-reduced-motion/);
});

test('shadcn metadata and Tailwind aliases use the New York Stone CSS-variable contract', () => {
    const metadata = JSON.parse(components);
    assert.equal(metadata.style, 'new-york');
    assert.equal(metadata.tailwind.baseColor, 'stone');
    assert.equal(metadata.tailwind.cssVariables, true);
    assert.equal(tailwind.includes("darkMode: 'class'"), true);
    for (const alias of ['background:', 'foreground:', 'card:', 'primary:', 'muted:', 'popover:', 'sidebar:', 'chart:']) {
        assert.ok(tailwind.includes(alias), `Missing semantic Tailwind alias: ${alias}`);
    }
    assert.ok(tailwind.includes('hsl(var(--background))'));
    assert.ok(tailwind.includes('hsl(var(--sidebar))'));
    assert.ok(tailwind.includes("lg: 'var(--radius)'"));
});

test('New York Button and Field primitives expose documented variants and accessible states', () => {
    assert.ok(button.includes('variants[variant]'));
    assert.ok(button.includes('aria-busy={loading || undefined}'));
    assert.ok(button.includes('block && \'w-full\''));
    assert.ok(primitives.includes("'aria-describedby': describedBy"));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
    assert.ok(field.includes('data-slot="field"'));
    assert.ok(field.includes('role="alert"'));
});

test('marketplace cards and feedback use composable semantic surfaces', () => {
    assert.ok(cards.includes('<Card'));
    assert.ok(card.includes('bg-card'));
    assert.ok(cards.includes('<Badge'));
    assert.ok(feedback.includes('<Alert'));
    assert.ok(feedback.includes('role="progressbar"') || feedback.includes('<Progress'));
    assert.ok(feedback.includes('<section'));
});
