import { Button, Input, Textarea, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { createElement, useEffect, useState } from 'react';
import axios from 'axios';
import ArtworkGallery from './ArtworkGallery';
import ArtworkStudio from './ArtworkStudio';
import ContactArtistForm from './ContactArtistForm';
import InquiryCenter from './InquiryCenter';
import DesignFoundation from './DesignFoundation';

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

    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('design-system')) {
        return createElement(DesignFoundation);
    }

    if (window.location.pathname.startsWith('/artworks/')) {
        return createElement(ArtworkGallery, { user });
    }

    if (window.location.pathname.startsWith('/artists/')) {
        return (
            <main className="min-h-screen bg-background px-6 py-16 text-foreground" dir="rtl">
                <article className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-8 shadow-sm sm:p-12">
                    <a href="/" className="text-xl font-semibold">راد<span className="text-primary">آرت</span></a>
                    {publicProfileLoading ? (
                        <p className="mt-10 text-muted-foreground">در حال دریافت پروفایل…</p>
                    ) : publicProfile ? (
                        <>
                            <p className="mt-10 text-sm font-bold text-primary">پروفایل هنرمند</p>
                            <h1 className="mt-3 text-4xl font-semibold">{publicProfile.display_name}</h1>
                            {publicProfile.city && <p className="mt-3 text-sm text-muted-foreground">{publicProfile.city}</p>}
                            {publicProfile.bio && <p className="mt-8 whitespace-pre-line leading-9 text-foreground">{publicProfile.bio}</p>}
                            {user?.role === 'buyer' && createElement(ContactArtistForm, { artistSlug: publicProfile.slug })}
                            {!user && <Button asChild variant="default" size="default" className="mt-8"><a href="/#account">برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید</a></Button>}
                            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
                                {publicProfile.website_url && <a href={publicProfile.website_url} target="_blank" rel="noreferrer" className="text-primary underline">وب‌سایت</a>}
                                {publicProfile.instagram_handle && <a href={`https://instagram.com/${publicProfile.instagram_handle}`} target="_blank" rel="noreferrer" className="text-primary underline">اینستاگرام</a>}
                            </div>
                        </>
                    ) : (
                        <div className="mt-10">
                            <h1 className="text-2xl font-semibold">پروفایل در دسترس نیست</h1>
                            <p className="mt-3 leading-8 text-muted-foreground">این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.</p>
                        </div>
                    )}
                </article>
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-hidden bg-background text-foreground">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
                <a href="/" className="shrink-0 text-2xl font-semibold tracking-tight" aria-label="راد آرت، صفحه اصلی">
                    راد<span className="text-primary">آرت</span>
                </a>
                <nav aria-label="ناوبری اصلی" className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
                    <a className="transition hover:text-primary" href="#artworks">کشف آثار</a>
                    <a className="transition hover:text-primary" href="#artists">هنرمندان</a>
                    <a className="transition hover:text-primary" href="#about">درباره ما</a>
                </nav>
                {user ? (
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden font-semibold sm:inline">{user.name}</span>
                        <span className="rounded-full bg-muted px-3 py-2 text-xs font-bold text-primary">
                            {user.role === 'admin' ? 'مدیر' : user.role === 'buyer' ? 'خریدار' : 'هنرمند'}
                        </span>
                        <Button onClick={logout} variant="outline" size="default">
                            خروج
                        </Button>
                    </div>
                ) : (
                    <Button asChild variant="outline" size="default"><a href="#account">
                        ورود / ثبت‌نام
                    </a></Button>
                )}
            </header>

            <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:pb-32 lg:pt-20">
                <div className="max-w-2xl">
                    <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        جهان هنر، نزدیک‌تر از همیشه
                    </p>
                    <h1 className="text-5xl font-semibold leading-[1.35] tracking-tight sm:text-6xl lg:text-7xl">
                        هر اثر، روایت یک <span className="text-primary">جهان</span> است.
                    </h1>
                    <p className="mt-7 max-w-xl text-base leading-9 text-muted-foreground sm:text-lg">
                        راد آرت فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط مستقیم با خالقان هر اثر است.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <Button asChild variant="default" size="default"><a href="#artworks">
                            به تماشای آثار
                        </a></Button>
                        <Button asChild variant="outline" size="default"><a href="#account">
                            برای هنرمندان
                        </a></Button>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-xl" aria-label="ترکیب انتزاعی الهام‌گرفته از هنر معاصر">
                    <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-border" />
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[48%_48%_12px_12px] bg-secondary p-6 sm:p-10">
                        <div className="absolute inset-6 rounded-[48%_48%_8px_8px] border border-border" />
                        <div className="absolute left-[12%] top-[15%] h-[54%] w-[54%] rounded-full bg-primary" />
                        <div className="absolute bottom-[12%] right-[9%] h-[58%] w-[48%] rounded-t-full bg-accent" />
                        <div className="absolute bottom-[19%] left-[18%] h-[34%] w-[38%] rotate-[-22deg] rounded-[48%_48%_8px_8px] bg-muted" />
                        <div className="absolute right-[17%] top-[13%] h-20 w-20 rounded-full border-[14px] border-border" />
                        <div className="absolute bottom-7 left-8 text-xs font-semibold tracking-[0.3em] text-foreground">ART / PEOPLE / STORIES</div>
                    </div>
                    <div className="absolute -bottom-5 -left-4 rounded-lg bg-card px-5 py-4 shadow-md shadow-sm">
                        <p className="text-xs text-muted-foreground">نگاهی تازه به هنر معاصر</p>
                        <p className="mt-1 text-sm font-bold">از نگاه هنرمندان مستقل</p>
                    </div>
                </div>
            </section>

            <section id="discover" className="border-y border-border bg-card/70">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-10">
                    {highlights.map((item) => (
                        <article key={item.number} className="border-r-2 border-border pr-5">
                            <span className="text-xs font-bold tracking-widest text-primary">{item.number}</span>
                            <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
                            <p className="mt-3 leading-8 text-muted-foreground">{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {createElement(ArtworkGallery)}

            <section id="account" className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
                <div>
                    <p className="text-sm font-bold text-primary">حساب کاربری راد آرت</p>
                    <h2 className="mt-3 text-3xl font-semibold leading-relaxed sm:text-4xl">به جامعه راد آرت بپیوندید.</h2>
                    <p className="mt-4 leading-8 text-muted-foreground">به‌عنوان خریدار با هنرمندان ارتباط بگیرید یا به‌عنوان هنرمند پروفایل و آثار خود را مدیریت کنید.</p>
                    {user && (
                        <div className="mt-6 rounded-lg border border-border bg-card p-5">
                            <p className="font-bold">خوش آمدید، {user.name}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
                            <p className="mt-3 text-sm text-primary">{user.role === 'admin' ? 'دسترسی مدیریت فعال است.' : user.role === 'buyer' ? 'می‌توانید به هنرمندان پیام خصوصی ارسال کنید.' : 'حساب هنرمندی شما فعال است.'}</p>
                        </div>
                    )}
                </div>

                {!user ? (
                    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-9">
                        <div className="flex gap-5 border-b border-border pb-4">
                            <Button onClick={() => { setAuthMode('login'); setAuthErrors({}); }} variant="ghost" size="default">
                                ورود
                            </Button>
                            <Button onClick={() => { setAuthMode('register'); setAuthErrors({}); }} variant="ghost" size="default">
                                ثبت‌نام
                            </Button>
                        </div>
                        <form onSubmit={submitAuth} className="mt-6 space-y-4">
                            {authMode === 'register' && (
                                <label className="block text-sm font-semibold">
                                    نوع حساب
                                    <Select name="role" value={form.role} onChange={updateForm} className="w-full">
                                        <option value="buyer">خریدار</option>
                                        <option value="artist">هنرمند</option>
                                    </Select>
                                </label>
                            )}
                            {authMode === 'register' && (
                                <label className="block text-sm font-semibold">
                                    نام و نام خانوادگی
                                    <Input name="name" value={form.name} onChange={updateForm} required maxLength="120" autoComplete="name"  className="w-full" />
                                    {authErrors.name?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                                </label>
                            )}
                            <label className="block text-sm font-semibold">
                                ایمیل
                                <Input type="email" name="email" value={form.email} onChange={updateForm} required autoComplete="email" dir="ltr"  className="w-full" />
                                {authErrors.email?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                            </label>
                            <label className="block text-sm font-semibold">
                                گذرواژه
                                <Input type="password" name="password" value={form.password} onChange={updateForm} required minLength="10" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} dir="ltr"  className="w-full" />
                                {authErrors.password?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                            </label>
                            {authMode === 'register' && (
                                <label className="block text-sm font-semibold">
                                    تکرار گذرواژه
                                    <Input type="password" name="password_confirmation" value={form.password_confirmation} onChange={updateForm} required minLength="10" autoComplete="new-password" dir="ltr"  className="w-full" />
                                </label>
                            )}
                            {authErrors.form?.map((message) => <p key={message} role="alert" className="text-sm text-destructive">{message}</p>)}
                            <Button disabled={busy} variant="default" size="default" type="submit" className="w-full">
                                {busy ? 'لطفاً صبر کنید…' : authMode === 'register' ? (form.role === 'buyer' ? 'ایجاد حساب خریدار' : 'ایجاد حساب هنرمند') : 'ورود به حساب'}
                            </Button>
                        </form>
                        {authMessage && <p role="status" className="mt-4 text-sm text-primary">{authMessage}</p>}
                        <p className="mt-5 text-xs leading-6 text-muted-foreground">با ثبت‌نام می‌توانید نقش خریدار یا هنرمند را انتخاب کنید. ایجاد حساب مدیر فقط از طریق دستور مدیریتی سرور امکان‌پذیر است.</p>
                    </div>
                ) : user.role === 'buyer' ? (
                    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
                        <h3 className="text-xl font-semibold">حساب خریدار</h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">برای ارتباط با هنرمندان، صفحه اثر یا پروفایل عمومی آن‌ها را باز کنید. پیام‌های ارسالی شما در همین صفحه قابل پیگیری هستند.</p>
                    </div>
                ) : (
                    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold">پروفایل هنرمند</h3>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">اطلاعات معرفی خود را تکمیل کنید. ایمیل و نقش حساب از بخش پروفایل قابل تغییر نیستند.</p>
                        </div>
                        <form onSubmit={saveProfile} className="space-y-4">
                            <label className="block text-sm font-semibold">
                                نام نمایشی
                                <Input name="display_name" value={profile.display_name} onChange={updateProfileForm} required maxLength="120"  className="w-full" />
                                {profileErrors.display_name?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                            </label>
                            <label className="block text-sm font-semibold">
                                درباره هنرمند
                                <Textarea name="bio" value={profile.bio ?? ''} onChange={updateProfileForm} rows="4" maxLength="2000" placeholder="درباره مسیر هنری و زمینه فعالیت خود بنویسید…"  className="w-full"/>
                                {profileErrors.bio?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block text-sm font-semibold">
                                    شهر
                                    <Input name="city" value={profile.city ?? ''} onChange={updateProfileForm} maxLength="120"  className="w-full" />
                                    {profileErrors.city?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                                </label>
                                <label className="block text-sm font-semibold">
                                    شناسه اینستاگرام
                                    <Input name="instagram_handle" value={profile.instagram_handle ?? ''} onChange={updateProfileForm} maxLength="30" dir="ltr" placeholder="your.handle"  className="w-full" />
                                    {profileErrors.instagram_handle?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                                </label>
                            </div>
                            <label className="block text-sm font-semibold">
                                وب‌سایت
                                <Input name="website_url" type="url" value={profile.website_url ?? ''} onChange={updateProfileForm} dir="ltr" placeholder="https://example.com"  className="w-full" />
                                {profileErrors.website_url?.map((message) => <span key={message} className="mt-1 block text-xs text-destructive">{message}</span>)}
                            </label>
                            <label className="flex items-center gap-3 text-sm font-semibold">
                                <Input type="checkbox" name="is_public" checked={Boolean(profile.is_public)} onChange={updateProfileForm} />
                                نمایش عمومی پروفایل
                            </label>
                            <Button disabled={profileBusy} variant="default" size="default" type="submit" className="w-full">
                                {profileBusy ? 'در حال ذخیره…' : 'ذخیره پروفایل'}
                            </Button>
                        </form>
                        {profileMessage && <p role="status" className="mt-4 text-sm text-primary">{profileMessage}</p>}
                        {profile.slug && profile.is_public && (
                            <a href={`/artists/${profile.slug}`} className="mt-4 text-sm font-semibold text-primary underline">
                                مشاهده پروفایل عمومی
                            </a>
                        )}
                    </div>
                )}
            </section>

            {createElement(ArtworkStudio, { user, hasProfile: Boolean(profile.slug) })}
            {createElement(InquiryCenter, { user, hasProfile: Boolean(profile.slug) })}

            {user?.role === 'admin' && (
                <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
                    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
                        <h2 className="text-2xl font-semibold">مدیریت کاربران</h2>
                        <p className="mt-2 text-sm text-muted-foreground">تغییر نقش کاربران؛ این عملیات فقط از سمت سرور برای مدیر مجاز است.</p>
                        <div className="mt-6 overflow-x-auto">
                            <Table className="w-full min-w-[560px] text-right text-sm">
                                <TableHeader><TableRow className="border-b border-border text-muted-foreground"><TableHead className="py-3">نام</TableHead><TableHead>ایمیل</TableHead><TableHead>نقش</TableHead><TableHead>عملیات</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {adminUsers.map((item) => (
                                        <TableRow key={item.id} className="border-b border-border">
                                            <TableCell className="py-4 font-semibold">{item.name}</TableCell>
                                            <TableCell dir="ltr" className="text-left">{item.email}</TableCell>
                                            <TableCell>{item.role === 'admin' ? 'مدیر' : item.role === 'buyer' ? 'خریدار' : 'هنرمند'}</TableCell>
                                            <TableCell>
                                                {item.id !== user.id && (
                                                    <Button onClick={() => changeRole(item, item.role === 'admin' ? 'artist' : 'admin')} variant="outline" size="sm">
                                                        {item.role === 'admin' ? 'تبدیل به هنرمند' : 'ارتقا به مدیر'}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </section>
            )}

            <section id="artists" className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-16 lg:px-10">
                <p className="text-sm font-bold text-primary">برای جامعه هنری</p>
                <h2 className="max-w-2xl text-3xl font-semibold leading-relaxed sm:text-4xl">هنرمند هستید؟ جای شما در راد آرت خالی است.</h2>
                <p className="max-w-2xl leading-8 text-muted-foreground">پروفایل هنرمندی خود را تکمیل کنید تا در مرحله بعد آثار هنری‌تان را در راد آرت منتشر کنید.</p>
            </section>

            <footer id="about" className="bg-brand-ink px-6 py-8 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} راد آرت — بستری برای دیدن و دیده‌شدن هنر</p>
            </footer>
        </main>
    );
}
