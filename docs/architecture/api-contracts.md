# API Contracts

Versioned prefix is `/api/v1`; JSON resources generally use `data` and pagination metadata. Authentication is Laravel session-based; guest bootstrap returns `{data:null}`. Validation uses Laravel 422 responses.

## Endpoint groups
Auth; public artists/artworks/categories/filters; collections/featured artists; artist profile/artworks/inquiries/conversations; buyer inquiries/conversations/direct start; conversation messages/read/settings/reactions/attachments/safety; notifications/preferences; admin users/roles/artwork moderation/reports/editorial; health at `/api/v1/health`.

## Security contract
Protected endpoints require server auth/role/policy checks. Public serializers must exclude private profile data, unapproved works and internal moderation fields. Message endpoints validate participant, block state, rate limits and attachment access. Admin routes require admin role. Avoid serializing full Eloquent models without explicit review.

## Contract change checklist
Update route/controller validation and response; add success/422/guest/wrong-role/wrong-owner/not-found tests; update Axios callers and UI states; add browser path; update API and domain docs.
