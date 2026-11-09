# API Reference

This document describes API routes implemented in the current `main` branch. It is the source of truth for frontend API integration. It does not imply that all planned workspace UI is complete.

Feature endpoints use JSON request/response bodies and are defined in `routes/web.php` under `/api/v1`, using Laravel's session and CSRF middleware. The health route is defined separately in `routes/api.php`.

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | Public | Health response |
| POST | `/api/v1/auth/register` | Guest, throttled | Register Buyer or Artist |
| POST | `/api/v1/auth/login` | Guest, throttled | Start authenticated session |
| GET | `/api/v1/auth/me` | Authenticated | Current user payload |
| POST | `/api/v1/auth/logout` | Authenticated | End authenticated session |

Registration fields: `name`, `email`, `password`, `password_confirmation`, and optional `role`. Passwords must be at least 10 characters and confirmed. `role` may be `artist` or `buyer`; omission defaults to `artist`. Other values, including `admin`, fail validation. Admins are provisioned server-side.

## Public artist discovery

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/artists` | Public | Paginated public artist directory |
| GET | `/api/v1/artists/{slug}` | Public profile; owner/Admin may view private profile | Read profile and approved portfolio |
| POST | `/api/v1/artists/{slug}/inquiries` | Authenticated Buyer, throttled | Send inquiry to public artist |

Directory query parameters:

- `q`: optional search against display name and city.
- `page`: Laravel paginator page.
- `per_page`: bounded to 1–48; default 12.

Directory results are filtered by `is_public = true` in the database and ordered by display name, then profile ID. The card payload is allow-listed to `id`, `slug`, `display_name`, short `bio`, and `city`. It does not include account IDs, email addresses, the visibility flag, private profile fields, or inquiry data.

The public profile payload includes profile presentation fields and an `artworks` array containing up to 12 approved works. `artworks_page` selects the portfolio page; `artworks_pagination` returns `current_page`, `per_page`, `has_more`, and `next_page`. The endpoint uses simple pagination to avoid a separate total-count query. Public portfolio artwork omits moderation status and rejection notes.

## Authenticated artist profile

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/artist-profile/me` | Artist/Admin | Read current user's profile (or null) |
| PUT | `/api/v1/artist-profile/me` | Artist/Admin | Create or update own profile |
| GET | `/api/v1/artist-profiles/{id}` | Artist/Admin, policy-scoped | Read profile by ID |
| PATCH | `/api/v1/artist-profiles/{id}` | Artist/Admin, owner/Admin | Update profile |

Profile fields: `display_name` (required, max 120), optional `bio` (max 2000), `city` (max 120), `website_url` (URL), `instagram_handle` (1–30 allowed characters), and required boolean `is_public`.

## Categories and public artwork

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/categories` | Public | List active categories |
| GET | `/api/v1/artworks` | Public | Paginated approved catalogue |
| GET | `/api/v1/artworks/{slug}` | Public for approved work; owner/Admin policy access otherwise | Read artwork |
| GET | `/api/v1/artworks/{slug}/image` | Same artwork policy | Stream artwork image |

Catalogue query parameters:

- `q`: optional search against title, description, or medium.
- `category`: optional active category slug.
- `page`: Laravel paginator page.
- `per_page`: bounded to 1–24; default 12. The homepage requests 6 items while the catalogue uses the default page size.

The catalogue is ordered newest first and paginates 12 items per page by default. There is no sort parameter. Only approved artwork is included in public catalogue queries. Public artwork payloads omit moderation status and rejection notes.

The image route checks the artwork view policy and streams the original from private local storage. Responses use private caching and `X-Content-Type-Options: nosniff`.

## Artist artwork management

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/artist/artworks` | Artist/Admin route group; an Artist profile is required | List current artist's artwork |
| POST | `/api/v1/artist/artworks` | Artist, throttled | Submit artwork |
| PATCH | `/api/v1/artist/artworks/{id}` | Artist/Admin route group; owner/Admin policy | Update artwork |

Submission fields include `title` (required, max 160), `category_id` (active category), `availability` (`available`, `sold`, or `not_for_sale`), optional `description`, `medium`, `dimensions`, `year`, `price`, and required image. Updates may omit the image. Accepted image formats are JPG/JPEG, PNG, and WebP; maximum file size is 5 MB and maximum dimensions are 6000 × 6000. Ownership and pending-review status are assigned server-side. The current artist artwork list uses simple pagination at 12 items per page. Pass the standard `page` query parameter; the paginator returns `next_page_url` and `prev_page_url`. This keeps large artist libraries from producing unbounded responses.

## Artwork moderation

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/artworks` | Admin | Paginated moderation list |
| PATCH | `/api/v1/admin/artworks/{id}/moderation` | Admin | Apply moderation decision |

Optional list parameters: `status` accepts `pending_review`, `approved`, `rejected`, or `changes_requested`; `per_page` is bounded to 1–20 and defaults to 20. The admin overview requests one row while preserving the paginator's total count.

Decision body:

- `action=approve`; note optional.
- `action=reject`; note required.
- `action=request_changes`; note required.

Only pending-review records can receive a decision. A successful decision records `reviewed_by` and `reviewed_at`. Public endpoints must not expose those moderation details.

## User administration

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/users` | Admin | Paginated user list |
| PATCH | `/api/v1/admin/users/{id}/role` | Admin | Change user role |

The list accepts `page` and `per_page` (bounded to 1–20; default 20). The admin overview requests one row and reads the paginator's total count. The role update accepts `artist` or `admin`. An Admin cannot remove their own Admin role through this endpoint. Public registration is the supported Buyer creation flow.

## Buyer and artist inquiries

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/artists/{slug}/inquiries` | Authenticated Buyer, throttled | Send inquiry to public artist |
| GET | `/api/v1/buyer/inquiries` | Buyer | List own sent inquiries |
| GET | `/api/v1/buyer/inquiries/{id}` | Buyer, sender-scoped | Read own sent inquiry |
| GET | `/api/v1/artist/inquiries` | Artist | List inquiries for own profile |
| GET | `/api/v1/artist/inquiries/{id}` | Artist, recipient-scoped | Read received inquiry |
| PATCH | `/api/v1/artist/inquiries/{id}` | Artist, recipient-scoped | Mark inquiry read or archived |

Inquiry creation fields:

- `subject`: required, 4–160 characters.
- `message`: required, 20–3000 characters.
- `artwork_id`: optional; if supplied, it must identify approved artwork belonging to the target artist.
- `honeypot`: must be empty/absent.

The artist update accepts `status=read` or `status=archived`; buyers have no status-update endpoint and see the current status read-only. Buyer detail reads are scoped to the authenticated sender and return 404 for another buyer's inquiry. The API omits both parties' email addresses. This feature does not send email and does not provide a reply/chat channel. Buyer and artist inquiry lists use Laravel pagination (10 per page).

## Common access and validation behavior

- Unauthenticated requests to protected routes normally return HTTP 401.
- Authenticated users without the required role normally receive HTTP 403.
- Owner/recipient scoping may return HTTP 404 to avoid exposing another user's resource.
- Validation failures return HTTP 422.
- Rate-limited requests return HTTP 429.
- Confirm exact response details against the controller and middleware when integrating a new UI.

## Not implemented

There are no API routes for email verification, password reset, admin category CRUD, buyer reports/abuse moderation, featured placements, static content management, payments, orders, email delivery, or chat.
