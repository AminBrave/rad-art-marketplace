import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '../AuthContext';
import { AppRoutes } from './routes';

function RouteScrollRestoration() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
            return;
        }

        window.scrollTo(0, 0);
    }, [pathname, hash]);

    return null;
}

export default function AppRouter() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <RouteScrollRestoration />
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
