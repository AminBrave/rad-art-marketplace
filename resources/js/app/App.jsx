import { createElement, useEffect, useState } from 'react';
import axios from 'axios';
import ArtworkGallery from './ArtworkGallery';
import AdminArtworkModeration from './AdminArtworkModeration';
import ArtworkStudio from './ArtworkStudio';
import ContactArtistForm from './ContactArtistForm';
import InquiryCenter from './InquiryCenter';

const highlights = [
    { number: '01', title: 'هنر اصیل', description: 'آثار منتخب هنرمندان مستقل را کشف کنید.' },
    { number: '02', title: 'هنرمندان واقعی', description: 'با خالق هر اثر و مسیر هنری او آشنا شوید.' },
    { number: '03', title: 'ارتباط مستقیم', description: 'برای پرسش درباره آثار، مستقیم با هنرمند در تماس باشید.' },
];

const emptyForm = { name: '', email: '', password: '', password_confirmation: '', role: 'artist' };
const emptyProfile = { display_name: '', bio: '', city: '', website_url: '', instagram_handle: '', is_public: true };

export default function App() {
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [form, setForm] = useState(emptyForm);
    const [authErrors, setAuthErrors] = useState({});
    const [authMessage, setAuthMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [adminUsers, setAdminUsers] = useState([]);
    const [profile, setProfile] = useState(emptyProfile);
    const [profileErrors, setProfileErrors] = useState({});
    const [profileMessage, setProfileMessage] = useState('');
    const [profileBusy, setProfileBusy] = useState(false);
    const [publicProfile, setPublicProfile] = useState(null);
    const [publicProfileLoading, setPublicProfileLoading] = useState(window.location.pathname.startsWith('/artists/'));

    useEffect(() => {
        axios.get('/api/v1/auth/me')
            .then(({ data }) => setUser(data.data))
            .catch(() => setUser(null));
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') {
            axios.get('/api/v1/admin/users')
                .then(({ data }) => setAdminUsers(data.data))
                .catch(() => setAdminUsers([]));
        }
    }, [user?.role]);

    useEffect(() => {
        if (!user || user.role === 'buyer') {
            setProfile(emptyProfile);
            return;
        }

        axios.get('/api/v1/artist-profile/me')
            .then(({ data }) => setProfile(data.data ?? { ...emptyProfile, display_name: user.name }))
            .catch(() => setProfile({ ...emptyProfile, display_name: user.name }));
    }, [user]);

    useEffect(() => {
        const match = window.location.pathname.match(new RegExp('^/artists/([^/]+)$'));

        if (!match) {
            return;
        }

        axios.get(`/api/v1/artists/${encodeURIComponent(match[1])}`)
            .then(({ data }) => setPublicProfile(data.data))
            .catch(() => setPublicProfile(null))
            .finally(() => setPublicProfileLoading(false));
    }, []);

    const updateForm = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const submitAuth = async (event) => {
        event.preventDefault();
        setBusy(true);
        setAuthErrors({});
        setAuthMessage('');

        try {
            const endpoint = authMode === 'register' ? '/api/v1/auth/register' : '/api/v1/auth/login';
            const payload = authMode === 'register'
                ? form
                : { email: form.email, password: form.password };
            const { data } = await axios.post(endpoint, payload);
            setUser(data.data);
            setForm(emptyForm);
            setAuthMessage(data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setAuthErrors(error.response.data.errors ?? { form: [error.response.data.message] });
            } else {
                setAuthErrors({ form: ['ارتباط با سرور برقرار نشد. دوباره تلاش کنید.'] });
            }
        } finally {
            setBusy(false);
        }
    };

    const logout = async () => {
        await axios.post('/api/v1/auth/logout');
        setUser(null);
        setAdminUsers([]);
        setAuthMessage('با موفقیت خارج شدید.');
    };

    const changeRole = async (targetUser, role) => {
        try {
            const { data } = await axios.patch(`/api/v1/admin/users/${targetUser.id}/role`, { role });
            setAdminUsers((current) => current.map((item) => item.id === targetUser.id ? data.data : item));
        } catch {
            setAuthMessage('به‌روزرسانی نقش کاربر انجام نشد.');
        }
    };

    const updateProfileForm = (event) => {
        const { name, value, type, checked } = event.target;
        setProfile((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        setProfileBusy(true);
        setProfileErrors({});
        setProfileMessage('');

        try {
            const { data } = await axios.put('/api/v1/artist-profile/me', profile);
            setProfile(data.data);
            setProfileMessage(data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setProfileErrors(error.response.data.errors ?? {});
                setProfileMessage('لطفاً خطاهای فرم را بررسی کنید.');
            } else {
                setProfileMessage('ذخیره پروفایل انجام نشد. دوباره تلاش کنید.');
            }
        } finally {
            setProfileBusy(false);
        }
    };

    if (window.location.pathname.startsWith('/artworks/')) {
        return createElement(ArtworkGallery, { user });
    }

    if (window.location.pathname.startsWith('/artists/')) {
        return (
            <main className="min-h-screen bg-[#f7f5f0] px-6 py-16 text-[#20201e]" dir="rtl">
                <article className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
                    <a href="/" className="text-xl font-black">راد<span className="text-[#b65c3a]">آرت</span></a>
                    {publicProfileLoading ? (
                        <p className="mt-10 text-stone-500">در حال دریافت پروفایل…</p>
                    ) : publicProfile ? (
                        <>
                            <p className="mt-10 text-sm font-bold text-[#b65c3a]">پروفایل هنرمند</p>
                            <h1 className="mt-3 text-4xl font-black">{publicProfile.display_name}</h1>
                            {publicProfile.city && <p className="mt-3 text-sm text-stone-500">{publicProfile.city}</p>}
                            {publicProfile.bio && <p className="mt-8 whitespace-pre-line leading-9 text-stone-700">{publicProfile.bio}</p>}
                            {user?.role === 'buyer' && <ContactArtistForm artistSlug={publicProfile.slug} />}
                            {!user && <a href="/#account" className="mt-8 inline-block rounded-full bg-[#20201e] px-5 py-3 text-sm font-bold text-white">برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید</a>}
                            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
                                {publicProfile.website_url && <a href={publicProfile.website_url} target="_blank" rel="noreferrer" className="text-[#b65c3a] underline">وب‌سایت</a>}
                                {publicProfile.instagram_handle && <a href={`https://instagram.com/${publicProfile.instagram_handle}`} target="_blank" rel="noreferrer" className="text-[#b65c3a] underline">اینستاگرام</a>}
                            </div>
                        </>
                    ) : (
                        <div className="mt-10">
                            <h1 className="text-2xl font-black">پروفایل در دسترس نیست</h1>
                            <p className="mt-3 leading-8 text-stone-500">این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.</p>
                        </div>
                    )}
                </article>
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#20201e]">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
                <a href="/" className="shrink-0 text-2xl font-black tracking-tight" aria-label="راد آرت، صفحه اصلی">
                    راد<span className="text-[#b65c3a]">آرت</span>
                </a>
                <nav aria-label="ناوبری اصلی" className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
                    <a className="transition hover:text-[#b65c3a]" href="#artworks">کشف آثار</a>
                    <a className="transition hover:text-[#b65c3a]" href="#artists">هنرمندان</a>
                    <a className="transition hover:text-[#b65c3a]" href="#about">درباره ما</a>
                </nav>
                {user ? (
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden font-semibold sm:inline">{user.name}</span>
                        <span className="rounded-full bg-[#eae3d8] px-3 py-2 text-xs font-bold text-[#80513d]">
                            {user.role === 'admin' ? 'مدیر' : user.role === 'buyer' ? 'خریدار' : 'هنرمند'}
                        </span>
                        <button onClick={logout} className="rounded-full border border-stone-300 px-4 py-2.5 font-semibold transition hover:border-[#b65c3a] hover:text-[#b65c3a]">
                            خروج
                        </button>
                    </div>
                ) : (
                    <a href="#account" className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold transition hover:border-[#b65c3a] hover:text-[#b65c3a]">
                        ورود / ثبت‌نام
                    </a>
                )}
            </header>

            <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:pb-32 lg:pt-20">
                <div className="max-w-2xl">
                    <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#eae3d8] px-4 py-2 text-xs font-semibold text-[#80513d]">
                        <span className="h-2 w-2 rounded-full bg-[#b65c3a]" />
                        جهان هنر، نزدیک‌تر از همیشه
                    </p>
                    <h1 className="text-5xl font-black leading-[1.35] tracking-tight sm:text-6xl lg:text-7xl">
                        هر اثر، روایت یک <span className="text-[#b65c3a]">جهان</span> است.
                    </h1>
                    <p className="mt-7 max-w-xl text-base leading-9 text-stone-600 sm:text-lg">
                        راد آرت فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط مستقیم با خالقان هر اثر است.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <a href="#artworks" className="rounded-full bg-[#20201e] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#b65c3a]">
                            به تماشای آثار
                        </a>
                        <a href="#account" className="rounded-full border border-stone-300 px-7 py-3.5 text-sm font-bold transition hover:border-[#20201e]">
                            برای هنرمندان
                        </a>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-xl" aria-label="ترکیب انتزاعی الهام‌گرفته از هنر معاصر">
                    <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-[#c9a58f]" />
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[48%_48%_12px_12px] bg-[#d9c6b2] p-6 sm:p-10">
                        <div className="absolute inset-6 rounded-[48%_48%_8px_8px] border border-white/50" />
                        <div className="absolute left-[12%] top-[15%] h-[54%] w-[54%] rounded-full bg-[#b65c3a]" />
                        <div className="absolute bottom-[12%] right-[9%] h-[58%] w-[48%] rounded-t-full bg-[#333d35]" />
                        <div className="absolute bottom-[19%] left-[18%] h-[34%] w-[38%] rotate-[-22deg] rounded-[48%_48%_8px_8px] bg-[#e9dfcf]" />
                        <div className="absolute right-[17%] top-[13%] h-20 w-20 rounded-full border-[14px] border-[#f2e8d9]" />
                        <div className="absolute bottom-7 left-8 text-xs font-semibold tracking-[0.3em] text-[#4b4038]">ART / PEOPLE / STORIES</div>
                    </div>
                    <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-stone-900/10">
                        <p className="text-xs text-stone-500">نگاهی تازه به هنر معاصر</p>
                        <p className="mt-1 text-sm font-bold">از نگاه هنرمندان مستقل</p>
                    </div>
                </div>
            </section>

            <section id="discover" className="border-y border-stone-200 bg-white/70">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-10">
                    {highlights.map((item) => (
                        <article key={item.number} className="border-r-2 border-[#d7b5a2] pr-5">
                            <span className="text-xs font-bold tracking-widest text-[#b65c3a]">{item.number}</span>
                            <h2 className="mt-4 text-xl font-extrabold">{item.title}</h2>
                            <p className="mt-3 leading-8 text-stone-600">{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {createElement(ArtworkGallery)}

            <section id="account" className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
                <div>
                    <p className="text-sm font-bold text-[#b65c3a]">حساب کاربری راد آرت</p>
                    <h2 className="mt-3 text-3xl font-black leading-relaxed sm:text-4xl">به جامعه راد آرت بپیوندید.</h2>
                    <p className="mt-4 leading-8 text-stone-600">به‌عنوان خریدار با هنرمندان ارتباط بگیرید یا به‌عنوان هنرمند پروفایل و آثار خود را مدیریت کنید.</p>
                    {user && (
                        <div className="mt-6 rounded-2xl border border-[#d7b5a2] bg-white p-5">
                            <p className="font-bold">خوش آمدید، {user.name}</p>
                            <p className="mt-2 text-sm text-stone-500">{user.email}</p>
                            <p className="mt-3 text-sm text-[#80513d]">{user.role === 'admin' ? 'دسترسی مدیریت فعال است.' : user.role === 'buyer' ? 'می‌توانید به هنرمندان پیام خصوصی ارسال کنید.' : 'حساب هنرمندی شما فعال است.'}</p>
                        </div>
                    )}
                </div>

                {!user ? (
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
                        <div className="flex gap-5 border-b border-stone-100 pb-4">
                            <button onClick={() => { setAuthMode('login'); setAuthErrors({}); }} className={authMode === 'login' ? 'font-extrabold text-[#b65c3a]' : 'text-stone-500'}>
                                ورود
                            </button>
                            <button onClick={() => { setAuthMode('register'); setAuthErrors({}); }} className={authMode === 'register' ? 'font-extrabold text-[#b65c3a]' : 'text-stone-500'}>
                                ثبت‌نام
                            </button>
                        </div>
                        <form onSubmit={submitAuth} className="mt-6 space-y-4">
                            {authMode === 'register' && (
                                <label className="block text-sm font-semibold">
                                    نوع حساب
                                    <select name="role" value={form.role} onChange={updateForm} className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3">
                                        <option value="buyer">خریدار</option>
                                        <option value="artist">هنرمند</option>
                                    </select>
                                </label>
                            )}
                            {authMode === 'register' && (
                                <label className="block text-sm font-semibold">
                                    نام و نام خانوادگی
                                    <input name="name" value={form.name} onChange={updateForm} required maxLength="120" autoComplete="name" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 outline-none focus:border-[#b65c3a]" />
                                    {authErrors.name?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                                </label>
                            )}
                            <label className="block text-sm font-semibold">
                                ایمیل
                                <input type="email" name="email" value={form.email} onChange={updateForm} required autoComplete="email" dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-left outline-none focus:border-[#b65c3a]" />
                                {authErrors.email?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                            </label>
                            <label className="block text-sm font-semibold">
                                گذرواژه
                                <input type="password" name="password" value={form.password} onChange={updateForm} required minLength="10" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-left outline-none focus:border-[#b65c3a]" />
                                {authErrors.password?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                            </label>
                            {authMode === 'register' && (
                                <label className="block text-sm font-semibold">
                                    تکرار گذرواژه
                                    <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={updateForm} required minLength="10" autoComplete="new-password" dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-left outline-none focus:border-[#b65c3a]" />
                                </label>
                            )}
                            {authErrors.form?.map((message) => <p key={message} role="alert" className="text-sm text-red-700">{message}</p>)}
                            <button disabled={busy} className="w-full rounded-xl bg-[#20201e] px-6 py-3.5 font-bold text-white transition hover:bg-[#b65c3a] disabled:cursor-wait disabled:opacity-60">
                                {busy ? 'لطفاً صبر کنید…' : authMode === 'register' ? (form.role === 'buyer' ? 'ایجاد حساب خریدار' : 'ایجاد حساب هنرمند') : 'ورود به حساب'}
                            </button>
                        </form>
                        {authMessage && <p role="status" className="mt-4 text-sm text-[#80513d]">{authMessage}</p>}
                        <p className="mt-5 text-xs leading-6 text-stone-400">با ثبت‌نام می‌توانید نقش خریدار یا هنرمند را انتخاب کنید. ایجاد حساب مدیر فقط از طریق دستور مدیریتی سرور امکان‌پذیر است.</p>
                    </div>
                ) : user.role === 'buyer' ? (
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                        <h3 className="text-xl font-extrabold">حساب خریدار</h3>
                        <p className="mt-3 text-sm leading-7 text-stone-500">برای ارتباط با هنرمندان، صفحه اثر یا پروفایل عمومی آن‌ها را باز کنید. پیام‌های ارسالی شما در همین صفحه قابل پیگیری هستند.</p>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6">
                            <h3 className="text-xl font-extrabold">پروفایل هنرمند</h3>
                            <p className="mt-2 text-sm leading-7 text-stone-500">اطلاعات معرفی خود را تکمیل کنید. ایمیل و نقش حساب از بخش پروفایل قابل تغییر نیستند.</p>
                        </div>
                        <form onSubmit={saveProfile} className="space-y-4">
                            <label className="block text-sm font-semibold">
                                نام نمایشی
                                <input name="display_name" value={profile.display_name} onChange={updateProfileForm} required maxLength="120" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 outline-none focus:border-[#b65c3a]" />
                                {profileErrors.display_name?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                            </label>
                            <label className="block text-sm font-semibold">
                                درباره هنرمند
                                <textarea name="bio" value={profile.bio ?? ''} onChange={updateProfileForm} rows="4" maxLength="2000" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 leading-7 outline-none focus:border-[#b65c3a]" placeholder="درباره مسیر هنری و زمینه فعالیت خود بنویسید…" />
                                {profileErrors.bio?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block text-sm font-semibold">
                                    شهر
                                    <input name="city" value={profile.city ?? ''} onChange={updateProfileForm} maxLength="120" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 outline-none focus:border-[#b65c3a]" />
                                    {profileErrors.city?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                                </label>
                                <label className="block text-sm font-semibold">
                                    شناسه اینستاگرام
                                    <input name="instagram_handle" value={profile.instagram_handle ?? ''} onChange={updateProfileForm} maxLength="30" dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-left outline-none focus:border-[#b65c3a]" placeholder="your.handle" />
                                    {profileErrors.instagram_handle?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                                </label>
                            </div>
                            <label className="block text-sm font-semibold">
                                وب‌سایت
                                <input name="website_url" type="url" value={profile.website_url ?? ''} onChange={updateProfileForm} dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-left outline-none focus:border-[#b65c3a]" placeholder="https://example.com" />
                                {profileErrors.website_url?.map((message) => <span key={message} className="mt-1 block text-xs text-red-700">{message}</span>)}
                            </label>
                            <label className="flex items-center gap-3 text-sm font-semibold">
                                <input type="checkbox" name="is_public" checked={Boolean(profile.is_public)} onChange={updateProfileForm} className="h-4 w-4 accent-[#b65c3a]" />
                                نمایش عمومی پروفایل
                            </label>
                            <button disabled={profileBusy} className="w-full rounded-xl bg-[#20201e] px-6 py-3.5 font-bold text-white transition hover:bg-[#b65c3a] disabled:cursor-wait disabled:opacity-60">
                                {profileBusy ? 'در حال ذخیره…' : 'ذخیره پروفایل'}
                            </button>
                        </form>
                        {profileMessage && <p role="status" className="mt-4 text-sm text-[#80513d]">{profileMessage}</p>}
                        {profile.slug && profile.is_public && (
                            <a href={`/artists/${profile.slug}`} className="mt-4 inline-block text-sm font-semibold text-[#b65c3a] underline">
                                مشاهده پروفایل عمومی
                            </a>
                        )}
                    </div>
                )}
            </section>

            {createElement(ArtworkStudio, { user, hasProfile: Boolean(profile.slug) })}
            {createElement(InquiryCenter, { user })}

            {user?.role === 'admin' && (
                <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
                        <h2 className="text-2xl font-black">مدیریت کاربران</h2>
                        <p className="mt-2 text-sm text-stone-500">تغییر نقش کاربران؛ این عملیات فقط از سمت سرور برای مدیر مجاز است.</p>
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[560px] text-right text-sm">
                                <thead><tr className="border-b border-stone-200 text-stone-500"><th className="py-3">نام</th><th>ایمیل</th><th>نقش</th><th>عملیات</th></tr></thead>
                                <tbody>
                                    {adminUsers.map((item) => (
                                        <tr key={item.id} className="border-b border-stone-100">
                                            <td className="py-4 font-semibold">{item.name}</td>
                                            <td dir="ltr" className="text-left">{item.email}</td>
                                            <td>{item.role === 'admin' ? 'مدیر' : item.role === 'buyer' ? 'خریدار' : 'هنرمند'}</td>
                                            <td>
                                                {item.id !== user.id && (
                                                    <button onClick={() => changeRole(item, item.role === 'admin' ? 'artist' : 'admin')} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold hover:border-[#b65c3a]">
                                                        {item.role === 'admin' ? 'تبدیل به هنرمند' : 'ارتقا به مدیر'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {user?.role === 'admin' && createElement(AdminArtworkModeration)}

            <section id="artists" className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-16 lg:px-10">
                <p className="text-sm font-bold text-[#b65c3a]">برای جامعه هنری</p>
                <h2 className="max-w-2xl text-3xl font-black leading-relaxed sm:text-4xl">هنرمند هستید؟ جای شما در راد آرت خالی است.</h2>
                <p className="max-w-2xl leading-8 text-stone-600">پروفایل هنرمندی خود را تکمیل کنید تا در مرحله بعد آثار هنری‌تان را در راد آرت منتشر کنید.</p>
            </section>

            <footer id="about" className="bg-[#20201e] px-6 py-8 text-center text-sm text-stone-300">
                <p>© {new Date().getFullYear()} راد آرت — بستری برای دیدن و دیده‌شدن هنر</p>
            </footer>
        </main>
    );
}
