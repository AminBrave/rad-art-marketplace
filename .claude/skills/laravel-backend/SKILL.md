---
name: laravel-backend
description: Implement or review Rademan PHP 8.3+ and Laravel 13 backend behavior, APIs, Eloquent models, migrations, authorization, validation, queues and performance.
---

# Laravel Backend Engineering

## First inspect
- Confirm PHP, Laravel and package versions from composer.json and lockfile.
- Trace route -> middleware -> controller/action -> policy -> service/model -> resource/response.
- Inspect relevant migrations, relationships, indexes, factories, seeders and tests.
- Follow nearby project conventions; do not assume generic Laravel examples match installed versions.

## Engineering rules
1. Enforce authentication, role, ownership and participant authorization on the server for every sensitive operation.
2. Validate untrusted input at request boundaries. Validate file content/type/size and authorize every upload/download path.
3. Use explicit fillable/guarded boundaries and avoid mass assignment of privileged or derived fields.
4. Use transactions for multi-record invariants; design retryable operations for idempotency and concurrency.
5. Add indexes based on query patterns and constraints. Avoid N+1 queries, unbounded result sets and unnecessary eager loading.
6. Keep API resource fields, status codes, validation errors and pagination contracts stable unless a versioned/intentional change is approved.
7. Avoid leaking private messages, attachments, unpublished artwork, personal fields, internal paths or secrets through resources, logs and exceptions.
8. Handle queue retries, duplicate delivery, external service failure, timeouts and partial failure deliberately.
9. Add forward-only migrations. Never rewrite a migration that may have run in another environment. Check engine compatibility and rollback behavior.
10. Keep controllers and services proportionate; do not introduce a service/repository layer by default.

## Verification
- Add or update focused backend tests when behavior changes.
- Do not execute PHPUnit, Artisan commands, Pint, static analysis, migrations, seeders or other verification without explicit user authorization.
- Do not inspect production personal data or modify production state.
- Do not add Livewire, Sanctum, Horizon, Pest or other packages unless the current project and task justify them.
