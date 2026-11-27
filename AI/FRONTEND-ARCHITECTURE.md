# Frontend architecture contract

**Status:** Target architecture and migration contract for the frontend. This document describes where the code should move and the rules that should govern new boundaries; it is not a claim that the target folder structure already exists.

**Source of truth split**
- [ARCHITECTURE.md](ARCHITECTURE.md) describes the current, source-backed implementation.
- This document describes the target frontend ownership model and migration rules.
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) owns visual and component design guidance.

## 1. Architectural direction

Adopt a **feature-first modular frontend** within the existing Laravel application. Keep the architecture deliberately small: an app composition layer, cohesive product features, and domain-independent shared infrastructure/UI.

Do not introduce microfrontends, a new global state manager, service/repository layers, or a frontend rewrite. React Router remains responsible for navigation; TanStack Query remains responsible for remote/server state; React state remains responsible for local interaction state.

### Target layout

```text
resources/
  css/
    app.css             # Tailwind entry point, global and component styles
    tokens.css          # canonical primitive, semantic and component tokens
  js/
    app/
      App.jsx
      AppProviders.jsx
      router/
        AppRouter.jsx
        guards.jsx
        routes.js
      layouts/
        PublicLayout.jsx
        WorkspaceLayout.jsx
        AdminLayout.jsx
    features/
      auth/
      artworks/
      artists/
      collections/
      messaging/
      buyer/
      artist/
      admin/
    shared/
      ui/
        primitives/
        forms/
        navigation/
        feedback/
        layout/
        media/
      i18n/
      theme/
      api/
      hooks/
      lib/
      utils/
```

`resources/css/tokens.css` is the canonical token source and is imported by `resources/css/app.css`; Tailwind utilities map to its semantic values. `resources/css/tokens.css` is the canonical token source and is imported by `resources/css/app.css`; Tailwind maps to those values. This is a destination, not a folder-creation checklist. Create a directory only when it has real code to own. Existing files may remain in their current locations behind compatibility exports while a feature is migrated.

## 2. Ownership boundaries

### `app/` — application composition

Owns:
- React bootstrap and provider composition.
- Route definitions, route guards, redirects and route-level error/loading boundaries.
- Public, workspace and admin application shells.
- Cross-cutting orchestration that genuinely spans the application.

Must not become the permanent home for artwork, artist, messaging, buyer, artist-workspace or admin business implementation. During migration, legacy domain modules may remain here; move them only with their callers and contracts understood.

### `features/<domain>/` — product/domain ownership

A feature owns its cohesive:
- Pages and domain-specific components.
- Hooks and local domain state.
- API functions, query-key factories and server-state hooks.
- Domain models, formatting and validation rules that are not generic.

Use the smallest useful internal structure. A practical starting shape is `api/`, `components/`, `hooks/`, `pages/` and `model/`; do not create empty folders or split files mechanically.

Feature-to-feature dependencies must be explicit. A feature may consume another feature only through that feature's public entry point; do not reach into another feature's internal `pages/`, `hooks/` or `components/` paths. Prefer extracting a genuinely generic capability into `shared/` over creating feature cycles.

### `shared/` — domain-independent building blocks

Owns reusable infrastructure and UI that has no product-domain knowledge:
- Generic primitives and accessible interaction patterns.
- Generic layout, navigation, feedback, media and form building blocks.
- Localization, theme, HTTP client, generic hooks and utility functions.

Shared modules must not import from `app/` or `features/`. If a shared component needs a domain-specific decision, pass it as data/props or keep the composition in the owning feature.

### Dependency direction

```text
app  ───────────────► features (public entry points)
 │                         │
 └────────► shared ◄───────┘

shared  ──X──► app
shared  ──X──► features
feature A ──► feature B only through B's public entry point
feature ──X──► app
```

The diagram is a dependency policy, not a statement that the current code already conforms.

## 3. State, API and routing contracts

- **Remote/server state:** TanStack Query. Keep query keys and request hooks with their owning feature.
- **Transient interaction state:** component state/hooks.
- **Shareable navigation/filter state:** URL/search parameters.
- **Application-wide state:** context only for concerns that genuinely span routes, such as auth, locale and theme.
- **HTTP transport:** one configured shared client for common base URL, credentials/session behavior and transport-level error handling. Feature modules own endpoint-specific functions and response interpretation.
- **Navigation:** preserve existing public URLs, role access, redirects and deep-link behavior during structural moves.
- **Backend contracts:** preserve endpoints, payloads, authorization and data semantics unless a separate, explicit task changes them. Client route guards are not a substitute for server authorization.

Do not introduce Redux or another global store unless a concrete requirement demonstrates that existing ownership models are insufficient.

## 4. Component and file conventions

- React components and page modules: PascalCase names (for example, `ArtworkDetailPage.jsx`).
- Hooks: `useX` names (for example, `useArtworkQueries.js`).
- Utilities, API functions and query-key modules: descriptive camelCase names.
- Keep component styles/variants close to the component or its design-system contract.
- Prefer named exports for reusable modules; preserve existing default exports where changing them would create unnecessary migration churn.
- Keep public entry points intentionally small. Avoid broad barrel exports that create cycles or hide ownership.
- Components should expose meaningful semantic props and explicit variants/states rather than many unrelated boolean flags.

## 5. Current baseline and migration status

The feature-first migration is established on main. The source-backed implementation map lives in ARCHITECTURE.md; this section records ownership and transitional debt rather than duplicating every path.

- app/ owns bootstrap composition, routing, guards and public/workspace shells. Active route definitions live in app/router/routes.jsx; focused shells live in app/layouts/.
- features/ owns the migrated artwork, artist, artist-workspace, buyer, admin, messaging, collections and home domain modules. Some public/auth/editorial/admin route screens remain in app/ and are listed in ARCHITECTURE.md; do not classify them as dead solely because a feature directory exists.
- shared/auth/, shared/i18n/, shared/theme/, shared/api/ and shared/ui/ own their corresponding app-wide contracts.
- resources/js/lib/ and resources/js/utils/ contain small domain-independent query, styling, accessibility and formatting utilities. The boundary checker includes these roots.
- resources/js/components/ui/ and selected app/ modules remain compatibility facades. Preserve them until static and runtime importer checks prove removal safe.
- resources/css/tokens.css is the canonical token source; app.css imports it, and Tailwind maps to its values.

Stages 1–6 of Issue #294 are complete on main. Stage 7 is the current final conformance pass. The separate PR #293 remains open and unmerged on refactor/292-unified-spacing-layout; its spacing/layout work is not part of main unless separately integrated. Historical overhaul PR #283 is closed unmerged. See COMPLETE-APPLICATION-OVERHAUL.md and STYLING-IMPLEMENTATION-PLAN.md for their explicit historical status.

## 6. Compatibility and migration constraints

1. Migrate incrementally, one cohesive boundary at a time.
2. Keep compatibility exports/re-exports where they prevent a broad, risky import rewrite.
3. Before moving a module, identify its importers, route ownership, context/provider assumptions, API calls and CSS dependencies.
4. Preserve public route paths, auth/role behavior, query semantics, API payloads and persisted data.
5. Do not delete a suspected duplicate/legacy file until all static callers and runtime entry points have been checked.
6. Do not combine a whole-app TypeScript migration with this refactor. Add JSDoc/contracts where useful; consider TypeScript for new code only as a separate decision.
7. Avoid file-size targets. Split only when responsibilities, ownership or change cadence justify the boundary.
8. Keep each stage reviewable and avoid mixing unrelated visual redesign with structural migration.

## 7. Enforced boundary check

Run:

```sh
npm run architecture:frontend
```

The dependency-free Node checker:
- Scans JavaScript/JSX under the legacy shared UI and future shared/features roots.
- Rejects shared-to-app and shared-to-feature dependencies.
- Rejects feature-to-app dependencies and deep cross-feature imports.
- Rejects app imports that reach into feature internals instead of using a feature entry point.
- Treats every shared-to-app or shared-to-feature dependency as a violation; no transitional allowlist remains.

The checker is intentionally static and narrow. It does not replace code review, full module resolution, ESLint, build validation or runtime verification. Do not add exceptions for legacy dependencies. Keep compatibility facades in the app layer and point shared consumers at shared-owned contracts.

## 8. Verification checklist for every migration stage

For each stage, record the exact checks run and their results. Do not mark a check complete merely because it is listed here.

### Static and build checks
- `npm run architecture:frontend` — dependency-direction rules.
- `npm run lint` — ESLint across `resources/js`.
- `npm run production` — Vite production build and manifest/assets validation, when dependencies/environment are available.

### Focused manual smoke checks
- Persian locale with RTL direction, including mixed Persian/Latin content.
- English locale with LTR direction.
- Light, dark and system theme modes.
- Public discovery, artwork detail, artist profile and editorial navigation.
- Buyer and artist workspace access and role redirects.
- Messaging inbox, conversation history and composer.
- Admin navigation and permission-denied states.
- Deep links, loading/error/empty states, responsive layouts and keyboard/focus behavior.

Automated tests remain valuable and should normally be updated with behavior changes under the central development guide. If a task explicitly excludes tests, do not edit or inspect test files; report the limitation and use safe static/build/manual checks instead.

## 9. Conformance exit criteria

The feature-first architecture is considered conformant for this staged refactor when:
- The current source map distinguishes active route implementations from compatibility facades.
- Shared, feature, app, lib/ and utils/ ownership and dependency direction are documented.
- npm run architecture:frontend is repeatable locally and runs in the pull-request/push frontend quality workflow.
- npm run lint and npm run production run in that same workflow.
- Compatibility modules remain only where their importers or runtime entry points still require them; uncertain candidates are recorded as debt, not deleted speculatively.
- Manual browser, RTL/LTR, theme, responsive and assistive-technology verification is reported separately from static and build checks.

The checker is intentionally lightweight. It does not prove full module resolution, runtime behavior, accessibility conformance or absence of dynamic imports.
