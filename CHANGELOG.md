# Changelog

All notable project changes are recorded here.

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
- Dependency installation, local tests/build, and CI execution have not yet been verified.
- Hosting PHP 8.3+ and required extensions remain to be confirmed.

## [0.1.0-mvp] - 2026-11-08
### Added
- Initial product scope and MVP boundaries.
- Repository agent guidance, engineering workflow, and roadmap.
- Initial documentation baseline for a Persian-first, RTL art marketplace.

### Notes
- A documentation baseline, not a completed or deployable application.
