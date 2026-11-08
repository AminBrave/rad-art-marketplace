# MVP 2 Foundation API and UX Audit

**Audited against:** `main` at the Stage 1 kickoff (2026-11-09)  
**Scope:** GitHub issues #10–#13  
**Decision rule:** Reuse current Laravel session APIs. Add an endpoint only where the current contract cannot safely support an approved UI requirement.

## Executive summary

| Issue | Finding | Decision |
|---|---|---|
| #10 Artist directory | No public list endpoint exists; only public profile-by-slug exists. | Add a minimal paginated public directory endpoint before issue #17. |
| #11 Artwork catalogue | Search, category filter, and pagination exist; sort is fixed to newest first. | Use existing API; expose pagination controls in the UI. No sort API change. |
| #12 Image delivery | Originals are private; image reads are policy-checked. No derivative/srcset support exists. | Keep current delivery for MVP 2; improve frontend image states and loading. Defer transformations absent measured need. |
| #13 Dashboard summaries | Existing role-scoped lists expose enough data for a small set of honest counts. | Derive only supported totals/status counts from existing endpoints; no aggregation endpoint or analytics. |

## #10 — Public artist directory

### Verified current behavior

- `GET /api/v1/artists/{slug}` is the only public artist-profile read route.
- `ArtistProfileController::publicShow` returns a profile by slug.
- Private profiles return HTTP 404 to guests and unrelated users; owners and administrators may access private profiles under the existing policy.
- The profile payload is explicitly allow-listed: `id`, `slug`, `display_name`, `bio`, `city`, `website_url`, `instagram_handle`, and `is_public`.
- There is no `GET /api/v1/artists` route or list action in the current route/controller implementation.
- Existing profile feature tests cover public visibility, private-profile hiding, owner/admin access, and cross-user denial.

### Smallest proposed contract

Add `GET /api/v1/artists` as a public, read-only, session-compatible route.

- Query: optional `q` (match display name, biography, or city); optional `page`; optional bounded `per_page` (default 12, maximum 48).
- Filter: `is_public = true` in the database query, not merely in the response mapper.
- Order: stable `display_name` ascending, then primary key ascending.
- Response: Laravel paginator envelope with `data` and standard `current_page`, `last_page`, `per_page`, `total`, `links`, and `meta` fields.
- Card fields: `id`, `slug`, `display_name`, short `bio`, and `city`. Do not include account email, user ID, visibility flag, private profile fields, or inquiry information.
- Tests: guest can list public profiles; private profiles never appear; search and pagination work; payload is allow-listed; no authentication is required.

**Implementation decision:** This is a confirmed backend gap. Implement this endpoint as a small, separately tested API extension alongside the artist directory UI (issue #17), unless that UI is explicitly deferred. It is not needed to begin the public homepage or artwork gallery.

## #11 — Artwork catalogue contract

### Verified current behavior

- `GET /api/v1/artworks` returns only records with `status = approved`.
- `q` matches `title`, `description`, or `medium` using a contains/LIKE query.
- `category` accepts an active category slug; inactive categories do not match.
- Results eager-load category and artist profile, are ordered newest first, and use Laravel `paginate(12)`.
- The standard Laravel paginator supports the `page` query parameter and exposes `data`, `current_page`, `last_page`, `per_page`, `total`, and navigation links/meta.
- `GET /api/v1/categories` returns active categories only.
- There is no user-selectable sort parameter. Newest-first is the fixed ordering.
- Existing artwork feature coverage verifies approved-only public visibility and basic catalogue access. Dedicated regression cases for the `q` and `category` combinations and page navigation should be added with the gallery implementation.

### Frontend integration contract

Use the existing endpoints without a backend change:

- Load active filters from `GET /api/v1/categories`.
- Request `GET /api/v1/artworks?q={term}&category={slug}&page={page}`.
- Render the paginator's page links/metadata; do not assume the first page is the whole catalogue.
- Reset to page 1 when the search term or category changes.
- Keep newest-first as the only sort in MVP 2. Do not show a sort selector until the API supports meaningful options.

## #12 — Artwork images and upload UX

### Verified current behavior

- Upload validation is enforced server-side: JPG/JPEG/PNG/WebP, maximum 5 MB, maximum 6000 × 6000 pixels.
- Uploads are stored on Laravel's private `local` disk under the `artworks` directory; no public storage URL is generated for originals.
- The image route is `GET /api/v1/artworks/{slug}/image` and invokes the artwork view policy before streaming from private storage.
- The route sets `Cache-Control: private, max-age=60` and `X-Content-Type-Options: nosniff`.
- The policy allows public access to approved artwork and restricts pending/rejected work to its owner or an administrator.
- The current public catalogue uses the returned same-origin `image_url`, native `loading="lazy"`, and a CSS 4:3 aspect ratio. There is no `srcset`, thumbnail endpoint, or generated derivative in the current implementation.

### MVP 2 image UX contract

- Keep the original image private and continue using the policy-protected route.
- Preserve aspect ratio and reserve image space before load to limit layout shift.
- Lazy-load below-the-fold catalogue images; prioritize the primary/hero image where appropriate.
- Provide a visible fallback for failed image loads and meaningful alt text.
- On upload forms, show client-side preview, accepted formats/size/dimensions, upload progress where supported by the request client, and recoverable validation/network errors.
- Do not use a public storage symlink or expose raw private storage paths.

**Decision:** Do not add image-processing dependencies, thumbnail jobs, or derivative storage for this MVP. The existing protected route is adequate for initial delivery. Revisit derivatives only if real-device testing or performance measurements show that full-size originals materially harm catalogue performance. If derivatives are later added, they must preserve the same authorization and privacy boundary.

## #13 — Workspace overview data

### Verified endpoint inventory

| Role | Existing endpoint | Shape/useful metadata |
|---|---|---|
| Artist | `GET /api/v1/artist/artworks` | Owner-scoped list; currently returns all of the artist's works (no pagination). |
| Artist | `GET /api/v1/artist/inquiries` | Owner-scoped Laravel pagination, 10 per page; includes standard total/page metadata. |
| Buyer | `GET /api/v1/buyer/inquiries` | Sender-scoped Laravel pagination, 10 per page; includes standard total/page metadata. |
| Admin | `GET /api/v1/admin/artworks?status=pending_review` | Admin-only pagination, 20 per page; total is available for the selected status. |
| Admin | `GET /api/v1/admin/users` | Admin-only pagination, 20 per page; total users available. |

### Supported MVP overview

- Artist: total artwork count can be derived from the existing complete owner-scoped artwork list; total received inquiries can use the paginator's `total`. Avoid claiming unread/new counts unless the UI fetches enough records or the API provides a reliable aggregate.
- Buyer: total sent inquiries can use the paginator's `total`; do not invent response rates or engagement statistics.
- Admin: pending moderation count can use the pending-filter paginator's `total`; total user count can use the user paginator's `total`.
- Any "recent" items shown must come from the existing newest-first list responses, with their actual timestamps.

**Decision:** No dashboard aggregation endpoint is required for MVP 2's modest overview cards. Avoid multiple speculative metrics, analytics collection, or extra API requests for counts already available through pagination metadata. Reassess only if a concrete dashboard requirement cannot be met efficiently from these responses.

## Stage 1 integration and remaining checks

- Shared UI components are implemented in PR #39, but that PR is still separate from `main`; its automated CI passed. Do not treat the component library as integrated until the PR is merged.
- PR #39's manual keyboard, narrow viewport, and real-device checks remain outstanding and are tracked in `docs/qa-checklist.md`.
- The API audit does not claim that browser/device QA, host compatibility, production deployment, or image-performance measurements have been completed.
