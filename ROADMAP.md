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

### Stage 5 — Admin workspace · Next

**Issues #23–#25 · Open**

- [ ] Admin workspace shell and honest overview metrics.
- [ ] Paginated artwork moderation queue and approve/reject/request-changes controls.
- [ ] User management using supported API actions and server restrictions.

### Stage 6 — QA and release · Planned

**Issues #26–#29 · Open**

- [ ] Persian localization and RTL quality pass.
- [ ] Responsive and accessibility verification across phone, tablet, and desktop.
- [ ] Measure and improve artwork image loading and public-page performance where evidence warrants it.
- [ ] Critical end-to-end regression coverage and release verification.
- [ ] Production-host compatibility, deployment, backup, and restore verification.

## MVP 1 capabilities retained

The current baseline includes session authentication, Buyer/Artist/Admin roles, artist profiles, artwork submission/editing, private image storage, approved-only public catalogue, admin artwork moderation, and buyer-to-artist inquiry intake with buyer history and artist read/archive controls.

## Operational and release status

The repository contains cPanel deployment and backup/restore procedures, an analytics proposal, manual smoke tests, QA checklists, and a release checklist. These documents are instructions/plans—not evidence that hosting is compatible, deployment is complete, analytics is collecting data, backups are automated, a restore drill succeeded, or browser/device QA has passed.

Known unverified release gates:
- Target cPanel PHP 8.3+ and required extensions.
- Production environment, HTTPS, document-root isolation, and private-storage permissions.
- Backup automation and a successful restore drill.
- Real-browser and real-device smoke tests, accessibility, and responsive verification.

## Integration rules

- `main` is the only active integration branch.
- Create feature branches from the latest `main`; target PRs at `main`.
- `cleaned-MVP-1` is historical context only.
- Update this roadmap, README, changelog, and GitHub tracker when delivery status changes.
- Do not mark a feature complete based on a placeholder, a document, or a successful build alone.
