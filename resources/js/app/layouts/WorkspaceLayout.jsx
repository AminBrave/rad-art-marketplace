import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import {
    Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle,
    DialogTrigger, BrandLogo,
} from '../../shared/ui';
import {
    AuthenticatedBottomNavigation, LanguageControl, NotificationBell, SidebarNavigation, ThemeControl,
} from './layoutNavigation';
import { publicDiscoveryLinks, publicInfoLinks, workspaceNavigationLabels } from './navigationConfig';

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
    const wasMessagingRoute = useRef(isMessagingRoute);
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
        if (wasMessagingRoute.current && !isMessagingRoute && unreadInboxEndpoint) {
            void queryClient.invalidateQueries({ queryKey: ['messaging', 'unread-conversations', user?.id] });
        }
        wasMessagingRoute.current = isMessagingRoute;
    }, [isMessagingRoute, unreadInboxEndpoint, queryClient, user?.id]);

    return (
        <Dialog modal={false} open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div data-experience={user?.role ?? 'workspace'} className={isMessagingRoute ? "flex h-dvh flex-col overflow-hidden bg-canvas text-ink" : "min-h-screen bg-canvas text-ink"}>
            <header className="sticky top-0 z-40 shrink-0 border-b border-divider-section bg-[color:color-mix(in_srgb,var(--color-paper)_96%,transparent)] backdrop-blur">
                <div className="mx-auto flex min-h-[4.5rem] max-w-content items-center justify-between gap-3 px-page-gutter sm:min-h-20 sm:gap-4">
                    <Link to="/" className="group flex shrink-0 items-center text-ink no-underline" aria-label={t('ردّمن، صفحه اصلی')}><BrandLogo /></Link>

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
                nonModalOverlay
                placement="drawer"
                className="flex flex-col"
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-5">
                    <div className="min-w-0">
                        <DialogTitle className="text-sm font-extrabold text-ink">{t(title)}</DialogTitle>
                        <DialogDescription className="mt-1 max-w-48 truncate text-xs text-muted">{user?.name}</DialogDescription>
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

                <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3"><LanguageControl /><ThemeControl />{user?.role !== "admin" && <NotificationBell user={user} onNavigate={() => setMobileMenuOpen(false)} />}</div>
                <SidebarNavigation
                    description={t('کشف هنر، هنرمندان و فضای کاربری')}
                    sections={[
                        { label: t('کشف'), items: publicDiscoveryLinks.map((item) => ({ ...item, label: t(item.label) })) },
                        { label: t(user?.role === 'artist' ? 'فضای هنرمند' : user?.role === 'admin' ? 'مدیریت' : 'فضای خریدار'), items: workspaceLinks.map((item) => ({ ...item, label: item.shortLabel ?? (workspaceNavigationLabels[item.to] ? t(workspaceNavigationLabels[item.to]) : item.label) })) .concat([{ action: 'logout', label: t('خروج از حساب'), Icon: LogOut }]) },
                        { label: t('ردّمن'), items: publicInfoLinks.map((item) => ({ ...item, label: t(item.label) })) },
                    ]}
                    onNavigate={() => setMobileMenuOpen(false)}
                        onLogout={handleLogout}
                    unreadConversationCount={unreadConversationCount}
                    locale={locale}
                />
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

