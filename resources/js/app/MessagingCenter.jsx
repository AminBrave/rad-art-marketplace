import { Button, Input, Textarea, Select } from '../components/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Link, useSearchParams } from 'react-router-dom';

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
    const [search, setSearch] = useState('');
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
    const [sending, setSending] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [safety, setSafety] = useState({ blocked_by_me: false, blocked_by_other: false });
    const bottomRef = useRef(null);
    const draftRef = useRef(null);
    const endpoint = role === 'artist' ? '/api/v1/artist/conversations' : '/api/v1/buyer/conversations';

    const loadThreads = useCallback(async () => {
        try {
            const query = {};
            if (search.trim()) query.search = search.trim();
            if (threadFilter !== 'all') query.filter = threadFilter;
            const { data } = await axios.get(endpoint, { params: query });
            setThreads(data.data ?? []);
        } catch {
            setError('دریافت گفتگوها انجام نشد. دوباره تلاش کنید.');
        } finally { setLoading(false); }
    }, [endpoint, search, threadFilter]);

    const updateThreadSetting = async (thread, setting, value) => {
        try {
            await axios.patch('/api/v1/conversations/' + thread.id + '/settings', { [setting]: value });
            await loadThreads();
        } catch {
            setError('به‌روزرسانی وضعیت گفتگو انجام نشد.');
        }
    };

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

    useEffect(() => {
        if (!active) { setSafety({ blocked_by_me: false, blocked_by_other: false }); return; }
        let cancelled = false;
        axios.get('/api/v1/conversations/' + active + '/safety')
            .then(({ data }) => { if (!cancelled) setSafety(data.data ?? { blocked_by_me: false, blocked_by_other: false }); })
            .catch(() => { if (!cancelled) setError('وضعیت ایمنی گفتگو دریافت نشد.'); });
        return () => { cancelled = true; };
    }, [active]);

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
        if ((!body && !selectedFile) || !active || sending || safety.blocked_by_me || safety.blocked_by_other) return;
        setSending(true);
        setError('');
        const messageClientId = pendingMessageId || (window.crypto?.randomUUID?.() ?? ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2)));
        setPendingMessageId(messageClientId);
        try {
            const { data } = await axios.post('/api/v1/conversations/' + active + '/messages', {
                body: body || 'فایل پیوست',
                reply_to_id: replyTo?.id ?? null,
                client_message_id: messageClientId,
            });
            let savedMessage = data.data;
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploaded = await axios.post('/api/v1/conversations/' + active + '/messages/' + savedMessage.id + '/attachments', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (event) => setUploadProgress(event.total ? Math.round((event.loaded * 100) / event.total) : 0),
                });
                savedMessage = { ...savedMessage, attachments: [...(savedMessage.attachments ?? []), { ...uploaded.data.data, download_url: '/api/v1/conversations/' + active + '/messages/' + savedMessage.id + '/attachments/' + uploaded.data.data.id }] };
            }
            setMessages((current) => current.some((item) => item.id === savedMessage.id) ? current.map((item) => item.id === savedMessage.id ? savedMessage : item) : [...current, savedMessage]);
            setDraft('');
            setSelectedFile(null);
            setPendingMessageId(null);
            setUploadProgress(0);
            setReplyTo(null);
            loadThreads();
        } catch {
            setError('ارسال پیام یا پیوست انجام نشد. وضعیت پیام را بررسی و دوباره تلاش کنید.');
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

    const reportMessage = async (message) => {
        const details = window.prompt('دلیل گزارش این پیام را کوتاه توضیح دهید:');
        if (details === null) return;
        try {
            await axios.post('/api/v1/conversations/' + active + '/messages/' + message.id + '/report', { reason: 'other', details });
            setNotice('گزارش شما برای بررسی ثبت شد.');
        } catch {
            setError('ثبت گزارش انجام نشد. دوباره تلاش کنید.');
        }
    };

    const reportConversation = async () => {
        const details = window.prompt('دلیل گزارش این گفتگو را کوتاه توضیح دهید:');
        if (details === null) return;
        try {
            await axios.post('/api/v1/conversations/' + active + '/report', { reason: 'other', details });
            setNotice('گزارش گفتگو برای بررسی ثبت شد.');
        } catch {
            setError('ثبت گزارش گفتگو انجام نشد.');
        }
    };

    const toggleBlock = async () => {
        try {
            if (safety.blocked_by_me) {
                await axios.delete('/api/v1/conversations/' + active + '/block');
                setSafety((current) => ({ ...current, blocked_by_me: false }));
                setNotice('مسدودسازی برداشته شد.');
            } else if (window.confirm('با مسدودسازی این کاربر، ارسال پیام در این گفتگو برای هر دو طرف متوقف می‌شود. ادامه می‌دهید؟')) {
                await axios.post('/api/v1/conversations/' + active + '/block');
                setSafety((current) => ({ ...current, blocked_by_me: true }));
                setNotice('کاربر مسدود شد.');
            }
        } catch {
            setError('به‌روزرسانی وضعیت مسدودسازی انجام نشد.');
        }
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
                <p className="mt-2 text-sm text-muted-foreground">گفتگوی خصوصی خریداران و هنرمندان؛ پیام‌ها به‌صورت خودکار به‌روزرسانی می‌شوند.</p>
            </header>
            {notice && <p role="status" className="border border-border bg-muted p-3 text-sm">{notice}</p>}
            {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-destructive">{error}</p>}
            <div className="grid min-h-[620px] overflow-hidden border border-border bg-card lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className={active ? 'hidden border-l border-border lg:block' : 'border-l border-border'}>
                    <div className="border-b border-border p-4 font-bold">گفتگوها</div>
                    <div className="space-y-2 border-b border-border p-3">
                        <Input aria-label="جستجوی گفتگوها" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو در گفتگوها…" / className="w-full" />
                        <Select aria-label="فیلتر گفتگوها" value={threadFilter} onChange={(event) => setThreadFilter(event.target.value)} className="w-full">
                            <option value="all">گفتگوهای فعال</option><option value="unread">خوانده‌نشده‌ها</option><option value="archived">بایگانی‌شده‌ها</option>
                        </Select>
                    </div>
                    {loading ? <p className="p-5 text-sm text-muted-foreground">در حال دریافت…</p> : threads.length === 0 ? <p className="p-5 text-sm leading-7 text-muted-foreground">هنوز گفتگویی ندارید. از صفحه هنرمند یا یک اثر، گزینه «پیام مستقیم» را انتخاب کنید.</p> : (
                        <ul className="divide-y divide-border">
                            {threads.map((thread) => <li key={thread.id}>
                                <Button type="button" onClick={() => { setActive(thread.id); setReplyTo(null); setEditingId(null); if (requestedConversation) setParams({}, { replace: true }); }} variant="ghost" size="default">
                                    <span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{thread.participant?.name ?? 'گفتگو'}</strong>{thread.unread_count > 0 && <span className="rounded-full bg-terracotta px-2 py-1 text-xs text-white">{thread.unread_count}</span>}</span>
                                    <span className="mt-2 block truncate text-xs text-muted-foreground">{thread.last_message?.body ?? (thread.last_message?.deleted_at ? 'پیام حذف شده است' : 'گفتگوی جدید')}</span>
                                    <span className="mt-1 block text-[11px] text-muted-foreground">{dateLabel(thread.last_message_at)}</span>
                                </Button>
                                <div className="flex gap-3 px-4 pb-3 text-[11px] text-muted-foreground">
                                    <Button type="button" onClick={() => updateThreadSetting(thread, 'archived', !thread.archived)} variant="ghost" size="default">{thread.archived ? 'بازگردانی' : 'بایگانی'}</Button>
                                    <Button type="button" onClick={() => updateThreadSetting(thread, 'muted', !thread.muted)} variant="ghost" size="default">{thread.muted ? 'لغو بی‌صدا' : 'بی‌صدا کردن'}</Button>
                                </div>
                            </li>)}
                        </ul>
                    )}
                </aside>
                <div className={active ? 'flex min-w-0 flex-col' : 'hidden min-w-0 flex-col lg:flex'}>
                    {!active ? <div className="m-auto p-8 text-center text-sm text-muted-foreground">برای مشاهده پیام‌ها یک گفتگو را انتخاب کنید.</div> : (
                        <>
                            <header className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                                <Button type="button" onClick={() => setActive(null)} variant="ghost" size="default">بازگشت</Button>
                                <div className="min-w-0"><h2 className="font-bold">{selected?.participant?.name ?? 'گفتگوی خصوصی'}</h2><p className="mt-1 text-xs text-muted-foreground">گفتگوی مستقیم</p></div><Button type="button" onClick={reportConversation} variant="ghost" size="sm">گزارش گفتگو</Button><Button type="button" onClick={toggleBlock} variant="destructive" size="sm" className="mr-auto">{safety.blocked_by_me ? 'رفع مسدودسازی' : 'مسدودسازی کاربر'}</Button>
                                {selected?.contexts?.some((context) => context.artwork?.slug) && <div className="flex w-full flex-wrap gap-2 border-t border-border pt-3"><span className="text-xs text-muted-foreground">آثار مرتبط:</span>{selected.contexts.filter((context) => context.artwork?.slug).map((context) => <Link key={context.artwork.slug} to={'/artworks/' + context.artwork.slug} className="border border-border bg-muted px-3 py-1.5 text-xs font-semibold underline">{context.artwork.title}</Link>)}</div>}
                            </header>
                            <div className="flex-1 space-y-4 overflow-y-auto bg-background p-4 sm:p-6" aria-live="polite">
                                {messages.map((message) => {
                                    const own = Number(message.sender_id) === Number(user?.id);
                                    const deleted = Boolean(message.deleted_at);
                                    return (
                                        <div key={message.id} className={'flex ' + (own ? 'justify-end' : 'justify-start')}>
                                            <article className="max-w-[90%] border border-border bg-card px-4 py-3 shadow-sm sm:max-w-[85%]">
                                                {message.attachments?.length > 0 && <ul className="mb-3 space-y-2">{message.attachments.map((attachment) => <li key={attachment.id}><a href={attachment.download_url} className="inline-flex max-w-full items-center gap-2 border border-border bg-muted px-3 py-2 text-xs font-semibold underline" rel="noreferrer"><span aria-hidden="true">📎</span><span className="truncate">{attachment.name}</span><span className="text-muted-foreground">({Math.max(1, Math.round(attachment.size_bytes / 1024))} KB)</span></a></li>)}</ul>}
                                                {message.reply_to && <div className="mb-3 border-r-2 border-terracotta bg-muted px-3 py-2 text-xs"><strong>{message.reply_to.sender_name ?? 'پیام قبلی'}</strong><p className="mt-1 line-clamp-2 text-muted-foreground">{message.reply_to.body ?? 'این پیام حذف شده است.'}</p></div>}
                                                {editingId === message.id ? (
                                                    <form onSubmit={(event) => saveEdit(event, message)} className="space-y-2">
                                                        <Textarea aria-label="متن ویرایش‌شده پیام" autoFocus value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={3} maxLength={5000} / className="w-full">
                                                        <div className="flex gap-2"><Button disabled={!editDraft.trim() || actionId === message.id} variant="default" size="sm" type="submit">ذخیره</Button><Button type="button" onClick={() => setEditingId(null)} variant="ghost" size="sm">انصراف</Button></div>
                                                    </form>
                                                ) : <p className={'whitespace-pre-wrap break-words text-sm leading-7 ' + (deleted ? 'italic text-muted-foreground' : '')}>{message.body ?? 'این پیام حذف شده است.'}</p>}
                                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                                                    <span>{dateLabel(message.created_at)} {message.edited_at && !deleted ? '· ویرایش‌شده' : ''}</span>
                                                    {own && !deleted && <span>{message.read_at ? 'خوانده‌شده' : message.delivered_at ? 'ثبت‌شده' : 'ارسال‌شده'}</span>}
                                                </div>
                                                {!deleted && (
                                                    <>
                                                        <div className="mt-3 flex flex-wrap items-center gap-1">
                                                            {reactionOptions.map((emoji) => {
                                                                const reaction = message.reactions?.find((item) => item.emoji === emoji);
                                                                return <Button key={emoji} type="button" disabled={actionId === message.id} onClick={() => toggleReaction(message, emoji)} aria-label={'واکنش ' + emoji} aria-pressed={Boolean(reaction?.reacted_by_me)} variant="ghost" size="default">{emoji}{reaction?.count ? ' ' + reaction.count : ''}</Button>;
                                                            })}
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                                                            <Button type="button" onClick={() => { setReplyTo(message); setEditingId(null); draftRef.current?.focus(); }} variant="ghost" size="default">پاسخ</Button>
                                                            {!own && <Button type="button" onClick={() => reportMessage(message)} variant="ghost" size="default">گزارش</Button>}
                                                            {own && <Button type="button" onClick={() => { setEditingId(message.id); setEditDraft(message.body ?? ''); }} variant="ghost" size="default">ویرایش</Button>}
                                                            {own && <Button type="button" disabled={actionId === message.id} onClick={() => deleteMessage(message)} variant="ghost" size="default">حذف</Button>}
                                                        </div>
                                                    </>
                                                )}
                                            </article>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            {safety.blocked_by_me || safety.blocked_by_other ? <p role="status" className="border-t border-border bg-muted p-4 text-sm text-muted-foreground">{safety.blocked_by_me ? 'این کاربر را مسدود کرده‌اید؛ برای ادامه گفتگو ابتدا مسدودسازی را بردارید.' : 'این گفتگو به‌دلیل تنظیمات ایمنی امکان ارسال پیام ندارد.'}</p> : <form onSubmit={send} className="border-t border-border bg-card p-3 sm:p-4">
                                {replyTo && <div className="mb-3 flex items-start justify-between gap-3 border-r-2 border-terracotta bg-muted p-3 text-xs"><div><strong>پاسخ به {replyTo.sender_name ?? 'پیام'}</strong><p className="mt-1 line-clamp-2 text-muted-foreground">{replyTo.body}</p></div><Button type="button" onClick={() => setReplyTo(null)} aria-label="لغو پاسخ" variant="ghost" size="default">×</Button></div>}
                                <div className="flex items-end gap-3">
                                    <div className="min-w-0 flex-1 space-y-2"><Textarea aria-label="متن پیام" ref={draftRef} value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={5000} placeholder="پیام خود را بنویسید…" / className="w-full">
                                        <div className="flex flex-wrap items-center gap-3"><label className="cursor-pointer text-xs font-semibold text-muted-foreground underline">افزودن تصویر یا PDF<Input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} / className="sr-only" /></label>{selectedFile && <><span className="max-w-48 truncate text-xs text-muted-foreground">{selectedFile.name}</span><Button type="button" onClick={() => setSelectedFile(null)} variant="destructive" size="sm">حذف پیوست</Button></>}{sending && selectedFile && <span role="status" className="text-xs text-muted-foreground">بارگذاری {uploadProgress}%</span>}</div>{filePreview && <img src={filePreview} alt="پیش‌نمایش فایل پیوست" className="mt-2 max-h-24 max-w-32 border border-border object-contain" />}
                                    </div>
                                    <Button type="submit" disabled={(!draft.trim() && !selectedFile) || sending || safety.blocked_by_me || safety.blocked_by_other} variant="default" size="default" className="min-h-12">{sending ? '…' : 'ارسال'}</Button>
                                </div>
                            </form>}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
