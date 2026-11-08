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
- Admin management of users, artworks, categories, reports, and featured placements
- About, help, legal, and contact pages
- Responsive layouts, baseline security, backups, and analytics

### Explicitly out of scope for this MVP
Payments, cart/checkout, orders, shipping, in-app chat, mobile apps, AI recommendations, social graph, automated subscriptions, and advertising systems.

## Technology
- Backend: Laravel 11 (PHP 8.2+)
- Frontend: React 18 + Vite
- UI: Tailwind CSS + Radix UI
- Database: MySQL
- HTTP client: Axios
- Locale: Persian-first, RTL, with Jalali date presentation where appropriate
- Hosting target: cPanel shared hosting; do not assume root access, long-running daemons, or process managers

> Hosting compatibility is not yet confirmed. Verify the target host's PHP version and required extensions before deployment; Laravel 11 requires PHP 8.2 or newer.

## Roles
- **Guest:** browse published artworks and artist profiles; contact artists through the defined public contact flow.
- **Artist:** manage own profile and submitted artworks; view moderation status and feedback.
- **Admin:** manage users, categories, artworks, moderation, reports, and featured placements.

All authorization must be enforced server-side. Hiding UI controls is not authorization.

## Current implementation

The first application scaffold is on the feature/phase-0-app-scaffold branch:
- Laravel 11 application bootstrap and a versioned API health endpoint at GET /api/v1/health
- React/Vite landing page with Persian content and RTL document direction
- Tailwind CSS, Axios, and Radix Dialog dependency baseline
- PHPUnit feature test, Laravel Pint, ESLint, and GitHub Actions CI configuration

The landing page is a visual starting point. Authentication, artwork catalogue, persistence, moderation, and contact workflows are not implemented yet.

## Local development

Prerequisites: PHP 8.2+, Composer, Node.js 20+, npm, and a MySQL instance. The host-specific PHP extension list still needs verification.

1. Install PHP dependencies: composer install
2. Create the local environment: cp .env.example .env
3. Generate the application key: php artisan key:generate
4. Configure database values in .env, then run migrations when the schema is introduced: php artisan migrate
5. Install frontend dependencies: npm install
6. Start Laravel: php artisan serve
7. Start Vite in another terminal: npm run dev
8. Open the local URL printed by Laravel (normally http://127.0.0.1:8000).

## Quality checks

Run after installing dependencies:
- Backend tests: composer test
- PHP style: composer lint
- Frontend lint: npm run lint
- Frontend production build: npm run build

GitHub Actions is configured to run backend tests/style checks and frontend lint/build on pushes to main or feature branches, and on pull requests targeting main.

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
