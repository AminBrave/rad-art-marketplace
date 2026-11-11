# API Contracts

Versioned prefix is `/api/v1`; JSON resources generally use `data` and pagination metadata. Authentication is Laravel session-based; guest bootstrap returns `{data:null}`. Validation uses Laravel 422 responses.

## Endpoint groups
Auth; public artists/artworks/categories/filters; collections/featured artists; artist profile/artworks/conversations; buyer conversations/direct start; conversation messages/read/settings/reactions/attachments/safety; notifications/preferences; admin users/roles/artwork moderation/reports/editorial; health at `/api/v1/health`. Inquiry submission, inbox/detail/status and inquiry-to-conversation endpoints are not registered while `features.inquiries` is false. Existing inquiry data and implementation are retained. Direct messaging routes remain registered under the independent `features.messaging` flag.

## Artwork response resources

Artwork API payloads are serialized through `ArtworkResource`; public catalogue/detail responses use `PublicArtworkResource`, which removes moderation status and rejection notes. The existing pagination envelope and `data` field are preserved for current React callers.

## Feature availability

Feature routes are conditionally registered from `config/features.php`; a disabled endpoint is absent and responds with 404. Frontend visibility is not an authorization boundary. Role middleware and policies remain required for every enabled protected endpoint. See [Feature Registry](feature-registry.md).

## Validation and authorization

Artwork creation and update endpoints use dedicated Laravel Form Requests (`StoreArtworkRequest` and `UpdateArtworkRequest`). Their `authorize()` methods delegate to the existing artwork policy; request rules validate the uploaded image, active category, metadata and availability before controller writes. Other API controllers retain their existing validation approach until each endpoint is migrated with matching regression coverage.

## Search behavior

Public artwork search accepts Persian and Arabic keyboard variants for yeh/kaf, Arabic/Persian digits, tatweel and common diacritics. Search normalization is applied at query time; stored titles and descriptions remain unchanged for display. User-provided wildcard characters are treated literally.

## Security contract
Protected endpoints require server auth/role/policy checks. Public serializers must exclude private profile data, unapproved works and internal moderation fields. Message endpoints validate participant, block state, rate limits and attachment access. Admin routes require admin role. Avoid serializing full Eloquent models without explicit review.

## Contract change checklist
Update route/controller validation and response; add success/422/guest/wrong-role/wrong-owner/not-found tests; update Axios callers and UI states; add browser path; update API and domain docs.
