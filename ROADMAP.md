# Product Roadmap

## Phase 0 — Foundation
- [x] Define MVP scope and deferred features
- [x] Establish repository guidance and delivery standards
- [ ] Confirm hosting PHP version (PHP 8.3+) and available extensions
- [x] Scaffold Laravel 13 backend and React/Vite frontend (initial scaffold)
- [x] Add initial local environment, formatting, linting, and test configuration
- [x] Add CI checks that do not assume production secrets

## Phase 1 — Identity and permissions
- [x] User registration and login
- [x] Roles: Guest, Artist, Admin (Guest is unauthenticated; new accounts default to Artist)
- [x] Server-side role middleware and admin user-management endpoints
- [x] Artist profile create/edit flow with owner-scoped authorization
- [x] Public/private profile visibility and public profile page
- [x] Administrator view/edit access for artist profiles
- [ ] Ownership policies for artist-owned artwork resources
- [x] Admin user listing and role management
- [ ] Email verification and password-reset user experience

## Phase 2 — Artwork catalogue
- [ ] Artwork/category database model and migrations
- [ ] Secure image upload and storage
- [ ] Artist artwork submission and editing
- [ ] Moderation states and admin review actions
- [ ] Public catalogue, search, and category filtering
- [ ] Artwork detail pages

## Phase 3 — Contact and administration
- [ ] Buyer-to-artist contact flow with abuse controls
- [ ] Admin category management
- [ ] Reports and moderation queue
- [ ] Featured artwork/artist placements
- [ ] About, help, legal, and contact pages

## Phase 4 — Hardening and launch
- [ ] Responsive and RTL accessibility review
- [ ] Security review: auth, authorization, validation, uploads, rate limits
- [ ] Automated test coverage for critical flows
- [ ] Analytics baseline and privacy-conscious event definitions
- [ ] Backup and restore runbook
- [ ] cPanel deployment guide and smoke-test checklist
- [ ] Release checklist and known-limitations document

## Deferred beyond MVP
Payments, cart/checkout, orders, shipping, in-app chat, native mobile apps, AI recommendations, social graph, automated subscriptions, and advertising.

## Current implementation note
Artist profiles are implemented on `feature/phase-1-identity-permissions`: one-to-one profiles, validated fields, owner/admin policies, public/private visibility, and Persian RTL create/edit UI. The Phase 0 scaffold is on `feature/phase-0-app-scaffold`. Phase 1 identity and artist-profile work is on `feature/phase-1-identity-permissions`: session-backed authentication, artist/admin roles, one-to-one artist profiles, owner/admin policies, public/private profile pages, Persian RTL profile editing, and feature tests. Local smoke testing remains required before merge. Hosting PHP 8.3+ compatibility remains unconfirmed.
