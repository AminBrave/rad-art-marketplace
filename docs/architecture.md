# Architecture Overview

## System shape

The application is a Laravel monolith serving a React single-page interface through Vite. Laravel serves the application shell and owns authentication, authorization, validation, persistence, image delivery, and API responses.

```text
Browser
  ├─ GET /, /artists/{slug}, /artworks/{slug}
  │    └─ Laravel view shell → React application (Vite assets)
  └─ /api/v1/*
       └─ Laravel session middleware + controllers
            ├─ MySQL: users, artist profiles, categories, artworks, inquiries
            └─ Private local storage: original artwork uploads
```

- Backend: Laravel 13 / PHP 8.3+.
- Frontend: React 18 / Vite, Tailwind CSS, Radix UI, Axios.
- Database: MySQL in deployment; in-memory SQLite for automated tests.
- Authentication: Laravel session guard; browser state-changing requests use Laravel's web/CSRF middleware.
- Files: artwork originals are stored on the private local disk and streamed through an authorized controller route.

## Request and route organization

The application shell routes are defined in `routes/web.php`. The feature API routes are also explicitly grouped under `/api/v1` in that file so they use the web/session middleware stack. The health endpoint is defined in `routes/api.php` under the `v1` prefix; Laravel's API route prefix makes its public path `/api/v1/health`.

Keep browser-session APIs on the existing middleware stack unless the authentication architecture is intentionally changed. Do not move routes to stateless API middleware without reviewing CSRF, cookie, CORS, and session behavior.

## Domain model

### User and roles

A `User` has one of three persisted roles: `buyer`, `artist`, or `admin`. A guest is an unauthenticated visitor, not a database role.

- Public registration accepts Buyer or Artist and defaults to Artist.
- Public registration rejects Admin.
- Admin access is provisioned by a server-side Artisan command or an existing Admin account.
- Role middleware protects role-specific route groups.

### Artist profile

An Artist account has a one-to-one `ArtistProfile`. The profile stores a public slug, display name, biography, city, website, Instagram handle, and public/private flag.

The owner may manage their profile. Admins may view/edit all profiles. Guests and other users may view only public profiles.

### Artwork and category

An ArtistProfile has many Artworks; each Artwork belongs to a Category. Artwork records contain descriptive metadata, price/availability, a private image path, moderation status, and review audit metadata.

Artwork status transitions:

- New submission → `pending_review`.
- Admin approval → `approved`.
- Admin rejection → `rejected` (note required).
- Admin revision request → `changes_requested` (note required).
- Artist edit/resubmission → `pending_review`; prior review note/audit metadata is cleared.

Only approved artwork is returned by public catalogue queries. The Artwork policy permits viewing approved work publicly and permits the owner/Admin to view non-approved work. Artist ownership is derived from the authenticated profile, not from request input.

### Artist inquiry

An `ArtistInquiry` belongs to the recipient ArtistProfile and sender User, and may optionally reference an approved Artwork belonging to that same profile.

Inquiry statuses are `new`, `read`, and `archived`. Buyers can access only their own sent inquiries. Artists can access only inquiries addressed to their own profile. Payloads intentionally omit both parties' email addresses.

## Security boundaries

- Session authentication and role middleware protect private route groups.
- Policies enforce profile and artwork ownership.
- Laravel validation constrains registration, profile data, artwork metadata/uploads, moderation decisions, and inquiry content.
- Artwork uploads are image-validated (JPG/JPEG/PNG/WebP, up to 5 MB, max 6000 × 6000) and stored on the private local disk.
- Image delivery uses an application route and policy check; private storage must not be symlinked into a public directory.
- Inquiry creation is limited to authenticated Buyers, public artist profiles, and optionally that artist's approved artwork.
- Authentication, artwork mutations, and inquiry creation have route-level throttles.

## Deliberate architectural constraints

The MVP does not require payment processing, order/fulfilment services, real-time chat, queues, Redis, long-running workers, or external analytics. Do not add these as incidental dependencies. Revisit this architecture only through an explicit product/hosting decision.

## Current limitations

- Email verification and password-reset UX are not implemented.
- Admin category management, reports/abuse queue, featured placements, and static content pages are not implemented.
- Analytics is documented as a proposal; event collection is not enabled.
- cPanel/PHP compatibility, production backups, restore drills, and production smoke tests remain unverified.


## Frontend route ownership

The browser route tree is centralized in React Router under `resources/js/app/App.jsx`. Session state is provided by `AuthProvider`; role-specific layouts and navigation live in `Layouts.jsx` and `RoutingPages.jsx`. Laravel's final web catch-all serves the SPA entry view for non-API paths so nested routes can be opened directly or refreshed. This client-side route protection is only a UX boundary: Laravel authentication middleware, role middleware, policies, and ownership checks remain the security boundary. See [frontend routing and access model](frontend-routing.md).
