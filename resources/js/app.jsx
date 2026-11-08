import React from 'react';
import { createRoot } from 'react-dom/client';
import LegacyApp from './app/App';
import AppRouter from './app/AppRouter';
import './bootstrap';

const isDesignSystemPreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('design-system');
const RootApp = isDesignSystemPreview ? LegacyApp : AppRouter;

createRoot(document.getElementById('app')).render(
    React.createElement(React.StrictMode, null, React.createElement(RootApp)),
);
