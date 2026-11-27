import { useLanguage } from '../../../shared/i18n';
import { useQuery } from '@tanstack/react-query';
import axios from '../../../shared/api/httpClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/auth';
import { Badge, Button, ErrorState, Skeleton, SkeletonLines, WorkspaceHero, SectionHeader, DashboardMetricCard, DashboardMetricSkeleton, MediaImage, Container } from '../../../shared/ui';
import { localizedValue } from '../../../utils/localizedContent';
import { api, statusLabels, dateLabel } from '../model/adminUtils';

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
                    {loading ? <div aria-hidden="true" className="mt-5 grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]"><Skeleton className="aspect-artwork w-full rounded-none sm:max-w-32" /><div className="grid gap-3"><SkeletonLines lines={3} /><SkeletonLines lines={1} /></div></div> : summary.latest ? (
                        <div className="mt-5 grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                            <div className="aspect-artwork overflow-hidden bg-surface-muted p-3">
                                <MediaImage src={summary.latest.image_url} alt={t('تصویر اثر ') + localizedValue(summary.latest, 'title', locale)} className="h-full w-full" imageClassName="object-contain" loading="lazy" decoding="async" fallback={<div className="grid h-full place-items-center text-xs text-muted">{t('بدون تصویر')}</div>} />
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
