import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { queryClient } from '../../resources/js/lib/queryClient.js';

test('query defaults retry transient failures once but never retry ordinary client errors', () => {
    const retry = queryClient.getDefaultOptions().queries.retry;

    assert.equal(retry(0, { response: { status: 422 } }), false);
    assert.equal(retry(0, { response: { status: 503 } }), true);
    assert.equal(retry(0, { response: { status: 408 } }), true);
    assert.equal(retry(0, { response: { status: 429 } }), true);
    assert.equal(retry(0, { response: { status: 401 } }), false);
    assert.equal(retry(1, { response: { status: 503 } }), false);
    assert.equal(retry(0, new Error('network unavailable')), true);
});

test('mutations are not retried automatically', () => {
    assert.equal(queryClient.getDefaultOptions().mutations.retry, false);
});


test('query retry policy retries one transient server failure and then resolves', async () => {
    const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
    let attempts = 0;

    try {
        const result = await client.fetchQuery({
            queryKey: ['frontend-query-contract', 'transient-retry'],
            queryFn: async () => {
                attempts += 1;
                if (attempts === 1) {
                    throw Object.assign(new Error('temporary outage'), { response: { status: 503 } });
                }
                return 'recovered';
            },
            retryDelay: 0,
        });

        assert.equal(result, 'recovered');
        assert.equal(attempts, 2);
    } finally {
        client.clear();
    }
});

test('query retry policy does not retry validation or other ordinary client failures', async () => {
    const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
    let attempts = 0;

    try {
        await assert.rejects(
            client.fetchQuery({
                queryKey: ['frontend-query-contract', 'client-error'],
                queryFn: async () => {
                    attempts += 1;
                    throw Object.assign(new Error('invalid request'), { response: { status: 422 } });
                },
                retryDelay: 0,
            }),
            /invalid request/,
        );
        assert.equal(attempts, 1);
    } finally {
        client.clear();
    }
});

test('fresh query data is reused until the configured stale time expires', async () => {
    const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
    let attempts = 0;

    try {
        const options = {
            queryKey: ['frontend-query-contract', 'fresh-cache'],
            queryFn: async () => {
                attempts += 1;
                return { value: attempts };
            },
        };

        assert.deepEqual(await client.fetchQuery(options), { value: 1 });
        assert.deepEqual(await client.fetchQuery(options), { value: 1 });
        assert.equal(attempts, 1);
    } finally {
        client.clear();
    }
});

test('mutations expose pending then success state and preserve returned data', async () => {
    const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
    const mutation = client.getMutationCache().build(client, {
        mutationKey: ['frontend-mutation-contract', 'success'],
        mutationFn: async ({ title }) => ({ id: 5, title }),
    });

    try {
        const result = mutation.execute({ title: 'اثر تازه' });
        assert.equal(mutation.state.status, 'pending');
        assert.deepEqual(mutation.state.variables, { title: 'اثر تازه' });

        assert.deepEqual(await result, { id: 5, title: 'اثر تازه' });
        assert.equal(mutation.state.status, 'success');
        assert.deepEqual(mutation.state.data, { id: 5, title: 'اثر تازه' });
    } finally {
        client.clear();
    }
});

test('failed mutations settle in error state without automatic retry', async () => {
    const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
    let attempts = 0;
    const mutation = client.getMutationCache().build(client, {
        mutationKey: ['frontend-mutation-contract', 'failure'],
        mutationFn: async () => {
            attempts += 1;
            throw new Error('save failed');
        },
    });

    try {
        await assert.rejects(mutation.execute(), /save failed/);
        assert.equal(mutation.state.status, 'error');
        assert.equal(attempts, 1);
    } finally {
        client.clear();
    }
});
