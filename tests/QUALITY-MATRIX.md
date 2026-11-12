# Rademan Quality Matrix

This matrix maps real product behavior to actors, risk and the tests that should protect it. It intentionally excludes checkout, payments, shipping, payouts and subscriptions: those are not current product capabilities in the inspected routes and application code.

## Actor and journey map

| Journey | Actor | User outcome | Critical invariants |
|---|---|---|---|
| Discover art | Visitor | Search and browse public artists and approved artworks | Only public profiles/approved works are discoverable; filters and Persian search remain predictable |
| Evaluate artist | Visitor | Open artist profile and artwork detail | Public/private profile boundaries, stable slugs, SEO metadata and safe image delivery |
| Contact artist | Buyer | Start a conversation from an artist or artwork | Buyer-only initiation, approved artwork context, one canonical conversation per pair |
| Communicate | Buyer and artist | Send, read, edit, delete, react and attach files | Participant isolation, sender ownership, idempotency, bounded uploads, private attachment access |
| Stay safe | Buyer and artist | Report, block and unblock | Reports are participant-scoped and idempotent; block state is viewer-relative; blocked messages cannot be sent |
| Publish portfolio | Artist | Create and maintain profile/artworks | Artist ownership, validation, private media, review lifecycle and safe resubmission |
| Moderate | Admin | Approve, reject or request artwork changes; review reports | Admin-only access, valid transitions, required notes, race-safe decisions and audit trail |
| Curate | Admin/editor | Publish collections and featured artists | Admin-only mutation, deterministic ordering, publication visibility and rollback integrity |
| Manage account | Buyer, artist, admin | Register, sign in/out and manage notifications | Role assignment cannot be escalated; session lifecycle and preferences remain private |

## Current automated coverage (source inventory)

| Area | Existing protection observed | Assessment |
|---|---|---|
| Authentication | Guest bootstrap, registration, buyer/artist role choice, admin-role rejection, password confirmation, login/logout and invalid credentials | Expanded in this phase with registration/login/logout session rotation and guest login throttling; registration throttling and broader abuse scenarios remain |
| Authorization | Admin user-management role gate, self-demotion protection, artist artwork ownership and conversation participant checks | Good targeted cases; complete route/role matrix still needed |
| Artwork | Upload validation, private storage, owner/admin editing, pending/public visibility, public artist-profile filtering across review states, filters, sort, pagination and price nullability | Broad; malformed image content/size and deeper media-integrity failure cases remain |
| Moderation | Admin-only queue, approve/reject/request-changes, required notes, repeat decision rejection, artist edit resets review metadata, owner-only review feedback, resubmission cleanup and public artist-profile visibility across review states | Stronger lifecycle coverage; simultaneous admin decision and notification failure still need integration coverage |
| Messaging | Participant isolation, idempotent client message IDs scoped to sender and conversation, changed-payload replay, deleted-message tombstones, reply context, reactions, edit/delete, read state and inbox settings | Broad; true simultaneous duplicate requests and database/queue failure recovery remain gaps |
| Attachments | Private PDF upload/download, sender-only upload, unsupported extension rejection, deletion cleanup and participant download | Expanded in this phase; route-binding, guest, preview-type and count boundaries now have regression cases |
| Safety | Report idempotency, block/unblock, viewer-relative state, admin moderation and audit record | Good; abuse/rate-limit and attachment cleanup failure paths deserve deeper integration coverage |
| Editorial/SEO | Editorial API and public SEO tests exist | Validate atomic reorder/publication rollback and missing/unpublished slug behavior more deeply |
| Frontend | Query client retry policy, UI utilities, design system, color accessibility, SSR semantics for disabled/busy buttons, field errors, alert/retry and empty states, artist workspace and direct messaging | Component contracts are covered; page-level async states and auth expiry still need broader coverage |
| Browser | Cross-role journeys, auth, artwork publishing, admin moderation, messaging, notifications, discovery, editorial, responsive RTL smoke, artist-directory error-to-empty retry, empty results and keyboard search submission | Stronger visitor discovery resilience; authenticated expiry, duplicate form submission, loading transitions and dialog focus management remain gaps |
| Performance | No dedicated repeatable performance budget suite was identified | Not yet covered as a governed quality gate |

## Route-to-role security matrix

For every protected route family, keep at least one success case for the authorized actor and negative cases for unauthenticated and authenticated-but-unprivileged actors. For object-scoped routes, include an unrelated owner/participant and a mismatched parent-child identifier.

| Route family | Guest | Buyer | Artist | Admin | Object boundary |
|---|---|---|---|---|---|
| `/auth/*` | Register/login; guest `me` | Own session only | Own session only | Own session only | Role cannot be self-assigned to admin |
| Public artists/artworks/collections | Read published/public data | Same | Same | Same | Private profiles and pending/rejected artwork stay private |
| Artist profile/artwork mutation | Deny | Deny | Own profile/artworks | Explicit admin exceptions only | Another artist's records are inaccessible |
| Direct conversation creation | Deny | Allow | Deny | Deny unless product contract changes | Only public artist + approved artwork; repeated artwork-context requests remain deduplicated |
| Conversation/message/attachment | Deny | Participant only | Participant only | No implicit access from admin role | Non-participant, wrong message and wrong attachment all denied |
| Buyer inbox | Deny | Own inbox | Deny | Deny | Per-user archive/mute/read state does not leak |
| Artist inbox | Deny | Deny | Own inbox | Deny | Only conversations where user is artist |
| Notifications/preferences | Deny | Own only | Own only | Own only | Notification IDs cannot cross accounts |
| Admin users/moderation/editorial | Deny | Deny | Deny | Allow | Prevent self-lockout and stale/invalid state transitions |

This is a target coverage contract, not a claim that every cell has a dedicated test today. Keep the matrix synchronized with `routes/web.php`.

## Priority backlog

### P0 — Security and data integrity

- Authentication: registration/login/logout session rotation and guest login throttling now have regression cases; add registration-throttle and broader abuse/lockout scenarios.
- Authorization: table-driven coverage for all protected route families; guest, wrong role, wrong owner and non-participant cases.
- Private media: wrong conversation/message/attachment combinations, missing files, private cache headers, unsupported preview types, upload size/MIME/content mismatch and attachment count.
- Artwork lifecycle: only pending work can be moderated; artist resubmission clears review metadata; review feedback is visible only to the owner; public artist profiles expose approved work only across all review states. Stale concurrent decisions cannot overwrite each other.
- Messaging: client message IDs are scoped to sender and conversation; changed-payload retries return the original message; deleted-message retries preserve tombstones and do not re-notify; direct conversation/artwork-context retries remain deduplicated. True concurrent duplicate requests and database/queue failure recovery remain follow-up work.
- Notifications: account isolation, preference enforcement, muted-recipient suppression, message retry does not duplicate notifications and private message bodies are not exposed. Queue worker retry/failure recovery and dead-letter observability remain follow-up work.
- Transaction boundaries: storage/database rollback and cleanup failure behavior.

### P1 — Product UX, accessibility and RTL

- Artist-directory browser coverage now verifies API failure with explicit retry into an empty result, a stable empty state and Enter-key search with URL query persistence. Extend the same state coverage to artwork catalogue, workspace data and messaging.
- Exercise loading, validation, disabled/submitting and expired-session states on critical React pages; test duplicate form submission and post-expiry recovery.
- Keyboard-only navigation, visible focus, dialog focus trap/restore, escape behavior and live-region announcements.
- RTL at 320, 375, 768, 1024 and desktop widths; mixed Persian/Latin names, email, URLs, numbers and long text.
- Add axe-core/Playwright scans to key public and authenticated routes after a stable browser setup; automated checks supplement, not replace, manual assistive-technology review.
- Visual regression only after deterministic fixtures, fonts, image assets and viewport baselines are stable.

### P1 — Contracts and resilience

- API/resource contract assertions for required fields, nullability, pagination, status codes and validation errors.
- Migration compatibility and database constraints for uniqueness, foreign keys, nullable relationships and cascade/soft-delete behavior.
- Storage and notification failure injection; transaction rollback; retry/idempotency; concurrency for conversation creation and moderation.
- Property-style cases for Persian Arabic Yeh/Kaf, diacritics, whitespace and mixed-script search normalization.

### P2 — Performance and advanced assurance

- Establish Lighthouse/Core Web Vitals budgets with pinned browser, viewport, throttling and repeatable content before making them blocking.
- Track image payloads, lazy loading, frontend chunk size, catalogue query plans, N+1 regressions and long message-history pagination.
- Add k6 only when production-like load assumptions and safe test infrastructure are defined.
- Consider mutation testing (e.g. Infection for PHP or Stryker for JS) after the critical tests are stable; use it to find weak assertions, not as an arbitrary score target.
- Consider Pact only if independently deployed consumers/providers need an explicit shared contract. Current single-repository API tests may provide better value at lower cost.

## Quality gates (recommended)

| Gate | Acceptance target |
|---|---|
| Critical journeys | Every visitor discovery, buyer contact, artist publish and admin moderation journey has an end-to-end happy path and at least one meaningful failure path |
| Security | Every protected route family has role/ownership denial coverage; private data and files are verified not to leak |
| API contracts | Critical endpoints assert status, validation shape, resource fields and pagination/null semantics |
| Forms and async UI | Critical flows cover loading, success, empty, validation, failure/retry and submitting/disabled behavior |
| Accessibility | No known critical/serious automated violations on selected routes, plus documented keyboard/screen-reader review |
| RTL/responsive | Key routes pass at agreed widths and mixed-direction content cases |
| Data integrity | Database constraints and transaction/rollback invariants are tested |
| Performance | Budgets are measured reproducibly before they become blocking |
| Test health | No unexplained skipped, quarantined, flaky or weakened tests |

Do not set an arbitrary 100% line-coverage target. Prioritize risk-weighted journey, permission, privacy and data-integrity coverage.
