# Rad Art Marketplace

Rad Art is a Persian-first, RTL-by-default art discovery and artist-contact marketplace. It helps visitors discover approved artworks and public artist portfolios, and lets registered buyers send private inquiries to artists.

**Current integration branch:** `main`  
**Current delivery status:** MVP 2 feature stages 1–5 are integrated. Stage 6 QA remains open; performance hardening is in progress under [issue #48](https://github.com/AminBrave/rad-art-marketplace/issues/48). Real-browser/device, Lighthouse, and production sign-off remain outstanding.  
**Product status:** Active MVP development; not yet verified or signed off for production.

## Product capabilities

### Public marketplace — implemented

- Editorial homepage with real approved artwork, category, and artist content.
- Paginated artwork gallery with search and active-category filtering.
- Artwork detail pages with artist links and buyer inquiry entry point.
- Searchable, paginated public artist directory.
- Public artist profiles with approved-only portfolio artwork.
- Persian About, Help, and Contact pages.

### Artist workspace — implemented

- Artist-only workspace navigation and profile-aware overview.
- Profile completion and visibility state.
- API-backed artwork and inquiry summaries without fabricated analytics.
- Artist-owned artwork list and create/edit forms with image preview, upload feedback, validation, and moderation status.
- Paginated inquiry inbox, recipient-scoped detail, and read/archive controls.
- No unsupported artwork deletion, inquiry replies, chat, or email delivery.

### Buyer workspace — implemented

- Buyer-only overview with the server-reported total sent-inquiry count and latest inquiry.
- Paginated sent-inquiry history with artist/artwork context and server-reported status.
- Dedicated inquiry detail routes that survive direct navigation and refresh.
- Sender-scoped API reads; no inquiry status mutation, replies, chat, or email delivery.

### Accounts and other workflows — implemented baseline

- Session-based registration, login, current-user, and logout.
- Roles: Buyer, Artist, and Admin. Guests are unauthenticated visitors.
- Public registration supports Buyer and Artist only; Admin is server-provisioned.
- Artist profile creation/editing and public/private visibility.
- Artist-owned artwork submission/editing and private image storage.
- Admin artwork moderation: approve, reject, or request changes.
- Buyer-to-artist inquiry intake and buyer sent-inquiry history.
- Admin overview using real pending-artwork and user totals.
- Paginated artwork moderation with supported decisions, required notes, and status filters.
- Paginated user management with supported Artist/Admin role updates and self-demotion protection.
- No unsupported search, Buyer-role assignment, deletion, suspension, or fabricated analytics.

### Explicitly out of scope

Payments, cart/checkout, orders, shipping, real-time chat/replies, email delivery, native mobile apps, AI recommendations, social networking, subscriptions, and advertising. Email verification and password-reset user experience are also not implemented.

## MVP 2 delivery plan

The [GitHub delivery tracker](https://github.com/AminBrave/rad-art-marketplace/issues/30) is the implementation source of truth.

| Stage | Scope | Issues | Status |
|---|---|---:|---|
| 1. Foundation and audit | Baseline, design system, routing, shared UI, API/UX audit | #6–#13 | Complete |
| 2. Public marketplace | Homepage, gallery, artwork detail, artists, information pages | #14–#18 | Complete |
| 3. Artist workspace | Overview, artwork management/submission, inquiry inbox | #19–#21 | Complete |
| 4. Buyer workspace | Account overview, paginated sent-inquiry history and detail | #22 | Complete |
| 5. Admin workspace | Overview, moderation UI, user management | #23–#25 | Complete |
| 6. QA and release | Localization/RTL, accessibility/responsive, performance, regression/release | #26–#29 | Next |

MVP 2 follows the **Contemporary Art Editorial** visual direction, with Persian as the launch language and RTL as the default. Laravel remains authoritative for authentication, authorization, validation, ownership, and privacy.

## Technology

| Area | Stack |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | React 18, Vite, React Router 6 |
| Styling and UI | Tailwind CSS 3, Radix UI |
| HTTP | Axios |
| Database | MySQL for deployment; in-memory SQLite for tests |
| Quality | PHPUnit, Laravel Pint, ESLint, Vite production build |
| Hosting target | cPanel shared hosting (not yet verified) |

## Roles and access

- **Guest:** browse approved artworks, public artist profiles, and public information pages.
- **Buyer:** register, submit inquiries to public artists, and view only their own sent inquiries.
- **Artist:** manage their own profile and artwork; view and update inquiries addressed to their profile.
- **Admin:** manage users and moderate artwork.

Public registration accepts `artist` or `buyer`; omission defaults to `artist`. It never grants Admin. Provision an administrator from the server:

```bash
php artisan users:make-admin admin@example.com
```

Hiding a control in React is not a security boundary. Server-side middleware, policies, validation, and ownership checks must remain in place.

## API overview

Feature endpoints are defined under `/api/v1` in `routes/web.php` and use Laravel's session/CSRF middleware. `GET /api/v1/auth/me` is a public session-bootstrap endpoint: it returns `200` with `{"data": null}` for guests and the current user payload for an authenticated session. Mutating/private feature endpoints remain protected; logout requires authentication. The health endpoint is in `routes/api.php`.

| Area | Main endpoints |
|---|---|
| Auth | `/api/v1/auth/register`, `login`, `me`, `logout` |
| Public discovery | `GET /api/v1/artworks`, `/categories`, `/artists`, `/artists/{slug}` |
| Artwork images | `GET /api/v1/artworks/{slug}/image` (policy-protected) |
| Artist | `/api/v1/artist-profile/me`, `/artist/artworks`, `/artist/inquiries` |
| Buyer | `/api/v1/buyer/inquiries`, `/artists/{slug}/inquiries` |
| Admin | `/api/v1/admin/artworks`, `/admin/users` |

See the [API reference](docs/api-reference.md) for methods, access rules, fields, and response behavior.

Artwork uploads accept JPG/JPEG/PNG/WebP, up to 5 MB and 6000 × 6000 pixels. Originals stay on Laravel's private local disk and are delivered through an authorized route. Public artwork queries and artist portfolios include approved work only.

## Local development

### Prerequisites

- PHP 8.3+
- Composer
- Node.js 22+ and npm
- MySQL for a local MySQL environment
- Laravel-required PHP extensions, including PDO MySQL
- `pdo_sqlite` and `sqlite3` enabled in the PHP CLI for the test suite

### Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure database credentials in .env
php artisan migrate
npm install
```

Run the backend and frontend in separate terminals:

```bash
php artisan serve
npm run dev
```

Open the local URL printed by Laravel (normally `http://127.0.0.1:8000`). The development-only design specimen is available at `/?design-system`.

### HTTPS local development

The optional Caddy profile provides a browser-trusted HTTPS origin at `https://rad.localhost`; Laravel and Vite remain bound to loopback. Install Caddy 2.8+, run `caddy trust` once, and ensure port 443 is available. Permit UDP 443 only if you want to test local HTTP/3.

1. Copy `.env.example` to `.env`, generate `APP_KEY`, configure the database, and set `APP_URL=https://rad.localhost` and `SESSION_SECURE_COOKIE=true`.
2. Run `npm run dev:local` from the repository root. This starts Laravel, HTTPS Vite/HMR, and Caddy together.
3. Open `https://rad.localhost`. If startup fails, verify PHP, Node/npm, and Caddy are installed and available on `PATH`; trust Caddy's local root CA if the browser does not already trust it.

The runner stops the other processes if one service exits and supports Ctrl+C. Do not expose the development servers to a public network. For the standard HTTP workflow, run `php artisan serve` and `npm run dev` in separate terminals.

### Quality checks

```bash
composer test
composer lint
npm run lint
npm run build
```

For the cPanel frontend artifact, use `npm ci` followed by `npm run build:cpanel` (runs frontend lint and `vite build`); the generated Laravel assets and manifest are written to `public/build/`. The script builds frontend assets only and does not replace Composer production dependency installation or Laravel deployment commands.

Use `composer lint:fix` only when intentionally applying PHP formatting changes, then rerun `composer lint`.

## Documentation map

| Document | Purpose / authority |
|---|---|
| [ROADMAP.md](ROADMAP.md) | MVP 2 stages, delivery status, remaining scope |
| [AGENTS.md](AGENTS.md) | Mandatory repository instructions for agents and contributors |
| [SKILLS.md](SKILLS.md) | Engineering, review, and documentation practices |
| [CHANGELOG.md](CHANGELOG.md) | Chronological record of delivered changes |
| [docs/architecture.md](docs/architecture.md) | Runtime shape, domain model, security boundaries |
| [docs/frontend-routing.md](docs/frontend-routing.md) | Browser routes, role guards, layouts |
| [docs/api-reference.md](docs/api-reference.md) | Implemented API contract |
| [docs/design-system.md](docs/design-system.md) | Visual tokens and typography |
| [docs/ui-components.md](docs/ui-components.md) | Shared UI component usage |
| [docs/manual-smoke-tests.md](docs/manual-smoke-tests.md) | Manual checks for implemented features |
| [docs/qa-checklist.md](docs/qa-checklist.md) | Cross-feature QA checklist |
| [docs/release-checklist.md](docs/release-checklist.md) | Production release gates and known limitations |
| [docs/cpanel-deployment.md](docs/cpanel-deployment.md) | Proposed cPanel deployment procedure |
| [docs/backup-and-restore.md](docs/backup-and-restore.md) | Database and private-file recovery procedure |
| [docs/analytics-baseline.md](docs/analytics-baseline.md) | Privacy-conscious analytics proposal; collection is disabled |

## Performance hardening status

The implementation is integrated in `main` via [PR #49](https://github.com/AminBrave/rad-art-marketplace/pull/49): static first-paint and route-level skeletons, lazy-loaded public/workspace feature bundles, bounded 12-item pagination for public artist portfolios and artist artwork management, and eager loading of relationships used by the artist artwork payload. CI passed for the merged implementation. Performance certification is still pending: Lighthouse/Core Web Vitals, repeated browser CLS, production-like query plans, and production-host measurements have not been recorded. No score or measured improvement is claimed.

## Stage 6 verification status

The Stage 6 QA changes are integrated in `main`: resilient broken-artwork-image fallback, lazy/asynchronous loading for artwork cards, eager/high-priority loading for primary artwork imagery, and reserved detail-image aspect ratios. Source review confirms Persian/RTL document defaults, Vazirmatn/Inter font declarations, explicit LTR account fields in inspected views, visible focus styles, and reduced-motion rules. Automated CI passed; manual browser/device accessibility, measured performance, production-host verification, and backup restore evidence remain outstanding.

These checks do not constitute a full browser/device accessibility audit, measured Core Web Vitals baseline, production-host verification, or backup restore drill. See the QA checklist, manual smoke tests, and release checklist.

## Deployment status

The cPanel guide is a procedure, not evidence of a deployment. Hosting compatibility, production configuration, private-storage permissions, backup automation, a successful restore drill, and production browser/device smoke tests remain unverified. Laravel 13 requires PHP 8.3+; do not bypass Composer platform or security checks to accommodate an incompatible host.

## Engineering principles

1. Implement only approved MVP 2 scope; do not add deferred commerce or social features.
2. Prefer existing Laravel endpoints and established project patterns over new abstractions or dependencies.
3. Keep private data and artwork originals protected; expose explicit allow-listed API payloads.
4. Keep the project structure simple. Add a new document or architectural layer only when it has a distinct, maintained purpose.
5. Update the relevant documentation in the same feature change whenever behavior, API contracts, routes, setup, security, design, or operational procedures change.
6. Distinguish implemented behavior from plans and unverified operational assumptions.
