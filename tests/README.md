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

The npm database commands (`db:status`, `db:migrate`, `db:seed`, `db:seed:demo`, `db:fresh` and `db:export:cpanel`) all run the same local environment/database preflight and use isolated Laravel optimization-cache paths. The export command additionally requires MySQL and `mysqldump`; it writes the current database, including every row, to a gzip-compressed SQL file in a web-denied subfolder of `public/build`. This does not make `npm run db:fresh` safe for important data: it still drops all tables in the configured development database, so do not use it as a general test setup step. PHPUnit uses its own in-memory SQLite database. Playwright does not create or use a separate database; it always exercises the already-running development app and that app's configured MySQL/MariaDB database.

### Development configuration preflight

Run `npm run dev:check` to validate configuration without starting services. The normal `npm run dev` command performs the same check before opening services. It rejects production mode, disabled debug output, a missing or malformed application key, unsupported database drivers, remote/shared database targets without an explicit one-command opt-in, missing dependencies and a leftover `public/hot` file. It does not modify `.env`, clear caches, run migrations or touch database contents. The dev launcher bypasses Laravel config/route/event optimization-cache paths without deleting files; it leaves application cache, sessions and Composer-managed package manifests alone. A production database tunneled through localhost cannot be distinguished from a local database, so never use a production tunnel for development. The pure validation rules are covered by `tests/js/devEnvironment.test.js` and run as part of `npm run test:frontend`.

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


### What frontend component tests prove

`tests/js/reactComponents.test.js` loads the real JSX modules through the repository's Vite React plugin and renders them with React's server renderer. It covers stable markup contracts such as:

- button disabled/busy semantics, icon-button names and semantic badge states;
- heading hierarchy, page containers, surfaces, navigable metric cards and form label/error relationships;
- native form-control semantics and labelled search landmarks;
- feedback roles/live-region intent, upload progress bounds, skeleton announcements and image fallback/priority attributes;
- breadcrumb current-page state, pagination boundaries and tab roles/selection.

`tests/js/queryClient.test.js` also exercises a real isolated TanStack QueryClient: transient query retry and recovery, non-retryable validation failures, fresh-cache reuse, and mutation pending/success/error outcomes. The test client is cleared after each case so query and mutation state cannot leak between tests.

These are server-rendered contracts. They do **not** prove browser focus behavior, keyboard activation, responsive layout, live assistive-technology announcements or actual image events. Those require browser or manual evidence.

The existing browser suite provides that separate layer for selected journeys. In particular, `test_artwork_catalogue_resilience.py` checks a successfully loaded image, a failed image request falling back to an accessible placeholder, an artwork with no image source, a changed image URL replacing stale loaded media, and mixed Persian/Latin artwork and artist text at a narrow mobile viewport. Keep these tests focused on user-visible outcomes rather than asserting component CSS implementation details.

The source-level design-system and mutation-architecture tests intentionally inspect source because they enforce repository-wide conventions (token usage, removed selectors and mutation declarations). Do not use those checks as evidence that a user interaction or rendered layout works.

## 5. Run browser tests (Playwright)

Browser tests exercise real user journeys in Chromium. There is one mode only: Playwright attaches to the already-running local development app and uses the app's existing `.env` and MySQL/MariaDB database. It never starts another app or creates, switches, resets, or seeds a browser-test database.

### Current development app and MySQL/MariaDB

Start your usual local app first with `npm run dev` and keep it running. Open a second terminal and list the available tests:

```powershell
npm run test:browser -- --list
```

Run a GET-only smoke journey against the actual current development database (no API interception or writes):

```powershell
npm run test:browser -- test_artwork_catalogue_resilience.CurrentDevelopmentDatabaseReadOnlyTests.test_public_artwork_catalogue_renders_from_current_development_data
```

This reads the public artwork catalogue through the running Laravel app and therefore exercises its configured MySQL/MariaDB connection. It does not create or modify records.

Run one API-mocked resilience method by its ID (copy the exact ID from the list):

```powershell
npm run test:browser -- test_artwork_catalogue_resilience.ArtworkCatalogueResilienceTests.test_artwork_catalogue_error_can_be_retried_into_results
```

You can pass multiple test IDs to run a selected subset. The default target is `https://rad.localhost`; set `RAD_ART_BASE_URL` only to another loopback or `.localhost` origin. The runner requires `.env` to select MySQL/MariaDB and leaves the app's existing environment and database connection untouched. It does not start or stop services, change environment variables for the Laravel process, invoke Artisan, migrate, seed, reset storage, or clean application records.

Only tests explicitly marked manual-safe may run by default. A marker is allowed for either an API-mocked test with no persistent-record dependency or a reviewed GET-only test that reads current development data without writes. Other tests are labelled as requiring `--allow-mutations`; inspect their setup/teardown and use a dedicated test identity before opting in. The flag does not make arbitrary existing data safe. Running the complete browser suite requires both `--all` and `--allow-mutations`:

```powershell
npm run test:browser -- --all --allow-mutations
```

Playwright diagnostics are written under `build/test-reports/browser/`.


### Browser safety rules

- Use only `npm run test:browser`; it attaches to the already-running development app and retains strict local-target guards.
- Never target staging or production. Remote hosts are intentionally rejected.
- The Playwright runner never creates or uses a separate database and never resets application storage.
- The runner uses the app's existing `.env` MySQL/MariaDB connection and never resets or seeds it. Run only marked read-only/API-mocked tests by default; explicitly review and opt into any mutating test.
- If the app health check fails, start or repair the normal local development app; do not weaken or bypass the preflight guard.

### Browser diagnostics

Each run refreshes these files under build/test-reports/:

- browser-junit.xml — JUnit test counts and per-test results.
- browser-run.log — terminal output and full Python unittest tracebacks.
- browser-debug.json — Python/platform/Playwright metadata, selected tests, timings and structured failures.
- browser-artifacts/ — failure screenshots, Playwright traces and per-test debug data.

To inspect a captured trace, use python -m playwright show-trace with the exact trace.zip path reported by the runner.

## 6. Run the test suites and reports

Run the backend suites with npm run test:backend, or choose one of npm run test:unit, npm run test:feature and npm run test:integration. Run frontend tests with npm run test:frontend. Run selected Playwright journeys against the already-running local MySQL/MariaDB development app with `npm run test:browser -- --list`, then pass one or more discovered test IDs.

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

This runs focused Python unit tests for report parsing/freshness classification and manual Playwright selection safety (`tests/python/test_browser_runner.py`). It is not a product behavior suite.

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
6. **Run browser journeys when user-observable behavior changes.** Use the current-development Playwright workflow in section 5.
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
