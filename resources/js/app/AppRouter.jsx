import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
const AdminDashboardHome = lazy(() => import('./AdminWorkspace').then((module) => ({ default: module.AdminDashboardHome })));
const AdminArtworkModeration = lazy(() => import('./AdminWorkspace').then((module) => ({ default: module.AdminArtworkModeration })));
const AdminUsersPage = lazy(() => import('./AdminWorkspace').then((module) => ({ default: module.AdminUsersPage })));

function AppRoutes() {
    return (
        <Suspense fallback={<RouteLoading />}>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/artworks" element={<ArtworkCatalogue />} />
                    <Route path="/artworks/:slug" element={<ArtworkDetailPage />} />
                    <Route path="/artists" element={<ArtistDirectoryPage />} />
                    <Route path="/artists/:slug" element={<ArtistProfilePage />} />
                    <Route path="/about" element={<PublicInfoPage page="about" />} />
                    <Route path="/help" element={<PublicInfoPage page="help" />} />
                    <Route path="/contact" element={<PublicInfoPage page="contact" />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/register" element={<AuthPage initialMode="register" />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                </Route>
                <Route path="/dashboard" element={<RequireAuth><DashboardIndex /></RequireAuth>} />
                <Route path="/dashboard/artist" element={<RequireRole roles={['artist']}><ArtistWorkspaceLayout /></RequireRole>}>
                    <Route index element={<ArtistWorkspaceOverview />} />
                    <Route path="profile" element={<ArtistProfileSettings />} />
                    <Route path="artworks" element={<ArtistArtworkPage />} />
                    <Route path="inquiries" element={<ArtistInquiryPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/dashboard/buyer" element={<RequireRole roles={['buyer']}><BuyerWorkspaceLayout /></RequireRole>}>
                    <Route index element={<BuyerDashboardHome />} />
                    <Route path="inquiries" element={<BuyerInquiryPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/admin" element={<RequireRole roles={['admin']}><AdminWorkspaceLayout /></RequireRole>}>
                    <Route index element={<AdminDashboardHome />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="artworks" element={<AdminArtworkModeration />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}

export default function App() {
    return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}
