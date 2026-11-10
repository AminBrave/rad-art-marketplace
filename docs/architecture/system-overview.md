# System Overview

## Runtime
Laravel serves the application shell and owns server routes, session/CSRF, API, validation, authorization, persistence and storage. React mounts at `resources/js/app.jsx`; `AppRouter.jsx` owns client navigation and lazy feature screens. Axios calls `/api/v1`. Vite builds assets.

Most versioned endpoints are declared in `routes/web.php`; `routes/api.php` currently contains the health endpoint.

## Stack
PHP 8.3+, Laravel 13, React 18, React Router 6, Vite 6, Tailwind CSS 3, Axios, Eloquent, PHPUnit 11, Node test runner, Python Playwright.

## Backend
Routes/middleware → controllers/validation → policies/authorization → Eloquent models/relations → migrations. Laravel notifications and filesystem abstractions support messaging and media.

## Frontend
Entry/bootstrap: app.jsx/bootstrap.js. Auth: AuthContext. Route/layout/access UX: AppRouter, RoutingPages, Layouts. Screens: HomePage, ArtworkCatalogue/Detail/Studio, ArtistDirectory/Profile, BuyerWorkspace, ArtistWorkspaceOverview, InquiryCenter, MessagingCenter, AdminWorkspace, EditorialPages. Shared UI in `resources/js/components/ui/`.

## Constraints
Server-side authorization is mandatory; React guards are UX only. Preserve Laravel session/CSRF behavior and API pagination/response shape. Avoid synchronous dependencies on unconfigured mail/realtime providers. Keep routes inventory in sync with tests/docs.

This is source-derived architecture, not a production deployment audit. Verify runtime behavior in CI before asserting it.
