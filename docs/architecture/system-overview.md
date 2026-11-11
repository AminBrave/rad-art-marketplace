# System Overview

## Runtime
Laravel serves the application shell and owns server routes, session/CSRF, API, validation, authorization, persistence and storage. React mounts at `resources/js/app.jsx`; `AppRouter.jsx` owns client navigation and lazy feature screens. Axios calls `/api/v1`. Vite builds assets.

Most versioned endpoints are declared in `routes/web.php`; `routes/api.php` currently contains the health endpoint.

## Stack
PHP 8.3+, Laravel 13, React 18, React Router 7, Vite 6, Tailwind CSS 3.4, Axios, TanStack Query 5, Radix UI with shadcn-compatible component configuration, Lucide React, Eloquent, PHPUnit 11, Node test runner, Python Playwright.

## Backend
Routes/middleware → controllers → focused actions and Form Requests → policies/authorization → API resources → Eloquent models/relations → migrations. Artwork writes use dedicated create/update actions with private-file cleanup on persistence failures. Message notifications implement Laravel `ShouldQueue` and are dispatched after commit; the database queue is the cPanel-compatible production default. Filesystem abstractions keep artwork and message attachments private.

## Frontend
Entry/bootstrap: app.jsx/bootstrap.js. Shared server-state cache: `lib/queryClient.js` (TanStack Query) with Axios as the transport; cache is cleared when the authenticated account identity changes. Auth: AuthContext. Route/layout/access UX: AppRouter, RoutingPages, Layouts. Screens: HomePage, ArtworkCatalogue/Detail/Studio, ArtistDirectory/Profile, BuyerWorkspace, ArtistWorkspaceOverview, InquiryCenter, MessagingCenter, AdminWorkspace, EditorialPages. Shared UI in `resources/js/components/ui/`.

## Constraints
Server-side authorization is mandatory; React guards are UX only. Preserve Laravel session/CSRF behavior and API pagination/response shape. Avoid synchronous dependencies on unconfigured mail/realtime providers. Keep routes inventory in sync with tests/docs.

This is source-derived architecture, not a production deployment audit. Verify runtime behavior in CI before asserting it.
