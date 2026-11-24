import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';
import { EmptyState, ErrorState, StatusBadge, Badge, WorkspaceHero, SectionHeader, DashboardMetricCard, DashboardMetricSkeleton, ArtistRecentWorkSkeleton, WorkspaceIdentitySkeleton, Container } from '../components/ui';

const statusLabels = {
    pending_review: 'در انتظار بررسی', approved: 'منتشرشده', rejected: 'ردشده',
    changes_requested: 'نیازمند اصلاح',
};



function formatCount(value) {
    return typeof value === 'number' ? value.toLocaleString('fa-IR') : (value ?? '—');
}

function StatusLabel({ status }) {
    return <StatusBadge status={status} label={statusLabels[status] ?? status ?? 'نامشخص'} className="shrink-0" />;
}

export default function ArtistWorkspaceOverview() {
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
    const errors = artworksQuery.isError ? ['آمار آثار دریافت نشد.'] : [];

    const profileSteps = [
        { label: 'نام نمایشی حرفه‌ای', done: Boolean(profile?.display_name?.trim()) },
        { label: 'معرفی هنری', done: Boolean(profile?.bio?.trim()) },
        { label: 'شهر فعالیت', done: Boolean(profile?.city?.trim()) },
        { label: 'راه ارتباطی یا وب‌سایت', done: Boolean(profile?.website_url?.trim() || profile?.instagram_handle?.trim()) },
        { label: 'نمایش عمومی پروفایل', done: Boolean(profile?.slug && profile.is_public) },
    ];
    const completedProfileSteps = profileSteps.filter((step) => step.done).length;
    const pending = artworks.filter((item) => item.status === 'pending_review').length;
    const published = artworks.filter((item) => item.status === 'approved').length;
    const profileReady = Boolean(profile?.slug && profile?.display_name?.trim());
    const progress = Math.round((completedProfileSteps / profileSteps.length) * 100);

    return (
        <div className="w-full space-y-7" dir="rtl">
            <WorkspaceHero
                eyebrow="استودیوی هنرمند"
                title={<>خوش آمدید، {user?.name}</>}
                description="وضعیت حضور هنری، آثار و ارتباط‌های خود را از این نمای کلی دنبال کنید."
                actions={<Link to="/dashboard/artist/artworks" className="inline-flex min-h-11 items-center justify-center rounded-control bg-terracotta px-4 py-2 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong">مدیریت آثار</Link>}
            />

            <Container width="wide" className="space-y-7">
                {profileError && <ErrorState title="پروفایل دریافت نشد" description={profileError} />}

                <section aria-label="خلاصه وضعیت هنرمند" className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,.65fr)]">
                    <article className="min-w-0 rounded-xl border border-border bg-paper p-5 shadow-soft sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-terracotta-strong">هویت هنری</p>
                                <h2 className="mt-2 text-xl font-extrabold text-ink">{profileReady ? profile.display_name : 'پروفایل هنری شما هنوز کامل نیست'}</h2>
                            </div>
                            {!profileLoading && <Badge variant={profile?.is_public ? 'success' : 'neutral'}>{profile?.is_public ? 'نمایش عمومی' : 'نمایش خصوصی'}</Badge>}
                        </div>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                            {profileReady
                                ? (profile.is_public ? 'پروفایل شما برای بازدیدکنندگان قابل مشاهده است. اطلاعات را به‌روز نگه دارید.' : 'پروفایل شما عمومی نیست؛ پیش از انتشار، اطلاعات و وضعیت نمایش را بررسی کنید.')
                                : 'اطلاعات حرفه‌ای و معرفی هنری خود را تکمیل کنید تا مخاطبان بتوانند با مسیر هنری شما آشنا شوند.'}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link to="/dashboard/artist/profile" className="inline-flex min-h-10 items-center justify-center rounded-control bg-ink px-4 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta">{profileReady ? 'ویرایش پروفایل' : 'تکمیل پروفایل'}</Link>
                            {profile?.slug && <Link to={'/artists/' + profile.slug} className="inline-flex min-h-10 items-center justify-center rounded-control border border-border-strong px-4 text-sm font-semibold text-ink no-underline hover:border-terracotta">{profile.is_public ? 'مشاهده پروفایل' : 'پیش‌نمایش خصوصی'}</Link>}
                        </div>
                    </article>

                    <article className="rounded-xl border border-border bg-surface-muted p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-ink">تکمیل پروفایل</h2>
                            {profileLoading ? <span className="text-xs text-muted">در حال بارگذاری…</span> : <strong className="text-2xl font-extrabold tabular-nums text-ink">{progress.toLocaleString('fa-IR')}٪</strong>}
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-border" role="progressbar" aria-label="تکمیل فیلدهای پروفایل" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                            <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: progress + '%' }} />
                        </div>
                        <p className="mt-3 text-xs leading-6 text-muted">{completedProfileSteps.toLocaleString('fa-IR')} از ۵ بخش اصلی پروفایل تکمیل شده است.</p>
                        <Link to="/dashboard/artist/profile" className="mt-4 inline-flex text-xs font-bold text-terracotta-strong underline underline-offset-4">مشاهده موارد تکمیل پروفایل</Link>
                    </article>
                </section>

                <section aria-label="آمار آثار" className="grid gap-3 sm:grid-cols-3">
                    {loading ? <DashboardMetricSkeleton count={3} /> : <>
                        <DashboardMetricCard as={Link} label="مجموع آثار" value={formatCount(counts.artworks)} detail="تمام آثار ثبت‌شده در استودیوی شما" to="/dashboard/artist/artworks" eyebrow="پورتفولیو" />
                        <DashboardMetricCard as={Link} label="منتشرشده" value={published.toLocaleString('fa-IR')} detail="آثار قابل مشاهده در گالری" to="/dashboard/artist/artworks" eyebrow="انتشار" />
                        <DashboardMetricCard as={Link} label="در انتظار بررسی" value={pending.toLocaleString('fa-IR')} detail="آثاری که هنوز تصمیم نهایی نگرفته‌اند" to="/dashboard/artist/artworks" eyebrow="نیازمند پیگیری" />
                    </>}
                </section>

                {errors.length > 0 && <ErrorState title="بخشی از اطلاعات بارگذاری نشد" description={errors.join(' ')} onRetry={() => artworksQuery.refetch()} />}

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(17rem,.8fr)]">
                    <article className="min-w-0 rounded-xl border border-border bg-paper p-5 shadow-soft sm:p-6">
                        <SectionHeader eyebrow="پورتفولیو" title="آخرین آثار" actions={<Link to="/dashboard/artist/artworks" className="text-xs font-bold text-terracotta-strong underline underline-offset-4">همه آثار</Link>} />
                        {loading ? <div className="mt-5"><ArtistRecentWorkSkeleton /></div> : artworks.length === 0 ? (
                            <EmptyState className="mt-4" title="هنوز اثری ثبت نشده" description="اولین اثر خود را ثبت کنید تا برای بررسی ارسال شود." action={<Link to="/dashboard/artist/artworks" className="text-sm font-bold text-terracotta-strong underline">ثبت اولین اثر</Link>} />
                        ) : (
                            <ul className="mt-3 divide-y divide-border">
                                {artworks.slice(0, 4).map((item) => <li key={item.id} className="flex min-h-[4.5rem] items-center justify-between gap-3 py-3">
                                    <div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{item.title}</p>{item.category?.name && <p className="mt-1 text-xs text-muted">{item.category.name}</p>}</div>
                                    <StatusLabel status={item.status} />
                                </li>)}
                            </ul>
                        )}
                    </article>

                    <div className="grid content-start gap-4">
                        <article className="rounded-xl border border-border bg-paper p-5 shadow-soft">
                            <SectionHeader eyebrow="ارتباط" title="پیام‌های مستقیم" />
                            <p className="mt-3 text-sm leading-7 text-muted">گفت‌وگوهای خود با خریداران را از صندوق پیام‌ها پیگیری کنید.</p>
                            <Link to="/dashboard/artist/messages" className="mt-4 inline-flex min-h-10 items-center text-sm font-bold text-terracotta-strong underline underline-offset-4">بازکردن صندوق پیام‌ها</Link>
                        </article>
                        <article className="rounded-xl border border-border bg-paper p-5 shadow-soft">
                            <SectionHeader eyebrow="مدیریت حساب" title="دسترسی‌های سریع" />
                            <div className="mt-3 grid gap-2">
                                <Link to="/dashboard/artist/profile" className="flex min-h-11 items-center justify-between rounded-control bg-surface-muted px-3 text-sm font-semibold text-ink no-underline hover:bg-accent-surface">پروفایل هنرمند <span aria-hidden="true">←</span></Link>
                                <Link to="/dashboard/artist/settings" className="flex min-h-11 items-center justify-between rounded-control bg-surface-muted px-3 text-sm font-semibold text-ink no-underline hover:bg-accent-surface">تنظیمات <span aria-hidden="true">←</span></Link>
                            </div>
                        </article>
                    </div>
                </section>
            </Container>
        </div>
    );
}
