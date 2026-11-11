# Frontend Architecture and UI

Entry: `resources/js/app.jsx`. Router: `app/AppRouter.jsx`. Auth: `AuthContext.jsx`. Route guards/layouts: `RoutingPages.jsx`, `Layouts.jsx`. Feature screens are lazy-loaded at route boundaries.

## Route areas
Public home/catalogue/artwork/artist/collections/info/auth; artist dashboard/profile/artworks/inquiries/messages; buyer dashboard/inquiries/messages; admin dashboard/users/artwork moderation/reports/editorial.

## UI rules
Persian-first and RTL are product requirements. Reuse primitives in `resources/js/components/ui/`; the project keeps its Persian-first design tokens while exposing shadcn-compatible `components.json`, `cn()` utility and `@/` source alias. Use Radix for accessible interaction primitives and Lucide React for icons. Support narrow mobile widths without horizontal overflow. Include loading, empty, error, success and unavailable-media states. Use semantic elements, labels, keyboard focus, accessible names and meaningful image alt text. Keep shareable pagination/filter state in URL when useful. Prevent stale async updates and duplicate requests; follow AbortController patterns.

Auth context is shared state; feature data is generally local to screens. Axios uses same-origin Laravel session/CSRF conventions. TanStack Query owns cacheable server state and passes AbortSignal to Axios requests; account identity changes clear the shared cache so user-scoped results cannot survive a login/logout boundary. Client role checks never protect data.

Test pure logic with Node; server contracts with Laravel; navigation, deep links, role redirects and responsive behavior with Playwright.
