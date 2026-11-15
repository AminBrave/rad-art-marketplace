# Rademan testing guide

This guide explains how to test Rademan locally, from one test case to the complete automated quality workflow.

Rademan has five practical test layers:

- **PHPUnit Unit** — isolated domain rules and deterministic helpers.
- **PHPUnit Feature** — Laravel HTTP behavior, validation, authentication, authorization and persistence.
- **PHPUnit Integration** — database, storage, transactions and cross-system boundaries.
- **Frontend Node tests** — JavaScript utilities, React rendering and frontend contracts.
- **Playwright browser tests** — real user journeys, navigation, interaction, responsive/RTL behavior and recovery.

The quality matrix in [QUALITY-MATRIX.md](QUALITY-MATRIX.md) describes the important journeys, permission boundaries, current coverage and known gaps. A test suite passing does not mean every product behavior is covered.

The frontend suite also runs a **dynamic design-system source audit** (`tests/js/designSystemCoverage.test.js`). It discovers every JavaScript/JSX file under `resources/js`, every Blade template under `resources/views` and every stylesheet under `resources`, then checks semantic RAD palette utilities, arbitrary hex utility colors, removed component classes, CSS selector boundaries, token-backed inline colors and the Blade first-paint skeleton motion contract. New files in those trees are included automatically. This is static source coverage—not a substitute for rendered visual review, responsive browser checks, automated accessibility scans or manual keyboard/screen-reader testing.

> **Safety and permission:** Follow the repository's `AGENTS.md` contract. Do not run tests, lint, builds, browser automation, migrations, seeders or CI unless the project owner has explicitly authorized that verification. The commands below are instructions, not evidence that they have been run.

## 1. Choose what to run

| What changed / what you want to check | Start with |
|---|---|
| Pure PHP/domain helper | npm run test:unit |
| Laravel route, controller, validation, auth or permissions | npm run test:feature |
| Database constraint, storage, transaction or rollback | npm run test:integration |
| React component, hook, utility or frontend state contract | npm run test:frontend |
| User-visible journey, navigation, keyboard, responsive or RTL behavior | Focused Playwright test |
| Test runner, JUnit output or quality report | npm run test:reporting, then npm run test:report |

Backend and frontend suites are separate commands. There is no composite npm test or verify alias; choose the smallest relevant suite and add lint/build commands separately when authorized.

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
   - Caddy for the normal HTTPS development command.

3. For browser tests, install the Python test requirement and Chromium browser:

   ```bash
   python -m pip install -r requirements-test.txt
   python -m playwright install chromium
   ```

   If your machine uses `python3` rather than `python`, use `python3 -m pip` and `python3 -m playwright` for these installation commands. The browser runner uses the Python interpreter available to the project scripts; make sure Playwright is installed into that same environment.

Do not run `npm run db:fresh` as a general test setup step. It drops tables in the database configured for the regular app. PHPUnit uses its own in-memory SQLite database, and Playwright has a separate isolated database.

### Development configuration preflight

Run `npm run dev:check` to validate configuration without starting services. The normal `npm run dev` command performs the same check before opening services. It rejects production mode, disabled debug output, a missing or malformed application key, unsupported database drivers, remote/shared database targets without an explicit one-command opt-in, missing dependencies and a leftover `public/hot` file. It does not modify `.env`, clear caches, run migrations or touch database contents. The pure validation rules are covered by `tests/js/devEnvironment.test.js` and run as part of `npm run test:frontend`.

For a remote development database, set `RAD_ALLOW_REMOTE_DEV_DATABASE=true` in the shell for that invocation only, and only after confirming the target is a dedicated development database. The preflight cannot determine database ownership or prove that a remote database is safe.

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

Browser tests exercise real user journeys in Chromium. They may create, update or delete test records and must use the disposable local browser-test environment.

### Single-command lifecycle

Stop the normal npm run dev process, then run npm run test:browser from the repository root. The command:

1. Creates database/browser-testing.sqlite if absent and verifies it is a regular file.
2. Resets only browser-test storage directories.
3. Runs migrate:fresh --seed against the isolated browser SQLite database.
4. Starts temporary Laravel on 127.0.0.1:8000 and Vite on 127.0.0.1:5173.
5. Waits for the API health endpoint to confirm browser_test_ready=true and for Vite to respond.
6. Runs the Playwright suite (or the selected unittest ID), then stops both temporary services.

The Playwright app is a temporary test process, not a second development server. No separate browser:prepare, dev:browser or Caddy browser configuration is needed. The temporary app is loopback-only and is not exposed to LAN devices. Stop npm run dev first because the test workflow uses the same local Laravel/Vite ports.

Run one test method by appending its Python unittest ID after --:
  npm run test:browser -- test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications

### Browser safety rules

- Do not run the Python browser runner directly. Use npm run test:browser; its guard verifies the target is localhost and that the app reports browser_test_ready=true.
- Do not change RAD_ART_BASE_URL to a staging or production host. Remote targets are intentionally rejected.
- Do not point browser tests at database/database.sqlite, your normal development database, or any shared database.
- Each run resets only the dedicated browser-test SQLite database and storage. It does not reset the normal development database.
- If the health or Vite readiness check fails, fix the local test setup; do not weaken or bypass the preflight guard.

### Browser diagnostics

Each run refreshes these files under build/test-reports/:

- browser-junit.xml — JUnit test counts and per-test results.
- browser-run.log — terminal output and full Python unittest tracebacks.
- browser-debug.json — Python/platform/Playwright metadata, selected tests, timings and structured failures.
- browser-artifacts/ — failure screenshots, Playwright traces and per-test debug data.

To inspect a captured trace, use python -m playwright show-trace with the exact trace.zip path reported by the runner.

## 6. Run the test suites and reports

Run the backend suites with npm run test:backend, or choose one of npm run test:unit, npm run test:feature and npm run test:integration. Run frontend tests with npm run test:frontend. Run browser journeys with npm run test:browser; its temporary app is started and stopped by that command.

Lint and production builds are separate commands: npm run lint, npm run lint:fix, npm run production and npm run build:cpanel. They are not bundled into a verify alias. Follow AGENTS.md and obtain explicit authorization before running any verification.

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
5. **Expand to the affected suite.** Then run the relevant backend, frontend or browser suite when the change crosses layers or has broader regression risk.
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
