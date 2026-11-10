import { lazy, Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { WorkspaceLayout } from './Layouts';
import { ArtworkDetailSkeleton, ArtistProfileSkeleton } from '../components/ui';
const ArtworkStudio = lazy(() => import('./ArtworkStudio'));
const InquiryCenter = lazy(() => import('./InquiryCenter'));

const emptyProfile = { display_name: '', bio: '', city: '', website_url: '', instagram_handle: '', is_public: true };

function LoadingBlock({ className = '' }) {
    return <span aria-hidden="true" className={`app-skeleton block ${className}`} />;
}

export function RouteLoading({ label = 'در حال آماده‌سازی صفحه…' }) {
    const { pathname } = useLocation();
    const isWorkspace = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/admin');
    const isArtworkDetail = /^\/artworks\/[^/]+/.test(pathname);
    const isArtistProfile = /^\/artists\/[^/]+/.test(pathname);
    const isForm = /\/(login|register)$/.test(pathname) || (isWorkspace && /\/(profile|artworks)$/.test(pathname));

    if (isArtworkDetail) return <ArtworkDetailSkeleton />;
    if (isArtistProfile) return <ArtistProfileSkeleton />;

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-10 sm:px-8 lg:px-10" dir="rtl" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
            <span className="sr-only">{label}</span>
            <div className="mb-8 flex items-center justify-between gap-5 border-b border-border pb-6">
                <div className="grid min-w-0 flex-1 gap-3">
                    <LoadingBlock className="h-3 w-24" />
                    <LoadingBlock className="h-9 w-2/3 max-w-sm" />
                    <LoadingBlock className="h-4 w-full max-w-xl" />
                </div>
                {isWorkspace && <LoadingBlock className="h-10 w-28 shrink-0" />}
            </div>
            {pathname === '/' ? (
                <section className="grid items-center gap-8 lg:grid-cols-2">
                    <div className="grid gap-4">
                        <LoadingBlock className="h-3 w-28" />
                        <LoadingBlock className="h-12 w-11/12" />
                        <LoadingBlock className="h-12 w-3/4" />
                        <LoadingBlock className="mt-3 h-4 w-full max-w-xl" />
                        <LoadingBlock className="h-4 w-4/5" />
                        <LoadingBlock className="mt-4 h-12 w-36" />
                    </div>
                    <LoadingBlock className="aspect-[4/5] w-full max-w-xl justify-self-center" />
                </section>
            ) : isArtworkDetail ? (
                <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
                    <LoadingBlock className="aspect-[4/3] w-full lg:aspect-[4/5]" />
                    <div className="grid content-start gap-5 border border-border bg-paper p-6 sm:p-9">
                        <LoadingBlock className="h-4 w-24" />
                        <LoadingBlock className="h-10 w-4/5" />
                        <LoadingBlock className="h-4 w-2/5" />
                        <LoadingBlock className="mt-5 h-28 w-full" />
                        <LoadingBlock className="mt-3 h-20 w-full" />
                    </div>
                </div>
            ) : isArtistProfile ? (
                <>
                    <section className="grid gap-4 border border-border bg-paper p-7 sm:p-12">
                        <LoadingBlock className="h-3 w-28" />
                        <LoadingBlock className="h-10 w-2/3 max-w-md" />
                        <LoadingBlock className="h-4 w-28" />
                        <LoadingBlock className="mt-3 h-20 w-full max-w-3xl" />
                    </section>
                    <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="border border-border bg-paper"><LoadingBlock className="aspect-[4/3] w-full" /><div className="grid gap-3 p-4"><LoadingBlock className="h-4 w-4/5" /><LoadingBlock className="h-3 w-2/5" /></div></div>)}
                    </section>
                </>
            ) : isForm ? (
                <>
                    <section className="grid gap-5 border border-border bg-paper p-6 sm:p-8">
                        <LoadingBlock className="h-6 w-40" />
                        <LoadingBlock className="h-12 w-full" />
                        <LoadingBlock className="h-12 w-full" />
                        <LoadingBlock className="h-12 w-full" />
                        <LoadingBlock className="h-28 w-full" />
                        <LoadingBlock className="h-12 w-36" />
                    </section>
                    {pathname.endsWith('/artworks') && <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="border border-border bg-paper"><LoadingBlock className="aspect-[4/3] w-full" /><div className="grid gap-3 p-4"><LoadingBlock className="h-4 w-4/5" /><LoadingBlock className="h-3 w-2/5" /></div></div>)}</section>}
                </>
            ) : pathname === '/admin' ? (
                <>
                    <section className="grid gap-3 sm:grid-cols-2">
                        <LoadingBlock className="h-36 w-full" />
                        <LoadingBlock className="h-36 w-full" />
                    </section>
                    <section className="mt-7 border border-border bg-paper p-5">
                        <LoadingBlock className="h-5 w-48" />
                        <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5"><div className="grid flex-1 gap-3"><LoadingBlock className="h-5 w-2/3" /><LoadingBlock className="h-3 w-1/3" /></div><LoadingBlock className="h-8 w-24" /></div>
                    </section>
                </>
            ) : /^\/admin\/(users|artworks)$/.test(pathname) ? (
                <section className="overflow-hidden border border-border bg-paper">
                    <div className="flex justify-between gap-4 border-b border-border p-5"><LoadingBlock className="h-6 w-40" /><LoadingBlock className="h-9 w-28" /></div>
                    <div className="grid gap-4 p-5">
                        {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="grid gap-3 border-b border-border pb-4 sm:grid-cols-3"><LoadingBlock className="h-5 w-4/5" /><LoadingBlock className="h-5 w-3/4" /><LoadingBlock className="h-9 w-28" /></div>)}
                    </div>
                </section>
            ) : pathname === '/dashboard/buyer' ? (
                <>
                    <section className="grid gap-4 sm:grid-cols-2"><LoadingBlock className="h-32 w-full" /><LoadingBlock className="h-32 w-full" /></section>
                    <section className="mt-6 border border-border bg-paper p-5"><LoadingBlock className="h-5 w-48" /><LoadingBlock className="mt-5 h-16 w-full" /><LoadingBlock className="mt-4 h-4 w-28" /></section>
                </>
            ) : pathname === '/dashboard/buyer/inquiries' ? (
                <section className="overflow-hidden border border-border bg-paper">
                    {[0, 1, 2, 3, 4].map((item) => <div key={item} className="grid gap-3 border-b border-border p-5"><LoadingBlock className="h-5 w-2/3" /><LoadingBlock className="h-4 w-1/3" /><LoadingBlock className="h-3 w-1/4" /></div>)}
                </section>
            ) : pathname === '/dashboard/artist/inquiries' ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.5fr)]">
                    <section className="border border-border bg-paper p-4">{[0, 1, 2, 3, 4].map((item) => <div key={item} className="grid gap-2 border-b border-border p-3"><LoadingBlock className="h-4 w-4/5" /><LoadingBlock className="h-3 w-1/2" /></div>)}</section>
                    <section className="border border-border bg-paper p-6"><LoadingBlock className="h-6 w-2/3" /><LoadingBlock className="mt-6 h-4 w-1/3" /><LoadingBlock className="mt-8 h-32 w-full" /></section>
                </div>
            ) : pathname === '/dashboard/artist' ? (
                <>
                    <section className="border border-border bg-paper p-6"><LoadingBlock className="h-5 w-40" /><LoadingBlock className="mt-4 h-8 w-2/3" /><LoadingBlock className="mt-4 h-4 w-full" /><LoadingBlock className="mt-3 h-4 w-3/4" /></section>
                    <section className="mt-6 grid gap-3 sm:grid-cols-2"><LoadingBlock className="h-24 w-full" /><LoadingBlock className="h-24 w-full" /></section>
                </>
            ) : /^\/(about|help|contact)$/.test(pathname) ? (
                <section className="grid gap-6">
                    {[0, 1, 2].map((item) => <div key={item} className="grid gap-3 border-b border-border pb-6"><LoadingBlock className="h-6 w-48" /><LoadingBlock className="h-4 w-full" /><LoadingBlock className="h-4 w-5/6" /></div>)}
                </section>
            ) : (
                <>
                    {isWorkspace && <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <LoadingBlock key={item} className="h-28 w-full" />)}</div>}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="overflow-hidden border border-border bg-paper">
                                <LoadingBlock className="aspect-[4/3] w-full" />
                                <div className="grid gap-3 p-4">
                                    <LoadingBlock className="h-3 w-20" />
                                    <LoadingBlock className="h-5 w-4/5" />
                                    <LoadingBlock className="h-4 w-2/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}

function AuthUnavailable() {
    const { authError, refreshUser } = useAuth();
    return (
        <div className="mx-auto max-w-xl px-6 py-20 text-center" dir="rtl">
            <h1 className="text-2xl font-black">ارتباط با حساب کاربری برقرار نشد</h1>
            <p className="mt-3 text-sm leading-7 text-stone-500">{authError}</p>
            <button type="button" onClick={refreshUser} className="mt-6 rounded-full bg-[#20201e] px-5 py-3 text-sm font-bold text-white">تلاش دوباره</button>
        </div>
    );
}

export function RequireAuth({ children }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <RouteLoading label="در حال بررسی نشست کاربری…" />;
    if (status === 'error') return <AuthUnavailable />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    return children ?? <Outlet />;
}

export function RequireRole({ roles, children }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <RouteLoading label="در حال بررسی سطح دسترسی…" />;
    if (status === 'error') return <AuthUnavailable />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
    return children ?? <Outlet />;
}

export function DashboardIndex() {
    const { user } = useAuth();
    const target = user?.role === 'admin' ? '/admin' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist';
    return <Navigate to={target} replace />;
}

export function ArtistWorkspaceLayout() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        axios.get('/api/v1/artist-profile/me', { signal: controller.signal })
            .then(({ data }) => { if (active) setProfile(data.data ?? emptyProfile); })
            .catch((error) => {
                if (!active || axios.isCancel(error)) return;
                setProfile(emptyProfile);
                setProfileError(error.response?.status === 403
                    ? 'حساب فعلی اجازه مدیریت این پروفایل را ندارد.'
                    : 'دریافت پروفایل هنرمند انجام نشد. می‌توانید دوباره تلاش کنید.');
            })
            .finally(() => { if (active) setProfileLoading(false); });
        return () => { active = false; controller.abort(); };
    }, [user?.id]);

    const links = [
        { to: '/dashboard/artist', label: 'نمای کلی', end: true },
        { to: '/dashboard/artist/profile', label: 'پروفایل هنرمند' },
        { to: '/dashboard/artist/artworks', label: 'مدیریت آثار' },
        { to: '/dashboard/artist/inquiries', label: 'صندوق پیام‌ها' },
    ];

    return <WorkspaceLayout title="فضای هنرمند" links={links} outletContext={{ user, profile, setProfile, profileLoading, profileError }} />;
}

export function ArtistDashboardHome() {
    const { user, profile, profileLoading, profileError } = useOutletContext();
    return (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" dir="rtl">
            <p className="text-sm font-bold text-[#9a452b]">فضای هنرمند</p>
            <h1 className="mt-2 text-2xl font-black">خوش آمدید، {user.name}</h1>
            <p className="mt-3 text-sm leading-7 text-stone-500">پروفایل، آثار ارسالی و درخواست‌های ارتباطی خود را از این بخش مدیریت کنید.</p>
            {profileError && <p role="alert" className="mt-5 text-sm text-amber-800">{profileError}</p>}
            {profileLoading ? <p className="mt-5 text-sm text-stone-500">در حال دریافت پروفایل…</p> : (
                <div className="mt-6 rounded-xl bg-[#f7f5f0] p-4">
                    <p className="font-semibold">{profile?.slug ? 'پروفایل هنرمند شما آماده است.' : 'برای شروع، پروفایل هنرمند خود را تکمیل کنید.'}</p>
                    <Link to="/dashboard/artist/profile" className="mt-3 inline-block text-sm font-bold text-[#9a452b] underline">مدیریت پروفایل</Link>
                </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/dashboard/artist/artworks" className="rounded-xl border border-stone-200 p-5 font-bold hover:border-[#b65c3a]">مدیریت آثار</Link>
                <Link to="/dashboard/artist/inquiries" className="rounded-xl border border-stone-200 p-5 font-bold hover:border-[#b65c3a]">صندوق پیام‌ها</Link>
            </div>
        </section>
    );
}

export function ArtistProfileSettings() {
    const { profile, setProfile, profileLoading, profileError } = useOutletContext();
    const [form, setForm] = useState(emptyProfile);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (profile) setForm({ ...emptyProfile, ...profile });
    }, [profile]);

    const update = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const save = async (event) => {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setMessage('');
        try {
            const { data } = await axios.put('/api/v1/artist-profile/me', form);
            setProfile(data.data);
            setForm({ ...emptyProfile, ...data.data });
            setMessage(data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                setMessage('لطفاً خطاهای فرم را بررسی کنید.');
            } else if (error.response?.status === 403) {
                setMessage('این عملیات از سمت سرور مجاز شناخته نشد.');
            } else {
                setMessage('ذخیره پروفایل انجام نشد. دوباره تلاش کنید.');
            }
        } finally {
            setBusy(false);
        }
    };

    if (profileLoading) return <RouteLoading label="در حال دریافت پروفایل هنرمند…" />;

    return (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" dir="rtl">
            <h1 className="text-2xl font-black">پروفایل هنرمند</h1>
            <p className="mt-2 text-sm leading-7 text-stone-500">اطلاعات معرفی و وضعیت نمایش عمومی پروفایل خود را مدیریت کنید.</p>
            {profileError && <p role="alert" className="mt-4 text-sm text-amber-800">{profileError}</p>}
            <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">نام نمایشی
                    <input name="display_name" value={form.display_name ?? ''} onChange={update} required maxLength="120" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3" />
                    {errors.display_name?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold sm:col-span-2">درباره هنرمند
                    <textarea name="bio" value={form.bio ?? ''} onChange={update} rows="4" maxLength="2000" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 leading-7" />
                    {errors.bio?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">شهر
                    <input name="city" value={form.city ?? ''} onChange={update} maxLength="120" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3" />
                    {errors.city?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">شناسه اینستاگرام
                    <input name="instagram_handle" value={form.instagram_handle ?? ''} onChange={update} maxLength="30" dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-left" />
                    {errors.instagram_handle?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold sm:col-span-2">وب‌سایت
                    <input name="website_url" type="url" value={form.website_url ?? ''} onChange={update} dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-left" placeholder="https://example.com" />
                    {errors.website_url?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2">
                    <input type="checkbox" name="is_public" checked={Boolean(form.is_public)} onChange={update} className="h-4 w-4 accent-[#b65c3a]" />
                    نمایش عمومی پروفایل
                </label>
                <div className="sm:col-span-2">
                    <button disabled={busy} className="rounded-xl bg-[#20201e] px-6 py-3 font-bold text-white disabled:opacity-60">{busy ? 'در حال ذخیره…' : 'ذخیره پروفایل'}</button>
                    {profile?.slug && <Link to={'/artists/' + profile.slug} className="mr-4 text-sm font-semibold text-[#9a452b] underline">{profile.is_public ? 'پیش‌نمایش پروفایل عمومی' : 'پیش‌نمایش خصوصی پروفایل'}</Link>}
                    {profile?.slug && !profile.is_public && <p className="mt-3 text-xs leading-6 text-stone-500 sm:col-span-2">این پیش‌نمایش فقط برای شما و مدیران مجاز قابل مشاهده است؛ بازدیدکنندگان عمومی به پروفایل خصوصی دسترسی ندارند.</p>}
                    <p className="mt-2 text-xs text-stone-500 sm:col-span-2">{(form.bio?.length ?? 0).toLocaleString('fa-IR')} از ۲۰۰۰ نویسه برای معرفی هنری استفاده شده است.</p>
                </div>
            </form>
            {message && <p role="status" className="mt-4 text-sm text-[#80513d]">{message}</p>}
        </section>
    );
}

export function ArtistArtworkPage() {
    const { user, profile, profileLoading } = useOutletContext();
    if (profileLoading) return <RouteLoading label="در حال آماده‌سازی فضای آثار…" />;
    return <Suspense fallback={<RouteLoading label="در حال آماده‌سازی فضای آثار…" />}><ArtworkStudio user={user} hasProfile={Boolean(profile?.slug)} /></Suspense>;
}

export function ArtistInquiryPage() {
    const { user, profile, profileLoading, profileError } = useOutletContext();
    if (profileLoading) return <RouteLoading label="در حال آماده‌سازی صندوق پیام‌ها…" />;
    if (!profile?.slug) {
        return (
            <section className="rounded-2xl border border-stone-200 bg-white p-6" dir="rtl">
                <h1 className="text-xl font-black">صندوق پیام‌های هنرمند</h1>
                {profileError && <p role="alert" className="mt-3 text-sm text-amber-800">{profileError}</p>}
                <p className="mt-3 text-sm leading-7 text-stone-500">برای دریافت و مدیریت درخواست‌های ارتباطی، ابتدا پروفایل هنرمند خود را تکمیل کنید.</p>
                <Link to="/dashboard/artist/profile" className="mt-4 inline-block text-sm font-bold text-[#9a452b] underline">تکمیل پروفایل</Link>
            </section>
        );
    }
    return <Suspense fallback={<RouteLoading label="در حال آماده‌سازی صندوق پیام‌ها…" />}><InquiryCenter user={user} hasProfile /></Suspense>;
}

export function BuyerWorkspaceLayout() {
    const { user } = useAuth();
    const links = [
        { to: '/dashboard/buyer', label: 'نمای کلی', end: true },
        { to: '/dashboard/buyer/inquiries', label: 'پیام‌های من' },
    ];
    return <WorkspaceLayout title="فضای خریدار" links={links} outletContext={{ user }} />;
}

export function AdminWorkspaceLayout() {
    const links = [
        { to: '/admin', label: 'نمای کلی', end: true },
        { to: '/admin/users', label: 'مدیریت کاربران' },
        { to: '/admin/artworks', label: 'بررسی آثار' },
        { to: '/admin/editorial', label: 'مجموعه‌ها و سردبیری' },
    ];
    return <WorkspaceLayout title="پنل مدیریت" links={links} />;
}

export function PublicInfoPage({ title, description }) {
    return (
        <main className="mx-auto max-w-4xl px-6 py-16 sm:px-8" dir="rtl">
            <p className="text-sm font-bold text-[#9a452b]">راد آرت</p>
            <h1 className="mt-3 text-3xl font-black">{title}</h1>
            <p className="mt-5 leading-8 text-stone-600">{description}</p>
            <p className="mt-6 rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-500">این صفحه در نقشه مسیرهای MVP 2 ثبت شده و محتوای کامل آن در مرحله محتوای عمومی تکمیل می‌شود.</p>
        </main>
    );
}

export function UnauthorizedPage() {
    const { user } = useAuth();
    return (
        <main className="mx-auto max-w-2xl px-6 py-20 text-center" dir="rtl">
            <p className="text-sm font-bold text-[#9a452b]">۴۰۳</p>
            <h1 className="mt-3 text-3xl font-black">دسترسی به این بخش مجاز نیست</h1>
            <p className="mt-4 leading-8 text-stone-500">نقش این حساب اجازه ورود به این فضای کاربری را ندارد. مجوزهای واقعی همچنان در سمت سرور بررسی می‌شوند.</p>
            <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist') : '/'} className="mt-7 inline-block rounded-full bg-[#20201e] px-6 py-3 font-bold text-white">بازگشت</Link>
        </main>
    );
}

export function NotFoundPage() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-20 text-center" dir="rtl">
            <p className="text-sm font-bold text-[#9a452b]">۴۰۴</p>
            <h1 className="mt-3 text-3xl font-black">این صفحه پیدا نشد</h1>
            <p className="mt-4 leading-8 text-stone-500">نشانی واردشده معتبر نیست یا صفحه جابه‌جا شده است.</p>
            <Link to="/" className="mt-7 inline-block rounded-full bg-[#20201e] px-6 py-3 font-bold text-white">بازگشت به صفحه اصلی</Link>
        </main>
    );
}