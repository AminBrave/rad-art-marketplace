import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';
import { EmptyState, ErrorState, SkeletonLines, StatusBadge, Badge, WorkspaceHero, DashboardMetricCard } from '../components/ui';

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
    const hasArtwork = (counts.artworks ?? 0) > 0;
    const pending = artworks.filter((item) => item.status === 'pending_review').length;
    const published = artworks.filter((item) => item.status === 'approved').length;
    const profileReady = Boolean(profile?.slug && profile?.display_name?.trim());
    const progress = Math.round((completedProfileSteps / profileSteps.length) * 100);

    return (
        <section className="space-y-8" dir="rtl">
            <WorkspaceHero
                eyebrow="استودیوی هنرمند / نمای کلی"
                title={<>خوش آمدید، {user?.name}</>}
                description="اینجا نقطه شروع مدیریت حضور هنری شماست؛ پروفایل را کامل کنید، آثار را برای بررسی بفرستید و ارتباط‌ها را دنبال کنید."
                actions={<Link to="/dashboard/artist/artworks" className="ra-workspace-hero__action ra-workspace-hero__action--primary">ثبت یا مدیریت اثر</Link>}
            />

            {profileError && <ErrorState title="پروفایل دریافت نشد" description={profileError} />}
            {profileLoading ? <div className="border border-border bg-white p-6"><SkeletonLines lines={3} /></div> : (
                <section className="grid gap-5 border border-border bg-white p-5 sm:p-7 lg:grid-cols-[1fr_15rem] lg:items-center">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xs font-bold text-terracotta-strong">هویت هنری شما</p>
                            <Badge variant={profile?.is_public ? 'success' : 'neutral'}>{profile?.is_public ? 'پروفایل عمومی' : 'پروفایل خصوصی'}</Badge>
                        </div>
                        <h2 className="mt-2 text-xl font-black text-ink">{profileReady ? profile.display_name : 'پروفایل هنری خود را بسازید'}</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{profileReady ? (profile.is_public ? 'پروفایل شما برای بازدیدکنندگان قابل مشاهده است. آن را به‌روز نگه دارید تا مخاطبان با مسیر هنری شما آشنا شوند.' : 'پروفایل شما هنوز عمومی نیست. اطلاعات را تکمیل و وضعیت نمایش آن را بررسی کنید.') : 'با معرفی خود و افزودن اطلاعات حرفه‌ای، حضور عمومی‌تان در راد آرت را شکل دهید.'}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link to="/dashboard/artist/profile" className="inline-flex min-h-11 items-center bg-ink px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-terracotta">{profileReady ? 'ویرایش پروفایل' : 'تکمیل پروفایل'}</Link>
                            {profile?.slug && <Link to={'/artists/' + profile.slug} className="inline-flex min-h-11 items-center border border-border px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-terracotta">پیش‌نمایش عمومی</Link>}
                        </div>
                    </div>
                    <div className="border-t border-border pt-5 lg:border-r lg:border-t-0 lg:pr-6 lg:pt-0">
                        <div className="flex items-end justify-between gap-3">
                            <span className="text-xs font-semibold text-muted">تکمیل پروفایل</span>
                            <span className="text-2xl font-black tabular-nums text-ink">{progress.toLocaleString('fa-IR')}٪</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden bg-surface-muted" role="progressbar" aria-label="تکمیل فیلدهای پروفایل" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                            <div className="h-full bg-terracotta transition-all" style={{ width: progress + '%' }} />
                        </div>
                        <p className="mt-3 text-xs leading-6 text-muted">{completedProfileSteps.toLocaleString('fa-IR')} از ۵ بخش تکمیل شده</p>
                    </div>
                </section>
            )}

            {!profileLoading && (
                <section aria-labelledby="artist-setup-heading" className="border border-border bg-surface-muted p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold text-terracotta-strong">چک‌لیست شروع</p>
                            <h2 id="artist-setup-heading" className="mt-2 text-lg font-black">پایه‌های حضور حرفه‌ای</h2>
                            <p className="mt-2 text-xs leading-6 text-muted">این موارد به کامل‌تر شدن پروفایل عمومی شما کمک می‌کنند؛ رتبه یا امتیاز هنری نیستند.</p>
                        </div>
                        <span className="text-xs font-bold text-muted">{(completedProfileSteps + (hasArtwork ? 1 : 0)).toLocaleString('fa-IR')} از ۶ گام</span>
                    </div>
                    <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {profileSteps.map((step) => <li key={step.label} className="flex items-center gap-3 border border-border bg-white px-4 py-3 text-sm">
                            <span aria-hidden="true" className={step.done ? 'text-success' : 'text-muted'}>{step.done ? '✓' : '○'}</span>
                            <span className={step.done ? 'text-muted line-through' : 'font-semibold text-ink'}>{step.label}</span>
                        </li>)}
                        <li className="flex items-center gap-3 border border-border bg-white px-4 py-3 text-sm">
                            <span aria-hidden="true" className={hasArtwork ? 'text-emerald-700' : 'text-muted'}>{hasArtwork ? '✓' : '○'}</span>
                            <span className={hasArtwork ? 'text-muted line-through' : 'font-semibold text-ink'}>ثبت اولین اثر برای بررسی</span>
                        </li>
                    </ol>
                </section>
            )}

            {!profileLoading && profileReady && (
                <>
                    <section aria-label="آمار فضای هنرمند" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {loading ? <><div className="border border-border bg-white p-5"><SkeletonLines lines={3} /></div><div className="border border-border bg-white p-5"><SkeletonLines lines={3} /></div><div className="border border-border bg-white p-5"><SkeletonLines lines={3} /></div><div className="border border-border bg-white p-5"><SkeletonLines lines={3} /></div></> : <>
                            <DashboardMetricCard as={Link} label="مجموع آثار" value={formatCount(counts.artworks)} detail="تمام آثار ثبت‌شده در استودیوی شما" to="/dashboard/artist/artworks" eyebrow="پورتفولیو" />
                            <DashboardMetricCard as={Link} label="منتشرشده" value={published.toLocaleString('fa-IR')} detail="آثاری که در گالری عمومی نمایش داده می‌شوند" to="/dashboard/artist/artworks" eyebrow="عمومی" />
                            <DashboardMetricCard as={Link} label="در انتظار بررسی" value={pending.toLocaleString('fa-IR')} detail="آثاری که هنوز بررسی نهایی نشده‌اند" to="/dashboard/artist/artworks" eyebrow="بررسی" />
                            <DashboardMetricCard as={Link} label="پیام‌های مستقیم" value="صندوق پیام‌ها" detail="گفت‌وگو با خریداران" to="/dashboard/artist/messages" eyebrow="ارتباط" />
                        </>}
                    </section>
                    {errors.length > 0 && <ErrorState title="بخشی از اطلاعات بارگذاری نشد" description={errors.join(' ')} />}
                    <section className="grid gap-5 xl:grid-cols-2">
                        <div className="border border-border bg-white p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                                <div><p className="text-[11px] font-bold text-terracotta-strong">پورتفولیو</p><h2 className="mt-1 font-black">آخرین آثار</h2></div>
                                <Link to="/dashboard/artist/artworks" className="text-xs font-bold text-terracotta-strong underline underline-offset-4">مدیریت همه آثار</Link>
                            </div>
                            {loading ? <div className="mt-5"><SkeletonLines lines={4} /></div> : artworks.length === 0 ? <EmptyState className="mt-5" title="هنوز اثری ثبت نشده" description="اولین اثر خود را ثبت کنید تا برای بررسی ارسال شود." action={<Link to="/dashboard/artist/artworks" className="text-sm font-bold text-terracotta-strong underline">ثبت اثر</Link>} /> : (
                                <ul className="divide-y divide-border">
                                    {artworks.slice(0, 4).map((item) => <li key={item.id} className="flex items-center justify-between gap-3 py-4">
                                        <div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{item.title}</p>{item.category?.name && <p className="mt-1 text-xs text-muted">{item.category.name}</p>}</div>
                                        <StatusLabel status={item.status} />
                                    </li>)}
                                </ul>
                            )}
                        </div>
                        <div className="border border-border bg-white p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                                <div><p className="text-[11px] font-bold text-terracotta-strong">ارتباط با خریداران</p><h2 className="mt-1 font-black">پیام‌های مستقیم</h2></div>
                                <Link to="/dashboard/artist/messages" className="text-xs font-bold text-terracotta-strong underline underline-offset-4">رفتن به پیام‌ها</Link>
                            </div>
                            <div className="py-7"><p className="text-sm leading-7 text-muted">گفت‌وگوهای مستقیم با خریداران را از صندوق پیام‌ها مدیریت کنید.</p><Link to="/dashboard/artist/messages" className="mt-3 inline-flex text-sm font-bold text-terracotta-strong underline">بازکردن صندوق پیام‌ها</Link></div>
                        </div>
                    </section>
                </>
            )}
        </section>
    );
}
