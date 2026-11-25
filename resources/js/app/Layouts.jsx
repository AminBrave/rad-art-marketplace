import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, BookOpen, Bookmark, CheckCheck, CircleHelp, ClipboardCheck, Compass, Flag, Heart, House, Images, Info, Languages, LayoutDashboard, LogIn, LogOut, Menu, MessageCircle, Monitor, Moon, PlusCircle, Settings as SettingsIcon, Sun, UserPlus, UserRound, Users, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './useTheme';
import { useLanguage } from './LanguageContext';
import { Badge, Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger, NotificationListSkeleton } from '../components/ui';

const publicSecondaryLinks = [
    { to: '/artworks', label: 'گالری آثار' },
    { to: '/artists', label: 'هنرمندان' },
    { to: '/collections', label: 'مجموعه‌ها' },
    { to: '/about', label: 'درباره ما' },
    { to: '/help', label: 'راهنما' },
    { to: '/contact', label: 'تماس' },
];

function ThemeControl() {
    const { theme, cycleTheme } = useTheme();
    const { t } = useLanguage();
    const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
    const label = t(theme === 'dark' ? 'تیره' : theme === 'light' ? 'روشن' : 'هماهنگ با دستگاه');

    return (
        <Button variant="ghost" type="button" onClick={cycleTheme}
            aria-label={`${t('تغییر پوسته')}؛ ${label}`}
            title={`${t('پوسته:')} ${label}`}
            className="min-h-0 p-0 inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-surface text-ink transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong">
            <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
            <span className="sr-only">{t('تغییر پوسته')}</span>
        </Button>
    );
}

function LanguageControl() {
    const { locale, setLocale } = useLanguage();
    const nextLocale = locale === 'fa' ? 'en' : 'fa';
    return (
        <Button
            variant="ghost"
            type="button"
            onClick={() => setLocale(nextLocale)}
            aria-label={locale === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
            title={locale === 'fa' ? 'English' : 'فارسی'}
            className="min-h-0 p-0 inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 border border-border bg-surface px-2 text-xs font-bold text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong"
        >
            <Languages size={17} aria-hidden="true" />
            <span>{locale === 'fa' ? 'EN' : 'فا'}</span>
        </Button>
    );
}

export function PublicLayout() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const artistProfileQuery = useQuery({
        queryKey: ['artist-profile', 'me', user?.id],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artist-profile/me', { signal });
            return data.data ?? null;
        },
        enabled: user?.role === 'artist' && Boolean(user?.id),
        staleTime: 60_000,
    });
    const profileHref = artistProfileQuery.data?.slug ? '/artists/' + artistProfileQuery.data.slug : '/dashboard/artist/profile';
    const [logoutError, setLogoutError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();

    const handleLogout = async () => {
        setMobileMenuOpen(false);
        setLogoutError('');
        try {
            await logout();
        } catch {
            setLogoutError(t('خروج انجام نشد. اتصال را بررسی کنید.'));
        }
    };

    useEffect(() => setMobileMenuOpen(false), [pathname]);

    const publicLinks = [
        { to: '/artworks', label: t('کشف آثار'), Icon: Compass },
        { to: '/artists', label: t('هنرمندان'), Icon: Users },
        { to: '/collections', label: t('مجموعه‌های منتخب'), Icon: Bookmark },
        { to: '/about', label: t('درباره ما'), Icon: Info },
        { to: '/help', label: t('راهنما'), Icon: CircleHelp },
        { to: '/contact', label: t('تماس با ما'), Icon: MessageCircle },
    ];

    return (
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div data-experience="discover" className="min-h-screen bg-canvas text-ink pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)]">
            <a href="#main-content" className="sr-only z-[60] bg-paper px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:inset-x-4 focus:top-4">
                {t("رفتن به محتوای اصلی")}
            </a>
            <header className="sticky top-0 z-40 border-b border-divider-section bg-[color:color-mix(in_srgb,var(--color-canvas)_96%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-canvas)_90%,transparent)]">
                <div className="mx-auto flex min-h-[var(--header-height)] max-w-content items-center justify-between gap-2 px-page-gutter sm:gap-5">
                    <Link to="/" className="group flex shrink-0 items-center gap-2 text-ink no-underline sm:gap-3" aria-label={t('راد آرت، صفحه اصلی')}>
                        <span className="min-h-0 p-0 grid h-10 w-10 place-items-center bg-ink text-lg font-black text-inverse transition-colors group-hover:bg-terracotta sm:h-11 sm:w-11 sm:text-xl">ر</span>
                        <span className="flex flex-col leading-tight">
                            <span className="text-xl font-black tracking-[-.06em] sm:text-2xl">راد<span className="text-terracotta-strong">آرت</span></span>
                            <span className="mt-1 hidden text-[9px] font-semibold tracking-[.2em] text-muted sm:block">INDEPENDENT ART</span>
                        </span>
                    </Link>

                    <div className="flex shrink-0 items-center">
                        <DialogTrigger asChild>
                            <Button variant="ghost" type="button" aria-label={t('باز کردن منوی اصلی')}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                <Menu size={21} aria-hidden="true" />
                            </Button>
                        </DialogTrigger>
                    </div>
                </div>

                <DialogContent placement="drawer" className="flex flex-col px-4 py-5">
                    <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                        <div className="min-w-0">
                            <DialogTitle className="text-base font-extrabold text-ink">{t('منوی راد آرت')}</DialogTitle>
                            <DialogDescription className="mt-1 text-xs text-muted">{t('کشف هنر، هنرمندان و فضای کاربری')}</DialogDescription>
                        </div>
                        <DialogClose asChild><Button variant="ghost" type="button" aria-label={t('بستن منو')} className="grid h-10 w-10 place-items-center p-0 text-muted hover:bg-surface-muted"><X size={19} aria-hidden="true" /></Button></DialogClose>
                    </div>
                    <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <LanguageControl /><ThemeControl />
                        {user && <span className="ms-auto min-w-0 truncate text-sm font-semibold text-ink">{user.name}</span>}
                    </div>
                    <nav aria-label={t('ناوبری اصلی')} className="min-h-0 flex-1 overflow-y-auto">
                        <p className="mb-2 px-3 text-xs font-extrabold text-muted">{t('کشف')}</p>
                        <div className="grid gap-1">
                            {publicLinks.map(({ to, label, Icon }) => (
                                <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => ['flex min-h-12 items-center gap-3 px-3 text-sm font-semibold no-underline transition-colors', isActive ? 'bg-accent-surface text-terracotta-strong' : 'text-muted hover:bg-surface-muted hover:text-ink'].join(' ')}>
                                    <Icon size={19} strokeWidth={1.9} aria-hidden="true" /><span>{label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </nav>
                    <div className="mt-4 border-t border-border pt-4">
                        {user ? (
                            <>
                                <Link to={user.role === 'artist' ? '/dashboard/artist' : user.role === 'admin' ? '/admin' : '/dashboard/buyer'} onClick={() => setMobileMenuOpen(false)}
                                    className="flex min-h-12 items-center gap-3 px-3 text-sm font-bold text-terracotta-strong no-underline hover:bg-accent-surface">
                                    <LayoutDashboard size={19} aria-hidden="true" />{t(user.role === 'artist' ? 'فضای هنرمند' : user.role === 'admin' ? 'مدیریت' : 'فضای خریدار')}
                                </Link>
                                {user.role === 'artist' && <Link to={profileHref} onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 px-3 text-sm font-medium text-muted no-underline hover:bg-surface-muted"><UserRound size={18} aria-hidden="true" />{t('پیش‌نمایش پروفایل')}</Link>}
                                <Button variant="ghost" type="button" onClick={handleLogout} className="flex min-h-12 w-full items-center justify-start gap-3 px-3 text-sm font-semibold text-muted hover:bg-surface-muted"><LogOut size={19} aria-hidden="true" />{t('خروج از حساب')}</Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center gap-3 px-3 text-sm font-semibold text-muted no-underline hover:bg-surface-muted"><LogIn size={19} aria-hidden="true" />{t('ورود')}</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center gap-3 px-3 text-sm font-bold text-terracotta-strong no-underline hover:bg-accent-surface"><UserPlus size={19} aria-hidden="true" />{t('ساخت حساب کاربری')}</Link>
                            </>
                        )}
                    </div>
                </DialogContent>
                {logoutError && <p role="alert" className="mx-auto max-w-content px-page-gutter pb-3 text-xs text-danger">{t(logoutError)}</p>}
            </header>

            <main id="main-content" className="rd-page-frame">
                <Outlet />
            </main>

            <footer className="border-t border-border bg-surface-muted">
                <div className="mx-auto max-w-content px-page-gutter pb-10 pt-14 sm:pb-14 sm:pt-20">
                    <div className="grid gap-10 border-b border-divider-section pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:pb-14">
                        <div className="max-w-md">
                            <Link to="/" className="inline-flex items-center gap-3 text-ink no-underline" aria-label={t('راد آرت، صفحه اصلی')}>
                                <span className="min-h-0 p-0 grid h-10 w-10 place-items-center rounded-md bg-ink text-lg font-black text-inverse">ر</span>
                                <span className="text-xl font-black">راد<span className="text-terracotta-strong">آرت</span></span>
                            </Link>
                            <p className="mt-5 text-sm leading-8 text-muted">
                                {t('فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.')}
                            </p>
                            <Link to="/artworks" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control border border-border-strong px-4 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong">
                                {t('گشت‌وگذار در گالری')}
                                <span aria-hidden="true">←</span>
                            </Link>
                        </div>

                        <nav aria-label="پیوندهای کشف" className="flex flex-col items-start gap-3">
                            <h2 className="mb-1 text-sm font-extrabold text-ink">{t('برای کشف')}</h2>
                            <Link to="/artworks" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">{t('گالری آثار')}</Link>
                            <Link to="/artists" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">{t('هنرمندان')}</Link>
                            <Link to="/collections" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">{t('مجموعه‌های منتخب')}</Link>
                        </nav>

                        <nav aria-label="پیوندهای راد آرت" className="flex flex-col items-start gap-3">
                            <h2 className="mb-1 text-sm font-extrabold text-ink">{t('راد آرت')}</h2>
                            <Link to="/about" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">{t('درباره ما')}</Link>
                            <Link to="/help" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">{t('راهنما')}</Link>
                            <Link to="/contact" className="text-sm text-muted no-underline transition-colors hover:text-terracotta-strong">{t('تماس با ما')}</Link>
                        </nav>
                    </div>

                    <div className="flex flex-col gap-2 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                        <p>{t('راد آرت — گالری هنر مستقل معاصر')}</p>
                        <p className="font-latin tracking-wide">RAD ART · DISCOVER INDEPENDENT ART</p>
                    </div>
                </div>
            </footer>
            <PublicBottomNavigation user={user} />
        </div>
        </Dialog>
    );
}


function notificationDate(value, locale = 'fa') {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
}

function NotificationBell({ user }) {
    const { t, locale } = useLanguage();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState('');
    const notificationKey = ['notifications', user?.id, 'list', page];

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


    const items = notificationsQuery.data?.items ?? [];
    const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
    const lastPage = notificationsQuery.data?.lastPage ?? 1;
    const loading = notificationsQuery.isPending;
    const busy = markOneRead.isPending || markAllRead.isPending;
    const error = actionError || (notificationsQuery.isError ? t('دریافت اعلان‌ها انجام نشد.') : '');

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
            setActionError(t('بازکردن اعلان انجام نشد. دوباره تلاش کنید.'));
        }
    };

    const markAll = async () => {
        if (busy || unreadCount === 0) return;
        setActionError('');
        try {
            await markAllRead.mutateAsync();
        } catch {
            setActionError(t('به‌روزرسانی اعلان‌ها انجام نشد.'));
        }
    };



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost"
                    type="button"
                    aria-label={unreadCount > 0 ? `${t('اعلان‌ها')}، ${unreadCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} ${t('خوانده‌نشده')}` : t('اعلان‌ها')}
                    aria-expanded={open}
                    aria-haspopup="dialog"
                    aria-controls="workspace-notification-panel"
                    className="relative inline-flex min-h-11 items-center gap-2 rounded-md border border-border-strong bg-paper px-3.5 py-2 text-sm font-bold text-ink shadow-soft transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                    <Bell aria-hidden="true" size={17} strokeWidth={1.8} />
                    <span className="hidden sm:inline">{t("اعلان‌ها")}</span>
                    {unreadCount > 0 && <span className="min-w-5 rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-inverse" aria-live="polite">{unreadCount > 99 ? (locale === 'fa' ? '۹۹+' : '99+') : unreadCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>}
                </Button>
            </DialogTrigger>
            <DialogContent
                id="workspace-notification-panel"
                placement="drawer"
                className="!w-[min(25rem,100vw)] !p-0 flex flex-col !overflow-hidden text-start"
            >
                <div className="h-1 shrink-0 bg-terracotta" aria-hidden="true" />
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <DialogTitle className="text-base tracking-tight">{t("اعلان‌ها")}</DialogTitle>
                            {unreadCount > 0 && <Badge variant="accent">{unreadCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t("جدید")}</Badge>}
                        </div>
                        <DialogDescription className="mt-1 text-xs leading-6">{t("خبرهای تازه درباره پیام‌ها، آثار و هنرمندان")}</DialogDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Button variant="ghost"
                            type="button"
                            onClick={markAll}
                            disabled={busy || unreadCount === 0}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-[11px] font-bold text-terracotta-strong transition-colors hover:bg-accent-surface disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <CheckCheck size={14} aria-hidden="true" />
                            <span>{t("خواندن همه")}</span>
                        </Button>
                        <DialogClose asChild>
                            <Button variant="ghost"
                                type="button"
                                aria-label={t("بستن اعلان‌ها")}
                                className="min-h-0 p-0 grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                            >
                                <X size={17} aria-hidden="true" />
                            </Button>
                        </DialogClose>
                    </div>
                </div>

                {error && <p role="alert" className="mx-4 mt-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)] bg-danger-surface px-3 py-2 text-xs leading-6 text-danger sm:mx-5">{t(error)}</p>}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
                    {loading ? (
                        <div className="space-y-2 py-1"><NotificationListSkeleton count={3} /></div>
                    ) : items.length === 0 ? (
                        <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted px-5 py-7 text-center">
                            <span className="min-h-0 p-0 grid h-11 w-11 place-items-center rounded-full bg-paper text-muted shadow-soft"><Bell size={19} aria-hidden="true" /></span>
                            <p className="mt-3 text-sm font-bold text-ink">{t("هنوز اعلانی ندارید")}</p>
                            <p className="mt-1 text-xs leading-6 text-muted">{t("فعالیت‌های تازه در این بخش نمایش داده می‌شوند.")}</p>
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
                                                'group flex w-full items-start gap-3 rounded-lg border p-3 text-start transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50',
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
                                                    <strong className="text-sm font-bold leading-6 text-ink">{locale === 'en' ? (item.title_en || item.title) : item.title}</strong>
                                                    {!item.read_at && <Badge variant="accent" className="px-2 py-0.5 text-[10px]">{t("جدید")}</Badge>}
                                                </span>
                                                {item.artwork_title && <span className="mt-1 block truncate text-xs text-muted">{locale === 'en' ? (item.artwork_title_en || item.artwork_title) : item.artwork_title}</span>}
                                                {item.comment_preview && <span className="mt-1 block line-clamp-2 text-xs leading-6 text-muted">{item.comment_preview}</span>}
                                                <span className="mt-1 block text-[11px] tabular-nums text-muted">{notificationDate(item.created_at, locale)}</span>
                                            </span>
                                            {!item.read_at && <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-terracotta" />}
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {!loading && lastPage > 1 && (
                        <nav aria-label={t("صفحه‌بندی اعلان‌ها")} className="mt-4 flex items-center justify-between gap-3">
                            <Button variant="ghost" type="button" disabled={page <= 1 || notificationsQuery.isFetching} onClick={() => setPage((value) => value - 1)} className="border border-border px-3 py-2 text-xs disabled:opacity-40">{t("جدیدتر")}</Button>
                            <span className="text-xs tabular-nums text-muted">{locale === 'fa' ? `${page.toLocaleString('fa-IR')} از ${lastPage.toLocaleString('fa-IR')}` : `${page.toLocaleString('en-US')} of ${lastPage.toLocaleString('en-US')}`}</span>
                            <Button variant="ghost" type="button" disabled={page >= lastPage || notificationsQuery.isFetching} onClick={() => setPage((value) => value + 1)} className="border border-border px-3 py-2 text-xs disabled:opacity-40">{t("قدیمی‌تر")}</Button>
                        </nav>
                    )}
                </div>


            </DialogContent>
        </Dialog>
    );
}

const workspaceNavigationIcons = {
    '/dashboard/artist': House,
    '/dashboard/artist/profile': UserRound,
    '/dashboard/artist/artworks': Images,
    '/dashboard/artist/artworks/new': PlusCircle,
    '/dashboard/artist/messages': MessageCircle,
    '/dashboard/artist/settings': SettingsIcon,
    '/dashboard/buyer': House,
    '/dashboard/buyer/messages': MessageCircle,
    '/dashboard/buyer/settings': SettingsIcon,
    '/admin': House,
    '/admin/users': Users,
    '/admin/artworks': ClipboardCheck,
    '/admin/message-reports': Flag,
    '/admin/artwork-comment-reports': Flag,
    '/admin/editorial': BookOpen,
    '/admin/settings': SettingsIcon,
};

const workspaceNavigationLabels = {
    '/dashboard/artist': 'داشبورد',
    '/dashboard/artist/profile': 'پروفایل',
    '/dashboard/artist/artworks': 'محتوا',
    '/dashboard/artist/artworks/new': 'ثبت اثر',
    '/dashboard/artist/messages': 'پیام‌ها',
    '/dashboard/artist/settings': 'تنظیمات',
    '/dashboard/buyer': 'داشبورد',
    '/dashboard/buyer/messages': 'پیام‌ها',
    '/dashboard/buyer/settings': 'تنظیمات',
    '/admin': 'داشبورد',
    '/admin/users': 'کاربران',
    '/admin/artworks': 'آثار',
    '/admin/message-reports': 'ایمنی',
    '/admin/artwork-comment-reports': 'دیدگاه‌ها',
    '/admin/editorial': 'سردبیری',
    '/admin/settings': 'تنظیمات',
};

function PublicBottomNavigation({ user }) {
    const { t } = useLanguage();
    const dashboardHref = user?.role === 'artist' ? '/dashboard/artist'
        : user?.role === 'buyer' ? '/dashboard/buyer'
            : user?.role === 'admin' ? '/admin' : '/login';
    const inboxHref = user?.role === 'artist' ? '/dashboard/artist/messages'
        : user?.role === 'buyer' ? '/dashboard/buyer/messages'
            : user?.role === 'admin' ? '/admin/message-reports' : null;
    const items = [
        { to: '/', label: t('خانه'), Icon: House, end: true },
        { to: '/artworks', label: t('کشف'), Icon: Compass, end: true },
        { to: '/artists', label: t('هنرمندان'), Icon: Users, end: true },
        inboxHref
            ? { to: inboxHref, label: t(user?.role === 'admin' ? 'گزارش‌ها' : 'پیام‌ها'), Icon: user?.role === 'admin' ? Flag : MessageCircle, end: true }
            : { to: '/collections', label: t('مجموعه‌ها'), Icon: Bookmark, end: true },
        { to: dashboardHref, label: t(user ? 'حساب کاربری' : 'ورود'), Icon: UserRound, end: true },
    ];
    return (
        <div data-testid="public-bottom-navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-[color:color-mix(in_srgb,var(--color-paper)_94%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur lg:inset-x-auto lg:left-1/2 lg:bottom-6 lg:w-[min(54rem,calc(100vw_-_3rem))] lg:-translate-x-1/2 lg:border lg:pb-0 lg:shadow-raised">
            <nav aria-label={t('ناوبری بخش‌های عمومی')} data-nav-priority="primary" className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-0 px-1 lg:h-16 lg:px-3">
                {items.map(({ to, label, Icon, end }) => (
                    <NavLink key={to} to={to} end={end} aria-label={label} title={label} className={({ isActive }) => [
                        'relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold leading-tight no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus lg:text-xs',
                        isActive ? 'text-terracotta-strong after:absolute after:inset-x-1/3 after:top-0 after:h-0.5 after:bg-terracotta' : 'text-muted hover:text-ink',
                    ].join(' ')}>
                        <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
                        <span className="max-w-full truncate">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

function AuthenticatedBottomNavigation({ mobileLinks, unreadConversationCount = 0 }) {
    const { t, locale } = useLanguage();
    return (
        <div
            data-testid="authenticated-bottom-navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-[color:color-mix(in_srgb,var(--color-paper)_92%,transparent)] pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-paper)_86%,transparent)] lg:inset-x-auto lg:left-1/2 lg:bottom-6 lg:w-[min(54rem,calc(100vw_-_3rem))] lg:-translate-x-1/2 lg:border lg:pb-0"
        >
            <nav aria-label={t("بخش‌های اصلی حساب کاربری")} data-nav-priority="primary" className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-1 px-2 lg:h-16 lg:px-3">
                {mobileLinks.map((item) => {
                    const Icon = item.to.startsWith('/artists/') ? UserRound : workspaceNavigationIcons[item.to] ?? LayoutDashboard;
                    const accessibleLabel = t(item.label);
                    const isMessagesLink = item.to.endsWith('/messages');
                    const isCreateArtworkLink = item.to === '/dashboard/artist/artworks/new';
                    const localizedUnreadCount = unreadConversationCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
                    const navigationLabel = isMessagesLink && unreadConversationCount > 0
                        ? `${accessibleLabel}، ${localizedUnreadCount} ${t('گفتگوی خوانده‌نشده')}`
                        : accessibleLabel;
                    const visibleLabel = t(item.shortLabel ?? workspaceNavigationLabels[item.to] ?? item.label);
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            aria-label={navigationLabel}
                            title={navigationLabel}
                            className={({ isActive }) => [
                                'relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold leading-tight no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus motion-reduce:transition-none lg:text-xs',
                                isActive
                                    ? 'text-terracotta-strong after:absolute after:inset-x-1/4 after:top-0 after:h-0.5 after:rounded-full after:bg-terracotta'
                                    : isCreateArtworkLink
                                        ? 'bg-accent-surface text-terracotta-strong hover:bg-accent-surface'
                                        : 'text-muted hover:bg-surface-muted hover:text-ink',
                            ].join(' ')}
                        >
                            <span className="relative inline-flex">
                                <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
                                {isMessagesLink && unreadConversationCount > 0 && <span aria-hidden="true" className="absolute -end-2 -top-2 min-w-4 rounded-full bg-terracotta px-1 text-[9px] font-extrabold leading-4 text-inverse">{unreadConversationCount > 99 ? (locale === 'fa' ? '۹۹+' : '99+') : localizedUnreadCount}</span>}
                            </span>
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
    const { t, locale } = useLanguage();
    const { pathname } = useLocation();
    const queryClient = useQueryClient();
    const isMessagingRoute = pathname.endsWith('/messages');
    const unreadInboxEndpoint = user?.role === 'artist' ? '/api/v1/artist/conversations'
        : user?.role === 'buyer' ? '/api/v1/buyer/conversations' : null;
    const unreadInboxQuery = useQuery({
        queryKey: ['messaging', 'unread-conversations', user?.id],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(unreadInboxEndpoint, { params: { filter: 'unread' }, signal });
            return Number(data.total ?? 0);
        },
        enabled: Boolean(user?.id && unreadInboxEndpoint),
        staleTime: 15_000,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
    const unreadConversationCount = unreadInboxQuery.data ?? 0;
    const baseWorkspaceLinks = user?.role === 'artist'
        ? links.map((item) => item.to === '/dashboard/artist/profile'
            ? (outletContext?.profile?.slug
                ? { ...item, to: '/artists/' + outletContext.profile.slug, label: 'پیش‌نمایش پروفایل', shortLabel: 'پیش‌نمایش' }
                : { ...item, label: 'تکمیل پروفایل', shortLabel: 'تکمیل' })
            : item)
        : links;
    const workspaceLinks = baseWorkspaceLinks.map((item) => ({ ...item, label: t(item.label), shortLabel: item.shortLabel ? t(item.shortLabel) : undefined }));
    const mobileWorkspaceLinks = workspaceLinks.filter((item) => item.mobilePrimary !== false);
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

    useEffect(() => {
        if (!isMessagingRoute && unreadInboxEndpoint) {
            void queryClient.invalidateQueries({ queryKey: ['messaging', 'unread-conversations', user?.id] });
        }
    }, [isMessagingRoute, pathname, unreadInboxEndpoint, queryClient, user?.id]);

    return (
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div data-experience={user?.role ?? 'workspace'} className={isMessagingRoute ? "flex h-dvh flex-col overflow-hidden bg-canvas text-ink" : "min-h-screen bg-canvas text-ink"}>
            <header className="sticky top-0 z-40 shrink-0 border-b border-divider-section bg-[color:color-mix(in_srgb,var(--color-paper)_96%,transparent)] backdrop-blur">
                <div className="mx-auto flex min-h-[4.5rem] max-w-content items-center justify-between gap-3 px-page-gutter sm:min-h-20 sm:gap-4">
                    <Link to="/" className="group flex shrink-0 items-center gap-2 text-ink no-underline" aria-label={t('راد آرت، صفحه اصلی')}>
                        <span className="grid h-10 w-10 place-items-center bg-ink text-lg font-black text-inverse transition-colors group-hover:bg-terracotta sm:h-11 sm:w-11">ر</span>
                        <span className="text-xl font-black tracking-tight sm:text-2xl">راد<span className="text-terracotta-strong">آرت</span></span>
                    </Link>

                    <div className="flex shrink-0 items-center">
                        <DialogTrigger asChild>
                            <Button variant="ghost" type="button" aria-label={t('باز کردن منوی حساب کاربری')}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                <Menu size={21} aria-hidden="true" />
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
                            <DialogTitle className="text-sm font-extrabold text-ink">{t(title)}</DialogTitle>
                            <DialogDescription className="mt-1 max-w-48 truncate text-xs text-muted">{user?.name}</DialogDescription>
                        </div>
                    </div>
                    <DialogClose asChild>
                        <Button variant="ghost"
                            type="button"
                            aria-label={t('بستن منو')}
                            className="min-h-0 p-0 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                        >
                            <X size={19} aria-hidden="true" />
                        </Button>
                    </DialogClose>
                </div>

                <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3"><LanguageControl /><ThemeControl />{user?.role !== "admin" && <NotificationBell user={user} />}</div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                    <nav aria-label={t("بخش‌های اصلی فضای کاربری")}>
                        <h3 className="mb-2 px-3 text-xs font-extrabold text-ink">{t("فضای کاربری")}</h3>
                        <div className="grid gap-1">
                            {workspaceLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label={item.to.endsWith('/messages') && unreadConversationCount > 0
                                        ? `${t(item.label)}، ${unreadConversationCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} ${t('گفتگوی خوانده‌نشده')}`
                                        : t(item.label)}
                                    className={({ isActive }) => [
                                        'flex min-h-11 items-center border-s-2 border-transparent px-3 text-sm font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
                                        isActive ? 'bg-accent-surface text-terracotta-strong' : item.to === '/dashboard/artist/artworks/new' ? 'bg-accent-surface/70 text-terracotta-strong hover:bg-accent-surface' : 'text-muted hover:bg-surface-muted hover:text-ink',
                                    ].join(' ')}
                                >
                                    {(() => { const Icon = item.to.startsWith('/artists/') ? UserRound : workspaceNavigationIcons[item.to] ?? LayoutDashboard; return <Icon size={19} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />; })()}
                                    <span>{t(item.label)}</span>
                                    {item.to.endsWith('/messages') && unreadConversationCount > 0 && <span aria-hidden="true" className="ms-auto min-w-5 rounded-full bg-terracotta px-1.5 py-0.5 text-center text-[10px] font-extrabold tabular-nums text-inverse">{unreadConversationCount > 99 ? (locale === 'fa' ? '۹۹+' : '99+') : unreadConversationCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>}
                                </NavLink>
                            ))}
                        </div>
                    </nav>

                    <div className="my-5 border-t border-border" />

                    <nav aria-label={t('پیوندهای تکمیلی سایت')}>
                        <h3 className="mb-2 px-3 text-xs font-extrabold text-muted">{t("کشف")}</h3>
                        <div className="grid gap-1">
                            {publicSecondaryLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => [
                                        'flex min-h-10 items-center gap-3 px-3 text-sm font-medium no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
                                        isActive ? 'bg-accent-surface text-terracotta-strong' : 'text-muted hover:bg-surface-muted hover:text-ink',
                                    ].join(' ')}
                                >
                                    {(() => { const Icon = item.to === '/artworks' ? Compass : item.to === '/artists' ? Users : item.to === '/collections' ? Bookmark : item.to === '/about' ? Info : item.to === '/help' ? CircleHelp : MessageCircle; return <Icon size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />; })()}
                                    <span>{t(item.label)}</span>
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
                        {t('خروج از حساب')}
                    </Button>
                </div>
            </DialogContent>

            <div className={isMessagingRoute
                ? 'mx-auto flex h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] w-full min-w-0 max-w-content px-page-gutter py-3 sm:py-4 lg:py-6'
                : 'mx-auto w-full max-w-content px-page-gutter py-5 pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] sm:py-8 sm:pb-[calc(var(--workspace-bottom-nav-height)+2rem)]'}>
                <main className={isMessagingRoute ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden' : 'rd-workspace-main min-w-0 w-full'}>
                    {isMessagingRoute
                        ? <Outlet context={outletContext} />
                        : <div className="rd-page-frame rd-page-frame--workspace"><Outlet context={outletContext} /></div>}
                </main>
            </div>
            <AuthenticatedBottomNavigation mobileLinks={mobileWorkspaceLinks} unreadConversationCount={unreadConversationCount} />
        </div>
        </Dialog>
    );
}
