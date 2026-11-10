# Testing Strategy

## Where tests run
**Feature branches:** the user runs tests locally. GitHub Actions is deliberately not triggered by feature-branch pushes or pull requests. Agents should not consume runner resources by launching full suites for each incremental task; provide the relevant commands and wait for the user's results. Run a focused local diagnostic only when explicitly requested or essential to investigate a concrete failure.

**Main branch:** GitHub Actions runs automated test, lint and build suites on pushes to `main` (normally after merge). Docs-only pushes are ignored because they do not change executable behavior. A green run validates the merged main commit, not the earlier PR head.

## One-command local verification
Use the repository script to select the smallest relevant layer; it does not install dependencies, start services, mutate databases or invoke Actions.

```bash
./scripts/verify backend
./scripts/verify frontend
./scripts/verify browser
./scripts/verify all
```

Run the full suite locally before merge when the change is broad or high-risk. Browser tests may require the application/database and Playwright Chromium to be prepared. See script help with `./scripts/verify --help`.

## Test pyramid
1. Laravel PHPUnit feature suite in `tests/Feature`: HTTP routes, middleware, validation, DB, policies, notifications and persistence; SQLite in-memory from phpunit.xml.
2. Node built-in tests in `tests/js/*.test.js`: deterministic frontend utilities/logic.
3. Python Playwright in `tests/browser`: route, RTL, responsive and user journeys. Existing tests include isolated API-mocked UI regressions; `test_full_stack_auth.py` is unmocked and crosses React, Laravel session and SQLite.
4. Pint, ESLint and Vite production build.

## Risk-based test selection
- **Low — docs, copy, non-functional styling:** inspect rendered result/diff; no full suite. Docs-only main pushes skip CI.
- **Medium — isolated UI or API behavior:** run the affected frontend or backend layer; add a regression test for changed behavior.
- **High — authentication, roles, messaging, uploads, moderation, privacy or migrations:** run backend + affected frontend/browser journeys; cover negative authorization, validation, concurrency/transactions, privacy and failure paths.
- **Critical — irreversible/high-volume data changes or security boundary redesign:** require staged migration/rollout plan, backup and reconciliation, explicit architecture/security review, and full relevant test suite before merge.

## Coverage expectations
For APIs test success, validation, guest, wrong role/owner/participant, private records, throttling and idempotency. For transitions test allowed/forbidden states and persisted metadata. For public queries test pagination/filtering and absence of private fields.

For browser flows test entry, success, validation/error, refresh/deep link, role boundary, keyboard and mobile. Maintain both isolated UI tests and unmocked full-stack paths for critical journeys.

Use RefreshDatabase in backend tests. Browser tests use unique accounts and isolated DB. Never target production or rely on test order. Do not claim local checks passed unless the user reports results or the agent actually ran the requested focused check. Main-branch CI is authoritative automated evidence after merge.


## Seeder verification

For changes to the production showcase seeder, run the focused guard/idempotency tests first:

```bash
php artisan test --filter=ShowcaseDatabaseSeederTest
php artisan test --filter=DemoDatabaseSeederTest
```

These tests use the test database only. Never point seeder tests or manual showcase runs at production except for the explicitly documented, backed-up production operation.
