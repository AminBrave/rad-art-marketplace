import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import AppRouter from './app/AppRouter';
import './bootstrap';

// Keep the development-only specimen out of the normal production entry bundle.
const LegacyApp = lazy(() => import('./app/App'));
const isDesignSystemPreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('design-system');
const RootApp = isDesignSystemPreview
    ? <Suspense fallback={null}><LegacyApp /></Suspense>
    : <AppRouter />;

createRoot(document.getElementById('app')).render(
    <React.StrictMode><QueryClientProvider client={queryClient}>{RootApp}</QueryClientProvider></React.StrictMode>,
);
