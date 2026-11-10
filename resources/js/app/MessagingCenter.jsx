import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useSearchParams } from 'react-router-dom';

const reactionOptions = ['👍', '❤️', '😂', '😮', '🙏', '🎨'];

function dateLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function MessagingCenter({ role }) {
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const [threads, setThreads] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);
    const draftRef = useRef(null);
    const endpoint = role === 'artist' ? '/api/v1/artist/conversations' : '/api/v1/buyer/conversations';

    const loadThreads = useCallback(async () => {
        try {
            const { data } = await axios.get(endpoint);
            setThreads(data.data ?? []);
        } catch {
            setError('دریافت گفتگوها انجام نشد. دوباره تلاش کنید.');
        } finally { setLoading(false); }
    }, [endpoint]);

    const loadMessages = useCallback(async (id) => {
        if (!id) return;
        try {
            const { data } = await axios.get('/api/v1/conversations/' + id + '/messages');
            setMessages(data.data ?? []);
            await axios.patch('/api/v1/conversations/' + id + '/read');
        } catch {
            setError('دریافت پیام‌ها انجام نشد.');
        }
    }, []);

    const requestedConversation = params.get('conversation');

    useEffect(() => {
        const id = Number(requestedConversation);
        if (Number.isSafeInteger(id) && id > 0) setActive(id);
    }, [requestedConversation]);

    useEffect(() => { loadThreads(); }, [loadThreads]);
    useEffect(() => {
        const artistSlug = params.get('artist');
        if (role === 'buyer' && artistSlug) {
            const artworkSlug = params.get('artwork');
            axios.post('/api/v1/conversations/direct', { artist_slug: artistSlug, artwork_slug: artworkSlug || null })
                .then(({ data }) => {
                    setParams({}, { replace: true });
                    loadThreads().then(() => setActive(data.data.id));
                })
                .catch(() => setError('شروع گفتگوی مستقیم ممکن نشد. ممکن است پروفایل یا اثر دیگر عمومی نباشد.'));
        }
    }, [params, role, setParams, loadThreads]);

    useEffect(() => {
        if (!active) return undefined;
        loadMessages(active);
        const poll = window.setInterval(() => loadMessages(active), 5000);
        return () => window.clearInterval(poll);
    }, [active, loadMessages]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const replaceMessage = (updated) => {
        setMessages((current) => current.map((message) => message.id === updated.id ? updated : message));
    };

    const send = async (event) => {
        event.preventDefault();
        const body = draft.trim();
        if (!body || !active || sending) return;
        setSending(true);
        setError('');
        try {
            const { data } = await axios.post('/api/v1/conversations/' + active + '/messages', {
                body,
                reply_to_id: replyTo?.id ?? null,
                client_message_id: window.crypto?.randomUUID?.() ?? ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2)),
            });
            setMessages((current) => current.some((item) => item.id === data.data.id) ? current : [...current, data.data]);
            setDraft('');
            setReplyTo(null);
            loadThreads();
        } catch {
            setError('ارسال پیام انجام نشد. متن پیام را نگه داشته‌ایم؛ دوباره تلاش کنید.');
        } finally { setSending(false); }
    };

    const saveEdit = async (event, message) => {
        event.preventDefault();
        const body = editDraft.trim();
        if (!body || actionId) return;
        setActionId(message.id);
        try {
            const { data } = await axios.patch('/api/v1/conversations/' + active + '/messages/' + message.id, { body });
            replaceMessage(data.data);
            setEditingId(null);
            setEditDraft('');
        } catch {
            setError('ویرایش پیام انجام نشد. دوباره تلاش کنید.');
        } finally { setActionId(null); }
    };

    const deleteMessage = async (message) => {
        if (actionId || !window.confirm('این پیام برای هر دو طرف حذف شود؟')) return;
        setActionId(message.id);
        try {
            const { data } = await axios.delete('/api/v1/conversations/' + active + '/messages/' + message.id);
            replaceMessage(data.data);
        } catch {
            setError('حذف پیام انجام نشد. دوباره تلاش کنید.');
        } finally { setActionId(null); }
    };

    const toggleReaction = async (message, emoji) => {
        if (actionId || message.deleted_at) return;
        const existing = message.reactions?.find((reaction) => reaction.emoji === emoji);
        setActionId(message.id);
        try {
            const { data } = await axios.post('/api/v1/conversations/' + active + '/messages/' + message.id + '/reactions', {
                emoji,
                action: existing?.reacted_by_me ? 'remove' : 'add',
            });
            replaceMessage(data.data);
        } catch {
            setError('ثبت واکنش انجام نشد. دوباره تلاش کنید.');
        } finally { setActionId(null); }
    };

    const selected = threads.find((item) => item.id === active);

    return (
        <section className="space-y-5" dir="rtl">
            <header className="border-b border-border pb-5">
                <p className="text-sm font-bold text-terracotta-strong">ارتباط مستقیم</p>
                <h1 className="mt-2 text-2xl font-black">پیام‌ها</h1>
                <p className="mt-2 text-sm text-muted">گفتگوی خصوصی خریداران و هنرمندان؛ پیام‌ها به‌صورت خودکار به‌روزرسانی می‌شوند.</p>
            </header>
            {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <div className="grid min-h-[620px] overflow-hidden border border-border bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className={active ? 'hidden border-l border-border lg:block' : 'border-l border-border'}>
                    <div className="border-b border-border p-4 font-bold">گفتگوها</div>
                    {loading ? <p className="p-5 text-sm text-muted">در حال دریافت…</p> : threads.length === 0 ? <p className="p-5 text-sm leading-7 text-muted">هنوز گفتگویی ندارید. از صفحه هنرمند یا یک اثر، گزینه «پیام مستقیم» را انتخاب کنید.</p> : (
                        <ul className="divide-y divide-border">
                            {threads.map((thread) => <li key={thread.id}>
                                <button type="button" onClick={() => { setActive(thread.id); setReplyTo(null); setEditingId(null); if (requestedConversation) setParams({}, { replace: true }); }} className={'w-full p-4 text-right transition hover:bg-surface-muted ' + (active === thread.id ? 'bg-surface-muted' : '')}>
                                    <span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{thread.participant?.name ?? 'گفتگو'}</strong>{thread.unread_count > 0 && <span className="rounded-full bg-terracotta px-2 py-1 text-xs text-white">{thread.unread_count}</span>}</span>
                                    <span className="mt-2 block truncate text-xs text-muted">{thread.last_message?.body ?? (thread.last_message?.deleted_at ? 'پیام حذف شده است' : 'گفتگوی جدید')}</span>
                                    <span className="mt-1 block text-[11px] text-muted">{dateLabel(thread.last_message_at)}</span>
                                </button>
                            </li>)}
                        </ul>
                    )}
                </aside>
                <div className={active ? 'flex min-w-0 flex-col' : 'hidden min-w-0 flex-col lg:flex'}>
                    {!active ? <div className="m-auto p-8 text-center text-sm text-muted">برای مشاهده پیام‌ها یک گفتگو را انتخاب کنید.</div> : (
                        <>
                            <header className="flex items-center gap-3 border-b border-border p-4">
                                <button type="button" className="text-sm font-bold lg:hidden" onClick={() => setActive(null)}>بازگشت</button>
                                <div><h2 className="font-bold">{selected?.participant?.name ?? 'گفتگوی خصوصی'}</h2><p className="mt-1 text-xs text-muted">گفتگوی مستقیم</p></div>
                            </header>
                            <div className="flex-1 space-y-4 overflow-y-auto bg-canvas p-4 sm:p-6" aria-live="polite">
                                {messages.map((message) => {
                                    const own = Number(message.sender_id) === Number(user?.id);
                                    const deleted = Boolean(message.deleted_at);
                                    return (
                                        <div key={message.id} className={'flex ' + (own ? 'justify-end' : 'justify-start')}>
                                            <article className="max-w-[90%] border border-border bg-white px-4 py-3 shadow-sm sm:max-w-[85%]">
                                                {message.reply_to && <div className="mb-3 border-r-2 border-terracotta bg-surface-muted px-3 py-2 text-xs"><strong>{message.reply_to.sender_name ?? 'پیام قبلی'}</strong><p className="mt-1 line-clamp-2 text-muted">{message.reply_to.body ?? 'این پیام حذف شده است.'}</p></div>}
                                                {editingId === message.id ? (
                                                    <form onSubmit={(event) => saveEdit(event, message)} className="space-y-2">
                                                        <textarea aria-label="متن ویرایش‌شده پیام" autoFocus value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={3} maxLength={5000} className="w-full border border-border bg-canvas p-2 text-sm focus:border-terracotta" />
                                                        <div className="flex gap-2"><button disabled={!editDraft.trim() || actionId === message.id} className="bg-ink px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">ذخیره</button><button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-muted">انصراف</button></div>
                                                    </form>
                                                ) : <p className={'whitespace-pre-wrap break-words text-sm leading-7 ' + (deleted ? 'italic text-muted' : '')}>{message.body ?? 'این پیام حذف شده است.'}</p>}
                                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
                                                    <span>{dateLabel(message.created_at)} {message.edited_at && !deleted ? '· ویرایش‌شده' : ''}</span>
                                                    {own && !deleted && <span>{message.read_at ? 'خوانده‌شده' : message.delivered_at ? 'ثبت‌شده' : 'ارسال‌شده'}</span>}
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
                                                            {own && <button type="button" onClick={() => { setEditingId(message.id); setEditDraft(message.body ?? ''); }}>ویرایش</button>}
                                                            {own && <button type="button" disabled={actionId === message.id} onClick={() => deleteMessage(message)}>حذف</button>}
                                                        </div>
                                                    </>
                                                )}
                                            </article>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={send} className="border-t border-border bg-white p-3 sm:p-4">
                                {replyTo && <div className="mb-3 flex items-start justify-between gap-3 border-r-2 border-terracotta bg-surface-muted p-3 text-xs"><div><strong>پاسخ به {replyTo.sender_name ?? 'پیام'}</strong><p className="mt-1 line-clamp-2 text-muted">{replyTo.body}</p></div><button type="button" onClick={() => setReplyTo(null)} aria-label="لغو پاسخ">×</button></div>}
                                <div className="flex items-end gap-3">
                                    <textarea aria-label="متن پیام" ref={draftRef} value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={5000} placeholder="پیام خود را بنویسید…" className="min-h-12 flex-1 resize-y border border-border bg-canvas p-3 text-sm outline-none focus:border-terracotta" />
                                    <button type="submit" disabled={!draft.trim() || sending} className="min-h-12 bg-ink px-5 text-sm font-bold text-white disabled:opacity-50">{sending ? '…' : 'ارسال'}</button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
