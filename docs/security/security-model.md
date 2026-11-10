# Security Model

## Trust boundaries
Browser input is untrusted. Laravel session/auth and policies are the authorization boundary. Database records, uploads and message attachments may contain user-controlled content. Admin actions are privileged. CI secrets are separate from source.

## Assets
Credentials/sessions; private profiles; unpublished/rejected artwork; inquiry/conversation contents; attachments; moderation reports; user identity; admin privilege; backups.

## Required controls
Password hashing and session regeneration; CSRF; auth/message/inquiry/attachment rate limits; server role and ownership checks; explicit public serializers; private file storage and participant-checked downloads; file type/size validation; block/report enforcement; transactional writes and uniqueness/idempotency; least-privilege Actions permissions.

## Sensitive-change checklist
Can guests/wrong roles call endpoints? Can artists access each other's work? Can buyers enumerate others' inquiries/conversations? Can private/unapproved content leak via API/search/SEO/sitemap/editorial? Can blocked users send messages/attachments? Can reports or attachments leak? Can retries duplicate messages/conversations? Can malicious uploads exhaust storage or execute publicly? Can public registration assign admin? Do logs leak tokens/passwords/private bodies?

Use private security reporting for vulnerabilities. Do not put secrets or personal data in issues/logs/screenshots. Rotate compromised credentials, preserve evidence, patch, test and document exposure safely.

## Production showcase accounts and fictional activity

The production showcase seeder is opt-in and requires a long operator-supplied password for demo artist/buyer accounts. Never reuse a real user's password or a deployment credential. The password is shared by those demo accounts, so treat it as a production secret and rotate it if exposed. Demo accounts use reserved `.test` email addresses; do not configure outbound mail to deliver to them.

A production demo administrator is intentionally not created. The seeder attributes editorial records to an existing admin account and aborts if none exists, avoiding a publicly predictable privileged login. The enable flag only gates seeder execution; disabling it does not disable seeded accounts. Demo inquiries and conversations are fictional and must not be presented as authentic customer activity.

Before enabling the seeder, back up both the database and local storage. The seeder uses additive creation and does not delete records, but it still creates production users, messages and inquiries. Review those records and public visibility after execution.
