import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildInboxParams,
    buildMessageSyncParams,
    getInboxNextPageParam,
    markConversationReadInInboxPages,
    markIncomingMessagesRead,
    mergeMessages,
    messagingKeys,
    updateInboxPages,
} from '../../resources/js/app/messagingQueryUtils.js';

test('messaging query keys isolate conversations and private data by user', () => {
    assert.notDeepEqual(messagingKeys.messages(12, 7), messagingKeys.messages(12, 8));
    assert.notDeepEqual(messagingKeys.safety(12, 7), messagingKeys.safety(13, 7));
    assert.notDeepEqual(messagingKeys.detail(12, 7), messagingKeys.detail(12, 8));
    assert.notDeepEqual(
        messagingKeys.inbox('/api/artist/conversations', '', 'all', 7),
        messagingKeys.inbox('/api/artist/conversations', '', 'all', 8),
    );
});

test('inbox query keys distinguish endpoint, search and filter', () => {
    const base = messagingKeys.inbox('/api/conversations', '', 'all', 7);
    assert.notDeepEqual(base, messagingKeys.inbox('/api/artist/conversations', '', 'all', 7));
    assert.notDeepEqual(base, messagingKeys.inbox('/api/conversations', 'Mona', 'all', 7));
    assert.notDeepEqual(base, messagingKeys.inbox('/api/conversations', '', 'unread', 7));
});

test('inbox params always include page and omit default/empty filters', () => {
    assert.deepEqual(buildInboxParams(1, '', 'all'), { page: 1 });
    assert.deepEqual(buildInboxParams(3, ' Mona ', 'unread'), {
        page: 3,
        search: ' Mona ',
        filter: 'unread',
    });
});

test('inbox pagination advances until the final page', () => {
    assert.equal(getInboxNextPageParam({ current_page: 1, last_page: 4 }), 2);
    assert.equal(getInboxNextPageParam({ current_page: '3', last_page: '4' }), 4);
    assert.equal(getInboxNextPageParam({ current_page: 4, last_page: 4 }), undefined);
});

test('inbox pagination handles missing metadata as a single page', () => {
    assert.equal(getInboxNextPageParam({ data: [] }), undefined);
    assert.equal(getInboxNextPageParam({ current_page: 2 }), undefined);
});

test('initial message query omits incremental sync cursors', () => {
    assert.deepEqual(buildMessageSyncParams(undefined), {});
    assert.deepEqual(buildMessageSyncParams(null), {});
});

test('incremental message query uses latest ID and update cursor', () => {
    assert.deepEqual(buildMessageSyncParams({
        latestMessageId: 42,
        syncCursor: '2026-11-14T18:30:00.000000Z',
    }), {
        after_id: 42,
        updated_after: '2026-11-14T18:30:00.000000Z',
    });
});

test('incremental sync falls back to zero when the latest message ID is absent', () => {
    assert.deepEqual(buildMessageSyncParams({}), { after_id: 0 });
});

test('message merging appends new messages and keeps chronological ID order', () => {
    const current = [{ id: 2, body: 'second' }, { id: 4, body: 'fourth' }];
    const incoming = [{ id: 5, body: 'fifth' }, { id: 3, body: 'third' }];

    assert.deepEqual(mergeMessages(current, incoming), [
        { id: 2, body: 'second' },
        { id: 3, body: 'third' },
        { id: 4, body: 'fourth' },
        { id: 5, body: 'fifth' },
    ]);
});

test('message merging updates existing records without duplicating IDs', () => {
    const current = [{ id: 10, body: 'old body' }, { id: 11, body: 'keep' }];
    const incoming = [{ id: '10', body: 'edited body' }];

    assert.deepEqual(mergeMessages(current, incoming), [
        { id: '10', body: 'edited body' },
        { id: 11, body: 'keep' },
    ]);
});

test('message merging preserves a locally confirmed read receipt if sync returns stale data', () => {
    const current = [{ id: 15, body: 'hello', read_at: '2026-11-14T18:00:00Z' }];
    const incoming = [{ id: 15, body: 'edited', read_at: null }];

    assert.deepEqual(mergeMessages(current, incoming), [
        { id: 15, body: 'edited', read_at: '2026-11-14T18:00:00Z' },
    ]);
});

test('message merging does not invent read receipts or discard explicit server values', () => {
    const current = [{ id: 20, body: 'hello', read_at: null }];
    const incoming = [
        { id: 20, body: 'updated', read_at: '2026-11-14T18:05:00Z' },
        { id: 21, body: 'new', read_at: null },
    ];

    assert.deepEqual(mergeMessages(current, incoming), [
        { id: 20, body: 'updated', read_at: '2026-11-14T18:05:00Z' },
        { id: 21, body: 'new', read_at: null },
    ]);
});

test('message merging accepts an empty cache and an empty sync response', () => {
    assert.deepEqual(mergeMessages(undefined, [{ id: 1, body: 'first' }]), [{ id: 1, body: 'first' }]);
    assert.deepEqual(mergeMessages([{ id: 1, body: 'first' }], []), [{ id: 1, body: 'first' }]);
    assert.deepEqual(mergeMessages([], []), []);
});

test('inbox cache updates replace existing threads across pages and prepend new threads once', () => {
    const current = {
        pages: [
            { data: [{ id: 1, title: 'one' }, { id: 2, title: 'two' }], current_page: 1, last_page: 2 },
            { data: [{ id: 3, title: 'three' }], current_page: 2, last_page: 2 },
        ],
        pageParams: [1, 2],
    };

    const updated = updateInboxPages(current, (threads) => [
        { ...threads[0], title: 'one updated' },
        threads[1],
        threads[2],
        { id: 4, title: 'four' },
    ]);

    assert.deepEqual(updated.pages.map((page) => page.data), [
        [{ id: 4, title: 'four' }, { id: 1, title: 'one updated' }, { id: 2, title: 'two' }],
        [{ id: 3, title: 'three' }],
    ]);
    assert.deepEqual(updated.pageParams, [1, 2]);
});

test('inbox cache updates can remove stale threads without disturbing page metadata', () => {
    const current = {
        pages: [
            { data: [{ id: 1 }, { id: 2 }], current_page: 1, last_page: 2 },
            { data: [{ id: 3 }], current_page: 2, last_page: 2 },
        ],
        pageParams: [1, 2],
    };

    const updated = updateInboxPages(current, (threads) => threads.filter((thread) => thread.id !== 2));

    assert.deepEqual(updated.pages.map((page) => page.data), [[{ id: 1 }], [{ id: 3 }]]);
    assert.deepEqual(updated.pages.map(({ current_page, last_page }) => ({ current_page, last_page })), [
        { current_page: 1, last_page: 2 },
        { current_page: 2, last_page: 2 },
    ]);
});

test('inbox cache updates initialize the first page when a conversation is inserted before first fetch', () => {
    assert.deepEqual(updateInboxPages(undefined, [{ id: 9, title: 'direct conversation' }]), {
        pages: [{ data: [{ id: 9, title: 'direct conversation' }], current_page: 1, last_page: 1 }],
        pageParams: [1],
    });
    assert.equal(updateInboxPages(undefined, []), undefined);
});

test('read receipts mark only unread messages from other participants', () => {
    const messages = [
        { id: 1, sender_id: 8, read_at: null },
        { id: 2, sender_id: 7, read_at: null },
        { id: 3, sender_id: 9, read_at: '2026-11-14T18:00:00Z' },
    ];

    assert.deepEqual(markIncomingMessagesRead(messages, 7, '2026-11-14T18:05:00Z'), [
        { id: 1, sender_id: 8, read_at: '2026-11-14T18:05:00Z' },
        { id: 2, sender_id: 7, read_at: null },
        { id: 3, sender_id: 9, read_at: '2026-11-14T18:00:00Z' },
    ]);
});

test('marking a conversation read updates only that conversation in user inbox caches', () => {
    const current = {
        pages: [
            { data: [{ id: 1, unread_count: 3 }, { id: 2, unread_count: 1 }], current_page: 1, last_page: 2 },
            { data: [{ id: 3, unread_count: 5 }], current_page: 2, last_page: 2 },
        ],
        pageParams: [1, 2],
    };

    const updated = markConversationReadInInboxPages(current, '2');

    assert.deepEqual(updated.pages.map((page) => page.data), [
        [{ id: 1, unread_count: 3 }, { id: 2, unread_count: 0 }],
        [{ id: 3, unread_count: 5 }],
    ]);
    assert.deepEqual(updated.pageParams, [1, 2]);
    assert.deepEqual(updated.pages.map(({ current_page, last_page }) => ({ current_page, last_page })), [
        { current_page: 1, last_page: 2 },
        { current_page: 2, last_page: 2 },
    ]);
});

test('marking a conversation read removes it from unread inbox pages', () => {
    const current = {
        pages: [
            { data: [{ id: 1, unread_count: 2 }, { id: 2, unread_count: 1 }], current_page: 1, last_page: 2 },
            { data: [{ id: 3, unread_count: 4 }], current_page: 2, last_page: 2 },
        ],
        pageParams: [1, 2],
    };

    const updated = markConversationReadInInboxPages(current, 2, { remove: true });

    assert.deepEqual(updated.pages.map((page) => page.data), [
        [{ id: 1, unread_count: 2 }],
        [{ id: 3, unread_count: 4 }],
    ]);
    assert.deepEqual(updated.pageParams, [1, 2]);
    assert.deepEqual(updated.pages.map(({ current_page, last_page }) => ({ current_page, last_page })), [
        { current_page: 1, last_page: 2 },
        { current_page: 2, last_page: 2 },
    ]);
    assert.equal(markConversationReadInInboxPages(undefined, 2, { remove: true }), undefined);
});
