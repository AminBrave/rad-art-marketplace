import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
    Button, Container, FormFieldSkeleton, Section, Skeleton,
} from '../../shared/ui';
import { ArtworkCardSkeleton, ArtworkDetailSkeleton } from '../../features/artworks';
import { ArtistCardSkeleton, ArtistProfileSkeleton } from '../../features/artists';
import {
    AdminDashboardSkeleton, ArtworkModerationSkeleton, AdminUserCardsSkeleton,
    MessageReportsSkeleton, AdminEditorialSkeleton,
} from '../../features/admin';
import { ArtistWorkspaceOverviewSkeleton, ArtworkStudioListSkeleton } from '../../features/artist';
import { BuyerDashboardSkeleton } from '../../features/buyer';
import { ConversationInboxSkeleton, MessageHistorySkeleton } from '../../features/messaging';
import { CollectionCardSkeleton, CollectionDetailSkeleton } from '../../features/collections';
import { HomePageSkeleton } from '../../features/home';

function WorkspaceAuthLoading({ children }) {
    const { pathname } = useLocation();
    const isMessagingRoute = pathname.endsWith('/messages');
    const navigationCount = pathname.startsWith('/dashboard/buyer') ? 3 : 5;
    const navigationItems = Array.from({ length: navigationCount }, (_, index) => index);

    return (
        <div
            className={isMessagingRoute ? 'flex h-dvh flex-col overflow-hidden bg-canvas text-ink' : 'min-h-screen bg-canvas text-ink'}
            aria-busy="true"
        >
            <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-paper shadow-soft">
                <div className="mx-auto flex min-h-[4.5rem] max-w-content items-center justify-between gap-3 px-page-gutter sm:min-h-20 sm:gap-4" aria-hidden="true">
                    <div className="flex min-w-0 items-center gap-2">
                        <Skeleton className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-11 w-11 shrink-0" />
                </div>
            </header>

            <div className={isMessagingRoute
                ? 'mx-auto flex h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] w-full min-w-0 max-w-content px-page-gutter py-3 sm:py-4 lg:py-6'
                : 'mx-auto w-full max-w-content px-page-gutter py-5 pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] sm:py-8 sm:pb-[calc(var(--workspace-bottom-nav-height)+2rem)]'}>
                <main className={isMessagingRoute ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden' : 'min-w-0'}>
                    {children}
                </main>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)] shadow-raised lg:inset-x-auto lg:left-1/2 lg:bottom-6 lg:w-[min(54rem,calc(100vw_-_3rem))] lg:-translate-x-1/2 lg:border lg:pb-0" aria-hidden="true">
                <div className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-1 px-2 lg:h-16 lg:px-3">
                    {navigationItems.map((item) => (
                        <div key={item} className="flex flex-col items-center justify-center gap-1">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-2 w-10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function RouteLoading({ label = 'در حال آماده‌سازی صفحه…' }) {
    const { t } = useLanguage();
    const { pathname, search } = useLocation();
    const isWorkspace = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/admin');
    const hasHeaderAction = ['/admin/artworks', '/admin/users', '/admin/message-reports'].includes(pathname);
    const isArtworkDetail = /^\/artworks\/[^/]+/.test(pathname);
    const isArtistProfile = /^\/artists\/[^/]+/.test(pathname);
    const isCollectionDetail = /^\/collections\/[^/]+/.test(pathname);
    const isMessaging = /^\/dashboard\/(artist|buyer)\/messages$/.test(pathname);
    const requestedConversationId = Number(new URLSearchParams(search).get('conversation'));
    const hasRequestedConversation = Number.isSafeInteger(requestedConversationId) && requestedConversationId > 0;

    if (pathname === '/') return <HomePageSkeleton />;
    if (isArtworkDetail) return <ArtworkDetailSkeleton />;
    if (isArtistProfile) return <ArtistProfileSkeleton />;
    if (isCollectionDetail) return <CollectionDetailSkeleton />;
    if (pathname === '/admin') return <AdminDashboardSkeleton />;
    if (pathname === '/dashboard/artist') return <ArtistWorkspaceOverviewSkeleton />;
    if (pathname === '/dashboard/buyer') return <BuyerDashboardSkeleton />;

    if (pathname === '/login' || pathname === '/register') {
        const registering = pathname === '/register';
        return (
            <Container as="div" width="reading" className="py-12" role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی فرم حساب کاربری">
                <section className="border-y border-ink bg-paper p-6 sm:p-9">
                    <Skeleton className="h-4 w-32 rounded-sm" />
                    <Skeleton className="mt-5 h-8 w-2/3 rounded-sm" />
                    <div className="mt-6 flex gap-5 border-b border-border pb-4"><Skeleton className="h-4 w-12 rounded-sm" /><Skeleton className="h-4 w-16 rounded-sm" /></div>
                    <div className="mt-6 grid gap-4">
                        {registering && <><FormFieldSkeleton /><FormFieldSkeleton /></>}
                        <FormFieldSkeleton />
                        <FormFieldSkeleton />
                        {registering && <FormFieldSkeleton />}
                        <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <Skeleton className="mt-5 h-3 w-4/5 rounded-sm" />
                </section>
            </Container>
        );
    }

    if (pathname === '/dashboard/artist/profile') {
        return (
            <Container as="div" width="wide" className="min-h-[65vh] py-10 lg:py-14" role="status" aria-live="polite" aria-busy="true" aria-label={t(label)}>
                <span className="sr-only">{t(label)}</span>
                <div className="mb-8 grid gap-3 border-b border-ink pb-6"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="h-9 w-2/3 max-w-sm rounded-sm" /><Skeleton className="h-4 w-full max-w-xl rounded-sm" /></div>
                <section className="grid gap-4 sm:grid-cols-2">
                    <FormFieldSkeleton className="sm:col-span-2" />
                    <FormFieldSkeleton className="sm:col-span-2" controlClassName="h-28" />
                    <FormFieldSkeleton />
                    <FormFieldSkeleton />
                    <FormFieldSkeleton className="sm:col-span-2" />
                    <div className="sm:col-span-2"><Skeleton className="h-5 w-48 rounded-sm" /><Skeleton className="mt-4 h-11 w-36 rounded-sm" /></div>
                </section>
            </Container>
        );
    }

    if (isMessaging) {
        return (
            <section className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden font-sans" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
                <div className="grid h-full min-h-0 w-full min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden border-y border-border bg-surface lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)]">
                    <aside className={hasRequestedConversation ? 'hidden h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e lg:flex' : 'flex h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e'}>
                        <div className="shrink-0 border-b border-border bg-paper px-4 py-4 sm:px-5">
                            <div className="flex items-start justify-between gap-3"><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-20 rounded-sm" /><Skeleton className="h-3 w-40 rounded-sm" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>
                        </div>
                        <div className="shrink-0 space-y-3 border-b border-border bg-paper px-3 py-3 sm:px-4">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <div className="grid grid-cols-3 gap-0 border-b border-border"><Skeleton className="h-10 rounded-none" /><Skeleton className="h-10 rounded-none" /><Skeleton className="h-10 rounded-none" /></div>
                        </div>
                        <ConversationInboxSkeleton count={6} announce={false} className="min-h-0 flex-1" />
                    </aside>
                    <div className={hasRequestedConversation ? 'flex h-full min-h-0 min-w-0 flex-col bg-canvas' : 'hidden h-full min-h-0 min-w-0 flex-col bg-canvas lg:flex'}>
                        {hasRequestedConversation ? <>
                            <div className="flex items-center gap-3 border-b border-border p-5"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-40 rounded-sm" /><Skeleton className="h-3 w-28 rounded-sm" /></div><Skeleton className="h-8 w-8 rounded-full" /></div>
                            <div className="border-b border-border bg-paper px-4 py-3 sm:px-5"><Skeleton className="h-3 w-28 rounded-sm" /></div>
                            <MessageHistorySkeleton count={5} announce={false} className="min-h-0 flex-1 overflow-y-auto overscroll-contain" />
                            <div className="border-t border-border bg-paper px-2.5 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-3 sm:py-2"><Skeleton className="h-12 w-full rounded-sm" /></div>
                        </> : <div className="m-auto p-8 text-center"><Skeleton className="h-4 w-56 rounded-sm" /></div>}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <Container as="div" width="wide" className="min-h-[65vh] py-10 lg:py-14" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
            <span className="sr-only">{label}</span>
            <div className="mb-8 flex items-center justify-between gap-5 border-b border-border pb-6">
                <div className="grid min-w-0 flex-1 gap-3">
                    <Skeleton className="h-3 w-24 rounded-sm" />
                    <Skeleton className="h-9 w-2/3 max-w-sm rounded-sm" />
                    <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
                </div>
                {hasHeaderAction && <Skeleton className="h-10 w-28 shrink-0 rounded-md" />}
            </div>
            {pathname === '/artworks' ? (
                <>
                    <Section bleed className="mb-7 border-y border-divider-section bg-surface-muted py-4 sm:py-5"><Container width="wide" className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
                        <Skeleton className="h-11 w-full rounded-md" /><Skeleton className="h-11 w-full rounded-md" /><Skeleton className="h-11 w-full rounded-md" />
                    </Container></Section>
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}
                    </section>
                </>
            ) : pathname === '/artists' ? (
                <>
                    <Section bleed className="rd-hero-surface mb-8 border-y border-[color:var(--rd-hero-line)] py-10"><Container width="wide" className="grid gap-4 px-6 sm:px-10">
                        <Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="h-10 w-2/3 max-w-lg rounded-sm" /><Skeleton className="h-4 w-full max-w-2xl rounded-sm" /><Skeleton className="h-11 w-full max-w-2xl rounded-md" />
                    </Container></Section>
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((item) => <ArtistCardSkeleton key={item} />)}
                    </section>
                </>
            ) : pathname === '/collections' ? (
                <CollectionCardSkeleton count={6} announce={false} />
            ) : pathname === '/admin/artworks' ? (
                <>
                    <div className="mb-6 flex flex-wrap gap-2" aria-hidden="true">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-10 w-28 rounded-sm" />)}</div>
                    <ArtworkModerationSkeleton count={4} announce={false} />
                </>
            ) : pathname === '/admin/users' ? (
                <>
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                        {[0, 1].map((item) => <div key={item} className="border border-border bg-paper p-4"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="mt-2 h-8 w-16 rounded-sm" /></div>)}
                    </div>
                    <div className="mb-6 grid gap-2 border-s-2 border-sand bg-surface-muted p-4"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div>
                    <AdminUserCardsSkeleton count={4} announce={false} />
                </>
            ) : pathname === '/admin/message-reports' ? (
                <>
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                        {[0, 1].map((item) => <div key={item} className="border border-border bg-paper p-4"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="mt-2 h-8 w-16 rounded-sm" /></div>)}
                    </div>
                    <MessageReportsSkeleton count={3} announce={false} />
                </>
            ) : pathname === '/admin/editorial' ? (
                <AdminEditorialSkeleton announce={false} />
            ) : pathname === '/dashboard/artist/artworks' || pathname === '/dashboard/artist/artworks/new' ? (
                <>
                    <section className="border border-border bg-paper p-5 sm:p-7">
                        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5"><Skeleton className="h-6 w-36 rounded-sm" /><Skeleton className="h-4 w-64 max-w-full rounded-sm" /></div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {[0, 1, 2, 3, 4, 5, 6].map((item) => <FormFieldSkeleton key={item} />)}
                            <FormFieldSkeleton className="sm:col-span-2" controlClassName="h-28" />
                            <div className="grid gap-2 sm:col-span-2"><Skeleton className="h-4 w-36 rounded-sm" /><Skeleton className="h-11 w-full rounded-sm" /><Skeleton className="h-3 w-2/3 max-w-md rounded-sm" /><Skeleton className="h-3 w-1/2 max-w-sm rounded-sm" /></div>
                            <Skeleton className="h-11 w-40 rounded-md sm:col-span-2" />
                        </div>
                    </section>
                    <section className="mt-7 space-y-4">
                        <div className="flex items-center justify-between gap-3"><Skeleton className="h-6 w-40 rounded-sm" /><Skeleton className="h-9 w-28 rounded-md" /></div>
                        <ArtworkStudioListSkeleton count={3} announce={false} />
                    </section>
                </>
            ) : /^\/(about|help|contact)$/.test(pathname) ? (
                <section className="grid gap-6">
                    {[0, 1, 2].map((item) => <div key={item} className="grid gap-3 border-b border-border pb-6"><Skeleton className="h-6 w-48 rounded-sm" /><Skeleton className="h-4 w-full rounded-sm" /><Skeleton className="h-4 w-5/6 rounded-sm" /></div>)}
                </section>
            ) : (
                <>
                    {isWorkspace && <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 w-full rounded-md" />)}</div>}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="overflow-hidden border border-border bg-paper"><Skeleton className="aspect-[3/4] w-full rounded-none" /><div className="grid gap-3 p-4"><Skeleton className="h-3 w-20 rounded-sm" /><Skeleton className="h-5 w-4/5 rounded-sm" /><Skeleton className="h-4 w-2/5 rounded-sm" /></div></div>)}
                    </div>
                </>
            )}
        </Container>
    );
}
function AuthUnavailable() {
    const { t } = useLanguage();
    const { authError, refreshUser } = useAuth();
    return (
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
            <h1 className="text-2xl font-black">{t('ارتباط با حساب کاربری برقرار نشد')}</h1>
            <p className="mt-3 text-sm leading-7 text-muted">{t(authError)}</p>
            <Button variant="ghost" type="button" onClick={refreshUser} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-bold text-inverse">{t('تلاش دوباره')}</Button>
        </div>
    );
}

export function RequireAuth({ children }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <WorkspaceAuthLoading><RouteLoading label="در حال بررسی نشست کاربری…" /></WorkspaceAuthLoading>;
    if (status === 'error') return <AuthUnavailable />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    return children ?? <Outlet />;
}

export function RequireRole({ roles, children }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <WorkspaceAuthLoading><RouteLoading label="در حال بررسی سطح دسترسی…" /></WorkspaceAuthLoading>;
    if (status === 'error') return <AuthUnavailable />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
    return children ?? <Outlet />;
}

export function DashboardIndex() {
    const { user } = useAuth();
    const target = user?.role === 'admin' ? '/admin' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist';
    return <Navigate to={target} replace />;
}

export function UnauthorizedPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    return (
        <Container as="div" width="reading" className="py-24 text-center">
            <p className="text-sm font-bold text-terracotta-strong">۴۰۳</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight" >{t('دسترسی به این بخش مجاز نیست')}</h1>
            <p className="mt-4 leading-8 text-muted">{t('نقش این حساب اجازه ورود به این فضای کاربری را ندارد. مجوزهای واقعی همچنان در سمت سرور بررسی می‌شوند.')}</p>
            <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist') : '/'} className="mt-8 inline-flex min-h-12 items-center border border-ink bg-ink px-6 py-3 font-bold text-inverse transition-colors hover:border-terracotta hover:bg-terracotta">{t('بازگشت')}</Link>
        </Container>
    );
}

export function NotFoundPage() {
    const { t } = useLanguage();
    return (
        <Container as="div" width="reading" className="py-20 text-center">
            <p className="text-sm font-bold text-terracotta-strong">۴۰۴</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight" >{t('این صفحه پیدا نشد')}</h1>
            <p className="mt-4 leading-8 text-muted">{t('نشانی واردشده معتبر نیست یا صفحه جابه‌جا شده است.')}</p>
            <Link to="/" className="mt-8 inline-flex min-h-12 items-center border border-ink bg-ink px-6 py-3 font-bold text-inverse transition-colors hover:border-terracotta hover:bg-terracotta">{t('بازگشت به صفحه اصلی')}</Link>
        </Container>
    );
}
