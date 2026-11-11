import test from 'node:test';
import assert from 'node:assert/strict';
import { isFeatureEnabled } from '../../resources/js/app/features.js';

test('feature flags are read from the server-provided registry', () => {
    globalThis.window = { __RAD_FEATURES__: { inquiries: false, messaging: true } };

    assert.equal(isFeatureEnabled('inquiries'), false);
    assert.equal(isFeatureEnabled('messaging'), true);
    assert.equal(isFeatureEnabled('unknown-feature'), false);
});

test('feature flags fail closed when the registry is unavailable', () => {
    delete globalThis.window;

    assert.equal(isFeatureEnabled('inquiries'), false);
});
