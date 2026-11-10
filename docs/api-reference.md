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

The artist update accepts `status=read` or `status=archived`; buyers have no status-update endpoint and see the current status read-only. Buyer detail reads are scoped to the authenticated sender and return 404 for another buyer's inquiry. The API omits both parties' email addresses. Buyer and artist inquiry lists use Laravel pagination (10 per page). An inquiry is the context for a private one-to-one conversation; the conversation API below does not change the original inquiry.


## Private conversations and messages (M05)

All conversation endpoints require an authenticated Buyer or Artist participant. Admins and unrelated users are not participants. Participant-only resource checks return 404 for another user's conversation or message to avoid confirming its existence.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /api/v1/conversations/direct | Buyer, throttled | Start or reuse the canonical buyer–artist conversation; optional approved artwork context |
| POST | /api/v1/inquiries/{id}/conversation | Inquiry sender or recipient Artist | Open/reuse the canonical conversation and preserve the inquiry as context/initial message |
| GET | /api/v1/buyer/conversations | Buyer | List the buyer's paginated conversations |
| GET | /api/v1/artist/conversations | Artist | List conversations addressed to the artist |
| GET | /api/v1/conversations/{id} | Participant | Read conversation and context |
| GET | /api/v1/conversations/{id}/messages | Participant | Read messages, paginated 30 per page |
| POST | /api/v1/conversations/{id}/messages | Participant, throttled | Send a message or reply |
| PATCH | /api/v1/conversations/{id}/messages/{message} | Message sender | Edit own message |
| DELETE | /api/v1/conversations/{id}/messages/{message} | Message sender | Delete own message and retain a content-free tombstone |
| POST | /api/v1/conversations/{id}/messages/{message}/reactions | Participant, throttled | Add/remove an allow-listed emoji reaction |
| PATCH | /api/v1/conversations/{id}/read | Participant | Mark received messages as read |

A conversation is unique to one buyer/artist participant pair. Inquiry and artwork references are contextual metadata, not conversation identity. Starting from another artwork or the artist profile reuses the same thread. Legacy inquiry-linked threads are consolidated while preserving their inquiry context and message history.

Message body fields: **body** (required, 1–5000 characters), optional **client_message_id** (up to 64 safe ASCII characters; repeated sends with the same ID by the same sender in one conversation return the existing message), and optional **reply_to_id** (must reference a message in the same conversation). Sender identity and timestamps are assigned by Laravel.

Only the original sender may edit or delete a message. Editing updates **edited_at**. Deletion clears the stored body, removes reactions, and retains a soft-deleted tombstone so the thread can display “message deleted” without retaining the deleted text. A participant may react to any non-deleted message using one or more of the allow-listed reactions: 👍, ❤️, 😂, 😮, 🙏, 🎨. Repeating an add/remove action is safe and does not create duplicate reactions. Reaction summaries include the emoji, count, and whether the current participant reacted.

**delivered_at** records server acceptance/persistence, not device-level delivery; **read_at** is set when the other participant marks the conversation read. These states must not be presented as guaranteed device delivery. The API payload does not expose participant email addresses or storage paths.

M05-T01 and M05-T03 canonical conversations, replies, sender-only edit/delete, reactions and message states are integrated. M05-T05 private attachments and M05-T07 participant blocking, reports and Admin moderation are implemented in the current completion batch; PR #114 final CI passed: 92 backend tests / 890 assertions, PHP style, frontend tests/lint/build and 26 Chromium browser tests. Independent security review and production-host malware-scanning decision remain pending. M05-T06 in-app notifications are integrated. Inbox search, unread/archive filters and participant-specific archive/mute settings are implemented. Real-time push, typing/presence and optional email remain disabled pending target-host verification.

## In-app message notifications (M05-T06)

All endpoints require authentication and return only the current user's message notifications.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/v1/notifications | List the current user's message notifications, paginated 20 per page, with unread count |
| PATCH | /api/v1/notifications/{notification}/read | Mark one of the current user's message notifications as read |
| PATCH | /api/v1/notifications/read-all | Mark all current user's message notifications as read |
| GET | /api/v1/notifications/preferences | Read in-app notification preference and email availability |
| PATCH | /api/v1/notifications/preferences | Update the in-app message-notification preference |

A new message creates a database-backed notification for the other conversation participant, once per newly persisted message. Repeated idempotent sends do not create duplicate notifications. The notification payload contains only notification type, conversation ID, message ID and sender display name; it never includes message body, email address or private storage paths. Opening a notification marks it read and deep-links to the participant's conversation.

In-app notifications can be disabled by each user. Email notifications are explicitly unavailable (`email_available=false`, `email_messages=false`) until the target host has a verified mail configuration and queue worker/retry setup. This branch does not send email synchronously or claim queued email delivery.

## Messaging safety and private attachments (M05-T05/T07)

All routes below require an authenticated conversation participant unless explicitly restricted to Admin.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/conversations/{id}/safety` | Participant | Read directional block state for the current pair |
| POST | `/api/v1/conversations/{id}/block` | Participant | Block the other participant; sending is disabled for both sides |
| DELETE | `/api/v1/conversations/{id}/block` | Participant | Remove the current user's block |
| POST | `/api/v1/conversations/{id}/report` | Participant, throttled | Report a conversation |
| POST | `/api/v1/conversations/{id}/messages/{message}/report` | Participant, throttled | Report a message in that conversation |
| POST | `/api/v1/conversations/{id}/messages/{message}/attachments` | Message sender, throttled | Upload a private image/PDF attachment |
| GET | `/api/v1/conversations/{id}/messages/{message}/attachments/{attachment}` | Participant | Download an attachment after conversation/message/attachment ownership checks |
| GET | `/api/v1/admin/message-reports` | Admin | Paginated private report review queue |
| PATCH | `/api/v1/admin/message-reports/{report}` | Admin | Review, dismiss, or remove the reported message |

Report reasons are allow-listed: `spam`, `harassment`, `inappropriate`, `scam`, and `other`. Report details are optional and limited to 1000 characters. A participant's repeated report of the same message is idempotent. Report payloads are never exposed to the other participant. Admin actions are recorded in `message_moderation_audits`; removing a message clears its body, removes reactions and purges its private attachment files before retaining the tombstone.

Blocking is pair-wide for sending: either participant's block prevents either side from posting new messages. A generic 403 is returned without disclosing which participant created the block. Existing conversation history remains participant-scoped. Inbox search is scoped to the current participant's own conversations and searches participant display names and message text; unread and archived filters are also participant-scoped. Archive and mute timestamps are stored independently for buyer and artist. A muted recipient does not receive a new in-app message notification for that conversation; their other conversation notifications and global preference remain unchanged.

Attachment policy: maximum 10 MB; accepted formats are JPEG, PNG, WebP and PDF, checked against extension and detected MIME type. Files are stored on Laravel's private local disk, never the public storage symlink. Only the original message sender may upload; either conversation participant may download. API payloads expose a safe display name, MIME type, byte size and authorized download route, never the storage path. Message deletion and moderator removal purge attachment files. No antivirus/malware scanner is integrated; operators must scan uploads at the hosting boundary or accept this documented residual risk before production launch. Do not upload executable or macro-enabled documents.

Email notifications remain disabled until a persistent queue worker, mail sender, retries and unsubscribe controls are verified on the target host. Real-time push remains disabled; current inbox refresh uses polling until the target-host broadcasting capability is proven.

## Common access and validation behavior

- Unauthenticated requests to protected feature routes normally return HTTP 401. The deliberate exception is `GET /api/v1/auth/me`, which returns HTTP 200 with `data: null` for guests.
- Authenticated users without the required role normally receive HTTP 403.
- Owner/recipient scoping may return HTTP 404 to avoid exposing another user's resource.
- Validation failures return HTTP 422.
- Rate-limited requests return HTTP 429.
- Confirm exact response details against the controller and middleware when integrating a new UI.

## Not implemented

There are no API routes for email verification, password reset, admin category CRUD, featured placements, static content management, payments, orders, email delivery, or WebSocket broadcasting/typing presence. Messaging report/block and moderation endpoints are documented above.


**Follow-up CI verification (2026-11-10):** PR #118 corrected the Playwright notification-to-conversation fixture boundaries and added an explicit nested-route regression. Latest post-merge `main` [CI run #42852936094](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42852936094) passed all three jobs: 92 backend tests / 890 assertions, PHP style, frontend lint/build, and 27 Chromium browser tests. Main commit: `d7c056645addf33d872bec4868995e0e9bfda89f`. This supersedes the intermediate documentation-sync run that exposed the fixture failure; no application feature regression was found.
