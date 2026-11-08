import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import HomePage from './HomePage';
import ArtworkGallery from './ArtworkGallery';
import ArtistProfilePage from './ArtistProfilePage';
import AuthPage from './AuthPage';
import { PublicLayout } from './Layouts';
import {
    AdminDashboardHome,
    AdminUsersPage,
    AdminWorkspaceLayout,
    ArtistArtworkPage,
    ArtistDashboardHome,
    ArtistInquiryPage,
    ArtistProfileSettings,
    ArtistWorkspaceLayout,
    BuyerDashboardHome,
    BuyerInquiryPage,
    BuyerWorkspaceLayout,
    DashboardIndex,
    NotFoundPage,
    PublicInfoPage,
    RequireAuth,
    RequireRole,
    UnauthorizedPage,
} from './RoutingPages';
import AdminArtworkModeration from './AdminArtworkModeration';

function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/artworks" element={<ArtworkGallery />} />
                <Route path="/artworks/:slug" element={<ArtworkGallery />} />
                <Route path="/artists" element={<PublicInfoPage title="هنرمندان راد آرت" description="فهرست و معرفی هنرمندان در مرحله بعدی تکمیل تجربه عمومی راد آرت ارائه می‌شود." />} />
                <Route path="/artists/:slug" element={<ArtistProfilePage />} />
                <Route path="/about" element={<PublicInfoPage title="درباره راد آرت" description="راد آرت فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط مستقیم با خالقان هر اثر است." />} />
                <Route path="/contact" element={<PublicInfoPage title="تماس با ما" description="اطلاعات و مسیرهای تماس عمومی در مرحله محتوای عمومی MVP 2 تکمیل می‌شود." />} />
                <Route path="/help" element={<PublicInfoPage title="راهنما" description="راهنمای استفاده از راد آرت در مرحله محتوای عمومی MVP 2 تکمیل می‌شود." />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage initialMode="register" />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            <Route path="/dashboard" element={<RequireAuth><DashboardIndex /></RequireAuth>} />

            <Route path="/dashboard/artist" element={<RequireRole roles={['artist']}><ArtistWorkspaceLayout /></RequireRole>}>
                <Route index element={<ArtistDashboardHome />} />
                <Route path="profile" element={<ArtistProfileSettings />} />
                <Route path="artworks" element={<ArtistArtworkPage />} />
                <Route path="inquiries" element={<ArtistInquiryPage />} />
            </Route>

            <Route path="/dashboard/buyer" element={<RequireRole roles={['buyer']}><BuyerWorkspaceLayout /></RequireRole>}>
                <Route index element={<BuyerDashboardHome />} />
                <Route path="inquiries" element={<BuyerInquiryPage />} />
            </Route>

            <Route path="/admin" element={<RequireRole roles={['admin']}><AdminWorkspaceLayout /></RequireRole>}>
                <Route index element={<AdminDashboardHome />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="artworks" element={<AdminArtworkModeration />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
