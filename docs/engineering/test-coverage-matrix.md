# Test Coverage Matrix

This is the source-backed inventory for the implemented Rademan product. It records known test evidence at the start of the testing overhaul. It is not a claim that every listed scenario is already covered. Update the status as batches add and verify tests.

Status vocabulary:
- **Existing evidence** — an existing test exercises at least part of this capability; inspect assertions before assuming full coverage.
- **Gap / expand** — behavior exists but explicit scenarios need to be added or strengthened.
- **Planned** — target coverage not yet implemented.
- **Out of scope** — not currently an implemented product capability.

## Current test inventory

The initial inventory below records the repository before this overhaul. The following coverage has since been added in this branch.

## Initial measured backend line-coverage baseline

Measured from the first complete PCOV run on PR head c1e0f4c:

- Combined across Unit + Feature + Integration: **1,491 / 1,631 statements (91.4%)**.
- Feature suite: 1,475 / 1,626 statements (90.7%).
- Unit suite: 34 / 1,631 statements (2.1%).
- Integration suite: 49 / 1,631 statements (3.0%).

The combined number is a union of covered statement lines across the three reports. Per-suite percentages are not additive. PCOV measures line/statement coverage here; branch/condition coverage is not measured. These are diagnostic baselines, not correctness guarantees or enforced thresholds.

The clearest next backend targets from this baseline are EditorialController (68.3%), CuratedCollection (80.0%), MessageReport (80.0%), ArtworkPolicy (85.7%), User (85.7%) and MessageSafetyController (85.8%). Several tiny model classes have no direct statement coverage and should be assessed for whether they contain meaningful behavior worth testing.

## Coverage added by this overhaul

| Layer | Added tests | Behavior asserted |
|---|---|---|
| Unit | PersianSearchTest, ConversationTest | Arabic/Persian normalization, null/empty handling, digit mapping, participant identity |
| Feature | ArtworkSearchNormalizationTest, ArtistDirectorySearchNormalizationTest, InquiryRateLimitTest | SQLite search normalization, nullable columns, literal LIKE wildcard escaping, inquiry throttling |
| Integration | CanonicalConversationConstraintTest, ArtworkStorageRollbackTest | Database uniqueness for canonical conversations; uploaded file cleanup and original-image preservation on write failure |
| React component rendering | reactComponents.test.js | Button busy/disabled semantics, FormField label/error wiring, SearchField landmark, ErrorState alert, upload progress bounds, EmptyState semantics |
| Browser full-stack | FullStackBuyerArtistMessagingTests | Buyer starts a direct conversation, artist replies, buyer receives the reply |
| Browser full-stack | FullStackBuyerInquiryTests | Buyer submits inquiry, artist receives it, private buyer email is not serialized |
| Browser full-stack | FullStackArtistArtworkTests | Artist uploads artwork; pending work remains absent from public search |
| Browser full-stack | FullStackAdminModerationTests | Admin approves pending work; buyer is denied at UI and API |
| Browser accessibility | AccessibilitySmokeTests | Persian document direction, main landmark, accessible names and image alt attributes |


| Layer | Current location | Existing files / scope |
|---|---|---|
| Backend feature | tests/Feature | Authentication, authorization, artist inquiry/profile, artwork, moderation, admin pagination, conversation/direct conversation/inbox settings, attachments, safety, notifications, editorial, SEO, health, frontend routing and demo seeders |
| Frontend logic | tests/js | Artist experience, design system, price formatting, query client and UI utilities |
| Browser | tests/browser | Buyer inquiry, full-stack auth, discovery, editorial, artist experience, notifications, responsive RTL |
| Backend unit | — | No dedicated tests/Unit suite at baseline |
| Backend integration | — | No dedicated tests/Integration suite at baseline |
| React component | — | No dedicated React Testing Library suite at baseline |

## Domain coverage matrix

### Authentication and account security

| Scenario | Layer | Baseline |
|---|---|---|
| Registration: artist default and buyer role | Feature + E2E | Existing evidence |
| Public registration cannot assign admin | Feature | Existing evidence |
| Password confirmation/validation | Feature | Existing evidence |
| Login, current-user bootstrap and logout | Feature + E2E | Existing evidence |
| Invalid credentials and duplicate registration | Feature | Existing evidence; expand |
| Guest, buyer, artist and admin access matrix for every protected route | Feature | Gap / expand |
| Session regeneration/invalidation, CSRF and cookie behavior | Feature + E2E | Gap / expand |
| Login/register throttling and abuse boundaries | Feature | Gap / expand |
| Account identity switch clears client cache | Frontend integration + E2E | Gap / expand |

### Artist profiles and directory

| Scenario | Layer | Baseline |
|---|---|---|
| Profile create/update and public visibility | Feature | Existing evidence |
| Owner/admin access and cross-artist denial | Feature | Existing evidence; expand route matrix |
| Unique slug, slug changes and missing profile | Feature | Gap / expand |
| Incomplete onboarding profile | Feature | Gap / expand |
| Public profile serialization excludes private fields | Feature + E2E | Gap / expand |
| Directory search, filtering, pagination and empty state | Feature + Frontend + E2E | Gap / expand |
| Persian/Arabic normalization and Unicode profile content | Unit + Feature | Gap / expand |

### Artworks and moderation

| Scenario | Layer | Baseline |
|---|---|---|
| Artist creates artwork and stores image privately | Feature + unmocked E2E | Existing API evidence plus real browser upload and pending-publication exclusion added |
| Form validation, MIME/size and inactive category | Feature | Existing evidence; expand boundary cases |
| Owner edits; another artist denied | Feature | Existing evidence |
| Editing approved artwork resets moderation state | Feature | Existing evidence |
| Public catalogue/detail exposes approved public work only | Feature | Existing evidence |
| Catalogue pagination and artist ownership scoping | Feature | Existing evidence |
| Search normalization, wildcard escaping and Arabic/Persian digits | Unit + Feature | Unit and SQLite-backed feature regression tests added; CI execution pending |
| Category/filter/sort combinations and malformed filters | Feature | Gap / expand |
| Approve/reject/request changes with required notes | Feature | Existing evidence; verify transition matrix |
| Rejected/changes-requested resubmission | Feature | Gap / expand |
| File cleanup after failed create/update and private image access | Integration + Feature | Storage rollback integration tests added; private image access remains to expand |
| Moderation audit integrity and public serializer privacy | Feature | Gap / expand |

### Buyer inquiries and canonical conversations

| Scenario | Layer | Baseline |
|---|---|---|
| Buyer-only inquiry submission and validation | Feature + unmocked E2E | Existing API evidence plus buyer submission and artist receipt journey added |
| Private artist and invalid/unapproved artwork target | Feature | Existing evidence |
| Buyer sees own inquiry; other buyer denied | Feature | Existing evidence |
| Artist sees/manages only addressed inquiries | Feature | Existing evidence |
| Honeypot and throttling | Feature | Existing honeypot evidence; five-per-minute buyer throttle regression added |
| Start conversation from inquiry | Feature + Browser | Existing evidence |
| Direct conversation without inquiry | Feature | Existing evidence |
| One canonical conversation per buyer/artist pair across entry points | Feature + Integration | Existing evidence; database uniqueness test added |
| Pair key ordering and database uniqueness under retries | Unit + Integration | Gap / expand |
| Invalid actor, role and context relationships | Feature | Gap / expand |

### Messaging, safety and notifications

| Scenario | Layer | Baseline |
|---|---|---|
| Participant-only conversation and message access | Feature | Existing evidence |
| Send, edit, delete and reply validation | Feature | Existing evidence |
| Client message idempotency | Feature | Existing evidence |\n| Buyer creates a direct thread, artist replies, buyer receives reply in real browser | Unmocked E2E | Added in current batch; CI execution pending |
| Read/unread state and pagination | Feature | Existing evidence; expand concurrency |
| Reactions and duplicate reaction behavior | Feature | Existing evidence |
| Archive/mute are participant-specific | Feature | Existing evidence |
| Attachment validation, private storage and participant download | Feature | Existing evidence; expand MIME/path traversal/oversize |
| Block/unblock and both-direction messaging restriction | Feature | Existing evidence |
| Conversation/message reporting and duplicate report handling | Feature | Existing evidence |
| Admin review, removal and audit record | Feature | Existing evidence |
| Notification dispatch after commit and queue retry/failure | Feature + Integration | Existing evidence; expand |
| Notification preference persistence and filtering | Feature | Existing evidence; expand |
| Cross-user notification and attachment privacy | Feature | Gap / expand |
| Race conditions around duplicate conversation/message submission | Integration | Planned |

### Editorial and administration

| Scenario | Layer | Baseline |
|---|---|---|
| Admin-only user list and role update | Feature | Existing evidence |
| Admin cannot remove own admin role | Feature | Existing evidence |
| Collection create/edit/publish/unpublish/order | Feature | Existing evidence |
| Public visibility respects publication and eligible content | Feature | Existing evidence; expand time windows |
| Featured artist curation and public eligibility | Feature | Existing evidence; expand |
| Admin routes denied for guest/non-admin across all endpoints | Feature + E2E | Existing API authorization evidence; unmocked buyer-to-admin denial journey added; full endpoint matrix remains to expand |
| Audit fields and invalid/deleted references | Feature | Gap / expand |

### Public pages, SEO and infrastructure

| Scenario | Layer | Baseline |
|---|---|---|
| Public artists/artworks/collections and detail routes | Feature + Browser | Existing evidence; expand deep links |
| Sitemap and robots rules | Feature | Existing evidence |
| SEO metadata and canonical URL behavior | Feature + Browser | Existing evidence; expand |
| Health endpoint response | Feature | Existing evidence |
| SPA fallback and API route separation | Feature | Existing evidence |
| Fresh migrations and migration rollback safety | Integration | Planned |
| Queue worker, database queue persistence and failure handling | Integration | Gap / expand |
| Production and cPanel build | CI | Existing evidence |
| Database query count/N+1 and performance budgets | Integration | Planned |

### Frontend experience and accessibility

| Scenario | Layer | Baseline |
|---|---|---|
| Price formatting, class merge, query retry defaults | JS unit | Existing evidence |
| Button, FormField, SearchField, EmptyState, ErrorState and UploadFeedback semantic markup/ARIA | React SSR component | Added in tests/js/reactComponents.test.js |
| Shared component keyboard/focus/dialog interaction | Browser | Gap / expand |
| Feature form validation and API errors | React component | Planned |
| Loading, empty and error states across screens | React component | Planned |
| Route guards and unauthorized redirects | React integration + Browser | Browser evidence partial; expand |
| Query cache invalidation and account switch | React integration | Gap / expand |
| Persian numerals, RTL, long text and mixed-direction content | Component + Browser | Browser evidence partial; expand |
| Responsive navigation, forms, messaging and admin tables | Browser | Existing evidence; expand |
| Document direction, main landmarks, accessible control names and image alt smoke checks | Browser | Added smoke coverage; axe-core and manual keyboard/screen-reader audit remain planned |
| Reduced motion, focus visibility and semantic landmarks | Component + Browser | Planned |

## Product boundary: intentionally not tested as implemented features

The following are not currently evidenced as implemented product capabilities and must not be represented as covered: cart/checkout, payment capture, orders, refunds, shipping, escrow, commissions, tax calculation, artist payouts, email notifications, or realtime transport. Add tests only after the relevant feature is implemented and accepted.

## Batch exit criteria

A domain batch is complete only when:
1. Each implemented route and business transition in scope maps to tests.
2. Positive, validation, unauthenticated, wrong-role, wrong-owner and privacy cases are covered where applicable.
3. Tests use isolated state and assert persisted/serialized outcomes.
4. Relevant frontend and unmocked browser paths exist for user-visible critical behavior.
5. Test commands and evidence are recorded; unrun tests remain explicitly unverified.
6. This matrix and testing strategy match actual code.
