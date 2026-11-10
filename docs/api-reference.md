# API Reference

This document describes API routes implemented in the current `main` branch. It is the source of truth for frontend API integration. It does not imply that all planned workspace UI is complete.

Feature endpoints use JSON request/response bodies and are defined in `routes/web.php` under `/api/v1`, using Laravel's session and CSRF middleware. The health route is defined separately in `routes/api.php`.

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | Public | Health response |
| POST | `/api/v1/auth/register` | Guest, throttled | Register Buyer or Artist |
| POST | `/api/v1/auth/login` | Guest, throttled | Start authenticated session |
| GET | `/api/v1/auth/me` | Public session bootstrap | Returns `{"data": null}` for a guest or the current user payload for an authenticated session |
| POST | `/api/v1/auth/logout` | Authenticated | End authenticated session |

`GET /api/v1/auth/me` is intentionally accessible without authentication so the frontend can distinguish a guest session from a failed API request. It always returns HTTP 200; the `data` value is `null` for guests. `POST /api/v1/auth/logout` remains authenticated.

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
| GET | `/api/v1/artwork-filters` | Public | Return available public mediums, availability choices, and sort choices |
| GET | `/api/v1/artworks` | Public | Paginated approved catalogue |
| GET | `/api/v1/artworks/{slug}` | Public for approved/public work; owner/Admin policy access otherwise | Read artwork and related works |
| GET | `/api/v1/artworks/{slug}/image` | Same artwork policy | Stream artwork image |

Catalogue query parameters:

- `q`: optional search against title, description, medium, or public artist display name.
- `category`: optional active category slug.
- `medium`: optional exact medium/technique value returned by `/api/v1/artwork-filters`.
- `availability`: `available`, `sold`, or `not_for_sale`.
- `sort`: `newest`, `oldest`, `title_asc`, `title_desc`, `year_desc`, `year_asc`, `price_asc`, or `price_desc`; defaults to `newest`. Null years/prices sort after known values.
- `page`: Laravel paginator page.
- `per_page`: bounded to 1–24; default 12.

The catalogue includes only approved artworks whose artist profile is public. Filter metadata is derived from the same public/approved dataset; private-profile and pending-work mediums are not exposed. Public artwork payloads omit moderation status and rejection notes. Artwork detail responses additionally include up to four approved, public related works from the same category or artist when such works exist.

**Price semantics:** `price = null` means no price has been disclosed and the UI must say “قیمت اعلام نشده”. A numeric zero is a supplied amount and must be rendered as `۰ ریال`; do not infer or label it “free” or “complimentary”. Positive values are formatted as Rial amounts. This is display semantics only; it does not define a payment or transaction workflow.

The image route checks the artwork view policy and streams the original from private local storage. An approved artwork is publicly viewable only while its artist profile is public; the owner and Admin retain policy-authorized access to private/pending items. Responses use private caching and `X-Content-Type-Options: nosniff`.

## Artist artwork management

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/artist/artworks` | Artist/Admin route group; an Artist profile is required | List current artist's artwork |
| POST | `/api/v1/artist/artworks` | Artist, throttled | Submit artwork |
| PATCH | `/api/v1/artist/artworks/{id}` | Artist/Admin route group; owner/Admin policy | Update artwork |

Submission fields include `title` (required, max 160), `category_id` (active category), `availability` (`available`, `sold`, or `not_for_sale`), optional `description`, `medium`, `dimensions`, `year`, `price`, and required image. Updates may omit the image. Accepted image formats are JPG/JPEG, PNG, and WebP; maximum file size is 5 MB and maximum dimensions are 6000 × 6000. Ownership and pending-review status are assigned server-side. The current artist artwork list uses length-aware Laravel pagination at 12 items per page and returns `total`, `current_page`, `last_page`, `next_page_url`, and `prev_page_url`. The endpoint remains scoped to the authenticated artist's profile.

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

## Editorial curation

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/collections` | Public | Paginated published collections |
| GET | `/api/v1/collections/{slug}` | Public | Published collection and ordered approved works |
| GET | `/api/v1/featured-artists` | Public | Active featured artist selections |
| GET | `/api/v1/admin/editorial/options` | Admin | Approved public artworks and public artist choices |
| GET | `/api/v1/admin/editorial/collections` | Admin | Paginated collection management list |
| POST | `/api/v1/admin/editorial/collections` | Admin | Create a draft or publish a collection |
| PATCH | `/api/v1/admin/editorial/collections/{id}` | Admin | Update title, introduction and ordered artwork IDs |
| PATCH | `/api/v1/admin/editorial/collections/{id}/publication` | Admin | Publish or unpublish a collection |
| PUT | `/api/v1/admin/editorial/collections/order` | Admin | Save collection ordering |
| GET | `/api/v1/admin/editorial/featured-artists` | Admin | Read current featured artist selections |
| PUT | `/api/v1/admin/editorial/featured-artists` | Admin | Replace ordered featured artist selections |

Collections have stable generated slugs. Only approved artworks belonging to public artist profiles can be attached; public collection responses re-check those conditions on every read. Draft and unpublished collections return 404 to public detail requests. Featured artist responses require a public profile, a published selection, and an active optional start/end window. Admin writes are role-protected and create editorial audit records with actor, action, subject and metadata. Collection and featured-artist editing is available under `/admin/editorial`.

Create collection body: `title`, optional `intro`, ordered `artwork_ids` (up to 30 distinct IDs), and optional `publish` boolean. Updating accepts `title`, `intro`, and/or `artwork_ids`. Publication body is `publish` boolean. Featured selection body is `selections`, an ordered array of `artist_profile_id`, optional `editorial_intro`, `starts_at`, and `ends_at` values. Featured selections are currently replaced as a complete ordered set.

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

- Unauthenticated requests to protected feature routes normally return HTTP 401. The deliberate exception is `GET /api/v1/auth/me`, which returns HTTP 200 with `data: null` for guests.
- Authenticated users without the required role normally receive HTTP 403.
- Owner/recipient scoping may return HTTP 404 to avoid exposing another user's resource.
- Validation failures return HTTP 422.
- Rate-limited requests return HTTP 429.
- Confirm exact response details against the controller and middleware when integrating a new UI.

## Not implemented

There are no API routes for email verification, password reset, admin category CRUD, buyer reports/abuse moderation, featured placements, static content management, payments, orders, email delivery, or chat.
