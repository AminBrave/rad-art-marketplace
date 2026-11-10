## 2026-11-10 — M05-T06 in-app message notifications (implementation in review)

### Added
- Added database-backed recipient-only notifications when a new conversation message is persisted.
- Added notification list, unread count, mark-one/read-all endpoints, per-user in-app preferences and conversation deep links.
- Added a notification center in Buyer and Artist workspace headers with 30-second refresh and preference control.
- Notification payloads contain sender display name and conversation/message identifiers only; message body and email are excluded.

### Verification boundary
- Implementation branch: `feat/m05-in-app-notifications`; CI and manual acceptance are pending.
- Email notifications remain disabled (`email_available=false`) until the target host has verified mail configuration and a queue worker/retry setup. This code does not send email synchronously.
- Real-time push, typing/presence, private attachments, reporting/blocking and moderation remain separate M05 tasks.

## 2026-11-10 — M06-T09 SEO and shareability (merged; external verification pending)

### Added
- Added server-rendered page titles/descriptions, canonical URLs, robots directives, Open Graph/Twitter metadata and factual JSON-LD for artwork, artist and published-collection detail pages.
- Added a dynamic XML sitemap containing only public artist profiles, approved artworks belonging to public profiles, published collections and public static pages.
- Added a robots.txt route that uses the configured APP_URL and keeps authenticated workspaces out of crawl paths without blocking public artwork image URLs.
- Added backend feature tests and manual smoke-test steps for public/private visibility and configured-origin behavior.

### Verification boundary
- Merged through [PR #109](https://github.com/AminBrave/rad-art-marketplace/pull/109) as `1956800995f3a8ab52bbc2fab7adcf4b72a0d9dc`.
- GitHub Actions [run #42828385872](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42828385872) passed: 80 backend tests / 787 assertions, PHP style, frontend tests/lint/build, and 22 Chromium browser tests.
- External social-preview/crawler verification on the deployed hostname and product-owner review remain pending.
- A passing local HTML test does not prove that external search/social crawlers have fetched, cached or indexed the deployed pages.

# Changelog

## 2026-11-10 — M05-T03 message actions (merged; manual acceptance pending)

### Added
- Added sender-authorized message editing and deletion. Deletion clears the stored body and reactions, then retains a content-free soft-delete tombstone for conversation continuity.
- Added same-conversation quoted replies in the API and buyer/artist chat UI.
- Added allow-listed emoji reactions with participant-level uniqueness and idempotent add/remove behavior.
- Added message edit/read/delivery indicators and responsive Persian controls.
- Added backend regression coverage for sender ownership, deletion retention, reaction idempotency, and quoted reply context.

### Verification boundary
- Merged through [PR #107](https://github.com/AminBrave/rad-art-marketplace/pull/107) as `07a48d082b49efb53f1f38377abdd9c13a1c848b`.
- GitHub Actions [run #42826223056](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42826223056) passed: 74 backend tests / 750 assertions, PHP style, frontend tests/lint/build, and 22 Chromium browser tests.
- Product-owner manual retest of the new message-action UI remains pending.
- M05 WebSocket delivery, typing/presence, private attachments, notifications/email, archive/mute/search, reporting/blocking and moderation remain outstanding.
- `delivered_at` still means server acceptance/persistence, not device-level delivery. No end-to-end encryption or malware-scanning claim is made.

## 2026-11-10 — M05 core direct messaging integrated

### Added
- Added canonical one-to-one buyer–artist conversations keyed by participant pair, with inquiry and artwork references preserved as context.
- Added buyer and artist inbox/thread screens, direct-message entry points from public artist profiles and approved artwork, message history, send/retry, unread counts/read receipts, and five-second polling.
- Added idempotent demo data for 70 conversations and 140 messages across five demo buyers and 14 public artist profiles.

### Verification
- Core messaging implementation and demo data merged through [PR #103](https://github.com/AminBrave/rad-art-marketplace/pull/103) and [PR #105](https://github.com/AminBrave/rad-art-marketplace/pull/105).
- Main CI run [#42816226028](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42816226028) passed backend tests/style, frontend lint/build, and buyer browser regression tests.
- Product-owner manual acceptance: the user reports all checks passed and no issues found on the QA branch.
- Real-time push, typing/presence, attachments, notifications/email, reporting/blocking and moderation are not part of this integrated core.

## 2026-11-10 — M04 artist experience implementation merged

### Added
- Added a guided artist start checklist based on five explicit profile fields and the real server-reported artwork total; the checklist is not presented as an artistic quality score or analytics metric.
- Added an owner-only preview path for private artist profiles without changing their visibility setting.
- Added browser-side image type, file-size, decode, and 6000 × 6000 pixel dimension checks before artwork upload.
- Explained pending, approved, rejected, and changes-requested moderation outcomes with actionable next steps and the actual moderator feedback.
- Clarified the meaning and limitations of new, read, and archived inquiry states.

### Verification in progress
- Added backend regression coverage for private profile preview isolation, frontend contract tests, and Chromium journeys for onboarding, oversized image rejection, moderation feedback, and inquiry lifecycle.
- Merged through [PR #99](https://github.com/AminBrave/rad-art-marketplace/pull/99) as `b9892632cf7a2773b9a6b600ff39f71cbce4f446`.
- PR CI run [#42787611474](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42787611474) passed all three jobs: 59 backend tests / 358 assertions, Laravel Pint, frontend lint/build, and 22 Chromium tests. Post-merge main CI [run #42787835227](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42787835227) passed all three jobs.
- Product-owner visual/functional acceptance remains a separate milestone closeout step.

## 2026-11-10 — M00 browser regression coverage

### Added
- Added a Chromium browser CI job running against the Laravel-served React app with isolated SQLite and deterministic API fixtures.
- Added buyer inquiry browser checks for history/detail navigation, direct deep links, refresh, back navigation, guest/wrong-role redirects, not-found privacy behavior, and mobile overflow.
- Added artist overview server-total and artwork null/zero/positive price rendering checks.
- Final [CI run #42721783132](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42721783132) passed all 9 browser tests plus backend and frontend checks.

### Remaining release gates
Manual cross-browser/device, accessibility/RTL, measured performance, target-host, and backup/restore verification remain outstanding; M00 is not yet signed off for production readiness.


## 2026-11-10 — M00 foundation implementation integrated

### Changed
- Merged [PR #85](https://github.com/AminBrave/rad-art-marketplace/pull/85): registered the buyer inquiry detail route under the buyer role guard and added SPA deep-link fallback regression coverage.
- Merged [PR #87](https://github.com/AminBrave/rad-art-marketplace/pull/87): committed Composer/npm lockfiles and switched CI installation to composer install / npm ci.
- Merged [PR #86](https://github.com/AminBrave/rad-art-marketplace/pull/86): corrected artist artwork totals using server paginator metadata and clarified null/zero price display semantics.

### Verification
- Latest main commit: 6da7d608333ba046a90cc050808854f0d2767474.
- [CI run #42715135296](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42715135296) passed backend tests/style, frontend unit tests, lint and production build.
- Browser E2E, manual accessibility/responsive/RTL QA, performance measurement, production-host and backup/restore verification remain outstanding. M00 is implementation-complete but not fully signed off.


## 2026-11-09 — Comprehensive local demo dataset

### Added
- Made `DatabaseSeeder` invoke a repeatable demo seeder for local and testing environments.
- Added 22 demo users: 1 admin, 14 artist accounts (13 public profiles and 1 private profile), 3 artists with incomplete profiles, and 4 buyers.
- Added six active categories and one inactive category, plus 70 artworks spanning all moderation statuses and availability states.
- Added 48 inquiries covering new, read, and archived states, including inquiries with and without linked artworks.
- Generated synthetic SVG artwork thumbnails on Laravel's private local storage disk.
- Added feature tests for dataset coverage, repeatability, seeded account access, and admin/buyer pagination; documented credentials and QA scenarios in `docs/demo-data.md`.

### Safety and verification
- The seeder runs only when `APP_ENV` is `local` or `testing`; it does not truncate tables or delete records and updates matching demo records by stable identifiers.
- All demo accounts use the documented shared password `Demo@12345`; these public test credentials must never be used for real or production accounts.
- Merged in [PR #54](https://github.com/AminBrave/rad-art-marketplace/pull/54). CI passed: 48 backend tests / 278 assertions, Laravel Pint, frontend ESLint, and the Vite production build.

## 2026-11-09 — Guest session bootstrap and local build workflows

### Changed
- Made `GET /api/v1/auth/me` a public session-bootstrap endpoint: guests receive HTTP 200 with `{"data": null}`, while authenticated sessions continue to receive the user payload.
- Kept logout protected and added guest/post-logout regression coverage.
- Added `npm run dev:local` to start Laravel, HTTPS Vite/HMR, and Caddy together on local development machines.
- Added `npm run build:cpanel` to lint and compile frontend production assets for cPanel packaging.

### Verification boundary
- Automated regression coverage and CI passed for the merged change. The local runner still requires PHP, Node/npm, Caddy 2.8+, a trusted Caddy local CA, and an available local HTTPS port.

## 2026-11-09 — HTTPS and modern HTTP protocol support

### Changed
- Added production HTTP-to-HTTPS redirection and a one-year HSTS header for secure responses; subdomains and preload are deliberately excluded until separately verified.
- Added an optional Caddy-based local HTTPS reverse proxy with Vite HMR routing and loopback-only backend/dev-server bindings.
- Added deployment guidance for provider-managed HTTP/2 and HTTP/3/QUIC enablement and external protocol verification.

### Verification boundary
- Repository configuration and documentation do not enable HTTP/2 or HTTP/3 on a production cPanel account. The hosting provider must enable those protocols, and the live hostname must be externally tested before claiming support.


Notable repository changes are listed newest first. Entries describe implementation milestones and repository maintenance, not production releases. The current package version is not used as a release tag.

## 2026-11-09 — Performance and visual stability hardening (implementation merged; measurement pending)

### Changed
- Added a static first-paint skeleton and shared page-shaped route loading placeholders; public/workspace layout shells remain mounted during route chunk loading.
- Split public pages and workspace dashboards into lazy-loaded feature bundles; artist artwork and inquiry tools load only when opened.
- Changed public artist portfolios and artist-owned artwork lists to 12-item simple pagination, avoiding unbounded payloads and total-count queries; added frontend navigation and backend regression coverage.
- Eager-loaded the artist profile relationship in the artist-owned artwork list after code review identified an avoidable per-row relationship query.
- Set Google Fonts to `display=optional` to reduce late font-swap layout shifts.

### Verification boundary
- The implementation was merged to `main` through [PR #49](https://github.com/AminBrave/rad-art-marketplace/pull/49). CI passed for the merged PR, including backend tests/style, frontend lint, and the Vite production build.
- Lighthouse, Core Web Vitals, repeated browser-level CLS, real database query plans, bundle-size baselines, and production-host measurements remain outstanding. No score or zero-shift claim is made.

## 2026-11-09 — MVP 2 Stage 6: QA hardening (verification in progress)

### Changed
- Added a localized fallback when artwork-card images fail to load.
- Artwork cards now lazy-load and asynchronously decode off-screen imagery; the homepage hero and artwork detail image are eager/high-priority.
- Reserved responsive aspect ratios for artwork detail imagery to reduce avoidable layout shift.
- Expanded QA, manual smoke-test, design-system, and release documentation with source-level findings and explicit external verification steps.

### Verification boundary
- Source review confirmed Persian document language/direction, Vazirmatn/Inter font declarations, existing visible focus and reduced-motion rules, and the inspected LTR account fields.
- Browser/device accessibility, measured performance baselines, production-host compatibility, backup automation, and restore drills remain unverified; Stage 6 is not signed off for production.


## 2026-11-09 — MVP 2 Stage 5: Admin workspace

### Added
- Admin overview with pending artwork and total user counts derived from existing paginated API responses.
- Artwork moderation queue with URL-backed status filters, server pagination, previews, required notes, and approve/reject/request-changes actions for pending work only.
- Paginated user management with supported Artist/Admin role assignment and self-demotion restrictions.
- Loading, empty, error, permission, and success feedback across admin pages.

### Scope
- Reused existing admin endpoints and server authorization; no API, schema, or dependency changes.
- No fabricated analytics, user search, Buyer-role assignment, deletion, suspension, or category/report management.

### Verification
- Automated CI results are recorded on the Stage 5 pull request. Manual browser/device and accessibility checks remain part of Stage 6 QA.


## 2026-11-09 — MVP 2 Stage 4: Buyer workspace

### Added
- Buyer overview with API-reported total sent inquiries and latest inquiry.
- Paginated, sender-scoped inquiry history with artist/artwork context and server-reported status.
- Dedicated inquiry detail routes that support direct navigation and browser refresh.
- Loading, empty, error, pagination, unauthorized, and not-found handling.
- Reused the existing buyer inquiry API, role guard, shared workspace shell, and UI primitives. No backend endpoint, schema, or dependency was added.

### Scope
- Buyer status remains read-only; only artists can mark inquiries read/archive.
- No replies, chat, email delivery, or unsupported buyer account settings.

### Verification
- Automated CI results are recorded on the Stage 4 pull request. Manual browser/device checks remain part of Stage 6 QA.

## 2026-11-09 — MVP 2 Stage 3: Artist workspace

### Added and refined
- Replaced the minimal artist landing view with a profile-aware workspace overview using real artwork and inquiry API responses.
- Refined artist artwork management with server-aligned fields, image preview, client-side format/size guidance, upload progress, field-level validation feedback, and recoverable errors.
- Added a dedicated paginated inquiry inbox and API-backed detail view with recipient-scoped read/archive actions.
- Reused the existing role-aware layout, centralized React Router, Axios session behavior, and shared UI primitives. No new runtime dependency or API endpoint was added.
- Kept unsupported artwork deletion, inquiry replies, chat, and email delivery out of the workspace.

### Verification
- Automated CI results are recorded on the Stage 3 pull request. Manual browser/device checks remain part of Stage 6 QA.

## 2026-11-09 — Documentation and repository cleanup

- Rewrote README, roadmap, contributor instructions, engineering practices, API reference, architecture, and route documentation to match the current implementation and MVP 2 stages.
- Consolidated five legacy feature smoke-test files into `docs/manual-smoke-tests.md` and removed the superseded Stage 1 API audit after its decisions were incorporated into current references.
- Updated QA, release, and cPanel guidance; clarified which checks and hosting steps remain unverified.
- Added a mandatory same-PR documentation update policy to `AGENTS.md`, `SKILLS.md`, and the GitHub delivery tracker, plus a pull-request template checklist.
- Closed obsolete stacked MVP 1 pull requests #2–#5; their historical branches were retained for traceability.

## 2026-11-09 — MVP 2 Stage 2: Public marketplace

### Added
- Editorial public homepage using approved artwork, active categories, and public artist content.
- Public artwork catalogue with URL-persisted search/category filters and server pagination.
- Artwork detail pages with artist context and buyer inquiry entry point.
- Searchable, paginated public artist directory and artist profiles with approved-only portfolios.
- Persian About, Help, and Contact pages; public navigation and footer.
- Safe `GET /api/v1/artists` directory endpoint with allow-listed profile fields and bounded pagination.

### Changed
- Public artwork payloads omit moderation status and rejection notes.
- API reference and delivery roadmap reflect the current public marketplace.

### Verification
- PR #42 merged to `main` as `a9f6a2222e9e57fdd78de6662b3bc1dc1b66f8e4`.
- CI passed: 40 backend tests / 204 assertions, PHP style, frontend lint, and Vite production build.
- Manual browser/device QA and production-host verification remain outstanding.

## 2026-11-09 — MVP 2 Stage 1: Foundation and audit

### Added
- Contemporary Art Editorial design foundations, Persian-first typography, semantic tokens, focus styling, reduced-motion support, and development specimen.
- Central React Router, session-aware route guards, public shell, and role-aware artist, buyer, and admin workspaces.
- Shared UI components for controls, cards, tabs, dropdowns, dialogs, breadcrumbs, pagination, loading, empty/error/permission states, upload feedback, and toasts.
- MVP 2 API/UX audit covering public artist discovery, catalogue pagination, private image delivery, and workspace summary data.

### Changed
- Public artwork catalogue uses shared controls/cards and consistent feedback states.
- `main` is the active integration baseline; `cleaned-MVP-1` is historical only.

### Verification
- Shared component PR #39 passed backend tests/style, frontend lint, and production build.
- Audit documentation PR #41 was documentation-only.
- Manual keyboard, responsive/device, image/upload, and production-host checks remain outstanding.

## 2026-11-09 — Integration and quality baseline

- Reconciled the MVP 1 implementation baseline and promoted it to `main`.
- Added post-merge CI cleanup and the manual QA checklist.
- Updated contributor instructions and roadmap to use `main` as the only active integration branch.

## 2026-11-08 — MVP 1 feature milestones

### Buyer and artist inquiries
- Added Buyer registration, private buyer-to-artist inquiry intake, buyer sent-inquiry history, and artist read/archive controls.
- Added rate limiting, honeypot validation, bounded message fields, and strict role/ownership scoping.
- Inquiry payloads omit both parties' email addresses. This feature is not chat, replies, or email delivery.

### Artwork moderation
- Added admin-only moderation queue and approve/reject/request-changes actions.
- Required notes for rejection and change requests; added reviewer/timestamp audit fields.
- Artist edits return artwork to pending review and clear previous review metadata.

### Artwork catalogue
- Added categories, artist-owned artwork submission/editing, private image storage, approved-only public catalogue, search, and artwork detail API/UI.
- Uploads accept JPG/JPEG/PNG/WebP, max 5 MB and 6000 × 6000 pixels.

### Identity and artist profiles
- Added session-based registration/login/current-user/logout, Buyer/Artist/Admin roles, and server-side role boundaries.
- Added artist profiles with public/private visibility and owner/admin policies.
- Public registration cannot create an Admin; administrator access is provisioned server-side.

### Initial application foundation
- Added Laravel 13 / PHP 8.3+ application, React 18/Vite frontend, Tailwind CSS, Axios, Radix UI, PHPUnit, Pint, ESLint, and GitHub Actions CI.
- Added versioned API health endpoint, initial Persian/RTL shell, and cPanel-oriented deployment guidance.


## 2026-11-10 — M02 discovery experience (PR #92 merged)

- Reworked the public homepage around approved new work, active category discovery, and public artist spotlights.
- Expanded catalogue filters to medium, availability, and eight server-validated sort modes while preserving shareable URL state and pagination.
- Added related public works to artwork detail pages and category filtering within artist portfolios.
- Enforced public artist-profile visibility consistently across catalogue, filter metadata, artwork detail, related work, and image authorization.
- Added page-specific metadata, detail-image failure fallback, backend feature coverage, and Chromium discovery browser regressions.
- Merged as `3a634308494e4ebb8b93d3768b06f8ff581bce0a`; PR CI run #42724547388 and post-merge main CI run #42724722130 passed all three jobs, including 16 Chromium browser tests.
