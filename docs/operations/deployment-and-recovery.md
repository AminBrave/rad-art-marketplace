# Deployment, Backup and Recovery

For local installation, package management, development commands, test execution and production build commands, see the [Developer Workflow](developer-workflow.md). This document focuses on hosting topology, production operations, backups and recovery.

The application is designed for Laravel on Apache/LiteSpeed with MySQL and compiled Vite assets. The repository includes a cPanel Vite build profile; this does not prove a live host's document-root layout. Prefer keeping the Laravel application outside `public_html` and exposing only Laravel's `public/` contents as the document root. If the hosting account cannot support that topology, use the reviewed cPanel deployment layout and verify that application source, `.env`, `vendor`, and private storage are not web-accessible.

## Deployment topology

Preferred topology: keep the Laravel project (including `.env`, `vendor/`, `storage/` and application source) outside the web document root, and point the web server document root at Laravel's `public/` directory. Use the standard `npm run build` profile for this topology; it writes assets to `public/build/`.

The repository also contains a cPanel-specific Vite profile. Use `npm run build:cpanel` only when following the reviewed root-document-root layout and its `.htaccess` protections. That build writes assets to the repository-level `build/` directory. A build profile is not a security boundary: verify that `.env`, application source, `vendor/` and private storage cannot be fetched over HTTP before going live.

## cPanel runtime

- Build frontend assets in CI or on a trusted build machine with Node.js 20+ and `npm ci && npm run lint && npm run build:cpanel`; Node.js is not required on production.
- Configure MySQL credentials and SMTP values as hosting environment variables. Keep `APP_DEBUG=false`, a unique `APP_KEY`, and `SESSION_SECURE_COOKIE=true` in production HTTPS.
- Keep `storage/app/private` outside the public document root and writable only by the application user. Never expose private attachments through a public symlink.
- Use the database queue driver. Run migrations during a controlled deploy after a database backup.
- Configure these cron entries using the actual cPanel account path and PHP binary:

```cron
* * * * * cd /home/account/applications/rad-art && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd /home/account/applications/rad-art && php artisan queue:work database --stop-when-empty --max-time=50 --tries=3 >> /dev/null 2>&1
```

The queue command exits after draining available work and is suitable for cron-triggered processing without Supervisor. Set `retry_after` longer than the longest job timeout; ensure each job's timeout is shorter than `retry_after` to avoid concurrent duplicate execution. Monitor `failed_jobs` and use `php artisan queue:failed` / `php artisan queue:retry all` as appropriate.

## Routine operations and backups

Useful diagnostics:

```bash
php artisan about
php artisan migrate:status
php artisan queue:failed
```

For database-backed production queues, monitor failed jobs and retry only after understanding the failure:

```bash
php artisan queue:retry all
```

Before migrations or other risky releases, take a consistent database backup and a matching backup of uploaded files. For MySQL, a typical logical backup is:

```bash
mysqldump --single-transaction --host=127.0.0.1 --user=DB_USER --password DB_NAME > database-backup.sql
```

The `--password` option prompts interactively; do not put the password in shell history. Restore only as part of an approved recovery procedure:

```bash
mysql --host=127.0.0.1 --user=DB_USER --password DB_NAME < database-backup.sql
```

Back up the configured upload/storage directories with the hosting provider's backup facility or a secure archive tool. Include private uploads and verify that backup archives are not web-accessible. Database and file backups must represent a compatible recovery point. Test restoration on a non-production environment; a backup that has never been restored is not a verified recovery plan.

Laravel logs are normally written under `storage/logs/`. Review them together with Apache/LiteSpeed/PHP error logs. Ensure `storage/` and `bootstrap/cache/` remain writable by the application user. After changing production environment values, clear and rebuild Laravel caches deliberately with `php artisan optimize:clear` and `php artisan optimize`.

## Pre-deploy

- [ ] Confirm target commit/environment and secrets.
- [ ] Build assets with the correct target config.
- [ ] Back up DB and uploaded files before risky migrations.
- [ ] Review migration locks, duration, indexes and data transforms.
- [ ] Confirm storage permissions and private/public disk separation.
- [ ] Deploy code/assets atomically where possible.
- [ ] Run `php artisan migrate --force` only after the backup and migration review.
- [ ] Run health and public/authenticated smoke paths.
- [ ] Observe logs, HTTP errors, queues and storage.

## Recovery

Prefer a forward-fix once new writes depend on schema. Restore database and files from a matched recovery point only under an approved incident plan. Validate integrity and critical flows. Run restore drills outside production. Do not roll back the queue-table migration while jobs remain queued or failed; drain/export jobs first.

## Unknowns to verify

Live host, DB engine/version, PHP binary path, document root, SMTP provider, cron execution limits, backup schedule/retention, monitoring, TLS termination and deployment approvals.
