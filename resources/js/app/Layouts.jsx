import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

export function PublicLayout() {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const handleLogout = async () => {
        setLogoutError('');
        try { await logout(); } catch { setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.'); }
    };

    return <div className="min-h-screen bg-background text-foreground" dir="rtl">
        <header className="border-b border-border bg-background">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
                <Link to="/" className="shrink-0 text-2xl font-black tracking-tight text-foreground no-underline" aria-label="راد آرت، صفحه اصلی">راد<span className="text-terracotta-strong">آرت</span></Link>
                <nav aria-label="ناوبری اصلی" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <NavLink to="/artworks" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>کشف آثار</NavLink>
                    <NavLink to="/artists" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>هنرمندان</NavLink>
                    <NavLink to="/collections" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>مجموعه‌های منتخب</NavLink>
                    <NavLink to="/about" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>درباره ما</NavLink>
                    <NavLink to="/help" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>راهنما</NavLink>
                </nav>
                <div className="flex items-center gap-3 text-sm"><ThemeToggle />
                    {user ? <><span className="hidden font-semibold sm:inline">{user.name}</span><span className="bg-muted px-3 py-2 text-xs font-bold text-terracotta-strong">{roleLabels[user.role] ?? user.role}</span><Link to={user.role==='admin'?'/admin':user.role==='buyer'?'/dashboard/buyer':'/dashboard/artist'} className="font-semibold text-terracotta-strong underline">فضای کاربری</Link><button type="button" onClick={handleLogout} className="border border-border px-4 py-2 font-semibold hover:border-terracotta">خروج</button></> : <><Link to="/login" className="font-semibold hover:text-terracotta-strong">ورود</Link><Link to="/register" className="bg-ink px-4 py-2.5 font-semibold text-white hover:bg-terracotta">ثبت‌نام</Link></>}
                </div>
            </div>
            {logoutError && <p role="alert" className="mx-auto max-w-7xl px-5 pb-3 text-xs text-destructive sm:px-8">{logoutError}</p>}
        </header>
        <Outlet />
        <footer className="border-t border-border bg-muted">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
                <div><Link to="/" className="text-xl font-black text-foreground">راد<span className="text-terracotta-strong">آرت</span></Link><p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.</p></div>
                <div><h2 className="text-sm font-bold">کشف</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted-foreground"><Link to="/artworks">گالری آثار</Link><Link to="/artists">هنرمندان</Link><Link to="/collections">مجموعه‌های منتخب</Link></div></div>
                <div><h2 className="text-sm font-bold">راد آرت</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted-foreground"><Link to="/about">درباره ما</Link><Link to="/help">راهنما</Link><Link to="/contact">تماس با ما</Link></div></div>
            </div>
            <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">راد آرت — گالری هنر مستقل معاصر</div>
        </footer>
    </div>;
}

function notificationDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

function NotificationBell({ user }) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [preferences, setPreferences] = useState({ in_app_messages: true, email_available: false });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const [{ data }, preferenceResponse] = await Promise.all([
                axios.get('/api/v1/notifications'),
                axios.get('/api/v1/notifications/preferences'),
            ]);
            setItems(data.data ?? []);
            setUnreadCount(data.unread_count ?? 0);
            setPreferences(preferenceResponse.data.data ?? { in_app_messages: true, email_available: false });
            setError('');
        } catch (requestError) {
            if (requestError.response?.status !== 401) setError('دریافت اعلان‌ها انجام نشد.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const poll = window.setInterval(load, 30000);
        return () => window.clearInterval(poll);
    }, [load]);

    const openNotification = async (item) => {
        if (busy) return;
        setBusy(true);
        try {
            if (!item.read_at) {
                await axios.patch('/api/v1/notifications/' + item.id + '/read');
                setItems((current) => current.map((notification) => notification.id === item.id
                    ? { ...notification, read_at: new Date().toISOString() }
                    : notification));
                setUnreadCount((current) => Math.max(0, current - 1));
            }
            setOpen(false);
            const inbox = user.role === 'artist' ? '/dashboard/artist/messages' : '/dashboard/buyer/messages';
            navigate(inbox + '?conversation=' + encodeURIComponent(item.conversation_id));
        } catch {
            setError('بازکردن اعلان انجام نشد. دوباره تلاش کنید.');
        } finally {
            setBusy(false);
        }
    };

    const markAllRead = async () => {
        if (busy || unreadCount === 0) return;
        setBusy(true);
        try {
            await axios.patch('/api/v1/notifications/read-all');
            setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
            setUnreadCount(0);
        } catch {
            setError('به‌روزرسانی اعلان‌ها انجام نشد.');
        } finally {
            setBusy(false);
        }
    };

    const updatePreference = async (enabled) => {
        const previous = preferences.in_app_messages;
        setPreferences((current) => ({ ...current, in_app_messages: enabled }));
        setBusy(true);
        try {
            const { data } = await axios.patch('/api/v1/notifications/preferences', { in_app_messages: enabled });
            setPreferences(data.data);
        } catch {
            setPreferences((current) => ({ ...current, in_app_messages: previous }));
            setError('ذخیره تنظیمات اعلان انجام نشد.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="relative">
            <button type="button" aria-label="اعلان‌ها" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative inline-flex min-h-10 items-center gap-2 border border-border px-3 py-2 font-semibold hover:border-terracotta">
                <Bell aria-hidden="true" size={16} strokeWidth={1.8} /><span className="hidden sm:inline">اعلان‌ها</span>
                {unreadCount > 0 && <span className="min-w-5 rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] text-white" aria-live="polite">{unreadCount > 99 ? '۹۹+' : unreadCount.toLocaleString('fa-IR')}</span>}
            </button>
            {open && <section role="dialog" aria-label="اعلان‌های پیام" className="absolute left-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] border border-border bg-card p-4 text-right shadow-xl">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-bold">اعلان‌های پیام</h2>
                    <button type="button" onClick={markAllRead} disabled={busy || unreadCount === 0} className="text-xs font-semibold text-terracotta-strong disabled:opacity-40">خواندن همه</button>
                </div>
                {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
                {loading ? <p className="py-5 text-sm text-muted-foreground">در حال دریافت…</p> : items.length === 0 ? <p className="py-5 text-sm text-muted-foreground">هنوز اعلانی ندارید.</p> : <ul className="mt-3 max-h-72 divide-y divide-border overflow-y-auto">
                    {items.map((item) => <li key={item.id}>
                        <button type="button" disabled={busy} onClick={() => openNotification(item)} className="w-full py-3 text-right hover:bg-muted disabled:opacity-50">
                            <span className="flex items-start gap-2"><span aria-hidden="true" className={item.read_at ? 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border' : 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terracotta'} />
                                <span className="min-w-0"><strong className="block text-sm">{item.sender_name} پیام جدیدی فرستاد</strong><span className="mt-1 block text-[11px] text-muted-foreground">{notificationDate(item.created_at)}</span></span>
                            </span>
                        </button>
                    </li>)}
                </ul>}
                <div className="mt-3 border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(preferences.in_app_messages)} disabled={busy} onChange={(event) => updatePreference(event.target.checked)} /><span>اعلان پیام‌های جدید در این بخش</span></label>
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">اعلان ایمیلی تا تأیید صف ارسال و تنظیمات میزبان غیرفعال است.</p>
                </div>
            </section>}
        </div>
    );
}

export function WorkspaceLayout({ title, links, outletContext }) {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const handleLogout = async () => { setLogoutError(''); try { await logout(); } catch { setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.'); } };
    return <div className="min-h-screen bg-background text-foreground" dir="rtl">
        <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10"><div><Link to="/" className="text-lg font-black text-foreground no-underline">راد<span className="text-terracotta-strong">آرت</span></Link><p className="mt-1 text-xs text-muted-foreground">{title}</p></div><div className="flex items-center gap-3 text-sm"><ThemeToggle />{user?.role !== 'admin' && <NotificationBell user={user} />}<span className="font-semibold">{user?.name}</span><Link to="/" className="border border-border px-4 py-2 font-semibold hover:border-terracotta">مشاهده سایت</Link><button type="button" onClick={handleLogout} className="border border-border px-4 py-2 font-semibold hover:border-terracotta">خروج</button></div></div>{logoutError&&<p role="alert" className="mx-auto max-w-7xl px-5 pb-3 text-xs text-destructive sm:px-8">{logoutError}</p>}</header>
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[220px_1fr] lg:px-10"><aside className="h-fit border border-border bg-card p-3"><nav aria-label="ناوبری فضای کاربری" className="flex flex-wrap gap-2 lg:flex-col">{links.map(item=><NavLink key={item.to} to={item.to} end={item.end} className={({isActive})=>isActive?'bg-ink px-4 py-3 text-sm font-bold text-white':'px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground'}>{item.label}</NavLink>)}</nav></aside><main className="min-w-0"><Outlet context={outletContext} /></main></div>
    </div>;
}
