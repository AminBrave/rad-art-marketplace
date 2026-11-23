import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getContrastRatio } from '../../resources/js/lib/colorAccessibility.js';

const css = readFileSync(new URL('../../resources/css/instagram.css', import.meta.url), 'utf8');
const entry = readFileSync(new URL('../../resources/js/app.jsx', import.meta.url), 'utf8');

function block(selector) {
    const escaped = selector.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&');
    const match = css.match(new RegExp(escaped + '\\s*\\{([\\s\\S]*?)\\n\\}'));
    assert.ok(match, 'Missing theme block: ' + selector);
    return match[1];
}

function value(source, name) {
    const match = source.match(new RegExp('(?:^|\\n)\\s*' + name + ':\\s*([^;]+);'));
    assert.ok(match, 'Missing theme token: ' + name);
    return match[1].trim();
}

const light = block(':root');
const dark = block(":root[data-theme='dark']");

test('Instagram-inspired light and dark semantic palettes are defined independently', () => {
    assert.equal(value(light, '--rd-canvas'), '#fafafa');
    assert.equal(value(light, '--rd-surface'), '#ffffff');
    assert.equal(value(light, '--rd-action'), '#0064d9');
    assert.equal(value(dark, '--rd-canvas'), '#000000');
    assert.equal(value(dark, '--rd-surface'), '#121212');
    assert.equal(value(dark, '--rd-action'), '#0064d9');
    assert.ok(css.includes('@media (prefers-color-scheme: dark)'), 'System preference must be supported.');
});

test('primary text, secondary text, action labels and focus remain readable in both themes', () => {
    for (const [name, theme, surfaces] of [
        ['light', light, ['#fafafa', '#ffffff', '#f5f5f5']],
        ['dark', dark, ['#000000', '#121212', '#262626']],
    ]) {
        const primary = value(theme, '--rd-text-primary');
        const secondary = value(theme, '--rd-text-secondary');
        const actionText = value(theme, '--rd-action-text');
        const focus = value(theme, '--rd-focus');
        for (const surface of surfaces) {
            assert.ok(getContrastRatio(primary, surface) >= 4.5, name + ' primary text must meet AA on ' + surface);
            assert.ok(getContrastRatio(secondary, surface) >= 4.5, name + ' secondary text must meet AA on ' + surface);
            assert.ok(getContrastRatio(actionText, surface) >= 4.5, name + ' action text must meet AA on ' + surface);
            assert.ok(getContrastRatio(focus, surface) >= 3, name + ' focus must meet the non-text contrast threshold on ' + surface);
        }
        assert.ok(getContrastRatio('#ffffff', value(theme, '--rd-action')) >= 4.5, name + ' primary button labels must meet AA.');
    }
});

test('the production entry loads the theme layer without replacing the existing theme provider', () => {
    assert.ok(entry.includes("import '../css/instagram.css';"));
    assert.ok(entry.includes("import { ThemeProvider } from './app/ThemeContext';"));
    assert.ok(entry.includes('<ThemeProvider>'));
});
