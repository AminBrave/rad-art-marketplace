# Frontend Architecture and UI

Entry: `resources/js/app.jsx`. Router: `app/AppRouter.jsx`. Auth: `AuthContext.jsx`. Route guards/layouts: `RoutingPages.jsx`, `Layouts.jsx`. Feature screens are lazy-loaded at route boundaries.

## Route areas
Public home/catalogue/artwork/artist/collections/info/auth; artist dashboard/profile/artworks/messages; buyer dashboard/messages; admin dashboard/users/artwork moderation/reports/editorial. Inquiry screens remain in source but their routes, navigation and public entry points are hidden while the registry flag is false.

## Design system
The primary component and interface specification is [shadcn/ui New York Design System](shadcn-new-york-design-system.md). The implementation is locally owned source under `resources/js/components/ui/`, composed using the shadcn/ui open-code model. The project remains React 18 + Vite + Tailwind 3.4 + Radix; do not paste Tailwind v4 or React 19-only patterns without a separate compatibility decision.

New York is the default design language. Editorial remains a temporary optional compatibility skin during the page migration; it is not a second component API. Use semantic tokens for surfaces, foregrounds, actions, borders, inputs, rings, popovers, charts and sidebar. Light and dark values are semantic pairs; dark mode is activated by the root `.dark` class and bootstrapped before first paint. Use `cn()` for class composition and the configured `@/` source alias.

## RTL and accessibility
Persian-first RTL is a product requirement. Classic New York uses Radix primitives and requires manual RTL adaptation: prefer logical start/end spacing and positioning, set direction on portal content, and flip directional icons only where the meaning is directional. Do not assume the current CLI's automatic RTL transformation applies to classic New York. Every interactive component must provide keyboard operation, visible focus, disabled/invalid states, accessible names and appropriate ARIA relationships. Respect reduced motion and prevent horizontal overflow at 320px.

## Page composition
Build public discovery, artwork detail, artist profile, authentication, artist/buyer workspace, messaging and admin/moderation screens from shared New York primitives and documented composition patterns. Marketplace-specific artwork and artist cards remain domain compositions, not generic component-library demos. Preserve server validation, API payloads, permission boundaries, navigation and data contracts while migrating presentation.

## Runtime and data
Feature availability is read through `isFeatureEnabled()` from the Laravel-injected `window.__RAD_FEATURES__` registry. Gate route declarations, navigation and public feature entry points with the same flag; backend feature middleware remains authoritative and returns 404 for disabled endpoints. Auth context owns the current user; transient form and presentation state stays local to screens. Axios uses same-origin Laravel session/CSRF conventions. TanStack Query owns cacheable public discovery data in the homepage, artwork catalogue/detail, artist directory/profile and collection pages, and passes AbortSignal to Axios requests; account identity changes clear the shared cache so user-scoped results cannot survive a logout/account-switch boundary; queries that may return private records also include the viewer identity in their query key. Client role checks never protect data.

## Verification
Test pure logic and component semantics with Node; server contracts with Laravel; navigation, deep links, keyboard interaction, role redirects, light/dark, RTL/LTR and responsive behavior with Playwright. Test both public and authenticated routes. Feature-registry behavior has Node and Laravel coverage; direct messaging must remain available when Inquiry is disabled.
