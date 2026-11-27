# Frontend maintenance guide

Use this guide for routine frontend changes. The current implementation map is in ARCHITECTURE.md; the dependency contract is in FRONTEND-ARCHITECTURE.md; design tokens and visual rules are in DESIGN-TOKENS.md and DESIGN-SYSTEM.md.

## Where changes belong

| Change | Owner |
|---|---|
| Bootstrap, route definitions, guards, redirects and route fallbacks | resources/js/app/ |
| Public/workspace shells and role navigation | resources/js/app/layouts/ |
| Artwork catalogue/detail/studio, artwork API and query keys | resources/js/features/artworks/ |
| Public artist directory/profile | resources/js/features/artists/ |
| Artist workspace/profile settings | resources/js/features/artist/ |
| Buyer experience | resources/js/features/buyer/ |
| Admin domain pages | resources/js/features/admin/ (some active admin routes still use app/AdminWorkspace.jsx) |
| Messaging orchestration, components and query helpers | resources/js/features/messaging/ |
| Generic UI, forms, navigation, feedback and overlays | resources/js/shared/ui/ |
| Authentication, locale, theme and HTTP transport | resources/js/shared/auth/, shared/i18n/, shared/theme/, shared/api/ |
| Canonical visual tokens | resources/css/tokens.css; global CSS imports it from resources/css/app.css |

Some public/auth/editorial route screens remain under resources/js/app/. Check the live route table before moving them. Do not delete a compatibility facade or suspected duplicate until all static callers, dynamic imports, route entry points and runtime consumers are checked.

## Dependency rules

- shared must not import app or features.
- A feature must not import from app.
- Cross-feature imports must use the other feature's public entry point.
- app may compose features through their public entry points, but must not deep-import feature internals.
- Keep remote state in TanStack Query, transient UI state in components, shareable filter/navigation state in the URL, and truly global concerns in app-level providers.
- Keep endpoint-specific request/response logic with its feature; use the shared HTTP client for transport/session behavior.

Run npm run architecture:frontend after changing imports or ownership. It checks the app/features/shared and root lib/utils source roots. It is a static boundary check, not a full module resolver.

## Route and UI change workflow

1. Start from current main, inspect resources/js/app/router/routes.jsx and the owning feature's public exports.
2. Trace callers, data/query ownership, authorization assumptions, URL parameters and loading/error/empty states before moving code.
3. Preserve route paths, API payloads, query keys, mutation semantics and server-side authorization unless the task explicitly changes them.
4. Use shared UI and semantic tokens rather than duplicating controls or raw design values.
5. Keep route-level lazy imports meaningful; avoid importing a large feature barrel when a narrow public entry point or route chunk is more appropriate.
6. Check Persian RTL, English LTR, mixed-direction text, light/dark/system themes, keyboard/focus, reduced motion and responsive widths for affected surfaces.
7. Record browser/manual checks separately from automated checks. A static source review is not visual QA.

## Quality commands

Run the focused checks locally:

```sh
npm run architecture:frontend
npm run lint
npm run production
```

npm run quality:frontend runs all three in sequence. The same command is executed by .github/workflows/frontend-quality.yml for relevant pushes and pull requests. The workflow does not replace manual browser, assistive-technology or full product regression verification.

Do not run database-reset, seeding, deployment or destructive scripts as part of frontend verification. Inspect scripts before using commands with side effects.

## Known transitional debt

- Some active public/auth/editorial/admin page implementations remain under app/.
- Legacy app/ and components/ui/ compatibility facades remain; their removal requires verified importer and runtime-entry audits.
- resources/js/lib/ and resources/js/utils/ remain top-level utility roots but are included in the architecture boundary check.
- PR #293 (spacing/layout) remains a separate open, unmerged change. Do not assume it is included in main or in the staged Issue #294 work.
- Manual accessibility, responsive and RTL/LTR review remains a separate verification activity even when lint, architecture and production build pass.
