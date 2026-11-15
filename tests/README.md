# Rademan testing guide

Rademan has five practical test layers:

- PHPUnit Unit — isolated domain rules and deterministic helpers.
- PHPUnit Feature — Laravel HTTP behavior, validation, authentication, authorization and persistence.
- PHPUnit Integration — database, storage, transactions and cross-system boundaries.
- Frontend Node tests — JavaScript utilities, React rendering and frontend contracts.
- Playwright browser tests — real user journeys, navigation, interaction, responsive/RTL behavior and recovery.

The quality matrix in QUALITY-MATRIX.md describes important journeys, permission boundaries, current coverage and known gaps. A passing suite does not mean every product behavior is covered.

> **Safety and permission:** Follow AGENTS.md. Do not run tests, lint, builds, browser automation, migrations, seeders or CI unless the project owner has explicitly authorized that verification. Commands below are instructions, not evidence that they have run.

## 1. Choose a test layer

| What changed | Start with |
|---|---|
| Pure PHP/domain helper | npm run test:unit |
| Laravel route, controller, validation, auth or permissions | npm run test:feature |
| Database/storage/transaction boundary | npm run test:integration |
| React component, hook, utility or frontend state | npm run test:frontend |
| User-visible journey, navigation, keyboard, responsive or RTL behavior | Focused Playwright test |
| Test runner, JUnit output or report parsing | npm run test:reporting |

Backend suites use isolated in-memory SQLite. Frontend tests use Node's built-in runner. Playwright is a separate browser workflow.

## 2. First-time setup

Run npm run setup from the repository root to install Composer/npm dependencies and create .env from .env.example when absent. Review local database and mail settings before using the app.

Required runtimes: PHP 8.3+ and Composer; Node.js 20.13+ and npm; Python 3 for Playwright; Caddy for normal HTTPS development.

For Playwright, install python -m pip install -r requirements-test.txt and python -m playwright install chromium.

Do not run npm run db:fresh as a general test setup step. It drops tables in the database configured for the normal app. PHPUnit uses in-memory SQLite; Playwright resets its own database/browser-testing.sqlite file.

## 3. Backend tests

Run npm run test:unit, npm run test:feature or npm run test:integration for one layer. Run npm run test:backend for all PHPUnit suites. The project runner uses in-memory SQLite, array cache/session/mail, synchronous queues and test-only storage/view paths. For a focused test, PHPUnit can also be invoked directly, for example vendor/bin/phpunit --filter 'test_name_fragment'.

## 4. Frontend tests

Run npm run test:frontend for all frontend Node tests. Run npm run a11y:colors for focused color-accessibility tests. The color suite is not a complete accessibility audit.

## 5. Playwright browser tests

Playwright tests exercise the app in Chromium and may create, update or delete test records. They are restricted to a disposable local environment.

Run npm run test:browser from the repository root. The command performs the isolated lifecycle:

1. Create database/browser-testing.sqlite if absent and verify it is a regular file.
2. Reset only browser-test storage directories.
3. Run migrate:fresh --seed against the isolated browser SQLite database.
4. Start temporary Laravel on 127.0.0.1:8000 and Vite on 127.0.0.1:5173.
5. Wait for the API health endpoint to confirm browser_test_ready=true and for Vite to respond.
6. Run Playwright (or the selected unittest ID) and stop both temporary services.

No separate dev:browser command, browser:prepare command or Caddy browser configuration is required. The temporary app is loopback-only and is not exposed to the LAN. Stop npm run dev before Playwright because the test workflow uses the normal local Laravel/Vite ports.

Run one test by appending its Python unittest ID after --:
  npm run test:browser -- test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications

Never point browser tests at database/database.sqlite, a shared database, staging or production. The runner rejects non-loopback targets and requires the dedicated browser_test_ready health flag. Do not bypass those guards.

### Browser diagnostics

The runner writes browser-junit.xml, browser-run.log, browser-debug.json and failure artifacts under build/test-reports/. Open a captured trace with python -m playwright show-trace <path-to-trace.zip>.

## 6. Reports

After relevant suites run, use npm run test:report to summarize existing JUnit files. It does not execute tests. The report is written to build/test-reports/quality-summary.md. Use npm run test:reporting for focused report-parser tests.

A missing or stale suite is not a pass. The report distinguishes automated tests from lint/static analysis, builds, accessibility review, visual review, performance measurements and manual QA.

## 7. Recommended workflow

1. Identify the changed behavior, actor, expected outcome, API/state contract and protected data.
2. Choose the narrowest meaningful test layer.
3. Add important negative cases: unauthorized actors, invalid transitions, empty/error/loading/retry states and duplicate submissions.
4. Run the focused test first, then expand only when risk warrants it.
5. Inspect failures and diagnostics. Fix the cause; do not delete, skip or weaken a failing test to obtain a green result.
6. Record exact commands, results, environment and verification not performed.

Do not force every change through every test layer or claim full coverage from a passing suite.
