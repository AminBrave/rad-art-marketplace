import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function dateLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function MessagingCenter({ role }) {
    const [params, setParams] = useSearchParams();
    const [threads, setThreads] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);
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

    const send = async (event) => {
        event.preventDefault();
        const body = draft.trim();
        if (!body || !active || sending) return;
        setSending(true);
        setError('');
        try {
            const { data } = await axios.post('/api/v1/conversations/' + active + '/messages', {
                body,
                client_message_id: window.crypto?.randomUUID?.() ?? ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2)),
            });
            setMessages((current) => current.some((item) => item.id === data.data.id) ? current : [...current, data.data]);
            setDraft('');
            loadThreads();
        } catch {
            setError('ارسال پیام انجام نشد. متن پیام را نگه داشته‌ایم؛ دوباره تلاش کنید.');
        } finally { setSending(false); }
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
                                <button type="button" onClick={() => setActive(thread.id)} className={'w-full p-4 text-right transition hover:bg-surface-muted ' + (active === thread.id ? 'bg-surface-muted' : '')}>
                                    <span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{thread.participant?.name ?? 'گفتگو'}</strong>{thread.unread_count > 0 && <span className="rounded-full bg-terracotta px-2 py-1 text-xs text-white">{thread.unread_count}</span>}</span>
                                    <span className="mt-2 block truncate text-xs text-muted">{thread.last_message?.body ?? 'گفتگوی جدید'}</span>
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
                                {messages.map((message) => <div key={message.id} className={'flex ' + (message.sender_id ? 'justify-start' : 'justify-end')}>
                                    <article className="max-w-[85%] border border-border bg-white px-4 py-3 shadow-sm">
                                        <p className="whitespace-pre-wrap break-words text-sm leading-7">{message.body ?? 'این پیام حذف شده است.'}</p>
                                        <p className="mt-2 text-left text-[10px] text-muted">{dateLabel(message.created_at)} {message.read_at ? '· خوانده‌شده' : ''}</p>
                                    </article>
                                </div>)}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={send} className="flex items-end gap-3 border-t border-border bg-white p-3 sm:p-4">
                                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} maxLength={5000} placeholder="پیام خود را بنویسید…" className="min-h-12 flex-1 resize-y border border-border bg-canvas p-3 text-sm outline-none focus:border-terracotta" />
                                <button type="submit" disabled={!draft.trim() || sending} className="min-h-12 bg-ink px-5 text-sm font-bold text-white disabled:opacity-50">{sending ? '…' : 'ارسال'}</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
