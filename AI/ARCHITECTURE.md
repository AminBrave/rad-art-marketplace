# Rademan — current architecture

This is the source-backed map of the implementation on main. It describes current ownership and entry points, not an aspirational target. Re-check source and manifests before relying on version-specific or runtime claims.

## Technology

The current manifests declare PHP 8.3+, Laravel 13, React 18, JavaScript, React Router 7, TanStack Query 5, Vite 8 and Node 20.19+. package.json owns frontend scripts; composer.json owns PHP scripts and dependencies.

## Application entry and providers

- Laravel serves the application; resources/js/app.jsx is the Vite frontend entry.
- app.jsx creates the React root, installs QueryClientProvider, LanguageProvider and ThemeProvider, and mounts the router. It also exposes a development-only color-accessibility audit helper.
- resources/js/app/AppRouter.jsx is a compatibility entry point. The active router implementation is resources/js/app/router/AppRouter.jsx.
- resources/js/app/router/routes.jsx owns route definitions and lazy-loaded route screens; guards.jsx owns authentication, role, dashboard-index, loading, unauthorized and not-found route boundaries.
- resources/js/app/layouts/ owns the public shell and artist, buyer and admin workspace layouts, shared workspace layout, and navigation composition/configuration.
- resources/js/app/App.jsx is a development-only design-system specimen entry loaded only when the development URL includes the design-system query parameter.

## Route and feature ownership

The route table is the source of truth for active URL-to-screen composition: resources/js/app/router/routes.jsx.

Feature-owned public entry points currently exist under:
- resources/js/features/artworks/ — catalogue, detail, artwork studio, artwork page composition, artwork cards, APIs, query keys and loading compositions.
- resources/js/features/artists/ — artist directory/profile, artist cards, APIs, query keys and loading compositions.
- resources/js/features/artist/ — artist workspace overview, profile settings, artist artwork route composition and related loading compositions.
- resources/js/features/buyer/ — buyer workspace experience and loading compositions.
- resources/js/features/admin/ — admin dashboard, editorial experience and domain loading compositions.
- resources/js/features/messaging/ — messaging page orchestration, composer, timeline, inbox, headers, status banners, query helpers and loading compositions.
- resources/js/features/collections/ and resources/js/features/home/ — currently expose loading compositions; their public page implementations remain in the app layer.

Some route screens intentionally remain in resources/js/app/: HomePage.jsx, AuthPage.jsx, PublicInfoPages.jsx, EditorialPages.jsx, and AdminWorkspace.jsx. RoutingPages.jsx still owns workspace settings and compatibility exports. These are active modules where referenced by router/routes.jsx, not proven-dead files. Continue migration only when ownership and callers can be moved coherently.

## Shared infrastructure and UI

- resources/js/shared/auth/ owns authentication context and hook.
- resources/js/shared/i18n/ owns Persian/English dictionaries, locale provider/hook and document language/direction synchronization.
- resources/js/shared/theme/ owns theme context/provider/hook and theme persistence/system preference.
- resources/js/shared/api/ owns the configured Axios client and normalized transport-error helpers.
- resources/js/shared/ui/ owns generic controls, forms, layout, navigation, feedback, overlays, media and reusable compositions. Its public entry point is index.js.
- resources/js/lib/ contains the TanStack Query client, class-name merger and color-accessibility audit utilities.
- resources/js/utils/ contains localized-content and artwork-price formatting helpers.
- resources/js/components/ui/ is a deprecated generic-UI compatibility facade. New imports should use resources/js/shared/ui/.
- resources/js/app/ retains compatibility facades for the router, layouts and shared auth/locale/theme APIs. A compatibility facade is not evidence that the old implementation still owns the capability.

## Styling and design tokens

- resources/css/tokens.css is the canonical primitive, semantic and component token source.
- resources/css/app.css imports tokens.css before Tailwind layers and owns global/base/application styles.
- tailwind.config.js maps semantic utilities to canonical CSS variables; it should not become a second source of token values.
- Artwork frames use the canonical 3:4 aspect-artwork ratio and preserve the complete artwork with object-contain by default. Intentional crops (such as avatars) remain role-specific.
- See AI/DESIGN-SYSTEM.md, AI/DESIGN-TOKENS.md and AI/DESIGN-SYSTEM-CATALOGUE.md for design contracts and component guidance.

## State, data and security boundaries

- TanStack Query owns remote/server state; component state owns transient interaction state; URL parameters own shareable navigation/filter state.
- Feature modules own endpoint-specific API functions and query-key factories where migrated. Legacy route modules may still use direct Axios imports; the shared Axios singleton remains available for compatibility.
- Client-side route guards improve navigation but do not replace Laravel authorization, policies or validation.
- Messaging is a substantial domain; inspect its current server contracts, authorization, attachments, synchronization and moderation behavior before changing it.

## Architecture enforcement

Run npm run architecture:frontend to check dependency direction across app, features, shared, the deprecated shared-UI facade, and the root lib/utils modules. The checker is a lightweight static guard, not a full JavaScript module resolver or proof of runtime correctness. The same check runs in the frontend quality workflow.

See FRONTEND-ARCHITECTURE.md for dependency rules and migration constraints, and FRONTEND-MAINTENANCE.md for the practical maintenance workflow.

## Current staged migration

Stages 1–6 of Issue #294 are complete and merged to main through PRs #295–#300. Stage 7 is the final documentation, cleanup and conformance pass. This does not imply every product route or accessibility scenario in the separate historical overhaul ledger has received full browser or assistive-technology verification.
