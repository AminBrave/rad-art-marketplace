# MVP 2 Roadmap

This file is the concise project delivery map. The [GitHub tracker](https://github.com/AminBrave/rad-art-marketplace/issues/30) owns issue-level acceptance criteria and delivery sequencing. A checked item means implemented in the repository; it does not mean production deployment or manual QA is complete.

## Product direction

- **Product:** Persian-first art discovery and artist-contact marketplace.
- **Visual direction:** Contemporary Art Editorial.
- **Language and layout:** Persian-first, RTL by default; English-ready architecture, but no English UI launch commitment.
- **Architecture:** Laravel 13 monolith + React 18/Vite + centralized React Router.
- **Backend authority:** Laravel controls authentication, authorization, validation, ownership, and moderation.
- **Scope exclusions:** Payments, cart/checkout, orders, shipping, group chat, public social networking, native mobile apps, AI recommendations, subscriptions, and advertising. Private one-to-one messaging is an approved M05 capability.

## Delivery status

### Stage 1 — Foundation and audit · Complete

**Issues #6–#13 · Integrated into `main`**

- [x] Reconcile the MVP 1 baseline and make `main` the active integration branch.
- [x] Establish Contemporary Art Editorial design foundations and Persian/RTL defaults.
- [x] Centralize React Router and role-aware route layouts.
- [x] Build shared UI controls, cards, navigation, dialogs, and feedback states.
- [x] Audit public artist directory, catalogue, image delivery, and workspace summary APIs.
- [x] Document the minimal API extension required for public artist discovery.
- [x] Preserve backend authorization and private image delivery.

### Stage 2 — Public marketplace · Complete

**Issues #14–#18 · PR [#42](https://github.com/AminBrave/rad-art-marketplace/pull/42) merged to `main`**

- [x] Editorial homepage with real public artwork, categories, and artists.
- [x] Public artwork gallery with search, active-category filtering, URL state, and pagination.
- [x] Artwork detail pages with artist context and buyer inquiry entry point.
- [x] Public artist directory and artist profiles with approved-only portfolios.
- [x] Persian About, Help, and Contact pages.
- [x] Public navigation/footer and route integration.

### Stage 3 — Artist workspace · Complete

**Issues #19–#21 · Integrated into `main`**

- [x] Artist-only workspace shell and profile-aware overview.
- [x] Honest overview values derived from artist profile, artwork, and inquiry API responses; no fabricated analytics.
- [x] Artist artwork list and create/edit forms with preview, upload progress, validation feedback, and server moderation state.
- [x] Artist inquiry inbox with paginated list, recipient-scoped detail, and read/archive controls.
- [x] Preserve server-side role checks, ownership, validation, and moderation assignment.
- [x] Keep unsupported deletion, replies, chat, and email delivery out of the UI.

### Stage 4 — Buyer workspace · Complete

**Issue #22 · Integrated into `main`**

- [x] Buyer overview with API-reported sent-inquiry total and latest request.
- [x] Paginated sender-scoped sent-inquiry history with artist/artwork context and status.
- [x] Dedicated, refresh-safe detail route for each inquiry.
- [x] Empty, loading, error, unauthorized/not-found, and pagination states.
- [x] Keep buyer status read-only; no replies, chat, or email delivery.

### Stage 5 — Admin workspace · Complete

**Issues #23–#25 · Integrated into `main`**

- [x] Admin-only workspace shell and overview using real paginator totals for pending artwork and users.
- [x] Paginated artwork moderation queue with URL-backed filters, previews, required notes, and supported decisions.
- [x] Paginated user management with supported Artist/Admin role updates and server-enforced self-demotion protection.
- [x] Loading, empty, error, and success feedback; no unsupported analytics or user actions.

### Stage 6 — QA and release · Verification in progress

**Issues #26–#29 · Open pending external verification**

- [x] Source-level review of Persian document language/direction, Vazirmatn/Inter font configuration, Persian dates/prices, and explicit LTR account fields in inspected views.
- [x] Preserve existing visible focus styling and reduced-motion behavior; record remaining real-browser accessibility checks.
- [x] Improve artwork image fallback, lazy loading/async decoding for cards, eager/high-priority loading for primary imagery, and reserved detail-image aspect ratios.
- [x] Run backend tests/style, frontend lint, and production build in GitHub Actions on the Stage 6 PR.
- [ ] Complete real-browser/device keyboard, screen-reader, responsive, contrast, and mixed-direction verification.
- [ ] Record repeatable performance metrics (LCP, CLS, transfer size, request count, route bundles) before claiming performance targets.
- [ ] Complete target-host compatibility, production configuration, backup, and successful restore verification.
- [ ] Complete manual end-to-end regression journeys and attach evidence to the release checklist.

### Performance and visual stability hardening — Implementation merged; measurement in progress

**Issue #48 · PR [#49](https://github.com/AminBrave/rad-art-marketplace/pull/49) merged to `main`**

- [x] Add a first-paint shell skeleton before React mounts and route-level placeholders for public and workspace screens.
- [x] Split feature screens into lazy-loaded route bundles while preserving public/workspace navigation shells.
- [x] Bound public artist portfolio and artist artwork list responses with 12-item simple pagination.
- [x] Backend tests/style, frontend lint, and production build passed in CI for the merged implementation.
- [ ] Review generated production bundle sizes and record them against a production-like baseline.
- [ ] Run repeatable Lighthouse mobile/desktop audits and Core Web Vitals measurements against a production-like host.
- [ ] Profile real database query plans and API request waterfalls; make further backend changes only where measurements demonstrate a bottleneck.
- [ ] Record repeatable Lighthouse mobile/desktop and Core Web Vitals measurements; do not claim a performance improvement until measured.

## MVP 1 capabilities retained

The current baseline includes session authentication, Buyer/Artist/Admin roles, artist profiles, artwork submission/editing, private image storage, approved-only public catalogue, admin artwork moderation, and buyer-to-artist inquiry intake with buyer history and artist read/archive controls.

## Operational and release status

The repository contains cPanel deployment and backup/restore procedures, an analytics proposal, manual smoke tests, QA checklists, and a release checklist. These documents are instructions/plans—not evidence that hosting is compatible, deployment is complete, analytics is collecting data, backups are automated, a restore drill succeeded, or browser/device QA has passed.

Known unverified release gates (release sign-off blockers):
- Target cPanel PHP 8.3+ and required extensions.
- Production environment, HTTPS, document-root isolation, and private-storage permissions.
- Backup automation and a successful restore drill.
- Real-browser and real-device smoke tests, accessibility, and responsive verification.

## Integration rules

- `main` is the only active integration branch.
- Create feature branches from the latest `main`; target PRs at `main`.
- `cleaned-MVP-1` is historical context only.
- Update this roadmap, README, changelog, and GitHub tracker when delivery status changes.
- Keep implementation status distinct from browser performance certification and production release sign-off.
- Do not mark a feature complete based on a placeholder, a document, or a successful build alone.


## M00 — Foundation stabilization · Implementation merged; closeout pending

**GitHub parent:** [#60](https://github.com/AminBrave/rad-art-marketplace/issues/60) · **Implementation PRs:** [#85](https://github.com/AminBrave/rad-art-marketplace/pull/85), [#87](https://github.com/AminBrave/rad-art-marketplace/pull/87), [#86](https://github.com/AminBrave/rad-art-marketplace/pull/86)

- [x] Buyer inquiry detail route registered under the buyer role guard; Laravel SPA deep-link fallback regression added.
- [x] Composer and npm lockfiles committed; CI uses deterministic composer install and npm ci.
- [x] Artist artwork totals use server paginator metadata; null and numeric-zero price presentation are distinct.
- [x] Latest main CI passed on commit 6da7d608333ba046a90cc050808854f0d2767474: [workflow run #42715135296](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42715135296). Backend tests/style and frontend unit tests/lint/build all passed.
- [ ] Browser E2E for buyer inquiry detail, direct navigation/refresh, role redirects and ownership isolation.
- [ ] Browser verification for artwork totals beyond the first page and null/zero/positive price rendering.
- [ ] Independent review evidence for the implementation/lockfile diffs.
- [ ] Complete or explicitly defer the still-open QA gates [#26–#29](https://github.com/AminBrave/rad-art-marketplace/issues/26).

**Status rule:** implementation is integrated, but M00 is not signed off. Browser/device accessibility and RTL checks, measured performance baselines, target-host verification, and backup/restore evidence remain separate release gates. See the QA checklist, release checklist, and [M00 tracker #60](https://github.com/AminBrave/rad-art-marketplace/issues/60).


## M00 browser regression evidence — 2026-11-10

- [x] PR #89 merged buyer browser regressions: history-to-detail navigation, direct deep link, refresh, back navigation with query context, guest/wrong-role redirects, not-found UI without content leakage, and 375px overflow.
- [x] PR #90 merged artwork browser regressions: artist overview shows server total 15 with 12 current-page rows; artwork detail distinguishes null/undisclosed, zero, and positive prices.
- [x] Final PR #90 CI run [#42721783132](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42721783132) passed backend tests/style, frontend unit tests/lint/build, and all 9 Chromium browser tests.
- [x] Existing backend feature tests in `tests/Feature/ArtistInquiryTest.php` verify cross-buyer detail access returns 404 and artist inquiry ownership boundaries.
- [ ] Manual multi-browser/device, assistive-technology, RTL/mixed-direction and keyboard QA remains a release gate.
- [ ] Measured Lighthouse/Core Web Vitals and before/after performance evidence remains a release gate.
- [ ] Target-host compatibility, production deployment verification, backup and successful restore drill remain release gates.

**M00 implementation and automated regression coverage are merged. M00 is not fully signed off while the manual and operational release gates remain open.**


## M02 — Transform discovery and artwork pages · Implementation merged; acceptance sign-off pending

**GitHub parent:** [#62](https://github.com/AminBrave/rad-art-marketplace/issues/62) · **Child tracks:** [#70](https://github.com/AminBrave/rad-art-marketplace/issues/70), [#71](https://github.com/AminBrave/rad-art-marketplace/issues/71) · **Merged PR:** [#92](https://github.com/AminBrave/rad-art-marketplace/pull/92) · **Main commit:** `3a634308494e4ebb8b93d3768b06f8ff581bce0a`

**Verification:** PR CI [run #42724547388](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42724547388) passed all three jobs. Post-merge main CI [run #42724722130](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42724722130) also passed backend tests/style, frontend tests/lint/build, and all 16 Chromium browser tests.

- [x] Rework the homepage around actual approved work, active category pathways, and public artist spotlights; avoid fabricated editorial claims or artist facts.
- [x] Add server-validated catalogue filters for category, medium, availability, search, and eight sort modes.
- [x] Preserve shareable search/filter/sort/pagination state in the catalogue URL.
- [x] Add bounded related public works to artwork detail pages and explicit price/availability presentation.
- [x] Improve artist portfolio hierarchy and category filtering using actual approved portfolio categories.
- [x] Enforce public artist visibility consistently for catalogue, filter metadata, artwork detail, related works, and image delivery.
- [x] Add page-specific document title/description metadata, accessible image alternatives, image failure fallback, and prioritized/lazy/async image loading.
- [x] Add Laravel feature tests for filter/sort behavior, related works, and public/private visibility boundaries.
- [x] Add Chromium browser coverage for homepage discovery, URL-backed catalogue filters, artwork detail/related works, portfolio filtering/load-more, both inquiry entry points, and overflow checks at 320/375/768/1024/1440 CSS pixels.
- [x] Synchronize API, architecture, manual smoke-test, README, roadmap, and changelog documentation.
- [ ] Complete and record human visual review at mobile/tablet/desktop sizes and cross-browser review.
- [ ] Verify image transfer optimization / server-generated responsive variants without reducing visual fidelity, or obtain explicit product-owner acceptance of preserving original files without derivatives.
- [ ] Close child issues #70 and #71 after their remaining acceptance items are verified.

**Explicitly deferred:** artist portrait/cover uploads because no corresponding data model or upload policy exists; admin-managed featured placements because no CMS/curation data exists; no fabricated biography, discipline, availability, or artwork facts. Portfolio category chips are derived only from actual approved portfolio data. No server-generated image derivatives or external image-processing service were introduced; original private files remain intact, with browser-side responsive layout, loading priority, async decoding, lazy loading, reserved aspect ratios, and failure fallbacks.

**Status rule:** implementation is merged and automated checks pass, but M02 remains open until visual QA is recorded, image-optimization scope is accepted, and child issues are closed.


## M04 — Elevate the artist experience · Implementation merged; acceptance pending

**GitHub parent:** [#64](https://github.com/AminBrave/rad-art-marketplace/issues/64) · **Child track:** [#73](https://github.com/AminBrave/rad-art-marketplace/issues/73)

- [x] Add a guided start checklist derived from five explicit profile fields and the actual server-reported artwork total; do not invent scores or analytics.
- [x] Allow artists to preview their own private profile without making it public; preserve server-side visibility rules.
- [x] Validate artwork image type, size, decodability, and 6000 × 6000 pixel bounds before upload, while retaining server validation as authoritative.
- [x] Explain pending, approved, rejected, and changes-requested moderation states and surface the moderator's actual note.
- [x] Explain inquiry new/read/archived lifecycle and make clear that status changes do not send replies or notifications.
- [x] Add backend, frontend contract, and Chromium browser regression coverage for the artist journeys.
- [x] Pass all pull-request CI jobs: 59 backend tests / 358 assertions, Laravel Pint, frontend lint/build, and 22 Chromium browser tests in [run #42787611474](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42787611474).
- [x] Merge [PR #99](https://github.com/AminBrave/rad-art-marketplace/pull/99) to main as `b9892632cf7a2773b9a6b600ff39f71cbce4f446`.
- [x] Post-merge main CI [run #42787835227](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42787835227) passed all three jobs.
- [ ] Complete product-owner visual/functional review of onboarding, private/public preview, artwork submission and moderation feedback, and inquiry lifecycle.

**Guardrails:** profile progress is a transparent checklist, not a quality rating; artwork moderation and ownership remain server-authoritative; private profile preview is available only to the owner/Admin; no replies, chat, email delivery, deletion, subscription, or speculative analytics are added. M04 implementation is integrated; the parent milestone remains open until post-merge CI and product-owner acceptance are recorded.


## M05 — Secure in-app messaging · Core direct messaging integrated; advanced capabilities pending

**GitHub parent:** [#77](https://github.com/AminBrave/rad-art-marketplace/issues/77) · **Implementation PR:** [#103](https://github.com/AminBrave/rad-art-marketplace/pull/103) · **Demo seed PR:** [#105](https://github.com/AminBrave/rad-art-marketplace/pull/105) · **Task issues:** [#78](https://github.com/AminBrave/rad-art-marketplace/issues/78)–[#84](https://github.com/AminBrave/rad-art-marketplace/issues/84)

**Integrated core (main commit `4f4f03b22333095f4a07881ca7231c262fbe97f7`):**

- [x] Canonical one-to-one buyer–artist conversation per participant pair; inquiry and artwork are context, not conversation identity.
- [x] Consolidate legacy inquiry conversations while preserving inquiry context and message history.
- [x] Participant-scoped inbox, conversation detail, paginated history, send and read-state APIs.
- [x] Buyer and artist inbox/thread screens, direct-message entry points on public artist profiles and approved artwork, and artwork context in threads.
- [x] Retry-safe client message IDs, unread counts/read receipts, and five-second polling with database persistence.
- [x] Seed 70 buyer–artist conversations and 140 messages across five demo buyers and 14 public artist profiles; seeder is idempotent.
- [x] Backend, frontend and Chromium browser CI passed on the latest main workflow [run #42816226028](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42816226028).

**Remaining M05 scope (implementation/verification in progress):**

- [x] Implement M05-T03 message replies, sender-only edit/delete, content-free deletion tombstones, emoji reactions, and delivery/read-state UX (#80) through [PR #107](https://github.com/AminBrave/rad-art-marketplace/pull/107), merged as `07a48d082b49efb53f1f38377abdd9c13a1c848b`.
- [ ] Product-owner manual retest of M05-T03 is pending; keep issue #80 open until accepted.
- [x] Implement participant-scoped inbox search, unread/archived filters, independent archive/mute settings and artwork context links (#79); final CI and manual keyboard/mobile acceptance remain pending.
- [ ] WebSocket/broadcast delivery, typing and presence remain host-gated; five-second polling is the current fallback and no real-time push is claimed (#81).
- [x] Implement private image/PDF attachments, MIME/size validation, sender-only upload, participant-authorized download, private local storage and deletion purge (#82); PR #114 final CI passed; supported-MySQL migration review and a host-level malware-scanning decision remain pending.
- [x] Implement M05-T06 recipient-only in-app notifications, read-all, per-user preferences and conversation deep links through [PR #111](https://github.com/AminBrave/rad-art-marketplace/pull/111), merged as `702e1f839d34577790e6438e999064f40f5a6a77`.
- [ ] Complete optional email delivery and verify mail configuration, persistent queue worker/retries and unsubscribe behavior on the target host (#83). Product-owner manual acceptance is also pending.
- [x] Implement participant blocking, message/conversation reports, rate-limited report endpoints, Admin review queue/actions and moderation audit records (#84); PR #114 final CI passed; independent security review and retention-owner acceptance remain pending.
- [x] Run final batch CI on PR #114: [workflow #42845563969](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42845563969) passed all three jobs (92 backend tests / 890 assertions, PHP style, frontend tests/lint/build, and 26 Chromium browser tests).
- [ ] Review migrations on the supported production MySQL version and private-file permissions/deletion, obtain independent security review, complete manual Persian RTL/accessibility checks and product-owner acceptance.

**Hosting constraint:** cPanel compatibility for persistent workers, Redis, broadcasting daemons and queued mail is unverified. Do not enable these services or claim WebSocket/email delivery until the target host is tested. No end-to-end encryption or malware-scanning claim is made. Attachments are implemented using private local storage but must not be enabled in production without a host-level malware-scanning decision.

## M06 — Launch readiness and growth foundations · In progress

**GitHub parent:** [#65](https://github.com/AminBrave/rad-art-marketplace/issues/65) · **Child tracks:** [#74](https://github.com/AminBrave/rad-art-marketplace/issues/74), [#75](https://github.com/AminBrave/rad-art-marketplace/issues/75)

- [x] Implement M06-T09 SEO/shareability: server-rendered unique metadata, canonical URLs, social previews, factual structured data, and a public-only XML sitemap through [PR #109](https://github.com/AminBrave/rad-art-marketplace/pull/109), merged as `1956800995f3a8ab52bbc2fab7adcf4b72a0d9dc`.
- [ ] Verify external social previews/crawler behavior on the deployed hostname and record product-owner review (#74).
- [ ] Complete production observability, privacy controls, monitoring, backup/restore evidence and release documentation (#75).
- [ ] Verify actual production-host configuration, HTTPS, private storage, migration/rollback and backup restoration; these cannot be inferred from repository CI.
- [ ] Record external social-preview and search-crawler behavior after deployment.

**Guardrails:** Never include private artist profiles, pending artworks, draft collections, inquiry content or personal account data in public metadata/sitemaps. Use `APP_URL` as the canonical origin; do not trust arbitrary request Host headers. No tracking pixels or unapproved analytics.

