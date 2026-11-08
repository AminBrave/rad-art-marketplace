# API Reference

All feature endpoints use JSON request/response bodies unless noted. Feature routes are session-authenticated and are defined in `routes/web.php` under `/api/v1`; browser requests must preserve Laravel session cookies and CSRF behavior. The health route is defined separately in `routes/api.php`.

This reference describes the routes present in the current codebase. It does not imply that every planned product feature exists.

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | Public | Health response |
| POST | `/api/v1/auth/register` | Guest, throttled | Register Buyer or Artist |
| POST | `/api/v1/auth/login` | Guest, throttled | Start authenticated session |
| GET | `/api/v1/auth/me` | Authenticated | Current user payload |
| POST | `/api/v1/auth/logout` | Authenticated | End session |

Registration fields: `name`, `email`, `password`, `password_confirmation`, and optional `role`. Passwords must be at least 10 characters and confirmed. `role` may be `artist` or `buyer`; omission defaults to `artist`. Other values, including `admin`, fail validation.

## Artist profiles

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/artists/{slug}` | Public profile; owner/Admin may view private profile | Read profile by public slug |
| GET | `/api/v1/artist-profile/me` | Artist/Admin | Read current user's profile (or null) |
| PUT | `/api/v1/artist-profile/me` | Artist/Admin | Create or update own profile |
| GET | `/api/v1/artist-profiles/{id}` | Artist/Admin, policy-scoped | Read profile by ID |
| PATCH | `/api/v1/artist-profiles/{id}` | Artist/Admin, owner/Admin | Update profile |

Profile fields: `display_name` (required), optional `bio`, `city`, `website_url`, `instagram_handle`, and required boolean `is_public`.

## Categories and public artwork

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/categories` | Public | List active categories |
| GET | `/api/v1/artworks` | Public | Paginated approved catalogue |
| GET | `/api/v1/artworks/{slug}` | Public for approved work; owner/Admin policy access otherwise | Read artwork |
| GET | `/api/v1/artworks/{slug}/image` | Same artwork policy | Stream artwork image |

Catalogue query parameters:

- `q`: optional search term matched against title, description, and medium.
- `category`: optional active category slug.

Only approved artwork is included in the public catalogue query. The image route uses a policy check and private local storage.

## Artist artwork management

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/artist/artworks` | Artist/Admin route group; an Artist profile is required | List current artist's artwork |
| POST | `/api/v1/artist/artworks` | Artist, throttled | Submit artwork |
| PATCH | `/api/v1/artist/artworks/{id}` | Artist/Admin route group; owner/Admin policy | Update artwork |

Submission fields include `title`, `category_id`, `availability`, optional `description`, `medium`, `dimensions`, `year`, `price`, and required image. Updates may omit the image. Accepted image formats are JPG/JPEG, PNG, and WebP; maximum file size is 5 MB and maximum dimensions are 6000 × 6000. Ownership and pending-review status are assigned server-side.

## Public artist directory

`GET /api/v1/artists` is public and returns only profiles where `is_public = true`. It supports optional `q` matching against display name and city, plus Laravel pagination using `page` and `per_page` (default 12, maximum 48). Results use stable display-name and profile-ID ordering. Directory fields are limited to `id`, `slug`, `display_name`, short `bio`, and `city`; account identifiers, email addresses, private profile fields, and inquiry data are not returned.

`GET /api/v1/artists/{slug}` returns the public artist profile and an `artworks` collection containing only approved portfolio works. Public artwork responses omit moderation state and rejection notes.

## Artwork moderation

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/artworks` | Admin | Paginated moderation list |
| PATCH | `/api/v1/admin/artworks/{id}/moderation` | Admin | Apply moderation decision |

Optional list filter: `status` accepts `pending_review`, `approved`, `rejected`, or `changes_requested`.

Decision body:

- `action=approve`; note optional.
- `action=reject`; note required.
- `action=request_changes`; note required.

Only pending-review records can receive a decision. Attempting to moderate another status returns HTTP 422. A successful decision records `reviewed_by` and `reviewed_at`.

## User administration

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/users` | Admin | Paginated user list |
| PATCH | `/api/v1/admin/users/{id}/role` | Admin | Change user role |

The role update accepts `artist` or `admin`. Public registration is the only supported Buyer creation flow. An Admin cannot remove their own Admin role through this endpoint.

## Buyer-to-artist inquiries

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

The artist update accepts `status=read` or `status=archived`. The API does not expose buyer or artist email addresses in inquiry payloads. This feature does not send email and does not provide a reply/chat channel.

## Common access and validation behavior

- Unauthenticated requests to protected routes normally return HTTP 401.
- Authenticated users without the required role normally receive HTTP 403.
- Owner/recipient scoping may return HTTP 404 to avoid exposing another user's resource.
- Validation failures return HTTP 422.
- Rate-limited requests return HTTP 429.
- Exact error payloads should be confirmed against the controller and middleware behavior for the route being integrated.

## Not implemented

There are no current API routes for email verification, password reset, admin category CRUD, buyer reports/abuse moderation, featured placements, static content management, payments, orders, or chat.
