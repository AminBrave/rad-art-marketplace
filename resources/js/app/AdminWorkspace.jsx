import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Badge, Button, EmptyState, ErrorState, FormField, Pagination, SelectField, SkeletonLines, SuccessState, TextareaField } from '../components/ui';

const api = '/api/v1/admin';
const statuses = [
    { value: 'pending_review', label: 'در انتظار بررسی' },
    { value: 'approved', label: 'تأییدشده' },
    { value: 'changes_requested', label: 'نیازمند اصلاح' },
    { value: 'rejected', label: 'ردشده' },
];
const statusLabels = Object.fromEntries(statuses.map((item) => [item.value, item.label]));
const roleLabels = { buyer: 'خریدار', artist: 'هنرمند', admin: 'مدیر' };
const dateLabel = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fa-IR', { dateStyle: 'medium' });
};

function SummaryCard({ label, value, description, to }) {
    return <Link to={to} className="block border border-border bg-card p-5 transition-colors hover:border-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><p className="text-sm text-muted-foreground-foreground">{label}</p><p className="mt-3 text-3xl font-black tabular-nums">{value ?? '—'}</p><p className="mt-2 text-xs leading-6 text-muted-foreground-foreground">{description}</p></Link>;
}

export function AdminDashboardHome() {
    const [summary, setSummary] = useState({ pending: null, users: null, latest: null });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const controllerRef = useRef(null);
    const load = useCallback(async () => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true);
        const responses = await Promise.allSettled([
            axios.get(api + '/artworks', { params: { status: 'pending_review', page: 1, per_page: 1 }, signal: controller.signal }),
            axios.get(api + '/users', { params: { page: 1, per_page: 1 }, signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        const next = { pending: null, users: null, latest: null }, failures = [];
        if (responses[0].status === 'fulfilled') { next.pending = responses[0].value.data.total ?? null; next.latest = responses[0].value.data.data?.[0] ?? null; }
        else failures.push('دریافت تعداد آثار در صف بررسی انجام نشد.');
        if (responses[1].status === 'fulfilled') next.users = responses[1].value.data.total ?? null;
        else failures.push('دریافت تعداد کاربران انجام نشد.');
        setSummary(next); setErrors(failures);
        if (controllerRef.current === controller) { controllerRef.current = null; setLoading(false); }
    }, []);
    useEffect(() => { load(); return () => controllerRef.current?.abort(); }, [load]);
    return <section className="space-y-7" dir="rtl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-sm font-bold text-primary">فضای مدیریت</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">نمای کلی سامانه</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground-foreground">آمار عملیاتی از پاسخ واقعی API؛ بدون شاخص یا فعالیت ساختگی.</p></div><Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button></header>
        {errors.length > 0 && <ErrorState title="بخشی از اطلاعات دریافت نشد" description={errors.join(' ')} onRetry={load} />}
        {loading ? <div className="grid gap-3 sm:grid-cols-2"><SkeletonLines lines={3} /><SkeletonLines lines={3} /></div> : <>
            <div className="grid gap-3 sm:grid-cols-2"><SummaryCard label="آثار در انتظار بررسی" value={summary.pending} description="تعداد کل صف طبق صفحه‌بندی سرور" to="/admin/artworks" /><SummaryCard label="حساب‌های کاربری" value={summary.users} description="تعداد کل حساب‌ها طبق صفحه‌بندی سرور" to="/admin/users" /></div>
            <section className="border border-border bg-card p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">آخرین اثر در صف بررسی</h2><p className="mt-1 text-xs text-muted-foreground-foreground">اولین نتیجه صف، نه گزارش فعالیت</p></div><Link to="/admin/artworks" className="text-sm font-bold text-primary underline">رفتن به صف بررسی</Link></div>
                {summary.latest ? <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><div><p className="font-bold">{summary.latest.title}</p><p className="mt-2 text-sm text-muted-foreground-foreground">{summary.latest.artist?.display_name ?? '—'} · {dateLabel(summary.latest.created_at)}</p></div><Badge variant="warning">{statusLabels[summary.latest.status] ?? summary.latest.status}</Badge></div> : <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground-foreground">{summary.pending === 0 ? 'در حال حاضر اثری در صف بررسی نیست.' : 'نمونه‌ای از صف بررسی در دسترس نیست.'}</p>}
            </section><div className="flex flex-wrap gap-3"><Link to="/admin/artworks" className="border border-border px-4 py-3 text-sm font-bold hover:border-ring">مدیریت آثار</Link><Link to="/admin/users" className="border border-border px-4 py-3 text-sm font-bold hover:border-ring">مدیریت کاربران</Link><Link to="/admin/editorial" className="border border-border px-4 py-3 text-sm font-bold hover:border-ring">مجموعه‌ها و سردبیری</Link></div>
        </>}
    </section>;
}

export function AdminArtworkModeration() {
    const [params, setParams] = useSearchParams();
    const status = statuses.some((item) => item.value === params.get('status')) ? params.get('status') : 'pending_review';
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [result, setResult] = useState(null), [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true), [busyId, setBusyId] = useState(null);
    const [error, setError] = useState(''), [message, setMessage] = useState('');
    const controllerRef = useRef(null);
    const load = useCallback(async () => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true); setError('');
        try { const { data } = await axios.get(api + '/artworks', { params: { status, page }, signal: controller.signal }); if (!controller.signal.aborted) setResult(data); }
        catch (e) { if (!axios.isCancel(e)) setError(e.response?.status === 403 ? 'این حساب اجازه مشاهده صف بررسی آثار را ندارد.' : 'دریافت آثار انجام نشد. دوباره تلاش کنید.'); }
        finally { if (controllerRef.current === controller) { controllerRef.current = null; setLoading(false); } }
    }, [status, page]);
    useEffect(() => { load(); return () => controllerRef.current?.abort(); }, [load]);
    const chooseStatus = (value) => { setMessage(''); setParams(value === 'pending_review' ? {} : { status: value }); };
    const changePage = (next) => setParams({ ...(status !== 'pending_review' ? { status } : {}), ...(next > 1 ? { page: String(next) } : {}) });
    const moderate = async (artwork, action) => {
        const note = (notes[artwork.id] ?? '').trim();
        if (action !== 'approve' && !note) { setError('برای رد اثر یا درخواست اصلاح، نوشتن توضیح الزامی است.'); return; }
        setBusyId(artwork.id); setError(''); setMessage('');
        try {
            const { data } = await axios.patch(api + '/artworks/' + artwork.id + '/moderation', { action, ...(action === 'approve' ? {} : { note }) });
            setMessage(data.message ?? 'تصمیم ثبت شد.'); setNotes((current) => ({ ...current, [artwork.id]: '' })); await load();
        } catch (e) { setError(e.response?.status === 403 ? 'سرور اجازه انجام این عملیات را نداد.' : e.response?.data?.errors?.note?.[0] ?? e.response?.data?.message ?? 'ثبت تصمیم انجام نشد.'); }
        finally { setBusyId(null); }
    };
    return <section className="space-y-6" dir="rtl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-sm font-bold text-primary">مدیریت آثار</p><h1 className="mt-2 text-2xl font-black">صف بررسی و انتشار</h1><p className="mt-2 text-sm leading-7 text-muted-foreground-foreground">فقط آثار در انتظار بررسی قابل تصمیم‌گیری‌اند. رد اثر یا درخواست اصلاح به توضیح نیاز دارد.</p></div><Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button></header>
        <div className="flex flex-wrap gap-2" aria-label="فیلتر وضعیت آثار">{statuses.map((item) => <Button key={item.value} size="sm" variant={status === item.value ? 'primary' : 'outline'} aria-pressed={status === item.value} onClick={() => chooseStatus(item.value)}>{item.label}</Button>)}</div>
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <SkeletonLines lines={7} /> : !result?.data?.length ? <EmptyState title="اثری در این وضعیت وجود ندارد" description="با انتخاب وضعیت دیگر می‌توانید سوابق تصمیم‌ها را مرور کنید." /> : <>
            <div className="grid gap-4 xl:grid-cols-2">{result.data.map((artwork) => {
                const actionable = artwork.status === 'pending_review';
                return <article key={artwork.id} className="overflow-hidden border border-border bg-card">
                    <div className="grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"><div className="bg-muted"><img src={artwork.image_url} alt={'تصویر اثر ' + artwork.title} loading="lazy" decoding="async" className="h-56 w-full object-cover sm:h-full sm:min-h-64" /></div>
                        <div className="min-w-0 p-5"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold">{artwork.title}</h2><Badge variant={artwork.status === 'approved' ? 'success' : artwork.status === 'rejected' ? 'danger' : artwork.status === 'pending_review' ? 'warning' : 'info'}>{statusLabels[artwork.status] ?? artwork.status}</Badge></div>
                            <p className="mt-2 text-xs text-muted-foreground-foreground">{artwork.artist?.display_name ?? '—'} · {artwork.category?.name ?? '—'}</p>
                            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">{artwork.medium && <div><dt className="text-muted-foreground-foreground">تکنیک</dt><dd className="mt-1 font-semibold">{artwork.medium}</dd></div>}{artwork.dimensions && <div><dt className="text-muted-foreground-foreground">ابعاد</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}{artwork.year && <div><dt className="text-muted-foreground-foreground">سال</dt><dd className="mt-1 font-semibold">{artwork.year}</dd></div>}<div><dt className="text-muted-foreground-foreground">تاریخ ثبت</dt><dd className="mt-1 font-semibold">{dateLabel(artwork.created_at)}</dd></div></dl>
                            {artwork.description && <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted-foreground-foreground">{artwork.description}</p>}{artwork.rejection_note && <p className="mt-3 border-s-2 border-border bg-muted p-3 text-xs leading-6 text-muted-foreground-foreground">یادداشت ثبت‌شده: {artwork.rejection_note}</p>}
                        </div>
                    </div>
                    {actionable && <div className="border-t border-border p-5"><FormField label="توضیح برای هنرمند" hint="برای رد اثر یا درخواست اصلاح الزامی است؛ حداکثر ۲۰۰۰ نویسه."><TextareaField value={notes[artwork.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [artwork.id]: event.target.value }))} maxLength={2000} rows={3} /></FormField><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => moderate(artwork, 'approve')} loading={busyId === artwork.id} disabled={busyId !== null}>تأیید و انتشار</Button><Button size="sm" variant="outline" onClick={() => moderate(artwork, 'request_changes')} disabled={busyId !== null}>درخواست اصلاح</Button><Button size="sm" variant="danger" onClick={() => moderate(artwork, 'reject')} disabled={busyId !== null}>رد اثر</Button></div></div>}
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} /><p className="text-center text-xs text-muted-foreground-foreground">{result.total ?? result.data.length} اثر در این فهرست</p>
        </>}
    </section>;
}

export function AdminUsersPage() {
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [result, setResult] = useState(null), [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true), [busyId, setBusyId] = useState(null);
    const [error, setError] = useState(''), [message, setMessage] = useState('');
    const controllerRef = useRef(null);
    const load = useCallback(async () => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true); setError('');
        try { const { data } = await axios.get(api + '/users', { params: { page }, signal: controller.signal }); if (!controller.signal.aborted) setResult(data); }
        catch (e) { if (!axios.isCancel(e)) setError(e.response?.status === 403 ? 'این حساب اجازه مشاهده کاربران را ندارد.' : 'دریافت فهرست کاربران انجام نشد. دوباره تلاش کنید.'); }
        finally { if (controllerRef.current === controller) { controllerRef.current = null; setLoading(false); } }
    }, [page]);
    useEffect(() => { load(); return () => controllerRef.current?.abort(); }, [load]);
    const changePage = (next) => setParams(next > 1 ? { page: String(next) } : {});
    const updateRole = async (item) => {
        const role = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role);
        if (!['artist', 'admin'].includes(role)) { setError('یکی از نقش‌های پشتیبانی‌شده را انتخاب کنید.'); return; }
        setBusyId(item.id); setError(''); setMessage('');
        try {
            const { data } = await axios.patch(api + '/users/' + item.id + '/role', { role });
            setResult((current) => ({ ...current, data: current.data.map((row) => row.id === item.id ? data.data : row) }));
            setDrafts((current) => { const next = { ...current }; delete next[item.id]; return next; });
            setMessage(data.message ?? 'نقش کاربر به‌روزرسانی شد.');
        } catch (e) { setError(e.response?.status === 403 ? 'سرور اجازه تغییر نقش این حساب را نداد.' : e.response?.data?.errors?.role?.[0] ?? e.response?.data?.message ?? 'تغییر نقش کاربر انجام نشد.'); }
        finally { setBusyId(null); }
    };
    return <section className="space-y-6" dir="rtl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-sm font-bold text-primary">مدیریت حساب‌ها</p><h1 className="mt-2 text-2xl font-black">کاربران</h1><p className="mt-2 text-sm leading-7 text-muted-foreground-foreground">فهرست صفحه‌بندی‌شده حساب‌ها و تغییر نقش‌های مجاز در سمت سرور.</p></div><Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button></header>
        <p className="border-s-2 border-border bg-muted p-4 text-xs leading-7 text-muted-foreground-foreground">نقش‌های قابل انتخاب «هنرمند» و «مدیر» هستند. ایجاد خریدار از مسیر ثبت‌نام انجام می‌شود و حذف یا تعلیق حساب پشتیبانی نمی‌شود. مدیر نمی‌تواند نقش مدیریتی حساب خودش را حذف کند.</p>
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <SkeletonLines lines={7} /> : !result?.data?.length ? <EmptyState title="کاربری برای نمایش وجود ندارد" /> : <>
            <div className="overflow-x-auto border border-border bg-card"><table className="w-full min-w-[680px] text-right text-sm"><caption className="sr-only">فهرست کاربران و نقش‌های سامانه</caption>
                <thead className="bg-muted text-xs text-muted-foreground-foreground"><tr><th scope="col" className="px-4 py-3">نام</th><th scope="col" className="px-4 py-3">ایمیل</th><th scope="col" className="px-4 py-3">نقش فعلی</th><th scope="col" className="px-4 py-3">تغییر نقش</th></tr></thead>
                <tbody>{result.data.map((item) => {
                    const selected = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role), selfAdmin = item.id === user?.id && item.role === 'admin';
                    return <tr key={item.id} className="border-t border-border"><td className="px-4 py-4 font-semibold">{item.name}</td><td dir="ltr" className="px-4 py-4 text-left text-xs">{item.email}</td><td className="px-4 py-4"><Badge variant={item.role === 'admin' ? 'accent' : 'neutral'}>{roleLabels[item.role] ?? item.role}</Badge></td><td className="px-4 py-4">
                        {selfAdmin ? <span className="text-xs text-muted-foreground-foreground">حساب مدیر فعلی</span> : <div className="flex items-center gap-2"><SelectField aria-label={'نقش جدید برای ' + item.name} value={selected} disabled={busyId === item.id} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))} className="min-w-36 py-2">{item.role === 'buyer' && <option value="">انتخاب نقش</option>}<option value="artist">هنرمند</option><option value="admin">مدیر</option></SelectField><Button size="sm" variant="outline" disabled={busyId !== null || !selected || selected === item.role} loading={busyId === item.id} onClick={() => updateRole(item)}>ثبت</Button></div>}
                    </td></tr>;
                })}</tbody>
            </table></div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} /><p className="text-center text-xs text-muted-foreground-foreground">{result.total ?? result.data.length} حساب کاربری</p>
        </>}
    </section>;
}


export function AdminMessageReportsPage() {
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [result, setResult] = useState(null);
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axios.get(api + '/message-reports', { params: { page } });
            setResult(data);
        } catch (e) {
            setError(e.response?.status === 403 ? 'دسترسی به گزارش‌های پیام مجاز نیست.' : 'دریافت گزارش‌ها انجام نشد.');
        } finally { setLoading(false); }
    }, [page]);
    useEffect(() => { load(); }, [load]);
    const review = async (report, action) => {
        setBusyId(report.id); setError(''); setMessage('');
        try {
            const { data } = await axios.patch(api + '/message-reports/' + report.id, { action, note: (notes[report.id] ?? '').trim() || null });
            setMessage(data.message ?? 'تصمیم ثبت شد.');
            await load();
        } catch (e) {
            setError(e.response?.data?.message ?? 'ثبت تصمیم انجام نشد.');
        } finally { setBusyId(null); }
    };
    return <section className="space-y-6" dir="rtl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div><p className="text-sm font-bold text-primary">ایمنی گفتگوها</p><h1 className="mt-2 text-2xl font-black">گزارش‌های پیام</h1><p className="mt-2 text-sm leading-7 text-muted-foreground-foreground">محتوای گزارش فقط برای مدیران مجاز قابل مشاهده است. هر تصمیم در سابقه رسیدگی ثبت می‌شود.</p></div>
            <Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button>
        </header>
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <SkeletonLines lines={8} /> : !result?.data?.length ? <EmptyState title="گزارش بازی وجود ندارد" description="گزارش‌های جدید پس از ثبت از سوی یکی از طرفین گفتگو در اینجا نمایش داده می‌شوند." /> : <>
            <div className="space-y-4">{result.data.map((report) => <article key={report.id} className="space-y-4 border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">گزارش #{report.id} · {report.reason}</h2><p className="mt-1 text-xs text-muted-foreground-foreground">گزارش‌دهنده: {report.reporter?.name ?? 'کاربر'} · {dateLabel(report.created_at)}</p></div><Badge variant={report.status === 'open' ? 'warning' : 'neutral'}>{report.status === 'open' ? 'در انتظار بررسی' : report.status === 'dismissed' ? 'رد گزارش' : 'بررسی‌شده'}</Badge></div>
                {report.details && <p className="text-sm leading-7">{report.details}</p>}
                {report.message && <blockquote className="border-r-2 border-ring bg-muted p-4 text-sm leading-7">{report.message.body ?? 'متن پیام حذف شده است.'}</blockquote>}
                {report.status === 'open' && <><label className="block text-xs font-semibold text-muted-foreground-foreground">یادداشت رسیدگی (اختیاری)<textarea value={notes[report.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={1000} rows={2} className="mt-2 w-full border border-border bg-card p-3 text-sm focus:border-ring" /></label><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'reviewed')}>ثبت بررسی</Button><Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => review(report, 'dismissed')}>رد گزارش</Button>{report.message && <Button size="sm" variant="danger" disabled={busyId !== null} onClick={() => review(report, 'remove_message')}>حذف پیام</Button>}</div></>}
            </article>)}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={(next) => setParams(next > 1 ? { page: String(next) } : {})} disabled={loading || busyId !== null} />
        </>}
    </section>;
}
