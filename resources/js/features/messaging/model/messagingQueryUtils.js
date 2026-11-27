export const messagingKeys = {
    all: ['messaging'],
    inbox: (endpoint, search, filter, userId) => [...messagingKeys.all, 'inbox', userId ?? 'anonymous', endpoint, search, filter],
    messages: (conversationId, userId) => [...messagingKeys.all, 'user', userId ?? 'anonymous', 'conversation', Number(conversationId), 'messages'],
    safety: (conversationId, userId) => [...messagingKeys.all, 'user', userId ?? 'anonymous', 'conversation', Number(conversationId), 'safety'],
    detail: (conversationId, userId) => [...messagingKeys.all, 'user', userId ?? 'anonymous', 'conversation', Number(conversationId), 'detail'],
};

export function buildInboxParams(pageParam, search, filter) {
    const params = { page: pageParam };
    if (search) params.search = search;
    if (filter !== 'all') params.filter = filter;
    return params;
}

export function getInboxNextPageParam(lastPage) {
    const current = Number(lastPage.current_page ?? 1);
    const last = Number(lastPage.last_page ?? current);
    return current < last ? current + 1 : undefined;
}

export function buildMessageSyncParams(cached) {
    if (!cached) return {};
    return {
        after_id: cached.latestMessageId ?? 0,
        ...(cached.syncCursor ? { updated_after: cached.syncCursor } : {}),
    };
}

export function mergeMessages(current, incoming) {
    const currentById = new Map((current ?? []).map((message) => [Number(message.id), message]));
    const updates = new Map(incoming.map((message) => {
        const previous = currentById.get(Number(message.id));
        return [Number(message.id), previous?.read_at && !message.read_at ? { ...message, read_at: previous.read_at } : message];
    }));
    const merged = (current ?? []).map((message) => updates.get(Number(message.id)) ?? message);
    const known = new Set((current ?? []).map((message) => Number(message.id)));
    return [...merged, ...incoming.filter((message) => !known.has(Number(message.id)))]
        .sort((left, right) => Number(left.id) - Number(right.id));
}

export function updateInboxPages(current, updater) {
    if (!current?.pages?.length) {
        const next = typeof updater === 'function' ? updater([]) : updater;
        return next.length ? {
            pages: [{ data: next, current_page: 1, last_page: 1 }],
            pageParams: [1],
        } : current;
    }

    const flattened = current.pages.flatMap((page) => page.data ?? []);
    const next = typeof updater === 'function' ? updater(flattened) : updater;
    const nextById = new Map(next.map((thread) => [Number(thread.id), thread]));
    const pages = current.pages.map((page) => ({
        ...page,
        data: (page.data ?? []).map((thread) => nextById.get(Number(thread.id))).filter(Boolean),
    }));
    const known = new Set(pages.flatMap((page) => page.data.map((thread) => Number(thread.id))));
    const additions = next.filter((thread) => !known.has(Number(thread.id)));
    if (additions.length && pages.length) pages[0] = { ...pages[0], data: [...additions, ...pages[0].data] };
    return { ...current, pages };
}

export function markIncomingMessagesRead(messages, userId, readAt) {
    return (messages ?? []).map((message) => (
        Number(message.sender_id) !== Number(userId) && !message.read_at
            ? { ...message, read_at: readAt }
            : message
    ));
}

export function markConversationReadInInboxPages(current, conversationId, { remove = false } = {}) {
    if (!current?.pages?.length) return current;

    return updateInboxPages(current, (threads) => threads.flatMap((thread) => {
        if (Number(thread.id) !== Number(conversationId)) return [thread];
        return remove ? [] : [{ ...thread, unread_count: 0 }];
    }));
}
