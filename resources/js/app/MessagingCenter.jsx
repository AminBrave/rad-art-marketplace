import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useMessagingQueries } from './useMessagingQueries';
import { useAuth } from './AuthContext';
import { ConversationInboxSkeleton, MessageHistorySkeleton, MediaImage, Tabs, TabsList, TabsTrigger, TabsContent, Tooltip, DropdownMenu } from '../components/ui';
import { Link, useSearchParams } from 'react-router-dom';
import { Archive, ArchiveRestore, ArrowDown, Ban, Bell, BellOff, ChevronRight, Download, FileText, Flag, Image as ImageIcon, Inbox, LoaderCircle, MailOpen, MoreVertical, Paperclip, Pencil, Reply, Search, Send, ShieldCheck, SmilePlus, Trash2, X } from 'lucide-react';

const reactionOptions = ['👍', '❤️', '😂', '😮', '🙏', '🎨'];
const avatarTones = ['bg-[color:color-mix(in_srgb,var(--color-sand)_65%,transparent)] text-ink', 'bg-[color:color-mix(in_srgb,var(--color-olive)_10%,transparent)] text-olive', 'bg-[color:color-mix(in_srgb,var(--color-terracotta)_10%,transparent)] text-terracotta-strong', 'bg-surface-muted text-ink'];

function avatarTone(name) {
    const value = String(name ?? 'گفتگو').trim();
    return avatarTones[(value.codePointAt(0) ?? 0) % avatarTones.length];
}

function avatarInitial(name) {
    return String(name ?? 'گ').trim().slice(0, 1) || 'گ';
}

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
    const endpoint = role === 'artist' ? '/api/v1/artist/conversations' : '/api/v1/buyer/conversations';
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [threadFilter, setThreadFilter] = useState('all');
    const [active, setActive] = useState(null);
    const [openPopover, setOpenPopover] = useState(null);
    const setPopoverOpen = (id, open) => setOpenPopover((current) => open ? id : current === id ? null : current);
    const focusComposerAfterMenuCloseRef = useRef(false);
    const { threads, setThreads, loadThreads, inboxQuery, messages, setMessages, setMessagesMeta, messagesQuery, fetchOlderMessages, cancelConversationQueries, safety, setSafety, safetyQuery, detailQuery, markRead, request } = useMessagingQueries({ endpoint, search: debouncedSearch, filter: threadFilter, conversationId: active, userId: user?.id });
    const loading = inboxQuery.isLoading;
    const hasMoreThreads = Boolean(inboxQuery.hasNextPage);
    const loadingMoreThreads = inboxQuery.isFetchingNextPage;
    const messagesLoading = messagesQuery.isLoading;
    const messagesError = messagesQuery.isError && messages.length === 0 ? 'دریافت پیام‌ها انجام نشد. دوباره تلاش کنید.' : '';
    const [draft, setDraft] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState('');
    const [pendingMessageId, setPendingMessageId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [replyTo, setReplyTo] = useState(null);
    const [pendingArtwork, setPendingArtwork] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [sending, setSending] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState('');
    const [olderMessagesError, setOlderMessagesError] = useState('');
    const [notice, setNotice] = useState('');
    const [directStartLoading, setDirectStartLoading] = useState(false);
    const [directStartAttempt, setDirectStartAttempt] = useState(0);
    const [directStartError, setDirectStartError] = useState('');
    const [safetyLoading, setSafetyLoading] = useState(true);
    const messagesContainerRef = useRef(null);
    const messagesRef = useRef(messages);
    const scrollPositionsRef = useRef(new Map());
    const restoredScrollConversationRef = useRef(null);
    const selectedFileRef = useRef(selectedFile);

    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { selectedFileRef.current = selectedFile; }, [selectedFile]);
    const draftRef = useRef(null);
    const fileInputRef = useRef(null);
    const latestMessageIdRef = useRef(null);
    const activeConversationRef = useRef(null);
    const historyLoadingRef = useRef(false);
    const hasOlderMessagesRef = useRef(false);
    const pendingScrollRestoreRef = useRef(null);
    const draftsByConversationRef = useRef(new Map());
    const filesByConversationRef = useRef(new Map());
    const pendingIdsByConversationRef = useRef(new Map());
    const directStartKeyRef = useRef(null);
    const directStartRequestRef = useRef(null);
    const shouldStickToBottomRef = useRef(true);
    const messageSyncSnapshotRef = useRef({ conversationId: null, lastSyncedAt: null, ids: new Set() });
    const sendingMessageRef = useRef(false);

    useEffect(() => () => {
        directStartRequestRef.current?.abort();
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
        return () => window.clearTimeout(timer);
    }, [search]);

    const loadThreadsRef = useRef(loadThreads);
    useEffect(() => { loadThreadsRef.current = loadThreads; }, [loadThreads]);

    const updateThreadSetting = async (thread, setting, value) => {
        try {
            await request({ method: 'patch', url: '/api/v1/conversations/' + thread.id + '/settings', data: { [setting]: value } });
            const leavesCurrentFilter = setting === 'archived'
                && (threadFilter === 'archived' ? !value : value);
            if (leavesCurrentFilter) {
                setThreads((current) => current.filter((item) => Number(item.id) !== Number(thread.id)));
            } else {
                setThreads((current) => current.map((item) => Number(item.id) === Number(thread.id)
                    ? { ...item, [setting]: value }
                    : item));
            }
            await loadThreads();
        } catch {
            setError('به‌روزرسانی وضعیت گفتگو انجام نشد.');
        }
    };

    const { refetch: refetchMessages } = messagesQuery;
    const loadMessages = useCallback(() => refetchMessages(), [refetchMessages]);

    useEffect(() => {
        const previousConversation = activeConversationRef.current;
        if (previousConversation && previousConversation !== active && messagesContainerRef.current) {
            scrollPositionsRef.current.set(Number(previousConversation), messagesContainerRef.current.scrollTop);
        }
        if (previousConversation && previousConversation !== active && draftRef.current) {
            draftsByConversationRef.current.set(Number(previousConversation), draftRef.current.value);
        }
        if (previousConversation && previousConversation !== active && selectedFileRef.current) {
            filesByConversationRef.current.set(Number(previousConversation), selectedFileRef.current);
        }
        historyLoadingRef.current = false;
        setLoadingOlder(false);
        pendingScrollRestoreRef.current = null;
        restoredScrollConversationRef.current = null;
        activeConversationRef.current = active;
        setOlderMessagesError('');
        setNewMessageCount(0);
        shouldStickToBottomRef.current = true;
        latestMessageIdRef.current = null;
        setDraft(active ? (draftsByConversationRef.current.get(Number(active)) ?? '') : '');
        setSelectedFile(active ? (filesByConversationRef.current.get(Number(active)) ?? null) : null);
        setUploadProgress(0);
        setReplyTo(null);
        setEditingId(null);
        setEditDraft('');
        setPendingMessageId(active ? (pendingIdsByConversationRef.current.get(Number(active)) ?? null) : null);
        setActionId(null);
        setOpenPopover(null);
        setError('');
        setNotice('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (draftRef.current) draftRef.current.style.height = 'auto';
        setSafetyLoading(Boolean(active));
        return () => { void cancelConversationQueries(); };
    }, [active, cancelConversationQueries]);

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

    const artistSlug = params.get('artist');
    const artworkSlug = params.get('artwork');

    useEffect(() => {
        if (role !== 'buyer' || !artistSlug) return undefined;
        const requestKey = artistSlug + ':' + (artworkSlug || '');
        if (directStartKeyRef.current === requestKey) return undefined;
        directStartKeyRef.current = requestKey;
        setDirectStartLoading(true);
        setDirectStartError('');
        setError('');
        const controller = new AbortController();
        directStartRequestRef.current = controller;

        const startConversation = async () => {
            try {
                const { data } = await request({ method: 'post', url: '/api/v1/conversations/direct', data: {
                    artist_slug: artistSlug,
                    artwork_slug: artworkSlug || null,
                }, config: { signal: controller.signal } });
                if (controller.signal.aborted) return;

                // Fetch the canonical thread payload so the artwork context is available
                // immediately, even if the paginated inbox refresh is still in flight.
                const conversationId = Number(data.data.id);
                const { data: conversationResponse } = await axios.get('/api/v1/conversations/' + conversationId, {
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;

                const conversation = conversationResponse.data;
                const artworkContext = conversation.contexts?.find((context) => context.artwork?.slug === artworkSlug)?.artwork;
                if (artworkContext) setPendingArtwork(artworkContext);
                setThreads((current) => [
                    conversation,
                    ...current.filter((thread) => Number(thread.id) !== conversationId),
                ]);
                setActive(conversationId);
                activeConversationRef.current = conversationId;
                setParams((current) => {
                    const next = new URLSearchParams(current);
                    next.delete('artist');
                    if (artworkSlug) next.set('artwork', artworkSlug);
                    next.set('conversation', String(conversationId));
                    return next;
                }, { replace: true });

                directStartKeyRef.current = null;
                loadThreadsRef.current();
            } catch (requestError) {
                if (!axios.isCancel(requestError) && !controller.signal.aborted) {
                    directStartKeyRef.current = null;
                    setDirectStartError(
                        requestError.response?.status === 403
                            ? 'شروع گفتگو به‌دلیل محدودیت دسترسی یا تنظیمات ایمنی ممکن نیست.'
                            : requestError.response?.status === 404
                                ? 'این هنرمند یا اثر دیگر برای نمایش عمومی در دسترس نیست.'
                                : 'شروع گفتگوی مستقیم انجام نشد. اتصال را بررسی کنید و دوباره تلاش کنید.',
                    );
                }
            } finally {
                if (directStartRequestRef.current === controller) {
                    directStartRequestRef.current = null;
                    setDirectStartLoading(false);
                }
            }
        };

        startConversation();
        return () => {
            controller.abort();
            if (directStartRequestRef.current === controller) directStartRequestRef.current = null;
            if (directStartKeyRef.current === requestKey) directStartKeyRef.current = null;
        };
    }, [artistSlug, artworkSlug, role, setParams, directStartAttempt, request, setThreads]);

    useEffect(() => {
        hasOlderMessagesRef.current = Boolean(messagesQuery.data?.hasOlder);
    }, [messagesQuery.data?.hasOlder]);

    useEffect(() => {
        if (messagesQuery.data?.hasChanges) loadThreadsRef.current();
    }, [messagesQuery.data?.lastSyncedAt, messagesQuery.data?.hasChanges]);

    useEffect(() => {
        const syncAt = messagesQuery.data?.lastSyncedAt;
        if (!active || !syncAt) return;

        const snapshot = messageSyncSnapshotRef.current;
        const currentIds = new Set(messages.map((message) => Number(message.id)));

        if (Number(snapshot.conversationId) !== Number(active) || !snapshot.lastSyncedAt) {
            messageSyncSnapshotRef.current = {
                conversationId: Number(active),
                lastSyncedAt: syncAt,
                ids: currentIds,
            };
            return;
        }

        if (snapshot.lastSyncedAt === syncAt) {
            messageSyncSnapshotRef.current = { ...snapshot, ids: currentIds };
            return;
        }

        const newIncomingCount = messages.filter((message) => (
            !snapshot.ids.has(Number(message.id))
            && Number(message.sender_id) !== Number(user?.id)
        )).length;

        if (newIncomingCount > 0 && !shouldStickToBottomRef.current) {
            setNewMessageCount((count) => count + newIncomingCount);
        }

        messageSyncSnapshotRef.current = {
            conversationId: Number(active),
            lastSyncedAt: syncAt,
            ids: currentIds,
        };
    }, [active, messages, messagesQuery.data?.lastSyncedAt, user?.id]);

    useEffect(() => {
        if (!active || !messages.length) return;
        const hasUnread = messages.some((message) => Number(message.sender_id) !== Number(user?.id) && !message.read_at);
        if (hasUnread) markRead(active).catch(() => {});
    }, [active, messages, user?.id, markRead]);

    useEffect(() => {
        setSafetyLoading(Boolean(active) && safetyQuery.isLoading);
        if (active && safetyQuery.isError) setError('وضعیت ایمنی گفتگو دریافت نشد.');
    }, [active, safetyQuery.isLoading, safetyQuery.isError]);

    useEffect(() => {
        if (!detailQuery.data || threads.some((thread) => Number(thread.id) === Number(active))) return;
        if (threadFilter === 'unread' && !Number(detailQuery.data.unread_count)) return;
        if (threadFilter === 'archived' && !detailQuery.data.archived) return;
        setThreads((current) => [detailQuery.data, ...current]);
    }, [active, detailQuery.data, threads, setThreads, threadFilter]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return undefined;
        const savedScrollTop = active ? scrollPositionsRef.current.get(Number(active)) : null;
        if (savedScrollTop !== null && savedScrollTop !== undefined && Boolean(messagesQuery.data)
            && restoredScrollConversationRef.current !== Number(active)) {
            restoredScrollConversationRef.current = Number(active);
            const frame = window.requestAnimationFrame(() => {
                container.scrollTop = savedScrollTop;
                shouldStickToBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
            });
            return () => window.cancelAnimationFrame(frame);
        }
        if (pendingScrollRestoreRef.current) {
            const previous = pendingScrollRestoreRef.current;
            pendingScrollRestoreRef.current = null;
            const frame = window.requestAnimationFrame(() => {
                container.scrollTop = previous.scrollTop + (container.scrollHeight - previous.scrollHeight);
            });
            return () => window.cancelAnimationFrame(frame);
        }
        if (!shouldStickToBottomRef.current) return undefined;
        const frame = window.requestAnimationFrame(() => {
            // Keep the log pinned deterministically; CSS smooth scrolling can leave
            // the initial history partway down while the first render is settling.
            container.scrollTop = container.scrollHeight;
        });
        return () => window.cancelAnimationFrame(frame);
    }, [active, messages, messagesQuery.data]);

    const loadOlderMessages = useCallback(async () => {
        const conversationId = activeConversationRef.current;
        if (!conversationId || !(messagesQuery.data?.hasOlder ?? hasOlderMessagesRef.current) || historyLoadingRef.current) return;
        historyLoadingRef.current = true;
        setLoadingOlder(true);
        setOlderMessagesError('');
        const container = messagesContainerRef.current;
        const previousHeight = container?.scrollHeight ?? 0;
        const previousTop = container?.scrollTop ?? 0;
        const beforeId = messagesRef.current?.[0]?.id;
        if (!beforeId) {
            historyLoadingRef.current = false;
            setLoadingOlder(false);
            return;
        }
        try {
            const data = await fetchOlderMessages(beforeId);
            if (Number(activeConversationRef.current) !== Number(conversationId)) return;
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
            setMessagesMeta({ hasOlder: hasOlderMessagesRef.current });
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setOlderMessagesError('دریافت پیام‌های قدیمی‌تر انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (Number(activeConversationRef.current) === Number(conversationId)) {
                historyLoadingRef.current = false;
                setLoadingOlder(false);
            }
        }
    }, [messagesQuery.data?.hasOlder, setMessages, setMessagesMeta, fetchOlderMessages]);

    const replaceMessage = (updated) => {
        setMessages((current) => current.map((message) => message.id === updated.id ? updated : message));
    };

    const send = async (event) => {
        event.preventDefault();
        const conversationId = active;
        const body = draft.trim();
        if ((!body && !selectedFile) || !active || sendingMessageRef.current || safetyLoading || safety.blocked_by_me || safety.blocked_by_other) return;
        sendingMessageRef.current = true;
        setSending(true);
        setError('');
        const messageClientId = pendingMessageId || (window.crypto?.randomUUID?.() ?? ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2)));
        setPendingMessageId(messageClientId);
        pendingIdsByConversationRef.current.set(Number(conversationId), messageClientId);
        try {
            const { data } = await request({ method: 'post', url: '/api/v1/conversations/' + conversationId + '/messages', data: {
                body: body || 'فایل پیوست',
                reply_to_id: replyTo?.id ?? null,
                artwork_id: pendingArtwork?.id ?? null,
                client_message_id: messageClientId,
            } });
            let savedMessage = data.data;
            const attachmentAlreadySaved = selectedFile && savedMessage.attachments?.some((attachment) =>
                attachment.name === selectedFile.name && Number(attachment.size_bytes) === Number(selectedFile.size)
            );
            if (selectedFile && !attachmentAlreadySaved) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploaded = await request({
                    method: 'post',
                    url: '/api/v1/conversations/' + conversationId + '/messages/' + savedMessage.id + '/attachments',
                    data: formData,
                    config: {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (event) => {
                            if (Number(activeConversationRef.current) === Number(conversationId)) {
                                setUploadProgress(event.total ? Math.round((event.loaded * 100) / event.total) : 0);
                            }
                        },
                    },
                });
                savedMessage = { ...savedMessage, attachments: [...(savedMessage.attachments ?? []), { ...uploaded.data.data, download_url: '/api/v1/conversations/' + conversationId + '/messages/' + savedMessage.id + '/attachments/' + uploaded.data.data.id, preview_url: uploaded.data.data.mime_type?.startsWith('image/') ? '/api/v1/conversations/' + conversationId + '/messages/' + savedMessage.id + '/attachments/' + uploaded.data.data.id + '/preview' : null }] };
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
                setPendingArtwork(null);
                setParams((current) => { const next = new URLSearchParams(current); next.delete('artwork'); return next; }, { replace: true });
                shouldStickToBottomRef.current = true;
            }
            loadThreads();
        } catch (requestError) {
            if (Number(activeConversationRef.current) === Number(conversationId)) {
                setError(requestError.response?.status === 503 && pendingArtwork
                    ? 'برای ارسال کارت اثر، پایگاه داده هنوز به‌روزرسانی نشده است. کارت اثر را حذف کنید تا پیام عادی ارسال شود؛ سپس مدیر فنی باید مهاجرت پایگاه داده را اجرا کند.'
                    : 'ارسال پیام یا پیوست انجام نشد. وضعیت اتصال و پاسخ سرور را بررسی و دوباره تلاش کنید.');
            }
        } finally {
            sendingMessageRef.current = false;
            setSending(false);
        }
    };

    const saveEdit = async (event, message) => {
        event.preventDefault();
        const conversationId = active;
        const body = editDraft.trim();
        if (!body || actionId) return;
        setActionId(message.id);
        try {
            const { data } = await request({ method: 'patch', url: '/api/v1/conversations/' + conversationId + '/messages/' + message.id, data: { body } });
            if (Number(activeConversationRef.current) === Number(conversationId)) {
                replaceMessage(data.data);
                loadThreads();
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
            const { data } = await request({ method: 'delete', url: '/api/v1/conversations/' + conversationId + '/messages/' + message.id });
            if (Number(activeConversationRef.current) === Number(conversationId)) {
                replaceMessage(data.data);
                loadThreads();
            }
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
            await request({ method: 'post', url: '/api/v1/conversations/' + conversationId + '/messages/' + message.id + '/report', data: { reason: 'other', details } });
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
            await request({ method: 'post', url: '/api/v1/conversations/' + conversationId + '/report', data: { reason: 'other', details } });
            if (Number(activeConversationRef.current) === Number(conversationId)) setNotice('گزارش گفتگو برای بررسی ثبت شد.');
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('ثبت گزارش گفتگو انجام نشد.');
        }
    };

    const toggleBlock = async () => {
        const conversationId = active;
        try {
            if (safety.blocked_by_me) {
                await request({ method: 'delete', url: '/api/v1/conversations/' + conversationId + '/block' });
                if (Number(activeConversationRef.current) === Number(conversationId)) {
                    setSafety((current) => ({ ...current, blocked_by_me: false }));
                    setNotice('مسدودسازی برداشته شد.');
                }
            } else if (window.confirm('با مسدودسازی این کاربر، ارسال پیام در این گفتگو برای هر دو طرف متوقف می‌شود. ادامه می‌دهید؟')) {
                await request({ method: 'post', url: '/api/v1/conversations/' + conversationId + '/block' });
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
            const { data } = await request({ method: 'post', url: '/api/v1/conversations/' + conversationId + '/messages/' + message.id + '/reactions', data: {
                emoji,
                action: existing?.reacted_by_me ? 'remove' : 'add',
            } });
            if (Number(activeConversationRef.current) === Number(conversationId)) replaceMessage(data.data);
        } catch {
            if (Number(activeConversationRef.current) === Number(conversationId)) setError('ثبت واکنش انجام نشد. دوباره تلاش کنید.');
        } finally { setActionId(null); }
    };

    const selected = threads.find((item) => Number(item.id) === Number(active)) ?? detailQuery.data;

    useEffect(() => {
        if (role !== 'buyer' || !artworkSlug || !selected?.contexts) return;
        const artwork = selected.contexts.find((context) => context.artwork?.slug === artworkSlug)?.artwork;
        if (artwork) setPendingArtwork(artwork);
    }, [role, artworkSlug, selected]);

    return (
        <section className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden font-sans" dir="rtl">
            {notice && <p role="status" className="rounded-md border border-border bg-surface-muted p-3 text-sm">{notice}</p>}
            {error && <p role="alert" className="rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-3 text-sm text-danger">{error}</p>}
            {inboxQuery.isError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-3 text-sm text-danger"><span>{'دریافت گفتگوها انجام نشد. دوباره تلاش کنید.'}</span><button type="button" onClick={() => loadThreads()} className="shrink-0 font-bold underline underline-offset-4">تلاش دوباره</button></div>}
            {directStartLoading && <div role="status" className="flex items-center gap-3 rounded-md border border-border bg-surface-muted p-3 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />در حال آماده‌سازی گفتگوی مستقیم و اتصال آن به اثر…</div>}
            {directStartError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-3 text-sm text-ink"><span>{directStartError}</span><button type="button" onClick={() => setDirectStartAttempt((attempt) => attempt + 1)} className="shrink-0 font-bold text-terracotta-strong underline underline-offset-4">تلاش دوباره</button></div>}
            <div className="grid h-full min-h-0 w-full min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-surface shadow-soft lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)]">
                <aside className={active ? 'hidden h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e lg:flex' : 'flex h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e'}>
                    <div className="shrink-0 border-b border-border bg-paper px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-sm font-extrabold leading-6 text-ink">پیام‌ها</h2><p className="mt-0.5 text-[10px] leading-4 text-muted">یک بستر امن برای ارتباط خریدار با هنرمند.</p></div><span className="mt-0.5 shrink-0 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[10px] font-bold leading-none text-muted">{threads.length} گفتگو</span></div>
                    </div>
                    <Tabs value={threadFilter} onValueChange={setThreadFilter} dir="rtl" className="flex min-h-0 flex-1 flex-col">
                        <div className="shrink-0 space-y-2 border-b border-border bg-surface-muted p-2.5">
                            <div className="relative"><Search size={17} aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" /><input dir="rtl" aria-label="جستجوی گفتگوها" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو در گفتگوها…" className="min-h-[2.5rem] w-full rounded-md border border-border-strong bg-surface py-2 ps-10 pe-4 text-sm text-ink placeholder:text-muted shadow-none outline-none transition focus:border-focus focus:outline focus:outline-2 focus:outline-[color:var(--color-focus-soft)] focus:outline-offset-1 focus:ring-0" /></div>
                            <TabsList aria-label="فیلتر گفتگوها" className="grid grid-cols-3 gap-0 overflow-hidden rounded-md border border-border bg-surface-muted border-b-0">
                                <TabsTrigger value="all" className="inline-flex flex-row min-w-0 w-full items-center justify-center gap-1.5 rounded-none border-b-0 px-2 py-2 text-xs leading-none text-center data-[state=active]:border-transparent data-[state=active]:bg-ink data-[state=active]:text-inverse">
                                    <Inbox size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">همه</span>
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="inline-flex flex-row min-w-0 w-full items-center justify-center gap-1.5 rounded-none border-b-0 px-2 py-2 text-xs leading-none text-center data-[state=active]:border-transparent data-[state=active]:bg-ink data-[state=active]:text-inverse">
                                    <MailOpen size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">خوانده‌نشده</span>
                                </TabsTrigger>
                                <TabsTrigger value="archived" className="inline-flex flex-row min-w-0 w-full items-center justify-center gap-1.5 rounded-none border-b-0 px-2 py-2 text-xs leading-none text-center data-[state=active]:border-transparent data-[state=active]:bg-ink data-[state=active]:text-inverse">
                                    <Archive size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">بایگانی</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value={threadFilter} dir="rtl" className="flex min-h-0 flex-1 flex-col p-0 pt-0 focus-visible:ring-0">
                    {loading ? <ConversationInboxSkeleton count={6} /> : threads.length === 0 ? (inboxQuery.isError ? null : <p className="p-5 text-sm leading-7 text-muted">هنوز گفتگویی ندارید. از صفحه هنرمند یا یک اثر، گزینه «پیام مستقیم» را انتخاب کنید.</p>) : (
                        <ul dir="rtl" className="min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:var(--color-border-strong)_transparent]">
                            {threads.map((thread) => <li key={thread.id} className={'relative transition-colors hover:bg-surface-muted focus-within:bg-surface-muted ' + (Number(active) === Number(thread.id) ? 'bg-surface-muted shadow-[inset_-3px_0_0_var(--color-terracotta)]' : '')}>
                                <button type="button" onClick={() => { setActive(thread.id); setReplyTo(null); setPendingArtwork(null); setEditingId(null); setParams((current) => { const next = new URLSearchParams(current); next.delete('artist'); next.delete('artwork'); next.set('conversation', String(thread.id)); return next; }, { replace: true }); }} aria-current={Number(active) === Number(thread.id) ? 'true' : undefined} className="flex min-h-[4.25rem] w-full items-center gap-2 bg-transparent px-3 py-2 pe-12 text-start transition"><span aria-hidden="true" className={'flex h-10 w-10 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border border-border text-sm font-black [box-shadow:none] ' + avatarTone(thread.participant?.name)}>{avatarInitial(thread.participant?.name)}</span><span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2"><strong dir="auto" className="truncate text-sm font-extrabold">{thread.participant?.name ?? 'گفتگو'}</strong>{thread.unread_count > 0 && <span aria-label={`${Number(thread.unread_count).toLocaleString('fa-IR')} پیام خوانده‌نشده`} className={thread.unread_count < 10 ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-[11px] font-bold tabular-nums text-inverse' : 'flex h-6 min-w-8 max-w-12 shrink-0 items-center justify-center rounded-full bg-terracotta px-2 text-[11px] font-bold tabular-nums text-inverse'}>{thread.unread_count > 99 ? '۹۹+' : Number(thread.unread_count).toLocaleString('fa-IR')}</span>}</span>
                                    <span dir="auto" className="mt-1 block truncate text-xs leading-[1.45] text-muted">{thread.last_message?.body ?? (thread.last_message?.deleted_at ? 'پیام حذف شده است' : 'برای شروع گفتگو پیام بفرستید')}</span>
                                    <span className="mt-1 block text-[11px] tabular-nums text-subtle">{dateLabel(thread.last_message_at)}</span>
                                    </span>
                                </button>
                                <div className="absolute end-1 top-1/2 -translate-y-1/2">
                                    <DropdownMenu.Root dir="rtl" open={openPopover === 'thread:' + thread.id} onOpenChange={(open) => setPopoverOpen('thread:' + thread.id, open)}>
                                        <Tooltip content="گزینه‌های گفتگو"><DropdownMenu.Trigger asChild>
                                            <button type="button" aria-label="گزینه‌های گفتگو" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><MoreVertical size={17} aria-hidden="true" /></button>
                                        </DropdownMenu.Trigger></Tooltip>
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content dir="rtl" side="bottom" align="end" sideOffset={8} collisionPadding={8} className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-48 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-border bg-paper p-1 shadow-soft">
                                                <DropdownMenu.Item onSelect={() => updateThreadSetting(thread, 'archived', !thread.archived)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none">{thread.archived ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}<span>{thread.archived ? 'بازگردانی از بایگانی' : 'بایگانی گفتگو'}</span></DropdownMenu.Item>
                                                <DropdownMenu.Item onSelect={() => updateThreadSetting(thread, 'muted', !thread.muted)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none">{thread.muted ? <Bell size={15} aria-hidden="true" /> : <BellOff size={15} aria-hidden="true" />}<span>{thread.muted ? 'فعال کردن اعلان‌ها' : 'بی‌صدا کردن گفتگو'}</span></DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </div>
                            </li>)}
                        </ul>
                    )}
                        </TabsContent>
                    </Tabs>
                    {hasMoreThreads && <button type="button" disabled={loadingMoreThreads} onClick={() => loadThreads({ append: true })} className="mx-4 my-3 min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-terracotta-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50">{loadingMoreThreads ? 'در حال دریافت…' : 'گفتگوهای بیشتر'}</button>}
                </aside>
                <div dir="rtl" className={active ? 'flex h-full min-h-0 min-w-0 flex-col bg-canvas' : 'hidden h-full min-h-0 min-w-0 flex-col bg-canvas lg:flex'}>
                    {!active ? <div className="m-auto p-8 text-center text-sm text-muted">برای مشاهده پیام‌ها یک گفتگو را انتخاب کنید.</div> : (
                        <>
                            <header className="relative z-20 shrink-0 border-b border-border bg-[color:color-mix(in_srgb,var(--color-paper)_96%,transparent)] shadow-soft backdrop-blur after:absolute after:inset-x-0 after:top-0 after:h-1 after:bg-terracotta">
                                <div className="flex min-h-[3.5rem] min-w-0 items-center gap-2 px-3 py-2 pt-3 md:min-h-[3.75rem] md:gap-3 md:px-4">
                                    <Tooltip content="بازگشت به گفتگوها"><button type="button" aria-label="بازگشت به گفتگوها" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus lg:hidden" onClick={() => { setActive(null); setPendingArtwork(null); setParams((current) => { const next = new URLSearchParams(current); next.delete('conversation'); next.delete('artwork'); return next; }, { replace: true }); }}><ChevronRight size={19} aria-hidden="true" /></button></Tooltip>
                                    {selected?.artist?.slug ? <Tooltip content={'مشاهده پروفایل هنرمند'}><Link to={'/artists/' + selected.artist.slug} aria-label={'مشاهده صفحه هنرمند ' + (selected?.participant?.name ?? '')} className="group flex h-11 w-11 aspect-square shrink-0 items-center justify-center rounded-full text-inherit no-underline transition-[transform,opacity] hover:-translate-y-px hover:opacity-[.88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><span aria-hidden="true" className={'flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-border-strong outline outline-[3px] outline-surface-muted [outline-offset:1px] text-sm font-black [box-shadow:0_1px_2px_color-mix(in_srgb,var(--color-ink)_8%,transparent)] ' + avatarTone(selected?.participant?.name)}>{avatarInitial(selected?.participant?.name)}</span></Link></Tooltip> : <div aria-hidden="true" className={'flex h-11 w-11 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong outline outline-[3px] outline-surface-muted [outline-offset:1px] text-sm font-black [box-shadow:0_1px_2px_color-mix(in_srgb,var(--color-ink)_8%,transparent)] ' + avatarTone(selected?.participant?.name)}>{avatarInitial(selected?.participant?.name)}</div>}
                                    <div className="min-w-0 flex-1">
                                        {role === 'buyer' && selected?.artist?.slug ? <Tooltip content={'مشاهده صفحه هنرمند ' + (selected.participant.name ?? '')}><Link to={'/artists/' + selected.artist.slug} dir="auto" className="block w-fit max-w-full truncate text-sm font-extrabold leading-6 text-ink transition hover:text-terracotta-strong focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus sm:text-base">{selected.participant.name ?? 'مشاهده هنرمند'}</Link></Tooltip> : <h2 dir="auto" title={selected?.participant?.name ?? 'گفتگوی خصوصی'} className="truncate text-sm font-extrabold leading-6 text-ink sm:text-base">{selected?.participant?.name ?? 'گفتگوی خصوصی'}</h2>}
                                        <p className="truncate text-[11px] leading-5 text-muted">گفتگوی خصوصی مستقیم</p>
                                    </div>
                                    <DropdownMenu.Root dir="rtl" open={openPopover === 'conversation'} onOpenChange={(open) => setPopoverOpen('conversation', open)}>
                                        <Tooltip content="گزینه‌های بیشتر"><DropdownMenu.Trigger asChild>
                                            <button type="button" aria-label="گزینه‌های بیشتر گفتگو" className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-surface-muted text-muted transition-colors hover:border-border-strong hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><MoreVertical size={19} aria-hidden="true" /></button>
                                        </DropdownMenu.Trigger></Tooltip>
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content dir="rtl" side="bottom" align="end" sideOffset={8} collisionPadding={8} className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-52 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-border bg-paper p-1 shadow-soft">
                                                <DropdownMenu.Item onSelect={reportConversation} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Flag size={15} className="shrink-0 text-muted" aria-hidden="true" /><span>گزارش گفتگو</span></DropdownMenu.Item>
                                                <DropdownMenu.Item onSelect={toggleBlock} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-danger outline-none transition-colors data-[highlighted]:bg-danger-surface motion-reduce:transition-none">{safety.blocked_by_me ? <ShieldCheck size={15} className="shrink-0" aria-hidden="true" /> : <Ban size={15} className="shrink-0" aria-hidden="true" />}<span>{safety.blocked_by_me ? 'رفع مسدودسازی کاربر' : 'مسدودسازی کاربر'}</span></DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </div>
                                {selected?.contexts?.some((context) => context.artwork?.slug) && <div className="flex w-full min-w-0 items-center gap-[.45rem] border-t border-border bg-surface-muted px-5 py-[.45rem] max-md:px-[.65rem] md:gap-[.55rem]"><span className="shrink-0 text-[11px] font-semibold text-muted">آثار مرتبط:</span><div className="flex min-w-0 flex-1 flex-row items-center gap-[.4rem] overflow-x-auto overflow-y-hidden px-[.05rem] py-[.1rem] [scrollbar-width:none] [overscroll-behavior-inline:contain]" role="list" aria-label="آثار مرتبط">{selected.contexts.filter((context) => context.artwork?.slug).map((context) => { const artwork = context.artwork; const chipContent = <><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-border text-muted">{artwork.image_url ? <MediaImage src={artwork.image_url} alt="" className="h-full w-full" imageClassName="object-cover" loading="lazy" decoding="async" /> : <ImageIcon size={15} aria-hidden="true" />}</span><span className="max-w-[7.5rem] truncate">{artwork.title}</span>{role === 'buyer' && <span className="border-s border-border ps-[.4rem] text-[9px] text-terracotta-strong">پاسخ</span>}</>; return role === 'buyer' ? <button key={artwork.slug} type="button" role="listitem" onClick={() => { setPendingArtwork(artwork); setParams((current) => { const next = new URLSearchParams(current); next.set('artwork', artwork.slug); return next; }, { replace: true }); }} aria-label={'ارسال پیام درباره ' + artwork.title} className="inline-flex min-w-0 max-w-48 min-h-[2.35rem] shrink-0 items-center gap-[.4rem] whitespace-nowrap rounded-full border border-border bg-surface-muted pe-[.6rem] ps-[.25rem] py-[.2rem] text-[11px] font-semibold leading-tight text-ink no-underline transition-colors hover:border-terracotta hover:bg-surface hover:text-terracotta-strong motion-reduce:transition-none">{chipContent}</button> : <Link key={artwork.slug} role="listitem" to={'/artworks/' + artwork.slug} className="inline-flex min-w-0 max-w-48 min-h-[2.35rem] shrink-0 items-center gap-[.4rem] whitespace-nowrap rounded-full border border-border bg-surface-muted pe-[.6rem] ps-[.25rem] py-[.2rem] text-[11px] font-semibold leading-tight text-ink no-underline transition-colors hover:border-terracotta hover:bg-surface hover:text-terracotta-strong motion-reduce:transition-none">{chipContent}</Link>; })}</div></div>}
                            </header>
                            <div dir="rtl" ref={messagesContainerRef} onScroll={(event) => {
                                const node = event.currentTarget;
                                shouldStickToBottomRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 120;
                                if (shouldStickToBottomRef.current) setNewMessageCount(0);
                                if (node.scrollTop < 72 && (messagesQuery.data?.hasOlder ?? hasOlderMessagesRef.current) && !olderMessagesError) loadOlderMessages();
                            }} className="relative isolate flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:var(--color-border-strong)_transparent] bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-ink)_5%,transparent)_1px,transparent_0)] [background-size:22px_22px] px-3 py-5 md:gap-2 md:px-[clamp(.75rem,2vw,1.5rem)] md:py-3 max-md:gap-2 max-md:px-2.5 max-md:py-3" role="log" aria-label="پیام‌های گفتگو" aria-live="polite" aria-relevant="additions">
                                {messagesLoading && messages.length === 0 && <MessageHistorySkeleton count={5} className="w-full" />}
                                {messagesError && <div role="alert" className="m-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-5 text-center text-sm text-danger"><p>{messagesError}</p><button type="button" onClick={() => loadMessages()} className="rounded-lg px-4 py-2 font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">تلاش دوباره</button></div>}
                                {!messagesLoading && !messagesError && messages.length === 0 && <p className="m-auto py-6 text-center text-sm text-muted">هنوز پیامی در این گفتگو وجود ندارد. می‌توانید گفتگو را با یک پیام شروع کنید.</p>}
                                {olderMessagesError && <div role="alert" className="absolute inset-x-3 top-2 z-20 mx-auto flex w-fit max-w-full items-center gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface px-4 py-2 text-xs text-danger shadow-soft"><span>{olderMessagesError}</span><button type="button" onClick={loadOlderMessages} className="shrink-0 rounded-lg px-2 py-1 font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">تلاش دوباره</button></div>}
                                {loadingOlder && <p className="absolute inset-x-0 top-2 z-10 mx-auto w-fit rounded-full border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_95%,transparent)] px-3 py-1.5 text-xs text-muted shadow-soft" role="status">در حال دریافت پیام‌های قدیمی‌تر…</p>}
                                {newMessageCount > 0 && <button type="button" onClick={() => {
                                    shouldStickToBottomRef.current = true;
                                    setNewMessageCount(0);
                                    const node = messagesContainerRef.current;
                                    node?.scrollTo({ top: node.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                                }} className="absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-xs font-bold text-terracotta-strong shadow-soft hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" aria-label={`${newMessageCount} پیام جدید؛ رفتن به آخر گفتگو`}><ArrowDown size={15} aria-hidden="true" />{Number(newMessageCount).toLocaleString('fa-IR')} پیام جدید</button>}
                                {messages.map((message, index) => {
                                    const own = Number(message.sender_id) === Number(user?.id);
                                    const deleted = Boolean(message.deleted_at);
                                    const previousMessage = messages[index - 1];
                                    const showDayDivider = !previousMessage
                                        || new Date(previousMessage.created_at).toDateString() !== new Date(message.created_at).toDateString();
                                    return (
                                        <Fragment key={message.id}>
                                            {showDayDivider && <div dir="rtl" className="flex shrink-0 justify-center py-1 font-persian"><span className="rounded-full border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_90%,transparent)] px-3 py-1 text-[10px] font-semibold text-muted shadow-soft">{dayLabel(message.created_at)}</span></div>}
                                            <div dir="rtl" className={'flex w-full min-w-0 shrink-0 px-[.15rem] ' + (own ? 'justify-start' : 'justify-end')}>
                                            <article dir="rtl" className={'relative z-0 min-w-0 w-fit max-w-[88%] rounded-[1.1rem] border px-3 py-2.5 font-persian shadow-[0_2px_8px_color-mix(in_srgb,var(--color-ink)_5%,transparent)] max-md:px-3 max-md:py-2 md:max-w-[min(76%,42rem)] ' + (own ? 'rounded-es-[.35rem] border-[color:color-mix(in_srgb,var(--color-action)_16%,var(--color-border))] bg-[var(--color-message-own)] text-ink' : 'rounded-ee-[.35rem] border-border bg-[var(--color-message-peer)] text-ink')}>
                                                {message.artwork && <div className="group mb-3 block overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(31,30,27,0.04)]"><div className="grid min-h-32 grid-cols-[5.75rem_minmax(0,1fr)] items-stretch gap-0 md:min-h-[8.5rem] md:grid-cols-[7.25rem_minmax(0,1fr)]"><Tooltip content={message.artwork.title}><Link to={'/artworks/' + message.artwork.slug} aria-label={'مشاهده اثر ' + message.artwork.title} className="relative z-0 block min-w-0 text-inherit no-underline focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-[-3px]"><span className="relative block h-full min-h-32 w-full min-w-0 self-stretch overflow-hidden bg-surface-muted md:min-h-[8.5rem]"><MediaImage src={message.artwork.image_url} alt={message.artwork.title} className="absolute inset-0 h-full w-full" imageClassName="object-cover transition-transform duration-200 group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none" loading="lazy" decoding="async" /></span></Link></Tooltip><div className="flex min-w-0 flex-1 cursor-default flex-col items-start justify-center gap-[.2rem] p-[.65rem_.7rem] text-start md:p-[.8rem_.9rem]"><span className="inline-flex items-center text-[10px] font-extrabold leading-[1.5] text-terracotta-strong">اثر مورد گفتگو</span><strong dir="auto" className="[display:-webkit-box] max-w-full overflow-hidden text-xs font-extrabold leading-[1.8] text-ink [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{message.artwork.title}</strong><span dir="auto" className="[display:-webkit-box] max-w-full overflow-hidden text-[10px] leading-[1.8] text-muted [overflow-wrap:anywhere] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{[message.artwork.artist_name, message.artwork.category, message.artwork.medium, message.artwork.dimensions, message.artwork.year?.toLocaleString?.('fa-IR')].filter(Boolean).join(' · ')}</span>{message.artwork.price && <span className="block text-[10px] font-bold leading-[1.8] text-muted">قیمت: {Number(message.artwork.price).toLocaleString('fa-IR')} تومان</span>}<Link to={'/artworks/' + message.artwork.slug} className="mt-1 inline-flex w-fit items-center gap-[.3rem] rounded-sm text-[10px] font-extrabold leading-[1.7] text-terracotta-strong no-underline transition-[gap] duration-150 hover:gap-2 hover:underline hover:underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none">مشاهده جزئیات اثر <span aria-hidden="true">←</span></Link></div></div></div>}
                                                {message.attachments?.length > 0 && <ul className="mb-3 space-y-3">{message.attachments.map((attachment) => {
                                                    const isImage = attachment.mime_type?.startsWith('image/');
                                                    return <li key={attachment.id} className="max-w-full overflow-hidden rounded-xl border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_80%,transparent)]">
                                                        {isImage && attachment.preview_url && <a href={attachment.preview_url} target="_blank" rel="noreferrer" aria-label={'نمایش تصویر ' + attachment.name} className="block bg-surface-muted"><MediaImage src={attachment.preview_url} alt={attachment.name} className="aspect-[4/3] max-h-72 w-full" imageClassName="object-contain" loading="lazy" decoding="async" /></a>}
                                                        <div className="flex min-w-0 items-center gap-2 p-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-terracotta-strong">{isImage ? <ImageIcon size={17} aria-hidden="true" /> : <FileText size={17} aria-hidden="true" />}</span><div className="min-w-0 flex-1"><p dir="auto" className="truncate text-xs font-semibold text-ink">{attachment.name}</p><p className="mt-0.5 text-[10px] text-muted">{Math.max(1, Math.round(attachment.size_bytes / 1024)).toLocaleString('fa-IR')} کیلوبایت</p></div><Tooltip content={'دانلود فایل'}><a href={attachment.download_url} download className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 text-[11px] font-bold text-terracotta-strong transition hover:bg-border" aria-label={'دانلود ' + attachment.name}><Download size={14} aria-hidden="true" /><span>دانلود</span></a></Tooltip></div>
                                                    </li>;
                                                })}</ul>}
                                                {message.reply_to && <div className="mb-3 border-s-2 border-terracotta bg-surface-muted px-3 py-2 text-xs"><strong dir="auto">{message.reply_to.sender_name ?? 'پیام قبلی'}</strong><p dir="auto" className="mt-1 line-clamp-2 text-muted">{message.reply_to.body ?? 'این پیام حذف شده است.'}</p></div>}
                                                {editingId === message.id ? (
                                                    <form onSubmit={(event) => saveEdit(event, message)} className="space-y-2 rounded-lg has-[textarea:focus-visible]:outline has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-focus has-[textarea:focus-visible]:outline-offset-[3px]">
                                                        <textarea dir="auto" aria-label="متن ویرایش‌شده پیام" autoFocus value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={3} maxLength={5000} className="w-full rounded-sm border border-border bg-surface p-2 text-sm text-ink outline-none focus:border-border focus:outline-none focus-visible:outline-none focus:ring-0" />
                                                        <div className="flex gap-2"><button disabled={!editDraft.trim() || actionId === message.id} className="bg-ink px-3 py-1.5 text-xs font-bold text-inverse disabled:opacity-50">ذخیره</button><button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-muted">انصراف</button></div>
                                                    </form>
                                                ) : <p dir="auto" className={'whitespace-pre-wrap break-words text-sm leading-[1.65] ' + (deleted ? 'italic text-muted' : '')}>{message.body ?? 'این پیام حذف شده است.'}</p>}
                                                <div className="mt-[.55rem] flex flex-wrap items-center justify-between gap-2 text-[10px] text-subtle">
                                                    <span className={own ? 'text-muted' : 'text-muted'}>{timeLabel(message.created_at)} {message.edited_at && !deleted ? '· ویرایش‌شده' : ''}</span>
                                                    {own && !deleted && <span aria-label={message.read_at ? 'پیام خوانده شده' : 'پیام ارسال شده'} className="text-muted">{message.read_at ? '✓✓ خوانده‌شده' : '✓ ارسال‌شده'}</span>}
                                                </div>
                                                {!deleted && (
                                                    <>
                                                        <div className="mt-2 flex min-w-0 flex-wrap items-center justify-end gap-1.5"><div className="flex min-w-0 flex-wrap items-center gap-1">
                                                            {message.reactions?.filter((reaction) => reaction.count > 0).map((reaction) => <button key={reaction.emoji} type="button" disabled={actionId === message.id} onClick={() => toggleReaction(message, reaction.emoji)} aria-label={'واکنش ' + reaction.emoji} aria-pressed={Boolean(reaction.reacted_by_me)} className={'inline-flex min-h-8 items-center gap-1 rounded-full border border-border bg-surface px-2.5 text-[11px] leading-none text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-ink aria-pressed:border-terracotta aria-pressed:bg-accent-surface aria-pressed:text-terracotta-strong motion-reduce:transition-none ' + (reaction.reacted_by_me ? 'border-terracotta bg-accent-surface text-terracotta-strong' : '')}>{reaction.emoji}<span className="tabular-nums">{Number(reaction.count).toLocaleString('fa-IR')}</span></button>)}
                                                            <DropdownMenu.Root dir="rtl" open={openPopover === 'reactions:' + message.id} onOpenChange={(open) => setPopoverOpen('reactions:' + message.id, open)}>
                                                                <Tooltip content="افزودن واکنش"><DropdownMenu.Trigger asChild>
                                                                    <button type="button" aria-label="افزودن واکنش" disabled={actionId === message.id} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 motion-reduce:transition-none"><SmilePlus size={15} aria-hidden="true" /></button>
                                                                </DropdownMenu.Trigger></Tooltip>
                                                                <DropdownMenu.Portal>
                                                                    <DropdownMenu.Content dir="rtl" side="top" align="end" sideOffset={8} collisionPadding={8} className="z-[60] flex max-w-[calc(100vw-1rem)] flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-border bg-paper p-1.5 shadow-soft [scrollbar-width:none]">
                                                                        {reactionOptions.map((emoji) => {
                                                                            const reaction = message.reactions?.find((item) => item.emoji === emoji);
                                                                            return <DropdownMenu.Item key={emoji} disabled={actionId === message.id} onSelect={() => toggleReaction(message, emoji)} aria-label={'واکنش ' + emoji} className={'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-base outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none ' + (reaction?.reacted_by_me ? 'bg-accent-surface text-terracotta-strong' : 'text-ink')}>{emoji}</DropdownMenu.Item>;
                                                                        })}
                                                                    </DropdownMenu.Content>
                                                                </DropdownMenu.Portal>
                                                            </DropdownMenu.Root>
                                                            </div>
                                                            <DropdownMenu.Root dir="rtl" open={openPopover === 'message:' + message.id} onOpenChange={(open) => setPopoverOpen('message:' + message.id, open)}>
                                                                <Tooltip content="عملیات پیام"><DropdownMenu.Trigger asChild>
                                                                    <button type="button" aria-label="عملیات پیام" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><MoreVertical size={16} aria-hidden="true" /></button>
                                                                </DropdownMenu.Trigger></Tooltip>
                                                                <DropdownMenu.Portal>
                                                                    <DropdownMenu.Content dir="rtl" side="top" align="end" sideOffset={8} collisionPadding={8} onCloseAutoFocus={(event) => {
                                                                        if (!focusComposerAfterMenuCloseRef.current) return;
                                                                        event.preventDefault();
                                                                        focusComposerAfterMenuCloseRef.current = false;
                                                                        draftRef.current?.focus();
                                                                    }} className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-40 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-border bg-paper p-1 shadow-soft">
                                                                        <DropdownMenu.Item onSelect={() => {
                                                                            focusComposerAfterMenuCloseRef.current = true;
                                                                            setReplyTo(message);
                                                                            setEditingId(null);
                                                                        }} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Reply size={15} aria-hidden="true" /><span>پاسخ</span></DropdownMenu.Item>
                                                                        {!own && <DropdownMenu.Item onSelect={() => reportMessage(message)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Flag size={15} aria-hidden="true" /><span>گزارش</span></DropdownMenu.Item>}
                                                                        {own && <DropdownMenu.Item onSelect={() => { setEditingId(message.id); setEditDraft(message.body ?? ''); }} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Pencil size={15} aria-hidden="true" /><span>ویرایش</span></DropdownMenu.Item>}
                                                                        {own && <DropdownMenu.Item disabled={actionId === message.id} onSelect={() => deleteMessage(message)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-danger outline-none transition-colors data-[highlighted]:bg-danger-surface data-[disabled]:opacity-50 motion-reduce:transition-none"><Trash2 size={15} aria-hidden="true" /><span>حذف</span></DropdownMenu.Item>}
                                                                    </DropdownMenu.Content>
                                                                </DropdownMenu.Portal>
                                                            </DropdownMenu.Root>
                                                        </div>
                                                    </>
                                                )}
                                            </article>
                                            </div>
                                        </Fragment>
                                    );
                                })}
                                
                            </div>
                            {safetyLoading ? <p role="status" className="rounded-md border-t border-border bg-surface-muted p-4 text-sm text-muted">در حال بررسی وضعیت ایمنی گفتگو…</p> : safety.blocked_by_me || safety.blocked_by_other ? <p role="status" className="border-t border-border bg-surface-muted p-4 text-sm text-muted">{safety.blocked_by_me ? 'این کاربر را مسدود کرده‌اید؛ برای ادامه گفتگو ابتدا مسدودسازی را بردارید.' : 'این گفتگو به‌دلیل تنظیمات ایمنی امکان ارسال پیام ندارد.'}</p> : <form onSubmit={send} className="shrink-0 border-t border-border bg-paper px-2.5 pb-2 pt-2 sm:px-3 sm:py-2">
                                {pendingArtwork && <div className="mb-3 flex min-w-0 items-center gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--color-terracotta)_30%,transparent)] bg-surface-muted p-2.5"><Link to={'/artworks/' + pendingArtwork.slug} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><MediaImage src={pendingArtwork.image_url} alt={pendingArtwork.title} className="h-16 w-16 shrink-0 rounded-lg bg-paper" imageClassName="object-cover" loading="eager" /><span className="min-w-0"><span className="block text-[10px] font-bold text-terracotta-strong">پاسخ درباره این اثر</span><strong dir="auto" className="mt-1 block truncate text-xs text-ink">{pendingArtwork.title}</strong><span dir="auto" className="mt-1 block truncate text-[10px] text-muted">{[pendingArtwork.artist_name, pendingArtwork.category, pendingArtwork.medium, pendingArtwork.dimensions].filter(Boolean).join(' · ')}</span>{pendingArtwork.price && <span className="mt-1 block text-[10px] font-semibold text-muted">قیمت: {Number(pendingArtwork.price).toLocaleString('fa-IR')} تومان</span>}</span></Link><Tooltip content="حذف ارجاع به اثر"><button type="button" onClick={() => { setPendingArtwork(null); setParams((current) => { const next = new URLSearchParams(current); next.delete('artwork'); return next; }, { replace: true }); }} aria-label="حذف ارجاع به اثر" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><X size={16} aria-hidden="true" /></button></Tooltip></div>}
                                {replyTo && <div className="mb-3 flex items-start justify-between gap-3 border-s-2 border-terracotta bg-surface-muted p-3 text-xs"><div><strong>پاسخ به <span dir="auto">{replyTo.sender_name ?? 'پیام'}</span></strong><p dir="auto" className="mt-1 line-clamp-2 text-muted">{replyTo.body}</p></div><Tooltip content="لغو پاسخ"><button type="button" onClick={() => setReplyTo(null)} aria-label="لغو پاسخ" className="rounded-full p-1 text-muted hover:bg-border"><X size={16} aria-hidden="true" /></button></Tooltip></div>}
                                <div className="relative flex min-w-0 items-center gap-1.5 rounded-[1rem] border border-border-strong bg-surface p-[.45rem] shadow-[0_3px_12px_color-mix(in_srgb,var(--color-ink)_6%,transparent)] transition-[border-color,box-shadow] duration-150 focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--color-focus-soft),0_3px_12px_color-mix(in_srgb,var(--color-ink)_5%,transparent)] has-[textarea:focus-visible]:outline has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-focus has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:shadow-[0_0_0_3px_var(--color-focus-soft),0_3px_12px_color-mix(in_srgb,var(--color-ink)_5%,transparent)] max-sm:gap-[.35rem] max-sm:rounded-2xl max-sm:p-[.35rem] motion-reduce:transition-none">
                                    <div className="min-w-0 flex-1"><textarea dir="rtl" aria-label="متن پیام" ref={draftRef} value={draft} disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={5000} placeholder="پیام بنویسید…" className="max-h-28 min-h-[2.35rem] max-sm:min-h-9 w-full resize-none overflow-y-auto rounded-[.7rem] border-0 bg-transparent ps-10 pe-3 py-[.4rem] text-[14px] leading-[1.65] text-ink outline-none placeholder:text-subtle focus:outline-none focus-visible:outline-none focus:ring-0" />
                                        <div className="mt-0 flex flex-wrap items-center gap-1.5"><Tooltip content={'افزودن تصویر یا PDF'}><label className="absolute bottom-2 start-2 z-10 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-transparent bg-transparent text-muted transition-colors hover:border-border hover:bg-surface-muted hover:text-terracotta-strong focus-within:outline focus-within:outline-2 focus-within:outline-focus focus-within:outline-offset-2 motion-reduce:transition-none"><Paperclip size={18} aria-hidden="true" /><input ref={fileInputRef} type="file" aria-label="انتخاب تصویر یا فایل PDF" disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(event) => {
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
                                            }} /></label></Tooltip>{selectedFile && <div className="mt-3 flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-paper p-2.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted text-terracotta-strong">{filePreview ? <MediaImage src={filePreview} alt="" className="h-full w-full" imageClassName="object-cover" loading="eager" /> : <FileText size={18} aria-hidden="true" />}</span><span className="min-w-0 flex-1"><span dir="auto" className="block truncate text-xs font-semibold text-ink">{selectedFile.name}</span><span className="text-[10px] text-muted">{Math.max(1, Math.round(selectedFile.size / 1024)).toLocaleString('fa-IR')} کیلوبایت</span></span><Tooltip content="حذف پیوست"><button type="button" onClick={() => { setSelectedFile(null); filesByConversationRef.current.delete(Number(active)); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="rounded-full p-1.5 text-muted transition hover:bg-danger-surface hover:text-danger" aria-label="حذف پیوست"><X size={16} aria-hidden="true" /></button></Tooltip></div>}{sending && selectedFile && <span role="status" className="text-xs text-muted">بارگذاری {uploadProgress}%</span>}</div>
                                    </div>
                                    <Tooltip content="ارسال پیام"><button type="submit" aria-label="ارسال پیام" aria-busy={sending} disabled={(!draft.trim() && !selectedFile) || sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} className="flex h-[2.35rem] w-[2.35rem] shrink-0 items-center justify-center rounded-[.85rem] border border-terracotta bg-terracotta text-inverse shadow-none transition-transform transition-colors duration-150 hover:-translate-y-px hover:bg-terracotta-strong active:translate-y-0 disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-subtle disabled:opacity-100 motion-reduce:transition-none max-sm:h-9 max-sm:w-9">{sending ? <LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}</button></Tooltip>
                                </div>
                            </form>}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
