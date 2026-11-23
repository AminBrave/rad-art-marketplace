# Reconstruction current state

## Baseline and scope
- Implementation baseline: product-owner-supplied `agent/chatgpt`.
- Work is isolated on `agent/instagram-design-system` and proposed against that baseline.
- Historical issues and pull requests were not used as references.
- Existing Laravel APIs, route definitions, data models, authentication, role policies and messaging contracts are preserved.

## New application system
- Replaced the old semantic palette and theme foundation in `resources/css/app.css` with a new Rademan token model.
- Added `resources/css/rademan.css` as the single responsive application/page composition layer.
- Removed the old `resources/css/instagram.css` and `resources/css/application-shell.css` adapters.
- Reworked Tailwind semantic aliases in `tailwind.config.js`.
- Added semantic `data-ui` contracts to shared React primitives and rebuilt artwork/artist cards as image-led discovery components.
- Added page-level composition markers for Discover, catalogue, artist directory/profile, authentication, collections, buyer/artist/admin homes and messaging.
- Removed the legacy development-only app preview and its unused demo screens from the application source.
- Reworked the design-system and UI/UX guidance to describe the new architecture.

## PWA
- Persian RTL web manifest, icon, standalone display, production service-worker registration and offline fallback are present.
- Worker cache policy is conservative: static offline fallback and eligible versioned same-origin assets only; it does not cache HTML navigations, API/auth responses, dashboards, admin or private conversations.

## Coverage and known gaps
- Design-system tests were rewritten to assert the new tokens, shared component contracts, page shell and route preservation.
- PWA tests assert manifest, registration and cache policy.
- Tests, production build, browser journeys, screenshots, accessibility scans and real-device PWA installation have not yet been executed in this environment.
- A complete code-level design pass is in progress; runtime QA is still required before merge or release.
