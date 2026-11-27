import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Bell, Bookmark, CheckCheck, Compass, Flag, Heart, House, Languages,
    LayoutDashboard, MessageCircle, Monitor, Moon, Sun, UserRound, Users, X,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../useTheme';
import { useLanguage } from '../LanguageContext';
import {
    Badge, Button, Dialog, DialogClose, DialogContent, DialogDescription,
    DialogTitle, DialogTrigger, BrandLogo,
} from '../../shared/ui';
import { NotificationListSkeleton } from '../../features/messaging';
import { workspaceNavigationIcons } from './navigationConfig';

export function SidebarNavigation({ sections, description, onNavigate, onLogout, unreadConversationCount = 0, locale = 'fa' }) {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto py-5">
            <Link to="/" onClick={onNavigate} className="mb-6 flex min-h-32 flex-col items-center justify-center gap-2 border-b border-border pb-5 no-underline" aria-label="Rademan home">
                <BrandLogo size="sidebar" />
                <span className="text-center text-xs leading-6 text-muted">{description}</span>
            </Link>
            {sections.filter((section) => section.items?.length).map((section, sectionIndex) => (
                <div key={section.label}>
                    {sectionIndex > 0 && <div className="my-5 border-t border-border" />}
                    <nav aria-label={section.label}>
                        <h3 className="mb-2 px-3 text-xs font-extrabold text-ink">{section.label}</h3>
                        <div className="grid gap-1">
                            {section.items.map((item) => {
                                const Icon = item.Icon ?? workspaceNavigationIcons[item.to] ?? LayoutDashboard;
                                const unread = item.to?.endsWith('/messages') ? unreadConversationCount : 0;
                                const label = item.shortLabel ?? item.label;
                                const content = (
                                    <>
                                        <Icon size={19} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />
                                        <span className="min-w-0 flex-1 truncate">{label}</span>
                                        {unread > 0 && <span aria-hidden="true" className="ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-extrabold leading-none tabular-nums text-inverse">{unread > 99 ? (locale === 'fa' ? '۹۹+' : '99+') : unread.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>}
                                    </>
                                );
                                const className = 'flex min-h-11 w-full items-center gap-3 border-s-2 border-transparent px-3 text-start text-sm font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';
                                if (item.action === 'logout') return (
                                    <Button key="logout" variant="ghost" type="button" onClick={onLogout} className={className + ' text-muted hover:text-ink'}>
                                        {content}
                                    </Button>
                                );
                                return (
                                    <NavLink key={item.to} to={item.to} end={item.end}
                                        onClick={onNavigate}
                                        aria-label={unread > 0 ? label + '، ' + unread.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + (locale === 'fa' ? 'گفتگوهای خوانده‌نشده' : 'unread conversations') : label}
                                        className={({ isActive }) => [className, isActive ? 'text-terracotta-strong' : 'text-muted hover:text-ink'].join(' ')}>
                                        {content}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            ))}
        </div>
    );
}

export function ThemeControl() {
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

export function LanguageControl() {
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

function notificationDate(value, locale = 'fa') {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
}

export function NotificationBell({ user, onNavigate }) {
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
        setOpen(false);
        onNavigate?.();

        if (!item.read_at) {
            try {
                await markOneRead.mutateAsync(item);
            } catch {
                setActionError(t('به‌روزرسانی وضعیت اعلان انجام نشد.'));
            }
        }

        const inbox = user.role === 'artist' ? '/dashboard/artist/messages' : '/dashboard/buyer/messages';
        navigate(item.target_url || (item.conversation_id
            ? inbox + '?conversation=' + encodeURIComponent(item.conversation_id)
            : '/'));
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

export function PublicBottomNavigation({ user, unreadConversationCount = 0 }) {
    const { t, locale } = useLanguage();
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
        <div data-testid="public-bottom-navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-[color:color-mix(in_srgb,var(--color-paper)_94%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur shadow-raised">
            <nav aria-label={t('ناوبری بخش‌های عمومی')} data-nav-priority="primary" className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-0 px-1 lg:h-16 lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]">
                {items.map(({ to, label, Icon, end }) => {
                    const isMessagesLink = to.endsWith('/messages');
                    const localizedUnreadCount = unreadConversationCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
                    const accessibleLabel = isMessagesLink && unreadConversationCount > 0
                        ? `${label}، ${localizedUnreadCount} ${t('گفتگوهای خوانده‌نشده')}`
                        : label;
                    return (
                        <NavLink key={to} to={to} end={end} aria-label={accessibleLabel} title={accessibleLabel} className={({ isActive }) => [
                            'relative flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold leading-tight no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus lg:text-xs',
                            isActive ? 'text-terracotta-strong after:absolute after:inset-x-1/3 after:top-0 after:h-0.5 after:bg-terracotta' : 'text-muted hover:text-ink',
                        ].join(' ')}>
                            <span className="relative inline-flex">
                                <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                                {isMessagesLink && unreadConversationCount > 0 && <span aria-hidden="true" className="absolute -end-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-extrabold leading-none tabular-nums text-inverse">{unreadConversationCount > 99 ? (locale === 'fa' ? '۹۹+' : '99+') : localizedUnreadCount}</span>}
                            </span>
                            <span className="max-w-full truncate">{label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}

export function AuthenticatedBottomNavigation({ mobileLinks, unreadConversationCount = 0 }) {
    const { t, locale } = useLanguage();
    return (
        <div
            data-testid="authenticated-bottom-navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-[color:color-mix(in_srgb,var(--color-paper)_92%,transparent)] pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-paper)_86%,transparent)]"
        >
            <nav aria-label={t("بخش‌های اصلی حساب کاربری")} data-nav-priority="primary" className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-0 px-1 lg:h-16 lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]">
                {mobileLinks.map((item) => {
                    const Icon = item.to.startsWith('/artists/') ? UserRound : workspaceNavigationIcons[item.to] ?? LayoutDashboard;
                    const accessibleLabel = t(item.label);
                    const isMessagesLink = item.to.endsWith('/messages');
                    const localizedUnreadCount = unreadConversationCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
                    const navigationLabel = isMessagesLink && unreadConversationCount > 0
                        ? `${accessibleLabel}، ${localizedUnreadCount} ${t('گفتگوهای خوانده‌نشده')}`
                        : accessibleLabel;
                    const visibleLabel = t(item.shortLabel ?? workspaceNavigationLabels[item.to] ?? item.label);
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to === '/dashboard/artist/artworks' ? item.to + '#submitted-artworks' : item.to}
                            end={item.end}
                            aria-label={navigationLabel}
                            title={navigationLabel}
                            className={({ isActive }) => [
                                'relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[10px] font-bold leading-tight no-underline transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus motion-reduce:transition-none lg:text-xs',
                                isActive
                                    ? 'text-terracotta-strong after:absolute after:inset-x-1/4 after:top-0 after:h-0.5 after:rounded-full after:bg-terracotta'
                                    : 'text-muted hover:text-ink',
                            ].join(' ')}
                        >
                            <span className="relative inline-flex">
                                <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                                {isMessagesLink && unreadConversationCount > 0 && <span aria-hidden="true" className="absolute -end-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-extrabold leading-none tabular-nums text-inverse">{unreadConversationCount > 99 ? (locale === 'fa' ? '۹۹+' : '99+') : localizedUnreadCount}</span>}
                            </span>
                            <span className="max-w-full truncate">{visibleLabel}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}

