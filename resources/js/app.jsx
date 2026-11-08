import React from 'react';
import { createRoot } from 'react-dom/client';
import LegacyApp from './app/App';
import AppRouter from './app/AppRouter';
import './bootstrap';

// The legacy App is reserved for the independent design-system specimen; normal navigation always uses AppRouter.
const isDesignSystemPreview = import.meta.env.DEV
    && window.location.search.includes('design-system');
const RootApp = isDesignSystemPreview ? LegacyApp : AppRouter;

createRoot(document.getElementById('app')).render(
    React.createElement(React.StrictMode, null, React.createElement(RootApp)),
);
