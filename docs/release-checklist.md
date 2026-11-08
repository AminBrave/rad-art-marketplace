# Release Checklist

Use this checklist for a candidate release. A checked item means evidence has been collected for that release; documentation alone is not evidence. Assign an owner and record links/logs for each launch-critical item.

## Build and code quality

- [ ] Confirm the target runtime supports PHP 8.3+ and required extensions.
- [ ] Review pending migrations, schema impact, and rollback/forward-fix plan.
- [ ] Run `composer test`.
- [ ] Run `composer lint`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Review dependency advisories and lockfile changes.
- [ ] Record the release commit SHA and CI result.

## Environment and operations

- [ ] Confirm production MySQL, HTTPS, document root, private storage, and file permissions.
- [ ] Confirm `APP_ENV=production`, `APP_DEBUG=false`, and secure secret handling.
- [ ] Confirm a pre-release database and private-upload backup exists and is readable.
- [ ] Complete a restore drill or verify a recent successful restore.
- [ ] Confirm the rollback owner and recovery procedure.
- [ ] Run the cPanel smoke-test checklist in the target environment.

## Implemented product flows

- [ ] Register Buyer and Artist accounts; confirm public registration cannot create Admin.
- [ ] Verify login, logout, and authenticated session behavior.
- [ ] Verify Guest/Buyer/Artist/Admin route and data boundaries.
- [ ] Verify artist profile ownership and public/private visibility.
- [ ] Verify artwork submission, validation, private storage, and owner-only editing.
- [ ] Verify moderation approve/reject/request-changes behavior and audit metadata.
- [ ] Verify only approved artwork is exposed by public catalogue/detail/image endpoints.
- [ ] Verify search and active-category filtering.
- [ ] Verify inquiry submission, rate limits, honeypot, and approved-artwork association.
- [ ] Verify buyer sent-inquiry privacy and artist inbox ownership/read/archive behavior.
- [ ] Verify inquiry payloads omit both parties' email addresses.

## Product decisions and known gaps

The following capabilities are not implemented in the current MVP baseline. Before launch, the product owner must explicitly decide whether each is a blocker or a documented deferral:

- [ ] Admin category management.
- [ ] Buyer reports and an abuse-moderation queue.
- [ ] Featured artwork/artist placements.
- [ ] About, Help, Legal, and Contact pages.
- [ ] Email verification and password-reset user experience.
- [ ] Any production mail-dependent workflow.

## UX, privacy, and legal

- [ ] Verify keyboard access, focus visibility, contrast, RTL layout, and responsive breakpoints.
- [ ] Review Persian/Latin mixed text and form validation states.
- [ ] Approve privacy notice, retention/deletion policy, and contact details.
- [ ] Review analytics legal basis/consent before enabling any analytics provider (analytics is currently not enabled).
- [ ] Obtain site-owner and qualified local-counsel review of legal text.

## After release

- [ ] Run smoke tests with non-production test accounts.
- [ ] Review Laravel logs, browser console, and critical route failures.
- [ ] Verify private files are not web-accessible.
- [ ] Monitor moderation backlog and abuse/rate-limit signals.
- [ ] Keep the previous release and backups until sign-off.

## Known limitations

- Payments, cart/checkout, orders, shipping, and payment-provider integration are intentionally deferred.
- The inquiry feature is private contact intake and status tracking, not chat, replies, or email delivery.
- Hosting PHP 8.3+ and required extensions have not been verified against the actual cPanel account.
- Email verification and password-reset UX are not implemented.
- Analytics is a proposed event/metric baseline only; no provider or tracking script is enabled.
- Backup automation depends on the selected host; this runbook is a procedure, not proof of automation or a successful restore.
- Admin category management, reports/abuse queue, featured placements, and static content pages remain open roadmap items.
- Browser/device accessibility and real cPanel deployment smoke tests require execution in the target environment.
