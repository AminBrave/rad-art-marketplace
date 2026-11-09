# MVP 2 Roadmap

This file is the concise project delivery map. The [GitHub tracker](https://github.com/AminBrave/rad-art-marketplace/issues/30) owns issue-level acceptance criteria and delivery sequencing. A checked item means implemented in the repository; it does not mean production deployment or manual QA is complete.

## Product direction

- **Product:** Persian-first art discovery and artist-contact marketplace.
- **Visual direction:** Contemporary Art Editorial.
- **Language and layout:** Persian-first, RTL by default; English-ready architecture, but no English UI launch commitment.
- **Architecture:** Laravel 13 monolith + React 18/Vite + centralized React Router.
- **Backend authority:** Laravel controls authentication, authorization, validation, ownership, and moderation.
- **Scope exclusions:** Payments, cart/checkout, orders, shipping, real-time chat/replies, email delivery, native mobile apps, AI recommendations, social networking, subscriptions, and advertising.

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
