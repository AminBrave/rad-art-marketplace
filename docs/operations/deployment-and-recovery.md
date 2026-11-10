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
