---
name: operations-reliability
description: Plan or review Rademan runtime operations, deployment readiness, configuration, observability, backups, queues, incident response and reliability without assuming unverified infrastructure.
---

# Operations and Reliability

## Purpose and boundaries

Use this skill for deployment planning, production readiness, runtime configuration, observability, backups, queue/storage reliability, incident response, recovery and operational risk. It is not permission to deploy, execute commands, change secrets, mutate production or initiate CI. Follow `AGENTS.md` for every execution and approval boundary.

## Evidence-first workflow

1. **Identify the actual environment.** Inspect current deployment workflows, hosting/runtime configuration, environment variables (names and references only, never secret values), process topology, storage, queues, database and health checks.
2. **Map critical paths.** Identify user-visible journeys and dependencies affected by the change, including Laravel HTTP requests, database, file storage, queues, notifications and external providers.
3. **Classify failure modes.** Consider process restart, timeout, partial outage, database/storage unavailability, queue backlog, duplicate delivery, rate limiting, expired credentials, resource exhaustion and bad configuration where applicable.
4. **Review operational controls.** Check health/readiness signals, structured logs, actionable error reporting, metrics, alert ownership, backup/restore evidence, access control and secret handling.
5. **Design recovery.** Define rollback or forward-fix, data compatibility, idempotent retry, replay/reconciliation, safe cleanup and user communication for the relevant failure modes.
6. **Set measurable objectives only when justified.** Use SLI/SLO or performance budgets only for important journeys with a reliable baseline, measurement method, owner and response action. Do not invent availability targets or alert thresholds.
7. **Plan a safe release.** Identify prerequisites, migration ordering, compatibility window, feature flags if already supported, smoke evidence, monitoring window and abort/rollback criteria.
8. **Report gaps.** Distinguish verified controls, documented intentions, inferred risks and unknown operational ownership. Provide prioritized recommendations with impact and effort.

## Rademan-specific guardrails

- Do not assume the hosting platform, topology, deployment target, CI policy, monitoring provider, backup schedule, queue driver or storage provider; verify the repository and live configuration.
- Laravel configuration must use environment/config boundaries; never hardcode credentials or expose secret values in logs, client bundles, issues or PRs.
- Treat private messages, attachments, unpublished artwork and account information as sensitive. Logs and traces must avoid payloads and unnecessary personal data.
- For queues and notifications, reason about retries, duplicate delivery, timeouts, idempotency, failed-job visibility and recovery.
- For uploads and stored files, consider orphan cleanup, private access, retention and failure compensation.
- Database changes must preserve deployed-version compatibility and use forward-safe migration/recovery plans.
- The browser test suite may use the configured MySQL/MariaDB database and persist records; follow the explicit Playwright safety rules in the quality-engineering skill.
- Do not claim a backup is restorable, an alert works, a deployment is healthy or an SLO is met without evidence.

## Operational readiness checklist

- [ ] Runtime and deployment target are confirmed from current configuration.
- [ ] Configuration and secrets use appropriate protected mechanisms.
- [ ] Critical dependencies and failure modes are identified.
- [ ] Logs/metrics/errors are actionable and privacy-conscious.
- [ ] Health/readiness checks reflect real critical dependencies.
- [ ] Queue retry, idempotency and failed-work recovery are addressed where relevant.
- [ ] Backup/restore and data recovery evidence are known for data-impacting changes.
- [ ] Migration and release ordering preserve compatibility.
- [ ] Rollback or forward-recovery criteria are explicit.
- [ ] Human owner, monitoring window and incident escalation are identified where relevant.

## Execution policy

- Read-only inspection is allowed when relevant.
- Do not run tests, Artisan commands, migrations, seeders, scanners, load tests, deployments, production requests or CI without explicit permission for the exact action and environment.
- Never print secret values or query production personal data.
- A release plan or checklist is not release authorization.
