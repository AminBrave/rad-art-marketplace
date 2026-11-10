# Testing Strategy

## Where tests run
**Feature branches:** the user runs tests locally. GitHub Actions is deliberately not triggered by feature-branch pushes or pull requests. Agents should not consume runner resources by launching full suites for each incremental task; provide the relevant commands and wait for the user's results. Run a focused local diagnostic only when explicitly requested or essential to investigate a concrete failure.

**Main branch:** GitHub Actions runs the automated test, lint and build suites on pushes to `main` (normally after merge). This is the central automated integration gate. A green run validates the merged main commit, not the earlier PR head.

## Test pyramid
1. Laravel PHPUnit feature suite in `tests/Feature`: HTTP routes, middleware, validation, DB, policies, notifications and persistence; SQLite in-memory from phpunit.xml.
2. Node built-in tests in `tests/js/*.test.js`: deterministic frontend utilities/logic.
3. Python Playwright in `tests/browser`: route, RTL, responsive and user journeys. Existing tests include isolated API-mocked UI regressions; `test_full_stack_auth.py` is unmocked and crosses React, Laravel session and SQLite.
4. Pint, ESLint and Vite production build.

## Local commands for the user
```bash
composer test
composer lint
npm ci
npm run test:frontend
npm run lint
npm run build
python -m unittest discover -s tests/browser -p 'test_*.py' -v
```
Run only the layers relevant to the change during development; run the complete suite locally before merge when the change is broad or high-risk. Browser tests may require the application/database and Playwright Chromium to be prepared.

## Coverage expectations
For APIs test success, validation, guest, wrong role/owner/participant, private records, throttling and idempotency. For transitions test allowed/forbidden states and persisted metadata. For public queries test pagination/filtering and absence of private fields.

For browser flows test entry, success, validation/error, refresh/deep link, role boundary, keyboard and mobile. Maintain both isolated UI tests and unmocked full-stack paths for critical journeys.

Use RefreshDatabase in backend tests. Browser tests use unique accounts and isolated DB. Never target production or rely on test order. Do not claim local checks passed unless the user reports results or the agent actually ran the requested focused check. Main-branch CI is authoritative automated evidence after merge.
