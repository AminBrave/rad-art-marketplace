# Product Roadmap

This roadmap distinguishes implemented behavior from remaining work. A checked item means the feature is represented in the current codebase; it does not imply production deployment or hosting verification.

## Phase 0 — Foundation

- [x] Define MVP scope and deferred features.
- [x] Establish repository guidance and delivery standards.
- [ ] Confirm hosting PHP version (PHP 8.3+) and required extensions.
- [x] Scaffold Laravel 13 backend and React/Vite frontend.
- [x] Add local environment, formatting, linting, and test configuration.
- [x] Add CI checks that do not require production secrets.

## Phase 1 — Identity and artist profiles

- [x] Session-based registration, login, current-user, and logout.
- [x] Roles: Guest (unauthenticated), Buyer, Artist, and Admin.
- [x] Public registration permits Buyer or Artist; defaults to Artist; Admin is server-provisioned.
- [x] Server-side role middleware and admin user-management endpoints.
- [x] Artist profile create/edit flow with owner-scoped authorization.
- [x] Public/private profile visibility and public profile page.
- [x] Administrator view/edit access for artist profiles.
- [ ] Email verification and password-reset user experience.

## Phase 2 — Artwork catalogue

- [x] Artwork/category database models and migrations.
- [x] Private image upload and policy-protected image delivery.
- [x] Artist artwork submission and editing.
- [x] Moderation states and administrator review actions.
- [x] Public catalogue, search, and active-category filtering.
- [x] Artwork detail pages.

## Phase 3 — Contact and administration

- [x] Buyer-to-artist inquiry flow with abuse controls.
- [x] Buyer sent-inquiry list and artist-owned inbox.
- [x] Inquiry read/archive status updates.
- [ ] Admin category management.
- [ ] Buyer reports and abuse-moderation queue.
- [ ] Featured artwork/artist placements.
- [ ] About, Help, Legal, and Contact pages.

## MVP 2 — Public marketplace (Stage 2)

- [x] Editorial homepage with real approved artwork/category/artist data and resilient empty/loading/error states.
- [x] Public artwork gallery with URL-persisted search, category filters, and server pagination.
- [x] Artwork detail pages with artist links, conditional metadata, and buyer inquiry entry point.
- [x] Public artist directory and profile portfolios limited to approved artwork.
- [x] About, Help, and Contact pages with accurate descriptions of implemented capabilities and no invented contact channels.

## Phase 4 — Hardening and launch

- [ ] Responsive and RTL accessibility review across real devices.
- [ ] Security review of authentication, authorization, validation, uploads, and rate limits.
- [ ] Expand automated coverage for critical flows and edge cases.
- [x] Analytics event/metric baseline documented; collection is not enabled.
- [x] Backup and restore runbook documented; no successful production restore drill is recorded.
- [x] cPanel deployment guide and smoke-test checklist documented; no target-host verification is recorded.
- [x] Release checklist and known-limitations register documented.
- [ ] Verify deployment prerequisites and execute production-like smoke tests.

## Deferred beyond MVP

Payments, cart/checkout, orders, shipping, in-app chat/replies, native mobile apps, AI recommendations, social networking, subscriptions, and advertising.

## Current integration baseline

`main` is the active integration branch. The agreed MVP 1 snapshot was `cleaned-MVP-1` at commit `bd4599401e84cacc06807dea0db878fc2a9bd22d`; it was promoted to `main` through PR #34. The baseline documentation, Contemporary Art Editorial design foundations, and centralized routing were subsequently merged through PRs #31, #35, and #36.

The current `main` includes:

- Laravel 13 / PHP 8.3+ application with a versioned health endpoint.
- React 18 + Vite Persian-first RTL application shell.
- Session authentication and Buyer/Artist/Admin role boundaries.
- Artist profiles with public/private visibility and owner/admin policies.
- Artist-owned artwork submission/editing, private image storage, approved-only public catalogue, search, category filtering, and detail pages.
- Admin artwork moderation (approve, reject, request changes) with reviewer audit metadata.
- Buyer-to-artist inquiries with buyer history, artist inbox, read/archive status, and abuse controls.
- Contemporary Art Editorial design foundations and centralized React Router with role-aware artist, buyer, and admin workspaces.
- Operational documentation for cPanel deployment, backup/restore, analytics planning, and release readiness.

Create all new feature branches from the latest `main` and target pull requests at `main`. The branch `feature/roadmap-mvp-completion` remains historical context and must not be used as a starting point.

The roadmap's unchecked items remain open. Documentation of an operational process does not mean that process has been configured or completed. In particular, hosting compatibility, production deployment, SMTP, automated backups, restore drills, and browser/device verification remain external acceptance gates.

## MVP 2 direction and delivery

MVP 2 is approved as a full frontend experience implementation with a **Contemporary Art Editorial** visual direction and a **Persian-first, RTL-by-default** interface. It covers the public marketplace, artist workspace, buyer workspace, admin workspace, centralized routing, reusable design system, responsive behavior, localization, accessibility, performance, and release QA. Small Laravel/API changes are allowed only when an audit confirms they are required.

The [MVP 2 GitHub delivery tracker](https://github.com/AminBrave/rad-art-marketplace/issues/30) is the source of truth for implementation sequencing, investigation tasks, and acceptance criteria.

MVP 2 explicitly excludes payments, cart/checkout, orders, shipping, real-time chat/replies, AI recommendations, social networking, subscriptions, and advertising. Existing Laravel authorization, validation, ownership, and privacy controls remain authoritative.
