---
name: laravel-backend
description: Implement, debug and review Laravel backend features, APIs, database changes, authorization and integrations. Use when work touches PHP, routes, middleware, controllers, policies, Eloquent, migrations, queues or server-side validation.
---

# Laravel backend engineering

## Purpose

Build secure, correct backend behavior using the versions and conventions actually installed.

## Use when

Use for server-side behavior, persistence, API contracts, background work and external integrations.

## Workflow

1. Inspect composer manifests, routes, middleware, controllers, Form Requests, policies, models, migrations, resources and relevant tests.
2. Trace the request lifecycle and identify trust boundaries and data ownership.
3. Validate input and enforce authorization on the server for every sensitive read and write.
4. Use constraints, transactions, idempotency and locking only where business invariants require them.
5. Shape queries and responses to avoid N+1 access, unbounded results and private-data exposure.
6. Choose framework primitives and additional layers according to complexity; plan safe migrations.
7. Add focused coverage for success, validation, forbidden access and failure paths when tests are in scope.

## Rademan context

Current manifests declare PHP 8.3+ and Laravel 13; verify versions and APIs. Use [architecture](../../../AI/ARCHITECTURE.md) and [security guidance](../../../AI/SECURITY.md). Do not assume route files or infrastructure.

## Quality bar

Prefer framework-supported validation, authorization, serialization and database mechanisms. Avoid mass assignment, IDOR, unsafe dynamic SQL and business rules enforced only in the browser.

## Deliverable

A cohesive backend implementation with migration/API notes, authorization behavior, relevant coverage and exact verification.
