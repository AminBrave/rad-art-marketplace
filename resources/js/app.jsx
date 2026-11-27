import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import AppRouter from './app/AppRouter';
import { ThemeProvider } from './shared/theme';
import { LanguageProvider } from './shared/i18n';
import './bootstrap';
import { auditColorAccessibility } from './lib/colorAccessibility';

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

const rootContainer = document.getElementById('app');
if (!rootContainer) {
    throw new Error('Rademan app root element #app was not found.');
}

// Keep the React root on the DOM node so repeated entry evaluation (for example,
// during Vite HMR) reuses it instead of calling createRoot() a second time.
const reactRootKey = Symbol.for('rademan.react-root');
const reactRoot = rootContainer[reactRootKey] ?? createRoot(rootContainer);
rootContainer[reactRootKey] = reactRoot;

reactRoot.render(
    <React.StrictMode><QueryClientProvider client={queryClient}><LanguageProvider><ThemeProvider>{RootApp}</ThemeProvider></LanguageProvider></QueryClientProvider></React.StrictMode>,
);
