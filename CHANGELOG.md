# Changelog

Notable project changes are recorded here in reverse chronological order. Dates describe repository milestones, not production releases.

## [Unreleased]

### Added
- Contemporary Art Editorial design tokens for palette, semantic colors, typography, spacing, shape, elevation, and layout.
- Vazirmatn and Inter font loading, accessible focus styling, reduced-motion support, and a development-only design foundation specimen.
- Tailwind semantic aliases and design foundation usage documentation.
- Central React Router route tree, Persian public shell, and role-specific artist, buyer, and admin workspaces.
- Session-aware route guards, login/register routes, unauthorized and not-found screens, and a Laravel SPA fallback for deep-link refresh.
- Routing documentation; Laravel remains authoritative for API authorization and ownership.

### Changed
- Configured ESLint to recognize React component usage in JSX and browser URL APIs; adjusted the auth hook export for Fast Refresh.
- Made SPA route feature tests independent of a generated Vite manifest.
- Added a post-merge QA checklist covering public routes, role boundaries, workspaces, RTL, accessibility, responsiveness, and release gates.
- Promoted the agreed `cleaned-MVP-1` MVP 1 snapshot to `main` through PR #34; `main` is now the active integration branch.
- Merged MVP 2 baseline documentation, Contemporary Art Editorial design foundations, and centralized routing through PRs #31, #35, and #36.
- Updated contributor and roadmap guidance to branch from and target `main`.

## [0.8.0-alpha] - 2026-11-09

### Added
- cPanel deployment guide with PHP 8.3, extension, document-root, private-storage, mail, and smoke-test gates.
- Database and private-artwork backup/restore runbook with restore-drill requirements.
- Privacy-conscious analytics event and metric baseline; no analytics provider or tracking script is enabled.
- Release checklist and known-limitations register.
- README links to operational and release documentation.

### Notes
- Documentation does not replace host verification, production mail configuration, a successful restore drill, or browser/device smoke testing.

## [0.7.0-alpha] - 2026-11-08

### Added
- Buyer role registration while preserving Artist as the default registration role; public registration cannot create administrators.
- Private buyer-to-artist inquiries for public artist profiles, optionally associated with the artist's approved artwork.
- Buyer sent-inquiry history and artist-owned inbox with read/archive actions.
- Persian RTL contact form, buyer dashboard panel, and artist inbox.
- Rate limiting, honeypot validation, message length limits, and strict role/ownership scoping.
- Feature tests for buyer registration, role boundaries, inquiry ownership, public profile visibility, artwork association, and honeypot handling.

### Privacy
- Inquiry API responses omit sender and artist email addresses.
- Contact is an inquiry-intake and tracking workflow, not real-time chat or a reply channel.

### Notes
- Apply the inquiry migration and follow the Phase 4 smoke test before local acceptance.
- The recorded CI run passed 36 tests (149 assertions), Pint, ESLint, and the Vite production build. Local browser smoke testing remains pending.

## [0.6.0-alpha] - 2026-11-08

### Added
- Administrator-only artwork moderation queue with status filtering and pagination.
- Approve, reject, and request-changes decisions; rejection and revision requests require a note.
- Review audit fields recording the administrator and decision timestamp.
- Persian RTL moderation panel integrated into the administrator dashboard.
- Feature tests for role isolation, moderation decisions, required notes, and resubmission behavior.

### Security
- Moderation endpoints require the administrator role on the server.
- Only pending submissions can receive a moderation decision; artists cannot set moderation states through submission/edit payloads.
- Artist edits clear previous review metadata and return the artwork to pending review.

### Notes
- Follow the Phase 3 moderation smoke test after applying the review-audit migration. CI and local browser verification were pending in the original milestone note.

## [0.5.0-alpha] - 2026-11-08

### Added
- Category and artwork migrations with starter Persian catalogue categories.
- Artist-owned artwork model, relationships, and authorization policy.
- Validated artwork submission/edit endpoints with server-assigned ownership and moderation state.
- Private image storage for JPG, PNG, and WebP uploads, with authorized image delivery.
- Approved-only public catalogue, category filtering, search, and artwork detail endpoints.
- Persian RTL artist artwork editor and public catalogue/detail interface.
- Feature tests for ownership, guest restrictions, upload validation, private image access, and public visibility.

### Security
- Artwork ownership is derived from the authenticated artist profile, never from client input.
- Uploaded images are type/size validated, stored outside public paths, and served through policy-protected routes.
- Public catalogue queries expose approved artwork only; artist edits return records to pending review.

### Notes
- The original milestone deferred admin moderation queue/actions, image transformations, and pagination controls in the UI; moderation was added in the following milestone.
- Local artwork upload/browser smoke testing remained required.

## [0.4.0-alpha] - 2026-11-08

### Added
- One-to-one artist profile model and migration with unique user ownership and public slug.
- Validated profile create/read/update endpoints and owner/admin authorization policy.
- Public profile pages by slug with private-profile visibility protection.
- Persian RTL artist profile editor for biography, city, website, Instagram handle, and visibility.
- Feature tests for profile creation, validation, editing, guest access, cross-user denial, public/private visibility, and admin access.
- Local artist-profile smoke-test guide.

### Notes
- Artist avatar uploads were not included.

## [0.3.0-alpha] - 2026-11-08

### Added
- Session-based registration, login, current-user, and logout endpoints under `/api/v1/auth`.
- Artist and Admin roles at the initial identity milestone; Buyer registration was added later.
- Server-side role middleware and admin user listing/role-management endpoints.
- Artisan command to promote an existing account to administrator.
- User and password-reset-token database migration.
- Persian RTL registration/login interface and basic admin user-management view.
- Feature tests for registration, password validation, login/logout, role isolation, and admin user management.

### Security
- Public registration could not assign an administrator role.
- Passwords use Laravel's hashed cast; auth routes are rate-limited.
- Browser auth uses Laravel's session guard and CSRF-protected web middleware.
- Admin operations require authenticated administrator role on the server.

### Notes
- Email verification and password-reset user experience remain unimplemented.

## [0.2.0-alpha] - 2026-11-08

### Added
- Initial Laravel 13 application bootstrap and configuration.
- Versioned API health endpoint at `GET /api/v1/health`.
- React 18 + Vite application entrypoint and Persian RTL landing page.
- Tailwind CSS, Axios, and Radix Dialog frontend dependency baseline.
- PHPUnit health endpoint feature test and Laravel Pint/ESLint scripts.
- GitHub Actions workflow for backend tests/style and frontend lint/build.
- Apache rewrite rules and initial storage directory placeholders for shared-hosting deployment.

### Changed
- Selected Laravel 13 and PHP 8.3+ rather than Laravel 11 after Composer security-advisory checks blocked the Laravel 11 dependency set.
- Removed the npm cache dependency on a lockfile that did not yet exist.
- Expanded setup, quality-check, and deployment instructions.

### Notes
- This was an initial development scaffold, not a feature-complete or production-ready marketplace.
- Hosting PHP 8.3+ and required extensions remained to be confirmed.

## [0.1.0-mvp] - 2026-11-08

### Added
- Initial product scope and deferred-feature boundaries.
- Repository agent guidance, engineering workflow, and roadmap.
- Initial documentation baseline for a Persian-first, RTL art marketplace.
