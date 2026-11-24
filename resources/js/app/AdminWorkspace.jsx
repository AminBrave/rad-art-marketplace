import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Badge, Button, EmptyState, ErrorState, FormField, Skeleton, Pagination, SelectField, SkeletonLines, SuccessState, TextareaField, WorkspaceHero, PageHeader, SectionHeader, DashboardMetricCard, DashboardMetricSkeleton, ArtworkModerationSkeleton, AdminUserCardsSkeleton, MessageReportsSkeleton, MediaImage, Container } from '../components/ui';
import { localizedValue } from '../utils/localizedContent';

const api = '/api/v1/admin';
const statuses = [
    { value: 'pending_review', label: 'در انتظار بررسی' },
    { value: 'approved', label: 'تأییدشده' },
    { value: 'changes_requested', label: 'نیازمند اصلاح' },
    { value: 'rejected', label: 'ردشده' },
];
const statusLabels = Object.fromEntries(statuses.map((item) => [item.value, item.label]));
const roleLabels = { buyer: 'خریدار', artist: 'هنرمند', admin: 'مدیر' };
const dateLabel = (value, locale = 'fa') => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'medium' });
};

export function AdminDashboardHome() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const dashboardQuery = useQuery({
        queryKey: ['admin', 'dashboard', user?.id],
        queryFn: async ({ signal }) => {
            const responses = await Promise.allSettled([
                axios.get(api + '/artworks', { params: { status: 'pending_review', page: 1, per_page: 1 }, signal }),
                axios.get(api + '/users', { params: { page: 1, per_page: 1 }, signal }),
                axios.get(api + '/message-reports', { params: { page: 1 }, signal }),
            ]);
            const summary = { pending: null, users: null, reports: null, latest: null };
            const errors = [];
            if (responses[0].status === 'fulfilled') {
                summary.pending = responses[0].value.data.total ?? null;
                summary.latest = responses[0].value.data.data?.[0] ?? null;
            } else errors.push(t('دریافت صف بررسی آثار انجام نشد.'));
            if (responses[1].status === 'fulfilled') summary.users = responses[1].value.data.total ?? null;
            else errors.push(t('دریافت تعداد کاربران انجام نشد.'));
            if (responses[2].status === 'fulfilled') summary.reports = responses[2].value.data.total ?? null;
            else errors.push(t('دریافت گزارش‌های پیام انجام نشد.'));
            return { summary, errors };
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const summary = dashboardQuery.data?.summary ?? { pending: null, users: null, reports: null, latest: null };
    const errors = dashboardQuery.data?.errors ?? (dashboardQuery.isError ? [t('دریافت آمار مدیریت انجام نشد.')] : []);
    const loading = dashboardQuery.isPending;
    const load = () => dashboardQuery.refetch();


    const shortcuts = [
        { to: '/admin/artworks', eyebrow: t('محتوا'), title: t('بررسی آثار'), description: t('صف انتظار، تصمیم‌های انتشار و سوابق اصلاح یا رد آثار'), symbol: '▧' },
        { to: '/admin/users', eyebrow: t('حساب‌ها'), title: t('مدیریت کاربران'), description: t('مرور حساب‌ها و مدیریت نقش‌های مجاز در سامانه'), symbol: '◎' },
        { to: '/admin/editorial', eyebrow: t('انتخاب سردبیر'), title: t('مجموعه‌های منتخب'), description: t('تنظیم مجموعه‌ها و انتخاب هنرمندان برجسته'), symbol: '✳' },
        { to: '/admin/message-reports', eyebrow: t('اعتماد و ایمنی'), title: t('گزارش‌های پیام'), description: t('رسیدگی به گزارش‌ها و بررسی محتوای علامت‌گذاری‌شده'), symbol: '⚑' },
        { to: '/admin/artwork-comment-reports', eyebrow: t('گفت‌وگوی عمومی'), title: t('گزارش دیدگاه‌ها'), description: t('بررسی دیدگاه‌های گزارش‌شده در صفحه آثار'), symbol: '≋' },
    ];

    return (
        <div className="w-full space-y-8">
            <WorkspaceHero
                eyebrow={t('مرکز کنترل راد آرت')}
                title={<>{t('خوش آمدید، ')}{user?.name ?? t('مدیر')}</>}
                description={t("از اینجا صف انتشار، حساب‌های کاربری، مجموعه‌های سردبیری و گزارش‌های ایمنی را مدیریت کنید. شاخص‌ها از داده‌های واقعی سامانه دریافت می‌شوند.")}
                actions={<Button variant="secondary" onClick={load} loading={loading}>{t("به‌روزرسانی آمار")}</Button>}
            />

            <Container width="wide" className="space-y-8">
            {errors.length > 0 && <ErrorState title={t("بخشی از اطلاعات دریافت نشد")} description={errors.map(t).join(' ')} onRetry={load} />}

            <section aria-label={t("شاخص‌های عملیاتی")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? <DashboardMetricSkeleton count={3} /> : <>
                    <DashboardMetricCard as={Link} label={t("آثار در انتظار بررسی")} value={summary.pending?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} detail={t('تعداد کل آثار منتظر تصمیم انتشار')} to="/admin/artworks" eyebrow={t('انتشار')} />
                    <DashboardMetricCard as={Link} label={t("حساب‌های کاربری")} value={summary.users?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} detail={t('تعداد کل حساب‌های ثبت‌شده')} to="/admin/users" eyebrow={t('جامعه')} />
                    <DashboardMetricCard as={Link} label={t("گزارش‌های پیام")} value={summary.reports?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} detail={t('مجموع گزارش‌های ثبت‌شده برای رسیدگی')} to="/admin/message-reports" eyebrow={t('ایمنی')} />
                </>}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
                <div className="border-y border-border bg-transparent py-6 sm:py-7">
                    <SectionHeader eyebrow={t("اولویت امروز")} title={t("صف بررسی آثار")} actions={<Link to="/admin/artworks" className="text-sm font-bold text-terracotta-strong underline underline-offset-4">{t("مشاهده صف")}</Link>} />
                    {loading ? <div aria-hidden="true" className="mt-5 grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]"><Skeleton className="aspect-[3/4] w-full rounded-none sm:max-w-32" /><div className="grid gap-3"><SkeletonLines lines={3} /><SkeletonLines lines={1} /></div></div> : summary.latest ? (
                        <div className="mt-5 grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                            <div className="aspect-[3/4] overflow-hidden bg-surface-muted p-3">
                                <MediaImage src={summary.latest.image_url} alt={t('تصویر اثر ') + localizedValue(summary.latest, 'title', locale)} className="h-full w-full" imageClassName="object-cover" loading="lazy" decoding="async" fallback={<div className="grid h-full place-items-center text-xs text-muted">{t('بدون تصویر')}</div>} />
                            </div>
                            <div className="flex min-w-0 flex-col items-start">
                                <Badge variant="warning">{t(statusLabels[summary.latest.status] ?? summary.latest.status)}</Badge>
                                <h3 className="mt-3 text-lg font-black">{localizedValue(summary.latest, 'title', locale)}</h3>
                                <p className="mt-2 text-sm text-muted">{localizedValue(summary.latest.artist, 'display_name', locale) || t('هنرمند نامشخص')} · {dateLabel(summary.latest.created_at, locale)}</p>
                                <Link to="/admin/artworks" className="mt-auto pt-5 text-sm font-bold text-terracotta-strong underline underline-offset-4">{t("رفتن به بررسی اثر")}</Link>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-5 text-sm leading-7 text-muted">{t(summary.pending === 0 ? 'در حال حاضر اثری در صف بررسی نیست.' : 'نمونه‌ای از صف بررسی در دسترس نیست.')}</p>
                    )}
                </div>

                <aside className="border-y border-border bg-surface-muted/60 py-6 sm:px-6 sm:py-7">
                    <SectionHeader eyebrow={t("راهنمای عملیات")} title={t("رسیدگی منظم و قابل پیگیری")} className="border-0 pb-0" />
                    <p className="mt-3 text-sm leading-7 text-muted">{t("تصمیم‌های انتشار را همراه با توضیح ثبت کنید، نقش‌ها را با دقت مدیریت کنید و گزارش‌های ایمنی را از مسیر اختصاصی بررسی کنید.")}</p>
                    <Link to="/admin/artworks" className="mt-5 inline-flex min-h-11 items-center bg-ink px-4 py-3 text-sm font-bold text-inverse transition-colors hover:bg-terracotta">{t('شروع بررسی آثار')} <span aria-hidden="true" className="ms-3 rtl:rotate-180">→</span></Link>
                </aside>
            </section>

            <section aria-labelledby="admin-shortcuts-heading">
                <SectionHeader id="admin-shortcuts-heading" eyebrow={t("دسترسی سریع")} title={t("بخش‌های مدیریتی")} />
                <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                    {shortcuts.map((item, index) => <Link key={item.to} to={item.to} className="group flex min-h-40 flex-col border-t border-border py-5 transition-colors hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                        <div className="flex items-center justify-between gap-3"><span dir="ltr" className="font-latin text-[10px] font-bold tracking-widest text-terracotta-strong">AREA / 0{index + 1}</span><span aria-hidden="true" className="text-lg text-muted transition-colors group-hover:text-terracotta-strong">{item.symbol}</span></div>
                        <p className="mt-3 text-[10px] font-bold text-muted">{item.eyebrow}</p>
                        <h3 className="mt-1 font-black text-ink">{item.title}</h3>
                        <p className="mt-2 text-xs leading-6 text-muted">{item.description}</p>
                        <span className="mt-auto pt-4 text-xs font-bold text-terracotta-strong">{t('ورود به بخش')} <span aria-hidden="true" className="rtl:rotate-180">→</span></span>
                    </Link>)}
                </div>
            </section>
            </Container>
        </div>
    );
}

export function AdminArtworkModeration() {
    const { t, locale } = useLanguage();
    const [params, setParams] = useSearchParams();
    const { user } = useAuth();
    const status = statuses.some((item) => item.value === params.get('status')) ? params.get('status') : 'pending_review';
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [notes, setNotes] = useState({});
    const [actionError, setActionError] = useState(''), [message, setMessage] = useState('');
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'artworks', user?.id, status, page];
    const moderationMutation = useMutation({
        mutationKey: ['admin', 'artworks', 'moderate', user?.id],
        mutationFn: ({ artwork, action, note }) => axios.patch(api + '/artworks/' + artwork.id + '/moderation', { action, ...(action === 'approve' ? {} : { note }) }),
    });
    const busyId = moderationMutation.isPending ? moderationMutation.variables?.artwork?.id ?? null : null;
    const artworksQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/artworks', { params: { status, page }, signal });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const result = artworksQuery.data;
    const loading = artworksQuery.isPending;
    const load = () => { setActionError(''); return artworksQuery.refetch(); };
    const error = actionError || (artworksQuery.isError
        ? (artworksQuery.error.response?.status === 403 ? t("این حساب اجازه مشاهده صف بررسی آثار را ندارد.") : t("دریافت آثار انجام نشد. دوباره تلاش کنید."))
        : '');
    const chooseStatus = (value) => { setActionError(''); setMessage(''); setParams(value === 'pending_review' ? {} : { status: value }); };
    const changePage = (next) => setParams({ ...(status !== 'pending_review' ? { status } : {}), ...(next > 1 ? { page: String(next) } : {}) });
    const moderate = async (artwork, action) => {
        const note = (notes[artwork.id] ?? '').trim();
        if (action !== 'approve' && !note) { setActionError(t("برای رد اثر یا درخواست اصلاح، نوشتن توضیح الزامی است.")); return; }
        setActionError(''); setMessage('');
        try {
            const { data } = await moderationMutation.mutateAsync({ artwork, action, note });
            setMessage(t(data.message ?? "تصمیم ثبت شد.")); setNotes((current) => ({ ...current, [artwork.id]: '' })); await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin', 'artworks', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['artist-workspace', 'artworks'] }),
                queryClient.invalidateQueries({ queryKey: ['home', 'artworks'] }),
                queryClient.invalidateQueries({ queryKey: ['artworks'] }),
            ]);
        } catch (e) { setActionError(e.response?.status === 403 ? t("سرور اجازه انجام این عملیات را نداد.") : t(e.response?.data?.errors?.note?.[0] ?? e.response?.data?.message ?? "ثبت تصمیم انجام نشد.")); }
    };
    return <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
        <PageHeader bleed={false} eyebrow={t("مدیریت آثار")} title={t("صف بررسی و انتشار")} description={t("فقط آثار در انتظار بررسی قابل تصمیم‌گیری‌اند. رد اثر یا درخواست اصلاح به توضیح نیاز دارد.")} actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>{t("به‌روزرسانی")}</Button>} />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 border-b border-border" aria-label={t("فیلتر وضعیت آثار")}>{statuses.map((item) => <Button variant="ghost" key={item.value} type="button" aria-pressed={status === item.value} onClick={() => chooseStatus(item.value)} className={"min-h-11 border-b-2 px-1 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none " + (status === item.value ? 'border-terracotta text-terracotta-strong' : 'border-transparent text-muted hover:border-border-strong hover:text-ink')}>{t(item.label)}</Button>)}</nav>
        {message && <SuccessState title={message} />}{error && <ErrorState title={t("عملیات انجام نشد")} description={error} onRetry={load} />}
        {loading ? <ArtworkModerationSkeleton count={4} /> : !result?.data?.length ? <EmptyState title={t("اثری در این وضعیت وجود ندارد")} description={t("با انتخاب وضعیت دیگر می‌توانید سوابق تصمیم‌ها را مرور کنید.")} /> : <>
            <div className="grid gap-x-6 gap-y-8 xl:grid-cols-2">{result.data.map((artwork) => {
                const actionable = artwork.status === 'pending_review';
                return <article key={artwork.id} className="min-w-0 border-y border-ink bg-transparent py-4">
                    <div className="grid sm:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]"><div className="aspect-[3/4] overflow-hidden bg-surface-muted p-3 sm:aspect-[3/4]"><MediaImage src={artwork.image_url} alt={t('تصویر اثر ') + localizedValue(artwork, 'title', locale)} className="h-56 w-full sm:h-full sm:min-h-64" imageClassName="object-cover" loading="lazy" decoding="async" /></div>
                        <div className="min-w-0 py-4 sm:px-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold">{localizedValue(artwork, 'title', locale)}</h2><Badge variant={artwork.status === 'approved' ? 'success' : artwork.status === 'rejected' ? 'danger' : artwork.status === 'pending_review' ? 'warning' : 'info'} >{t(statusLabels[artwork.status] ?? artwork.status)}</Badge></div>
                            <p className="mt-2 text-xs text-muted">{localizedValue(artwork.artist, 'display_name', locale) || '—'} · {localizedValue(artwork.category, 'name', locale) || '—'}</p>
                            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">{artwork.medium && <div><dt className="text-muted">{t("تکنیک")}</dt><dd className="mt-1 font-semibold">{artwork.medium}</dd></div>}{artwork.dimensions && <div><dt className="text-muted">{t("ابعاد")}</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}{artwork.year && <div><dt className="text-muted">{t("سال")}</dt><dd className="mt-1 font-semibold">{artwork.year}</dd></div>}<div><dt className="text-muted">{t("تاریخ ثبت")}</dt><dd className="mt-1 font-semibold">{dateLabel(artwork.created_at, locale)}</dd></div></dl>
                            {localizedValue(artwork, 'description', locale) && <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted">{localizedValue(artwork, 'description', locale)}</p>}{artwork.rejection_note && <p className="mt-3 border-s-2 border-sand bg-surface-muted p-3 text-xs leading-6 text-muted">{t('یادداشت ثبت‌شده:')} {t(artwork.rejection_note)}</p>}
                        </div>
                    </div>
                    {actionable && <div className="mt-4 border-t border-border py-5 sm:px-1"><FormField label={t("توضیح برای هنرمند")} hint={t("برای رد اثر یا درخواست اصلاح الزامی است؛ حداکثر ۲۰۰۰ نویسه.")}><TextareaField value={notes[artwork.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [artwork.id]: event.target.value }))} maxLength={2000} rows={3} /></FormField><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => moderate(artwork, 'approve')} loading={busyId === artwork.id} disabled={busyId !== null}{t('تأیید و انتشار')}</Button><Button size="sm" variant="outline" onClick={() => moderate(artwork, 'request_changes')} disabled={busyId !== null}{t('درخواست اصلاح')}</Button><Button size="sm" variant="danger" onClick={() => moderate(artwork, 'reject')} disabled={busyId !== null}{t('رد اثر')}</Button></div></div>}
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} /><p className="text-center text-xs text-muted">{result.total ?? result.data.length} {t('اثر در این فهرست')}</p>
        </>}
    </section>;
}

export function AdminUsersPage() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [drafts, setDrafts] = useState({});
    const [actionError, setActionError] = useState(''), [message, setMessage] = useState('');
    const [confirmAdminId, setConfirmAdminId] = useState(null);
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'users', user?.id, page];
    const roleMutation = useMutation({
        mutationKey: ['admin', 'users', 'role', user?.id],
        mutationFn: ({ item, role }) => axios.patch(api + '/users/' + item.id + '/role', { role }),
    });
    const busyId = roleMutation.isPending ? roleMutation.variables?.item?.id ?? null : null;
    const usersQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/users', { params: { page }, signal });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const result = usersQuery.data;
    const loading = usersQuery.isPending;
    const load = () => { setActionError(''); return usersQuery.refetch(); };
    const error = actionError || (usersQuery.isError
        ? (usersQuery.error.response?.status === 403 ? t("این حساب اجازه مشاهده کاربران را ندارد.") : t("دریافت فهرست کاربران انجام نشد. دوباره تلاش کنید."))
        : '');
    const changePage = (next) => setParams(next > 1 ? { page: String(next) } : {});
    const updateRole = async (item) => {
        const role = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role);
        if (!['artist', 'admin'].includes(role)) { setActionError(t("یکی از نقش‌های پشتیبانی‌شده را انتخاب کنید.")); return; }
        if (role === 'admin' && item.role !== 'admin' && confirmAdminId !== item.id) {
            setConfirmAdminId(item.id);
            return;
        }
        setActionError(''); setMessage('');
        try {
            const { data } = await roleMutation.mutateAsync({ item, role });
            queryClient.setQueryData(queryKey, (current) => current ? { ...current, data: current.data.map((row) => row.id === item.id ? data.data : row) } : current);
            setDrafts((current) => { const next = { ...current }; delete next[item.id]; return next; });
            setConfirmAdminId(null);
            setMessage(t(data.message ?? "نقش کاربر به‌روزرسانی شد."));
        } catch (e) {
            setActionError(e.response?.status === 403 ? t("سرور اجازه تغییر نقش این حساب را نداد.") : t(e.response?.data?.errors?.role?.[0] ?? e.response?.data?.message ?? "تغییر نقش کاربر انجام نشد."));
        }
    };
    return <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
        <PageHeader bleed={false} eyebrow={t("مدیریت حساب‌ها")} title={t("کاربران")} description={t("فهرست حساب‌ها و مدیریت نقش‌های مجاز. ارتقای هر حساب به مدیر، مرحله تأیید جداگانه دارد.")} actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>{t("به‌روزرسانی")}</Button>} />
        <dl className="grid grid-cols-2 gap-4 border-y border-border py-4 sm:max-w-xl sm:gap-8"><div><dt className="text-xs text-muted">{t("حساب‌های این صفحه")}</dt><dd className="mt-1 text-2xl font-black tabular-nums">{result?.data?.length?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</dd></div><div><dt className="text-xs text-muted">{t('کل حساب‌ها')}</dt><dd className="mt-1 text-2xl font-black tabular-nums">{result?.total?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</dd></div></dl>
        <p className="border-s-2 border-sand py-2 pe-4 text-xs leading-7 text-muted">{t("نقش‌های قابل انتخاب «هنرمند» و «مدیر» هستند. ایجاد خریدار از مسیر ثبت‌نام انجام می‌شود و حذف یا تعلیق حساب پشتیبانی نمی‌شود. مدیر نمی‌تواند نقش مدیریتی حساب خودش را حذف کند.")}</p>
        {message && <SuccessState title={message} />}{error && <ErrorState title={t("عملیات انجام نشد")} description={error} onRetry={load} />}
        {loading ? <AdminUserCardsSkeleton count={4} /> : !result?.data?.length ? <EmptyState title={t("کاربری برای نمایش وجود ندارد")} /> : <>
            <div className="grid gap-x-6 gap-y-2 xl:grid-cols-2">{result.data.map((item) => {
                const selected = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role);
                const selfAdmin = item.id === user?.id && item.role === 'admin';
                const needsAdminConfirmation = confirmAdminId === item.id && selected === 'admin' && item.role !== 'admin';
                return <article key={item.id} className="min-w-0 border-t border-border bg-transparent py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0"><p className="mb-1 text-[10px] font-bold tracking-wide text-muted">{t('حساب کاربری')} · {item.id}</p><h2 className="break-words font-bold">{item.name}</h2><p dir="ltr" className="mt-1 break-all text-start text-xs text-muted">{item.email}</p></div>
                        <Badge variant={item.role === 'admin' ? 'accent' : item.role === 'artist' ? 'info' : 'neutral'}>{t(roleLabels[item.role] ?? item.role)}</Badge>
                    </div>
                    <div className="mt-5 border-t border-border/70 pt-4">
                        {selfAdmin ? <p className="text-xs leading-6 text-muted">{t("این حساب مدیر فعلی است؛ تغییر نقش حساب خودتان از این صفحه امکان‌پذیر نیست.")}</p> : <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                            <SelectField aria-label={'نقش جدید برای ' + item.name} value={selected} disabled={busyId === item.id} onChange={(event) => { setDrafts((current) => ({ ...current, [item.id]: event.target.value })); setConfirmAdminId(null); }} className="w-full">
                                {item.role === 'buyer' && <option value="">{t("انتخاب نقش")}</option>}
                                <option value="artist">{t("هنرمند")}</option><option value="admin">{t("مدیر")}</option>
                            </SelectField>
                            <Button size="sm" variant="outline" disabled={busyId !== null || !selected || selected === item.role} loading={busyId === item.id} onClick={() => updateRole(item)}>{t("ثبت تغییر")}</Button>
                        </div>}
                        {needsAdminConfirmation && <div className="mt-4 border border-[color:color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--color-warning)_5%,transparent)] p-3">
                            <p className="text-xs leading-6 text-ink">{t("این تغییر دسترسی مدیریتی می‌دهد و امکان مدیریت کاربران و محتوای سامانه را فعال می‌کند. آیا ارتقا را تأیید می‌کنید؟")}</p>
                            <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => updateRole(item)} loading={busyId === item.id}>{t("تأیید ارتقا به مدیر")}</Button><Button size="sm" variant="ghost" onClick={() => setConfirmAdminId(null)} disabled={busyId !== null}>{t("انصراف")}</Button></div>
                        </div>}
                    </div>
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} />
        </>}
    </section>;
}

export function AdminMessageReportsPage() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [notes, setNotes] = useState({});
    const [confirmRemovalId, setConfirmRemovalId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [message, setMessage] = useState('');
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'message-reports', user?.id, page];
    const reviewMutation = useMutation({
        mutationKey: ['admin', 'message-reports', 'review', user?.id],
        mutationFn: ({ report, action, note }) => axios.patch(api + '/message-reports/' + report.id, { action, note }),
    });
    const busyId = reviewMutation.isPending ? reviewMutation.variables?.report?.id ?? null : null;
    const reportsQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/message-reports', { params: { page }, signal });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const result = reportsQuery.data;
    const loading = reportsQuery.isPending;
    const load = () => { setActionError(''); return reportsQuery.refetch(); };
    const error = actionError || (reportsQuery.isError
        ? (reportsQuery.error.response?.status === 403 ? t("دسترسی به گزارش‌های پیام مجاز نیست.") : t("دریافت گزارش‌ها انجام نشد."))
        : '');
    const review = async (report, action) => {
        if (action === 'remove_message' && confirmRemovalId !== report.id) {
            setConfirmRemovalId(report.id);
            return;
        }
        setActionError(''); setMessage('');
        try {
            const { data } = await reviewMutation.mutateAsync({ report, action, note: (notes[report.id] ?? '').trim() || null });
            setMessage(data.message ?? t("تصمیم ثبت شد."));
            setConfirmRemovalId(null);
            setNotes((current) => { const next = { ...current }; delete next[report.id]; return next; });
            await queryClient.invalidateQueries({ queryKey: ['admin', 'message-reports', user?.id] });
        } catch (e) {
            setActionError(t(e.response?.data?.message ?? "ثبت تصمیم انجام نشد."));
        }
    };
    return <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
        <PageHeader bleed={false} eyebrow={t("ایمنی گفتگوها")} title={t("گزارش‌های پیام")} description={t("گزارش‌ها را با توجه به زمینه گفتگو بررسی کنید. حذف پیام یک اقدام برگشت‌ناپذیر در این پنل است و پیش از اجرا تأیید جداگانه می‌خواهد.")} actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>{t("به‌روزرسانی")}</Button>} />
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-y border-border bg-transparent py-4"><p className="text-xs text-muted">{t("گزارش‌های این صفحه")}</p><p className="mt-2 text-2xl font-black tabular-nums">{result?.data?.length?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</p></div>
            <div className="border border-border bg-paper p-4"><p className="text-xs text-muted">{t("کل گزارش‌ها")}</p><p className="mt-2 text-2xl font-black tabular-nums">{result?.total?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</p></div>
        </div>
        {message && <SuccessState title={message} />}{error && <ErrorState title={t("عملیات انجام نشد")} description={error} onRetry={load} />}
        {loading ? <MessageReportsSkeleton count={3} /> : !result?.data?.length ? <EmptyState title={t("گزارش بازی وجود ندارد")} description={t("گزارش‌های جدید پس از ثبت از سوی یکی از طرفین گفتگو در اینجا نمایش داده می‌شوند.")} /> : <>
            <div className="space-y-4">{result.data.map((report) => {
                const isOpen = report.status === 'open';
                const confirmingRemoval = confirmRemovalId === report.id;
                return <article key={report.id} className="overflow-hidden border-t border-border bg-transparent pt-1">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border py-5">
                        <div><p className="text-xs font-bold text-terracotta-strong">{t('گزارش شماره')} {report.id}</p><h2 className="mt-1 font-black">{report.reason}</h2><p className="mt-2 text-xs text-muted" >{t('گزارش‌دهنده:')} {report.reporter?.name ?? t("کاربر")} · {dateLabel(report.created_at, locale)}</p></div>
                        <Badge variant={isOpen ? 'warning' : report.status === 'dismissed' ? 'neutral' : 'success'}>{isOpen ? t("در انتظار بررسی") : report.status === 'dismissed' ? t("رد گزارش") : t("بررسی‌شده")}</Badge>
                    </div>
                    <div className="space-y-5 py-5">
                        {report.details && <div><p className="text-xs font-bold text-muted">{t("شرح گزارش")}</p><p className="mt-2 whitespace-pre-line text-sm leading-7">{report.details}</p></div>}
                        {report.message ? <div className="border-s-2 border-terracotta bg-surface-muted/50 p-4 sm:p-5"><p className="text-[11px] font-bold tracking-wide text-muted">{t("محتوای مورد گزارش")}</p><blockquote className="mt-2 whitespace-pre-line text-sm leading-7">{report.message.body ?? t('متن پیام حذف شده است.')}</blockquote></div> : <p className="text-xs text-muted" >{t('متن پیام مرتبط در دسترس نیست.')}</p>}
                        {isOpen && <>
                            <FormField label={t("یادداشت رسیدگی (اختیاری)")}><TextareaField value={notes[report.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={1000} rows={2} placeholder={t("خلاصه تصمیم یا زمینه بررسی…")} /></FormField>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="primary" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'reviewed')}>{t("ثبت بررسی")}</Button>
                                <Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => review(report, 'dismissed')}>{t("رد گزارش")}</Button>
                                {report.message && <Button size="sm" variant="danger" disabled={busyId !== null} onClick={() => review(report, 'remove_message')}>{t("حذف پیام")}</Button>}
                            </div>
                            {confirmingRemoval && <div className="border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--color-danger)_5%,transparent)] p-4">
                                <p className="text-sm font-bold text-ink">{t("حذف پیام را تأیید می‌کنید؟")}</p>
                                <p className="mt-1 text-xs leading-6 text-muted">{t("این اقدام پیام گزارش‌شده را حذف می‌کند. فقط در صورت احراز تخلف آن را ادامه دهید.")}</p>
                                <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="danger" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'remove_message')}>{t("بله، حذف پیام")}</Button><Button size="sm" variant="ghost" disabled={busyId !== null} onClick={() => setConfirmRemovalId(null)}>{t("انصراف")}</Button></div>
                            </div>}
                        </>}
                    </div>
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={(next) => { setConfirmRemovalId(null); setParams(next > 1 ? { page: String(next) } : {}); }} disabled={loading || busyId !== null} />
        </>}
    </section>;
}

export function AdminArtworkCommentReportsPage() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [notes, setNotes] = useState({});
    const [confirmRemovalId, setConfirmRemovalId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [message, setMessage] = useState('');
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'artwork-comment-reports', user?.id, page];

    const reportsQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/artwork-comment-reports', { params: { page }, signal });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const reviewMutation = useMutation({
        mutationKey: ['admin', 'artwork-comment-reports', 'review', user?.id],
        mutationFn: ({ report, action, note }) => axios.patch(api + '/artwork-comment-reports/' + report.id, { action, note }),
    });

    const result = reportsQuery.data;
    const busyId = reviewMutation.isPending ? reviewMutation.variables?.report?.id ?? null : null;
    const loading = reportsQuery.isPending;
    const load = () => { setActionError(''); return reportsQuery.refetch(); };
    const error = actionError || (reportsQuery.isError
        ? (reportsQuery.error.response?.status === 403 ? t("دسترسی به گزارش‌های دیدگاه مجاز نیست.") : t("دریافت گزارش‌ها انجام نشد."))
        : '');

    const review = async (report, action) => {
        if (action === 'remove_comment' && confirmRemovalId !== report.id) {
            setConfirmRemovalId(report.id);
            return;
        }

        setActionError('');
        setMessage('');
        try {
            const { data } = await reviewMutation.mutateAsync({
                report,
                action,
                note: (notes[report.id] ?? '').trim() || null,
            });
            setMessage(data.message ?? t("تصمیم ثبت شد."));
            setConfirmRemovalId(null);
            setNotes((current) => {
                const next = { ...current };
                delete next[report.id];
                return next;
            });
            await queryClient.invalidateQueries({ queryKey: ['admin', 'artwork-comment-reports', user?.id] });
        } catch (e) {
            setActionError(e.response?.data?.message ?? t("ثبت تصمیم انجام نشد."));
        }
    };

    return <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
        <PageHeader bleed={false}
            eyebrow={t("اعتماد و ایمنی محتوا")}
            title={t("گزارش دیدگاه‌های آثار")}
            description={t("گزارش‌ها را با توجه به متن دیدگاه و زمینه اثر بررسی کنید. حذف دیدگاه پس از تأیید نهایی انجام می‌شود و سابقه رسیدگی ثبت خواهد شد.")}
            actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>{t("به‌روزرسانی")}</Button>}
        />
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-border bg-paper p-4">
                <p className="text-xs text-muted">{t("گزارش‌های این صفحه")}</p>
                <p className="mt-2 text-2xl font-black tabular-nums">{result?.data?.length?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</p>
            </div>
            <div className="border border-border bg-paper p-4">
                <p className="text-xs text-muted">{t("کل گزارش‌ها")}</p>
                <p className="mt-2 text-2xl font-black tabular-nums">{result?.total?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</p>
            </div>
        </div>
        {message && <SuccessState title={message} />}
        {error && <ErrorState title={t("عملیات انجام نشد")} description={error} onRetry={load} />}
        {loading ? <MessageReportsSkeleton count={3} /> : !result?.data?.length ? (
            <EmptyState title={t("گزارشی برای نمایش وجود ندارد")} description={t("گزارش دیدگاه‌های آثار پس از ثبت در این بخش نمایش داده می‌شوند.")} />
        ) : <>
            <div className="space-y-4">
                {result.data.map((report) => {
                    const isOpen = report.status === 'open';
                    const confirmingRemoval = confirmRemovalId === report.id;
                    return <article key={report.id} className="overflow-hidden border-t border-border bg-transparent pt-1">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border py-5">
                            <div>
                                <p className="text-xs font-bold text-terracotta-strong" >{t('گزارش شماره')} {report.id}</p>
                                <h2 className="mt-1 font-black">{report.reason}</h2>
                                <p className="mt-2 text-xs text-muted">گزارش‌دهنده: {report.reporter?.name ?? t("کاربر")} · {dateLabel(report.created_at, locale)}</p>
                            </div>
                            <Badge variant={isOpen ? 'warning' : report.status === 'dismissed' ? 'neutral' : 'success'}>
                                {isOpen ? t("در انتظار بررسی") : report.status === 'dismissed' ? t("رد گزارش") : t("بررسی‌شده")}
                            </Badge>
                        </div>
                        <div className="space-y-5 py-5">
                            {report.details && <div>
                                <p className="text-xs font-bold text-muted">{t("شرح گزارش")}</p>
                                <p className="mt-2 whitespace-pre-line break-words text-sm leading-7">{report.details}</p>
                            </div>}
                            <div className="border-s-2 border-terracotta bg-surface-muted/50 p-4 sm:p-5">
                                <p className="text-[11px] font-bold text-muted">{t("دیدگاه گزارش‌شده")}</p>
                                <blockquote className="mt-2 whitespace-pre-line break-words text-sm leading-7">{report.comment?.body ?? t("متن دیدگاه حذف شده است.")}</blockquote>
                                <p className="mt-2 text-xs text-muted" >{t('نویسنده:')} {report.comment?.author ?? t("کاربر")}</p>
                                {report.comment?.artwork?.slug && <Link to={'/artworks/' + report.comment.artwork.slug + '#comment-' + report.comment.id} className="mt-2 inline-block text-xs font-bold text-terracotta-strong underline">{report.comment.artwork.title || t("مشاهده اثر")}</Link>}
                            </div>
                            {isOpen && <>
                                <FormField label={t("یادداشت رسیدگی (اختیاری)")}><TextareaField value={notes[report.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={1000} rows={2} placeholder={t("خلاصه تصمیم یا زمینه بررسی…")} /></FormField>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="primary" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'reviewed')}>{t("ثبت بررسی")}</Button>
                                    <Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => review(report, 'dismissed')}>{t("رد گزارش")}</Button>
                                    <Button size="sm" variant="danger" disabled={busyId !== null} onClick={() => review(report, 'remove_comment')}>{t("حذف دیدگاه")}</Button>
                                </div>
                                {confirmingRemoval && <div className="border border-danger/30 bg-danger-surface p-4">
                                    <p className="text-sm font-bold text-ink">{t("حذف دیدگاه را تأیید می‌کنید؟")}</p>
                                    <p className="mt-1 text-xs leading-6 text-muted">{t("متن دیدگاه برای کاربران پنهان می‌شود و اقدام در سابقه رسیدگی ثبت خواهد شد.")}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Button size="sm" variant="danger" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'remove_comment')}>{t("بله، حذف دیدگاه")}</Button>
                                        <Button size="sm" variant="ghost" disabled={busyId !== null} onClick={() => setConfirmRemovalId(null)}>{t("انصراف")}</Button>
                                    </div>
                                </div>}
                            </>}
                        </div>
                    </article>;
                })}
            </div>
            <Pagination
                currentPage={result.current_page ?? page}
                lastPage={result.last_page ?? 1}
                onPageChange={(next) => { setConfirmRemovalId(null); setParams(next > 1 ? { page: String(next) } : {}); }}
                disabled={loading || busyId !== null}
            />
        </>}
    </section>;
}

