# Deployment, Backup and Recovery

The application is designed for Laravel on Apache/LiteSpeed with MySQL and compiled Vite assets. The repository includes a cPanel Vite build profile; this does not prove a live host's document-root layout. Prefer keeping the Laravel application outside `public_html` and exposing only Laravel's `public/` contents as the document root. If the hosting account cannot support that topology, use the reviewed cPanel deployment layout and verify that application source, `.env`, `vendor`, and private storage are not web-accessible.

## cPanel runtime

- Build frontend assets in CI or on a trusted build machine with `npm ci && npm run build:cpanel`; Node.js is not required on production.
- Configure MySQL credentials and SMTP values as hosting environment variables. Keep `APP_DEBUG=false`, a unique `APP_KEY`, and `SESSION_SECURE_COOKIE=true` in production HTTPS.
- Keep `storage/app/private` outside the public document root and writable only by the application user. Never expose private attachments through a public symlink.
- Use the database queue driver. Run migrations during a controlled deploy after a database backup.
- Configure these cron entries using the actual cPanel account path and PHP binary:

```cron
* * * * * cd /home/account/applications/rad-art && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd /home/account/applications/rad-art && php artisan queue:work database --stop-when-empty --max-time=50 --tries=3 >> /dev/null 2>&1
```

The queue command exits after draining available work and is suitable for cron-triggered processing without Supervisor. Set `retry_after` longer than the longest job timeout; ensure each job's timeout is shorter than `retry_after` to avoid concurrent duplicate execution. Monitor `failed_jobs` and use `php artisan queue:failed` / `php artisan queue:retry all` as appropriate.

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
