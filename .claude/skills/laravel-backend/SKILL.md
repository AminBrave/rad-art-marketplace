---
name: laravel-backend
description: Use for Laravel 13, PHP 8.3+, Eloquent, API, migration, queue, authorization, validation and backend performance changes in Rademan.
---

# Rademan Laravel Backend

Adapted from the Laravel Specialist skill in Jeffallan/claude-skills (MIT), aligned to this repository's actual stack.

## Workflow

1. Read relevant domain, API, data-model and security docs; inspect the current implementation and nearby patterns.
2. Trace route → middleware → controller/action → policy → service/model → resource/response.
3. For schema changes, inspect current migrations and model relationships. Add forward migrations; never rewrite deployed historical migrations.
4. Keep authorization in Laravel policies/middleware and enforce ownership/participant checks server-side.
5. Validate all untrusted input. Use transactions for multi-record invariants and idempotency for retryable writes.
6. Prevent N+1 queries, unbounded collection queries, mass assignment, unsafe file access and private-field leakage.
7. Preserve API response and pagination contracts. Use existing response/resource conventions.
8. Consider success, validation, authorization, privacy, race, rollback and external-service failure paths.
9. Update API/data/domain/security docs and coverage maps when affected.

## Project-specific constraints

- Runtime: PHP 8.3+, Laravel 13, Eloquent; follow installed package versions rather than generic upstream examples.
- Do not introduce Livewire, Sanctum, Horizon, Pest or other packages simply because an upstream skill mentions them. Inspect the existing stack first.
- Do not assume a service layer is required for every controller; follow established project patterns.
- Tests should be added or updated at the correct layer when the change warrants them. Never execute tests, Artisan verification commands, Pint, static analysis or builds unless the user explicitly authorizes verification.
- Do not change production data, inspect production personal data or expose secrets.
