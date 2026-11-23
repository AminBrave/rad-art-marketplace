import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, BookOpen, CheckCheck, ClipboardCheck, Flag, Heart, Images, LayoutDashboard, Menu, MessageCircle, Monitor, Moon, Sun, UserRound, Users, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getWorkspaceMobileLinks } from './workspaceNavigation';
import { useTheme } from './useTheme';
import { Badge, Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Checkbox, NotificationListSkeleton } from '../components/ui';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

function ThemeControl() {
    const { theme, cycleTheme } = useTheme();
    const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
    const label = theme === 'dark' ? 'تیره' : theme === 'light' ? 'روشن' : 'هماهنگ با دستگاه';

    return (
        <Button variant="ghost"
            type="button"
            onClick={cycleTheme}
            aria-label={`تغییر پوسته؛ حالت فعلی: ${label}`}
            title={`پوسته: ${label}`}
            className="min-h-0 p-0 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-ink transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
            <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
            <span className="sr-only">تغییر پوسته</span>
        </Button>
    );
}

const publicSecondaryLinks = [
    { to: '/artworks', label: 'گالری آثار' },
    { to: '/artists', label: 'هنرمندان' },
    { to: '/collections', label: 'مجموعه‌ها' },
    { to: '/about', label: 'درباره ما' },
    { to: '/help', label: 'راهنما' },
    { to: '/contact', label: 'تماس' },
];

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
        <div data-experience="discover" className={user ? "min-h-screen bg-canvas text-ink pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] lg:pb-0" : "min-h-screen bg-canvas text-ink"} dir="rtl">
            <a href="#main-content" className="sr-only z-[60] bg-paper px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:inset-x-4 focus:top-4">
                رفتن به محتوای اصلی
            </a>
            <header className="sticky top-0 z-40 border-b-2 border-ink bg-[color:color-mix(in_srgb,var(--color-canvas)_96%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-canvas)_90%,transparent)]">
                <div className="mx-auto flex min-h-[var(--header-height)] max-w-content items-center justify-between gap-2 px-page-gutter sm:gap-5">
                    <Link to="/" className="group flex shrink-0 items-center gap-2 text-ink no-underline sm:gap-3" aria-label="راد آرت، صفحه اصلی">
                        <span className="min-h-0 p-0 grid h-10 w-10 place-items-center bg-ink text-lg font-black text-inverse transition-colors group-hover:bg-terracotta sm:h-11 sm:w-11 sm:text-xl">ر</span>
                        <span className="flex flex-col leading-tight">
                            <span className="text-xl font-black tracking-[-.06em] sm:text-2xl">راد<span className="text-terracotta-strong">آرت</span></span>
                            <span dir="ltr" className="mt-1 hidden text-[9px] font-semibold tracking-[.2em] text-muted sm:block">INDEPENDENT ART</span>
                        </span>
                    </Link>

                    <nav aria-label="ناوبری اصلی" className={`hidden items-center gap-3 ${user ? 'xl:flex' : 'lg:flex'} xl:gap-5`}>
                        {publicLinks.map((item) => (
                            <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>
                        ))}
                    </nav>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <ThemeControl />
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
                                <Link to="/register" className="inline-flex min-h-10 items-center justify-center border border-ink bg-ink px-5 py-2 text-sm font-bold text-inverse no-underline transition-colors hover:border-terracotta hover:bg-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                    ثبت‌نام
                                </Link>
                            </>
                        )}
                        <span className="mx-1 hidden h-7 w-px bg-border xl:block" aria-hidden="true" />
                        <DialogTrigger asChild>
                            <Button variant="ghost"
                                type="button"
                                aria-label="باز کردن منوی اصلی"
                                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${user ? 'xl:hidden' : 'lg:hidden'}`}
                            >
                                <Menu size={19} aria-hidden="true" />
                            </Button>
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
                            <Button variant="ghost"
                                type="button"
                                aria-label="بستن منو"
                                className="min-h-0 p-0 grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                            >
                                <X size={19} aria-hidden="true" />
                            </Button>
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
                                    <Button variant="ghost" type="button" onClick={handleLogout} className="flex min-h-12 items-center rounded-md px-4 text-right text-sm font-semibold text-muted hover:bg-surface-muted hover:text-ink">
                                        خروج از حساب
                                    </Button>
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
                <div className="mx-auto max-w-content px-page-gutter pb-10 pt-14 sm:pb-14 sm:pt-20">
                    <div className="grid gap-10 border-b-2 border-ink pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:pb-14">
                        <div className="max-w-md">
                            <Link to="/" className="inline-flex items-center gap-3 text-ink no-underline" aria-label="راد آرت، صفحه اصلی">
                                <span className="min-h-0 p-0 grid h-10 w-10 place-items-center rounded-md bg-ink text-lg font-black text-inverse">ر</span>
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
            {user && <AuthenticatedBottomNavigation mobileLinks={getWorkspaceMobileLinks(user.role)} />}
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
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState('');
    const notificationKey = ['notifications', user?.id, 'list', page];
    const preferenceKey = ['notifications', user?.id, 'preferences'];

    const notificationsQuery = useQuery({
        queryKey: notificationKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/notifications', { params: { page }, signal });
            return {
                items: data.data ?? [],
                unreadCount: data.unread_count ?? 0,
                lastPage: data.last_page ?? 1,
            };
        },
        enabled: Boolean(user?.id),
        refetchInterval: 30_000,
    });
    const preferencesQuery = useQuery({
        queryKey: preferenceKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/notifications/preferences', { signal });
            return data.data ?? {
                in_app_messages: true,
                in_app_follows: true,
                in_app_artwork_likes: true,
                in_app_artwork_comments: true,
                in_app_comment_replies: true,
                email_available: false,
            };
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
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id, 'list'] });
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
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id, 'list'] });
        },
    });
    const updatePreference = useMutation({
        mutationKey: ['notifications', 'update-preference', user?.id],
        mutationFn: ({ key, enabled }) => axios.patch('/api/v1/notifications/preferences', { [key]: enabled }),
        onMutate: async ({ key, enabled }) => {
            await queryClient.cancelQueries({ queryKey: preferenceKey });
            const previous = queryClient.getQueryData(preferenceKey);
            queryClient.setQueryData(preferenceKey, (current) => ({ ...(current ?? {}), [key]: enabled }));
            return { previous };
        },
        onError: (_, __, context) => {
            if (context?.previous) queryClient.setQueryData(preferenceKey, context.previous);
        },
        onSuccess: ({ data }) => queryClient.setQueryData(preferenceKey, data.data),
    });

    const items = notificationsQuery.data?.items ?? [];
    const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
    const lastPage = notificationsQuery.data?.lastPage ?? 1;
    const preferences = preferencesQuery.data ?? {
        in_app_messages: true,
        in_app_follows: true,
        in_app_artwork_likes: true,
        in_app_artwork_comments: true,
        in_app_comment_replies: true,
        email_available: false,
    };
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
            navigate(item.target_url || (item.conversation_id
                ? inbox + '?conversation=' + encodeURIComponent(item.conversation_id)
                : '/'));
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

    const changePreference = async (key, enabled) => {
        setActionError('');
        try {
            await updatePreference.mutateAsync({ key, enabled });
        } catch {
            setActionError('ذخیره تنظیمات اعلان انجام نشد.');
        }
    };

    const preferenceOptions = [
        ['in_app_messages', 'اعلان پیام‌های جدید', 'پیام تازه در فضای کاربری'],
        ['in_app_follows', 'دنبال‌کننده‌های تازه', 'وقتی کاربری هنرمند را دنبال می‌کند'],
        ['in_app_artwork_likes', 'پسندیدن آثار', 'وقتی کسی اثری را می‌پسندد'],
        ['in_app_artwork_comments', 'دیدگاه‌های آثار', 'وقتی کسی درباره اثر دیدگاه می‌نویسد'],
        ['in_app_comment_replies', 'پاسخ به دیدگاه‌ها', 'وقتی کسی به دیدگاه پاسخ می‌دهد'],
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost"
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
                </Button>
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
                            <DialogTitle className="text-base tracking-tight">اعلان‌ها</DialogTitle>
                            {unreadCount > 0 && <Badge variant="accent">{unreadCount.toLocaleString('fa-IR')} جدید</Badge>}
                        </div>
                        <DialogDescription className="mt-1 text-xs leading-6">خبرهای تازه درباره پیام‌ها، آثار و هنرمندان</DialogDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Button variant="ghost"
                            type="button"
                            onClick={markAll}
                            disabled={busy || unreadCount === 0}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-[11px] font-bold text-terracotta-strong transition-colors hover:bg-accent-surface disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <CheckCheck size={14} aria-hidden="true" />
                            <span>خواندن همه</span>
                        </Button>
                        <DialogClose asChild>
                            <Button variant="ghost"
                                type="button"
                                aria-label="بستن اعلان‌ها"
                                className="min-h-0 p-0 grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                            >
                                <X size={17} aria-hidden="true" />
                            </Button>
                        </DialogClose>
                    </div>
                </div>

                {error && <p role="alert" className="mx-4 mt-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)] bg-danger-surface px-3 py-2 text-xs leading-6 text-danger sm:mx-5">{error}</p>}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
                    {loading ? (
                        <div className="space-y-2 py-1"><NotificationListSkeleton count={3} /></div>
                    ) : items.length === 0 ? (
                        <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted px-5 py-7 text-center">
                            <span className="min-h-0 p-0 grid h-11 w-11 place-items-center rounded-full bg-paper text-muted shadow-soft"><Bell size={19} aria-hidden="true" /></span>
                            <p className="mt-3 text-sm font-bold text-ink">هنوز اعلانی ندارید</p>
                            <p className="mt-1 text-xs leading-6 text-muted">فعالیت‌های تازه در این بخش نمایش داده می‌شوند.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {items.map((item) => {
                                const ItemIcon = item.kind === 'artist_followed' ? Users : item.kind === 'artwork_liked' ? Heart : MessageCircle;
                                return (
                                    <li key={item.id}>
                                        <Button variant="ghost"
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
                                            <span className="min-h-0 p-0 grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface-muted text-terracotta-strong">
                                                <ItemIcon size={17} aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-center justify-between gap-2">
                                                    <strong className="text-sm font-bold leading-6 text-ink">{item.title}</strong>
                                                    {!item.read_at && <Badge variant="accent" className="px-2 py-0.5 text-[10px]">جدید</Badge>}
                                                </span>
                                                {item.artwork_title && <span className="mt-1 block truncate text-xs text-muted">{item.artwork_title}</span>}
                                                {item.comment_preview && <span className="mt-1 block line-clamp-2 text-xs leading-6 text-muted">{item.comment_preview}</span>}
                                                <span className="mt-1 block text-[11px] tabular-nums text-muted">{notificationDate(item.created_at)}</span>
                                            </span>
                                            {!item.read_at && <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracotta" />}
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {!loading && lastPage > 1 && (
                        <nav aria-label="صفحه‌بندی اعلان‌ها" className="mt-4 flex items-center justify-between gap-3">
                            <Button variant="ghost" type="button" disabled={page <= 1 || notificationsQuery.isFetching} onClick={() => setPage((value) => value - 1)} className="border border-border px-3 py-2 text-xs disabled:opacity-40">جدیدتر</Button>
                            <span className="text-xs tabular-nums text-muted">{page.toLocaleString('fa-IR')} از {lastPage.toLocaleString('fa-IR')}</span>
                            <Button variant="ghost" type="button" disabled={page >= lastPage || notificationsQuery.isFetching} onClick={() => setPage((value) => value + 1)} className="border border-border px-3 py-2 text-xs disabled:opacity-40">قدیمی‌تر</Button>
                        </nav>
                    )}
                </div>

                <div className="shrink-0 border-t border-border bg-surface-muted px-4 py-4 sm:px-5">
                    <p className="mb-3 text-xs font-bold text-ink">تنظیمات اعلان درون‌برنامه‌ای</p>
                    <div className="space-y-2">
                        {preferenceOptions.map(([key, label, description]) => (
                            <Checkbox
                                key={key}
                                checked={Boolean(preferences[key])}
                                disabled={busy || preferencesQuery.isPending}
                                onChange={(event) => changePreference(key, event.target.checked)}
                                className="flex min-h-11 w-full items-start gap-3 rounded-md border border-border bg-paper p-3 text-xs leading-6"
                            >
                                <span className="min-w-0">
                                    <strong className="block font-bold text-ink">{label}</strong>
                                    <span className="mt-1 block text-[11px] text-muted">{description}</span>
                                </span>
                            </Checkbox>
                        ))}
                    </div>
                    <p className="mt-2 text-[10px] leading-5 text-muted">اعلان ایمیلی و پیامکی در این نسخه غیرفعال است.</p>
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
    '/admin/artwork-comment-reports': Flag,
    '/admin/editorial': BookOpen,
};

const workspaceNavigationLabels = {
    '/dashboard/artist': 'خانه',
    '/dashboard/artist/profile': 'پروفایل',
    '/dashboard/artist/artworks': 'محتوا',
    '/dashboard/artist/messages': 'پیام‌ها',
    '/dashboard/buyer': 'خانه',
    '/dashboard/buyer/messages': 'پیام‌ها',
    '/admin': 'خانه',
    '/admin/users': 'کاربران',
    '/admin/artworks': 'آثار',
    '/admin/message-reports': 'ایمنی',
    '/admin/artwork-comment-reports': 'دیدگاه‌ها',
    '/admin/editorial': 'سردبیری',
};

function AuthenticatedBottomNavigation({ mobileLinks }) {
    return (
        <div
            data-testid="authenticated-bottom-navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-[color:color-mix(in_srgb,var(--color-paper)_92%,transparent)] pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-paper)_86%,transparent)] lg:hidden"
        >
            <nav aria-label="بخش‌های اصلی حساب کاربری" data-nav-priority="primary" className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-1 px-2">
                {mobileLinks.map((item) => {
                    const Icon = workspaceNavigationIcons[item.to] ?? LayoutDashboard;
                    const accessibleLabel = item.label;
                    const visibleLabel = item.shortLabel ?? workspaceNavigationLabels[item.to] ?? item.label;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            aria-label={accessibleLabel}
                            title={accessibleLabel}
                            className={({ isActive }) => [
                                'relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold leading-tight no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus motion-reduce:transition-none',
                                isActive
                                    ? 'text-terracotta-strong after:absolute after:inset-x-1/4 after:top-0 after:h-0.5 after:rounded-full after:bg-terracotta'
                                    : 'text-muted hover:bg-surface-muted hover:text-ink',
                            ].join(' ')}
                        >
                            <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
                            <span className="max-w-full truncate">{visibleLabel}</span>
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
        <div data-experience={user?.role ?? 'workspace'} className={isMessagingRoute ? "flex h-dvh flex-col overflow-hidden bg-canvas text-ink" : "min-h-screen bg-canvas text-ink"} dir="rtl">
            <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-[color:color-mix(in_srgb,var(--color-paper)_94%,transparent)] shadow-soft backdrop-blur">
                <div className="mx-auto flex min-h-[4.5rem] max-w-content items-center justify-between gap-3 px-page-gutter sm:min-h-20 sm:gap-4">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <Link to="/" className="min-h-0 p-0 group grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-lg font-black text-inverse shadow-soft no-underline transition-colors hover:bg-terracotta sm:h-12 sm:w-12 sm:text-xl" aria-label="راد آرت، صفحه اصلی">
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
                        <ThemeControl />
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
                            <Button variant="ghost"
                                type="button"
                                aria-label="باز کردن منوی حساب کاربری"
                                className="min-h-0 p-0 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
                            >
                                <Menu size={20} aria-hidden="true" />
                            </Button>
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
                        <span className="min-h-0 p-0 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-lg font-black text-inverse">ر</span>
                        <div className="min-w-0">
                            <DialogTitle className="text-sm font-extrabold text-ink">فضای کاری</DialogTitle>
                            <DialogDescription className="mt-1 max-w-48 truncate text-xs text-muted">{user?.name}</DialogDescription>
                        </div>
                    </div>
                    <DialogClose asChild>
                        <Button variant="ghost"
                            type="button"
                            aria-label="بستن منو"
                            className="min-h-0 p-0 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                        >
                            <X size={19} aria-hidden="true" />
                        </Button>
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
                        <h3 className="mb-2 px-3 text-xs font-extrabold text-muted">کشف</h3>
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
                    <Button variant="ghost"
                        type="button"
                        onClick={handleLogout}
                        className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-bold text-danger transition-colors hover:bg-danger-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                        خروج از حساب
                    </Button>
                </div>
            </DialogContent>

            <div className={isMessagingRoute ? 'mx-auto grid h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] w-full min-h-0 min-w-0 max-w-content flex-none grid-cols-1 grid-rows-[minmax(0,1fr)] gap-0 px-page-gutter py-page-gutter sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] sm:gap-4 sm:py-4 lg:h-[calc(100dvh-5rem)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-1 lg:gap-8 lg:py-8' : 'mx-auto grid min-w-0 max-w-content gap-5 px-page-gutter py-5 pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] sm:py-8 sm:pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:pb-8'}>
                {isMessagingRoute && <div className="hidden lg:block" aria-hidden="true" />}
                <aside className={isMessagingRoute
                    ? 'hidden min-w-0 rounded-xl border border-border bg-paper p-3 shadow-soft lg:fixed lg:top-28 lg:right-[max(calc((100vw_-_var(--content-width))_/_2_+_var(--page-gutter)),var(--page-gutter))] lg:z-30 lg:block lg:h-fit lg:max-h-[calc(100dvh_-_8rem)] lg:w-60 lg:overflow-y-auto'
                    : 'hidden min-w-0 rounded-xl border border-border bg-paper p-3 shadow-soft lg:sticky lg:top-24 lg:block lg:h-fit'}>
                    <div className="mb-4 rounded-xl bg-surface-muted p-4">
                        <p className="text-[10px] font-extrabold tracking-wide text-muted">RAD ART / WORKSPACE</p>
                        <p className="mt-1 text-sm font-extrabold text-ink">{title}</p>
                        <p className="mt-1 truncate text-xs text-muted">{user?.name}</p>
                    </div>
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
                                            ? 'bg-accent-surface text-terracotta-strong after:absolute after:inset-y-2 after:right-0 after:w-1 after:rounded-full after:bg-terracotta'
                                            : 'bg-transparent text-muted hover:bg-surface-muted hover:text-ink',
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
            <AuthenticatedBottomNavigation mobileLinks={getWorkspaceMobileLinks(user?.role)} />
        </div>
        </Dialog>
    );
}
