# MVP 2 Release Checklist

Use this checklist for a release candidate. A checked item requires evidence for that release; documentation, a merged PR, or CI alone is not evidence of production readiness. Assign an owner and record commit IDs, workflow links, test results, and hosting evidence.

## Scope and delivery

- [x] MVP 2 feature stages 1–5 are integrated; Stage 6 source-level QA and automated checks are recorded separately.
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

## Performance and Lighthouse evidence

- [ ] Run Lighthouse mobile and desktop against the production-like release candidate for homepage, catalogue, artwork detail, artist profile, and authenticated role workspaces.
- [ ] Attach Lighthouse reports and record Chrome/Lighthouse version, host, build SHA, test location, network/CPU throttling, and run count.
- [ ] Record median LCP, CLS, INP, TTFB, transfer size, request count, and initial/route chunk sizes across repeat runs.
- [ ] Fix every actionable performance audit or document a justified exception with evidence and owner.
- [ ] Confirm no avoidable layout shifts occur during initial boot, route transitions, image loading, font loading, pagination, and workspace data loading.
- [ ] Review backend query counts and database query plans using production-like data; document any justified indexes or query changes.

## UX, accessibility, privacy, and legal

- [ ] Verify Persian-first copy, RTL, mixed-direction fields, dates, and number formatting.
- [ ] Verify keyboard access, focus visibility, contrast, labels, responsive breakpoints, and reduced motion.
- [ ] Review privacy notice, retention/deletion policy, and site contact details.
- [ ] Obtain site-owner and qualified local-counsel review of legal text.
- [ ] Review legal basis/consent before enabling any analytics provider; analytics collection is currently disabled.

## Stage 6 evidence boundary

The Stage 6 PR records source-level localization/RTL review, image-loading corrections, and automated CI. It does not certify real-browser/device accessibility, visual contrast across all rendered states, performance metrics, production-host compatibility, backup automation, or a successful restore. Those require access to the target environment and must remain unchecked until evidence is attached.

## Known limitations and product decisions

These capabilities are not part of the approved MVP 2 scope unless the product owner revises it: payments, cart/checkout, orders, shipping, real-time chat/replies, email delivery, native mobile apps, AI recommendations, social networking, subscriptions, advertising, admin category CRUD, buyer reports/abuse queue, and featured placements.

Email verification and password-reset UX are not implemented. Analytics is a proposal only. Hosting PHP 8.3+ compatibility, production deployment, backup automation, restore success, and browser/device QA remain unverified until evidence is attached.

## After release

- [ ] Run smoke tests with non-production test accounts.
- [ ] Review Laravel logs, browser console, and critical route failures.
- [ ] Verify private files are not web-accessible.
- [ ] Monitor moderation backlog and abuse/rate-limit signals.
- [ ] Keep previous release and backups until sign-off.
