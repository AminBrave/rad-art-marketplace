import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../../shared/api/httpClient';
import { buildInboxParams, buildMessageSyncParams, getInboxNextPageParam, markConversationReadInInboxPages, markIncomingMessagesRead, mergeMessages, messagingKeys, updateInboxPages } from '../model/messagingQueryUtils';


export function useMessagingQueries({ endpoint, search, filter, conversationId, userId }) {
    const queryClient = useQueryClient();
    const previousUserIdRef = useRef(userId);

    useEffect(() => {
        const previousUserId = previousUserIdRef.current;
        if (previousUserId && previousUserId !== userId) {
            queryClient.removeQueries({ queryKey: [...messagingKeys.all, 'user', previousUserId] });
            queryClient.removeQueries({ queryKey: [...messagingKeys.all, 'inbox', previousUserId] });
        }
        previousUserIdRef.current = userId;
    }, [userId, queryClient]);

    const inboxKey = useMemo(() => messagingKeys.inbox(endpoint, search, filter, userId), [endpoint, search, filter, userId]);

    const inboxQuery = useInfiniteQuery({
        queryKey: inboxKey,
        initialPageParam: 1,
        queryFn: async ({ pageParam, signal }) => {
            const params = buildInboxParams(pageParam, search, filter);
            const { data } = await axios.get(endpoint, { params, signal });
            return data;
        },
        getNextPageParam: (lastPage) => {
            return getInboxNextPageParam(lastPage);
        },
        staleTime: 15_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const threads = useMemo(
        () => (inboxQuery.data?.pages ?? []).flatMap((page) => page.data ?? []),
        [inboxQuery.data],
    );

    const setThreads = useCallback((updater) => {
        queryClient.setQueryData(inboxKey, (current) => updateInboxPages(current, updater));
    }, [inboxKey, queryClient]);

    const { fetchNextPage: fetchNextInboxPage, refetch: refetchInbox } = inboxQuery;
    const loadThreads = useCallback(({ append = false } = {}) => (
        append ? fetchNextInboxPage() : refetchInbox()
    ), [fetchNextInboxPage, refetchInbox]);

    const messagesKey = useMemo(() => messagingKeys.messages(conversationId, userId), [conversationId, userId]);
    const messagesQuery = useQuery({
        queryKey: messagesKey,
        enabled: Boolean(conversationId),
        queryFn: async ({ signal }) => {
            const cached = queryClient.getQueryData(messagesKey);
            const incremental = Boolean(cached);
            const params = buildMessageSyncParams(cached);
            const url = '/api/v1/conversations/' + conversationId + '/messages';
            const { data: firstPage } = await axios.get(url, { params, signal });
            const incoming = [...(firstPage.data ?? [])];
            if (incremental) {
                for (let page = 2; page <= Number(firstPage.last_page ?? 1); page += 1) {
                    const { data: nextPage } = await axios.get(url, { params: { ...params, page }, signal });
                    incoming.push(...(nextPage.data ?? []));
                }
            }
            const latestCache = queryClient.getQueryData(messagesKey) ?? cached;
            const newest = incoming.reduce((latest, message) => (
                !latest || Number(message.id) > Number(latest.id) ? message : latest
            ), null);
            const hasOlder = latestCache?.hasOlder ?? (
                Number(firstPage.current_page ?? 1) < Number(firstPage.last_page ?? 1)
            );
            return {
                messages: latestCache ? mergeMessages(latestCache.messages, incoming) : incoming,
                latestMessageId: Math.max(Number(latestCache?.latestMessageId ?? 0), Number(newest?.id ?? 0)) || null,
                syncCursor: firstPage.sync_cursor ?? latestCache?.syncCursor ?? null,
                hasOlder,
                hasChanges: incoming.length > 0,
                lastSyncedAt: Date.now(),
            };
        },
        refetchInterval: 5_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    const messages = messagesQuery.data?.messages ?? [];
    const setMessages = useCallback((updater) => {
        queryClient.setQueryData(messagesKey, (current) => {
            const previous = current?.messages ?? [];
            const next = typeof updater === 'function' ? updater(previous) : updater;
            const newest = next.reduce((latest, message) => (
                !latest || Number(message.id) > Number(latest.id) ? message : latest
            ), null);
            return {
                ...(current ?? {}),
                messages: next,
                latestMessageId: Math.max(Number(current?.latestMessageId ?? 0), Number(newest?.id ?? 0)) || null,
            };
        });
    }, [messagesKey, queryClient]);

    const setMessagesMeta = useCallback((updater) => {
        queryClient.setQueryData(messagesKey, (current) => current ? { ...current, ...(typeof updater === 'function' ? updater(current) : updater) } : current);
    }, [messagesKey, queryClient]);

    const fetchOlderMessages = useCallback((beforeId) => queryClient.fetchQuery({
        queryKey: [...messagesKey, 'older', Number(beforeId)],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/conversations/' + conversationId + '/messages', {
                params: { before_id: beforeId },
                signal,
            });
            return data;
        },
        staleTime: Infinity,
    }), [conversationId, messagesKey, queryClient]);

    const cancelConversationQueries = useCallback(() => (
        queryClient.cancelQueries({ queryKey: messagesKey })
    ), [messagesKey, queryClient]);

    const safetyQuery = useQuery({
        queryKey: messagingKeys.safety(conversationId, userId),
        enabled: Boolean(conversationId),
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/conversations/' + conversationId + '/safety', { signal });
            return data.data ?? { blocked_by_me: false, blocked_by_other: false };
        },
        staleTime: 30_000,
    });

    const detailQuery = useQuery({
        queryKey: messagingKeys.detail(conversationId, userId),
        enabled: Boolean(conversationId),
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/conversations/' + conversationId, { signal });
            return data.data;
        },
        staleTime: 60_000,
    });

    const requestMutation = useMutation({
        mutationKey: [...messagingKeys.all, 'action'],
        mutationFn: ({ method, url, data, config }) => axios({ method, url, data, ...config }),
    });

    const setSafety = useCallback((updater) => {
        queryClient.setQueryData(messagingKeys.safety(conversationId, userId), (current) => (
            typeof updater === 'function' ? updater(current ?? { blocked_by_me: false, blocked_by_other: false }) : updater
        ));
    }, [conversationId, userId, queryClient]);

    const markReadMutation = useMutation({
        mutationKey: [...messagingKeys.all, 'mark-read'],
        mutationFn: (id) => axios.patch('/api/v1/conversations/' + id + '/read'),
        onSuccess: (_result, id) => {
            queryClient.setQueryData(messagingKeys.messages(id, userId), (current) => current ? {
                ...current,
                messages: markIncomingMessagesRead(current.messages, userId, new Date().toISOString()),
            } : current);
            queryClient.setQueryData(messagingKeys.detail(id, userId), (current) => current ? {
                ...current,
                unread_count: 0,
            } : current);
            const userInboxKey = [...messagingKeys.all, 'inbox', userId ?? 'anonymous'];
            queryClient.getQueryCache().findAll({ queryKey: userInboxKey }).forEach((query) => {
                const isUnreadInbox = query.queryKey[5] === 'unread';
                queryClient.setQueryData(query.queryKey, (current) => (
                    markConversationReadInInboxPages(current, id, { remove: isUnreadInbox })
                ));
            });
        },
    });

    return {
        threads, setThreads, loadThreads, inboxQuery,
        messages, setMessages, setMessagesMeta, messagesQuery, fetchOlderMessages, cancelConversationQueries,
        safety: safetyQuery.data ?? { blocked_by_me: false, blocked_by_other: false },
        safetyQuery, detailQuery, setSafety,
        request: requestMutation.mutateAsync,
        markRead: markReadMutation.mutateAsync,
    };
}
