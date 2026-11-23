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
| Authentication | Guest bootstrap, registration, buyer/artist role choice, admin-role rejection, password confirmation, login/logout and invalid credentials | Expanded with server-rendered guest/authenticated app-shell bootstrap, private no-store response headers, registration/login/logout session rotation and guest login throttling; registration throttling and broader abuse scenarios remain |
| Authorization | Admin user-management role gate, self-demotion protection, artist artwork ownership and conversation participant checks | Good targeted cases; complete route/role matrix still needed |
| Artwork | Upload validation, private storage, owner/admin editing, pending/public visibility, public artist-profile filtering across review states, filters, sort, pagination and price nullability | Broad; malformed image content/size and deeper media-integrity failure cases remain |
| Moderation | Admin-only queue, approve/reject/request-changes, required notes, repeat decision rejection, artist edit resets review metadata, owner-only review feedback, resubmission cleanup and public artist-profile visibility across review states | Stronger lifecycle coverage; simultaneous admin decision and notification failure still need integration coverage |
| Messaging | Participant isolation, idempotent client message IDs scoped to sender and conversation, changed-payload replay, deleted-message tombstones, reply context, reactions, edit/delete, read state, inbox settings, inbox failure/retry, selected message-history retry and older-message pagination retry/de-duplication | Broad; true simultaneous duplicate requests and database/queue failure recovery remain gaps |
| Attachments | Private PDF upload/download, sender-only upload, unsupported extension rejection, deletion cleanup, participant download, private image preview and missing-storage denial | Expanded in this phase; route-binding, guest, preview-type, count, private preview and missing-file boundaries have regression cases; browser coverage verifies upload failure/retry preserves the selected file and draft while reusing the same idempotent message ID |
| Safety | Report idempotency, block/unblock, viewer-relative state, admin moderation and audit record | Good; abuse/rate-limit and attachment cleanup failure paths deserve deeper integration coverage |
| Editorial/SEO | Editorial API and public SEO tests exist | Validate atomic reorder/publication rollback and missing/unpublished slug behavior more deeply |
| Frontend | Query defaults, messaging query/cache utilities, mutation architecture, RAD token/source audits, color contrast, SSR contracts for shared primitives/navigation/feedback, role-aware authenticated app-shell navigation, real QueryClient retry/cache and mutation lifecycles, image loading skeleton/priority semantics, and selected artist workspace behavior | Static RAD design-system contracts cover primary-only bottom navigation, separate primary/secondary dashboard header tiers, shared role route registry, public-layout visibility for signed-in users, retained public/header controls and primary-bar safe-area/content clearance. SSR contracts and existing Playwright suites continue to cover selected public/authenticated async states, retry, keyboard, RTL and responsive journeys. Remaining gaps include real-browser bottom-navigation route/scroll/focus behavior at 320px/tablet sizes, route-by-route lazy fallback and page async-state coverage, live dialog focus behavior, broader form validation announcements, mixed-direction content, and a full automated accessibility scan |
| Design system | `AI/DESIGN-SYSTEM.md` defines the editorial visual language and persistent authenticated app-shell/navigation hierarchy; a dynamic frontend presentation audit discovers every JavaScript/JSX source under `resources/js`, every Blade template under `resources/views` and every stylesheet under `resources`; it checks RAD semantic palette usage, arbitrary hex utility colors, removed component classes, stylesheet selector boundaries, token-backed inline colors and the Blade first-paint skeleton motion contract | Static regression coverage includes the global signed-in navigation contract; visual rendering, real-browser route behavior, responsive screenshots, browser accessibility scans and manual keyboard/screen-reader review remain separate evidence |
| Browser | Cross-role journeys, auth, artwork publishing, admin moderation, messaging inbox, selected message-history, older-message pagination, message-attachment upload failure/retry, incremental message polling and read/unread inbox-cache reconciliation, cross-role messaging, notifications, discovery, editorial, responsive RTL smoke, artist-directory, artwork-catalogue and authenticated artist-workspace error/retry journeys, empty results, filter-metadata degradation, keyboard search submission, expired-session redirect and reauthentication return, duplicate-submit guards, keyboard-only registration, plus RTL conversation-filter tab navigation | Auth expiry, critical mutation duplicate-submit protection, public discovery/catalogue and artist-profile recovery, artist workspace artwork-statistics recovery, buyer/artist inbox recovery, selected conversation history recovery and older-message retry without duplicate records or loss of scroll context, attachment upload retry without duplicate message creation, incremental synchronization using after_id/updated_after, read-receipt updates across cached all/unread inbox filters, and conversation-detail cache reconciliation that prevents read conversations from reappearing in unread results are covered; other authenticated page-level loading states and focus management for any future mounted modal remain gaps. Browser journeys use DOMContentLoaded or document-commit navigation plus explicit page-level readiness assertions so delayed nonessential resources do not block navigation setup |
| Performance | No dedicated repeatable performance budget suite was identified | Not yet covered as a governed quality gate |


## Frontend route and shared-component coverage map

The route inventory below is derived from the current React Router tree in `resources/js/app/AppRouter.jsx` and the public exports in `resources/js/components/ui/index.js`. Test filenames indicate the existing evidence layer; they do not imply every state or branch on a route is fully covered.

| React route / family | Screen or boundary | Existing test evidence | Remaining risk / exclusion |
|---|---|---|---|
| `/?design-system` (development only) | Legacy component/design-foundation preview selected by the Vite development entrypoint | `designSystem.test.js`, `designSystemCoverage.test.js` source audits | Not a production React Router route; no dedicated browser interaction suite for the preview |
| `/` | Public home and discovery entry | `test_public_discovery_and_messaging_entry_points.py`, `test_responsive_rtl_workspaces.py`, cross-role journeys | No dedicated home-page loading/error state matrix |
| `/artworks` | Artwork catalogue, search and filters | `test_artwork_catalogue_resilience.py`, `test_accessibility_smoke.py`, responsive RTL smoke; image success/error/missing-source behavior | Catalogue pagination and every filter combination are not exhaustively covered |
| `/artworks/:slug` | Public artwork detail | `test_public_discovery_and_messaging_entry_points.py`, full-stack artwork journeys | No standalone route-level accessibility and async-state matrix |
| `/artists` | Artist directory and search | `test_artist_directory_resilience.py`, responsive RTL smoke | Loading and pagination transitions need broader dedicated assertions |
| `/artists/:slug` | Public artist profile | `test_public_discovery_and_messaging_entry_points.py` | No dedicated responsive and accessibility matrix for profile content |
| `/collections`, `/collections/:slug` | Public editorial collections | `test_editorial_collections.py` | Empty/error states and direct deep-link coverage should be checked as the pages evolve |
| `/about`, `/help`, `/contact` | Public information pages | Route implementation is present in `PublicInfoPages.jsx` | No dedicated route-specific browser coverage identified in this inventory |
| `/login`, `/register` | Authentication forms | `test_accessibility_smoke.py`, `test_full_stack_auth.py`; keyboard-only registration and duplicate-submit coverage | Broader field-by-field validation announcements and login failure focus handling |
| `/unauthorized` | Public unauthorized screen | Route is present in `AppRouter.jsx` | No dedicated browser assertion identified |
| `/dashboard` | Role-aware dashboard redirect | `test_auth_session_resilience.py`, cross-role journeys | Redirect destinations should remain synchronized with role routing |
| `/dashboard/artist` | Artist workspace overview | `test_artist_workspace_resilience.py`, responsive RTL and full-stack artist journeys | Other overview query failure combinations remain |
| `/dashboard/artist/profile`, `/dashboard/artist/artworks` | Artist profile and artwork management | `test_artist_onboarding_and_artwork_feedback.py`, `test_full_stack_artist_artwork.py` | Broader validation, upload and responsive state combinations |
| `/dashboard/artist/messages`, `/dashboard/buyer/messages` | Shared messaging center under role-specific shells | Messaging inbox/history/older-history/attachment/query-cache suites and cross-role journeys | More keyboard/focus coverage for future mounted dialogs and uncommon recovery states |
| `/dashboard/buyer` | Buyer workspace | Cross-role journeys, auth-session resilience and responsive RTL smoke | Additional page-level async states |
| `/admin`, `/admin/users`, `/admin/artworks`, `/admin/message-reports` | Admin workspaces and moderation | `test_full_stack_admin_moderation.py`, cross-role journeys and selected responsive smoke | Per-page async, filter and keyboard coverage is not exhaustive |
| `/admin/editorial` | Editorial management | `test_editorial_collections.py` | Broader validation, publication and reorder failure states |
| `*` | Not-found route and nested workspace fallbacks | Route fallback implementation in `RoutingPages.jsx` | No dedicated browser test for every not-found/fallback boundary |

### Shared RAD component contract coverage

The public export inventory below is checked against `resources/js/components/ui/index.js`. Evidence is deliberately classified by what each test actually proves:

- **Direct SSR contract** means `tests/js/reactComponents.test.js` renders the component (or a composed primitive set) and asserts its static markup. It does not prove browser interaction, focus behavior or visual layout.
- **Source/architecture only** means a source audit protects design-token, class, export or usage conventions; it is not component behavior coverage.
- **Deferred** means no component-specific assertion was identified in this inventory. This is an explicit risk-based exclusion, not a claim that the component is defective.

| Exported component(s) | Existing evidence | Status / boundary |
|---|---|---|
| `Button` | `reactComponents.test.js`: disabled/loading/busy semantics, submit type and variant | Direct SSR contract; keyboard activation and rendered focus remain browser concerns |
| `IconButton` | `reactComponents.test.js`: accessible label and title | Direct SSR contract; activation/focus not established |
| `Badge` | `reactComponents.test.js`: status variant presentation | Direct SSR contract |
| `FormField` | `reactComponents.test.js`: explicit and generated label/control IDs, hint/error descriptions and alert role | Direct SSR contract; actual validation/focus announcement remains open |
| `TextInput` | `reactComponents.test.js`: native email, direction and required attributes; composed with `FormField` | Direct SSR contract; browser input behavior is not established |
| `TextareaField` | `reactComponents.test.js`: rows/maxLength and generated `FormField` association | Direct SSR contract |
| `SelectField` | `reactComponents.test.js`: accessible name and option markup | Direct SSR contract; selection interaction is not established |
| `SearchField` | `reactComponents.test.js`: search landmark, search input, label and submit control | Direct SSR contract; browser submission is covered only in route-level journeys, not this component test |
| `PageContainer` | `reactComponents.test.js`: semantic element and reading-width contract; `designSystem.test.js`: shared utility/source invariant | Direct SSR contract plus source/architecture evidence |
| `PageHeader` | `reactComponents.test.js`: requested heading level and supporting content; `designSystem.test.js`: shared layout invariant | Direct SSR contract plus source/architecture evidence |
| `SectionHeader` | `reactComponents.test.js`: requested heading level and ID; `designSystem.test.js`: shared layout invariant | Direct SSR contract plus source/architecture evidence |
| `Surface` | `reactComponents.test.js`: semantic element and interactive variant focus utility; `designSystem.test.js`: shared layout invariant | Direct SSR contract plus source/architecture evidence; actual focus rendering remains open |
| `StatusBadge` | `reactComponents.test.js`: mapped and unknown status presentation; `designSystem.test.js`: shared layout invariant | Direct SSR contract plus source/architecture evidence |
| `WorkspaceHero` | `reactComponents.test.js`: RTL header and primary heading | Direct SSR contract |
| `DashboardMetricCard` | `reactComponents.test.js`: destination renders as a link with metric content | Direct SSR contract; navigation destination behavior belongs to browser coverage |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `reactComponents.test.js`: composed tablist, tab, selected state, linked panel and RTL markup; messaging browser journey checks RTL arrow-key direction and boundaries | Direct composed SSR contract plus selected browser keyboard evidence; not a full standalone Radix interaction suite |
| `Breadcrumbs` | `reactComponents.test.js`: navigation label, current-page semantics and linked ancestors | Direct SSR contract; its SSR router link is a narrow anchor test double, while real routing is covered by browser journeys |
| `Pagination` | `reactComponents.test.js`: active page and disabled previous/next boundaries | Direct SSR contract; page-change interaction is not established by this assertion |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator` | No component-specific render or browser assertion identified; `designSystem.test.js` checks navigation source styling conventions | Source/architecture only; menu open/close, keyboard navigation and focus behavior explicitly deferred |
| `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogTitle`, `DialogDescription` | No live component interaction assertion identified; `designSystem.test.js` checks dialog source styling conventions | Source/architecture only; open/close, Escape, focus containment/restoration and accessible naming in a mounted dialog explicitly deferred |
| `Skeleton` | No component-specific rendered assertion identified; shared skeleton source is included in design-system audits | Source/architecture only; standalone rendered contract deferred |
| `SkeletonLines` | `reactComponents.test.js`: one loading announcement, decorative children hidden from AT, reduced-motion utility | Direct SSR contract; actual announcement/animation behavior requires browser/AT review |
| `MediaImage` | `reactComponents.test.js`: loading skeleton, lazy/eager priority, missing-source fallback and custom fallback; `test_artwork_catalogue_resilience.py`: loaded, failed, missing and changed image sources | Direct SSR plus browser behavior evidence |
| `EmptyState` | `reactComponents.test.js`: RTL section, heading and description | Direct SSR contract |
| `ErrorState` | `reactComponents.test.js`: alert role, error content and retry affordance | Direct SSR contract; retry execution is covered in selected route journeys, not by this static assertion |
| `SuccessState`, `PermissionState` | `reactComponents.test.js`: status role and content for both outcomes | Direct SSR contract |
| `UploadFeedback` | `reactComponents.test.js`: progressbar semantics and lower/upper clamping | Direct SSR contract; live progress updates are not established here |
| `Toast` | `reactComponents.test.js`: polite status and assertive error live-region markup | Direct SSR contract; announcement timing/behavior in assistive technology deferred |
| `ArtworkCard`, `ArtistCard` | `designSystem.test.js`: semantic surface/aspect-ratio utility and no legacy classes/raw component colors; catalogue/directory browser suites exercise their surrounding screens | Source/architecture only for the card exports; no isolated card render/interaction contract identified |
| `ArtworkCardSkeleton`, `ArtistCardSkeleton` | `designSystem.test.js`: route fallback references and skeleton structure/source invariants | Source/architecture only; isolated rendered geometry and loading semantics deferred |
| `ArtworkDetailSkeleton`, `ArtistProfileSkeleton`, `FormFieldSkeleton` | Shared skeleton source is included in design-system audits; no component-specific rendered assertion identified | Source/architecture only; isolated contract deferred |
| `ArtworkStudioListSkeleton`, `ConversationInboxSkeleton`, `MessageHistorySkeleton` | `reactComponents.test.js`: studio card frame/padding, inbox list semantics/row geometry and message skeleton composition; `designSystem.test.js`: route consumer contracts | Direct SSR contracts for key loaded-screen geometry and loading semantics; browser scroll/viewport behavior remains deferred |
| `AdminRecordListSkeleton` | `designSystem.test.js`: exported source and utility conventions | Source/architecture only; no isolated rendered contract identified |
| `DashboardMetricSkeleton`, `ArtistRecentWorkSkeleton`, `AdminDashboardSkeleton`, `ArtistWorkspaceOverviewSkeleton`, `BuyerDashboardSkeleton` | `reactComponents.test.js`: workspace overview hierarchy, semantic list structure and single loading announcement; `designSystem.test.js`: route fallback consumers | Direct SSR contracts for workspace page structure and loading semantics; responsive visual fidelity remains deferred |
| `ArtworkModerationSkeleton` | `designSystem.test.js`: selected export/consumer and utility invariants | Source/architecture only; per-card browser/visual fidelity remains deferred |
| `WorkspaceIdentitySkeleton`, `MessageReportsSkeleton`, `CollectionCardSkeleton` | `reactComponents.test.js`: identity composition and collection/report loading announcements | Direct SSR contract for composition/loading semantics; route-level visual review remains deferred |
| `AdminUserCardsSkeleton` | `designSystem.test.js`: selected export/consumer and skeleton utility invariants | Source/architecture only; isolated rendered contract deferred |
| `AdminEditorialSkeleton`, `CollectionDetailSkeleton`, `NotificationListSkeleton`, `HomePageSkeleton` | `designSystem.test.js`: selected export/source and shared skeleton utility invariants | Source/architecture only; isolated rendered contract deferred |

The inventory is intentionally risk-weighted: deferred low-risk exports do not automatically require new tests in this change. When a deferred component becomes part of a critical journey or gains meaningful interaction/state, add focused rendered/browser evidence and update this table. Keep the public export list and this inventory synchronized.

Source-level checks in `designSystem.test.js`, `designSystemCoverage.test.js` and `frontendMutationArchitecture.test.js` protect architecture and design-system invariants. They are not substitutes for user-visible tests. Avoid using source-string assertions to claim a rendered interaction works.

### Accessibility and responsive evidence boundaries

- `test_accessibility_smoke.py` checks selected route document language/direction, landmarks, visible control names and image alt declarations; it is a focused smoke check, not a complete WCAG audit.
- `test_responsive_rtl_workspaces.py` checks horizontal overflow at 320, 375, 768, 1024 and 1440 CSS pixels on selected public and authenticated routes. It does not establish visual fidelity at every breakpoint.
- Messaging browser tests exercise RTL tab-key direction and keyboard boundaries. Registration browser tests exercise keyboard-only completion and visible focus.
- A representative mixed Persian/Latin artwork title and artist name are exercised at 320px; broader mixed-script fixtures across email, URL, long numeric and messaging content remain open. Automated axe-core/Playwright scanning, manual screen-reader review and route-wide dialog focus checks also remain open work. Automated scanning, when added, must remain supplemental to manual review.

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
- Private media: wrong conversation/message/attachment combinations, missing files, private cache headers, unsupported preview types, upload size/MIME/content mismatch and attachment count. Image preview participant isolation and missing-storage denial now have feature coverage; upload interruption/retry preserves the same message identity in a browser journey.
- Artwork lifecycle: only pending work can be moderated; artist resubmission clears review metadata; review feedback is visible only to the owner; public artist profiles expose approved work only across all review states. Stale concurrent decisions cannot overwrite each other.
- Messaging: client message IDs are scoped to sender and conversation; changed-payload retries return the original message; deleted-message retries preserve tombstones and do not re-notify; direct conversation/artwork-context retries remain deduplicated. True concurrent duplicate requests and database/queue failure recovery remain follow-up work.
- Notifications: account isolation, preference enforcement, muted-recipient suppression, message retry does not duplicate notifications and private message bodies are not exposed. Queue worker retry/failure recovery and dead-letter observability remain follow-up work.
- Transaction boundaries: storage/database rollback and cleanup failure behavior.

### P1 — Product UX, accessibility and RTL

- Artist-directory browser coverage verifies API failure with explicit retry into an empty result, a stable empty state and Enter-key search with URL query persistence. Public artist-profile coverage verifies an initial profile API failure can be retried into the artist profile and approved portfolio. Artwork-catalogue browser coverage verifies list API failure can recover into results and that filter-metadata failure does not block artwork discovery. Authenticated browser coverage verifies a 401-triggered session expiry redirects to login and successful reauthentication returns to the requested buyer workspace.
- Artwork social-interaction Playwright coverage (`test_artwork_social_interactions.py`) verifies guest read-only access and clipboard sharing, buyer comment creation, reply parent targeting and post-refetch rendering, draft retention/retry after a failed reply, and like/unlike state/count refresh at a mobile viewport. Each suite replaces the real Blade auth-bootstrap payload before React loads, intercepts feature API calls, and avoids mutating development records.
- Social-notification Playwright coverage (`test_social_notifications.py`) verifies reply-notification content, mark-read behavior, canonical artwork/comment deep-link navigation, per-category reply preference updates without changing the existing message preference, and the messaging navigation label remains «پیام‌ها». Notification, preference and conversation endpoints used by the journey are intercepted; the deep-link destination is only visited read-only. The `workspaceNavigation.test.js` regression test covers buyer and artist route labels.
- Artist-follow Playwright coverage (`test_artist_follow.py`) verifies guest sign-in entry, buyer follow/unfollow mutations, refreshed follower count and `aria-pressed` state, and suppression of the follow action/count on an artist's own profile. All API responses are intercepted; no development records are mutated.
- Registration browser coverage verifies rapid duplicate activation sends only one registration request; the form now guards the submit handler synchronously with an in-flight ref, closing the gap before React can render the disabled state. Duplicate-submit protection is covered for artwork publishing, profile saves and messaging; preserve these same-tick regression cases when changing mutation handlers.
- Exercise loading, validation, disabled/submitting states and expired-session recovery on additional critical React pages.
- Messaging contextual popovers must be single-open, keyboard reachable, focus the first available action on open, close on outside pointer/tap and Escape, and restore focus to the trigger on Escape; emoji pickers stay horizontal and message actions vertical. Shared RAD modal dialogs dismiss on outside interaction and Escape while preserving focus containment/restoration.
- Messaging inbox filter layout must fill its bordered parent edge-to-edge with equal-width options, no inset gutter or inter-option gap, 44px minimum targets and visible in-group keyboard focus; preserve the existing RTL tablist arrow-key, Home/End and roving-tabindex coverage.
- Authentication browser coverage now walks the registration form using Tab, selects a role with the keyboard, completes fields, asserts a visible focus outline and submits with Enter. Messaging browser coverage now verifies the conversation-filter tablist's RTL arrow-key direction, Home/End boundaries, selected state and roving tabindex. The shared Dialog primitive delegates modal focus containment, Escape handling and focus restoration to Radix UI; the current admin confirmation prompts are inline rather than modal. Extend keyboard-only coverage to other critical journeys and add browser checks when a modal is introduced into a real route.
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
