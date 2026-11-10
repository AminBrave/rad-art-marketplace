# Frontend Architecture and UI

Entry: `resources/js/app.jsx`. Router: `app/AppRouter.jsx`. Auth: `AuthContext.jsx`. Route guards/layouts: `RoutingPages.jsx`, `Layouts.jsx`. Feature screens are lazy-loaded at route boundaries.

## Route areas
Public home/catalogue/artwork/artist/collections/info/auth; artist dashboard/profile/artworks/inquiries/messages; buyer dashboard/inquiries/messages; admin dashboard/users/artwork moderation/reports/editorial.

## UI rules
Persian-first and RTL are product requirements. Reuse primitives in `resources/js/components/ui/`. Support narrow mobile widths without horizontal overflow. Include loading, empty, error, success and unavailable-media states. Use semantic elements, labels, keyboard focus, accessible names and meaningful image alt text. Keep shareable pagination/filter state in URL when useful. Prevent stale async updates and duplicate requests; follow AbortController patterns.

Auth context is shared state; feature data is generally local to screens. Axios uses same-origin Laravel session/CSRF conventions. Client role checks never protect data.

Test pure logic with Node; server contracts with Laravel; navigation, deep links, role redirects and responsive behavior with Playwright.
