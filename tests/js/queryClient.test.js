import assert from 'node:assert/strict';
import test from 'node:test';
import { queryClient } from '../../resources/js/lib/queryClient.js';

test('query defaults retry transient failures once but never retry ordinary client errors', () => {
    const retry = queryClient.getDefaultOptions().queries.retry;

    assert.equal(retry(0, { response: { status: 422 } }), false);
    assert.equal(retry(0, { response: { status: 503 } }), true);
    assert.equal(retry(1, { response: { status: 503 } }), false);
    assert.equal(retry(0, new Error('network unavailable')), true);
});

test('mutations are not retried automatically', () => {
    assert.equal(queryClient.getDefaultOptions().mutations.retry, false);
});
