import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './useTheme';
import { WorkspaceLayout } from './Layouts';
import { getWorkspacePrimaryLinks } from './workspaceNavigation';
import { Skeleton, ArtworkCardSkeleton, ArtworkDetailSkeleton, ArtistCardSkeleton, ArtistProfileSkeleton, AdminDashboardSkeleton, ArtistWorkspaceOverviewSkeleton, BuyerDashboardSkeleton, FormFieldSkeleton, ArtworkStudioListSkeleton, ConversationInboxSkeleton, MessageHistorySkeleton, ArtworkModerationSkeleton, AdminUserCardsSkeleton, MessageReportsSkeleton, AdminEditorialSkeleton, CollectionCardSkeleton, CollectionDetailSkeleton, HomePageSkeleton, PageHeader, SectionHeader, WorkspaceHero, Checkbox, FormField, TextInput, TextareaField, Button, Container, Section, FileInput, MediaImage } from '../components/ui';
const ArtworkStudio = lazy(() => import('./ArtworkStudio'));

const emptyProfile = { display_name: '', display_name_en: '', bio: '', bio_en: '', city: '', city_en: '', website_url: '', instagram_handle: '', is_public: true };


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
            <Container as="div" width="reading" className="py-page" role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی فرم حساب کاربری">
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
            <Container as="div" width="wide" className="min-h-[65vh] py-section-compact lg:py-section-regular" role="status" aria-live="polite" aria-busy="true" aria-label={t(label)}>
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
        <Container as="div" width="wide" className="min-h-[65vh] py-section-compact lg:py-section-regular" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
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
        <div className="mx-auto max-w-xl px-page-gutter py-section-relaxed text-center">
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

export function ArtistWorkspaceLayout() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const profileKey = ['artist-profile', 'me', user?.id];
    const profileQuery = useQuery({
        queryKey: profileKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artist-profile/me', { signal });
            return data.data ?? emptyProfile;
        },
        enabled: Boolean(user?.id),
        staleTime: 60_000,
    });
    const profile = profileQuery.data ?? (profileQuery.isError ? emptyProfile : null);
    const profileLoading = profileQuery.isPending;
    const profileError = profileQuery.isError
        ? (profileQuery.error?.response?.status === 403
            ? 'حساب فعلی اجازه مدیریت این پروفایل را ندارد.'
            : 'دریافت پروفایل هنرمند انجام نشد. می‌توانید دوباره تلاش کنید.')
        : '';
    const setProfile = (nextProfile) => queryClient.setQueryData(profileKey, nextProfile);

    const links = getWorkspacePrimaryLinks('artist');

    return <WorkspaceLayout title="فضای هنرمند" links={links} outletContext={{ user, profile, setProfile, profileLoading, profileError }} />;
}

export function ArtistDashboardHome() {
    const { t } = useLanguage();
    const { user, profile, profileLoading, profileError } = useOutletContext();
    return (
        <div className="w-full space-y-6">
            <WorkspaceHero
                eyebrow={t('فضای هنرمند')}
                title={<>{t('خوش آمدید، ')}{user.name}</>}
                description={t('پروفایل و آثار ارسالی خود را مدیریت کنید و از بخش پیام‌های مستقیم با خریداران در ارتباط باشید.')}
            />
            <Container width="wide" className="space-y-6">
            {profileError && <p role="alert" className="mt-5 text-sm text-warning">{t(profileError)}</p>}
            {profileLoading ? <p className="mt-5 text-sm text-muted">{t('در حال دریافت پروفایل…')}</p> : (
                <div className="mt-6 rounded-xl bg-canvas p-4">
                    <p className="font-semibold">{t(profile?.slug ? 'پروفایل هنرمند شما آماده است.' : 'برای شروع، پروفایل هنرمند خود را تکمیل کنید.')}</p>
                    <Link to="/dashboard/artist/profile" className="mt-3 inline-block text-sm font-bold text-terracotta-strong underline">{t('مدیریت پروفایل')}</Link>
                </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/dashboard/artist/artworks" className="rounded-xl border border-border p-5 font-bold hover:border-terracotta">{t('مدیریت آثار')}</Link>
                <Link to="/dashboard/artist/messages" className="rounded-xl border border-border p-5 font-bold hover:border-terracotta">{t('پیام‌های مستقیم')}</Link>
            </div>
            </Container>
        </div>
    );
}


export function WorkspaceSettingsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { theme, cycleTheme } = useTheme();
    const queryClient = useQueryClient();
    const preferenceKey = ['notifications', user?.id, 'preferences'];
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
        enabled: Boolean(user?.id) && user?.role !== 'admin',
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
    const preferences = preferencesQuery.data ?? {
        in_app_messages: true, in_app_follows: true, in_app_artwork_likes: true,
        in_app_artwork_comments: true, in_app_comment_replies: true,
    };
    const preferenceOptions = [
        ['in_app_messages', t('پیام‌های جدید'), t('هنگامی که پیام تازه‌ای در فضای کاربری دریافت می‌کنید')],
        ['in_app_follows', t('دنبال‌کننده‌های تازه'), t('هنگامی که کاربری شما را دنبال می‌کند')],
        ['in_app_artwork_likes', t('پسندیدن آثار'), t('هنگامی که کسی یکی از آثار شما را می‌پسندد')],
        ['in_app_artwork_comments', t('دیدگاه‌های آثار'), t('هنگامی که کسی درباره یکی از آثار شما دیدگاه می‌نویسد')],
        ['in_app_comment_replies', t('پاسخ به دیدگاه‌ها'), t('هنگامی که کسی به دیدگاه شما پاسخ می‌دهد')],
    ];
    const [error, setError] = useState('');
    const changePreference = async (key, enabled) => {
        setError('');
        try {
            await updatePreference.mutateAsync({ key, enabled });
        } catch {
            setError(t('ذخیره تنظیمات انجام نشد. دوباره تلاش کنید.'));
        }
    };

    return (
        <Container as="section" width="wide" className="space-y-content">
            <PageHeader bleed={false} eyebrow={t('حساب کاربری')} title={t('تنظیمات')} description={t('ترجیحات نمایش و اعلان‌های فضای کاربری را از یک بخش مدیریت کنید.')} />

            <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]" aria-labelledby="appearance-settings-title">
                <div className="min-w-0 border border-divider-group bg-paper p-5 sm:p-6">
                    <SectionHeader id="appearance-settings-title" eyebrow={t('نمایش')} title={t('پوسته محیط کاربری')} description={t('ظاهر راد آرت را با نور محیط یا ترجیح خود هماهنگ کنید.')} />
                </div>
                <div className="flex flex-col justify-center gap-3 border border-divider-group bg-surface-muted p-5">
                    <div>
                        <p className="text-[11px] font-semibold text-muted">{t('حالت فعلی')}</p>
                        <p className="mt-1 text-sm font-bold text-ink">{t(theme === 'dark' ? 'تیره' : theme === 'light' ? 'روشن' : 'هماهنگ با دستگاه')}</p>
                    </div>
                    <Button type="button" variant="outline" onClick={cycleTheme}>{t('تغییر پوسته')}</Button>
                </div>
            </section>

            {user?.role !== 'admin' && (
                <section className="space-y-4" aria-labelledby="notification-settings-title">
                    <SectionHeader
                        id="notification-settings-title"
                        eyebrow={t('اعلان‌ها')}
                        title={t('اعلان‌های درون‌برنامه‌ای')}
                        description={t('رویدادهایی را که می‌خواهید در صندوق اعلان‌ها ببینید انتخاب کنید.')}
                        actions={<span className="text-[11px] font-semibold text-muted">{updatePreference.isPending ? 'در حال ذخیره…' : t('ذخیره خودکار')}</span>}
                    />
                    {preferencesQuery.isError ? <p role="alert" className="text-sm text-danger">{t('دریافت تنظیمات اعلان‌ها انجام نشد. صفحه را دوباره بارگذاری کنید.')}</p> : preferencesQuery.isPending ? <p className="text-sm text-muted">{t('در حال دریافت تنظیمات…')}</p> : (
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {preferenceOptions.map(([key, label, description]) => (
                                <Checkbox
                                    key={key}
                                    checked={Boolean(preferences[key])}
                                    disabled={updatePreference.isPending || preferencesQuery.isPending || preferencesQuery.isError}
                                    onChange={(event) => changePreference(key, event.target.checked)}
                                    className="flex min-h-24 w-full items-start gap-3 border border-divider-group bg-paper p-4 text-sm leading-6 transition-colors hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                >
                                    <span className="min-w-0 flex-1">
                                        <strong className="block font-bold text-ink">{label}</strong>
                                        <span className="mt-1 block text-xs leading-6 text-muted">{description}</span>
                                    </span>
                                </Checkbox>
                            ))}
                        </div>
                    )}
                    <p className="text-xs leading-6 text-muted">{t('اعلان ایمیلی و پیامکی در این نسخه غیرفعال است.')}</p>
                </section>
            )}
            {error && <p role="alert" className="text-sm text-danger">{t(error)}</p>}
        </Container>
    );
}

export function ArtistProfileSettings() {
    const { t, locale } = useLanguage();
    const { profile, setProfile, profileLoading, profileError } = useOutletContext();
    const [form, setForm] = useState(emptyProfile);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarError, setAvatarError] = useState('');
    const savingRef = useRef(false);
    const profileMutation = useMutation({
        mutationKey: ['artist-profile', 'update'],
        mutationFn: (nextProfile) => axios.post('/api/v1/artist-profile/me', nextProfile),
    });
    const busy = profileMutation.isPending;

    useEffect(() => {
        if (profile) setForm({ ...emptyProfile, ...profile });
    }, [profile]);

    useEffect(() => () => { if (avatarPreview.startsWith('blob:')) window.URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

    const chooseAvatar = (event) => {
        const file = event.target.files?.[0] ?? null;
        setAvatarError('');
        if (!file) { setAvatar(null); setAvatarPreview(''); return; }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
            setAvatarError(t('تصویر باید JPG، PNG یا WebP و حداکثر ۲ مگابایت باشد.'));
            event.target.value = ''; setAvatar(null); setAvatarPreview(''); return;
        }
        setAvatar(file); setAvatarPreview(window.URL.createObjectURL(file));
    };

    const update = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const save = async (event) => {
        event.preventDefault();
        if (savingRef.current) return;
        savingRef.current = true;
        setErrors({});
        setMessage('');
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => payload.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : (value ?? '')));
            if (avatar) payload.append('avatar', avatar);
            payload.append('_method', 'PUT');
            const { data } = await profileMutation.mutateAsync(payload);
            setProfile(data.data);
            setForm({ ...emptyProfile, ...data.data });
            setAvatar(null); setAvatarPreview('');
            setMessage(t(data.message));
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                setMessage(t('لطفاً خطاهای فرم را بررسی کنید.'));
            } else if (error.response?.status === 403) {
                setMessage(t('این عملیات از سمت سرور مجاز شناخته نشد.'));
            } else {
                setMessage(t('ذخیره پروفایل انجام نشد. دوباره تلاش کنید.'));
            }
        } finally {
            savingRef.current = false;
        }
    };

    if (profileLoading) return <RouteLoading label={t("در حال دریافت پروفایل هنرمند…")} />;

    return (
        <Container as="section" width="wide" className="space-y-workspace">
            <PageHeader bleed={false}
                eyebrow={t("استودیوی هنرمند")}
                title={t("پروفایل هنرمند")}
                description={t("اطلاعات معرفی و وضعیت نمایش عمومی پروفایل خود را مدیریت کنید.")}
            />
            {profileError && <p role="alert" className="mt-4 text-sm text-warning">{t(profileError)}</p>}
            <form onSubmit={save} encType="multipart/form-data" className="mt-6 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
                <div className="sm:col-span-2 flex flex-wrap items-center gap-5 border-b border-divider-group pb-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-surface-muted">{(avatarPreview || profile?.avatar_url) ? <MediaImage src={avatarPreview || profile.avatar_url} alt={t("تصویر نمایه هنرمند")} className="h-full w-full" imageClassName="object-cover" loading="eager" /> : <div className="grid h-full w-full place-items-center text-3xl font-black text-terracotta-strong">{(profile?.display_name || "ه").slice(0, 1)}</div>}</div>
                    <div className="min-w-0 flex-1"><label htmlFor="artist-avatar" className="mb-2 block text-sm font-semibold text-ink">{t("تصویر نمایه هنرمند")}</label><FileInput id="artist-avatar" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={chooseAvatar} className="bg-canvas px-3 py-3 file:ms-3" aria-describedby="artist-avatar-help" /><p id="artist-avatar-help" className="mt-2 text-xs leading-6 text-muted">{t("JPG، PNG یا WebP؛ حداکثر ۲ مگابایت. تصویر در پروفایل عمومی شما نمایش داده می‌شود.")}</p>{avatarError && <p role="alert" className="mt-1 text-xs text-danger">{avatarError}</p>}</div>
                </div>
                <FormField label={t("نام نمایشی")} required error={errors.display_name?.map(t).join(' ')}><TextInput name="display_name" value={form.display_name ?? ''} onChange={update} required maxLength="120" /></FormField>
                <FormField label={t("نام هنری به انگلیسی")} error={errors.display_name_en?.map(t).join(' ')}><TextInput name="display_name_en" value={form.display_name_en ?? ''} onChange={update} maxLength="120" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("درباره هنرمند")} error={errors.bio?.map(t).join(' ')} className="sm:col-span-2"><TextareaField name="bio" value={form.bio ?? ''} onChange={update} rows={4} maxLength="2000" /></FormField>
                <FormField label={t("درباره هنرمند به انگلیسی")} error={errors.bio_en?.map(t).join(' ')} className="sm:col-span-2"><TextareaField name="bio_en" value={form.bio_en ?? ''} onChange={update} rows={4} maxLength="2000" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("شهر")} error={errors.city?.map(t).join(' ')}><TextInput name="city" value={form.city ?? ''} onChange={update} maxLength="120" /></FormField>
                <FormField label={t("شهر به انگلیسی")} error={errors.city_en?.map(t).join(' ')}><TextInput name="city_en" value={form.city_en ?? ''} onChange={update} maxLength="120" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("شناسه اینستاگرام")} error={errors.instagram_handle?.map(t).join(' ')}><TextInput name="instagram_handle" value={form.instagram_handle ?? ''} onChange={update} maxLength="30" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("وب‌سایت")} error={errors.website_url?.map(t).join(' ')} className="sm:col-span-2"><TextInput name="website_url" type="url" value={form.website_url ?? ''} onChange={update} dir="ltr" className="text-start" placeholder="https://example.com" /></FormField>
                <Checkbox name="is_public" checked={Boolean(form.is_public)} onChange={update} className="flex min-h-11 items-center gap-3 text-sm font-semibold sm:col-span-2">{t("نمایش عمومی پروفایل")}</Checkbox>
                <div className="sm:col-span-2">
                    <Button type="submit" disabled={busy || Boolean(avatarError)} loading={busy}>{busy ? t('در حال ذخیره…') : t('ذخیره پروفایل')}</Button>
                    {profile?.slug && <Link to={'/artists/' + profile.slug} className="ms-4 text-sm font-semibold text-terracotta-strong underline">{t(profile.is_public ? 'پیش‌نمایش پروفایل عمومی' : 'پیش‌نمایش خصوصی پروفایل')}</Link>}
                    {profile?.slug && !profile.is_public && <p className="mt-3 text-xs leading-6 text-muted sm:col-span-2">{t("این پیش‌نمایش فقط برای شما و مدیران مجاز قابل مشاهده است؛ بازدیدکنندگان عمومی به پروفایل خصوصی دسترسی ندارند.")}</p>}
                    <p className="mt-2 text-xs text-muted sm:col-span-2">{(form.bio?.length ?? 0).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('از ۲۰۰۰ نویسه برای معرفی هنری استفاده شده است.')}</p>
                </div>
            </form>
            {message && <p role="status" className="mt-4 text-sm text-muted">{t(message)}</p>}
        </Container>
    );
}

export function ArtistArtworkPage({ initialCreate = false }) {
    const { user, profile, profileLoading } = useOutletContext();
    if (profileLoading) return <RouteLoading label="در حال آماده‌سازی فضای آثار…" />;
    return <Suspense fallback={<RouteLoading label="در حال آماده‌سازی فضای آثار…" />}><ArtworkStudio user={user} hasProfile={Boolean(profile?.slug)} initialCreate={initialCreate} /></Suspense>;
}


export function BuyerWorkspaceLayout() {
    const { user } = useAuth();
    const links = getWorkspacePrimaryLinks('buyer');
    return <WorkspaceLayout title="فضای خریدار" links={links} outletContext={{ user }} />;
}

export function AdminWorkspaceLayout() {
    const links = getWorkspacePrimaryLinks('admin');
    return <WorkspaceLayout title="پنل مدیریت" links={links} />;
}

export function PublicInfoPage({ title, description }) {
    const { t } = useLanguage();
    return (
        <Container as="div" width="reading" className="py-section">
            <p className="text-sm font-bold text-terracotta-strong">راد آرت</p>
            <h1 className="mt-3 text-3xl font-black">{t(title)}</h1>
            <p className="mt-5 leading-8 text-muted">{t(description)}</p>
            <p className="mt-6 border-y border-border bg-surface-muted px-5 py-5 text-sm text-muted">{t('این صفحه در نقشه مسیرهای MVP 2 ثبت شده و محتوای کامل آن در مرحله محتوای عمومی تکمیل می‌شود.')}</p>
        </Container>
    );
}

export function UnauthorizedPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    return (
        <Container as="div" width="reading" className="py-section-wide text-center">
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
        <Container as="div" width="reading" className="py-section-relaxed text-center">
            <p className="text-sm font-bold text-terracotta-strong">۴۰۴</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight" >{t('این صفحه پیدا نشد')}</h1>
            <p className="mt-4 leading-8 text-muted">{t('نشانی واردشده معتبر نیست یا صفحه جابه‌جا شده است.')}</p>
            <Link to="/" className="mt-8 inline-flex min-h-12 items-center border border-ink bg-ink px-6 py-3 font-bold text-inverse transition-colors hover:border-terracotta hover:bg-terracotta">{t('بازگشت به صفحه اصلی')}</Link>
        </Container>
    );
}