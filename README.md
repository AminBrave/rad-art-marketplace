# Rad Art Marketplace

A Persian-first, RTL-friendly marketplace MVP that helps artists present original artwork and helps visitors discover and contact artists.

## Product scope

### In scope
- Public homepage and curated/featured artwork
- Artwork catalogue with search and category filters
- Artwork detail pages
- Public artist profiles
- Artist registration, login, and dashboard
- Artwork submission with images, specifications, price, and availability
- Admin review workflow: approve, reject, or request revisions
- Buyer-to-artist contact entry point
- Admin management of users, categories, artworks, moderation, reports, and featured placements
- About, help, legal, and contact pages
- Responsive layouts, baseline security, backups, and analytics

### Explicitly out of scope for this MVP
Payments, cart/checkout, orders, shipping, in-app chat, mobile apps, AI recommendations, social graph, automated subscriptions, and advertising systems.

## Technology
- Backend: Laravel 13 (PHP 8.3+)
- Frontend: React 18 + Vite
- UI: Tailwind CSS + Radix UI
- Database: MySQL
- HTTP client: Axios
- Locale: Persian-first, RTL, with Jalali date presentation where appropriate
- Hosting target: cPanel shared hosting; do not assume root access, long-running daemons, or process managers

> Hosting compatibility is not yet confirmed. Laravel 13 requires PHP 8.3 or newer. Confirm that the target cPanel account provides PHP 8.3+ and the required PHP extensions before proceeding with deployment. If it does not, hosting or framework-version strategy must be revisited rather than bypassing Composer security advisories.

## Roles
- **Guest:** browse published artworks and artist profiles; contact artists through the defined public contact flow.
- **Artist:** manage own profile and submitted artworks; view moderation status and feedback.
- **Admin:** manage users, categories, artworks, moderation, reports, and featured placements.

All authorization must be enforced server-side. Hiding UI controls is not authorization.

## Current implementation

### Phase 0 — Foundation
- Laravel 13 application bootstrap and versioned API health endpoint at GET /api/v1/health
- React/Vite Persian RTL landing page
- Tailwind CSS, Axios, and Radix UI dependency baseline
- PHPUnit feature test, Laravel Pint, ESLint, and GitHub Actions CI

### Phase 1 — Identity and permissions
- Session-based endpoints: POST /api/v1/auth/register, POST /api/v1/auth/login, GET /api/v1/auth/me, POST /api/v1/auth/logout
- Public registration always creates an Artist; the role field supplied by a client is ignored.
- Admin endpoints: GET /api/v1/admin/users and PATCH /api/v1/admin/users/{user}/role
- Role middleware enforces administrator access on the server.
- Promote a registered account with: php artisan users:make-admin admin@example.com
- Persian RTL registration/login interface and basic administrator user-management view.

Email verification and password-reset UX are not yet implemented. Artist-owned artwork permissions are enforced by the artwork policy.

### Artist profiles
- One-to-one artist profile per account, with display name, biography, city, website, Instagram handle, and public/private visibility.
- Artists can create and edit only their own profile. Administrators can view and edit all profiles through the authenticated profile API.
- Public profile pages are available at /artists/{slug} and load data from GET /api/v1/artists/{slug}; private profiles are visible only to their owner and administrators.
- Authenticated profile endpoints: GET /api/v1/artist-profile/me, PUT /api/v1/artist-profile/me, GET /api/v1/artist-profiles/{id}, and PATCH /api/v1/artist-profiles/{id}.

## Local development

Prerequisites: PHP 8.3+, Composer, Node.js 22+, npm, and MySQL. Enable the PHP extensions required by Laravel, including PDO for MySQL. The test suite uses in-memory SQLite, so the PHP CLI must also have both `pdo_sqlite` and `sqlite3` enabled. On Windows, check the CLI configuration with `php --ini`, enable `extension=pdo_sqlite` and `extension=sqlite3` in the reported `php.ini`, open a new terminal, and verify with `php -m`. The target hosting PHP version and required extensions still need verification.

1. Install PHP dependencies: composer install
2. Create the local environment: cp .env.example .env
3. Generate the application key: php artisan key:generate
4. Configure database credentials in .env.
5. Run database migrations: php artisan migrate
6. Install frontend dependencies: npm install
7. Start Laravel: php artisan serve
8. Start Vite in another terminal: npm run dev
9. Open the local URL printed by Laravel (normally http://127.0.0.1:8000).

To grant administrator access to an already registered account, run the Artisan command from the server terminal: `php artisan users:make-admin email@example.com`. Do not add a public admin-registration path.

## Quality checks

Run after installing dependencies. On Windows, run these commands with the same PHP CLI executable used by Composer:
- Backend tests: composer test
- PHP style check: composer lint
- Apply PHP formatting fixes: composer lint:fix (then rerun composer lint)
- Frontend lint: npm run lint
- Frontend production build: npm run build

GitHub Actions runs backend tests/style checks and frontend lint/build on pushes to main or feature branches, and on pull requests targeting main.

## Deployment notes

- Point the web server document root at Laravel's public/ directory. Do not expose the repository root, .env, vendor/, or private storage.
- Configure production secrets and database credentials through the hosting environment; never commit them.
- Build frontend assets before deployment with npm run build.
- Run production dependency installation and database migrations during a controlled release.
- Ensure storage/ and bootstrap/cache/ are writable by the PHP process.
- Keep private uploads outside public paths. Serve only approved public artwork through controlled paths.
- A complete cPanel deployment and backup/restore runbook remains a Phase 4 deliverable.

## Engineering principles
1. Keep the MVP focused; do not introduce deferred commerce features.
2. Validate and authorize every write on the server.
3. Validate uploaded files by content/type, size, and safe storage location.
4. Keep private uploads outside the public web root where possible; serve approved public artwork through controlled paths.
5. Use migrations and seeders for reproducible database setup.
6. Cover authentication, role boundaries, moderation, and upload validation with tests.
7. Design for shared hosting and document deployment steps clearly.
8. Keep all user-facing layouts responsive and test RTL behavior.

## Project documentation
- [Agent guidance](AGENTS.md)
- [Skills and workflow](SKILLS.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Environment template](.env.example)
