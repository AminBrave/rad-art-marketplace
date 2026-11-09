import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { WorkspaceLayout } from './Layouts';
import ArtworkStudio from './ArtworkStudio';
import InquiryCenter from './InquiryCenter';

const emptyProfile = { display_name: '', bio: '', city: '', website_url: '', instagram_handle: '', is_public: true };

function LoadingBlock({ className = '' }) {
    return <span aria-hidden="true" className={`app-skeleton block ${className}`} />;
}

export function RouteLoading({ label = 'در حال آماده‌سازی صفحه…' }) {
    const { pathname } = useLocation();
    const isWorkspace = pathname.startsWith('/dashboard/') || pathname.startsWith('/admin');
    const isDetail = /^\/(artworks|artists)\/[^/]+/.test(pathname);
    const isForm = /login|register|profile$|artworks$/.test(pathname) && isWorkspace;

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-10 sm:px-8 lg:px-10" dir="rtl" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
            <span className="sr-only">{label}</span>
            <div className="mb-8 flex items-center justify-between gap-5 border-b border-border pb-6">
                <div className="grid min-w-0 flex-1 gap-3">
                    <LoadingBlock className="h-3 w-24" />
                    <LoadingBlock className="h-9 w-2/3 max-w-sm" />
                    <LoadingBlock className="h-4 w-full max-w-xl" />
                </div>
                {isWorkspace && <LoadingBlock className="h-10 w-28 shrink-0" />}
            </div>
            {isDetail ? (
                <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
                    <LoadingBlock className="aspect-[4/3] w-full lg:aspect-[4/5]" />
                    <div className="grid content-start gap-5 border border-border bg-paper p-6 sm:p-9">
                        <LoadingBlock className="h-4 w-24" />
                        <LoadingBlock className="h-10 w-4/5" />
                        <LoadingBlock className="h-4 w-2/5" />
                        <LoadingBlock className="mt-5 h-28 w-full" />
                        <LoadingBlock className="mt-3 h-20 w-full" />
                    </div>
                </div>
            ) : (
                <>
                    {isWorkspace && <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <LoadingBlock key={item} className="h-28 w-full" />)}</div>}
                    {isForm && <div className="mb-6 grid gap-3 sm:grid-cols-2"><LoadingBlock className="h-12 w-full" /><LoadingBlock className="h-12 w-full" /></div>}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="overflow-hidden border border-border bg-paper">
                                <LoadingBlock className="aspect-[4/3] w-full" />
                                <div className="grid gap-3 p-4">
                                    <LoadingBlock className="h-3 w-20" />
                                    <LoadingBlock className="h-5 w-4/5" />
                                    <LoadingBlock className="h-4 w-2/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}

function AuthUnavailable() {
    const { authError, refreshUser } = useAuth();
    return (
        <div className="mx-auto max-w-xl px-6 py-20 text-center" dir="rtl">
            <h1 className="text-2xl font-black">ارتباط با حساب کاربری برقرار نشد</h1>
            <p className="mt-3 text-sm leading-7 text-stone-500">{authError}</p>
            <button type="button" onClick={refreshUser} className="mt-6 rounded-full bg-[#20201e] px-5 py-3 text-sm font-bold text-white">تلاش دوباره</button>
        </div>
    );
}

export function RequireAuth({ children }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <RouteLoading label="در حال بررسی نشست کاربری…" />;
    if (status === 'error') return <AuthUnavailable />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    return children ?? <Outlet />;
}

export function RequireRole({ roles, children }) {
    const { user, status } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <RouteLoading label="در حال بررسی سطح دسترسی…" />;
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
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');

    useEffect(() => {
        let active = true;
        axios.get('/api/v1/artist-profile/me')
            .then(({ data }) => { if (active) setProfile(data.data ?? emptyProfile); })
            .catch((error) => {
                if (!active) return;
                setProfile(emptyProfile);
                setProfileError(error.response?.status === 403
                    ? 'حساب فعلی اجازه مدیریت این پروفایل را ندارد.'
                    : 'دریافت پروفایل هنرمند انجام نشد. می‌توانید دوباره تلاش کنید.');
            })
            .finally(() => { if (active) setProfileLoading(false); });
        return () => { active = false; };
    }, [user?.id]);

    const links = [
        { to: '/dashboard/artist', label: 'نمای کلی', end: true },
        { to: '/dashboard/artist/profile', label: 'پروفایل هنرمند' },
        { to: '/dashboard/artist/artworks', label: 'مدیریت آثار' },
        { to: '/dashboard/artist/inquiries', label: 'صندوق پیام‌ها' },
    ];

    return <WorkspaceLayout title="فضای هنرمند" links={links} outletContext={{ user, profile, setProfile, profileLoading, profileError }} />;
}

