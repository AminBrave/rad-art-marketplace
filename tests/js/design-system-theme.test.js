import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getInitialTheme,
    isThemeEnabled,
    persistThemePreference,
    readThemePreference,
    resolveTheme,
} from '../../resources/js/design-system/theme-utils.js';

const config = {
    defaultTheme: 'new-york',
    allowRuntimeSwitching: true,
    persistSelection: true,
    storageKey: 'rad-art-theme',
    themes: {
        editorial: { id: 'editorial', enabled: true },
        'new-york': { id: 'new-york', enabled: true },
        disabled: { id: 'disabled', enabled: false },
    },
};

function createStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        values,
    };
}

test('defaults to New York when there is no saved preference', () => {
    assert.equal(getInitialTheme(createStorage(), config), 'new-york');
});

test('restores an enabled saved theme', () => {
    assert.equal(getInitialTheme(createStorage({ 'rad-art-theme': 'editorial' }), config), 'editorial');
});

test('invalid and disabled preferences safely fall back to the configured default', () => {
    assert.equal(getInitialTheme(createStorage({ 'rad-art-theme': 'unknown' }), config), 'new-york');
    assert.equal(getInitialTheme(createStorage({ 'rad-art-theme': 'disabled' }), config), 'new-york');
    assert.equal(resolveTheme('disabled', config), 'new-york');
});

test('theme persistence writes only enabled themes', () => {
    const storage = createStorage();
    assert.equal(persistThemePreference(storage, 'editorial', config), true);
    assert.equal(storage.getItem('rad-art-theme'), 'editorial');
    assert.equal(persistThemePreference(storage, 'disabled', config), false);
});

test('switching and persistence flags are respected', () => {
    const storage = createStorage({ 'rad-art-theme': 'editorial' });
    const locked = { ...config, allowRuntimeSwitching: false };
    assert.equal(readThemePreference(storage, locked), null);
    assert.equal(persistThemePreference(storage, 'new-york', locked), false);
    assert.equal(getInitialTheme(storage, locked), 'new-york');
});

test('storage exceptions fail safely', () => {
    const brokenStorage = {
        getItem() { throw new Error('blocked'); },
        setItem() { throw new Error('blocked'); },
    };
    assert.equal(readThemePreference(brokenStorage, config), null);
    assert.equal(persistThemePreference(brokenStorage, 'editorial', config), false);
});

test('theme validation rejects unknown identifiers', () => {
    assert.equal(isThemeEnabled('new-york', config), true);
    assert.equal(isThemeEnabled('unknown', config), false);
});
