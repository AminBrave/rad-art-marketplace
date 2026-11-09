# RAD Art Roadmap

This file is the concise project delivery map. The [GitHub tracker](https://github.com/AminBrave/rad-art-marketplace/issues/30) owns issue-level acceptance criteria and delivery sequencing. A checked item means implemented in the repository; it does not mean production deployment or manual QA is complete.

## Product direction

- **Product:** Premium, discovery-first contemporary art platform connecting art enthusiasts and collectors with artists and their work.
- **Positioning:** Curated, editorial, trustworthy and artwork-led; direct artist inquiry rather than checkout-led commerce.
- **Editorial model:** Collections and featured-artist selections are curated editorial content, not paid placements or advertising.
- **Visual direction:** Contemporary Art Editorial.
- **Language and layout:** Persian-first, RTL by default; English-ready architecture, but no English UI launch commitment.
- **Architecture:** Laravel 13 monolith + React 18/Vite + centralized React Router.
- **Backend authority:** Laravel controls authentication, authorization, validation, ownership, and moderation.
- **Scope exclusions:** Payments, cart/checkout, orders, shipping, native mobile apps, native mobile apps, AI recommendations, social networking, subscriptions, paid placements, and advertising.

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

## Next roadmap — Premium Art Discovery (approved)

This roadmap extends the existing MVP 2 baseline. The historical MVP 2 stages and their recorded status above remain unchanged. The next delivery sequence is fixed as seven milestones; do not reorder or silently remove phases. The planning estimates remain the estimates approved in the product strategy. AI-assisted execution may parallelize independent issue work but does not waive dependencies or acceptance gates.

**North-star outcome:** qualified artwork-to-artist connections per month, supported by high-quality discovery, trustworthy artist profiles, editorial curation and a clear inquiry path.

### M00 — Stabilize the foundation · 1–2 weeks

**Milestone issue:** [#60](https://github.com/AminBrave/rad-art-marketplace/issues/60)  
**Execution issues:** [#66](https://github.com/AminBrave/rad-art-marketplace/issues/66), [#67](https://github.com/AminBrave/rad-art-marketplace/issues/67), [#68](https://github.com/AminBrave/rad-art-marketplace/issues/68), plus existing QA issues [#26–#29](https://github.com/AminBrave/rad-art-marketplace/issues/26).

- [ ] Fix buyer inquiry detail routing and add browser regression tests.
- [ ] Commit dependency lockfiles and make CI deterministic.
- [ ] Correct paginated artwork counts and null/zero price semantics.
- [ ] Verify role journeys, RTL/accessibility and performance baselines.
- [ ] Preserve security, upload, moderation and inquiry privacy boundaries.

**Exit:** critical journeys pass; reproducible CI; evidence recorded; existing release QA debt is resolved or explicitly carried with owner/risk.

### M01 — Build the premium design system · 2 weeks

**Milestone issue:** [#61](https://github.com/AminBrave/rad-art-marketplace/issues/61)  
**Execution issue:** [#69](https://github.com/AminBrave/rad-art-marketplace/issues/69)

- [ ] Consolidate semantic design tokens and shared components.
- [ ] Standardize typography, spacing, artwork cards, forms, dialogs and navigation.
- [ ] Define responsive editorial grids and image ratios.
- [ ] Standardize loading, empty, error, success and disabled states.
- [ ] Verify Persian RTL, Latin LTR, keyboard access, focus, contrast and reduced motion.

**Exit:** shared patterns are implemented and documented; high-traffic pages have a coherent premium visual language.

### M02 — Transform discovery and artwork pages · 2–3 weeks

**Milestone issue:** [#62](https://github.com/AminBrave/rad-art-marketplace/issues/62)  
**Execution issues:** [#70](https://github.com/AminBrave/rad-art-marketplace/issues/70), [#71](https://github.com/AminBrave/rad-art-marketplace/issues/71)

- [ ] Editorial homepage with curated works, artist spotlights and themes.
- [ ] Catalogue filters/sorting for useful artistic attributes and availability.
- [ ] Shareable URL-backed discovery state.
- [ ] Artwork detail pages with high-quality imagery, metadata, context and contact.
- [ ] Artist profiles as credible professional portfolios.
- [ ] Responsive image delivery and accessible content.

**Exit:** discovery → artwork → artist → inquiry works end-to-end on mobile and desktop, with public-only data rules intact.

### M03 — Introduce curation and editorial tools · 2 weeks

**Milestone issue:** [#63](https://github.com/AminBrave/rad-art-marketplace/issues/63)  
**Execution issue:** [#72](https://github.com/AminBrave/rad-art-marketplace/issues/72)

- [ ] Collections with stable slugs and ordered artwork membership.
- [ ] Editorial featured-artist selections.
- [ ] Focused admin curation and publication workflow.
- [ ] Public collection listing/detail pages.
- [ ] Published-only visibility and approved-artwork constraints.

**Exit:** editors can curate and publish coherent collections without code changes; authorization, ordering and publication tests pass.

### M04 — Elevate the artist experience · 2 weeks

**Milestone issue:** [#64](https://github.com/AminBrave/rad-art-marketplace/issues/64)  
**Execution issue:** [#73](https://github.com/AminBrave/rad-art-marketplace/issues/73)

- [ ] Guided profile completion and artist onboarding.
- [ ] Professional portfolio preview.
- [ ] Clear artwork submission, upload and moderation guidance.
- [ ] Improved inquiry inbox and actionable empty states.
- [ ] Real, useful activity summaries only.

**Exit:** an artist can complete a credible profile, submit work and understand inquiry/moderation states without compromising ownership or privacy.

### M05 — Build secure in-app messaging and conversations · 3–4 weeks

**Milestone issue:** [#77](https://github.com/AminBrave/rad-art-marketplace/issues/77)  
**Execution issues:** [#78](https://github.com/AminBrave/rad-art-marketplace/issues/78)–[#84](https://github.com/AminBrave/rad-art-marketplace/issues/84)

- [ ] One-to-one buyer/artist conversations linked to inquiry and optional artwork context.
- [ ] Inbox with unread counts, search, filters, archive/mute and paginated history.
- [ ] Reply to a message with quoted context; edit/delete own messages with clear audit/retention semantics.
- [ ] Emoji reactions and sent/delivered/read states.
- [ ] Real-time message delivery, typing indicator and privacy-controlled presence, with reconnect/retry and polling fallback.
- [ ] Secure private image/document attachments with validation, previews and authorized downloads.
- [ ] In-app and optional email notifications with preferences, queues and reliable deep links.
- [ ] Report/block, rate limits, spam controls and admin moderation workflow.
- [ ] Participant-only authorization and IDOR/privacy regression tests for every message/attachment operation.

**Exit:** buyer and artist can conduct a secure, reliable, accessible conversation across refresh/reconnect; all security, notification, attachment, RTL and moderation checks have evidence. Do not claim end-to-end encryption without a separately reviewed design.

### M06 — Complete launch readiness and growth foundations · 2–3 weeks

**Milestone issue:** [#65](https://github.com/AminBrave/rad-art-marketplace/issues/65)  
**Execution issues:** [#74](https://github.com/AminBrave/rad-art-marketplace/issues/74), [#75](https://github.com/AminBrave/rad-art-marketplace/issues/75), plus QA gates #26–#29.

- [ ] SEO metadata, canonical URLs, sitemap and social previews.
- [ ] Structured logs, error tracking and uptime monitoring.
- [ ] Performance evidence and Core Web Vitals baselines.
- [ ] Backup, restore, rollback and production-host verification.
- [ ] Privacy, retention, artist content rights and moderation policy review.
- [ ] Consent/legal/data-minimization gate before analytics collection.
- [ ] Artist acquisition and editorial launch plan.

**Exit:** production readiness is supported by real evidence and product-owner sign-off, not by a successful build alone.

### Product metrics

North star: qualified artwork-to-artist connections per month. Supporting measures: artwork detail engagement, artist profile visit rate, inquiry conversion, artist activation, first artwork approval time, collection engagement, search zero-result rate and mobile engagement. Analytics collection remains disabled until its privacy/legal approval gate is satisfied.

### Explicitly deferred

Checkout, payments, orders, shipping, group chat, public social feeds, AI recommendations, subscriptions, paid placements, and generic CMS infrastructure remain deferred. Private one-to-one buyer/artist messaging and its optional email notifications are now in scope. Do not add them as incidental work.

### Completion and reporting rules

- A milestone issue closes only when its child issues are complete, acceptance evidence is linked, relevant docs are synchronized and the product owner accepts any explicit deferral.
- A task is not complete because an agent generated code, a route exists, a PR merged or CI passed alone.
- Keep all unverified manual/device/production checks unchecked.
- Update this roadmap, README and issue #30 whenever delivery status changes.

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
