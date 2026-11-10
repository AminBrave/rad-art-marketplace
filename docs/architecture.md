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
- Public portfolio pages support category filtering on the currently loaded approved portfolio; further pages remain server-paginated.
- A public artist profile includes approved portfolio artworks only.

### Artwork and category

An ArtistProfile has many Artworks; each Artwork belongs to a Category. Artwork records contain descriptive metadata, availability/price, a private image path, moderation status, and review audit metadata.

Status transitions:

- New submission → `pending_review`.
- Admin approval → `approved`.
- Admin rejection → `rejected` (note required).
- Admin revision request → `changes_requested` (note required).
- Artist edit/resubmission → `pending_review`; previous review note/audit metadata is cleared.

Only approved artwork from public artist profiles appears in public catalogue queries and portfolios. Artwork view policy applies the same public-profile condition to detail and image routes; owners and Admins retain their authorized private/pending access. Public artwork payloads omit moderation status and rejection notes. Catalogue filters and sorting are server-validated, URL-backed in React, and applied before pagination. Artwork detail responses may include a bounded set of related public works selected by shared category or artist. Ownership is derived from the authenticated artist profile, never request input.

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

- M02 discovery experience implementation is integrated in `main` via [PR #92](https://github.com/AminBrave/rad-art-marketplace/pull/92). Human visual review and the image-derivative decision remain open in [issue #62](https://github.com/AminBrave/rad-art-marketplace/issues/62). The prior MVP2 workspace stages remain integrated; M00 release gates remain tracked separately.
- Email verification and password-reset UX are not implemented.
- Admin category management, buyer reports/abuse queue, and featured placements are outside the current approved MVP 2 scope.
- Analytics is a proposal only; no provider or event collection is enabled.
- cPanel/PHP compatibility, production deployment, backup automation, restore drills, and browser/device release QA remain unverified.
