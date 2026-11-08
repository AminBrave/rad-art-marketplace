# MVP 2 Release Checklist

Use this checklist for a release candidate. A checked item requires evidence for that release; documentation, a merged PR, or CI alone is not evidence of production readiness. Assign an owner and record commit IDs, workflow links, test results, and hosting evidence.

## Scope and delivery

- [ ] MVP 2 Stages 1–5 are complete and their GitHub issues are closed against accepted behavior.
- [ ] Stage 6 QA issues are complete or explicitly accepted as documented residual risk by the product owner.
- [ ] README, roadmap, API reference, route map, changelog, and manual test guidance match the release.
- [ ] No deferred or unsupported feature is promised in UI copy or documentation.

## Build and code quality

- [ ] Confirm target runtime supports PHP 8.3+ and required extensions.
- [ ] Review pending migrations, schema impact, and rollback/forward-fix plan.
- [ ] Run `composer test`.
- [ ] Run `composer lint`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Review dependency advisories and lockfile changes.
- [ ] Record release commit SHA and CI result.

## Environment and operations

- [ ] Confirm production MySQL, HTTPS, document root, private storage, and file permissions.
- [ ] Confirm `APP_ENV=production`, `APP_DEBUG=false`, and secure secret handling.
- [ ] Confirm pre-release database and private-upload backups exist and are readable.
- [ ] Complete a restore drill or verify a recent successful restore.
- [ ] Confirm rollback owner and recovery procedure.
- [ ] Run the [cPanel deployment and smoke-test procedure](cpanel-deployment.md) if cPanel remains the selected host.

## Public marketplace

- [ ] Verify homepage, artwork catalogue, search, category filters, and pagination.
- [ ] Verify artwork detail, public artist directory, artist profiles, and approved-only portfolios.
- [ ] Verify About, Help, and Contact pages and all public navigation/footer links.
- [ ] Verify private profiles, unapproved artwork, and private image files remain inaccessible publicly.

## Authentication and workspaces

- [ ] Verify Buyer/Artist registration, login, logout, session restoration, and Admin provisioning.
- [ ] Verify server-side role and ownership boundaries.
- [ ] Verify artist profile, artwork submission/edit, upload, moderation feedback, and inquiry inbox workflows.
- [ ] Verify buyer sent-inquiry history/detail and privacy.
- [ ] Verify admin overview, moderation, and user management.
- [ ] Verify inquiry payloads omit both parties' email addresses; do not imply chat, replies, or email delivery.

## UX, accessibility, privacy, and legal

- [ ] Verify Persian-first copy, RTL, mixed-direction fields, dates, and number formatting.
- [ ] Verify keyboard access, focus visibility, contrast, labels, responsive breakpoints, and reduced motion.
- [ ] Review privacy notice, retention/deletion policy, and site contact details.
- [ ] Obtain site-owner and qualified local-counsel review of legal text.
- [ ] Review legal basis/consent before enabling any analytics provider; analytics collection is currently disabled.

## Known limitations and product decisions

These capabilities are not part of the approved MVP 2 scope unless the product owner revises it: payments, cart/checkout, orders, shipping, real-time chat/replies, email delivery, native mobile apps, AI recommendations, social networking, subscriptions, advertising, admin category CRUD, buyer reports/abuse queue, and featured placements.

Email verification and password-reset UX are not implemented. Analytics is a proposal only. Hosting PHP 8.3+ compatibility, production deployment, backup automation, restore success, and browser/device QA remain unverified until evidence is attached.

## After release

- [ ] Run smoke tests with non-production test accounts.
- [ ] Review Laravel logs, browser console, and critical route failures.
- [ ] Verify private files are not web-accessible.
- [ ] Monitor moderation backlog and abuse/rate-limit signals.
- [ ] Keep previous release and backups until sign-off.
