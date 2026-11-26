import { useQuery } from '@tanstack/react-query';
import { useLanguage } from './LanguageContext';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';
import { EmptyState, ErrorState, StatusBadge, Badge, PageHeader, SectionHeader, DashboardMetricCard, DashboardMetricSkeleton, ArtistRecentWorkSkeleton, Container } from '../components/ui';
import { localizedValue } from '../utils/localizedContent';

const statusLabels = {
    pending_review: 'در انتظار بررسی', approved: 'منتشرشده', rejected: 'ردشده',
    changes_requested: 'نیازمند اصلاح',
};

function formatCount(value, locale) {
    return typeof value === 'number' ? value.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') : (value ?? '—');
}

function StatusLabel({ status }) {
    const { t } = useLanguage();
    return <StatusBadge status={status} label={t(statusLabels[status] ?? status ?? 'نامشخص')} className="shrink-0" />;
}

export default function ArtistWorkspaceOverview() {
    const { t, locale } = useLanguage();
    const { user, profile, profileLoading, profileError } = useOutletContext();
    const artworksQuery = useQuery({
        queryKey: ['artist-workspace', 'artworks', user?.id],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artist/artworks', { signal });
            return data;
        },
        enabled: !profileLoading && Boolean(profile?.slug),
        staleTime: 60_000,
    });
    const artworks = artworksQuery.data?.data ?? [];
    const counts = { artworks: artworksQuery.data?.total ?? (artworksQuery.data ? artworks.length : null) };
    const loading = artworksQuery.isPending;
    const errors = artworksQuery.isError ? [t("آمار آثار دریافت نشد.")] : [];
    const profileSteps = [
        Boolean(profile?.display_name?.trim()),
        Boolean(profile?.bio?.trim()),
        Boolean(profile?.city?.trim()),
        Boolean(profile?.website_url?.trim() || profile?.instagram_handle?.trim()),
        Boolean(profile?.slug && profile.is_public),
    ];
    const completedProfileSteps = profileSteps.filter(Boolean).length;
    const pending = artworks.filter((item) => item.status === 'pending_review').length;
    const published = artworks.filter((item) => item.status === 'approved').length;
    const profileReady = Boolean(profile?.slug && profile?.display_name?.trim());
    const progress = Math.round((completedProfileSteps / profileSteps.length) * 100);

    return (
        <div className="w-full">
            <PageHeader
                    eyebrow={t("استودیوی هنرمند")}
                    title={<>{t('خوش آمدید، ')}{user?.name}</>}
                    description={t("وضعیت آثار و ارتباط‌های خود را در یک نگاه دنبال کنید.")}
                    actions={<><Link to={profile?.slug ? '/artists/' + profile.slug : '/dashboard/artist/profile'} className="inline-flex min-h-11 items-center justify-center border border-terracotta bg-terracotta px-4 py-2 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong">{profile?.slug ? t("پیش‌نمایش پروفایل") : t("تکمیل پروفایل")}</Link><Link to="/dashboard/artist/artworks" className="inline-flex min-h-11 items-center justify-center border border-border px-4 py-2 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta">{t("مدیریت آثار")}</Link></>}
            />

            <Container width="wide" className="rd-workspace-content space-y-workspace-relaxed">
                {profileError && <ErrorState title={t("پروفایل دریافت نشد")} description={profileError} />}

                <section aria-label={t("وضعیت پروفایل هنرمند")} className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-terracotta-strong">{t("پروفایل هنری")}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-bold text-ink">{profileReady ? localizedValue(profile, 'display_name', locale) : t('پروفایل هنری شما کامل نیست')}</h2>
                            {!profileLoading && <Badge variant={profile?.is_public ? 'success' : 'neutral'}>{profile?.is_public ? t('عمومی') : t('خصوصی')}</Badge>}
                        </div>
                        <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">
                            {profileReady
                                ? (profile.is_public ? t('پروفایل شما برای بازدیدکنندگان قابل مشاهده است.') : t('برای نمایش عمومی، وضعیت و اطلاعات پروفایل را بررسی کنید.'))
                                : t('اطلاعات حرفه‌ای خود را تکمیل کنید تا مخاطبان با مسیر هنری شما آشنا شوند.')}
                        </p>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-3 sm:shrink-0">
                        {profile?.slug && <Link to={'/artists/' + profile.slug} className="inline-flex min-h-10 items-center border border-terracotta px-3 text-xs font-bold text-terracotta-strong no-underline hover:bg-accent-surface">{t("پیش‌نمایش عمومی")}</Link>}
                        <Link to="/dashboard/artist/profile" className="inline-flex min-h-10 items-center border border-border px-3 text-xs font-bold text-ink no-underline hover:border-terracotta">{t("ویرایش پروفایل")}</Link>
                    </div>
                    <div className="flex min-w-0 items-center gap-4 sm:w-64 sm:shrink-0">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-semibold text-muted">{t("تکمیل پروفایل")}</span>
                                <strong className="tabular-nums text-ink">{profileLoading ? '—' : progress.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + '٪'}</strong>
                            </div>
                            <div className="mt-2 h-1.5 bg-border" role="progressbar" aria-label={t("تکمیل فیلدهای پروفایل")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                                <div className="h-full bg-terracotta transition-all" style={{ width: progress + '%' }} />
                            </div>
                        </div>
                        <Link to="/dashboard/artist/profile" className="shrink-0 text-xs font-bold text-terracotta-strong underline underline-offset-4">{profileReady ? t('ویرایش') : t('تکمیل')}</Link>
                    </div>
                </section>

                <section aria-label={t("آمار آثار")} className="grid gap-3 sm:grid-cols-3">
                    {loading ? <DashboardMetricSkeleton count={3} /> : <>
                        <DashboardMetricCard as={Link} label={t("مجموع آثار")} value={formatCount(counts.artworks, locale)} detail={t("تمام آثار ثبت‌شده")} to="/dashboard/artist/artworks" />
                        <DashboardMetricCard as={Link} label={t("منتشرشده")} value={published.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} detail={t("قابل مشاهده در گالری")} to="/dashboard/artist/artworks" />
                        <DashboardMetricCard as={Link} label={t("در انتظار بررسی")} value={pending.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} detail={t("نیازمند تصمیم انتشار")} to="/dashboard/artist/artworks" />
                    </>}
                </section>

                {errors.length > 0 && <ErrorState title={t("بخشی از اطلاعات بارگذاری نشد")} description={errors.join(' ')} onRetry={() => artworksQuery.refetch()} />}

                <section className="grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(15rem,.65fr)]">
                    <div className="min-w-0">
                        <SectionHeader eyebrow={t("پورتفولیو")} title={t("آخرین آثار")} actions={<Link to="/dashboard/artist/artworks" className="text-xs font-bold text-terracotta-strong underline underline-offset-4">{t("همه آثار")}</Link>} />
                        {loading ? <div className="mt-4"><ArtistRecentWorkSkeleton /></div> : artworks.length === 0 ? (
                            <EmptyState className="mt-4" title={t("هنوز اثری ثبت نشده")} description={t("اولین اثر خود را ثبت کنید تا برای بررسی ارسال شود.")} action={<Link to="/dashboard/artist/artworks" className="text-sm font-bold text-terracotta-strong underline">{t("ثبت اولین اثر")}</Link>} />
                        ) : (
                            <ul className="mt-2 divide-y divide-divider-nested">
                                {artworks.slice(0, 4).map((item) => <li key={item.id} className="flex min-h-16 items-center justify-between gap-3 py-3">
                                    <div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{localizedValue(item, 'title', locale)}</p>{localizedValue(item.category, 'name', locale) && <p className="mt-1 text-xs text-muted">{localizedValue(item.category, 'name', locale)}</p>}</div>
                                    <StatusLabel status={item.status} />
                                </li>)}
                            </ul>
                        )}
                    </div>

                    <div className="min-w-0">
                        <SectionHeader eyebrow={t("حساب کاربری")} title={t("دسترسی سریع")} />
                        <div className="mt-2 grid gap-2">
                            <Link to="/dashboard/artist/messages" className="flex min-h-14 items-center justify-between border-b border-divider-nested py-3 text-sm font-semibold text-ink no-underline transition-colors hover:text-terracotta-strong">
                                <span><span className="block">{t("پیام‌های مستقیم")}</span><span className="mt-1 block text-xs font-normal text-muted">{t("گفت‌وگو با خریداران")}</span></span><span aria-hidden="true" className="rtl:rotate-180">→</span>
                            </Link>
                            <Link to="/dashboard/artist/profile" className="flex min-h-14 items-center justify-between border-b border-divider-nested py-3 text-sm font-semibold text-ink no-underline transition-colors hover:text-terracotta-strong">
                                <span><span className="block">{t("پروفایل هنرمند")}</span><span className="mt-1 block text-xs font-normal text-muted">{t("اطلاعات و معرفی هنری")}</span></span><span aria-hidden="true" className="rtl:rotate-180">→</span>
                            </Link>
                            <Link to="/dashboard/artist/settings" className="flex min-h-14 items-center justify-between border-b border-divider-nested py-3 text-sm font-semibold text-ink no-underline transition-colors hover:text-terracotta-strong">
                                <span><span className="block">{t("تنظیمات")}</span><span className="mt-1 block text-xs font-normal text-muted">{t("پوسته و اعلان‌ها")}</span></span><span aria-hidden="true" className="rtl:rotate-180">→</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </Container>
        </div>
    );
}
