import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { WorkspaceLayout } from './Layouts';
import ArtworkStudio from './ArtworkStudio';
import InquiryCenter from './InquiryCenter';
import AdminArtworkModeration from './AdminArtworkModeration';

const emptyProfile = { display_name: '', bio: '', city: '', website_url: '', instagram_handle: '', is_public: true };

export function RouteLoading({ label = 'در حال آماده‌سازی صفحه…' }) {
    return <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-stone-500" role="status" aria-live="polite">{label}</div>;
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
        axios.get('/api/v1/artist-profile/me')
            .then(({ data }) => { if (active) setProfile(data.data ?? emptyProfile); })
            .catch((error) => {
                if (!active) return;
                setProfile(emptyProfile);
                setProfileError(error.response?.status === 403
                    ? 'حساب فعلی اجازه مدیریت این پروفایل را ندارد.'
                    : 'دریافت پروفایل هنرمند انجام نشد. می‌توانید دوباره تلاش کنید.');
            })
            .finally(() => { if (active) setProfileLoading(false); });
        return () => { active = false; };
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
    const { user, profile, profileLoading } = useOutletContext();
    return (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" dir="rtl">
            <p className="text-sm font-bold text-[#9a452b]">فضای هنرمند</p>
            <h1 className="mt-2 text-2xl font-black">خوش آمدید، {user.name}</h1>
            <p className="mt-3 text-sm leading-7 text-stone-500">پروفایل، آثار ارسالی و درخواست‌های ارتباطی خود را از این بخش مدیریت کنید.</p>
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
                    {profile?.slug && profile.is_public && <Link to={'/artists/' + profile.slug} className="mr-4 text-sm font-semibold text-[#9a452b] underline">مشاهده پروفایل عمومی</Link>}
                </div>
            </form>
            {message && <p role="status" className="mt-4 text-sm text-[#80513d]">{message}</p>}
        </section>
    );
}

export function ArtistArtworkPage() {
    const { user, profile, profileLoading } = useOutletContext();
    if (profileLoading) return <RouteLoading label="در حال آماده‌سازی فضای آثار…" />;
    return <ArtworkStudio user={user} hasProfile={Boolean(profile?.slug)} />;
}

export function ArtistInquiryPage() {
    const { user, profile, profileLoading } = useOutletContext();
    if (profileLoading) return <RouteLoading label="در حال آماده‌سازی صندوق پیام‌ها…" />;
    return <InquiryCenter user={user} hasProfile={Boolean(profile?.slug)} />;
}

export function BuyerWorkspaceLayout() {
    const { user } = useAuth();
    const links = [
        { to: '/dashboard/buyer', label: 'نمای کلی', end: true },
        { to: '/dashboard/buyer/inquiries', label: 'پیام‌های من' },
    ];
    return <WorkspaceLayout title="فضای خریدار" links={links} outletContext={{ user }} />;
}

export function BuyerDashboardHome() {
    const { user } = useOutletContext();
    return (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" dir="rtl">
            <p className="text-sm font-bold text-[#9a452b]">فضای خریدار</p>
            <h1 className="mt-2 text-2xl font-black">خوش آمدید، {user.name}</h1>
            <p className="mt-3 text-sm leading-7 text-stone-500">پیام‌های خصوصی خود به هنرمندان را از این بخش پیگیری کنید.</p>
            <Link to="/dashboard/buyer/inquiries" className="mt-6 inline-block rounded-xl bg-[#20201e] px-5 py-3 text-sm font-bold text-white">مشاهده پیام‌های من</Link>
        </section>
    );
}

export function BuyerInquiryPage() {
    const { user } = useOutletContext();
    return <InquiryCenter user={user} hasProfile />;
}

export function AdminWorkspaceLayout() {
    const links = [
        { to: '/admin', label: 'نمای کلی', end: true },
        { to: '/admin/users', label: 'مدیریت کاربران' },
        { to: '/admin/artworks', label: 'بررسی آثار' },
    ];
    return <WorkspaceLayout title="پنل مدیریت" links={links} />;
}

export function AdminDashboardHome() {
    return (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" dir="rtl">
            <p className="text-sm font-bold text-[#9a452b]">پنل مدیریت</p>
            <h1 className="mt-2 text-2xl font-black">نمای کلی مدیریت</h1>
            <p className="mt-3 text-sm leading-7 text-stone-500">مدیریت کاربران و بررسی آثار ارسالی از این بخش در دسترس است.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/admin/users" className="rounded-xl border border-stone-200 p-5 font-bold hover:border-[#b65c3a]">مدیریت کاربران</Link>
                <Link to="/admin/artworks" className="rounded-xl border border-stone-200 p-5 font-bold hover:border-[#b65c3a]">صف بررسی آثار</Link>
            </div>
        </section>
    );
}

export function AdminUsersPage() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get('/api/v1/admin/users');
            setItems(data.data);
        } catch (requestError) {
            setError(requestError.response?.status === 403
                ? 'این حساب اجازه مشاهده کاربران را ندارد.'
                : 'دریافت فهرست کاربران انجام نشد.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const changeRole = async (item, role) => {
        setBusyId(item.id);
        setError('');
        try {
            const { data } = await axios.patch('/api/v1/admin/users/' + item.id + '/role', { role });
            setItems((current) => current.map((entry) => entry.id === item.id ? data.data : entry));
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? 'تغییر نقش کاربر انجام نشد.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm font-bold text-[#9a452b]">مدیریت</p><h1 className="mt-2 text-2xl font-black">کاربران</h1></div>
                <button type="button" onClick={load} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold">بروزرسانی</button>
            </div>
            {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
            {loading ? <RouteLoading label="در حال دریافت کاربران…" /> : items.length === 0 ? <p className="mt-6 rounded-xl bg-[#f7f5f0] p-5 text-sm text-stone-500">کاربری برای نمایش وجود ندارد.</p> : (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-right text-sm">
                        <thead><tr className="border-b border-stone-200 text-stone-500"><th className="py-3">نام</th><th>ایمیل</th><th>نقش</th><th>عملیات</th></tr></thead>
                        <tbody>{items.map((item) => (
                            <tr key={item.id} className="border-b border-stone-100">
                                <td className="py-4 font-semibold">{item.name}</td><td dir="ltr" className="text-left">{item.email}</td>
                                <td>{item.role === 'admin' ? 'مدیر' : item.role === 'buyer' ? 'خریدار' : 'هنرمند'}</td>
                                <td>{item.id !== user.id && <button type="button" disabled={busyId === item.id} onClick={() => changeRole(item, item.role === 'admin' ? 'artist' : 'admin')} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50">{item.role === 'admin' ? 'تبدیل به هنرمند' : 'ارتقا به مدیر'}</button>}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
        </section>
    );
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
