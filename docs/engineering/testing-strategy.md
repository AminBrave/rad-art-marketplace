# Testing Strategy

## Goals

Organize testing around product behavior, domain boundaries and risk—not file counts or a single coverage percentage. Every implemented capability needs traceable evidence at the cheapest reliable layer; critical journeys are verified through the real application.

## Test layers

| Layer | Location | Tool | Responsibility |
|---|---|---|---|
| Unit | tests/Unit | PHPUnit | Isolated PHP rules, transformations and support logic |
| Backend feature | tests/Feature | PHPUnit + Laravel | HTTP/API contracts, authorization, validation and persistence |
| Integration | tests/Integration | PHPUnit + Laravel | Real database, filesystem, queue and notification boundaries |
| Frontend unit | tests/js | Node test runner | Pure JS utilities and deterministic state/query behavior |
| React component rendering | tests/js | Node test runner + Vite SSR + React DOM server | Shared component markup, semantic roles, labels, ARIA and accessible state contracts |
| Frontend interaction / E2E | tests/browser | Python Playwright | User interactions, loading/error/empty states, route behavior and full browser journeys |
| Quality / build | CI | Pint, ESLint, Vite | Style, static hygiene and deployable builds |

Do not mock the boundary a test intends to verify. Unit tests should not boot Laravel or use a database. Feature tests should use the real Laravel container, middleware and test database. Integration tests exercise the actual adapter. Critical browser journeys remain unmocked.

React SSR component tests validate semantic markup and accessibility attributes; they do not simulate browser events or replace interaction tests. Playwright verifies those interactions. A future DOM-based library should be introduced only with a reproducible lockfile update and a clear test gap that the existing layers cannot cover.

## Repository conventions

- Backend tests use PHPUnit namespaces Tests\Unit, Tests\Feature or Tests\Integration.
- Organize new tests by business domain: Auth, Artists, Artworks, Inquiries, Messaging, Editorial, Admin, Public and Infrastructure.
- Existing flat feature tests remain valid; move them only when touching them or when a focused cleanup is justified. Avoid a high-churn rename-only PR.
- PHP class names end in Test; methods use test_actor_behavior_expected_result.
- JS tests use .test.js; group by component/domain and behavior-oriented test names.
- Playwright Python files use test_*.py; names state actor, action and observable outcome.
- Use factories/builders for complex setup. Keep fixtures explicit, minimal and isolated.
- Tests must not depend on execution order, shared mutable state, production services or demo seed data.
- Every test must assert an observable result; avoid tests that only execute code.

## Coverage matrix and traceability

See the [Test Coverage Matrix](test-coverage-matrix.md) and [API/Route Test Map](api-route-test-map.md). They distinguish existing evidence, planned tests and out-of-scope capabilities. A test file's existence is not proof that every scenario in its domain is covered. Update the matrices when features or tests change.

## Local commands

~~~bash
composer test
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature
php artisan test --testsuite=Integration
npm run test:frontend
composer lint
npm run lint
npm run build
npm run build:cpanel
./scripts/verify browser
./scripts/verify all
~~~

The browser suite defaults to https://rad.localhost. Start the complete local stack with npm run dev:local in one terminal and run browser verification in another. Set RAD_ART_BASE_URL to override the URL. The browser suite contains both API-mocked regressions and unmocked full-stack paths; preserve and label that distinction.

## CI policy

The current GitHub Actions workflow runs for pull requests targeting main and pushes to main (with configured Markdown path-ignore behavior for push events). Required CI checks must be green on the PR head before merge. A post-merge run validates the merged main commit. Documentation must reflect .github/workflows/ci.yml, not historical process assumptions.

## Test design checklist

For each API or server action, consider:
- valid authenticated request and persisted result;
- guest, wrong role, wrong owner and non-participant;
- malformed input, boundary values and validation response;
- missing, private, unpublished, deleted and cross-tenant records;
- rate limits, retries, idempotency and duplicate submissions;
- transaction rollback and external dependency failure;
- serialization/privacy: only intended fields are returned.

For each UI feature, consider:
- initial/loading, success, empty and API-error states;
- validation, disabled/submitting and duplicate-click behavior;
- keyboard and accessible names/roles;
- refresh, deep link, browser history and session expiration;
- responsive breakpoints, Persian content and RTL direction;
- authorization UX without relying on it as the security boundary.

For each critical journey, test the real actor sequence and verify persisted or externally observable outcomes. Include a negative/permission path for sensitive journeys.

## Isolation and data safety
- Backend tests use an isolated testing database and refresh state per test where appropriate.
- Integration tests fake only external boundaries not under test.
- Browser tests use unique accounts and isolated disposable data. Never target production.
- Do not rely on demo seeders or test execution order.
- Avoid exposing credentials, private message content or personal data in logs and artifacts.
- Parallel execution is allowed only after database, storage and browser fixture isolation is demonstrated.

## Coverage and quality gates
Coverage is a diagnostic and trend signal, not a correctness guarantee. Prioritize branches enforcing authorization, privacy, moderation, validation, idempotency and state transitions. Introduce reporting only when the runner produces a trustworthy CI report. Do not set a repository-wide threshold before collecting a baseline; use changed-code and critical-domain gates first.

Proposed targets after a measured baseline:
- 90%+ line/branch coverage for isolated domain rules where practical;
- 80%+ backend coverage as a directional target, with exclusions documented;
- meaningful branch and interaction coverage for critical frontend components;
- every critical buyer, artist and admin journey represented by at least one unmocked browser scenario.

Never weaken or delete a failing test without an equivalent or stronger regression test and documented reason.
