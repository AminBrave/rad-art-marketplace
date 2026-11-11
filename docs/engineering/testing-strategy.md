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
| Test reporting | Local, on request | PHPUnit/Node/Playwright reports when explicitly run | Inspectable results only when the user requests verification |
| Quality / build | Local, on request | Pint, ESLint, Vite | Style, static hygiene and deployable builds only when requested |

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

## Local commands (manual, opt-in)

These commands are references, not automatic gates. Neither AI agents nor GitHub Actions may execute them unless the user explicitly requests verification. Normal development should focus on implementation and the running localhost application without waiting for test pipelines.

When the user asks to test, choose only the relevant layer:

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
~~~

## Optional browser / E2E verification

Playwright is not part of the default development or verification path. Run it only when the user explicitly requests browser/E2E testing. It requires a running local app, an isolated disposable local/test database, Python dependencies and Chromium:

~~~bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
RAD_ART_BASE_URL=http://127.0.0.1:8000 npm run test:browser
~~~

Use the PowerShell equivalent to set RAD_ART_BASE_URL on Windows. Never target production. The browser suite contains API-mocked regressions and unmocked full-stack paths; preserve and label that distinction.

## Cross-platform developer workflow

The Node-based task runner is exposed through npm scripts and works in PowerShell, Git Bash, macOS and Linux. See the Developer Workflow for setup, database initialization, local servers, optional browser tests, builds and deployment. The default loop is npm run setup followed by npm run dev; verification commands are run only on explicit user request. The compatibility wrapper ./scripts/verify remains available in Git Bash/macOS/Linux.

## GitHub Actions policy

There is no application CI workflow. GitHub Actions must not run application tests, lint, builds, browser tests or E2E checks on pushes, pull requests or schedules. Do not recreate or dispatch a test workflow. The user controls when AI agents run local verification; when asked, testing happens on the user's local development environment.

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
Coverage is a diagnostic and trend signal, not a correctness guarantee. When explicitly requested and run locally, PHPUnit can publish Clover line-coverage reports for Unit, Feature and Integration suites, plus JUnit reports for backend, frontend and browser runs. The initial combined PCOV baseline was 91.4% statement-line coverage (1,491/1,631) on PR head c1e0f4c; the latest verified batch reached 95.6% (1,560/1,631) on PR head 286a906, with 114 backend tests, 20 frontend tests and 36 browser tests. Branch/condition coverage is not measured. Prioritize branches enforcing authorization, privacy, moderation, validation, idempotency and state transitions. Do not enforce a global threshold from a single baseline; use changed-code and critical-domain gates first.

Proposed targets after several stable baselines:
- 90%+ line coverage for isolated domain rules where practical;
- maintain or improve the latest 95.6% combined backend line-coverage baseline, with exclusions documented;
- meaningful branch and interaction coverage for critical frontend components;
- every critical buyer, artist and admin journey represented by at least one unmocked browser scenario.

Never weaken or delete a failing test without an equivalent or stronger regression test and documented reason.
