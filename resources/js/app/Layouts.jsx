import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, BookOpen, CheckCheck, ClipboardCheck, Flag, Images, LayoutDashboard, Menu, MessageCircle, UserRound, Users, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Badge, Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Checkbox, NotificationListSkeleton } from '../components/ui';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

const publicSecondaryLinks = [
    { to: '/artworks', label: 'گالری آثار' },
    { to: '/artists', label: 'هنرمندان' },
    { to: '/collections', label: 'مجموعه‌ها' },
    { to: '/about', label: 'درباره ما' },
    { to: '/help', label: 'راهنما' },
    { to: '/contact', label: 'تماس' },
];

export function getWorkspacePrimaryLinks(role) {
    const links = {
        artist: [
            { to: '/dashboard/artist', label: 'نمای کلی', end: true },
            { to: '/dashboard/artist/profile', label: 'پروفایل هنرمند' },
            { to: '/dashboard/artist/artworks', label: 'مدیریت آثار' },
            { to: '/dashboard/artist/messages', label: 'پیام‌های مستقیم' },
        ],
        buyer: [
            { to: '/dashboard/buyer', label: 'نمای کلی', end: true },
            { to: '/dashboard/buyer/messages', label: 'پیام‌های مستقیم' },
        ],
        admin: [
            { to: '/admin', label: 'نمای کلی', end: true },
            { to: '/admin/users', label: 'مدیریت کاربران' },
            { to: '/admin/artworks', label: 'بررسی آثار' },
            { to: '/admin/message-reports', label: 'گزارش پیام‌ها' },
            { to: '/admin/editorial', label: 'مجموعه‌ها و سردبیری' },
        ],
    };
    return links[role] ?? [];
}

export function PublicLayout() {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();

    const handleLogout = async () => {
        setMobileMenuOpen(false);
        setLogoutError('');
        try {
            await logout();
        } catch {
            setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.');
        }
    };

    useEffect(() => setMobileMenuOpen(false), [pathname]);

    const publicLinks = [
        { to: '/artworks', label: 'کشف آثار' },
        { to: '/artists', label: 'هنرمندان' },
        { to: '/collections', label: 'مجموعه‌های منتخب' },
        { to: '/about', label: 'درباره ما' },
        { to: '/help', label: 'راهنما' },
    ];
    const navClass = ({ isActive }) => [
        'relative inline-flex min-h-11 items-center whitespace-nowrap px-1 text-sm font-semibold transition-colors',
        'after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-terracotta after:transition-transform',
        isActive
            ? 'text-terracotta-strong after:scale-x-100'
            : 'text-muted hover:text-ink',
    ].join(' ');

    return (
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className={user ? "min-h-screen bg-canvas text-ink pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] lg:pb-0" : "min-h-screen bg-canvas text-ink"} dir="rtl">
            <a href="#main-content" className="sr-only z-[60] bg-paper px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:right-4 focus:top-4">
                رفتن به محتوای اصلی
            </a>
            <header className="sticky top-0 z-40 border-b border-border bg-[color:color-mix(in_srgb,var(--color-canvas)_94%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-canvas)_88%,transparent)]">
                <div className="mx-auto flex min-h-[var(--header-height)] max-w-content items-center justify-between gap-4 px-page-gutter">
                    <Link to="/" className="group flex shrink-0 items-center gap-3 text-ink no-underline" aria-label="راد آرت، صفحه اصلی">
                        <span className="grid h-11 w-11 place-items-center rounded-md bg-ink text-xl font-black text-inverse transition-colors group-hover:bg-terracotta">ر</span>
                        <span className="flex flex-col leading-tight">
                            <span className="text-xl font-black tracking-tight">راد<span className="text-terracotta-strong">آرت</span></span>
                            <span dir="ltr" className="mt-1 text-[9px] font-semibold tracking-[.2em] text-muted">INDEPENDENT ART</span>
                        </span>
                    </Link>

                    <nav aria-label="ناوبری اصلی" className="hidden items-center gap-5 xl:flex">
                        {publicLinks.map((item) => (
                            <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
                        ))}
                    </nav>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        {user ? (
                            <>
                                <span className="hidden max-w-36 truncate text-sm font-semibold text-ink 2xl:inline">{user.name}</span>
                                <Badge variant="accent" className="hidden md:inline-flex">{roleLabels[user.role] ?? user.role}</Badge>
                                <Link
                                    to={user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist'}
                                    className="hidden min-h-10 items-center px-2 text-sm font-bold text-terracotta-strong underline-offset-4 hover:underline sm:inline-flex"
                                >
                                    فضای کاربری
                                </Link>
                                <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={handleLogout}>خروج</Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hidden min-h-10 items-center px-2 text-sm font-bold text-ink transition-colors hover:text-terracotta-strong sm:inline-flex">ورود</Link>
                                <Link to="/register" className="inline-flex min-h-10 items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                    ثبت‌نام
                                </Link>
                            </>
                        )}
                        <span className="mx-1 hidden h-7 w-px bg-border xl:block" aria-hidden="true" />
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                aria-label="باز کردن منوی اصلی"
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus xl:hidden"
                            >
                                <Menu size={19} aria-hidden="true" />
                            </button>
                        </DialogTrigger>
                    </div>
                </div>

                <DialogContent
                    placement="drawer"
                    className="flex flex-col px-4 py-5"
                >
                    <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                        <div>
                            <DialogTitle className="text-base font-extrabold text-ink">ناوبری اصلی</DialogTitle>
                            <DialogDescription className="mt-1 text-xs text-muted">بخش‌های مختلف راد آرت</DialogDescription>
                        </div>
                        <DialogClose asChild>
                            <button
                                type="button"
                                aria-label="بستن منو"
                                className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                            >
                                <X size={19} aria-hidden="true" />
                            </button>
                        </DialogClose>
                    </div>
                    <nav aria-label="ناوبری موبایل" className="min-h-0 flex-1 overflow-y-auto">
                        <div className="mx-auto grid max-w-content gap-1">
                            {publicLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => [
                                        'flex min-h-12 items-center rounded-md px-4 text-sm font-semibold transition-colors',
                                        isActive ? 'bg-accent-surface text-terracotta-strong' : 'text-muted hover:bg-surface-muted hover:text-ink',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                            <div className="my-2 border-t border-border" />
                            {user ? (
                                <>
                                    <Link
                                        to={user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist'}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex min-h-12 items-center rounded-md px-4 text-sm font-bold text-terracotta-strong hover:bg-accent-surface"
                                    >
                                        فضای کاربری
                                    </Link>
                                    <button type="button" onClick={handleLogout} className="flex min-h-12 items-center rounded-md px-4 text-right text-sm font-semibold text-muted hover:bg-surface-muted hover:text-ink">
                                        خروج از حساب
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center rounded-md px-4 text-sm font-semibold text-muted hover:bg-surface-muted">ورود</Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center rounded-md px-4 text-sm font-bold text-terracotta-strong hover:bg-accent-surface">ساخت حساب کاربری</Link>
                                </>
                            )}
                        </div>
                    </nav>
                </DialogContent>
                {logoutError && <p role="alert" className="mx-auto max-w-content px-page-gutter pb-3 text-xs text-danger">{logoutError}</p>}
            </header>

            <div id="main-content">
                <Outlet />
            </div>

            <footer className="border-t border-border bg-surface-muted">
                <div className="mx-auto max-w-content px-page-gutter pb-10 pt-12 sm:pb-12 sm:pt-16">
                    <div className="grid gap-10 border-b border-border pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:pb-12">
                        <div className="max-w-md">
                            <Link to="/" className="inline-flex items-center gap-3 text-ink no-underline" aria-label="راد آرت، صفحه اصلی">
                                <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-lg font-black text-inverse">ر</span>
                                <span className="text-xl font-black">راد<span className="text-terracotta-strong">آرت</span></span>
                            </Link>
                            <p className="mt-5 text-sm leading-8 text-muted">
                                فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.
                            </p>
                            <Link to="/artworks" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-border-strong px-4 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong">
                                گشت‌وگذار در گالری
                                <span aria-hidden="true">←</span>
                            </Link>
                        </div>

                        <nav aria-label="پیوندهای کشف" className="flex flex-col items-start gap-3">
                            <h2 className="mb-1 text-sm font-extrabold text-ink">برای کشف</h2>
                            <Link to="/artworks" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">گالری آثار</Link>
                            <Link to="/artists" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">هنرمندان</Link>
                            <Link to="/collections" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">مجموعه‌های منتخب</Link>
                        </nav>

                        <nav aria-label="پیوندهای راد آرت" className="flex flex-col items-start gap-3">
                            <h2 className="mb-1 text-sm font-extrabold text-ink">راد آرت</h2>
                            <Link to="/about" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">درباره ما</Link>
                            <Link to="/help" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">راهنما</Link>
                            <Link to="/contact" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">تماس با ما</Link>
                        </nav>
                    </div>

                    <div className="flex flex-col gap-2 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                        <p>راد آرت — گالری هنر مستقل معاصر</p>
                        <p dir="ltr" className="font-latin tracking-wide">RAD ART · DISCOVER INDEPENDENT ART</p>
                    </div>
                </div>
            </footer>
            {user && <AuthenticatedBottomNavigation primaryLinks={getWorkspacePrimaryLinks(user.role)} />}
        </div>
        </Dialog>
    );
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
        mutationKey: ['notifications', 'mark-read', user?.id],
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
        mutationKey: ['notifications', 'mark-all-read', user?.id],
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
        mutationKey: ['notifications', 'update-preference', user?.id],
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    aria-label={unreadCount > 0 ? `اعلان‌ها، ${unreadCount.toLocaleString('fa-IR')} خوانده‌نشده` : 'اعلان‌ها'}
                    aria-expanded={open}
                    aria-haspopup="dialog"
                    aria-controls="workspace-notification-panel"
                    className="relative inline-flex min-h-11 items-center gap-2 rounded-md border border-border-strong bg-paper px-3.5 py-2 text-sm font-bold text-ink shadow-soft transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                <Bell aria-hidden="true" size={17} strokeWidth={1.8} />
                <span className="hidden sm:inline">اعلان‌ها</span>
                {unreadCount > 0 && <span className="min-w-5 rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-inverse" aria-live="polite">{unreadCount > 99 ? '۹۹+' : unreadCount.toLocaleString('fa-IR')}</span>}
                </button>
            </DialogTrigger>
            <DialogContent
                id="workspace-notification-panel"
                placement="drawer"
                className="!w-[min(25rem,100vw)] !p-0 flex flex-col !overflow-hidden text-right"
            >
                    <div className="h-1 shrink-0 bg-terracotta" aria-hidden="true" />
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <DialogTitle id="workspace-notification-title" className="text-base tracking-tight">اعلان‌های پیام</DialogTitle>
                                {unreadCount > 0 && <Badge variant="accent">{unreadCount.toLocaleString('fa-IR')} جدید</Badge>}
                            </div>
                            <DialogDescription className="mt-1 text-xs leading-6">پیام‌های تازه و وضعیت خوانده‌شدن آن‌ها</DialogDescription>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={markAll}
                                disabled={busy || unreadCount === 0}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-[11px] font-bold text-terracotta-strong transition-colors hover:bg-accent-surface disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <CheckCheck size={14} aria-hidden="true" />
                                <span>خواندن همه</span>
                            </button>
                            <DialogClose asChild>
                                <button
                                    type="button"
                                    aria-label="بستن اعلان‌ها"
                                    className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                                >
                                    <X size={17} aria-hidden="true" />
                                </button>
                            </DialogClose>
                        </div>
                    </div>

                    {error && <p role="alert" className="mx-4 mt-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)] bg-danger-surface px-3 py-2 text-xs leading-6 text-danger sm:mx-5">{error}</p>}

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
                        {loading ? (
                            <div className="space-y-2 py-1"><NotificationListSkeleton count={3} /></div>
                        ) : items.length === 0 ? (
                            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted px-5 py-7 text-center">
                                <span className="grid h-11 w-11 place-items-center rounded-full bg-paper text-muted shadow-soft"><Bell size={19} aria-hidden="true" /></span>
                                <p className="mt-3 text-sm font-bold text-ink">هنوز اعلانی ندارید</p>
                                <p className="mt-1 text-xs leading-6 text-muted">پیام‌های تازه از هنرمندان و خریداران در این بخش نمایش داده می‌شوند.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => openNotification(item)}
                                            className={[
                                                'group flex w-full items-start gap-3 rounded-lg border p-3 text-right transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50',
                                                item.read_at
                                                    ? 'border-border bg-paper hover:border-border-strong hover:bg-surface-muted'
                                                    : 'border-[color:color-mix(in_srgb,var(--color-terracotta)_24%,var(--color-border))] bg-accent-surface hover:border-terracotta',
                                            ].join(' ')}
                                        >
                                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface-muted text-terracotta-strong">
                                                <MessageCircle size={17} aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-center justify-between gap-2">
                                                    <strong className="text-sm font-bold leading-6 text-ink">{item.sender_name} پیام جدیدی فرستاد</strong>
                                                    {!item.read_at && <Badge variant="accent" className="px-2 py-0.5 text-[10px]">جدید</Badge>}
                                                </span>
                                                <span className="mt-1 block text-[11px] tabular-nums text-muted">{notificationDate(item.created_at)}</span>
                                            </span>
                                            {!item.read_at && <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracotta" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="shrink-0 border-t border-border bg-surface-muted px-4 py-4 sm:px-5">
                        <Checkbox
                            checked={Boolean(preferences.in_app_messages)}
                            disabled={busy || preferencesQuery.isPending}
                            onChange={(event) => changePreference(event.target.checked)}
                            className="flex min-h-11 w-full items-start gap-3 rounded-md border border-border bg-paper p-3 text-xs leading-6"
                        >
                            <span className="min-w-0">
                                <strong className="block font-bold text-ink">اعلان پیام‌های جدید در این بخش</strong>
                                <span className="mt-1 block text-[11px] text-muted">نمایش اعلان پیام‌های تازه در فضای کاربری</span>
                            </span>
                        </Checkbox>
                        <p className="mt-2 text-[10px] leading-5 text-muted">اعلان ایمیلی تا تأیید صف ارسال و تنظیمات میزبان غیرفعال است.</p>
                    </div>
            </DialogContent>
        </Dialog>
    );
}

const workspaceNavigationIcons = {
    '/dashboard/artist': LayoutDashboard,
    '/dashboard/artist/profile': UserRound,
    '/dashboard/artist/artworks': Images,
    '/dashboard/artist/messages': MessageCircle,
    '/dashboard/buyer': LayoutDashboard,
    '/dashboard/buyer/messages': MessageCircle,
    '/admin': LayoutDashboard,
    '/admin/users': Users,
    '/admin/artworks': ClipboardCheck,
    '/admin/message-reports': Flag,
    '/admin/editorial': BookOpen,
};

const workspaceNavigationLabels = {
    '/dashboard/artist': 'خانه',
    '/dashboard/artist/profile': 'پروفایل',
    '/dashboard/artist/artworks': 'آثار',
    '/dashboard/artist/messages': 'پیام‌ها',
    '/dashboard/buyer': 'خانه',
    '/dashboard/buyer/messages': 'پیام‌ها',
    '/admin': 'خانه',
    '/admin/users': 'کاربران',
    '/admin/artworks': 'بررسی آثار',
    '/admin/message-reports': 'گزارش‌ها',
    '/admin/editorial': 'سردبیری',
};

function AuthenticatedBottomNavigation({ primaryLinks }) {
    return (
        <div
            data-testid="authenticated-bottom-navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-[color:color-mix(in_srgb,var(--color-paper)_92%,transparent)] pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-paper)_86%,transparent)] lg:hidden"
        >
            <nav aria-label="بخش‌های اصلی حساب کاربری" data-nav-priority="primary" className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-1 px-2">
                {primaryLinks.map((item) => {
                    const Icon = workspaceNavigationIcons[item.to] ?? LayoutDashboard;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            aria-label={item.label}
                            title={item.label}
                            className={({ isActive }) => [
                                'relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold leading-tight no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus motion-reduce:transition-none',
                                isActive
                                    ? 'text-terracotta-strong after:absolute after:inset-x-1/4 after:top-0 after:h-0.5 after:rounded-full after:bg-terracotta'
                                    : 'text-muted hover:bg-surface-muted hover:text-ink',
                            ].join(' ')}
                        >
                            <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
                            <span className="max-w-full truncate">{workspaceNavigationLabels[item.to] ?? item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}

export function WorkspaceLayout({ title, links, outletContext }) {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const isMessagingRoute = pathname.endsWith('/messages');
    const [logoutError, setLogoutError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const handleLogout = async () => {
        setMobileMenuOpen(false);
        setLogoutError('');
        try {
            await logout();
        } catch {
            setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.');
        }
    };

    useEffect(() => setMobileMenuOpen(false), [pathname]);

    return (
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className={isMessagingRoute ? "flex h-dvh flex-col overflow-hidden bg-canvas text-ink" : "min-h-screen bg-canvas text-ink"} dir="rtl">
            <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-[color:color-mix(in_srgb,var(--color-paper)_94%,transparent)] shadow-soft backdrop-blur">
                <div className="mx-auto flex min-h-[4.5rem] max-w-content items-center justify-between gap-3 px-page-gutter sm:min-h-20 sm:gap-4">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <Link to="/" className="group grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-lg font-black text-inverse shadow-soft no-underline transition-colors hover:bg-terracotta sm:h-12 sm:w-12 sm:text-xl" aria-label="راد آرت، صفحه اصلی">
                            <span className="transition-transform group-hover:scale-110">ر</span>
                        </Link>
                        <div className="min-w-0">
                            <Link to="/" className="text-base font-black tracking-tight text-ink no-underline sm:text-lg">راد<span className="text-terracotta-strong">آرت</span></Link>
                            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 sm:mt-1 sm:gap-2">
                                <span className="max-w-[9.5rem] truncate text-[11px] font-semibold text-muted sm:max-w-none sm:text-xs">{title}</span>
                                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                                <Badge variant="accent" className="shrink-0 px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px]">{roleLabels[user?.role] ?? 'فضای کاربری'}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        {user?.role !== 'admin' && <NotificationBell user={user} />}

                        <div className="hidden min-w-0 items-center gap-3 lg:flex">
                            <span className="max-w-44 truncate border-e border-border pe-3 text-sm font-bold text-ink">{user?.name}</span>
                            <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border-strong bg-paper px-4 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                مشاهده سایت
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="min-h-10 gap-2">
                                <span>خروج</span>
                            </Button>
                        </div>

                        <DialogTrigger asChild>
                            <button
                                type="button"
                                aria-label="باز کردن منوی حساب کاربری"
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                                <Menu size={20} aria-hidden="true" />
                            </button>
                        </DialogTrigger>
                    </div>
                </div>
                {logoutError && <p role="alert" className="mx-auto max-w-content px-page-gutter pb-3 text-xs text-danger">{logoutError}</p>}
            </header>

            <DialogContent
                placement="drawer"
                className="flex flex-col"
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-lg font-black text-inverse">ر</span>
                        <div className="min-w-0">
                            <DialogTitle className="text-sm font-extrabold text-ink">حساب کاربری</DialogTitle>
                            <DialogDescription className="mt-1 max-w-48 truncate text-xs text-muted">{user?.name}</DialogDescription>
                        </div>
                    </div>
                    <DialogClose asChild>
                        <button
                            type="button"
                            aria-label="بستن منو"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                        >
                            <X size={19} aria-hidden="true" />
                        </button>
                    </DialogClose>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                    <nav aria-label="بخش‌های اصلی فضای کاربری">
                        <h3 className="mb-2 px-3 text-xs font-extrabold text-ink">فضای کاربری</h3>
                        <div className="grid gap-1">
                            {links.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => [
                                        'flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
                                        isActive ? 'bg-accent-surface text-terracotta-strong' : 'text-muted hover:bg-surface-muted hover:text-ink',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </nav>

                    <div className="my-5 border-t border-border" />

                    <nav aria-label="پیوندهای تکمیلی سایت">
                        <h3 className="mb-2 px-3 text-xs font-extrabold text-muted">کشف و راهنمایی</h3>
                        <div className="grid gap-1">
                            {publicSecondaryLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => [
                                        'flex min-h-10 items-center rounded-lg px-3 text-sm font-medium no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
                                        isActive ? 'bg-accent-surface text-terracotta-strong' : 'text-muted hover:bg-surface-muted hover:text-ink',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </nav>
                </div>

                <div className="shrink-0 border-t border-border bg-surface-muted p-4">
                    <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-11 items-center justify-center rounded-lg border border-border-strong bg-paper px-4 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong"
                    >
                        مشاهده سایت
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-bold text-danger transition-colors hover:bg-danger-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                        خروج از حساب
                    </button>
                </div>
            </DialogContent>

            <div className={isMessagingRoute ? 'mx-auto grid h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] w-full min-h-0 min-w-0 max-w-content flex-none grid-cols-1 grid-rows-[minmax(0,1fr)] gap-0 px-page-gutter py-page-gutter sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] sm:gap-4 sm:py-4 lg:h-[calc(100dvh-5rem)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-1 lg:gap-8 lg:py-8' : 'mx-auto grid min-w-0 max-w-content gap-5 px-page-gutter py-5 pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] sm:py-8 sm:pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:pb-8'}>
                {isMessagingRoute && <div className="hidden lg:block" aria-hidden="true" />}
                <aside className={isMessagingRoute
                    ? 'hidden min-w-0 rounded-xl border border-border bg-paper p-3 shadow-soft lg:fixed lg:top-28 lg:right-[max(calc((100vw_-_var(--content-width))_/_2_+_var(--page-gutter)),var(--page-gutter))] lg:z-30 lg:block lg:h-fit lg:max-h-[calc(100dvh_-_8rem)] lg:w-60 lg:overflow-y-auto'
                    : 'hidden min-w-0 rounded-xl border border-border bg-paper p-3 shadow-soft lg:sticky lg:top-24 lg:block lg:h-fit'}>
                    <nav aria-label="ناوبری فضای کاربری" className="flex w-full min-w-0 flex-col gap-1">
                        {links.map((item) => {
                            const Icon = workspaceNavigationIcons[item.to] ?? LayoutDashboard;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) => [
                                        'relative inline-flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none',
                                        isActive
                                            ? 'bg-ink text-inverse shadow-soft after:absolute after:inset-y-2 after:right-0 after:w-1 after:rounded-full after:bg-terracotta'
                                            : 'bg-transparent text-muted hover:bg-accent-surface hover:text-terracotta-strong',
                                    ].join(' ')}
                                >
                                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />
                                    <span className="min-w-0 truncate">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                <main className={isMessagingRoute ? 'flex min-h-0 min-w-0 flex-col overflow-hidden lg:col-start-2' : 'min-w-0'}>
                    <Outlet context={outletContext} />
                </main>
            </div>
            <AuthenticatedBottomNavigation primaryLinks={links} />
        </div>
        </Dialog>
    );
}
