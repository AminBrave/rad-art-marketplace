---
name: laravel-backend
description: Build, improve and review Rademan Laravel backend features, APIs, persistence, authorization and integrations.
---

# Laravel backend engineering

## Purpose
Deliver correct, secure and maintainable backend behavior using the versions and patterns actually installed in the repository.

## Approach
1. Inspect composer.json, relevant routes, middleware, controllers, policies, models, migrations, resources and tests.
2. Trace the full request and data lifecycle.
3. Keep validation and authorization at trusted server boundaries.
4. Use transactions, constraints and idempotency where the business invariant requires them.
5. Design queries and serialization to avoid N+1 access, unbounded results and private-data leakage.
6. Choose controllers, actions, services, events or jobs according to real complexity; do not add layers by default.
7. Consider compatibility, migration sequencing, database engine and rollback/recovery.
8. Add focused tests for observable behavior and important forbidden paths.
9. Run appropriate checks in a suitable development environment and report exact results.

## Rademan context
The manifests currently declare PHP 8.3+ and Laravel 13. Verify current versions before using APIs. Browser-facing and api/v1 routes are currently present in routes/web.php; routes/api.php currently includes a health endpoint. This is an observation, not a rule about where routes must live.

## Deliverable
Working backend changes with relevant tests, migration or API notes, and a concise verification report.
