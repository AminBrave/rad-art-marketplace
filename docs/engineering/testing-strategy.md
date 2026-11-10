# Testing Strategy

## Test pyramid
1. Laravel PHPUnit feature suite in `tests/Feature`: HTTP routes, middleware, validation, DB, policies, notifications and persistence; SQLite in-memory from phpunit.xml.
2. Node built-in tests in `tests/js/*.test.js`: deterministic frontend utilities/logic.
3. Python Playwright in `tests/browser`: route, RTL, responsive and user journeys. Existing tests include isolated API-mocked UI regressions; `test_full_stack_auth.py` is unmocked and crosses React, Laravel session and SQLite.
4. Pint, ESLint and Vite production build.

## Commands
`composer test`; `composer lint`; `npm run test:frontend`; `npm run lint`; `npm run build`; browser: `python -m unittest discover -s tests/browser -p 'test_*.py' -v`.

## Coverage expectations
For APIs test success, validation, guest, wrong role/owner/participant, private records, throttling and idempotency. For transitions test allowed/forbidden states and persisted metadata. For public queries test pagination/filtering and absence of private fields.

For browser flows test entry, success, validation/error, refresh/deep link, role boundary, keyboard and mobile. Maintain both isolated UI tests and unmocked full-stack paths for critical journeys.

Use RefreshDatabase in backend tests. Browser tests use unique accounts and isolated DB/session. Never target production or rely on test order. CI on the exact PR head is required evidence; never hide failures with skip/retry.
