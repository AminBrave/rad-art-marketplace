# Changelog

Notable repository changes are listed newest first. Entries describe implementation milestones and repository maintenance, not production releases. The current package version is not used as a release tag.

## 2026-11-09 — Performance and visual stability hardening (in progress)

### Changed
- Added a static first-paint skeleton and shared page-shaped route loading placeholders; public/workspace layout shells remain mounted during route chunk loading.
- Split public pages and workspace dashboards into lazy-loaded feature bundles; artist artwork and inquiry tools load only when opened.
- Changed public artist portfolios and artist-owned artwork lists to 12-item simple pagination, avoiding unbounded payloads and total-count queries; added frontend navigation and backend regression coverage.
- Set Google Fonts to `display=optional` to reduce late font-swap layout shifts.

### Verification boundary
- Changes are on `perf/mvp2-app-performance-stability` and are not yet merged.
- Lighthouse, Core Web Vitals, real database query plans, browser-level CLS, and production-host measurements remain outstanding. No score or zero-shift claim is made.

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
