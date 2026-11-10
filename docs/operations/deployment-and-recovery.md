# Deployment, Backup and Recovery

Repository includes Laravel/Apache public entry configuration, local Caddy config and cPanel Vite build config; these do not prove live host configuration.

## Pre-deploy
- [ ] Confirm target commit/environment and secrets.
- [ ] Build assets with correct target config.
- [ ] Back up DB and uploaded files before risky migrations.
- [ ] Review migration locks, duration, indexes and data transforms.
- [ ] Confirm storage permissions and private/public disk separation.
- [ ] Deploy code/assets atomically where possible.
- [ ] Run health and public/authenticated smoke paths.
- [ ] Observe logs, HTTP errors, queues and storage.

## Recovery
Prefer forward-fix once new writes depend on schema. Restore database and files from matched recovery point only under approved incident plan. Validate integrity and critical flows. Define RPO/RTO with owners; never invent targets. Run restore drills outside production.

## Unknowns to verify
Live host, DB engine/version, queue workers, mail provider, CDN/object storage, backup schedule/retention, monitoring, error tracking, TLS termination and deployment approvals.

## Production showcase seeding (cPanel)

The normal `DatabaseSeeder` remains development-only and does not populate production. The full showcase dataset is an explicit, separate operation.

### Safety model
- The showcase seeder refuses to run outside `APP_ENV=production`.
- It also requires `RADEMAN_SHOWCASE_SEEDING_ENABLED=true` and a `RADEMAN_SHOWCASE_PASSWORD` of at least 32 characters, configured in Laravel's cached `config/showcase.php`.
- The configured password is shared by the demo artist/buyer accounts. Store it as a secret, do not paste it into shell history or commit it, and rotate it if exposed.
- It does **not** create a demo admin account. Editorial records are attributed to an existing administrator, and seeding stops if no administrator exists.
- Seeded rows use reserved `.test` email addresses and stable demo slugs. Creation is additive (`firstOrCreate`); collection memberships are attached without detaching existing items. Existing matching rows and files are not overwritten.
- Demo conversations and inquiries are fictional. Do not represent them as genuine customer activity.
- Existing demo artwork images are generated SVG placeholders, not final commissioned artwork photography.

### cPanel procedure
1. Back up the production database and the `storage/app` files. Confirm the backup can be restored.
2. In the production `.env`, temporarily set:
   ```dotenv
   RADEMAN_SHOWCASE_SEEDING_ENABLED=true
   RADEMAN_SHOWCASE_PASSWORD=<unique-random-secret-at-least-32-characters>
   ```
3. From the Laravel application root, refresh cached configuration and apply only pending migrations:
   ```bash
   php artisan config:cache
   php artisan migrate --force
   ```
4. Run the dedicated seeder (not `db:seed`):
   ```bash
   php artisan db:seed --class=ShowcaseDatabaseSeeder --force
   ```
5. Verify public artist/artwork/collection pages and the demo artist/buyer sign-in flows. Review the created demo accounts and sample conversations.
6. Immediately set `RADEMAN_SHOWCASE_SEEDING_ENABLED=false` (or remove it), then run `php artisan config:cache` again. The flag prevents future seeder runs; it does not disable the seeded accounts. If the shared demo password is exposed, disable or reset the demo accounts through a reviewed account-management procedure; changing the environment variable alone does not rotate passwords already stored in the database.
7. Keep the backup until public pages and account flows have been checked.

Do not use `migrate:fresh`, `migrate:refresh`, `db:wipe`, table truncation or a production database reset for showcase seeding. The seeder is additive and can be rerun to complete a partial run; it does not remove showcase records when disabled.
