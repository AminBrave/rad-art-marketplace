# Changelog

All notable project changes are recorded here.

## [0.7.0-alpha] - 2026-11-08
### Added
- Buyer role registration while preserving artist as the default registration role; public registration cannot create administrators.
- Private buyer-to-artist inquiries for public artist profiles, optionally associated with the artist's approved artwork.
- Buyer sent-inquiry history and artist-owned inbox with read/archive actions.
- Persian RTL contact form, buyer dashboard panel, and artist inbox.
- Rate limiting, honeypot validation, message length limits, and strict role/ownership scoping.
- Feature tests for buyer registration, role boundaries, inquiry ownership, public profile visibility, artwork association, and spam honeypot handling.

### Privacy
- Inquiry API responses omit sender and artist email addresses.
- Contact is an inquiry intake and tracking workflow, not real-time chat or a reply channel.

### Notes
- Apply the Phase 4 inquiry migration and run the Phase 4 smoke test before local acceptance.
- CI and local browser verification are pending.

## [0.6.0-alpha] - 2026-11-08
### Added
- Administrator-only artwork moderation queue with status filtering and pagination.
- Approve, reject, and request-changes decisions; rejection and revision requests require a note for the artist.
- Review audit fields recording the administrator and decision timestamp.
- Persian RTL moderation panel integrated into the administrator dashboard.
- Feature tests for role isolation, moderation decisions, required notes, and resubmission behavior.

### Security
- Moderation endpoints require the administrator role on the server.
- Only pending submissions can receive a moderation decision; artists cannot set moderation states through their submission/edit payloads.
- Artist edits clear previous review metadata and return the artwork to pending review.

### Notes
- Run the Phase 3 moderation smoke test after applying the new review-audit migration.
- CI and local browser verification are pending.

## [0.5.0-alpha] - 2026-11-08
### Added
- Category and artwork database migrations with starter Persian catalogue categories.
- Artist-owned artwork model, relationships, and authorization policy.
- Validated artwork submission/edit endpoints with server-assigned ownership and moderation state.
- Private image storage for JPG, PNG, and WebP uploads, with authorized image delivery.
- Approved-only public catalogue, category filtering, search, and artwork detail endpoints.
- Persian RTL artist artwork editor and public catalogue/detail interface.
- Feature tests for ownership, guest restrictions, upload validation, private image access, and public visibility.

### Security
- Artwork owner is derived from the authenticated artist profile, never from client input.
- Uploaded images are type/size validated, stored outside public paths, and served through policy-protected routes.
- Public catalogue queries expose approved artwork only; artist edits return records to pending review.

### Notes
- Admin moderation queue/actions, image transformations, and pagination controls in the UI remain future work.
- Local artwork upload/browser smoke testing is still required.

## [0.4.0-alpha] - 2026-11-08
### Added
- One-to-one artist profile model and migration with unique user ownership and public slug.
- Validated profile create/read/update endpoints and owner/admin authorization policy.
- Public profile pages by slug with private-profile visibility protection.
- Persian RTL artist profile editor for biography, city, website, Instagram handle, and visibility.
- Feature tests for profile creation, validation, editing, guest access, cross-user denial, public/private visibility, and admin access.
- Local artist-profile smoke-test guide.

### Security
- Profile ownership is assigned from the authenticated session, never from client input.
- Artists cannot view or modify another artist's private profile.
- Administrators can view and edit all profiles through authenticated endpoints.

### Notes
- Artist avatar uploads remain future work; artwork image uploads and ownership policies are covered by the Phase 2 catalogue foundation.

## [0.3.0-alpha] - 2026-11-08
### Added
- Session-based artist registration, login, current-user, and logout endpoints under /api/v1/auth.
- User roles with artist as the public-registration default and admin as a server-provisioned role.
- Server-side role middleware and admin user listing/role-management endpoints.
- Artisan command to promote an existing account to administrator.
- User and password-reset-token database migration.
- Persian RTL registration/login interface and a basic admin user-management view.
- Feature tests for registration, password validation, login/logout, role isolation, and admin user management.

### Security
- Public registration cannot assign an administrator role.
- Passwords use Laravel's hashed cast; auth routes are rate-limited.
- Browser auth uses Laravel's session guard and CSRF-protected web middleware.
- Admin operations require authenticated administrator role on the server.

### Notes
- This milestone is implemented on feature/phase-1-identity-permissions and is awaiting CI/local verification.
- Email verification, password-reset UX, artist profile editing, and ownership policies for future artwork resources remain open.

## [0.2.0-alpha] - 2026-11-08
### Added
- Initial Laravel 13 application bootstrap and configuration.
- Versioned API health endpoint at GET /api/v1/health.
- React 18 + Vite application entrypoint and Persian RTL landing page.
- Tailwind CSS, Axios, and Radix Dialog frontend dependency baseline.
- PHPUnit health endpoint feature test and Laravel Pint/ESLint scripts.
- GitHub Actions workflow for backend tests/style and frontend lint/build.
- Apache rewrite rules and initial storage directory placeholders for shared-hosting deployment.

### Changed
- Selected Laravel 13 and PHP 8.3+ rather than Laravel 11 after Composer security-advisory checks blocked the Laravel 11 dependency set.
- Removed the npm cache dependency on a lockfile that does not yet exist.
- Expanded setup, quality-check, and deployment instructions.

### Notes
- This is an initial development scaffold, not a feature-complete or production-ready marketplace.
- Dependency installation, local execution, and CI execution have not yet been verified.
- Hosting PHP 8.3+ and required extensions remain to be confirmed.

## [0.1.0-mvp] - 2026-11-08
### Added
- Initial product scope and MVP boundaries.
- Repository agent guidance, engineering workflow, and roadmap.
- Initial documentation baseline for a Persian-first, RTL art marketplace.

### Notes
- A documentation baseline, not a completed or deployable application.
