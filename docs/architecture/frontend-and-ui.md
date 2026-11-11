# Frontend Architecture and UI

Entry: `resources/js/app.jsx`. Router: `app/AppRouter.jsx`. Auth: `AuthContext.jsx`. Route guards/layouts: `RoutingPages.jsx`, `Layouts.jsx`. Feature screens are lazy-loaded at route boundaries.

## Route areas
Public home/catalogue/artwork/artist/collections/info/auth; artist dashboard/profile/artworks/messages; buyer dashboard/messages; admin dashboard/users/artwork moderation/reports/editorial. Inquiry screens remain in source but their routes, navigation and public entry points are hidden while the registry flag is false.

## UI system
The shared UI foundation is shadcn/ui source-owned components in `resources/js/components/ui/`, using Radix UI for interaction primitives and Lucide React for icons. Components are JavaScript/JSX (not TypeScript), React 18 and Tailwind CSS 3.4. `components.json` is configured for New York style, CSS-variable theming, and the existing `@/` aliases. `cn()` remains the shared class merge utility.

**Visual ownership is deliberately split:** shadcn/ui owns component structure, sizing, spacing, typography defaults, radii, borders, elevation, focus treatment, states and interaction patterns. RAD contributes only the semantic color values mapped to shadcn tokens. Do not add RAD-specific button, input, card or dialog variants, and do not customize shadcn component geometry to reproduce the previous editorial UI.

The semantic token contract is defined in `resources/css/app.css` and exposed through Tailwind in `tailwind.config.js`: background/foreground, card, popover, primary, secondary, muted, accent, destructive, border, input and ring. RAD's ivory, charcoal, terracotta, sand and olive values are mapped into these semantic roles. The `.dark` class provides the corresponding dark palette; the default mode is light. `ThemeProvider` persists the choice in local storage and `ThemeToggle` is available in public and workspace layouts. The Blade entry applies the saved mode before first paint.

Existing marketplace pages still contain route-specific layout and presentation markup. Their legacy color utility aliases are retained as compatibility mappings to semantic theme tokens during the screen-by-screen migration; new UI code must use standard shadcn semantic utilities directly. Artwork and artist cards remain domain components, but their surface and feedback styling must use the shared semantic tokens.

Persian-first and RTL are product requirements. Preserve the document's `lang="fa"` and `dir="rtl"`, keep mixed Latin values explicitly LTR where needed, and ensure dialogs, menus, form controls and navigation remain keyboard accessible. Support narrow mobile widths without horizontal overflow. Include loading, empty, error, success and unavailable-media states. Use semantic elements, labels, keyboard focus, accessible names and meaningful image alt text. Use URL state for shareable pagination/filter state when useful.

Feature availability is read through `isFeatureEnabled()` from the Laravel-injected `window.__RAD_FEATURES__` registry. Gate route declarations, navigation and public feature entry points with the same flag; backend feature middleware remains authoritative and returns 404 for disabled endpoints. Auth context owns the current user; transient form and presentation state stays local to screens. Axios uses same-origin Laravel session/CSRF conventions. TanStack Query owns cacheable public discovery data in the homepage, artwork catalogue/detail, artist directory/profile and collection pages, and passes AbortSignal to Axios requests; account identity changes clear the shared cache so user-scoped results cannot survive a logout/account-switch boundary; queries that may return private records also include the viewer identity in their query key. Client role checks never protect data.

Test pure logic with Node; server contracts with Laravel; navigation, deep links, role redirects and responsive behavior with Playwright. Shared UI tests cover semantic color tokens, theme persistence, component accessibility and React SSR output. Direct messaging must remain available when Inquiry is disabled.
