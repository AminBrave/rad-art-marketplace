import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ThemeSwitcher from '../design-system/ThemeSwitcher';
import { Badge } from '../components/ui';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

export function PublicLayout() {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const handleLogout = async () => {
        setLogoutError('');
        try { await logout(); } catch { setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.'); }
    };
    const links = [
        ['/artworks', 'کشف آثار'],
        ['/artists', 'هنرمندان'],
        ['/collections', 'مجموعه‌ها'],
        ['/about', 'درباره ما'],
        ['/help', 'راهنما'],
    ];
    const workspace = user?.role === 'admin' ? '/admin' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist';

    return (
        <div className="min-h-screen bg-background text-foreground" dir="rtl">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="shrink-0 text-xl font-black tracking-tight text-foreground" aria-label="راد آرت، صفحه اصلی">
                        راد<span className="text-primary">آرت</span>
                    </Link>
                    <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 text-sm md:flex">
                        {links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive
                            ? 'rounded-md bg-accent px-3 py-2 font-medium text-accent-foreground'
                            : 'rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'}>{label}</NavLink>)}
                    </nav>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        {user ? (
                            <>
                                <span className="hidden text-sm font-medium text-muted-foreground sm:inline">{user.name}</span>
                                <Badge variant="secondary" className="hidden sm:inline-flex">{roleLabels[user.role] ?? user.role}</Badge>
                                <Link to={workspace} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">فضای کاربری</Link>
                                <button type="button" onClick={handleLogout} className="hidden h-9 rounded-md border border-input px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground sm:inline-flex">خروج</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-accent">ورود</Link>
                                <Link to="/register" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">ثبت‌نام</Link>
                            </>
                        )}
                        <details className="relative md:hidden">
                            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-md border border-input text-sm font-medium hover:bg-accent" aria-label="بازکردن منو">☰</summary>
                            <nav aria-label="ناوبری موبایل" className="absolute end-0 top-11 z-50 grid min-w-48 gap-1 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">
                                {links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'rounded-md bg-accent px-3 py-2 text-sm font-medium' : 'rounded-md px-3 py-2 text-sm hover:bg-muted'}>{label}</NavLink>)}
                                {user && <Link to={workspace} className="rounded-md px-3 py-2 text-sm hover:bg-muted">فضای کاربری</Link>}
                                {user && <button type="button" onClick={handleLogout} className="rounded-md px-3 py-2 text-start text-sm hover:bg-muted">خروج</button>}
                            </nav>
                        </details>
                    </div>
                </div>
                {logoutError && <p role="alert" className="mx-auto max-w-7xl px-4 pb-3 text-sm text-destructive sm:px-6">{logoutError}</p>}
            </header>
            <Outlet />
            <footer className="mt-16 border-t bg-muted/30">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
                    <div><Link to="/" className="text-xl font-black text-foreground">راد<span className="text-primary">آرت</span></Link><p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.</p></div>
                    <div><h2 className="text-sm font-semibold">کشف</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted-foreground"><Link to="/artworks">گالری آثار</Link><Link to="/artists">هنرمندان</Link><Link to="/collections">مجموعه‌های منتخب</Link></div></div>
                    <div><h2 className="text-sm font-semibold">راد آرت</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted-foreground"><Link to="/about">درباره ما</Link><Link to="/help">راهنما</Link><Link to="/contact">تماس با ما</Link></div></div>
                </div>
                <div className="border-t py-4 text-center text-xs text-muted-foreground">راد آرت — گالری هنر مستقل معاصر</div>
            </footer>
        </div>
    );
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
            {open && <section role="dialog" aria-label="اعلان‌های پیام" className="absolute left-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] border border-border bg-white p-4 text-right shadow-xl">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-bold">اعلان‌های پیام</h2>
                    <button type="button" onClick={markAllRead} disabled={busy || unreadCount === 0} className="text-xs font-semibold text-terracotta-strong disabled:opacity-40">خواندن همه</button>
                </div>
                {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
                {loading ? <p className="py-5 text-sm text-muted">در حال دریافت…</p> : items.length === 0 ? <p className="py-5 text-sm text-muted">هنوز اعلانی ندارید.</p> : <ul className="mt-3 max-h-72 divide-y divide-border overflow-y-auto">
                    {items.map((item) => <li key={item.id}>
                        <button type="button" disabled={busy} onClick={() => openNotification(item)} className="w-full py-3 text-right hover:bg-surface-muted disabled:opacity-50">
                            <span className="flex items-start gap-2"><span aria-hidden="true" className={item.read_at ? 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border' : 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terracotta'} />
                                <span className="min-w-0"><strong className="block text-sm">{item.sender_name} پیام جدیدی فرستاد</strong><span className="mt-1 block text-[11px] text-muted">{notificationDate(item.created_at)}</span></span>
                            </span>
                        </button>
                    </li>)}
                </ul>}
                <div className="mt-3 border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(preferences.in_app_messages)} disabled={busy} onChange={(event) => updatePreference(event.target.checked)} /><span>اعلان پیام‌های جدید در این بخش</span></label>
                    <p className="mt-2 text-[11px] leading-5 text-muted">اعلان ایمیلی تا تأیید صف ارسال و تنظیمات میزبان غیرفعال است.</p>
                </div>
            </section>}
        </div>
    );
}

export function WorkspaceLayout({ title, links, outletContext }) {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const handleLogout = async () => {
        setLogoutError('');
        try { await logout(); } catch { setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.'); }
    };

    return (
        <div className="min-h-screen bg-background text-foreground" dir="rtl">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex min-h-16 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-lg font-bold tracking-tight text-foreground">راد<span className="text-primary">آرت</span></Link>
                        <span aria-hidden="true" className="h-5 w-px bg-border" />
                        <p className="text-sm text-muted-foreground">{title}</p>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-sm">
                        <ThemeSwitcher />
                        {user?.role !== 'admin' && <NotificationBell user={user} />}
                        <span className="hidden font-medium sm:inline">{user?.name}</span>
                        <Link to="/" className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium shadow-sm hover:bg-accent">مشاهده سایت</Link>
                        <button type="button" onClick={handleLogout} className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">خروج</button>
                    </div>
                </div>
                {logoutError && <p role="alert" className="mx-auto max-w-[1600px] px-4 pb-3 text-sm text-destructive sm:px-6">{logoutError}</p>}
            </header>
            <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-7 lg:py-7">
                <aside className="h-fit rounded-xl border bg-sidebar p-3 text-sidebar-foreground shadow-sm">
                    <div className="mb-3 flex items-center justify-between px-2 py-2">
                        <span className="text-xs font-semibold text-sidebar-foreground/70">ناوبری فضای کاربری</span>
                        <span className="text-xs text-sidebar-foreground/50">{roleLabels[user?.role] ?? ''}</span>
                    </div>
                    <nav aria-label="ناوبری فضای کاربری" className="grid gap-1">
                        {links.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive
                            ? 'flex min-h-10 items-center rounded-md bg-sidebar-primary px-3 text-sm font-medium text-sidebar-primary-foreground shadow-sm'
                            : 'flex min-h-10 items-center rounded-md px-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}>{item.label}</NavLink>)}
                    </nav>
                </aside>
                <main className="min-w-0">
                    <Outlet context={outletContext} />
                </main>
            </div>
        </div>
    );
}
