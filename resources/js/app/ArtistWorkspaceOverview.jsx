import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';
import { EmptyState, ErrorState, SkeletonLines } from '../components/ui';

const statusLabels = {
    pending_review: 'در انتظار بررسی', approved: 'منتشرشده', rejected: 'ردشده',
    changes_requested: 'نیازمند اصلاح',
};

const statusStyles = {
    pending_review: 'bg-amber-50 text-amber-800',
    approved: 'bg-emerald-50 text-emerald-800',
    rejected: 'bg-red-50 text-red-700',
    changes_requested: 'bg-orange-50 text-orange-800',
};

function MetricCard({ label, value, detail, to, eyebrow }) {
    return (
        <Link to={to} className="group flex min-h-36 flex-col justify-between border border-border bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-terracotta hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-muted">{label}</span>
                <span className="text-[10px] font-bold tracking-wide text-terracotta-strong">{eyebrow}</span>
            </div>
            <div className="mt-5">
                <p className="text-3xl font-black tabular-nums text-ink">{value}</p>
                <p className="mt-2 text-xs leading-6 text-muted">{detail}</p>
            </div>
        </Link>
    );
}

function formatCount(value) {
    return typeof value === 'number' ? value.toLocaleString('fa-IR') : (value ?? '—');
}

function StatusLabel({ status }) {
    return <span className={`shrink-0 px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status] ?? 'bg-surface-muted text-muted'}`}>{statusLabels[status] ?? status ?? 'نامشخص'}</span>;
}

export default function ArtistWorkspaceOverview() {
    const { user, profile, profileLoading, profileError } = useOutletContext();
    const [artworks, setArtworks] = useState([]);
    const [counts, setCounts] = useState({ artworks: null });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (profileLoading || !profile?.slug) return undefined;
        let active = true;
        setLoading(true);
        axios.get('/api/v1/artist/artworks')
            .then(({ data }) => {
                if (!active) return;
                const rows = data.data ?? [];
                setArtworks(rows);
                setCounts({ artworks: data.total ?? rows.length });
                setErrors([]);
            })
            .catch(() => {
                if (active) setErrors(['آمار آثار دریافت نشد.']);
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [profile?.slug, profileLoading]);

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
            <header className="relative overflow-hidden border border-border bg-ink px-6 py-8 text-white sm:px-9 sm:py-10">
                <div aria-hidden="true" className="absolute -left-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
                <div aria-hidden="true" className="absolute -left-7 -top-11 h-44 w-44 rounded-full border border-white/10" />
                <div className="relative flex flex-wrap items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-wide text-[#e6b19a]">استودیوی هنرمند / نمای کلی</p>
                        <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">خوش آمدید، {user?.name}</h1>
                        <p className="mt-3 text-sm leading-8 text-white/70">اینجا نقطه شروع مدیریت حضور هنری شماست؛ پروفایل را کامل کنید، آثار را برای بررسی بفرستید و ارتباط‌ها را دنبال کنید.</p>
                    </div>
                    <Link to="/dashboard/artist/artworks" className="inline-flex min-h-11 items-center justify-center bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-[#f2ded3]">ثبت یا مدیریت اثر <span aria-hidden="true" className="ms-3">←</span></Link>
                </div>
            </header>

            {profileError && <ErrorState title="پروفایل دریافت نشد" description={profileError} />}
            {profileLoading ? <div className="border border-border bg-white p-6"><SkeletonLines lines={3} /></div> : (
                <section className="grid gap-5 border border-border bg-white p-5 sm:p-7 lg:grid-cols-[1fr_15rem] lg:items-center">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xs font-bold text-terracotta-strong">هویت هنری شما</p>
                            <span className={profile?.is_public ? 'bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800' : 'bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted'}>{profile?.is_public ? 'پروفایل عمومی' : 'پروفایل خصوصی'}</span>
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
                            <span aria-hidden="true" className={step.done ? 'text-emerald-700' : 'text-muted'}>{step.done ? '✓' : '○'}</span>
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
                            <MetricCard label="مجموع آثار" value={formatCount(counts.artworks)} detail="تمام آثار ثبت‌شده در استودیوی شما" to="/dashboard/artist/artworks" eyebrow="پورتفولیو" />
                            <MetricCard label="منتشرشده" value={published.toLocaleString('fa-IR')} detail="آثاری که در گالری عمومی نمایش داده می‌شوند" to="/dashboard/artist/artworks" eyebrow="عمومی" />
                            <MetricCard label="در انتظار بررسی" value={pending.toLocaleString('fa-IR')} detail="آثاری که هنوز بررسی نهایی نشده‌اند" to="/dashboard/artist/artworks" eyebrow="بررسی" />
                            <MetricCard label="پیام‌های مستقیم" value="صندوق پیام‌ها" detail="گفت‌وگو با خریداران" to="/dashboard/artist/messages" eyebrow="ارتباط" />
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
