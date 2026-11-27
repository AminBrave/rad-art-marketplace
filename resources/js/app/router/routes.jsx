import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { ArtistWorkspaceLayout } from '../layouts/ArtistLayout';
import { BuyerWorkspaceLayout } from '../layouts/BuyerLayout';
import { AdminWorkspaceLayout } from '../layouts/AdminLayout';
import {
    DashboardIndex, NotFoundPage, RequireAuth, RequireRole, RouteLoading, UnauthorizedPage,
} from './guards';

const HomePage = lazy(() => import('../HomePage'));
const ArtworkCatalogue = lazy(() => import('../../features/artworks/pages/ArtworkCatalogue'));
const ArtworkDetailPage = lazy(() => import('../../features/artworks/pages/ArtworkDetailPage'));
const ArtistProfilePage = lazy(() => import('../../features/artists/pages/ArtistProfilePage'));
const ArtistDirectoryPage = lazy(() => import('../../features/artists/pages/ArtistDirectoryPage'));
const PublicInfoPage = lazy(() => import('../PublicInfoPages'));
const AuthPage = lazy(() => import('../AuthPage'));
const ArtistWorkspaceOverview = lazy(() => import('../../features/artist/pages/ArtistWorkspaceOverview'));
const BuyerDashboardHome = lazy(() => import('../../features/buyer').then((module) => ({ default: module.BuyerDashboardHome })));
const AdminDashboardHome = lazy(() => import('../../features/admin').then((module) => ({ default: module.AdminDashboardHome })));
const AdminArtworkModeration = lazy(() => import('../AdminWorkspace').then((module) => ({ default: module.AdminArtworkModeration })));
const AdminUsersPage = lazy(() => import('../AdminWorkspace').then((module) => ({ default: module.AdminUsersPage })));
const AdminMessageReportsPage = lazy(() => import('../AdminWorkspace').then((module) => ({ default: module.AdminMessageReportsPage })));
const AdminArtworkCommentReportsPage = lazy(() => import('../AdminWorkspace').then((module) => ({ default: module.AdminArtworkCommentReportsPage })));
const AdminEditorialPage = lazy(() => import('../EditorialPages').then((module) => ({ default: module.AdminEditorialPage })));
const CollectionIndexPage = lazy(() => import('../EditorialPages').then((module) => ({ default: module.CollectionIndexPage })));
const CollectionDetailPage = lazy(() => import('../EditorialPages').then((module) => ({ default: module.CollectionDetailPage })));
const MessagingCenter = lazy(() => import('../../features/messaging').then((module) => ({ default: module.MessagingCenter })));
const ArtistProfileSettings = lazy(() => import('../RoutingPages').then((module) => ({ default: module.ArtistProfileSettings })));
const WorkspaceSettingsPage = lazy(() => import('../RoutingPages').then((module) => ({ default: module.WorkspaceSettingsPage })));
const ArtistArtworkPage = lazy(() => import('../RoutingPages').then((module) => ({ default: module.ArtistArtworkPage })));

function withRouteFallback(element) {
    return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={withRouteFallback(<HomePage />)} />
                <Route path="/artworks" element={withRouteFallback(<ArtworkCatalogue />)} />
                <Route path="/collections" element={withRouteFallback(<CollectionIndexPage />)} />
                <Route path="/collections/:slug" element={withRouteFallback(<CollectionDetailPage />)} />
                <Route path="/artworks/:slug" element={withRouteFallback(<ArtworkDetailPage />)} />
                <Route path="/artists" element={withRouteFallback(<ArtistDirectoryPage />)} />
                <Route path="/artists/:slug" element={withRouteFallback(<ArtistProfilePage />)} />
                <Route path="/about" element={withRouteFallback(<PublicInfoPage page="about" />)} />
                <Route path="/help" element={withRouteFallback(<PublicInfoPage page="help" />)} />
                <Route path="/contact" element={withRouteFallback(<PublicInfoPage page="contact" />)} />
                <Route path="/login" element={withRouteFallback(<AuthPage />)} />
                <Route path="/register" element={withRouteFallback(<AuthPage initialMode="register" />)} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/dashboard" element={<RequireAuth><DashboardIndex /></RequireAuth>} />
            <Route path="/dashboard/artist" element={<RequireRole roles={['artist']}><ArtistWorkspaceLayout /></RequireRole>}>
                <Route index element={withRouteFallback(<ArtistWorkspaceOverview />)} />
                <Route path="profile" element={withRouteFallback(<ArtistProfileSettings />)} />
                <Route path="settings" element={withRouteFallback(<WorkspaceSettingsPage />)} />
                <Route path="artworks/new" element={withRouteFallback(<ArtistArtworkPage initialCreate />)} />
                <Route path="artworks" element={withRouteFallback(<ArtistArtworkPage />)} />
                <Route path="messages" element={withRouteFallback(<MessagingCenter role="artist" />)} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/dashboard/buyer" element={<RequireRole roles={['buyer']}><BuyerWorkspaceLayout /></RequireRole>}>
                <Route index element={withRouteFallback(<BuyerDashboardHome />)} />
                <Route path="messages" element={withRouteFallback(<MessagingCenter role="buyer" />)} />
                <Route path="settings" element={withRouteFallback(<WorkspaceSettingsPage />)} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/admin" element={<RequireRole roles={['admin']}><AdminWorkspaceLayout /></RequireRole>}>
                <Route index element={withRouteFallback(<AdminDashboardHome />)} />
                <Route path="users" element={withRouteFallback(<AdminUsersPage />)} />
                <Route path="artworks" element={withRouteFallback(<AdminArtworkModeration />)} />
                <Route path="message-reports" element={withRouteFallback(<AdminMessageReportsPage />)} />
                <Route path="artwork-comment-reports" element={withRouteFallback(<AdminArtworkCommentReportsPage />)} />
                <Route path="editorial" element={withRouteFallback(<AdminEditorialPage />)} />
                <Route path="settings" element={withRouteFallback(<WorkspaceSettingsPage />)} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
