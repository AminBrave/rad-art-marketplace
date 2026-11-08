# Rad Art Marketplace

A Persian-first, RTL-friendly marketplace MVP that helps artists present original artwork and helps visitors discover and contact artists.

## Product scope

### In scope
- Public homepage and curated/featured artwork
- Artwork catalogue with search and category filters
- Artwork detail pages
- Public artist profiles
- Artist registration, login, and dashboard
- Artwork submission with images, specifications, price, and availability
- Admin review workflow: approve, reject, or request revisions
- Buyer-to-artist contact entry point
- Admin management of users, artworks, categories, reports, and featured placements
- About, help, legal, and contact pages
- Responsive layouts, baseline security, backups, and analytics

### Explicitly out of scope for this MVP
Payments, cart/checkout, orders, shipping, in-app chat, mobile apps, AI recommendations, social graph, automated subscriptions, and advertising systems.

## Technology

- Backend: Laravel 11 (Laravel 10 compatibility may be considered where hosting requires it)
- Frontend: React + Vite
- UI: Tailwind CSS + Radix UI
- Database: MySQL
- HTTP client: Axios
- Locale: Persian-first, RTL, with Jalali date presentation where appropriate
- Hosting target: cPanel shared hosting; do not assume root access, long-running daemons, or process managers

## Roles
- **Guest:** browse published artworks and artist profiles; contact artists through the defined public contact flow.
- **Artist:** manage own profile and submitted artworks; view moderation status and feedback.
- **Admin:** manage users, categories, artworks, moderation, reports, and featured placements.

All authorization must be enforced server-side. Hiding UI controls is not authorization.

## Getting started

The application scaffold is being established. Once the Laravel and React applications are added, setup instructions will be expanded here. Expected local prerequisites:

- PHP version supported by the selected Laravel release and required PHP extensions
- Composer
- Node.js and npm
- MySQL

Never commit real credentials. Copy `.env.example` to `.env` locally and use environment-specific secrets.

## Engineering principles

1. Keep the MVP focused; do not introduce deferred commerce features.
2. Validate and authorize every write on the server.
3. Validate uploaded files by content/type, size, and safe storage location.
4. Keep private uploads outside the public web root where possible; serve approved public artwork through controlled paths.
5. Use migrations and seeders for reproducible database setup.
6. Cover authentication, role boundaries, moderation, and upload validation with tests.
7. Design for shared hosting and document deployment steps clearly.
8. Keep all user-facing layouts responsive and test RTL behavior.

## Project documentation

- [Agent guidance](AGENTS.md)
- [Skills and workflow](SKILLS.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Environment template](.env.example)

## Status

**Current phase:** project foundation and MVP planning. No production-ready application code is implied by this documentation-only baseline.
