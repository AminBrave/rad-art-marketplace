import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, BookOpen, Flag, Images, LayoutDashboard, LogOut, Menu, MessageCircle, ShieldCheck, UserRound, Users, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { NotificationListSkeleton } from '../components/ui';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

export function PublicLayout() {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const publicHeaderRef = useRef(null);
    const [publicHeaderHeight, setPublicHeaderHeight] = useState(0);
    const isWorkspacePage = /^\/(?:dashboard(?:\/|$)|admin(?:\/|$))/.test(pathname);
    const workspaceTitle = user?.role === 'artist' ? 'فضای هنرمند' : user?.role === 'buyer' ? 'فضای خریدار' : 'مدیریت رادآرت';
    const workspaceHome = user?.role === 'admin' ? '/admin' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist';

    useEffect(() => setMobileMenuOpen(false), [pathname]);
    useLayoutEffect(() => {
        const header = publicHeaderRef.current;
        if (!header) return undefined;
        const measure = () => setPublicHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(header);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (!mobileMenuOpen) return undefined;
        const closeOnEscape = (event) => { if (event.key === 'Escape') setMobileMenuOpen(false); };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        setLogoutError('');
        try {
            await logout();
            setMobileMenuOpen(false);
        } catch {
            setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.');
        }
    };
    const publicLinks = [
        { to: '/artworks', label: 'کشف آثار' },
        { to: '/collections', label: 'مجموعه‌ها' },
    ];
    const navClass = ({ isActive }) => isActive
        ? 'font-bold text-terracotta-strong'
        : 'text-muted transition-colors hover:text-terracotta-strong';

    return <div className="ra-public-shell min-h-screen bg-canvas text-ink" dir="rtl" style={{ '--site-header-height': publicHeaderHeight + 'px', '--workspace-nav-height': '4.25rem' }}>
        <header ref={publicHeaderRef} className="ra-public-header sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/90">
            <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-10">
                <Link to="/" className="shrink-0 text-[1.35rem] font-black tracking-tight text-ink no-underline sm:text-2xl" aria-label="راد آرت، صفحه اصلی">
                    راد<span className="text-terracotta-strong">آرت</span>
                    <span className="ms-2 hidden align-middle text-[10px] font-medium tracking-[.18em] text-muted xl:inline">ART MARKETPLACE</span>
                </Link>

                {isWorkspacePage
                    ? <span className="hidden text-xs font-semibold text-muted sm:inline">{workspaceTitle}</span>
                    : <nav aria-label="ناوبری اصلی" className="hidden items-center gap-7 text-sm lg:flex">
                        {publicLinks.map((item) => <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>)}
                    </nav>
                }

                <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
                    {user && user.role !== 'admin' && <NotificationBell user={user} />}
                    {user ? <>
                        {!isWorkspacePage && <Link to={workspaceHome} className="hidden min-h-10 items-center px-2 font-semibold text-terracotta-strong transition-colors hover:text-ink sm:inline-flex">فضای کاربری</Link>}
                        <button type="button" onClick={handleLogout} aria-label="خروج از حساب کاربری" title="خروج" className="inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-border px-2.5 font-semibold text-muted transition-colors hover:border-terracotta hover:text-terracotta-strong sm:px-3">
                            <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
                            <span className="hidden sm:inline">خروج</span>
                        </button>
                    </> : <>
                        <Link to="/login" className="hidden min-h-10 items-center px-2 font-semibold text-muted transition-colors hover:text-terracotta-strong sm:inline-flex">ورود</Link>
                        <Link to="/register" className="inline-flex min-h-10 items-center rounded-lg bg-ink px-3 py-2 font-semibold text-white transition-colors hover:bg-terracotta sm:px-4">ثبت‌نام</Link>
                    </>}
                    {!isWorkspacePage && <button
                        type="button"
                        aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="public-mobile-navigation"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="grid h-10 w-10 place-items-center rounded-lg border border-border text-ink transition-colors hover:border-terracotta lg:hidden"
                    >
                        {mobileMenuOpen ? <X aria-hidden="true" size={19} /> : <Menu aria-hidden="true" size={19} />}
                    </button>}
                </div>
            </div>

            {mobileMenuOpen && !isWorkspacePage && <nav id="public-mobile-navigation" aria-label="ناوبری موبایل" className="border-t border-border bg-canvas px-4 py-3 lg:hidden">
                <div className="mx-auto grid max-w-7xl gap-1">
                    {publicLinks.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? 'bg-surface-muted font-bold text-terracotta-strong' : 'text-muted hover:bg-surface-muted hover:text-ink') + ' min-h-11 rounded-lg px-3 py-2.5 text-sm'}>{item.label}</NavLink>)}
                    {user
                        ? <Link onClick={() => setMobileMenuOpen(false)} to={workspaceHome} className="min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold text-terracotta-strong">فضای کاربری</Link>
                        : <><Link onClick={() => setMobileMenuOpen(false)} to="/login" className="min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted">ورود</Link><Link onClick={() => setMobileMenuOpen(false)} to="/register" className="min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold text-terracotta-strong">ساخت حساب کاربری</Link></>}
                    {user && }
                </div>
            </nav>}
            {logoutError && <p role="alert" className="mx-auto max-w-7xl px-4 pb-3 text-xs text-red-700 sm:px-8">{logoutError}</p>}
        </header>

        <Outlet />
        {isWorkspacePage && user && <WorkspaceBottomNavigation links={workspaceLinksForRole(user.role)} />}
        {!isWorkspacePage && <footer className="border-t border-border bg-surface-muted">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
                <div><Link to="/" className="text-xl font-black text-ink">راد<span className="text-terracotta-strong">آرت</span></Link><p className="mt-3 max-w-sm text-sm leading-7 text-muted">فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.</p></div>
                <div><h2 className="text-sm font-bold">کشف</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted"><Link to="/artworks">گالری آثار</Link><Link to="/artists">هنرمندان</Link><Link to="/collections">مجموعه‌های منتخب</Link></div></div>
                <div><h2 className="text-sm font-bold">راد آرت</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted"><Link to="/about">درباره ما</Link><Link to="/help">راهنما</Link><Link to="/contact">تماس با ما</Link></div></div>
            </div>
            <div className="border-t border-border py-4 text-center text-xs text-muted">راد آرت — گالری هنر مستقل معاصر</div>
        </footer>}
    </div>;
}

function notificationDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

function NotificationBell({ user }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [actionError, setActionError] = useState('');
    const notificationKey = ['notifications', user?.id, 'list'];
    const preferenceKey = ['notifications', user?.id, 'preferences'];

    const notificationsQuery = useQuery({
        queryKey: notificationKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/notifications', { signal });
            return { items: data.data ?? [], unreadCount: data.unread_count ?? 0 };
        },
        enabled: Boolean(user?.id),
        refetchInterval: 30_000,
    });
    const preferencesQuery = useQuery({
        queryKey: preferenceKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/notifications/preferences', { signal });
            return data.data ?? { in_app_messages: true, email_available: false };
        },
        enabled: Boolean(user?.id),
    });

    const markOneRead = useMutation({
        mutationFn: (item) => axios.patch('/api/v1/notifications/' + item.id + '/read'),
        onSuccess: (_, item) => {
            queryClient.setQueryData(notificationKey, (current) => current ? {
                ...current,
                items: current.items.map((notification) => notification.id === item.id
                    ? { ...notification, read_at: new Date().toISOString() }
                    : notification),
                unreadCount: Math.max(0, current.unreadCount - 1),
            } : current);
        },
    });
    const markAllRead = useMutation({
        mutationFn: () => axios.patch('/api/v1/notifications/read-all'),
        onSuccess: () => {
            queryClient.setQueryData(notificationKey, (current) => current ? {
                ...current,
                items: current.items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })),
                unreadCount: 0,
            } : current);
        },
    });
    const updatePreference = useMutation({
        mutationFn: (enabled) => axios.patch('/api/v1/notifications/preferences', { in_app_messages: enabled }),
        onMutate: async (enabled) => {
            await queryClient.cancelQueries({ queryKey: preferenceKey });
            const previous = queryClient.getQueryData(preferenceKey);
            queryClient.setQueryData(preferenceKey, (current) => ({ ...(current ?? {}), in_app_messages: enabled }));
            return { previous };
        },
        onError: (_, __, context) => {
            if (context?.previous) queryClient.setQueryData(preferenceKey, context.previous);
        },
        onSuccess: ({ data }) => queryClient.setQueryData(preferenceKey, data.data),
    });

    const items = notificationsQuery.data?.items ?? [];
    const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
    const preferences = preferencesQuery.data ?? { in_app_messages: true, email_available: false };
    const loading = notificationsQuery.isPending || preferencesQuery.isPending;
    const busy = markOneRead.isPending || markAllRead.isPending || updatePreference.isPending;
    const error = actionError || (notificationsQuery.isError || preferencesQuery.isError
        ? 'دریافت اعلان‌ها انجام نشد.'
        : '');

    const openNotification = async (item) => {
        if (busy) return;
        setActionError('');
        try {
            if (!item.read_at) await markOneRead.mutateAsync(item);
            setOpen(false);
            const inbox = user.role === 'artist' ? '/dashboard/artist/messages' : '/dashboard/buyer/messages';
            navigate(inbox + '?conversation=' + encodeURIComponent(item.conversation_id));
        } catch {
            setActionError('بازکردن اعلان انجام نشد. دوباره تلاش کنید.');
        }
    };

    const markAll = async () => {
        if (busy || unreadCount === 0) return;
        setActionError('');
        try {
            await markAllRead.mutateAsync();
        } catch {
            setActionError('به‌روزرسانی اعلان‌ها انجام نشد.');
        }
    };

    const changePreference = async (enabled) => {
        setActionError('');
        try {
            await updatePreference.mutateAsync(enabled);
        } catch {
            setActionError('ذخیره تنظیمات اعلان انجام نشد.');
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
                    <button type="button" onClick={markAll} disabled={busy || unreadCount === 0} className="text-xs font-semibold text-terracotta-strong disabled:opacity-40">خواندن همه</button>
                </div>
                {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
                {loading ? <div className="py-2"><NotificationListSkeleton count={3} /></div> : items.length === 0 ? <p className="py-5 text-sm text-muted">هنوز اعلانی ندارید.</p> : <ul className="mt-3 max-h-72 divide-y divide-border overflow-y-auto">
                    {items.map((item) => <li key={item.id}>
                        <button type="button" disabled={busy} onClick={() => openNotification(item)} className="w-full py-3 text-right hover:bg-surface-muted disabled:opacity-50">
                            <span className="flex items-start gap-2"><span aria-hidden="true" className={item.read_at ? 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-border' : 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terracotta'} />
                                <span className="min-w-0"><strong className="block text-sm">{item.sender_name} پیام جدیدی فرستاد</strong><span className="mt-1 block text-[11px] text-muted">{notificationDate(item.created_at)}</span></span>
                            </span>
                        </button>
                    </li>)}
                </ul>}
                <div className="mt-3 border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(preferences.in_app_messages)} disabled={busy || preferencesQuery.isPending} onChange={(event) => changePreference(event.target.checked)} /><span>اعلان پیام‌های جدید در این بخش</span></label>
                    <p className="mt-2 text-[11px] leading-5 text-muted">اعلان ایمیلی تا تأیید صف ارسال و تنظیمات میزبان غیرفعال است.</p>
                </div>
            </section>}
        </div>
    );
}

function workspaceLinksForRole(role) {
    if (role === 'artist') return [
        { to: '/dashboard/artist', label: 'خانه', end: true },
        { to: '/dashboard/artist/artworks', label: 'آثار' },
        { to: '/dashboard/artist/messages', label: 'پیام‌ها' },
        { to: '/dashboard/artist/profile', label: 'حساب' },
    ];
    if (role === 'buyer') return [
        { to: '/dashboard/buyer', label: 'خانه', end: true },
        { to: '/artists', label: 'هنرمندان' },
        { to: '/dashboard/buyer/messages', label: 'پیام‌ها' },
    ];
    if (role === 'admin') return [
        { to: '/admin', label: 'خانه', end: true },
        { to: '/admin/users', label: 'کاربران' },
        { to: '/admin/artworks', label: 'آثار' },
        { to: '/admin/message-reports', label: 'گزارش‌ها' },
        { to: '/admin/editorial', label: 'سردبیری' },
    ];
    return [];
}

function workspaceNavigationIcon(path) {
    if (path.endsWith('/profile')) return UserRound;
    if (path === '/admin/artworks') return ShieldCheck;
    if (path.endsWith('/artworks')) return Images;
    if (path.endsWith('/messages')) return MessageCircle;
    if (path.endsWith('/users')) return Users;
    if (path.endsWith('/message-reports')) return Flag;
    if (path.endsWith('/editorial')) return BookOpen;
    return LayoutDashboard;
}

function WorkspaceBottomNavigation({ links }) {
    if (!links?.length) return null;
    return (
        <nav className="ra-workspace-bottom-nav" aria-label="ناوبری فضای کاربری">
            <div className="ra-workspace-bottom-nav__items">
                {links.map((item) => {
                    const Icon = workspaceNavigationIcon(item.to);
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            title={item.label}
                            className={({ isActive }) => isActive ? 'ra-workspace-bottom-nav__link is-active' : 'ra-workspace-bottom-nav__link'}
                        >
                            <Icon aria-hidden="true" size={20} strokeWidth={1.9} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}


export function WorkspaceLayout({ outletContext }) {
    return (
        <div className="ra-workspace-shell bg-canvas text-ink" dir="rtl">
            <main className="ra-workspace-content mx-auto min-w-0 max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-7">
                <Outlet context={outletContext} />
            </main>
        </div>
    );
}
