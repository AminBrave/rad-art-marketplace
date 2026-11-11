# API and Route Test Map

This inventory is derived from routes/web.php and routes/api.php, including feature-gated routes. Inquiry endpoints remain declared but return 404 while config/features.inquiries is false; ArtistInquiryTest and InquiryRateLimitTest explicitly enable the flag to cover the retained implementation. "Existing evidence" means a test exercises part of the contract, not necessarily every method, role or failure branch.

## Authentication

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/auth/me | Guest or authenticated | AuthenticationTest, full-stack auth browser tests | Session expiry and identity/cache transition |
| POST /api/v1/auth/register | Guest, throttled | AuthenticationTest, RegistrationContractTest | Duplicate email, rate limit boundary and session regeneration |
| POST /api/v1/auth/login | Guest, throttled | AuthenticationTest | Rate limit boundary, invalid/locked account behavior if implemented |
| POST /api/v1/auth/logout | Authenticated | AuthenticationTest | Session invalidation and CSRF behavior in browser |

## Public discovery and artist profiles

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/artists | Public | ArtistProfileTest, ArtistDirectorySearchNormalizationTest | Filter combinations and bounds |
| GET /api/v1/artists/{artistProfile:slug} | Public; owner/admin can preview private | ArtistProfileTest | All private fields and deleted/missing relationships |
| GET /api/v1/categories | Public | ArtworkTest / discovery browser fixtures | Active-only categories and empty state |
| GET /api/v1/artwork-filters | Public | Discovery browser tests | Eligible public content only and stable ordering |
| GET /api/v1/artworks | Public approved/public-profile content only | ArtworkTest, ArtworkSearchNormalizationTest | All sort modes, filter combinations, invalid query boundaries |
| GET /api/v1/artworks/{artwork:slug} | Public if policy allows | ArtworkTest | Related-work eligibility and serializer privacy |
| GET /api/v1/artworks/{artwork:slug}/image | Policy-controlled | ArtworkTest | Missing file, private profile, cache headers and content sniffing |
| GET /api/v1/collections | Public published content | EditorialTest, test_m03_editorial.py | Pagination and publication-time boundaries |
| GET /api/v1/collections/{collection:slug} | Public published content | EditorialTest, test_m03_editorial.py | Missing/draft collection and ineligible artwork |
| GET /api/v1/featured-artists | Public eligible artists | EditorialTest | Publication windows and private/unapproved content |
| POST /api/v1/artists/{artistProfile:slug}/inquiries | Feature-disabled by default (404); authenticated buyer when enabled | ArtistInquiryTest and InquiryRateLimitTest explicitly enable the flag | Disabled response and enabled submission are covered; retry/idempotency expectations remain |

## Artist workspace

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/artist-profile/me | Artist/admin | ArtistProfileTest | Artist with no profile and admin behavior |
| PUT /api/v1/artist-profile/me | Artist/admin | ArtistProfileTest | Slug collision and partial onboarding |
| GET /api/v1/artist-profiles/{artistProfile} | Artist/admin policy | ArtistProfileTest | Full role/ownership matrix |
| PATCH /api/v1/artist-profiles/{artistProfile} | Owner/admin policy | ArtistProfileTest | Invalid fields and non-owner denial |
| GET /api/v1/artist/artworks | Artist | ArtworkTest | Empty state, pagination boundaries and private fields |
| POST /api/v1/artist/artworks | Artist, throttled | ArtworkTest, ArtworkStorageRollbackTest, test_full_stack_artist_artwork.py | MIME spoofing and size boundaries |
| PATCH /api/v1/artist/artworks/{artwork} | Owner/admin, throttled | ArtworkTest, ArtworkModerationTest, ArtworkStorageRollbackTest | Foreign ownership and successful replacement lifecycle |
| GET /api/v1/artist/inquiries | Feature-disabled by default (404); artist when enabled | FeatureRegistryTest; ArtistInquiryTest explicitly enables the flag | Pagination and status filters |
| GET /api/v1/artist/inquiries/{inquiry} | Feature-disabled by default (404); owning artist when enabled | FeatureRegistryTest; ArtistInquiryTest explicitly enables the flag | Private buyer-field contract |
| PATCH /api/v1/artist/inquiries/{inquiry} | Feature-disabled by default (404); owning artist when enabled | FeatureRegistryTest; ArtistInquiryTest explicitly enables the flag | Invalid transitions and repeated updates |
| GET /api/v1/artist/conversations | Artist participant | ConversationTest, DirectConversationTest, ConversationInboxSettingsTest | Pagination, private participant fields and unread counts |

## Buyer workspace

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/buyer/inquiries | Feature-disabled by default (404); buyer when enabled | FeatureRegistryTest; ArtistInquiryTest explicitly enables the flag | Pagination and ordering |
| GET /api/v1/buyer/inquiries/{inquiry} | Feature-disabled by default (404); owning buyer when enabled | FeatureRegistryTest; ArtistInquiryTest explicitly enables the flag | Deleted artist/artwork relationships |
| GET /api/v1/buyer/conversations | Buyer participant | ConversationInboxSettingsTest, ConversationTest | Pagination and all filters |
| POST /api/v1/conversations/direct | Buyer, throttled | DirectConversationTest, full-stack messaging E2E | Concurrent creation/retry behavior and rate limit |
| POST /api/v1/inquiries/{inquiry}/conversation | Feature-disabled by default (404); inquiry owner when enabled | FeatureRegistryTest; ConversationTest | Repeated start and cross-buyer denial |

## Conversations and messages

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/conversations/{conversation} | Participant | ConversationTest | Archived/deleted/private context serialization |
| GET /api/v1/conversations/{conversation}/messages | Participant | ConversationTest | Pagination boundaries and ordering under equal timestamps |
| POST /api/v1/conversations/{conversation}/messages | Participant, unblocked, throttled | ConversationTest, MessageSafetyTest, full-stack messaging E2E | Rate-limit boundary and concurrent idempotency |
| PATCH /api/v1/conversations/{conversation}/messages/{message} | Message sender | ConversationTest | Length/boundary validation and deleted message behavior |
| DELETE /api/v1/conversations/{conversation}/messages/{message} | Message sender | ConversationTest | Child reaction/attachment privacy and repeated delete |
| POST /api/v1/conversations/{conversation}/messages/{message}/reactions | Participant | ConversationTest | Invalid emoji and removal/re-add behavior |
| PATCH /api/v1/conversations/{conversation}/read | Participant | ConversationTest | Read timestamps for mixed sender/read states |
| PATCH /api/v1/conversations/{conversation}/settings | Participant | ConversationInboxSettingsTest | Invalid settings and concurrent participant isolation |
| GET /api/v1/conversations/{conversation}/safety | Participant | MessageSafetyTest | Covered: viewer-relative block state and outsider denial |
| POST /api/v1/conversations/{conversation}/block | Participant, throttled | MessageSafetyTest | Duplicate block and reverse-block behavior |
| DELETE /api/v1/conversations/{conversation}/block | Participant, throttled | MessageSafetyTest | Repeated unblock and reverse-block behavior |
| POST /api/v1/conversations/{conversation}/report | Participant, throttled | MessageSafetyTest | Covered: idempotent conversation reports; throttle and invalid reason boundary remain |
| POST /api/v1/conversations/{conversation}/messages/{message}/report | Participant, throttled | MessageSafetyTest | Report lifecycle and deleted message behavior |
| POST /api/v1/conversations/{conversation}/messages/{message}/attachments | Sender, unblocked, throttled | MessageAttachmentTest | Size, MIME spoofing, storage failure and rollback |
| GET /api/v1/conversations/{conversation}/messages/{message}/attachments/{attachment} | Participant | MessageAttachmentTest | Cross-message attachment ID, deleted message and private storage headers |

## Notifications

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/notifications | Authenticated | MessageNotificationTest, notification browser tests | Pagination and cross-user isolation |
| PATCH /api/v1/notifications/read-all | Authenticated | MessageNotificationTest | Already-read and empty states |
| GET /api/v1/notifications/preferences | Authenticated | MessageNotificationTest | Covered: safe defaults and email disabled |
| PATCH /api/v1/notifications/preferences | Authenticated | MessageNotificationTest | Covered: boolean validation and email remains disabled |
| PATCH /api/v1/notifications/{notification}/read | Owner only | MessageNotificationTest | Foreign notification denial and repeated read |

## Administration and editorial

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/admin/users | Admin | AuthorizationTest, AdminPaginationTest | Search/filter boundaries and private fields |
| PATCH /api/v1/admin/users/{user}/role | Admin | AuthorizationTest | Invalid role, self-demotion and last-admin invariant |
| GET /api/v1/admin/artworks | Admin | ArtworkModerationTest | Filters and pagination |
| PATCH /api/v1/admin/artworks/{artwork}/moderation | Admin | ArtworkModerationTest, unmocked admin moderation E2E | Complete transition matrix and audit integrity |
| GET /api/v1/admin/message-reports | Admin | MessageSafetyTest | Report filters, pagination and privacy |
| PATCH /api/v1/admin/message-reports/{report} | Admin | MessageSafetyTest | Covered: dismissed and remove_message actions; reviewed and invalid-transition cases remain |
| GET /api/v1/admin/editorial/options | Admin | EditorialTest | Covered: only public artists and approved public artworks |
| GET /api/v1/admin/editorial/featured-artists | Admin | EditorialTest | Covered: saved selections and ordering; date-window edge cases remain |
| PUT /api/v1/admin/editorial/featured-artists | Admin | EditorialTest | Covered: save and reject private profiles; duplicate/date-window boundaries remain |
| GET /api/v1/admin/editorial/collections | Admin | EditorialTest | Covered: admin listing and order; pagination boundary remains |
| POST /api/v1/admin/editorial/collections | Admin | EditorialTest | Validation and transactional rollback |
| PATCH /api/v1/admin/editorial/collections/{collection} | Admin | EditorialTest | Covered: update and preserve membership on ineligible artwork |
| PATCH /api/v1/admin/editorial/collections/{collection}/publication | Admin | EditorialTest | Scheduled/publication boundary behavior |
| PUT /api/v1/admin/editorial/collections/order | Admin | EditorialTest | Covered: reorder and audit; duplicate/missing IDs remain |

## Public pages and infrastructure

| Method and route | Access | Existing evidence | Remaining checks |
|---|---|---|---|
| GET /api/v1/health | Public | HealthEndpointTest | Dependency failure/readiness semantics if exposed |
| GET /sitemap.xml | Public | PublicSeoTest | Only eligible canonical URLs and pagination |
| GET /robots.txt | Public | PublicSeoTest | Production-safe directives |
| GET /artists/{slug} | Public shell / SPA | FrontendRoutingTest, discovery browser tests | Deep-link metadata and private-profile handling |
| GET /artworks/{slug} | Public shell / SPA | FrontendRoutingTest, discovery browser tests | Deep-link metadata and unpublished work |
| GET /collections/{slug} | Public shell / SPA | FrontendRoutingTest, editorial browser tests | Draft and missing slug behavior |
| GET / and remaining SPA routes | Public shell / SPA | FrontendRoutingTest, browser suites | Every client route, 404 and refresh behavior |

## Client-side route map

| Client route | Actor | Existing browser evidence |
|---|---|---|
| /, /artworks, /artworks/:slug | Visitor | test_m02_discovery.py |
| /about, /help, /contact | Visitor | FrontendRoutingTest; browser smoke coverage to expand |
| /unauthorized | Authenticated user with insufficient role | test_buyer_inquiry.py role-boundary scenario |
| /artists, /artists/:slug | Visitor / buyer | test_m02_discovery.py, test_full_stack_buyer_inquiry.py, test_full_stack_buyer_artist_messaging.py |
| /collections, /collections/:slug | Visitor | test_m03_editorial.py |
| /login, /register | Guest | test_full_stack_auth.py, accessibility smoke tests |
| /dashboard | Authenticated | test_full_stack_auth.py |
| /dashboard/buyer | Buyer | test_full_stack_buyer_artist_messaging.py |
| /dashboard/buyer/inquiries, /dashboard/buyer/inquiries/:id | Feature-disabled by default; client renders not-found | test_buyer_inquiry.py |
| /dashboard/buyer/messages | Buyer | full-stack messaging and notification browser tests |
| /dashboard/artist, /dashboard/artist/profile, /dashboard/artist/artworks | Artist | test_m04_artist_experience.py, test_full_stack_artist_artwork.py |
| /dashboard/artist/inquiries | Feature-disabled by default; client renders not-found | test_m04_artist_experience.py, test_buyer_inquiry.py |
| /dashboard/artist/messages | Artist | full-stack messaging and notification browser tests |
| /admin, /admin/users, /admin/artworks, /admin/message-reports, /admin/editorial | Admin | test_full_stack_admin_moderation.py, test_m03_editorial.py, responsive RTL suite |

## Maintenance rule

When a route is added, removed or changes authorization/feature availability, update this map and add the corresponding API contract tests. FeatureRegistryTest proves disabled Inquiry endpoints return 404 while messaging endpoints remain registered. Route existence is not coverage: include success, validation, role/ownership denial, private-data serialization and relevant failure cases.
