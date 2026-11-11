import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Badge, Button, EmptyState, ErrorState, FormField, Pagination, SelectField, SkeletonLines, SuccessState, TextareaField, WorkspaceHero, DashboardMetricCard } from '../components/ui';

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

export function AdminDashboardHome() {
    const { user } = useAuth();
    const [summary, setSummary] = useState({ pending: null, users: null, reports: null, latest: null });
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
            axios.get(api + '/message-reports', { params: { page: 1 }, signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;

        const next = { pending: null, users: null, reports: null, latest: null };
        const failures = [];
        if (responses[0].status === 'fulfilled') {
            next.pending = responses[0].value.data.total ?? null;
            next.latest = responses[0].value.data.data?.[0] ?? null;
        } else failures.push('دریافت صف بررسی آثار انجام نشد.');
        if (responses[1].status === 'fulfilled') next.users = responses[1].value.data.total ?? null;
        else failures.push('دریافت تعداد کاربران انجام نشد.');
        if (responses[2].status === 'fulfilled') next.reports = responses[2].value.data.total ?? null;
        else failures.push('دریافت گزارش‌های پیام انجام نشد.');

        setSummary(next);
        setErrors(failures);
        if (controllerRef.current === controller) {
            controllerRef.current = null;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        return () => controllerRef.current?.abort();
    }, [load]);

    const shortcuts = [
        { to: '/admin/artworks', eyebrow: 'محتوا', title: 'بررسی آثار', description: 'صف انتظار، تصمیم‌های انتشار و سوابق اصلاح یا رد آثار', symbol: '▧' },
        { to: '/admin/users', eyebrow: 'حساب‌ها', title: 'مدیریت کاربران', description: 'مرور حساب‌ها و مدیریت نقش‌های مجاز در سامانه', symbol: '◎' },
        { to: '/admin/editorial', eyebrow: 'انتخاب سردبیر', title: 'مجموعه‌های منتخب', description: 'تنظیم مجموعه‌ها و انتخاب هنرمندان برجسته', symbol: '✳' },
        { to: '/admin/message-reports', eyebrow: 'اعتماد و ایمنی', title: 'گزارش‌های پیام', description: 'رسیدگی به گزارش‌ها و بررسی محتوای علامت‌گذاری‌شده', symbol: '⚑' },
    ];

    return (
        <section className="space-y-8" dir="rtl">
            <WorkspaceHero
                eyebrow="مرکز کنترل راد آرت"
                title={<>خوش آمدید، {user?.name ?? 'مدیر'}</>}
                description="از اینجا صف انتشار، حساب‌های کاربری، مجموعه‌های سردبیری و گزارش‌های ایمنی را مدیریت کنید. شاخص‌ها از داده‌های واقعی سامانه دریافت می‌شوند."
                actions={<Button variant="secondary" onClick={load} loading={loading}>به‌روزرسانی آمار</Button>}
            />

            {errors.length > 0 && <ErrorState title="بخشی از اطلاعات دریافت نشد" description={errors.join(' ')} onRetry={load} />}

            <section aria-label="شاخص‌های عملیاتی" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? <><div className="border border-border bg-white p-6"><SkeletonLines lines={3} /></div><div className="border border-border bg-white p-6"><SkeletonLines lines={3} /></div><div className="border border-border bg-white p-6"><SkeletonLines lines={3} /></div></> : <>
                    <DashboardMetricCard label="آثار در انتظار بررسی" value={summary.pending?.toLocaleString('fa-IR')} detail="تعداد کل آثار منتظر تصمیم انتشار" to="/admin/artworks" eyebrow="انتشار" />
                    <DashboardMetricCard label="حساب‌های کاربری" value={summary.users?.toLocaleString('fa-IR')} detail="تعداد کل حساب‌های ثبت‌شده" to="/admin/users" eyebrow="جامعه" />
                    <DashboardMetricCard label="گزارش‌های پیام" value={summary.reports?.toLocaleString('fa-IR')} detail="مجموع گزارش‌های ثبت‌شده برای رسیدگی" to="/admin/message-reports" eyebrow="ایمنی" />
                </>}
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
                <div className="border border-border bg-white p-5 sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                        <div><p className="text-xs font-bold text-terracotta-strong">اولویت امروز</p><h2 className="mt-1 text-lg font-black">صف بررسی آثار</h2></div>
                        <Link to="/admin/artworks" className="text-sm font-bold text-terracotta-strong underline underline-offset-4">مشاهده صف</Link>
                    </div>
                    {loading ? <div className="mt-5"><SkeletonLines lines={4} /></div> : summary.latest ? (
                        <div className="mt-5 grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                            <div className="aspect-square overflow-hidden bg-surface-muted">
                                {summary.latest.image_url ? <img src={summary.latest.image_url} alt={'تصویر اثر ' + summary.latest.title} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-muted">بدون تصویر</div>}
                            </div>
                            <div className="flex min-w-0 flex-col items-start">
                                <Badge variant="warning">{statusLabels[summary.latest.status] ?? summary.latest.status}</Badge>
                                <h3 className="mt-3 text-lg font-black">{summary.latest.title}</h3>
                                <p className="mt-2 text-sm text-muted">{summary.latest.artist?.display_name ?? 'هنرمند نامشخص'} · {dateLabel(summary.latest.created_at)}</p>
                                <Link to="/admin/artworks" className="mt-auto pt-5 text-sm font-bold text-terracotta-strong underline underline-offset-4">رفتن به بررسی اثر</Link>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-5 text-sm leading-7 text-muted">{summary.pending === 0 ? 'در حال حاضر اثری در صف بررسی نیست.' : 'نمونه‌ای از صف بررسی در دسترس نیست.'}</p>
                    )}
                </div>

                <aside className="border border-border bg-surface-muted p-5 sm:p-7">
                    <p className="text-xs font-bold text-terracotta-strong">راهنمای عملیات</p>
                    <h2 className="mt-2 text-lg font-black">رسیدگی منظم و قابل پیگیری</h2>
                    <p className="mt-3 text-sm leading-7 text-muted">تصمیم‌های انتشار را همراه با توضیح ثبت کنید، نقش‌ها را با دقت مدیریت کنید و گزارش‌های ایمنی را از مسیر اختصاصی بررسی کنید.</p>
                    <Link to="/admin/artworks" className="mt-5 inline-flex min-h-11 items-center bg-ink px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-terracotta">شروع بررسی آثار <span aria-hidden="true" className="mr-3">←</span></Link>
                </aside>
            </section>

            <section aria-labelledby="admin-shortcuts-heading">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                    <div><p className="text-xs font-bold text-terracotta-strong">دسترسی سریع</p><h2 id="admin-shortcuts-heading" className="mt-2 text-xl font-black">بخش‌های مدیریتی</h2></div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {shortcuts.map((item) => <Link key={item.to} to={item.to} className="group flex min-h-44 flex-col border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-terracotta hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">
                        <div className="flex items-center justify-between gap-3"><span aria-hidden="true" className="grid h-10 w-10 place-items-center bg-surface-muted text-lg text-terracotta-strong">{item.symbol}</span><span className="text-[10px] font-bold text-muted">{item.eyebrow}</span></div>
                        <h3 className="mt-5 font-black">{item.title}</h3>
                        <p className="mt-2 text-xs leading-6 text-muted">{item.description}</p>
                        <span className="mt-auto pt-4 text-xs font-bold text-terracotta-strong">ورود به بخش <span aria-hidden="true">←</span></span>
                    </Link>)}
                </div>
            </section>
        </section>
    );
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
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-sm font-bold text-terracotta-strong">مدیریت آثار</p><h1 className="mt-2 text-2xl font-black">صف بررسی و انتشار</h1><p className="mt-2 text-sm leading-7 text-muted">فقط آثار در انتظار بررسی قابل تصمیم‌گیری‌اند. رد اثر یا درخواست اصلاح به توضیح نیاز دارد.</p></div><Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button></header>
        <div className="flex flex-wrap gap-2" aria-label="فیلتر وضعیت آثار">{statuses.map((item) => <Button key={item.value} size="sm" variant={status === item.value ? 'primary' : 'outline'} aria-pressed={status === item.value} onClick={() => chooseStatus(item.value)}>{item.label}</Button>)}</div>
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <SkeletonLines lines={7} /> : !result?.data?.length ? <EmptyState title="اثری در این وضعیت وجود ندارد" description="با انتخاب وضعیت دیگر می‌توانید سوابق تصمیم‌ها را مرور کنید." /> : <>
            <div className="grid gap-4 xl:grid-cols-2">{result.data.map((artwork) => {
                const actionable = artwork.status === 'pending_review';
                return <article key={artwork.id} className="overflow-hidden border border-border bg-paper">
                    <div className="grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"><div className="bg-surface-muted"><img src={artwork.image_url} alt={'تصویر اثر ' + artwork.title} loading="lazy" decoding="async" className="h-56 w-full object-cover sm:h-full sm:min-h-64" /></div>
                        <div className="min-w-0 p-5"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold">{artwork.title}</h2><Badge variant={artwork.status === 'approved' ? 'success' : artwork.status === 'rejected' ? 'danger' : artwork.status === 'pending_review' ? 'warning' : 'info'}>{statusLabels[artwork.status] ?? artwork.status}</Badge></div>
                            <p className="mt-2 text-xs text-muted">{artwork.artist?.display_name ?? '—'} · {artwork.category?.name ?? '—'}</p>
                            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">{artwork.medium && <div><dt className="text-muted">تکنیک</dt><dd className="mt-1 font-semibold">{artwork.medium}</dd></div>}{artwork.dimensions && <div><dt className="text-muted">ابعاد</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}{artwork.year && <div><dt className="text-muted">سال</dt><dd className="mt-1 font-semibold">{artwork.year}</dd></div>}<div><dt className="text-muted">تاریخ ثبت</dt><dd className="mt-1 font-semibold">{dateLabel(artwork.created_at)}</dd></div></dl>
                            {artwork.description && <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted">{artwork.description}</p>}{artwork.rejection_note && <p className="mt-3 border-s-2 border-sand bg-surface-muted p-3 text-xs leading-6 text-muted">یادداشت ثبت‌شده: {artwork.rejection_note}</p>}
                        </div>
                    </div>
                    {actionable && <div className="border-t border-border p-5"><FormField label="توضیح برای هنرمند" hint="برای رد اثر یا درخواست اصلاح الزامی است؛ حداکثر ۲۰۰۰ نویسه."><TextareaField value={notes[artwork.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [artwork.id]: event.target.value }))} maxLength={2000} rows={3} /></FormField><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => moderate(artwork, 'approve')} loading={busyId === artwork.id} disabled={busyId !== null}>تأیید و انتشار</Button><Button size="sm" variant="outline" onClick={() => moderate(artwork, 'request_changes')} disabled={busyId !== null}>درخواست اصلاح</Button><Button size="sm" variant="danger" onClick={() => moderate(artwork, 'reject')} disabled={busyId !== null}>رد اثر</Button></div></div>}
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} /><p className="text-center text-xs text-muted">{result.total ?? result.data.length} اثر در این فهرست</p>
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
    const [confirmAdminId, setConfirmAdminId] = useState(null);
    const controllerRef = useRef(null);
    const load = useCallback(async () => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true); setError('');
        try {
            const { data } = await axios.get(api + '/users', { params: { page }, signal: controller.signal });
            if (!controller.signal.aborted) setResult(data);
        } catch (e) {
            if (!axios.isCancel(e)) setError(e.response?.status === 403 ? 'این حساب اجازه مشاهده کاربران را ندارد.' : 'دریافت فهرست کاربران انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (controllerRef.current === controller) { controllerRef.current = null; setLoading(false); }
        }
    }, [page]);
    useEffect(() => { load(); return () => controllerRef.current?.abort(); }, [load]);
    const changePage = (next) => setParams(next > 1 ? { page: String(next) } : {});
    const updateRole = async (item) => {
        const role = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role);
        if (!['artist', 'admin'].includes(role)) { setError('یکی از نقش‌های پشتیبانی‌شده را انتخاب کنید.'); return; }
        if (role === 'admin' && item.role !== 'admin' && confirmAdminId !== item.id) {
            setConfirmAdminId(item.id);
            return;
        }
        setBusyId(item.id); setError(''); setMessage('');
        try {
            const { data } = await axios.patch(api + '/users/' + item.id + '/role', { role });
            setResult((current) => ({ ...current, data: current.data.map((row) => row.id === item.id ? data.data : row) }));
            setDrafts((current) => { const next = { ...current }; delete next[item.id]; return next; });
            setConfirmAdminId(null);
            setMessage(data.message ?? 'نقش کاربر به‌روزرسانی شد.');
        } catch (e) {
            setError(e.response?.status === 403 ? 'سرور اجازه تغییر نقش این حساب را نداد.' : e.response?.data?.errors?.role?.[0] ?? e.response?.data?.message ?? 'تغییر نقش کاربر انجام نشد.');
        } finally { setBusyId(null); }
    };
    return <section className="space-y-6" dir="rtl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div><p className="text-sm font-bold text-terracotta-strong">مدیریت حساب‌ها</p><h1 className="mt-2 text-2xl font-black">کاربران</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-muted">فهرست حساب‌ها و مدیریت نقش‌های مجاز. ارتقای هر حساب به مدیر، مرحله تأیید جداگانه دارد.</p></div>
            <Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-border bg-white p-4"><p className="text-xs text-muted">حساب‌های این صفحه</p><p className="mt-2 text-2xl font-black tabular-nums">{result?.data?.length?.toLocaleString('fa-IR') ?? '—'}</p></div>
            <div className="border border-border bg-white p-4"><p className="text-xs text-muted">کل حساب‌ها</p><p className="mt-2 text-2xl font-black tabular-nums">{result?.total?.toLocaleString('fa-IR') ?? '—'}</p></div>
        </div>
        <p className="border-s-2 border-sand bg-surface-muted p-4 text-xs leading-7 text-muted">نقش‌های قابل انتخاب «هنرمند» و «مدیر» هستند. ایجاد خریدار از مسیر ثبت‌نام انجام می‌شود و حذف یا تعلیق حساب پشتیبانی نمی‌شود. مدیر نمی‌تواند نقش مدیریتی حساب خودش را حذف کند.</p>
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <div className="grid gap-3 sm:grid-cols-2"><div className="border border-border bg-white p-5"><SkeletonLines lines={4} /></div><div className="border border-border bg-white p-5"><SkeletonLines lines={4} /></div></div> : !result?.data?.length ? <EmptyState title="کاربری برای نمایش وجود ندارد" /> : <>
            <div className="grid gap-3 xl:grid-cols-2">{result.data.map((item) => {
                const selected = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role);
                const selfAdmin = item.id === user?.id && item.role === 'admin';
                const needsAdminConfirmation = confirmAdminId === item.id && selected === 'admin' && item.role !== 'admin';
                return <article key={item.id} className="min-w-0 border border-border bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0"><h2 className="break-words font-bold">{item.name}</h2><p dir="ltr" className="mt-1 break-all text-left text-xs text-muted">{item.email}</p></div>
                        <Badge variant={item.role === 'admin' ? 'accent' : item.role === 'artist' ? 'info' : 'neutral'}>{roleLabels[item.role] ?? item.role}</Badge>
                    </div>
                    <div className="mt-5 border-t border-border pt-4">
                        {selfAdmin ? <p className="text-xs leading-6 text-muted">این حساب مدیر فعلی است؛ تغییر نقش حساب خودتان از این صفحه امکان‌پذیر نیست.</p> : <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                            <SelectField aria-label={'نقش جدید برای ' + item.name} value={selected} disabled={busyId === item.id} onChange={(event) => { setDrafts((current) => ({ ...current, [item.id]: event.target.value })); setConfirmAdminId(null); }} className="w-full">
                                {item.role === 'buyer' && <option value="">انتخاب نقش</option>}
                                <option value="artist">هنرمند</option><option value="admin">مدیر</option>
                            </SelectField>
                            <Button size="sm" variant="outline" disabled={busyId !== null || !selected || selected === item.role} loading={busyId === item.id} onClick={() => updateRole(item)}>ثبت تغییر</Button>
                        </div>}
                        {needsAdminConfirmation && <div className="mt-4 border border-warning/30 bg-warning/5 p-3">
                            <p className="text-xs leading-6 text-ink">این تغییر دسترسی مدیریتی می‌دهد و امکان مدیریت کاربران و محتوای سامانه را فعال می‌کند. آیا ارتقا را تأیید می‌کنید؟</p>
                            <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => updateRole(item)} loading={busyId === item.id}>تأیید ارتقا به مدیر</Button><Button size="sm" variant="ghost" onClick={() => setConfirmAdminId(null)} disabled={busyId !== null}>انصراف</Button></div>
                        </div>}
                    </div>
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} />
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
    const [confirmRemovalId, setConfirmRemovalId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const controllerRef = useRef(null);
    const load = useCallback(async () => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true); setError('');
        try {
            const { data } = await axios.get(api + '/message-reports', { params: { page }, signal: controller.signal });
            if (!controller.signal.aborted) setResult(data);
        } catch (e) {
            if (!axios.isCancel(e)) setError(e.response?.status === 403 ? 'دسترسی به گزارش‌های پیام مجاز نیست.' : 'دریافت گزارش‌ها انجام نشد.');
        } finally {
            if (controllerRef.current === controller) { controllerRef.current = null; setLoading(false); }
        }
    }, [page]);
    useEffect(() => { load(); return () => controllerRef.current?.abort(); }, [load]);
    const review = async (report, action) => {
        if (action === 'remove_message' && confirmRemovalId !== report.id) {
            setConfirmRemovalId(report.id);
            return;
        }
        setBusyId(report.id); setError(''); setMessage('');
        try {
            const { data } = await axios.patch(api + '/message-reports/' + report.id, { action, note: (notes[report.id] ?? '').trim() || null });
            setMessage(data.message ?? 'تصمیم ثبت شد.');
            setConfirmRemovalId(null);
            setNotes((current) => { const next = { ...current }; delete next[report.id]; return next; });
            await load();
        } catch (e) {
            setError(e.response?.data?.message ?? 'ثبت تصمیم انجام نشد.');
        } finally { setBusyId(null); }
    };
    return <section className="space-y-6" dir="rtl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div><p className="text-sm font-bold text-terracotta-strong">ایمنی گفتگوها</p><h1 className="mt-2 text-2xl font-black">گزارش‌های پیام</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-muted">گزارش‌ها را با توجه به زمینه گفتگو بررسی کنید. حذف پیام یک اقدام برگشت‌ناپذیر در این پنل است و پیش از اجرا تأیید جداگانه می‌خواهد.</p></div>
            <Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-border bg-white p-4"><p className="text-xs text-muted">گزارش‌های این صفحه</p><p className="mt-2 text-2xl font-black tabular-nums">{result?.data?.length?.toLocaleString('fa-IR') ?? '—'}</p></div>
            <div className="border border-border bg-white p-4"><p className="text-xs text-muted">کل گزارش‌ها</p><p className="mt-2 text-2xl font-black tabular-nums">{result?.total?.toLocaleString('fa-IR') ?? '—'}</p></div>
        </div>
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <div className="space-y-3"><div className="border border-border bg-white p-5"><SkeletonLines lines={5} /></div><div className="border border-border bg-white p-5"><SkeletonLines lines={5} /></div></div> : !result?.data?.length ? <EmptyState title="گزارش بازی وجود ندارد" description="گزارش‌های جدید پس از ثبت از سوی یکی از طرفین گفتگو در اینجا نمایش داده می‌شوند." /> : <>
            <div className="space-y-4">{result.data.map((report) => {
                const isOpen = report.status === 'open';
                const confirmingRemoval = confirmRemovalId === report.id;
                return <article key={report.id} className="overflow-hidden border border-border bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-surface-muted/70 p-4 sm:p-5">
                        <div><p className="text-xs font-bold text-terracotta-strong">گزارش شماره {report.id}</p><h2 className="mt-1 font-black">{report.reason}</h2><p className="mt-2 text-xs text-muted">گزارش‌دهنده: {report.reporter?.name ?? 'کاربر'} · {dateLabel(report.created_at)}</p></div>
                        <Badge variant={isOpen ? 'warning' : report.status === 'dismissed' ? 'neutral' : 'success'}>{isOpen ? 'در انتظار بررسی' : report.status === 'dismissed' ? 'رد گزارش' : 'بررسی‌شده'}</Badge>
                    </div>
                    <div className="space-y-4 p-4 sm:p-5">
                        {report.details && <div><p className="text-xs font-bold text-muted">شرح گزارش</p><p className="mt-2 whitespace-pre-line text-sm leading-7">{report.details}</p></div>}
                        {report.message ? <div className="border-s-2 border-terracotta bg-surface-muted p-4"><p className="text-[11px] font-bold text-muted">پیام علامت‌گذاری‌شده</p><blockquote className="mt-2 whitespace-pre-line text-sm leading-7">{report.message.body ?? 'متن پیام حذف شده است.'}</blockquote></div> : <p className="text-xs text-muted">متن پیام مرتبط در دسترس نیست.</p>}
                        {isOpen && <>
                            <label className="block text-xs font-semibold text-muted">یادداشت رسیدگی (اختیاری)<textarea value={notes[report.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={1000} rows={2} className="ra-control mt-2 w-full" placeholder="خلاصه تصمیم یا زمینه بررسی…" /></label>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="primary" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'reviewed')}>ثبت بررسی</Button>
                                <Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => review(report, 'dismissed')}>رد گزارش</Button>
                                {report.message && <Button size="sm" variant="danger" disabled={busyId !== null} onClick={() => review(report, 'remove_message')}>حذف پیام</Button>}
                            </div>
                            {confirmingRemoval && <div className="border border-danger/30 bg-danger/5 p-4">
                                <p className="text-sm font-bold text-ink">حذف پیام را تأیید می‌کنید؟</p>
                                <p className="mt-1 text-xs leading-6 text-muted">این اقدام پیام گزارش‌شده را حذف می‌کند. فقط در صورت احراز تخلف آن را ادامه دهید.</p>
                                <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="danger" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'remove_message')}>بله، حذف پیام</Button><Button size="sm" variant="ghost" disabled={busyId !== null} onClick={() => setConfirmRemovalId(null)}>انصراف</Button></div>
                            </div>}
                        </>}
                    </div>
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={(next) => { setConfirmRemovalId(null); setParams(next > 1 ? { page: String(next) } : {}); }} disabled={loading || busyId !== null} />
        </>}
    </section>;
}
