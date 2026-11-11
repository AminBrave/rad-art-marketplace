import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Link, useSearchParams } from 'react-router-dom';

const reactionOptions = ['👍', '❤️', '😂', '😮', '🙏', '🎨'];

function dateLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

function timeLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fa-IR', { dateStyle: 'medium' });
}

export default function MessagingCenter({ role }) {
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const [threads, setThreads] = useState([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [threadFilter, setThreadFilter] = useState('all');
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState('');
    const [pendingMessageId, setPendingMessageId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [replyTo, setReplyTo] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [hasOlderMessages, setHasOlderMessages] = useState(false);
    const [hasMoreThreads, setHasMoreThreads] = useState(false);
    const [loadingMoreThreads, setLoadingMoreThreads] = useState(false);
    const [sending, setSending] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [safety, setSafety] = useState({ blocked_by_me: false, blocked_by_other: false });
    const [safetyLoading, setSafetyLoading] = useState(true);
    const messagesContainerRef = useRef(null);
    const messagesRef = useRef(messages);
    useEffect(() => { messagesRef.current = messages; }, [messages]);
    const draftRef = useRef(null);
    const fileInputRef = useRef(null);
    const latestMessageIdRef = useRef(null);
    const syncCursorRef = useRef(null);
    const activeConversationRef = useRef(null);
    const messageRequestRef = useRef(null);
    const historyRequestRef = useRef(null);
    const historyLoadingRef = useRef(false);
    const hasOlderMessagesRef = useRef(false);
    const pendingScrollRestoreRef = useRef(null);
    const draftsByConversationRef = useRef(new Map());
    const filesByConversationRef = useRef(new Map());
    const pendingIdsByConversationRef = useRef(new Map());
    const threadsRequestRef = useRef(null);
    const threadsPageRef = useRef(1);
    const threadsRef = useRef(threads);
    const hasLoadedThreadsRef = useRef(false);
    const directStartKeyRef = useRef(null);
    const directStartRequestRef = useRef(null);
    const shouldStickToBottomRef = useRef(true);

    useEffect(() => {
        return () => {
            threadsRequestRef.current?.abort();
            messageRequestRef.current?.abort();
            historyRequestRef.current?.abort();
            directStartRequestRef.current?.abort();
        };
    }, []);

    const endpoint = role === 'artist' ? '/api/v1/artist/conversations' : '/api/v1/buyer/conversations';
    const loadThreads = useCallback(async ({ append = false } = {}) => {
        threadsRequestRef.current?.abort();
        const controller = new AbortController();
        threadsRequestRef.current = controller;
        if (append) setLoadingMoreThreads(true);
        else {
            setLoading(!hasLoadedThreadsRef.current);
            setLoadingMoreThreads(false);
        }
        const page = append ? threadsPageRef.current + 1 : 1;
        try {
            const query = { page };
            if (debouncedSearch) query.search = debouncedSearch;
            if (threadFilter !== 'all') query.filter = threadFilter;
            const { data } = await axios.get(endpoint, { params: query, signal: controller.signal });
            if (!controller.signal.aborted) {
                const received = data.data ?? [];
                setThreads((current) => {
                    if (!append) {
                        const activeThread = current.find((thread) => Number(thread.id) === Number(activeConversationRef.current));
                        return activeThread && !received.some((thread) => Number(thread.id) === Number(activeThread.id))
                            ? [activeThread, ...received] : received;
                    }
                    const known = new Set(current.map((thread) => Number(thread.id)));
                    return [...current, ...received.filter((thread) => !known.has(Number(thread.id)))];
                });
                hasLoadedThreadsRef.current = true;
                threadsPageRef.current = Number(data.current_page ?? page);
                setHasMoreThreads(Number(data.current_page ?? page) < Number(data.last_page ?? page));
            }
        } catch (requestError) {
            if (!axios.isCancel(requestError) && !controller.signal.aborted) setError('دریافت گفتگوها انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (threadsRequestRef.current === controller) {
                threadsRequestRef.current = null;
                if (append) setLoadingMoreThreads(false);
                else setLoading(false);
            }
        }
    }, [endpoint, debouncedSearch, threadFilter]);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
        return () => window.clearTimeout(timer);
    }, [search]);

    const loadThreadsRef = useRef(loadThreads);
    useEffect(() => { loadThreadsRef.current = loadThreads; }, [loadThreads]);
    useEffect(() => { threadsRef.current = threads; }, [threads]);

    const updateThreadSetting = async (thread, setting, value) => {
        try {
            await axios.patch('/api/v1/conversations/' + thread.id + '/settings', { [setting]: value });
            await loadThreads();
        } catch {
            setError('به‌روزرسانی وضعیت گفتگو انجام نشد.');
        }
    };

    const loadMessages = useCallback(async (id, { incremental = false } = {}) => {
        if (!id || (incremental && (messageRequestRef.current || historyLoadingRef.current))) return;
        if (!incremental) messageRequestRef.current?.abort();
        const controller = new AbortController();
        messageRequestRef.current = controller;
        const url = '/api/v1/conversations/' + id + '/messages';
        try {
            const query = incremental ? {
                after_id: latestMessageIdRef.current ?? 0,
                ...(syncCursorRef.current ? { updated_after: syncCursorRef.current } : {}),
            } : {};
            const { data: firstPage } = await axios.get(url, { params: query, signal: controller.signal });
            if (controller.signal.aborted || Number(activeConversationRef.current) !== Number(id)) return;
            const incoming = [...(firstPage.data ?? [])];
            if (incremental) {
                for (let page = 2; page <= Number(firstPage.last_page ?? 1); page += 1) {
                    const { data: nextPage } = await axios.get(url, { params: { ...query, page }, signal: controller.signal });
                    if (controller.signal.aborted || Number(activeConversationRef.current) !== Number(id)) return;
                    incoming.push(...(nextPage.data ?? []));
                }
            }
            if (incremental) {
                setMessages((current) => {
                    const updates = new Map(incoming.map((message) => [Number(message.id), message]));
                    const merged = current.map((message) => updates.get(Number(message.id)) ?? message);
                    const known = new Set(current.map((message) => Number(message.id)));
                    const next = incoming.filter((message) => !known.has(Number(message.id)));
                    return next.length ? [...merged, ...next].sort((left, right) => Number(left.id) - Number(right.id)) : merged;
                });
            } else {
                setMessages(incoming);
                hasOlderMessagesRef.current = Number(firstPage.current_page ?? 1) < Number(firstPage.last_page ?? 1);
                setHasOlderMessages(hasOlderMessagesRef.current);
                shouldStickToBottomRef.current = true;
            }
            if (incremental && !shouldStickToBottomRef.current) {
                const newIncomingCount = incoming.filter((message) =>
                    Number(message.id) > Number(latestMessageIdRef.current ?? 0)
                    && Number(message.sender_id) !== Number(user?.id)
                ).length;
                if (newIncomingCount) setNewMessageCount((count) => count + newIncomingCount);
            }
            const newest = incoming.reduce((latest, message) =>
                !latest || Number(message.id) > Number(latest.id) ? message : latest, null);
            if (newest?.id) latestMessageIdRef.current = Math.max(Number(latestMessageIdRef.current ?? 0), Number(newest.id));
            if (firstPage.sync_cursor) syncCursorRef.current = firstPage.sync_cursor;
            const hasUnreadIncoming = incoming.some((message) =>
                Number(message.sender_id) !== Number(user?.id) && !message.read_at
            );
            if (!incremental || hasUnreadIncoming) {
                await axios.patch('/api/v1/conversations/' + id + '/read', {}, { signal: controller.signal });
                if (controller.signal.aborted || Number(activeConversationRef.current) !== Number(id)) return;
                setThreads((current) => current.map((thread) =>
                    Number(thread.id) === Number(id) ? { ...thread, unread_count: 0 } : thread
                ));
            }
            // Keep the inbox preview and unread badge in sync for new messages and edits,
            // including messages sent from another tab/device by the current user.
            if (!incremental || incoming.length > 0) loadThreadsRef.current();
        } catch (requestError) {
            if (!axios.isCancel(requestError) && !controller.signal.aborted
                && Number(activeConversationRef.current) === Number(id)) setError('دریافت پیام‌ها انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (messageRequestRef.current === controller) {
                messageRequestRef.current = null;
                if (Number(activeConversationRef.current) === Number(id)) setMessagesLoading(false);
            }
        }
    }, [user?.id]);

    useEffect(() => {
        const previousConversation = activeConversationRef.current;
        if (previousConversation && previousConversation !== active && draftRef.current) {
            draftsByConversationRef.current.set(Number(previousConversation), draftRef.current.value);
        }
        if (previousConversation && previousConversation !== active && selectedFile) {
            filesByConversationRef.current.set(Number(previousConversation), selectedFile);
        }
        messageRequestRef.current?.abort();
        historyRequestRef.current?.abort();
        historyLoadingRef.current = false;
        setLoadingOlder(false);
        hasOlderMessagesRef.current = false;
        setHasOlderMessages(false);
        pendingScrollRestoreRef.current = null;
        activeConversationRef.current = active;
        setMessages([]);
        setNewMessageCount(0);
        setMessagesLoading(Boolean(active));
        shouldStickToBottomRef.current = true;
        latestMessageIdRef.current = null;
        syncCursorRef.current = null;
        setDraft(active ? (draftsByConversationRef.current.get(Number(active)) ?? '') : '');
        setSelectedFile(active ? (filesByConversationRef.current.get(Number(active)) ?? null) : null);
        setUploadProgress(0);
        setReplyTo(null);
        setEditingId(null);
        setEditDraft('');
        setPendingMessageId(active ? (pendingIdsByConversationRef.current.get(Number(active)) ?? null) : null);
        setActionId(null);
        setError('');
        setNotice('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (draftRef.current) draftRef.current.style.height = 'auto';
        setSafety({ blocked_by_me: false, blocked_by_other: false });
        setSafetyLoading(Boolean(active));
        if (!active) {
            setSafetyLoading(false);
            return undefined;
        }
        let cancelled = false;
        axios.get('/api/v1/conversations/' + active + '/safety')
            .then(({ data }) => {
                if (!cancelled) {
                    setSafety(data.data ?? { blocked_by_me: false, blocked_by_other: false });
                    setSafetyLoading(false);
                }
            })
            .catch((requestError) => {
                if (!cancelled && !axios.isCancel(requestError)) {
                    setSafetyLoading(false);
                    setError('وضعیت ایمنی گفتگو دریافت نشد.');
                }
            });
        if (!threadsRef.current.some((thread) => Number(thread.id) === Number(active))) {
            axios.get('/api/v1/conversations/' + active)
                .then(({ data }) => {
                    if (!cancelled && data.data) setThreads((current) => [
                        data.data, ...current.filter((thread) => Number(thread.id) !== Number(data.data.id)),
                    ]);
                })
                .catch(() => { if (!cancelled) setError('اطلاعات این گفتگو دریافت نشد.'); });
        }
        return () => {
            cancelled = true;
            messageRequestRef.current?.abort();
            historyRequestRef.current?.abort();
        };
    }, [active]);

    useEffect(() => {
        const textarea = draftRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 144) + 'px';
    }, [draft]);

    useEffect(() => {
        if (!selectedFile || !selectedFile.type.startsWith('image/')) { setFilePreview(''); return undefined; }
        const url = window.URL.createObjectURL(selectedFile);
        setFilePreview(url);
        return () => window.URL.revokeObjectURL(url);
    }, [selectedFile]);

    const requestedConversation = params.get('conversation');

    useEffect(() => {
        const id = Number(requestedConversation);
        if (Number.isSafeInteger(id) && id > 0) setActive(id);
    }, [requestedConversation]);

    useEffect(() => { loadThreads(); }, [loadThreads]);
    const artistSlug = params.get('artist');
    const artworkSlug = params.get('artwork');

    useEffect(() => {
        if (role !== 'buyer' || !artistSlug) return undefined;
        const requestKey = artistSlug + ':' + (artworkSlug || '');
        if (directStartKeyRef.current === requestKey) return undefined;
        directStartKeyRef.current = requestKey;
        // Remove the one-shot deep link immediately so unrelated renders/search changes
        // cannot accidentally create the same direct conversation more than once.
        setParams((current) => {
            const next = new URLSearchParams(current);
            next.delete('artist');
            next.delete('artwork');
            return next;
        }, { replace: true });
        const controller = new AbortController();
        directStartRequestRef.current = controller;
        axios.post('/api/v1/conversations/direct', { artist_slug: artistSlug, artwork_slug: artworkSlug || null }, { signal: controller.signal })
            .then(async ({ data }) => {
                if (controller.signal.aborted) return;
                await loadThreadsRef.current();
                if (controller.signal.aborted) return;
                setActive(data.data.id);
                setParams((current) => {
                    const next = new URLSearchParams(current);
                    next.set('conversation', String(data.data.id));
                    return next;
                }, { replace: true });
                directStartKeyRef.current = null;
            })
            .catch((requestError) => {
                if (!axios.isCancel(requestError) && !controller.signal.aborted) {
                    directStartKeyRef.current = null;
                    setError('شروع گفتگوی مستقیم ممکن نشد. ممکن است پروفایل یا اثر دیگر عمومی نباشد.');
                }
            })
            .finally(() => {
                if (directStartRequestRef.current === controller) directStartRequestRef.current = null;
            });
    }, [artistSlug, artworkSlug, role, setParams]);

    useEffect(() => {
        if (!active) return undefined;
        loadMessages(active);
        const syncWhenVisible = () => {
            if (document.visibilityState === 'visible') loadMessages(active, { incremental: true });
        };
        const poll = window.setInterval(syncWhenVisible, 5000);
        document.addEventListener('visibilitychange', syncWhenVisible);
        window.addEventListener('focus', syncWhenVisible);
        return () => {
            window.clearInterval(poll);
            document.removeEventListener('visibilitychange', syncWhenVisible);
            window.removeEventListener('focus', syncWhenVisible);
        };
    }, [active, loadMessages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return undefined;
        if (pendingScrollRestoreRef.current) {
            const previous = pendingScrollRestoreRef.current;
            pendingScrollRestoreRef.current = null;
            const frame = window.requestAnimationFrame(() => {
                container.scrollTop = previous.scrollTop + (container.scrollHeight - previous.scrollHeight);
            });
            return () => window.cancelAnimationFrame(frame);
        }
        if (!shouldStickToBottomRef.current) return undefined;
        const frame = window.requestAnimationFrame(() => container.scrollTo({
            top: container.scrollHeight,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        }));
        return () => window.cancelAnimationFrame(frame);
    }, [messages]);

    const loadOlderMessages = useCallback(async () => {
        const conversationId = activeConversationRef.current;
        if (!conversationId || !hasOlderMessagesRef.current || historyLoadingRef.current) return;
        historyLoadingRef.current = true;
        setLoadingOlder(true);
        const controller = new AbortController();
        historyRequestRef.current = controller;
        const container = messagesContainerRef.current;
        const previousHeight = container?.scrollHeight ?? 0;
        const previousTop = container?.scrollTop ?? 0;
        const beforeId = messagesRef.current?.[0]?.id;
        if (!beforeId) {
            historyRequestRef.current = null;
            historyLoadingRef.current = false;
            setLoadingOlder(false);
            return;
        }
        try {
            const { data } = await axios.get('/api/v1/conversations/' + conversationId + '/messages', {
                params: { before_id: beforeId }, signal: controller.signal,
            });
            if (controller.signal.aborted || Number(activeConversationRef.current) !== Number(conversationId)) return;
            const older = data.data ?? [];
            if (older.length && container) {
                pendingScrollRestoreRef.current = { scrollHeight: previousHeight, scrollTop: previousTop };
                shouldStickToBottomRef.current = false;
                setMessages((current) => {
                    const known = new Set(current.map((message) => Number(message.id)));
                    return [...older.filter((message) => !known.has(Number(message.id))), ...current]
                        .sort((left, right) => Number(left.id) - Number(right.id));
                });
            }
            hasOlderMessagesRef.current = Number(data.current_page ?? 1) < Number(data.last_page ?? 1);
            setHasOlderMessages(hasOlderMessagesRef.current);
        } catch (requestError) {
            if (!axios.isCancel(requestError) && !controller.signal.aborted
                && Number(activeConversationRef.current) === Number(conversationId)) setError('دریافت پیام‌های قدیمی‌تر انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (historyRequestRef.current === controller) historyRequestRef.current = null;
            if (Number(activeConversationRef.current) === Number(conversationId)) {
                historyLoadingRef.current = false;
                setLoadingOlder(false);
            }
        }
    }, []);

    const replaceMessage = (updated) => {
        setMessages((current) => current.map((message) => message.id === updated.id ? updated : message));
    };

    const send = async (event) => {
        event.preventDefault();
        const conversationId = active;
        const body = draft.trim();
        if ((!body && !selectedFile) || !active || sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other) return;
        setSending(true);
        setError('');
        const messageClientId = pendingMessageId || (window.crypto?.randomUUID?.() ?? ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2)));
        setPendingMessageId(messageClientId);
        pendingIdsByConversationRef.current.set(Number(conversationId), messageClientId);
        try {
            const { data } = await axios.post('/api/v1/conversations/' + conversationId + '/messages', {
                body: body || 'فایل پیوست',
                reply_to_id: replyTo?.id ?? null,
                client_message_id: messageClientId,
            });
            let savedMessage = data.data;
            const attachmentAlreadySaved = selectedFile && savedMessage.attachments?.some((attachment) =>
                attachment.name === selectedFile.name && Number(attachment.size_bytes) === Number(selectedFile.size)
            );
            if (selectedFile && !attachmentAlreadySaved) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploaded = await axios.post('/api/v1/conversations/' + conversationId + '/messages/' + savedMessage.id + '/attachments', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (event) => {
                        if (Number(activeConversationRef.current) === Number(conversationId)) {
                            setUploadProgress(event.total ? Math.round((event.loaded * 100) / event.total) : 0);
                        }
                    },
                });
                savedMessage = { ...savedMessage, attachments: [...(savedMessage.attachments ?? []), { ...uploaded.data.data, download_url: '/api/v1/conversations/' + conversationId + '/messages/' + savedMessage.id + '/attachments/' + uploaded.data.data.id }] };
            }
            if (Number(activeConversationRef.current) === Number(conversationId)) setMessages((current) => current.some((item) => item.id === savedMessage.id) ? current.map((item) => item.id === savedMessage.id ? savedMessage : item) : [...current, savedMessage]);
            pendingIdsByConversationRef.current.delete(Number(conversationId));
            draftsByConversationRef.current.delete(Number(conversationId));
            filesByConversationRef.current.delete(Number(conversationId));
            if (Number(activeConversationRef.current) === Number(conversationId)) {
                latestMessageIdRef.current = Math.max(Number(latestMessageIdRef.current ?? 0), Number(savedMessage.id));
                shouldStickToBottomRef.current = true;
                draftsByConversationRef.current.delete(Number(conversationId));
                setDraft('');
                if (draftRef.current) draftRef.current.style.height = 'auto';
                if (fileInputRef.current) fileInputRef.current.value = '';
                setSelectedFile(null);
                setPendingMessageId(null);
                pendingIdsByConversationRef.current.delete(Number(conversationId));
                setUploadProgress(0);
                setReplyTo(null);
                shouldStickToBottomRef.current = true;
            }
            loadThreads();
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('ارسال پیام یا پیوست انجام نشد. وضعیت پیام را بررسی و دوباره تلاش کنید.');
        } finally { setSending(false); }
    };

    const saveEdit = async (event, message) => {
        event.preventDefault();
        const conversationId = active;
        const body = editDraft.trim();
        if (!body || actionId) return;
        setActionId(message.id);
        try {
            const { data } = await axios.patch('/api/v1/conversations/' + conversationId + '/messages/' + message.id, { body });
            if (Number(activeConversationRef.current) === Number(conversationId)) {
                replaceMessage(data.data);
                setEditingId(null);
                setEditDraft('');
            }
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('ویرایش پیام انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (Number(activeConversationRef.current) === Number(conversationId)) setActionId(null);
        }
    };

    const deleteMessage = async (message) => {
        const conversationId = active;
        if (actionId || !window.confirm('این پیام برای هر دو طرف حذف شود؟')) return;
        setActionId(message.id);
        try {
            const { data } = await axios.delete('/api/v1/conversations/' + conversationId + '/messages/' + message.id);
            if (Number(activeConversationRef.current) === Number(conversationId)) replaceMessage(data.data);
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('حذف پیام انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (Number(activeConversationRef.current) === Number(conversationId)) setActionId(null);
        }
    };

    const reportMessage = async (message) => {
        const conversationId = active;
        const details = window.prompt('دلیل گزارش این پیام را کوتاه توضیح دهید:');
        if (details === null) return;
        try {
            await axios.post('/api/v1/conversations/' + conversationId + '/messages/' + message.id + '/report', { reason: 'other', details });
            if (Number(activeConversationRef.current) === Number(conversationId)) setNotice('گزارش شما برای بررسی ثبت شد.');
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('ثبت گزارش انجام نشد. دوباره تلاش کنید.');
        }
    };

    const reportConversation = async () => {
        const conversationId = active;
        const details = window.prompt('دلیل گزارش این گفتگو را کوتاه توضیح دهید:');
        if (details === null) return;
        try {
            await axios.post('/api/v1/conversations/' + conversationId + '/report', { reason: 'other', details });
            if (Number(activeConversationRef.current) === Number(conversationId)) setNotice('گزارش گفتگو برای بررسی ثبت شد.');
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('ثبت گزارش گفتگو انجام نشد.');
        }
    };

    const toggleBlock = async () => {
        const conversationId = active;
        try {
            if (safety.blocked_by_me) {
                await axios.delete('/api/v1/conversations/' + conversationId + '/block');
                if (Number(activeConversationRef.current) === Number(conversationId)) {
                    setSafety((current) => ({ ...current, blocked_by_me: false }));
                    setNotice('مسدودسازی برداشته شد.');
                }
            } else if (window.confirm('با مسدودسازی این کاربر، ارسال پیام در این گفتگو برای هر دو طرف متوقف می‌شود. ادامه می‌دهید؟')) {
                await axios.post('/api/v1/conversations/' + conversationId + '/block');
                if (Number(activeConversationRef.current) === Number(conversationId)) {
                    setSafety((current) => ({ ...current, blocked_by_me: true }));
                    setNotice('کاربر مسدود شد.');
                }
            }
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('به‌روزرسانی وضعیت مسدودسازی انجام نشد.');
        }
    };

    const toggleReaction = async (message, emoji) => {
        const conversationId = active;
        if (actionId || message.deleted_at) return;
        const existing = message.reactions?.find((reaction) => reaction.emoji === emoji);
        setActionId(message.id);
        try {
            const { data } = await axios.post('/api/v1/conversations/' + conversationId + '/messages/' + message.id + '/reactions', {
                emoji,
                action: existing?.reacted_by_me ? 'remove' : 'add',
            });
            if (Number(activeConversationRef.current) === Number(conversationId)) replaceMessage(data.data);
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('ثبت واکنش انجام نشد. دوباره تلاش کنید.');
        } finally { setActionId(null); }
    };

    const selected = threads.find((item) => Number(item.id) === Number(active));

    return (
        <section className="rad-messaging space-y-5 font-sans" dir="rtl">
            <header className="border-b border-border pb-5">
                <p className="text-sm font-bold text-terracotta-strong">ارتباط مستقیم</p>
                <h1 className="mt-2 text-2xl font-black">پیام‌ها</h1>
                <p className="mt-2 text-sm text-muted">گفتگوی خصوصی خریداران و هنرمندان؛ پیام‌ها به‌صورت خودکار به‌روزرسانی می‌شوند.</p>
            </header>
            {notice && <p role="status" className="border border-border bg-surface-muted p-3 text-sm">{notice}</p>}
            {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <div className="grid h-[calc(100dvh-14rem)] min-h-[min(420px,calc(100dvh-14rem))] max-h-[900px] grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_55px_rgba(36,35,32,0.07)] lg:h-[min(82dvh,900px)] lg:min-h-[min(620px,calc(100dvh-14rem))] lg:grid-cols-[360px_minmax(0,1fr)]">
                <aside className={active ? 'hidden h-full min-h-0 flex-col border-l border-border bg-white lg:flex' : 'flex h-full min-h-0 flex-col border-l border-border bg-white'}>
                    <div className="shrink-0 border-b border-border bg-white px-5 py-5">
                        <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold tracking-wide text-terracotta-strong">RAD / MESSAGES</p><h2 className="mt-1 text-lg font-black">گفتگوها</h2></div><span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold text-muted">{threads.length} گفتگو</span></div>
                    </div>
                    <div className="shrink-0 space-y-3 border-b border-border bg-surface-muted p-4">
                        <input aria-label="جستجوی گفتگوها" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو در گفتگوها…" className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-border focus:ring-0" />
                        <select aria-label="فیلتر گفتگوها" value={threadFilter} onChange={(event) => setThreadFilter(event.target.value)} className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta">
                            <option value="all">گفتگوهای فعال</option><option value="unread">خوانده‌نشده‌ها</option><option value="archived">بایگانی‌شده‌ها</option>
                        </select>
                    </div>
                    {loading ? <p className="p-5 text-sm text-muted">در حال دریافت…</p> : threads.length === 0 ? <p className="p-5 text-sm leading-7 text-muted">هنوز گفتگویی ندارید. از صفحه هنرمند یا یک اثر، گزینه «پیام مستقیم» را انتخاب کنید.</p> : (
                        <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
                            {threads.map((thread) => <li key={thread.id}>
                                <button type="button" onClick={() => { setActive(thread.id); setReplyTo(null); setEditingId(null); setParams((current) => { const next = new URLSearchParams(current); next.delete('artist'); next.delete('artwork'); next.set('conversation', String(thread.id)); return next; }, { replace: true }); }} aria-current={Number(active) === Number(thread.id) ? 'true' : undefined} className={'flex w-full items-center gap-3 px-4 py-4 text-right transition hover:bg-surface-muted ' + (Number(active) === Number(thread.id) ? 'bg-surface-muted shadow-[inset_-3px_0_0_var(--color-terracotta)]' : '')}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand/50 text-sm font-black text-ink">{(thread.participant?.name ?? 'گ').trim().slice(0, 1)}</span><span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2"><strong className="truncate text-sm font-extrabold">{thread.participant?.name ?? 'گفتگو'}</strong>{thread.unread_count > 0 && <span aria-label={`${Number(thread.unread_count).toLocaleString('fa-IR')} پیام خوانده‌نشده`} className={thread.unread_count < 10 ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-[11px] font-bold tabular-nums text-white' : 'flex h-6 min-w-8 max-w-12 shrink-0 items-center justify-center rounded-full bg-terracotta px-2 text-[11px] font-bold tabular-nums text-white'}>{thread.unread_count > 99 ? '۹۹+' : Number(thread.unread_count).toLocaleString('fa-IR')}</span>}</span>
                                    <span className="mt-2 block truncate text-xs leading-6 text-muted">{thread.last_message?.body ?? (thread.last_message?.deleted_at ? 'پیام حذف شده است' : 'برای شروع گفتگو پیام بفرستید')}</span>
                                    <span className="mt-1 block text-[11px] text-muted">{dateLabel(thread.last_message_at)}</span>
                                    </span>
                                </button>
                                <div className="flex gap-3 px-4 pb-3 text-[11px] text-muted">
                                    <button type="button" onClick={() => updateThreadSetting(thread, 'archived', !thread.archived)} className="underline">{thread.archived ? 'بازگردانی' : 'بایگانی'}</button>
                                    <button type="button" onClick={() => updateThreadSetting(thread, 'muted', !thread.muted)} className="underline">{thread.muted ? 'لغو بی‌صدا' : 'بی‌صدا کردن'}</button>
                                </div>
                            </li>)}
                        </ul>
                    )}
                    {hasMoreThreads && <button type="button" disabled={loadingMoreThreads} onClick={() => loadThreads({ append: true })} className="mx-4 my-3 min-h-10 border border-border bg-white px-3 py-2 text-xs font-semibold text-terracotta-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50">{loadingMoreThreads ? 'در حال دریافت…' : 'گفتگوهای بیشتر'}</button>}
                </aside>
                <div dir="rtl" className={active ? 'flex h-full min-h-0 min-w-0 flex-col bg-canvas' : 'hidden h-full min-h-0 min-w-0 flex-col bg-canvas lg:flex'}>
                    {!active ? <div className="m-auto p-8 text-center text-sm text-muted">برای مشاهده پیام‌ها یک گفتگو را انتخاب کنید.</div> : (
                        <>
                            <header className="relative z-10 flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-white px-4 py-3 shadow-soft sm:px-5">
                                <button type="button" aria-label="بازگشت به گفتگوها" className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-lg text-ink lg:hidden" onClick={() => { setActive(null); setParams((current) => { const next = new URLSearchParams(current); next.delete('conversation'); return next; }, { replace: true }); }}>‹</button>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand/50 text-sm font-black text-ink">{(selected?.participant?.name ?? 'گ').trim().slice(0, 1)}</div><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-extrabold text-ink">{selected?.participant?.name ?? 'گفتگوی خصوصی'}</h2><p className="mt-1 text-[11px] text-muted">گفتگوی خصوصی مستقیم</p></div><button type="button" onClick={reportConversation} className="rounded-full px-2 py-1 text-[11px] font-semibold text-muted transition hover:bg-surface-muted">گزارش</button><button type="button" onClick={toggleBlock} className="rounded-full px-2 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-50">{safety.blocked_by_me ? 'رفع مسدودسازی' : 'مسدودسازی کاربر'}</button>
                                {selected?.contexts?.some((context) => context.artwork?.slug) && <div className="flex w-full flex-wrap gap-2 border-t border-border pt-3"><span className="text-xs text-muted">آثار مرتبط:</span>{selected.contexts.filter((context) => context.artwork?.slug).map((context) => <Link key={context.artwork.slug} to={'/artworks/' + context.artwork.slug} className="border border-border bg-surface-muted px-3 py-1.5 text-xs font-semibold underline">{context.artwork.title}</Link>)}</div>}
                            </header>
                            <div dir="ltr" ref={messagesContainerRef} onScroll={(event) => {
                                const node = event.currentTarget;
                                shouldStickToBottomRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 120;
                                if (shouldStickToBottomRef.current) setNewMessageCount(0);
                                if (node.scrollTop < 72 && hasOlderMessagesRef.current) loadOlderMessages();
                            }} className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] bg-[radial-gradient(circle_at_1px_1px,rgba(66,62,53,0.055)_1px,transparent_0)] [background-size:24px_24px] px-3 py-5 sm:gap-4 sm:px-6 sm:py-6" role="log" aria-label="پیام‌های گفتگو" aria-live="polite" aria-relevant="additions">
                                {messagesLoading && messages.length === 0 && <p className="m-auto py-6 text-center text-sm text-muted" role="status">در حال دریافت پیام‌ها…</p>}
                                {!messagesLoading && messages.length === 0 && <p className="m-auto py-6 text-center text-sm text-muted">هنوز پیامی در این گفتگو وجود ندارد. می‌توانید گفتگو را با یک پیام شروع کنید.</p>}
                                {loadingOlder && <p className="absolute inset-x-0 top-2 z-10 mx-auto w-fit rounded-full border border-border bg-white/95 px-3 py-1.5 text-xs text-muted shadow-soft" role="status">در حال دریافت پیام‌های قدیمی‌تر…</p>}
                                {newMessageCount > 0 && <button type="button" onClick={() => {
                                    shouldStickToBottomRef.current = true;
                                    setNewMessageCount(0);
                                    const node = messagesContainerRef.current;
                                    node?.scrollTo({ top: node.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                                }} className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-terracotta-strong shadow-soft hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" aria-label={`${newMessageCount} پیام جدید؛ رفتن به آخر گفتگو`}>{Number(newMessageCount).toLocaleString('fa-IR')} پیام جدید ↓</button>}
                                {messages.map((message, index) => {
                                    const own = Number(message.sender_id) === Number(user?.id);
                                    const deleted = Boolean(message.deleted_at);
                                    const previousMessage = messages[index - 1];
                                    const showDayDivider = !previousMessage
                                        || new Date(previousMessage.created_at).toDateString() !== new Date(message.created_at).toDateString();
                                    return (
                                        <Fragment key={message.id}>
                                            {showDayDivider && <div dir="rtl" className="flex justify-center py-1"><span className="rounded-full border border-border bg-white/90 px-3 py-1 text-[10px] font-semibold text-muted shadow-soft">{dayLabel(message.created_at)}</span></div>}
                                            <div dir="ltr" className={'flex w-full ' + (own ? 'justify-end' : 'justify-start')}>
                                            <article dir="rtl" className={'min-w-0 max-w-[88%] rounded-[20px] px-4 py-3 shadow-[0_2px_5px_rgba(31,30,27,0.055)] sm:max-w-[min(72%,680px)] ' + (own ? 'rounded-bl-[7px] bg-[var(--color-message-own)] text-ink' : 'rounded-br-[7px] border border-border bg-[var(--color-message-peer)] text-ink')}>
                                                {message.attachments?.length > 0 && <ul className="mb-3 space-y-2">{message.attachments.map((attachment) => <li key={attachment.id}><a href={attachment.download_url} className="inline-flex max-w-full items-center gap-2 border border-border bg-surface-muted px-3 py-2 text-xs font-semibold underline" rel="noreferrer"><span aria-hidden="true">📎</span><span className="truncate">{attachment.name}</span><span className="text-muted">({Math.max(1, Math.round(attachment.size_bytes / 1024))} KB)</span></a></li>)}</ul>}
                                                {message.reply_to && <div className="mb-3 border-r-2 border-terracotta bg-surface-muted px-3 py-2 text-xs"><strong>{message.reply_to.sender_name ?? 'پیام قبلی'}</strong><p className="mt-1 line-clamp-2 text-muted">{message.reply_to.body ?? 'این پیام حذف شده است.'}</p></div>}
                                                {editingId === message.id ? (
                                                    <form onSubmit={(event) => saveEdit(event, message)} className="message-edit-shell space-y-2 rounded-lg">
                                                        <textarea aria-label="متن ویرایش‌شده پیام" autoFocus value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={3} maxLength={5000} className="w-full border border-border bg-canvas p-2 text-sm outline-none focus:border-border focus:outline-none focus-visible:outline-none focus:ring-0" />
                                                        <div className="flex gap-2"><button disabled={!editDraft.trim() || actionId === message.id} className="bg-ink px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">ذخیره</button><button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-muted">انصراف</button></div>
                                                    </form>
                                                ) : <p className={'whitespace-pre-wrap break-words text-sm leading-7 ' + (deleted ? 'italic text-muted' : '')}>{message.body ?? 'این پیام حذف شده است.'}</p>}
                                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
                                                    <span className={own ? 'text-muted' : 'text-muted'}>{timeLabel(message.created_at)} {message.edited_at && !deleted ? '· ویرایش‌شده' : ''}</span>
                                                    {own && !deleted && <span aria-label={message.read_at ? 'پیام خوانده شده' : 'پیام ارسال شده'} className="text-muted">{message.read_at ? '✓✓ خوانده‌شده' : '✓ ارسال‌شده'}</span>}
                                                </div>
                                                {!deleted && (
                                                    <>
                                                        <div className="mt-3 flex flex-wrap items-center gap-1">
                                                            {reactionOptions.map((emoji) => {
                                                                const reaction = message.reactions?.find((item) => item.emoji === emoji);
                                                                return <button key={emoji} type="button" disabled={actionId === message.id} onClick={() => toggleReaction(message, emoji)} aria-label={'واکنش ' + emoji} aria-pressed={Boolean(reaction?.reacted_by_me)} className={'rounded-full border px-2 py-1 text-xs ' + (reaction?.reacted_by_me ? 'border-terracotta bg-surface-muted' : 'border-border')}>{emoji}{reaction?.count ? ' ' + reaction.count : ''}</button>;
                                                            })}
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
                                                            <button type="button" onClick={() => { setReplyTo(message); setEditingId(null); draftRef.current?.focus(); }}>پاسخ</button>
                                                            {!own && <button type="button" onClick={() => reportMessage(message)}>گزارش</button>}
                                                            {own && <button type="button" onClick={() => { setEditingId(message.id); setEditDraft(message.body ?? ''); }}>ویرایش</button>}
                                                            {own && <button type="button" disabled={actionId === message.id} onClick={() => deleteMessage(message)}>حذف</button>}
                                                        </div>
                                                    </>
                                                )}
                                            </article>
                                            </div>
                                        </Fragment>
                                    );
                                })}
                                
                            </div>
                            {safetyLoading ? <p role="status" className="border-t border-border bg-surface-muted p-4 text-sm text-muted">در حال بررسی وضعیت ایمنی گفتگو…</p> : safety.blocked_by_me || safety.blocked_by_other ? <p role="status" className="border-t border-border bg-surface-muted p-4 text-sm text-muted">{safety.blocked_by_me ? 'این کاربر را مسدود کرده‌اید؛ برای ادامه گفتگو ابتدا مسدودسازی را بردارید.' : 'این گفتگو به‌دلیل تنظیمات ایمنی امکان ارسال پیام ندارد.'}</p> : <form onSubmit={send} className="shrink-0 border-t border-border bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:py-4">
                                {replyTo && <div className="mb-3 flex items-start justify-between gap-3 border-r-2 border-terracotta bg-surface-muted p-3 text-xs"><div><strong>پاسخ به {replyTo.sender_name ?? 'پیام'}</strong><p className="mt-1 line-clamp-2 text-muted">{replyTo.body}</p></div><button type="button" onClick={() => setReplyTo(null)} aria-label="لغو پاسخ">×</button></div>}
                                <div className="composer-shell flex items-end gap-2 rounded-[26px] border border-border bg-surface-muted p-2 shadow-soft">
                                    <div className="min-w-0 flex-1"><textarea aria-label="متن پیام" ref={draftRef} value={draft} disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={5000} placeholder="پیام بنویسید…" className="max-h-36 min-h-11 w-full resize-none overflow-y-auto border-0 bg-transparent px-3 py-2.5 text-[14px] leading-7 text-ink outline-none placeholder:text-subtle focus:outline-none focus-visible:outline-none focus:ring-0" />
                                        <div className="mt-2 flex flex-wrap items-center gap-2"><label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl text-muted transition hover:bg-border focus-within:outline focus-within:outline-2 focus-within:outline-focus focus-within:outline-offset-2" title="افزودن تصویر یا PDF"><span aria-hidden="true">＋</span><input ref={fileInputRef} type="file" aria-label="انتخاب تصویر یا فایل PDF" disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                if (file && file.size > 10 * 1024 * 1024) {
                                                    setError('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');
                                                    event.target.value = '';
                                                    return;
                                                }
                                                setError('');
                                                setSelectedFile(file);
                                                if (file) filesByConversationRef.current.set(Number(active), file);
                                                else filesByConversationRef.current.delete(Number(active));
                                            }} /></label>{selectedFile && <><span className="max-w-48 truncate rounded-full bg-white px-3 py-1.5 text-xs text-muted">{selectedFile.name}</span><button type="button" onClick={() => { setSelectedFile(null); filesByConversationRef.current.delete(Number(active)); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-xs text-red-700 underline">حذف پیوست</button></>}{sending && selectedFile && <span role="status" className="text-xs text-muted">بارگذاری {uploadProgress}%</span>}</div>{filePreview && <img src={filePreview} alt="پیش‌نمایش فایل پیوست" className="mt-2 max-h-24 max-w-32 rounded-xl object-contain" />}
                                    </div>
                                    <button type="submit" aria-label="ارسال پیام" aria-busy={sending} disabled={(!draft.trim() && !selectedFile) || sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta text-xl font-bold text-white shadow-sm transition hover:bg-terracotta-strong disabled:cursor-not-allowed disabled:opacity-40">{sending ? '…' : '➤'}</button>
                                </div>
                            </form>}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
