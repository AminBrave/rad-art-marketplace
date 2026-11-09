import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import HomePage from './HomePage';
import ArtworkCatalogue from './ArtworkCatalogue';
import ArtworkDetailPage from './ArtworkDetailPage';
import ArtistProfilePage from './ArtistProfilePage';
import ArtistDirectoryPage from './ArtistDirectoryPage';
import PublicInfoPage from './PublicInfoPages';
import AuthPage from './AuthPage';
import { PublicLayout } from './Layouts';
import {
    AdminWorkspaceLayout, ArtistArtworkPage,
    ArtistInquiryPage, ArtistProfileSettings, ArtistWorkspaceLayout,
    BuyerWorkspaceLayout, DashboardIndex,
    NotFoundPage, RequireAuth, RequireRole, UnauthorizedPage,
} from './RoutingPages';
import ArtistWorkspaceOverview from './ArtistWorkspaceOverview';
import { BuyerDashboardHome, BuyerInquiryPage } from './BuyerWorkspace';
import { AdminArtworkModeration, AdminDashboardHome, AdminUsersPage } from './AdminWorkspace';

function AppRoutes() {
    return <Routes>
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
    </Routes>;
}

export default function App() {
    return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}
