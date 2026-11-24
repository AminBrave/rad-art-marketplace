import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const mutationModules = [
    'resources/js/app/AuthContext.jsx',
    'resources/js/app/AuthPage.jsx',
    'resources/js/app/RoutingPages.jsx',
    'resources/js/app/ArtworkStudio.jsx',
    'resources/js/app/AdminWorkspace.jsx',
    'resources/js/app/EditorialPages.jsx',
    'resources/js/app/Layouts.jsx',
    'resources/js/app/useMessagingQueries.js',
];

const sources = new Map(mutationModules.map((path) => [
    path,
    readFileSync(new URL('../../' + path, import.meta.url), 'utf8'),
]));

test('frontend API writes are declared as TanStack Query mutation functions', () => {
    const writeCall = /\baxios\.(?:post|put|patch|delete)\s*\(|\baxios\s*\(\s*\{\s*method\b/g;

    for (const [path, source] of sources) {
        assert.match(source, /useMutation\s*\(/, path + ' must use TanStack Query mutations');

        for (const match of source.matchAll(writeCall)) {
            const context = source.slice(Math.max(0, match.index - 240), match.index + 40);
            assert.match(context, /mutationFn\s*:/, path + ' contains an API write outside a mutationFn');
        }
    }
});

test('frontend mutation declarations expose stable mutation keys', () => {
    for (const [path, source] of sources) {
        const mutationCount = (source.match(/useMutation\s*\(\s*\{/g) ?? []).length;
        const keyCount = (source.match(/mutationKey\s*:/g) ?? []).length;
        assert.equal(keyCount, mutationCount, path + ' must give each mutation a mutationKey');
    }
});

test('messaging UI dispatches writes through the TanStack-backed request mutation', () => {
    const messaging = readFileSync(new URL('../../resources/js/app/MessagingCenter.jsx', import.meta.url), 'utf8');
    const queries = sources.get('resources/js/app/useMessagingQueries.js');

    assert.match(queries, /request:\s*requestMutation\.mutateAsync/);
    assert.match(messaging, /request\(\{\s*method:/);
    assert.doesNotMatch(messaging, /axios\.(?:post|put|patch|delete)\s*\(/);
});
