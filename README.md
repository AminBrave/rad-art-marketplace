# Rad Art Marketplace

A Persian-first, RTL-friendly art discovery marketplace. Artists publish work for review; visitors browse approved artwork and public artist profiles; registered buyers can send private inquiries to artists.

## Project status

This repository contains an evolving MVP implementation. The core identity, artist profile, artwork catalogue, moderation, and buyer-to-artist inquiry flows are implemented. Several administration and launch-readiness items remain incomplete; see [the roadmap](ROADMAP.md) and [release checklist](docs/release-checklist.md).

**This is not a production-ready commerce platform.** Payments, checkout, orders, shipping, and real-time messaging are not implemented.

## Product scope

### MVP capabilities

- Public homepage and approved artwork catalogue.
- Artwork search and active-category filtering.
- Artwork detail pages and public artist profiles.
- Session-based registration, login, current-user, and logout.
- Buyer and artist accounts; administrator accounts are provisioned separately.
- Artist profile creation/editing with public/private visibility.
- Artist-owned artwork submission and editing, with private image storage.
- Administrator artwork review: approve, reject, or request changes.
- Buyer-to-artist inquiries, buyer sent-inquiry history, and artist inbox with read/archive status.
- Persian-first, RTL-oriented React interface.

### Planned but not yet implemented

- Admin category management.
- Buyer reports and an abuse-moderation queue.
- Featured artwork/artist placements.
- About, Help, Legal, and Contact pages.
- Email verification and password-reset user experience.
- Comprehensive responsive/accessibility review and production launch verification.

### Explicitly deferred

Payments, cart/checkout, orders, shipping, in-app chat/replies, mobile apps, AI recommendations, social networking, subscriptions, and advertising.

## Technology

| Area | Current stack |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | React 18, Vite |
| UI | Tailwind CSS, Radix UI |
| Database | MySQL in deployment; SQLite in-memory for tests |
| HTTP client | Axios |
| Quality | PHPUnit, Laravel Pint, ESLint, Vite production build |
| Hosting target | cPanel shared hosting |

Laravel 13 requires PHP 8.3 or newer. The target cPanel account has not yet been verified. Do not bypass Composer platform checks or security advisories to accommodate an incompatible host.

## Roles and access

- **Guest:** browse approved artwork and public artist profiles.
- **Buyer:** register as a buyer, browse public content, submit inquiries to public artists, and view only their own sent inquiries.
- **Artist:** manage their own profile and artworks; view and update inquiries addressed to their own profile.
- **Admin:** manage users and moderate artwork across the platform.

Public registration accepts `artist` or `buyer`; if no role is supplied, the account defaults to `artist`. It rejects other roles, including `admin`. Administrators must be provisioned through the server-side Artisan command:

```bash
php artisan users:make-admin admin@example.com
```

Authorization and ownership are enforced server-side. Hiding a UI control is not an authorization boundary.

## Implemented behavior

### Authentication

Session-based endpoints are available under `/api/v1/auth`:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

Registration validates name, email, confirmed password (minimum 10 characters), and optional role. Login regenerates the session. Email verification and password-reset UX are not implemented.

### Artist profiles

Each artist account can own one profile containing display name, biography, city, website, Instagram handle, and visibility. Public profiles are addressed by slug at `/artists/{slug}`; the corresponding API endpoint is `GET /api/v1/artists/{slug}`. Private profiles are hidden from guests and other users; owners and administrators can access them through authorized endpoints.

Authenticated profile endpoints:

- `GET /api/v1/artist-profile/me`
- `PUT /api/v1/artist-profile/me`
- `GET /api/v1/artist-profiles/{id}`
- `PATCH /api/v1/artist-profiles/{id}`

### Artwork catalogue and moderation

- Public categories: `GET /api/v1/categories` (active categories only).
- Public catalogue: `GET /api/v1/artworks` with optional `q` and `category` filters; only approved artwork is returned.
- Public detail and image delivery: `GET /api/v1/artworks/{slug}` and `GET /api/v1/artworks/{slug}/image`; policy checks protect non-public artwork.
- Artist-owned artwork: `GET/POST /api/v1/artist/artworks` and `PATCH /api/v1/artist/artworks/{id}`.
- Admin moderation: `GET /api/v1/admin/artworks` and `PATCH /api/v1/admin/artworks/{id}/moderation`.

Artwork uploads accept JPG/JPEG, PNG, or WebP images up to 5 MB and 6000 × 6000 pixels. Originals are stored on Laravel's private local disk. New submissions and artist edits enter pending review; editing clears prior review metadata. Only approved artwork appears in public catalogue queries.

### Buyer-to-artist inquiries

- An authenticated buyer can submit an inquiry to a public artist profile.
- An inquiry may optionally reference an approved artwork owned by that artist.
- Buyers can list and view only their own sent inquiries.
- Artists can list and view inquiries addressed to their own profile, then mark them read or archived.
- Subject and message lengths are bounded; a honeypot and per-user/IP throttling help reduce abuse.
- Inquiry responses omit both parties' email addresses.

This is an inquiry intake and status-tracking feature, not real-time chat, email delivery, or a reply channel.

## Local development

### Prerequisites

- PHP 8.3+
- Composer
- Node.js 22+ and npm
- MySQL for a local MySQL environment
- PHP extensions required by Laravel, including PDO MySQL
- `pdo_sqlite` and `sqlite3` enabled in the PHP CLI for the in-memory test suite

On Windows, inspect the CLI configuration with `php --ini`, enable the required extensions in that `php.ini`, open a new terminal, and verify with `php -m`.

### Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure database credentials in .env
php artisan migrate
npm install
```

Run the backend and frontend development servers in separate terminals:

```bash
php artisan serve
npm run dev
```

Open the local URL printed by Laravel (normally `http://127.0.0.1:8000`).

To grant administrator access to an existing account, run `php artisan users:make-admin email@example.com` from the server terminal. There is no public administrator-registration path.

## Quality checks

Run after installing dependencies:

```bash
composer test
composer lint
npm run lint
npm run build
```

To apply PHP formatting fixes, run `composer lint:fix` and then rerun `composer lint`.

The PHPUnit configuration uses in-memory SQLite. GitHub Actions runs backend tests/style checks and frontend lint/build on pushes to `main` or feature branches and on pull requests targeting `main`. Do not treat a workflow result as a substitute for production-host or browser verification.

## Documentation map

- [Architecture and request flows](docs/architecture.md)
- [Frontend routing and access model](docs/frontend-routing.md)
- [API reference](docs/api-reference.md)
- [Product roadmap and implementation status](ROADMAP.md)
- [Engineering workflow and contributor rules](AGENTS.md)
- [Engineering practices and definition of done](SKILLS.md)
- [Changelog](CHANGELOG.md)
- [Artwork catalogue smoke test](docs/phase-2-artwork-catalogue-smoke-test.md)
- [Artwork moderation smoke test](docs/phase-3-artwork-moderation-smoke-test.md)
- [Buyer-to-artist inquiry smoke test](docs/phase-4-buyer-artist-contact-smoke-test.md)
- [cPanel deployment guide](docs/cpanel-deployment.md)
- [Backup and restore runbook](docs/backup-and-restore.md)
- [Analytics baseline](docs/analytics-baseline.md)
- [Release checklist and known limitations](docs/release-checklist.md)

## Deployment status

Deployment documentation is a plan, not evidence of a completed deployment. The following still require verification in the target environment: PHP 8.3+ and extensions, document-root isolation, SMTP (once mail features exist), storage permissions, backups and a successful restore drill, and real-device/browser smoke tests. See the [cPanel guide](docs/cpanel-deployment.md).

## Engineering principles

1. Preserve the defined MVP boundary; do not silently add deferred commerce features.
2. Validate and authorize every write on the server.
3. Keep private uploads outside public paths and deliver approved artwork through controlled routes.
4. Use migrations and seeders for reproducible database setup.
5. Test authentication, role boundaries, ownership, moderation, and upload validation.
6. Keep documentation aligned with implemented behavior; label plans and unverified assumptions clearly.
7. Design and test Persian/RTL behavior across supported screen sizes.
