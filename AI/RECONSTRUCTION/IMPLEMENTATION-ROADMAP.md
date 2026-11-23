# Rademan application redesign roadmap

## Phase 1 — Design foundation and shell
- [x] Replace the legacy semantic palette with a single light/dark token system.
- [x] Remove the old Instagram adapter and application-shell stylesheets.
- [x] Add a unified responsive Discover and workspace shell.
- [x] Rebuild semantic Tailwind aliases and shared UI component contracts.
- [x] Rebuild image-led artwork and artist cards.
- [x] Remove the legacy development design preview and unused demo screens.

## Phase 2 — Product sections
- [x] Apply the new system to home/discovery, artwork catalogue/detail, artist directory/profile and auth.
- [x] Apply the new system to Buyer Studio, Artist Studio, Admin Console and messaging compositions.
- [x] Add page-level composition markers and shared primitive styling.
- [ ] Inspect every page state at phone, tablet and desktop sizes.
- [ ] Review every route in both light and dark themes.
- [ ] Complete messaging interaction and attachment visual QA.

## Phase 3 — PWA and quality
- [x] Add Persian RTL manifest, icon, standalone metadata and worker registration.
- [x] Add offline fallback and privacy-safe static asset caching.
- [x] Rewrite design-system and PWA tests for the new architecture.
- [ ] Execute the complete JS/PHP test suites.
- [ ] Execute production build and inspect generated assets.
- [ ] Run browser journeys, accessibility scans and screenshot review.
- [ ] Verify installation and offline fallback on Android, iOS and desktop browsers.

## Release gate
Do not mark the redesign production-ready until all unchecked runtime and QA items pass. No backend schema, authorization or API contract changes are part of this UI redesign.
