import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import AppRouter from './app/AppRouter';
import { ThemeProvider } from './app/ThemeContext';
import './bootstrap';
import '../css/rademan.css';
import { auditColorAccessibility } from './lib/colorAccessibility';


// Register the conservative same-origin app shell cache in production only.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
            if (import.meta.env.DEV) console.warn('Rademan offline support could not be enabled.', error);
        });
    }, { once: true });
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__RAD_COLOR_A11Y_CHECK__ = (root = document) => {
        const report = auditColorAccessibility(root);
        console.table(report.failures);
        if (report.manualReview.length) console.table(report.manualReview);
        return report;
    };
}

// Keep the development-only specimen out of the normal production entry bundle.
const LegacyApp = lazy(() => import('./app/App'));
const isDesignSystemPreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('design-system');
const RootApp = isDesignSystemPreview
    ? <BrowserRouter><Suspense fallback={null}><LegacyApp /></Suspense></BrowserRouter>
    : <AppRouter />;

createRoot(document.getElementById('app')).render(
    <React.StrictMode><QueryClientProvider client={queryClient}><ThemeProvider>{RootApp}</ThemeProvider></QueryClientProvider></React.StrictMode>,
);
