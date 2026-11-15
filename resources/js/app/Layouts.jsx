import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bell, CheckCheck, Menu, MessageCircle, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Badge, Button, NotificationListSkeleton } from '../components/ui';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

export function PublicLayout() {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuTriggerRef = useRef(null);
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
    useEffect(() => {
        if (!mobileMenuOpen) return undefined;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setMobileMenuOpen(false);
                mobileMenuTriggerRef.current?.focus();
            }
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [mobileMenuOpen]);

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
        <div className="min-h-screen bg-canvas text-ink" dir="rtl">
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
                        <button
                            ref={mobileMenuTriggerRef}
                            type="button"
                            aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="public-mobile-navigation"
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus xl:hidden"
                        >
                            {mobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <nav id="public-mobile-navigation" aria-label="ناوبری موبایل" className="border-t border-border bg-paper px-page-gutter py-4 xl:hidden">
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
                )}
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
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [actionError, setActionError] = useState('');
    const panelRef = useRef(null);
    const triggerRef = useRef(null);
    const [panelPosition, setPanelPosition] = useState({ top: 0, left: 16 });

    const positionPanel = () => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const panelWidth = Math.min(400, window.innerWidth - 32);
        const left = Math.max(16, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 16));
        const estimatedHeight = Math.min(560, window.innerHeight - 32);
        const top = rect.bottom + 8 + estimatedHeight <= window.innerHeight
            ? rect.bottom + 8
            : Math.max(16, rect.top - estimatedHeight - 8);
        setPanelPosition({ top, left });
    };

    useEffect(() => {
        if (!open) return undefined;
        positionPanel();
        panelRef.current?.focus();
        const reposition = () => positionPanel();
        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', reposition, true);
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        const closeOnOutsidePointer = (event) => {
            if (panelRef.current && !panelRef.current.parentElement?.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
        document.addEventListener('pointerdown', closeOnOutsidePointer);
        return () => {
            document.removeEventListener('keydown', closeOnEscape);
            document.removeEventListener('pointerdown', closeOnOutsidePointer);
            window.removeEventListener('resize', reposition);
            window.removeEventListener('scroll', reposition, true);
        };
    }, [open]);
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
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label={unreadCount > 0 ? `اعلان‌ها، ${unreadCount.toLocaleString('fa-IR')} خوانده‌نشده` : 'اعلان‌ها'}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-controls="workspace-notification-panel"
                onClick={() => setOpen((value) => !value)}
                className="relative inline-flex min-h-11 items-center gap-2 rounded-md border border-border-strong bg-paper px-3.5 py-2 text-sm font-bold text-ink shadow-soft transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
                <Bell aria-hidden="true" size={17} strokeWidth={1.8} />
                <span className="hidden sm:inline">اعلان‌ها</span>
                {unreadCount > 0 && <span className="min-w-5 rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-inverse" aria-live="polite">{unreadCount > 99 ? '۹۹+' : unreadCount.toLocaleString('fa-IR')}</span>}
            </button>

            {open && (
                <button
                    type="button"
                    aria-label="بستن اعلان‌ها"
                    tabIndex="-1"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-[90] h-full w-full cursor-default bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]"
                />
            )}
            {open && (
                <section
                    id="workspace-notification-panel"
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="workspace-notification-title"
                    ref={panelRef}
                    tabIndex="-1"
                    style={{ top: panelPosition.top, left: panelPosition.left, width: 'min(25rem, calc(100vw - 2rem))', maxHeight: 'calc(100dvh - 2rem)' }}
                    className="fixed z-[100] flex flex-col overflow-hidden rounded-xl border border-border-strong bg-paper text-right text-ink shadow-raised ring-1 ring-[color:color-mix(in_srgb,var(--color-ink)_6%,transparent)] outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    <div className="h-1 shrink-0 bg-terracotta" aria-hidden="true" />
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 id="workspace-notification-title" className="text-base font-extrabold tracking-tight">اعلان‌های پیام</h2>
                                {unreadCount > 0 && <Badge variant="accent">{unreadCount.toLocaleString('fa-IR')} جدید</Badge>}
                            </div>
                            <p className="mt-1 text-xs text-muted">پیام‌های تازه و وضعیت خوانده‌شدن آن‌ها</p>
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
                            <button
                                type="button"
                                aria-label="بستن اعلان‌ها"
                                onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
                                className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                            >
                                <X size={17} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {error && <p role="alert" className="mx-4 mt-3 rounded-md border border-danger/20 bg-danger-surface px-3 py-2 text-xs leading-6 text-danger sm:mx-5">{error}</p>}

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
                        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-paper p-3 text-xs leading-6">
                            <input
                                type="checkbox"
                                checked={Boolean(preferences.in_app_messages)}
                                disabled={busy || preferencesQuery.isPending}
                                onChange={(event) => changePreference(event.target.checked)}
                                className="mt-1 h-4 w-4 shrink-0 accent-terracotta"
                            />
                            <span className="min-w-0">
                                <strong className="block font-bold text-ink">اعلان پیام‌های جدید در این بخش</strong>
                                <span className="mt-1 block text-[11px] text-muted">نمایش اعلان پیام‌های تازه در فضای کاربری</span>
                            </span>
                        </label>
                        <p className="mt-2 text-[10px] leading-5 text-muted">اعلان ایمیلی تا تأیید صف ارسال و تنظیمات میزبان غیرفعال است.</p>
                    </div>
                </section>
            )}
        </div>
    );
}

export function WorkspaceLayout({ title, links, outletContext }) {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [logoutError, setLogoutError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuTriggerRef = useRef(null);
    const mobileMenuPanelRef = useRef(null);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        mobileMenuTriggerRef.current?.focus();
    };

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
        if (!mobileMenuOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        mobileMenuPanelRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeMobileMenu();
                return;
            }

            if (event.key !== 'Tab' || !mobileMenuPanelRef.current) return;
            const focusable = mobileMenuPanelRef.current.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && (document.activeElement === first || document.activeElement === mobileMenuPanelRef.current)) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileMenuOpen]);

    return (
        <div className="min-h-screen bg-canvas text-ink" dir="rtl">
            <header className="sticky top-0 z-40 border-b border-border bg-[color:color-mix(in_srgb,var(--color-paper)_94%,transparent)] shadow-soft backdrop-blur">
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

                        <button
                            ref={mobileMenuTriggerRef}
                            type="button"
                            aria-label={mobileMenuOpen ? 'بستن منوی فضای کاربری' : 'باز کردن منوی فضای کاربری'}
                            aria-expanded={mobileMenuOpen}
                            aria-haspopup="dialog"
                            aria-controls="workspace-mobile-menu"
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
                        >
                            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                        </button>
                    </div>
                </div>
                {logoutError && <p role="alert" className="mx-auto max-w-content px-page-gutter pb-3 text-xs text-danger">{logoutError}</p>}
            </header>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden">
                    <button
                        type="button"
                        aria-label="بستن منوی فضای کاربری"
                        tabIndex="-1"
                        onClick={closeMobileMenu}
                        className="absolute inset-0 h-full w-full cursor-default bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]"
                    />
                    <aside
                        id="workspace-mobile-menu"
                        ref={mobileMenuPanelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="workspace-mobile-menu-title"
                        tabIndex="-1"
                        className="absolute inset-y-0 right-0 flex w-[min(22rem,calc(100vw-2.75rem))] flex-col border-s border-border bg-paper shadow-raised outline-none"
                    >
                        <div className="flex items-center justify-between border-b border-border px-5 py-5">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-lg font-black text-inverse">ر</span>
                                <div className="min-w-0">
                                    <h2 id="workspace-mobile-menu-title" className="text-sm font-extrabold text-ink">منوی فضای کاربری</h2>
                                    <p className="mt-1 max-w-48 truncate text-xs text-muted">{user?.name}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="بستن منو"
                                onClick={closeMobileMenu}
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                            >
                                <X size={19} aria-hidden="true" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                            <p className="px-3 pb-2 text-[11px] font-extrabold tracking-wide text-muted">ناوبری</p>
                            <nav aria-label="ناوبری فضای کاربری" className="grid gap-1">
                                {links.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) => [
                                            'relative flex min-h-12 items-center rounded-lg px-4 py-3 text-sm font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                                            isActive
                                                ? 'bg-accent-surface text-terracotta-strong after:absolute after:inset-y-2 after:right-0 after:w-1 after:rounded-full after:bg-terracotta'
                                                : 'text-muted hover:bg-surface-muted hover:text-ink',
                                        ].join(' ')}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <div className="shrink-0 border-t border-border bg-surface-muted p-4">
                            <Link
                                to="/"
                                onClick={closeMobileMenu}
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
                    </aside>
                </div>
            )}

            <div className="mx-auto grid min-w-0 max-w-content gap-5 px-page-gutter py-5 sm:py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
                <aside className="hidden min-w-0 rounded-xl border border-border bg-paper p-3 shadow-soft lg:sticky lg:top-24 lg:block lg:h-fit">
                    <div className="mb-2 flex items-center justify-between px-3 py-2">
                        <p className="text-[11px] font-extrabold tracking-wide text-muted">ناوبری فضای کاری</p>
                        <span className="text-[10px] font-semibold text-subtle">RAD / MENU</span>
                    </div>
                    <nav aria-label="ناوبری فضای کاربری" className="flex w-full min-w-0 flex-col gap-1">
                        {links.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => [
                                    'relative inline-flex min-h-11 w-full items-center rounded-lg px-4 py-2.5 text-sm font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                                    isActive
                                        ? 'bg-ink text-inverse shadow-soft after:absolute after:inset-y-2 after:right-0 after:w-1 after:rounded-full after:bg-terracotta'
                                        : 'bg-transparent text-muted hover:bg-accent-surface hover:text-terracotta-strong',
                                ].join(' ')}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <main className="min-w-0">
                    <Outlet context={outletContext} />
                </main>
            </div>
        </div>
    );
}
