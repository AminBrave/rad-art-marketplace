---
name: operations-reliability
description: Assess and improve runtime reliability, deployment safety, observability, backups, recovery and production operations. Use when investigating incidents, planning releases, changing infrastructure or reducing operational risk.
---

# Operations and reliability

## Purpose

Make critical behavior observable, resilient and recoverable based on infrastructure that actually exists.

## Use when

Use when changes affect deployment, runtime configuration, data durability, background processing, external dependencies or incident response.

## Workflow

1. Inspect actual hosting, deployment workflows, runtime configuration, database, storage, queues, monitoring and backup setup.
2. Map critical journeys and their operational dependencies.
3. Identify failure modes, blast radius, detection gaps and recovery objectives.
4. Choose proportionate health checks, structured logs, metrics, alerts and runbooks.
5. Plan migration sequencing, compatibility, rollback/forward recovery, capacity and cost.
6. Validate in a safe environment; test restore/recovery paths when required.
7. Record ownership, residual risk and exact evidence gathered.

## Rademan context

Do not assume hosting, topology, monitoring, backup schedule or queue driver. Verify configuration and live infrastructure. Protect conversations, attachments and credentials; see [security guidance](../../../AI/SECURITY.md).

## Quality bar

Prioritize data durability, least privilege, safe deploys and recoverability. A configured backup is not proof of restore; a health endpoint is not proof that critical journeys work.

## Deliverable

An operational change or recommendation with dependencies, failure modes, observability, recovery plan, validation evidence and unknowns.
