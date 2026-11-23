# Rademan — current implementation handoff

## Objective
Redesign the complete Rademan codebase presentation as a mobile-first, desktop-capable, Persian RTL application with an Instagram-inspired image-first interaction model. The redesign replaces the previous visual architecture rather than layering another theme on top.

## Repository and branches
- Repository: `AminBrave/rad-art-marketplace`.
- Owner-provided baseline: `agent/chatgpt`.
- Working branch: `agent/instagram-design-system`.
- Draft review: PR #278 targeting `agent/chatgpt`.
- Historical issues and pull requests were not used as design references.

## Implementation completed on the working branch
- Replaced the token and palette foundation in `resources/css/app.css`.
- Added `resources/css/rademan.css` for responsive application shell and page composition.
- Removed the old `instagram.css` and `application-shell.css` adapters.
- Rebuilt Tailwind semantic aliases around the new tokens.
- Added semantic component slots to shared UI primitives.
- Rebuilt the Discover home as an image-led art feed with category exploration, new artworks, artist profiles and editorial collections.
- Rebuilt artwork and artist cards as creator-first, image-led discovery components.
- Added page markers and new compositions for public discovery, catalogue, artist directory/profile, authentication, collections, buyer/artist/admin homes and messaging.
- Removed the old development-only application preview and its unused legacy screens.
- Added Persian RTL PWA manifest, app icon, standalone metadata, service-worker registration and offline fallback.
- Worker caching is restricted to a static offline fallback and eligible versioned same-origin assets; private data is excluded.
- Rewrote design-system, component catalogue, project and reconstruction documentation and design tests.

## Preservation constraints
Existing Laravel APIs, database schema, routes, auth, role restrictions, server-side authorization, TanStack Query behavior, conversation identity, attachments, message safety and backend policies must remain intact. No new checkout/payment/order features or unsupported social features are implied.

## Verification status
The source changes are pushed to the working branch. Tests, lint, production build, browser automation, screenshot review, accessibility scans and real-device PWA installation have not been executed in this environment. The draft PR must remain unmerged until those checks pass.

## Next work
1. Review all remaining route-level feature screens and shared components for any old page-specific visual structures.
2. Run the JavaScript/PHP test suites and production build in a project-capable runtime.
3. Exercise guest, buyer, artist and admin journeys at phone, tablet and desktop sizes.
4. Review RTL and light/dark behavior, especially messaging, dialogs, tables, upload forms and moderation flows.
5. Verify installability and offline fallback on Android, iOS and desktop browsers.
