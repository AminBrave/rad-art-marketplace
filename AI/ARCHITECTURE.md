# Rademan — current architecture

This document maps the current implementation. Re-check the referenced source and manifests before relying on version-specific details; update this file whenever ownership, entry points, routes or quality commands change.

## Technology

The current manifests declare PHP 8.3+, Laravel 13, React 18, JavaScript, React Router 7, TanStack Query 5, Vite 8 and Node 20.19+. PHP dependencies and scripts are defined in `composer.json`; frontend dependencies and scripts are defined in `package.json`.

## Application entry and composition

- Laravel serves the application; `resources/js/app.jsx` is the Vite React entry point.
- The entry point installs TanStack Query, localization and theme providers, then mounts the active router.
- `resources/js/app/router/AppRouter.jsx` is the active router implementation; `resources/js/app/AppRouter.jsx` remains a compatibility entry point.
- `resources/js/app/router/routes.jsx` owns URL-to-screen composition and lazy route imports.
- `resources/js/app/router/guards.jsx` owns client-side authentication/role guards and route fallback screens.
- `resources/js/app/layouts/` owns the public shell, artist/buyer/admin workspace shells, shared workspace composition and navigation configuration.
- `resources/js/app/App.jsx` is a development-only design-system specimen, loaded from the entry point only for the design-system preview query.

## Active routes

The route table in `resources/js/app/router/routes.jsx` is authoritative.

| Area | Current paths |
|---|---|
| Public | `/`, `/artworks`, `/artworks/:slug`, `/artists`, `/artists/:slug`, `/collections`, `/collections/:slug`, `/about`, `/help`, `/contact`, `/login`, `/register`, `/unauthorized` |
| Buyer | `/dashboard/buyer`, `/dashboard/buyer/messages`, `/dashboard/buyer/settings` |
| Artist | `/dashboard/artist`, `/dashboard/artist/profile`, `/dashboard/artist/settings`, `/dashboard/artist/artworks`, `/dashboard/artist/artworks/new`, `/dashboard/artist/messages` |
| Admin | `/admin`, `/admin/users`, `/admin/artworks`, `/admin/message-reports`, `/admin/artwork-comment-reports`, `/admin/editorial`, `/admin/settings` |

Route screens still implemented in `resources/js/app/` include the homepage, authentication, public information, editorial collection pages and several admin screens. Their presence is intentional where the route table references them; do not infer that an app-layer file is unused because a feature folder exists.

## Feature ownership

- `resources/js/features/artworks/` — artwork catalogue/detail/studio/gallery, artwork components, API functions and query keys.
- `resources/js/features/artists/` — public artist directory/profile, artist components, API functions and query keys.
- `resources/js/features/artist/` — artist workspace overview, profile settings and artwork route composition.
- `resources/js/features/buyer/` — buyer workspace experience.
- `resources/js/features/admin/` — admin dashboard and editorial experience; some active moderation/user/report screens remain in `app/AdminWorkspace.jsx`.
- `resources/js/features/messaging/` — messaging orchestration, inbox, conversation, composer, components and query helpers.
- `resources/js/features/collections/` and `resources/js/features/home/` currently expose loading compositions; their public page implementations remain in `app/`.

Feature consumers should use each feature's public `index.js` entry point. Cross-feature imports must not reach into another feature's internal pages, hooks or components.

## Shared infrastructure and UI

- `resources/js/shared/auth/` — authentication context and hook.
- `resources/js/shared/i18n/` — locale dictionaries, provider/hook and document language/direction synchronization.
- `resources/js/shared/theme/` — theme context/provider/hook and theme preference handling.
- `resources/js/shared/api/` — configured Axios transport and normalized transport-error helpers.
- `resources/js/shared/ui/` — domain-independent controls, forms, compositions, layout, navigation, dialogs, feedback and generic loading components. Public entry point: `index.js`.
- `resources/js/lib/` — query client, class-name merger and color-accessibility audit utilities.
- `resources/js/utils/` — localized-content and artwork-price helpers.
- `resources/js/components/ui/` — deprecated generic UI compatibility facade; new imports belong in `shared/ui/`.
- Selected `resources/js/app/` modules remain compatibility facades for router, layouts and shared application contracts.

## State and dependency boundaries

- TanStack Query owns remote/server state.
- React component state/hooks own transient interaction state.
- URL/search parameters own shareable navigation and filter state.
- App providers own genuinely cross-route concerns such as authentication, locale and theme.
- Feature modules own endpoint-specific request functions and query-key factories where migrated; shared API owns transport/session configuration.
- `shared/` must not depend on `app/` or `features/`. Features must not depend on `app/`; cross-feature dependencies use public entry points. App composition may consume feature public entry points and shared modules.
- Client-side guards are navigation behavior, not a replacement for server-side authorization, policies or validation.

## Styling

- `resources/css/tokens.css` is the canonical primitive, semantic and component token source.
- `resources/css/app.css` imports tokens and owns global/base/application styles.
- `tailwind.config.js` maps utilities to canonical tokens; it must not become a competing token source.
- Artwork media uses the 3:4 artwork ratio and `object-contain` where the complete artwork should remain visible. Cropping is role-specific (for example, avatars).

See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for token and component usage.

## Quality commands

The current frontend scripts in `package.json` include:

```sh
npm run architecture:frontend
npm run lint
npm run production
npm run quality:frontend
```

`quality:frontend` runs architecture boundaries, ESLint and the production build in sequence. The workflow `.github/workflows/frontend-quality.yml` runs it for the configured frontend changes. The architecture checker is static; it is not a full module resolver or proof of runtime, browser or accessibility correctness.

## Keeping this map current

When a route, feature owner, public export, shared contract, token source or quality command changes, update the relevant section in this document in the same PR. Remove paths once they are no longer current; do not preserve migration-stage status or old branch history here.
