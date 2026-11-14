# Rademan testing guide

This guide explains how to test Rademan locally, from one test case to the complete automated quality workflow.

Rademan has five practical test layers:

- **PHPUnit Unit** — isolated domain rules and deterministic helpers.
- **PHPUnit Feature** — Laravel HTTP behavior, validation, authentication, authorization and persistence.
- **PHPUnit Integration** — database, storage, transactions and cross-system boundaries.
- **Frontend Node tests** — JavaScript utilities, React rendering and frontend contracts.
- **Playwright browser tests** — real user journeys, navigation, interaction, responsive/RTL behavior and recovery.

The quality matrix in [QUALITY-MATRIX.md](QUALITY-MATRIX.md) describes the important journeys, permission boundaries, current coverage and known gaps. A test suite passing does not mean every product behavior is covered.

> **Safety and permission:** Follow the repository's `AGENTS.md` contract. Do not run tests, lint, builds, browser automation, migrations, seeders or CI unless the project owner has explicitly authorized that verification. The commands below are instructions, not evidence that they have been run.

## 1. Choose what to run

Use the smallest scope that gives useful feedback, then expand when the change or risk warrants it.

| What changed / what you want to check | Start with | Expand to |
|---|---|---|
| Pure PHP/domain helper | `npm run test:unit` | `npm run test:backend` |
| Laravel route, controller, validation, auth or permissions | `npm run test:feature` | `npm run test:backend` |
| Database constraint, storage, transaction or rollback | `npm run test:integration` | `npm run test:backend` |
| React component, hook, utility or frontend state contract | `npm run test:frontend` | `npm test` |
| User-visible journey, navigation, keyboard, responsive or RTL behavior | Focused Playwright test | `npm run test:browser` |
| Test runner, JUnit output or quality report | `npm run test:reporting` | `npm run test:report` after the relevant suites |
| Broad backend + frontend confidence | `npm test` | `npm run verify` |
| Release-level local verification including browser journeys | `npm run verify:all` | Review the generated quality report and manual checks |

**Important command differences**

- `npm test` runs backend PHPUnit and frontend Node tests. It does **not** run Playwright, lint or production builds.
- `npm run verify` runs backend tests + PHP Pint, then frontend tests + ESLint + standard and cPanel production builds. It does **not** run browser tests.
- `npm run verify:all` runs the `verify` workflow and then Playwright. Prepare and start the isolated browser app first (see section 5).
- `npm run test:report` only summarizes existing JUnit files. It does **not** execute any tests.

## 2. First-time setup

Run these steps from the repository root.

1. Install the project dependencies if they are not already installed:

   ```bash
   npm run setup
   ```

   This runs Composer and npm dependency installation and creates `.env` from `.env.example` if it is absent. Review your local `.env` settings before starting the regular development app. This setup command does not install the Python Playwright dependency.

2. Confirm the required runtimes are available:
   - PHP 8.3 or newer and Composer.
   - Node.js 20.13 or newer and npm.
   - Python 3 for the browser suite.
   - Caddy for the HTTPS browser-test app.

3. For browser tests, install the Python test requirement and Chromium browser:

   ```bash
   python -m pip install -r requirements-test.txt
   python -m playwright install chromium
   ```

   If your machine uses `python3` rather than `python`, use `python3 -m pip` and `python3 -m playwright` for these installation commands. The browser runner uses the Python interpreter available to the project scripts; make sure Playwright is installed into that same environment.

Do not run `npm run db:fresh` as a general test setup step. It drops tables in the database configured for the regular app. PHPUnit uses its own in-memory SQLite database, and Playwright has a separate isolated database.

## 3. Run backend tests (PHPUnit)

PHPUnit is configured in `phpunit.xml` with three suites. The test bootstrap forces an isolated environment: in-memory SQLite, foreign keys, array cache/session/mail, synchronous queue, stderr logging and test-only file/view paths.

### Run one backend layer

```bash
npm run test:unit
npm run test:feature
npm run test:integration
```

### Run all backend suites

```bash
npm run test:backend
```

### Run one test class, file or method

For a single file, invoke PHPUnit directly:

```bash
vendor/bin/phpunit tests/Feature/path/to/YourTest.php
```

For one test method or a matching group of tests:

```bash
vendor/bin/phpunit --filter 'test_name_or_unique_fragment'
```

You can combine a file and filter:

```bash
vendor/bin/phpunit tests/Feature/path/to/YourTest.php --filter 'test_name_or_unique_fragment'
```

Replace the example path and filter with the real test file and method in your branch. PHPUnit reads `phpunit.xml` and loads `tests/bootstrap.php`, so the isolated test environment is still applied when invoking it directly. Direct PHPUnit commands do not create the npm runner's JUnit report.

## 4. Run frontend tests

Frontend tests use Node's built-in test runner and live in `tests/js/`.

### Run all frontend tests

```bash
npm run test:frontend
```

### Run one test file

```bash
node --test tests/js/your-test-file.test.js
```

### Run matching test names in one file

```bash
node --test --test-name-pattern="part of the test name" tests/js/your-test-file.test.js
```

Use the actual existing filename and test title. The focused color accessibility tests can also be run with:

```bash
npm run a11y:colors
```

This is a focused automated color-contrast check, not a complete accessibility audit.

## 5. Run browser tests (Playwright)

Browser tests exercise the actual app in Chromium. They are stateful and can create, update and delete test records. They must run only against the dedicated local browser-test environment.

For manual testing on a phone or another device on the same trusted LAN, use the normal `npm run dev` workflow and its HTTPS LAN URL described in [the development and LAN access guide](../scripts/README.md#default-https-development-and-lan-access). The isolated browser-test app started by `npm run dev:browser` is intentionally loopback-only and must not be exposed to LAN devices. The automated Playwright runner remains restricted to localhost/loopback; its remote-host rejection must not be bypassed.

### Required lifecycle

Use three terminals, all from the repository root.

**Terminal 1 — prepare the isolated browser environment**

First stop any existing `npm run dev:browser` process. Then run:

```bash
npm run browser:prepare
```

This rebuilds only:

- `database/browser-testing.sqlite`
- Browser-test-only storage, cache, session and compiled-view directories.
- Browser-test-specific Laravel bootstrap caches.

It runs migrations and seeders against that isolated browser database. It does not prepare or reset your normal development database.

**Terminal 2 — start the isolated browser app**

```bash
npm run dev:browser
```

The app is served through the local HTTPS host:

```text
https://rad.localhost
```

Keep this terminal running while browser tests execute. Caddy must be installed and configured for the local HTTPS host.

**Terminal 3 — run the browser tests**

Run the full browser suite:

```bash
npm run test:browser
```

Or run one test method by its Python unittest ID:

```bash
npm run test:browser -- test_module.TestClass.test_method
```

For example, the notification preference regression test can be selected with:

```bash
npm run test:browser -- test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications
```

When finished, stop the browser app in Terminal 2 with Ctrl+C.

### Browser safety rules

- Do not run the Python browser runner directly. Use `npm run test:browser`; its guard verifies the target is localhost and that the app reports `browser_test_ready=true`.
- Do not change `RAD_ART_BASE_URL` to a staging or production host. Remote targets are intentionally rejected.
- Do not point browser tests at `database/database.sqlite`, your normal development database, or any shared database.
- Do not run `npm run browser:prepare` while the browser app is running.
- Preparing the browser environment resets the dedicated browser-test database and browser-test storage. It does not reset your normal development database.
- If the local HTTPS host or readiness check fails, fix the local browser setup; do not weaken or bypass the preflight guard.

### Browser diagnostics

Each run refreshes these files under `build/test-reports/`:

| Artifact | What it contains |
|---|---|
| `browser-junit.xml` | JUnit test counts and per-test results |
| `browser-run.log` | Terminal output and full Python unittest tracebacks |
| `browser-debug.json` | Python/platform/Playwright versions, selected tests, timings, failures and exit status |
| `browser-artifacts/` | Automatic failure screenshots, Playwright traces and per-test debug data for browser contexts created during a failed test; explicitly instrumented tests also save focused artifacts |

To inspect a captured Playwright trace:

```bash
python -m playwright show-trace build/test-reports/browser-artifacts/path/to/trace.zip
```

Use the exact trace path printed or referenced by the failure output. The runner automatically starts tracing for every browser context created during a test and preserves screenshots/traces when that test fails. Passing-test temporary artifacts are removed. A trace may still be unavailable if Chromium or the context fails before tracing can start; the JUnit traceback and run log remain the fallback. Some explicitly instrumented tests also save richer event timelines.

## 6. Run complete test and quality workflows

Choose based on how much confidence you need.

### Automated backend + frontend tests

```bash
npm test
```

Runs all PHPUnit suites and all frontend Node tests.

### Backend and frontend quality checks

```bash
npm run verify
```

Runs, in order:

1. Backend PHPUnit tests.
2. PHP Pint style check.
3. Frontend Node tests.
4. ESLint.
5. Standard Vite production build.
6. cPanel Vite production build.

### Full local verification including browser journeys

First complete the three-terminal browser setup in section 5. Keep Terminal 2 (`npm run dev:browser`) running, then run:

```bash
npm run verify:all
```

This runs the backend and frontend quality workflow and then the guarded Playwright suite. It does not dispatch GitHub Actions or run remote CI.

If you only want the complete automated test suites without lint/build checks, run:

```bash
npm test
npm run test:browser
```

The browser app must already be prepared and running before the second command.

## 7. Generate and inspect the unified quality report

After running the suites you want represented, generate the summary:

```bash
npm run test:report
```

Open:

```text
build/test-reports/quality-summary.md
```

The report reads existing JUnit files. It does not run tests or lint/build checks.

| Status | Meaning | What to do |
|---|---|---|
| `CURRENT` | Parseable report generated at or after current Git HEAD with no project changes in the worktree | Inspect counts and detailed results |
| `STALE` | Invalid/old report, project worktree changes, or Git freshness could not be established | Rerun the relevant suite after the source snapshot is committed/clean, then regenerate |
| `MISSING` | No JUnit report exists for that suite | Run that suite through its npm command |

A missing or stale suite is **not a pass**. A report with zero failures is not proof that skipped tests are acceptable or that every product behavior is covered.

The report links to detailed suite reports and browser diagnostics when present. It deliberately keeps automated tests separate from lint/static analysis, builds, accessibility review, visual review, performance measurements and manual QA.

### Test the report generator itself

```bash
npm run test:reporting
```

This runs focused Python unit tests for report parsing and freshness classification. It is not a product behavior suite.

## 8. A recommended workflow for each development task

Use this loop whenever you implement a feature, fix a bug or refactor behavior:

1. **Identify the changed behavior.** Write down the actor, expected outcome, API/state contract, permissions and data that must not change.
2. **Choose the narrowest meaningful layer.**
   - Pure deterministic rule → Unit.
   - HTTP/API, validation, auth, role/ownership or persisted result → Feature.
   - Database/storage/transaction/queue boundary → Integration.
   - React state/rendering contract → Frontend.
   - Navigation, user interaction, responsive/RTL, keyboard/accessibility or cross-role journey → Browser.
3. **Add the important negative case.** Depending on the change, consider unauthorized actors, wrong owners, invalid transitions, empty/error/loading/retry states, duplicate submissions, stale state and failure recovery.
4. **Run the focused test first.** Use the focused commands in sections 3–5.
5. **Expand to the affected suite.** Then run `npm test` or `npm run verify` when the change crosses layers or has broader regression risk.
6. **Run browser journeys when user-observable behavior changes.** Use the isolated lifecycle in section 5.
7. **Inspect failures and diagnostics.** Fix the product/test setup cause; do not delete, skip or weaken a failing test just to get a green result.
8. **Generate the report** after the relevant suites have produced their JUnit output.
9. **Record exactly what ran.** List commands, pass/fail/skipped counts, environment and any tests or manual checks not performed.

Do not force every change through every test layer. Choose tests based on the changed boundary and risk. Do not target an arbitrary 100% line-coverage percentage; prioritize critical user journeys, security/privacy boundaries and data integrity.

## 9. What to do when a test fails

1. Identify the first failing test and read its full assertion/traceback. Later failures may be consequences of the first one.
2. Re-run only that test to determine whether the failure is deterministic. For browser tests, use the focused unittest ID and inspect `browser-run.log`, `browser-debug.json` and any captured screenshot/trace.
3. Classify the failure:
   - **Product regression:** fix the application behavior and keep/add the regression assertion.
   - **Test defect:** correct the setup or assertion while preserving the intended invariant.
   - **Environment/setup:** repair dependencies, local services, test database or browser readiness without bypassing isolation guards.
   - **Flaky/timing issue:** replace arbitrary sleeps or brittle selectors with observable readiness and deterministic synchronization.
4. Check that failed or unauthorized operations did not mutate protected data.
5. Run the focused test again after the repair, then the relevant suite.
6. Report any unresolved failures and skipped tests. Never claim the project is fully green if a suite was not run.

## 10. Keep these references in sync

- [Quality matrix](QUALITY-MATRIX.md) — what user journeys and actor/security boundaries are covered, plus known gaps.
- [Project scripts](../scripts/README.md) — canonical npm commands and report details.
- [Agent contract](../AGENTS.md) — repository safety and explicit verification permissions.
- [Quality engineering skill](../.agents/skills/quality-engineering/SKILL.md) — how to choose and author tests.

When a feature changes a supported journey, actor boundary or known coverage gap, update `QUALITY-MATRIX.md` along with the relevant tests. When a command or test artifact changes, update both this guide and the script reference.
