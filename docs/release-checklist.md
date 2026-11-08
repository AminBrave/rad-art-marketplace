# Release Checklist

## Before release

- [ ] Confirm hosting PHP 8.3+ and required extensions.
- [ ] Confirm production database, private storage, SMTP, HTTPS, and document root.
- [ ] Review all pending migrations and backup the database/files.
- [ ] Run `composer test`, `composer lint`, `npm run lint`, and `npm run build`.
- [ ] Review dependency advisories and lockfile changes.
- [ ] Confirm `APP_DEBUG=false`, production `APP_ENV`, and secret handling.
- [ ] Verify email verification and password-reset delivery.
- [ ] Verify role boundaries for guest, buyer, artist, and admin.
- [ ] Verify private artwork uploads and approved-only public delivery.
- [ ] Verify inquiry ownership, rate limits, and abuse-report moderation.
- [ ] Verify category and featured-placement administration.
- [ ] Verify keyboard access, focus visibility, RTL layout, and responsive breakpoints.
- [ ] Verify About, Help, Legal, and Contact content.
- [ ] Confirm privacy notice, retention, analytics consent/legal basis, and contact details.
- [ ] Complete a restore drill or verify a recent successful restore.
- [ ] Run the cPanel smoke-test checklist.
- [ ] Record release commit SHA, migration state, backup location, and rollback owner.

## After release

- [ ] Run smoke tests using non-production test accounts.
- [ ] Check Laravel logs and browser console for errors.
- [ ] Verify mail delivery and public/private image behavior.
- [ ] Monitor critical route failures and moderation backlog.
- [ ] Keep the previous release and backups until sign-off.

# Known Limitations

- Payments, cart/checkout, orders, shipping, and payment-provider integration are intentionally deferred.
- The inquiry feature is a private contact intake and status tracker, not a chat or reply system.
- Hosting PHP 8.3+ and required extensions have not been verified against the actual cPanel account.
- Production SMTP delivery and sender-domain authentication must be configured and tested by the deployment owner.
- Analytics are defined as an event/metric baseline only; no analytics provider or tracking script is enabled.
- Backup automation depends on the capabilities of the selected cPanel host; this runbook defines the required manual/host-supported process.
- Legal text, privacy/retention policy, and contact information require review and approval by the site owner and qualified local counsel before public launch.
- Browser/device accessibility and real cPanel deployment smoke tests require execution in the target environment.
