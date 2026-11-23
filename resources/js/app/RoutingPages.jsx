import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { WorkspaceLayout } from './Layouts';
import { getWorkspacePrimaryLinks } from './workspaceNavigation';
import { Skeleton, ArtworkCardSkeleton, ArtworkDetailSkeleton, ArtistCardSkeleton, ArtistProfileSkeleton, AdminDashboardSkeleton, ArtistWorkspaceOverviewSkeleton, BuyerDashboardSkeleton, FormFieldSkeleton, ArtworkStudioListSkeleton, ConversationInboxSkeleton, MessageHistorySkeleton, ArtworkModerationSkeleton, AdminUserCardsSkeleton, MessageReportsSkeleton, AdminEditorialSkeleton, CollectionCardSkeleton, CollectionDetailSkeleton, HomePageSkeleton, PageHeader, WorkspaceHero, Checkbox } from '../components/ui';
const ArtworkStudio = lazy(() => import('./ArtworkStudio'));

const emptyProfile = { display_name: '', bio: '', city: '', website_url: '', instagram_handle: '', is_public: true };

function LoadingBlock({ className = '' }) {
    return <Skeleton height={null} className={className} />;
}

function WorkspaceAuthLoading({ children }) {
    const { pathname } = useLocation();
    const isMessagingRoute = pathname.endsWith('/messages');
    const navigationCount = pathname.startsWith('/admin') ? 5 : pathname.startsWith('/dashboard/buyer') ? 2 : 4;
    const navigationRows = Array.from({ length: navigationCount }, (_, index) => index);

    return (
        <div
            className={isMessagingRoute ? 'flex h-dvh flex-col overflow-hidden bg-canvas text-ink' : 'min-h-screen bg-canvas text-ink'}
            dir="rtl"
            aria-busy="true"
        >
            <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-paper shadow-soft">
                <div className="mx-auto flex min-h-[4.5rem] max-w-content items-center justify-between gap-3 px-page-gutter sm:min-h-20 sm:gap-4" aria-hidden="true">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-lg sm:h-12 sm:w-12" />
                        <div className="grid min-w-0 gap-2">
                            <Skeleton className="h-4 w-20 rounded-sm" />
                            <Skeleton className="h-3 w-28 rounded-sm" />
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <Skeleton className="hidden h-9 w-28 rounded-md lg:block" />
                        <Skeleton className="h-11 w-11 rounded-lg" />
                    </div>
                </div>
            </header>

            <div className={isMessagingRoute
                ? 'mx-auto grid h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] w-full min-h-0 min-w-0 max-w-content flex-none grid-cols-1 grid-rows-[minmax(0,1fr)] gap-0 px-page-gutter py-page-gutter sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] sm:gap-4 sm:py-4 lg:h-[calc(100dvh-5rem)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-1 lg:gap-8 lg:py-8'
                : 'mx-auto grid min-w-0 max-w-content gap-5 px-page-gutter py-5 pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] sm:py-8 sm:pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:pb-8'}>
                {isMessagingRoute ? (
                    <div className="hidden lg:block" aria-hidden="true" />
                ) : (
                    <aside className="hidden min-w-0 rounded-xl border border-border bg-paper p-3 shadow-soft lg:block" aria-hidden="true">
                        <div className="grid gap-1">
                            {navigationRows.map((item) => (
                                <div key={item} className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-2.5">
                                    <Skeleton className="h-[18px] w-[18px] shrink-0 rounded-sm" />
                                    <Skeleton className="h-3 w-28 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
                <main className={isMessagingRoute ? 'flex min-h-0 min-w-0 flex-col overflow-hidden lg:col-start-2' : 'min-w-0'}>
                    {children}
                </main>
            </div>

            {isMessagingRoute && (
                <aside className="fixed right-[max(calc((100vw_-_var(--content-width))_/_2_+_var(--page-gutter)),var(--page-gutter))] top-28 z-30 hidden h-fit max-h-[calc(100dvh_-_8rem)] w-60 overflow-hidden rounded-xl border border-border bg-paper p-3 shadow-soft lg:block" aria-hidden="true">
                    <div className="grid gap-1">{navigationRows.map((item) => <Skeleton key={item} className="h-10 w-full rounded-md" />)}</div>
                </aside>
            )}

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)] shadow-raised lg:hidden" aria-hidden="true">
                <div className="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-1 px-2">
                    {[0, 1, 2, 3].map((item) => (
                        <div key={item} className="flex flex-col items-center justify-center gap-1">
                            <Skeleton className="h-[19px] w-[19px] rounded-sm" />
                            <Skeleton className="h-2 w-10 rounded-sm" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function RouteLoading({ label = 'در حال آماده‌سازی صفحه…' }) {
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
            <main className="mx-auto max-w-xl px-5 py-12 sm:px-8" dir="rtl" role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی فرم حساب کاربری">
                <section className="rounded-3xl border border-border-strong bg-paper p-6 shadow-sm sm:p-9">
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
            </main>
        );
    }

    if (pathname === '/dashboard/artist/profile') {
        return (
            <div className="mx-auto min-h-[65vh] max-w-7xl px-5 py-10 sm:px-8 lg:px-10" dir="rtl" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
                <span className="sr-only">{label}</span>
                <div className="mb-8 grid gap-3 border-b border-border pb-6"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="h-9 w-2/3 max-w-sm rounded-sm" /><Skeleton className="h-4 w-full max-w-xl rounded-sm" /></div>
                <section className="grid gap-4 sm:grid-cols-2">
                    <FormFieldSkeleton className="sm:col-span-2" />
                    <FormFieldSkeleton className="sm:col-span-2" controlClassName="h-28" />
                    <FormFieldSkeleton />
                    <FormFieldSkeleton />
                    <FormFieldSkeleton className="sm:col-span-2" />
                    <div className="sm:col-span-2"><Skeleton className="h-5 w-48 rounded-sm" /><Skeleton className="mt-4 h-11 w-36 rounded-sm" /></div>
                </section>
            </div>
        );
    }

    if (isMessaging) {
        return (
            <section className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden font-sans" dir="rtl" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
                <div className="grid h-full min-h-0 w-full min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-surface shadow-soft lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)]">
                    <aside className={hasRequestedConversation ? 'hidden h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e lg:flex' : 'flex h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e'}>
                        <div className="shrink-0 border-b border-border bg-paper px-3 py-2.5">
                            <div className="flex items-start justify-between gap-3"><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-20 rounded-sm" /><Skeleton className="h-3 w-40 rounded-sm" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>
                        </div>
                        <div className="shrink-0 space-y-2 border-b border-border bg-surface-muted p-2.5">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-md border border-border"><Skeleton className="h-10 rounded-none" /><Skeleton className="h-10 rounded-none" /><Skeleton className="h-10 rounded-none" /></div>
                        </div>
                        <ConversationInboxSkeleton count={6} announce={false} className="min-h-0 flex-1" />
                    </aside>
                    <div className={hasRequestedConversation ? 'flex h-full min-h-0 min-w-0 flex-col bg-canvas' : 'hidden h-full min-h-0 min-w-0 flex-col bg-canvas lg:flex'}>
                        {hasRequestedConversation ? <>
                            <div className="flex items-center gap-3 border-b border-border p-5"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-40 rounded-sm" /><Skeleton className="h-3 w-28 rounded-sm" /></div><Skeleton className="h-8 w-8 rounded-full" /></div>
                            <div className="border-b border-border bg-surface-muted px-5 py-3"><Skeleton className="h-3 w-28 rounded-sm" /></div>
                            <MessageHistorySkeleton count={5} announce={false} className="min-h-0 flex-1 overflow-y-auto overscroll-contain" />
                            <div className="border-t border-border p-5"><Skeleton className="h-12 w-full rounded-full" /></div>
                        </> : <div className="m-auto p-8 text-center"><Skeleton className="h-4 w-56 rounded-sm" /></div>}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="mx-auto min-h-[65vh] max-w-7xl px-5 py-10 sm:px-8 lg:px-10" dir="rtl" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
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
                    <section className="mb-7 grid gap-3 border border-border bg-surface-muted p-4 sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] sm:p-5">
                        <Skeleton className="h-11 w-full rounded-md" /><Skeleton className="h-11 w-full rounded-md" /><Skeleton className="h-11 w-full rounded-md" />
                    </section>
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}
                    </section>
                </>
            ) : pathname === '/artists' ? (
                <>
                    <section className="mb-8 grid gap-4 border-y border-border bg-surface-muted px-6 py-10 sm:px-10">
                        <Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="h-10 w-2/3 max-w-lg rounded-sm" /><Skeleton className="h-4 w-full max-w-2xl rounded-sm" /><Skeleton className="h-11 w-full max-w-2xl rounded-md" />
                    </section>
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((item) => <ArtistCardSkeleton key={item} />)}
                    </section>
                </>
            ) : pathname === '/collections' ? (
                <CollectionCardSkeleton count={6} announce={false} />
            ) : pathname === '/admin/artworks' ? (
                <>
                    <div className="mb-6 flex flex-wrap gap-2" aria-hidden="true">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-10 w-28 rounded-full" />)}</div>
                    <ArtworkModerationSkeleton count={4} announce={false} />
                </>
            ) : pathname === '/admin/users' ? (
                <>
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                        {[0, 1].map((item) => <div key={item} className="border border-border bg-paper p-4"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="mt-2 h-8 w-16 rounded-sm" /></div>)}
                    </div>
                    <div className="mb-6 grid gap-2 border-s-2 border-line bg-surface-muted p-4"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div>
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
            ) : pathname === '/dashboard/artist/artworks' ? (
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
                        {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="overflow-hidden border border-border bg-paper"><Skeleton className="aspect-[4/3] w-full rounded-none" /><div className="grid gap-3 p-4"><Skeleton className="h-3 w-20 rounded-sm" /><Skeleton className="h-5 w-4/5 rounded-sm" /><Skeleton className="h-4 w-2/5 rounded-sm" /></div></div>)}
                    </div>
                </>
            )}
        </div>
    );
}
function AuthUnavailable() {
    const { authError, refreshUser } = useAuth();
    return (
        <div className="mx-auto max-w-xl px-6 py-20 text-center" dir="rtl">
            <h1 className="text-2xl font-black">ارتباط با حساب کاربری برقرار نشد</h1>
            <p className="mt-3 text-sm leading-7 text-muted">{authError}</p>
            <button type="button" onClick={refreshUser} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-bold text-inverse">تلاش دوباره</button>
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
    const { user, profile, profileLoading, profileError } = useOutletContext();
    return (
        <section className="space-y-6" dir="rtl">
            <WorkspaceHero
                eyebrow="فضای هنرمند"
                title={<>خوش آمدید، {user.name}</>}
                description="پروفایل و آثار ارسالی خود را مدیریت کنید و از بخش پیام‌های مستقیم با خریداران در ارتباط باشید."
            />
            {profileError && <p role="alert" className="mt-5 text-sm text-warning">{profileError}</p>}
            {profileLoading ? <p className="mt-5 text-sm text-muted">در حال دریافت پروفایل…</p> : (
                <div className="mt-6 rounded-xl bg-canvas p-4">
                    <p className="font-semibold">{profile?.slug ? 'پروفایل هنرمند شما آماده است.' : 'برای شروع، پروفایل هنرمند خود را تکمیل کنید.'}</p>
                    <Link to="/dashboard/artist/profile" className="mt-3 inline-block text-sm font-bold text-accent-strong underline">مدیریت پروفایل</Link>
                </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/dashboard/artist/artworks" className="rounded-xl border border-border p-5 font-bold hover:border-accent">مدیریت آثار</Link>
                <Link to="/dashboard/artist/messages" className="rounded-xl border border-border p-5 font-bold hover:border-accent">پیام‌های مستقیم</Link>
            </div>
        </section>
    );
}

export function ArtistProfileSettings() {
    const { profile, setProfile, profileLoading, profileError } = useOutletContext();
    const [form, setForm] = useState(emptyProfile);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const savingRef = useRef(false);
    const profileMutation = useMutation({
        mutationKey: ['artist-profile', 'update'],
        mutationFn: (nextProfile) => axios.put('/api/v1/artist-profile/me', nextProfile),
    });
    const busy = profileMutation.isPending;

    useEffect(() => {
        if (profile) setForm({ ...emptyProfile, ...profile });
    }, [profile]);

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
            const { data } = await profileMutation.mutateAsync(form);
            setProfile(data.data);
            setForm({ ...emptyProfile, ...data.data });
            setMessage(data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                setMessage('لطفاً خطاهای فرم را بررسی کنید.');
            } else if (error.response?.status === 403) {
                setMessage('این عملیات از سمت سرور مجاز شناخته نشد.');
            } else {
                setMessage('ذخیره پروفایل انجام نشد. دوباره تلاش کنید.');
            }
        } finally {
            savingRef.current = false;
        }
    };

    if (profileLoading) return <RouteLoading label="در حال دریافت پروفایل هنرمند…" />;

    return (
        <section className="space-y-6" dir="rtl">
            <PageHeader
                eyebrow="استودیوی هنرمند"
                title="پروفایل هنرمند"
                description="اطلاعات معرفی و وضعیت نمایش عمومی پروفایل خود را مدیریت کنید."
            />
            {profileError && <p role="alert" className="mt-4 text-sm text-warning">{profileError}</p>}
            <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">نام نمایشی
                    <input name="display_name" value={form.display_name ?? ''} onChange={update} required maxLength="120" className="mt-2 w-full rounded-xl border border-border-strong bg-paper px-4 py-3" />
                    {errors.display_name?.map((item) => <span key={item} className="mt-1 block text-xs text-danger">{item}</span>)}
                </label>
                <label className="text-sm font-semibold sm:col-span-2">درباره هنرمند
                    <textarea name="bio" value={form.bio ?? ''} onChange={update} rows="4" maxLength="2000" className="mt-2 w-full rounded-xl border border-border-strong bg-paper px-4 py-3 leading-7" />
                    {errors.bio?.map((item) => <span key={item} className="mt-1 block text-xs text-danger">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">شهر
                    <input name="city" value={form.city ?? ''} onChange={update} maxLength="120" className="mt-2 w-full rounded-xl border border-border-strong bg-paper px-4 py-3" />
                    {errors.city?.map((item) => <span key={item} className="mt-1 block text-xs text-danger">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">شناسه اینستاگرام
                    <input name="instagram_handle" value={form.instagram_handle ?? ''} onChange={update} maxLength="30" dir="ltr" className="mt-2 w-full rounded-xl border border-border-strong bg-paper px-4 py-3 text-left" />
                    {errors.instagram_handle?.map((item) => <span key={item} className="mt-1 block text-xs text-danger">{item}</span>)}
                </label>
                <label className="text-sm font-semibold sm:col-span-2">وب‌سایت
                    <input name="website_url" type="url" value={form.website_url ?? ''} onChange={update} dir="ltr" className="mt-2 w-full rounded-xl border border-border-strong bg-paper px-4 py-3 text-left placeholder:text-muted" placeholder="https://example.com" />
                    {errors.website_url?.map((item) => <span key={item} className="mt-1 block text-xs text-danger">{item}</span>)}
                </label>
                <Checkbox name="is_public" checked={Boolean(form.is_public)} onChange={update} className="flex min-h-11 items-center gap-3 text-sm font-semibold sm:col-span-2">
                    نمایش عمومی پروفایل
                </Checkbox>
                <div className="sm:col-span-2">
                    <button disabled={busy} className="rounded-xl bg-ink px-6 py-3 font-bold text-inverse disabled:opacity-60">{busy ? 'در حال ذخیره…' : 'ذخیره پروفایل'}</button>
                    {profile?.slug && <Link to={'/artists/' + profile.slug} className="mr-4 text-sm font-semibold text-accent-strong underline">{profile.is_public ? 'پیش‌نمایش پروفایل عمومی' : 'پیش‌نمایش خصوصی پروفایل'}</Link>}
                    {profile?.slug && !profile.is_public && <p className="mt-3 text-xs leading-6 text-muted sm:col-span-2">این پیش‌نمایش فقط برای شما و مدیران مجاز قابل مشاهده است؛ بازدیدکنندگان عمومی به پروفایل خصوصی دسترسی ندارند.</p>}
                    <p className="mt-2 text-xs text-muted sm:col-span-2">{(form.bio?.length ?? 0).toLocaleString('fa-IR')} از ۲۰۰۰ نویسه برای معرفی هنری استفاده شده است.</p>
                </div>
            </form>
            {message && <p role="status" className="mt-4 text-sm text-muted">{message}</p>}
        </section>
    );
}

export function ArtistArtworkPage() {
    const { user, profile, profileLoading } = useOutletContext();
    if (profileLoading) return <RouteLoading label="در حال آماده‌سازی فضای آثار…" />;
    return <Suspense fallback={<RouteLoading label="در حال آماده‌سازی فضای آثار…" />}><ArtworkStudio user={user} hasProfile={Boolean(profile?.slug)} /></Suspense>;
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
    return (
        <main className="mx-auto max-w-4xl px-6 py-16 sm:px-8" dir="rtl">
            <p className="text-sm font-bold text-accent-strong">راد آرت</p>
            <h1 className="mt-3 text-3xl font-black">{title}</h1>
            <p className="mt-5 leading-8 text-muted">{description}</p>
            <p className="mt-6 rounded-xl border border-border bg-paper p-5 text-sm text-muted">این صفحه در نقشه مسیرهای MVP 2 ثبت شده و محتوای کامل آن در مرحله محتوای عمومی تکمیل می‌شود.</p>
        </main>
    );
}

export function UnauthorizedPage() {
    const { user } = useAuth();
    return (
        <main className="mx-auto max-w-2xl px-6 py-20 text-center" dir="rtl">
            <p className="text-sm font-bold text-accent-strong">۴۰۳</p>
            <h1 className="mt-3 text-3xl font-black">دسترسی به این بخش مجاز نیست</h1>
            <p className="mt-4 leading-8 text-muted">نقش این حساب اجازه ورود به این فضای کاربری را ندارد. مجوزهای واقعی همچنان در سمت سرور بررسی می‌شوند.</p>
            <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist') : '/'} className="mt-7 inline-block rounded-full bg-ink px-6 py-3 font-bold text-inverse">بازگشت</Link>
        </main>
    );
}

export function NotFoundPage() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-20 text-center" dir="rtl">
            <p className="text-sm font-bold text-accent-strong">۴۰۴</p>
            <h1 className="mt-3 text-3xl font-black">این صفحه پیدا نشد</h1>
            <p className="mt-4 leading-8 text-muted">نشانی واردشده معتبر نیست یا صفحه جابه‌جا شده است.</p>
            <Link to="/" className="mt-7 inline-block rounded-full bg-ink px-6 py-3 font-bold text-inverse">بازگشت به صفحه اصلی</Link>
        </main>
    );
}