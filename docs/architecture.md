# Architecture Overview

## System shape

Rad Art is a Laravel monolith serving a React single-page application through Vite. Laravel owns authentication, authorization, validation, persistence, private image delivery, and API responses. React Router owns browser-side navigation and presentation.

```text
Browser
  ├─ Public and workspace routes
  │    └─ Laravel web shell → React + Vite application
  └─ /api/v1/*
       └─ Laravel session middleware + controllers
            ├─ MySQL: users, artist profiles, categories, artworks, inquiries
            └─ Private local storage: original artwork uploads
```

- Backend: Laravel 13 / PHP 8.3+.
- Frontend: React 18, Vite, React Router 6.
- Styling and UI: Tailwind CSS 3, Radix UI, shared components in `resources/js/components/ui`.
- HTTP: Axios.
- Database: MySQL for deployment; in-memory SQLite for automated tests.
- Authentication: Laravel session guard. Browser state-changing requests use Laravel's web/CSRF middleware.
- Files: original artwork uploads are stored on Laravel's private local disk and streamed through a policy-protected controller route.

## Application entry and routing

- `resources/js/app.jsx` mounts the normal `AppRouter`.
- `resources/js/app/AppRouter.jsx` defines public pages and role-protected workspace route trees; route screens are lazy-loaded while shared auth and layout boundaries remain eager.
- The Blade shell renders a static first-paint skeleton before the React root mounts. Route-level fallbacks retain the public/workspace navigation shell and reserve approximate page/media dimensions.
- Public artist portfolio and artist-owned artwork list endpoints use 12-item simple pagination to bound response size and avoid unnecessary total-count queries. The artist artwork list eager-loads both category and artist profile relationships used by its serialized payload, avoiding per-row relationship queries.
- `AuthProvider` loads and exposes the current session through the public `GET /api/v1/auth/me` bootstrap endpoint; guests receive `data: null` with HTTP 200, while authenticated sessions receive the user payload.
- `PublicLayout` owns public navigation/footer; role-specific workspace layouts own their navigation.
- The legacy `resources/js/app/App.jsx` is selected only for the development-only `?design-system` preview.
- Application shell routes and session-authenticated feature API routes are in `routes/web.php`; the health endpoint is in `routes/api.php`.

Keep browser-session APIs on the existing middleware stack unless the authentication architecture is intentionally changed. Do not move them to stateless API middleware without reviewing CSRF, cookie, CORS, and session behavior.

See [frontend routing](frontend-routing.md) for the complete route map and access model.

## Domain model and workflows

### User and roles

A `User` has one persisted role: `buyer`, `artist`, or `admin`. A guest is an unauthenticated visitor, not a database role.

- Public registration accepts Buyer or Artist and defaults to Artist.
- Public registration cannot create Admin.
- Admin access is provisioned through a server-side Artisan command or an existing Admin account.
- Role middleware protects role-specific API routes; React route guards improve navigation UX only.

### Artist profile

An Artist account owns one `ArtistProfile` with a public slug, display name, biography, city, website, Instagram handle, and public/private flag.

- The owner manages their profile.
- Admins may view/edit profiles through authorized endpoints.
- Guests and unrelated users may view only public profiles.
- The public directory returns public profiles only, with a minimal allow-listed card payload.
- A public artist profile includes approved portfolio artworks only.

### Artwork and category

An ArtistProfile has many Artworks; each Artwork belongs to a Category. Artwork records contain descriptive metadata, availability/price, a private image path, moderation status, and review audit metadata.

Status transitions:

- New submission → `pending_review`.
- Admin approval → `approved`.
- Admin rejection → `rejected` (note required).
- Admin revision request → `changes_requested` (note required).
- Artist edit/resubmission → `pending_review`; previous review note/audit metadata is cleared.

Only approved artwork appears in public catalogue queries and artist portfolios. Public artwork payloads omit moderation status and rejection notes. Ownership is derived from the authenticated artist profile, never request input.

### Artist inquiry

An `ArtistInquiry` belongs to a recipient ArtistProfile and sender User, and may optionally reference approved Artwork belonging to that profile.

- Buyers can create inquiries to public artists and access only their own sent inquiries.
- Artists can access and update only inquiries addressed to their own profile.
- Supported artist status actions are read and archived.
- Inquiry payloads intentionally omit both parties' email addresses.
- This is private inquiry intake/status tracking, not chat, replies, or email delivery.

## Security boundaries

- Session authentication and role middleware protect private route groups.
- Policies enforce profile, artwork, and inquiry ownership.
- Laravel validation constrains registration, profile data, artwork metadata/uploads, moderation decisions, and inquiry content.
- Artwork uploads accept JPG/JPEG/PNG/WebP, up to 5 MB and 6000 × 6000 pixels, and are stored on the private local disk.
- Image delivery invokes the artwork view policy; private storage must not be symlinked into a public directory.
- Inquiry creation is limited to authenticated Buyers, public artist profiles, and optionally approved artwork owned by the target artist.
- Authentication, artwork mutations, and inquiry creation have route-level throttles.
- API payloads are explicit and must not expose private account data, inquiry email addresses, private image paths, or moderation metadata on public routes.

## Local development and transport

- Standard local development uses Laravel's local server and Vite. The optional Caddy profile exposes `https://rad.localhost`, proxying Laravel and Vite/HMR while both development servers remain bound to loopback.
- `npm run dev:local` starts Laravel, HTTPS Vite, and Caddy as child processes and stops the group when a service exits or Ctrl+C is received. It requires PHP, Node/npm, Caddy 2.8+, a trusted local Caddy CA, and an available port 443.
- Production `.htaccess` redirects HTTP to HTTPS and adds one-year HSTS on HTTPS responses. The application configuration does not enable production HTTP/2 or HTTP/3; those depend on the hosting provider/CDN and must be verified against the live hostname.

## Deliberate constraints

The current MVP does not require payment processing, order/fulfilment services, real-time chat, queues, Redis, long-running workers, microservices, or external analytics. Do not add these as incidental dependencies. Revisit architecture only for a concrete approved requirement and document the decision.

## Current limitations and release dependencies

- MVP 2 feature stages 1–5 (foundation, public marketplace, artist, buyer, and admin workspaces) are integrated in `main`; Stage 6 external QA/release verification remains open. See [ROADMAP.md](../ROADMAP.md).
- Email verification and password-reset UX are not implemented.
- Admin category management, buyer reports/abuse queue, and featured placements are outside the current approved MVP 2 scope.
- Analytics is a proposal only; no provider or event collection is enabled.
- cPanel/PHP compatibility, production deployment, backup automation, restore drills, and browser/device release QA remain unverified.

## Approved target architecture — premium discovery (planned, not yet implemented)

This section records the approved direction for the next roadmap. It is a target, not a claim that the modules, tables or services below already exist. Preserve the current Laravel monolith + React/Vite application and evolve it incrementally.

### Architectural decision

Retain a **modular monolith**: Laravel remains the system of record for identity, authorization, validation, persistence, publication and moderation; React remains the presentation and interaction layer. MySQL remains the primary database. Do not migrate frameworks, split services or add infrastructure without measured need and a documented decision.

### Logical domain boundaries

- **Identity:** accounts, authentication, roles and verification.
- **Artists:** artist profile, public identity, biography, disciplines and portfolio metadata.
- **Artworks:** metadata, availability, pricing semantics, media variants and publication state.
- **Discovery:** public catalogue queries, filters, sorting, pagination and related content.
- **Curation:** collections, ordered collection membership, editorial featured-artist selections and publication scheduling.
- **Inquiries:** buyer-to-artist inquiry intake, privacy and lifecycle.
- **Moderation:** submission review, approval/rejection/revision and append-only decision history.
- **Notifications:** only explicitly supported in-app/system notifications; do not imply email delivery.
- **Editorial:** short structured stories/introductions associated with artists, artworks or collections when the product requires them.

Keep boundaries logical within the existing application. Add a module-specific service or action only where it owns a meaningful business operation; do not create a generic service/repository layer for every model.

### Curation data principles

A collection should have a stable slug, title, editorial introduction, cover/hero media, publication status, optional publication window and ordered items. Collection membership must reference existing artworks and use deterministic ordering. Public collection queries must return published collections and approved artworks only. Featured-artist selections are editorial content—not paid placement or advertising—and must have server-side admin authorization and auditable changes.

Before introducing tables, inspect existing schema and naming conventions. Use incremental, reversible migrations, foreign keys, unique constraints and indexes justified by query patterns. Do not create speculative columns or a generic CMS schema.

### Media and discovery principles

Artwork imagery is a core product asset. Preserve private originals and policy-protected delivery; introduce public derivatives only through a deliberate, tested storage policy. Generate responsive variants asynchronously only if the actual hosting/runtime supports the processing path. Measure image payloads, query plans and API waterfalls before adding caching or dedicated search infrastructure.

### API and security principles

Keep resource-oriented, versioned API contracts consistent with existing `/api/v1` conventions. Public endpoints must expose only public artist fields, published collections and approved artworks. Keep owner IDs, moderation metadata, private image paths, inquiry messages and personal contact details out of public responses. Every write remains validated and authorized server-side.

