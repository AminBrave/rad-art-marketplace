import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getContrastRatio, parseColor } from '../../resources/js/lib/colorAccessibility.js';

const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');

function token(name) {
    const line = css.split('\n').find((entry) => entry.trim().startsWith(name + ':'));
    assert.ok(line, 'Missing design token: ' + name);
    const value = line.trim().slice(name.length + 1).replace(/;$/, '').trim();
    const reference = value.match(/^var\((--[\w-]+)\)$/);
    if (reference) return token(reference[1]);
    const color = parseColor(value);
    assert.ok(color, 'Token ' + name + ' must resolve to a concrete color; received ' + value);
    return value;
}

test('all semantic text colors meet WCAG AA on every neutral RAD surface', () => {
    const backgrounds = ['--color-canvas', '--color-paper', '--color-surface-muted'];
    const foregrounds = [
        '--color-text', '--color-text-muted', '--color-text-subtle',
        '--color-action-text', '--color-terracotta', '--color-success',
        '--color-danger', '--color-warning', '--color-info',
    ];

    for (const foreground of foregrounds) {
        for (const background of backgrounds) {
            const ratio = getContrastRatio(token(foreground), token(background));
            assert.ok(
                ratio >= 4.5,
                foreground + ' on ' + background + ' must be at least 4.5:1 (received ' + ratio.toFixed(2) + ':1)',
            );
        }
    }
});

test('filled action and semantic buttons support high-contrast white labels', () => {
    for (const background of [
        '--color-action', '--color-success', '--color-danger', '--color-warning', '--color-info',
    ]) {
        const ratio = getContrastRatio('#FFFFFF', token(background));
        assert.ok(ratio >= 4.5, 'White text on ' + background + ' must be at least 4.5:1 (received ' + ratio.toFixed(2) + ':1)');
    }
});

test('focus indicators and essential control borders meet the 3:1 non-text threshold', () => {
    for (const background of ['--color-canvas', '--color-paper', '--color-surface-muted']) {
        assert.ok(
            getContrastRatio(token('--color-focus'), token(background)) >= 3,
            'Focus indicator must contrast with ' + background,
        );
        assert.ok(
            getContrastRatio(token('--color-border-strong'), token(background)) >= 3,
            'Strong control boundary must contrast with ' + background,
        );
    }
});

test('the Telegram-inspired message bubble surface retains readable RAD ink contrast', () => {
    const brand = parseColor(token('--color-terracotta'));
    const white = parseColor('#FFFFFF');
    const ownBubble = {
        r: white.r * 0.88 + brand.r * 0.12,
        g: white.g * 0.88 + brand.g * 0.12,
        b: white.b * 0.88 + brand.b * 0.12,
        a: 1,
    };
    assert.ok(getContrastRatio(token('--color-ink'), ownBubble) >= 4.5);
});

test('contrast utility accepts common hex and computed RGB color formats', () => {
    assert.equal(parseColor('#abc').r, 170);
    assert.equal(parseColor('rgb(255 255 255)').g, 255);
    assert.ok(getContrastRatio('#000000', 'rgba(255, 255, 255, 1)') >= 20.9);
});

function mixWithWhite(color, weight) {
    const source = parseColor(color);
    const white = parseColor('#FFFFFF');
    return {
        r: source.r * weight + white.r * (1 - weight),
        g: source.g * weight + white.g * (1 - weight),
        b: source.b * weight + white.b * (1 - weight),
        a: 1,
    };
}

test('semantic status badges preserve readable text on their own tinted surfaces', () => {
    const states = [
        ['--color-success', 0.12],
        ['--color-danger', 0.10],
        ['--color-warning', 0.10],
        ['--color-info', 0.10],
        ['--color-terracotta-strong', 0.10],
    ];
    for (const [foreground, tint] of states) {
        const ratio = getContrastRatio(token(foreground), mixWithWhite(token(foreground), tint));
        assert.ok(ratio >= 4.5, foreground + ' on its semantic badge surface must meet 4.5:1 (received ' + ratio.toFixed(2) + ':1)');
    }
});
