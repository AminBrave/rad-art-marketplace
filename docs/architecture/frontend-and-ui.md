# Frontend Architecture and UI

Entry: `resources/js/app.jsx`. Router: `app/AppRouter.jsx`. Auth: `AuthContext.jsx`. Route guards/layouts: `RoutingPages.jsx`, `Layouts.jsx`. Feature screens are lazy-loaded at route boundaries.

## Route areas
Public home/catalogue/artwork/artist/collections/info/auth; artist dashboard/profile/artworks/messages; buyer dashboard/messages; admin dashboard/users/artwork moderation/reports/editorial. Inquiry screens remain in source but their routes, navigation and public entry points are hidden while the registry flag is false.

## UI rules
Persian-first and RTL are product requirements. Reuse primitives in `resources/js/components/ui/`; the project keeps its Persian-first design tokens while exposing shadcn-compatible `components.json` (configured to avoid overwriting the existing design tokens), `cn()` utility and `@/` source alias. Use Radix for accessible interaction primitives and Lucide React for icons. Support narrow mobile widths without horizontal overflow. Include loading, empty, error, success and unavailable-media states. Use semantic elements, labels, keyboard focus, accessible names and meaningful image alt text. Keep shareable pagination/filter state in URL when useful. Prevent stale async updates and duplicate requests; follow AbortController patterns.

Feature availability is read through `isFeatureEnabled()` from the Laravel-injected `window.__RAD_FEATURES__` registry. Gate route declarations, navigation and public feature entry points with the same flag; backend feature middleware remains authoritative and returns 404 for disabled endpoints. Auth context owns the current user; transient form and presentation state stays local to screens. Axios uses same-origin Laravel session/CSRF conventions. TanStack Query owns cacheable public discovery data in the homepage, artwork catalogue/detail, artist directory/profile and collection pages, and passes AbortSignal to Axios requests; account identity changes clear the shared cache so user-scoped results cannot survive a logout/account-switch boundary; queries that may return private records also include the viewer identity in their query key. Client role checks never protect data.

Test pure logic with Node; server contracts with Laravel; navigation, deep links, role redirects and responsive behavior with Playwright. Feature-registry behavior has Node and Laravel coverage; direct messaging must remain available when Inquiry is disabled.
