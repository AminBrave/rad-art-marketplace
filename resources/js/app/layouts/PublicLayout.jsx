import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Menu, X } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import {
    Button, Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, BrandLogo,
} from '../../shared/ui';
import {
    LanguageControl, NotificationBell, PublicBottomNavigation, SidebarNavigation, ThemeControl,
} from './layoutNavigation';
import { getPublicWorkspaceLinks, publicDiscoveryLinks, publicInfoLinks } from './navigationConfig';

export function PublicLayout() {
    const { user, logout } = useAuth();
    const { t, locale } = useLanguage();
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

    return (
        <Dialog modal={false} open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div data-experience="discover" className="min-h-screen bg-canvas text-ink pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)]">
            <a href="#main-content" className="sr-only z-[60] bg-paper px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:inset-x-4 focus:top-4">
                {t("رفتن به محتوای اصلی")}
            </a>
            <header className="sticky top-0 z-40 border-b border-divider-section bg-[color:color-mix(in_srgb,var(--color-canvas)_96%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-canvas)_90%,transparent)]">
                <div className="mx-auto flex min-h-[var(--header-height)] max-w-content items-center justify-between gap-2 px-page-gutter sm:gap-5">
                    <Link to="/" className="group flex shrink-0 items-center text-ink no-underline" aria-label={t('ردّمن، صفحه اصلی')}><BrandLogo /></Link>

                    <div className="flex shrink-0 items-center">
                        <DialogTrigger asChild>
                            <Button variant="ghost" type="button" aria-label={t('باز کردن منوی اصلی')}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                <Menu size={21} aria-hidden="true" />
                            </Button>
                        </DialogTrigger>
                    </div>
                </div>

                <DialogContent nonModalOverlay overlayOpen={mobileMenuOpen} placement="drawer" className="flex flex-col px-4 py-5">
                    <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                        <div className="min-w-0">
                            <DialogTitle className="text-base font-extrabold text-ink">{t('منو')}</DialogTitle>
                        </div>
                        <DialogClose asChild><Button variant="ghost" type="button" aria-label={t('بستن منو')} className="grid h-10 w-10 place-items-center p-0 text-muted hover:bg-surface-muted"><X size={19} aria-hidden="true" /></Button></DialogClose>
                    </div>
                    <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <LanguageControl /><ThemeControl />
                        {user && user.role !== 'admin' && <NotificationBell user={user} onNavigate={() => setMobileMenuOpen(false)} />}
                        {user && <span className="ms-auto min-w-0 truncate text-sm font-semibold text-ink">{user.name}</span>}
                    </div>
                    <SidebarNavigation
                        description={t('کشف هنر، هنرمندان و فضای کاربری')}
                        sections={[
                            { label: t('کشف'), items: publicDiscoveryLinks.map((item) => ({ ...item, label: t(item.label) })) },
                            { label: t(user ? (user.role === 'artist' ? 'فضای هنرمند' : user.role === 'admin' ? 'مدیریت' : 'فضای خریدار') : 'حساب کاربری'), items: getPublicWorkspaceLinks(user, profileHref, t) },
                            { label: t('ردّمن'), items: publicInfoLinks.map((item) => ({ ...item, label: t(item.label) })) },
                        ]}
                        onNavigate={() => setMobileMenuOpen(false)}
                        onLogout={handleLogout}
                        unreadConversationCount={unreadConversationCount}
                        locale={locale}
                    />
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
                            <Link to="/" className="inline-flex text-ink no-underline" aria-label={t('ردّمن، صفحه اصلی')}><BrandLogo size="footer" /></Link>
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

                        <nav aria-label="پیوندهای ردّمن" className="flex flex-col items-start gap-3">
                            <h2 className="mb-1 text-sm font-extrabold text-ink">{t('ردّمن')}</h2>
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
            <PublicBottomNavigation user={user} unreadConversationCount={unreadConversationCount} />
        </div>
        </Dialog>
    );
}


