# Changelog

Notable repository changes are listed newest first. Entries describe merged implementation milestones, not production releases. The current package version is not used as a release tag.

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

## 2026-11-09 — Documentation maintenance policy

Documentation is maintained alongside each feature. See [AGENTS.md](AGENTS.md) and [SKILLS.md](SKILLS.md) for mandatory update ownership and review rules.
