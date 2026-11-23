# Rademan — product and application architecture

## Product
Rademan is a Persian-first, RTL visual art discovery marketplace connecting independent artists and buyers through artwork discovery, artist profiles, editorial collections and direct conversations.

The application adopts an Instagram-inspired interaction model—image-led discovery, creator-first identity, minimal navigation chrome and a compact mobile experience—without copying Instagram's proprietary assets, branding or unsupported features.

## Product surfaces
1. **Discover:** home, artworks, artwork detail, artist directory/profile, editorial collections, public information and authentication.
2. **Buyer Studio:** buyer overview and the canonical buyer–artist messaging inbox.
3. **Artist Studio:** overview, profile management, artwork/content management and the canonical messaging inbox.
4. **Admin Console:** dashboard, users/roles, artwork moderation, editorial curation, message reports and comment reports.
5. **Messaging:** one canonical conversation model shared by buyer and artist roles.

## New UI architecture
- `resources/css/app.css` is the sole token and theme foundation.
- `resources/css/rademan.css` defines the app shell, responsive page compositions and component presentation.
- `tailwind.config.js` maps utility classes to semantic tokens.
- `resources/js/components/ui/` contains the shared component primitives.
- `resources/js/app/Layouts.jsx` owns public and role-based app chrome.
- `resources/js/app/ThemeContext.jsx` owns system/light/dark theme preference.
- The old Instagram adapter and application-shell stylesheets are removed; the legacy design-system demo entry and unused screens are removed from the active app.

## Responsive product behavior
- Mobile-first from 320px, safe-area-aware fixed navigation and touch controls.
- Tablet layouts use compact navigation and content grids where useful.
- Desktop uses a centered content canvas, persistent Discover rail, role workspace navigation and two-pane messaging.
- Persian RTL and mixed Persian/Latin content are first-class.

## PWA
The application has a Persian RTL web manifest, app icon, standalone display configuration, production service-worker registration and static offline fallback. Cache policy is intentionally privacy-safe: static offline shell and eligible versioned assets only. Private API, auth, HTML navigation, workspace and conversation responses are never cached.

## Engineering boundaries
Preserve Laravel APIs, database schema, authentication, role restrictions, server-side authorization, routes, feature behavior, message identity, attachments, safety workflows, query caching and storage. UI redesign does not authorize new marketplace capabilities or backend contract changes.

## Source-of-truth
The product owner's supplied `agent/chatgpt` branch is the redesign baseline. Historical issues and pull requests are not design or implementation references. Feature behavior must be grounded in current source and tests.

## Release requirements
A complete visual implementation is not production-verified until tests, build, route journeys, responsive RTL review, theme review, accessibility checks, PWA installation and offline fallback are executed.
