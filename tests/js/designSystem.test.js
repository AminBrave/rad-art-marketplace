import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../../tailwind.config.js', import.meta.url), 'utf8');
const components = readFileSync(new URL('../../components.json', import.meta.url), 'utf8');
const primitives = readFileSync(new URL('../../resources/js/components/ui/primitives.jsx', import.meta.url), 'utf8');
const dialog = readFileSync(new URL('../../resources/js/components/ui/Dialog.jsx', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../../resources/js/components/ui/cards.jsx', import.meta.url), 'utf8');
const feedback = readFileSync(new URL('../../resources/js/components/ui/feedback.jsx', import.meta.url), 'utf8');
const themeProvider = readFileSync(new URL('../../resources/js/components/theme-provider.jsx', import.meta.url), 'utf8');

test('shadcn semantic color tokens are defined for RAD light and dark modes', () => {
    for (const token of ['--background:', '--foreground:', '--card:', '--popover:', '--primary:', '--secondary:', '--muted:', '--accent:', '--destructive:', '--border:', '--input:', '--ring:']) {
        assert.ok(css.includes(token), `Missing semantic token: ${token}`);
    }
    assert.match(css, /\.dark\s*\{/);
    assert.match(css, /--background:\s*45 4% 14%/);
    assert.match(css, /--primary:\s*16 51% 47%/);
});

test('Tailwind and shadcn configuration use class-based dark mode and CSS variables', () => {
    assert.ok(tailwind.includes("darkMode: ['class']"));
    for (const token of ['background:', 'foreground:', 'card:', 'primary:', 'secondary:', 'muted:', 'accent:', 'destructive:', 'ring:']) {
        assert.ok(tailwind.includes(token), `Missing Tailwind semantic color: ${token}`);
    }
    const config = JSON.parse(components);
    assert.equal(config.tailwind.cssVariables, true);
    assert.equal(config.tsx, false);
});

test('shared primitives follow shadcn component contracts and preserve accessible form states', () => {
    assert.ok(primitives.includes("@radix-ui/react-slot"));
    assert.ok(primitives.includes('focus-visible:ring-ring'));
    assert.ok(primitives.includes('aria-busy={loading || undefined}'));
    assert.ok(primitives.includes("'aria-describedby':"));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
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
});
