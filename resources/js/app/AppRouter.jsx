import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { PublicLayout } from './Layouts';
import {
    AdminWorkspaceLayout, ArtistArtworkPage,
    ArtistInquiryPage, ArtistProfileSettings, ArtistWorkspaceLayout,
    BuyerWorkspaceLayout, DashboardIndex,
    NotFoundPage, RequireAuth, RequireRole, RouteLoading, UnauthorizedPage,
} from './RoutingPages';

// Keep the shared router and auth boundary eager, but defer feature screens until their route is visited.
const HomePage = lazy(() => import('./HomePage'));
const ArtworkCatalogue = lazy(() => import('./ArtworkCatalogue'));
const ArtworkDetailPage = lazy(() => import('./ArtworkDetailPage'));
const ArtistProfilePage = lazy(() => import('./ArtistProfilePage'));
const ArtistDirectoryPage = lazy(() => import('./ArtistDirectoryPage'));
const PublicInfoPage = lazy(() => import('./PublicInfoPages'));
const AuthPage = lazy(() => import('./AuthPage'));
const ArtistWorkspaceOverview = lazy(() => import('./ArtistWorkspaceOverview'));
const BuyerDashboardHome = lazy(() => import('./BuyerWorkspace').then((module) => ({ default: module.BuyerDashboardHome })));
const BuyerInquiryPage = lazy(() => import('./BuyerWorkspace').then((module) => ({ default: module.BuyerInquiryPage })));
const BuyerInquiryDetailPage = lazy(() => import('./BuyerWorkspace').then((module) => ({ default: module.BuyerInquiryDetailPage })));
const AdminDashboardHome = lazy(() => import('./AdminWorkspace').then((module) => ({ default: module.AdminDashboardHome })));
const AdminArtworkModeration = lazy(() => import('./AdminWorkspace').then((module) => ({ default: module.AdminArtworkModeration })));
const AdminUsersPage = lazy(() => import('./AdminWorkspace').then((module) => ({ default: module.AdminUsersPage })));

function withRouteFallback(element) {
    return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

function RouteScrollRestoration() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
            return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash]);

    return null;
}

function AppRoutes() {
    return (
        <>
            <RouteScrollRestoration />
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={withRouteFallback(<HomePage />)} />
                    <Route path="/artworks" element={withRouteFallback(<ArtworkCatalogue />)} />
                    <Route path="/artworks/:slug" element={withRouteFallback(<ArtworkDetailPage />)} />
                    <Route path="/artists" element={withRouteFallback(<ArtistDirectoryPage />)} />
                    <Route path="/artists/:slug" element={withRouteFallback(<ArtistProfilePage />)} />
                    <Route path="/about" element={withRouteFallback(<PublicInfoPage page="about" />)} />
                    <Route path="/help" element={withRouteFallback(<PublicInfoPage page="help" />)} />
                    <Route path="/contact" element={withRouteFallback(<PublicInfoPage page="contact" />)} />
                    <Route path="/login" element={withRouteFallback(<AuthPage />)} />
                    <Route path="/register" element={withRouteFallback(<AuthPage initialMode="register" />)} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                </Route>
                <Route path="/dashboard" element={<RequireAuth><DashboardIndex /></RequireAuth>} />
                <Route path="/dashboard/artist" element={<RequireRole roles={['artist']}><ArtistWorkspaceLayout /></RequireRole>}>
                    <Route index element={withRouteFallback(<ArtistWorkspaceOverview />)} />
                    <Route path="profile" element={<ArtistProfileSettings />} />
                    <Route path="artworks" element={<ArtistArtworkPage />} />
                    <Route path="inquiries" element={<ArtistInquiryPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/dashboard/buyer" element={<RequireRole roles={['buyer']}><BuyerWorkspaceLayout /></RequireRole>}>
                    <Route index element={withRouteFallback(<BuyerDashboardHome />)} />
                    <Route path="inquiries" element={withRouteFallback(<BuyerInquiryPage />)} />
                    <Route path="inquiries/:id" element={withRouteFallback(<BuyerInquiryDetailPage />)} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/admin" element={<RequireRole roles={['admin']}><AdminWorkspaceLayout /></RequireRole>}>
                    <Route index element={withRouteFallback(<AdminDashboardHome />)} />
                    <Route path="users" element={withRouteFallback(<AdminUsersPage />)} />
                    <Route path="artworks" element={withRouteFallback(<AdminArtworkModeration />)} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
}

export default function App() {
    return <AuthProvider><BrowserRouter future={{ v7_relativeSplatPath: true }}><AppRoutes /></BrowserRouter></AuthProvider>;
}
