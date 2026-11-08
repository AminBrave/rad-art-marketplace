# Changelog

All notable project changes are recorded here.

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
