---
name: quality-engineering
description: Design, implement or review Rademan backend, frontend, browser, accessibility, performance and quality-reporting systems.
---

# Rademan Quality Engineering

## First inspect
1. Read `AGENTS.md` and the current test scripts/configuration before changing the suite.
2. Confirm actual installed versions in package manifests and lockfiles.
3. Inventory existing backend, frontend and browser coverage. Extend existing tools before adding dependencies or parallel frameworks.
4. Trace test entrypoints through `scripts/project.mjs`, `package.json`, `composer.json`, `phpunit.xml` and browser configuration.

## Test architecture
- Use focused unit tests for pure domain logic and utilities.
- Use Laravel feature tests for HTTP contracts, validation, authentication, authorization and persistence.
- Use integration tests for database constraints, storage, transactions and external boundaries.
- Use the existing Node test runner and React SSR/Vite component coverage for frontend logic and primitive contracts.
- Use Playwright for real browser journeys, role boundaries, responsive behavior and user-visible accessibility.
- Keep assertions observable and resilient. Prefer accessible roles/names and user outcomes over brittle CSS selectors or implementation details.
- Include failure, empty, loading, disabled, unauthorized and boundary cases where relevant.
- Do not duplicate a check across layers without a clear reason.

## Feature-change coverage contract

For every feature, bug fix or improvement, derive tests from the changed behavior and risk rather than adding tests mechanically:

1. Identify the affected actor, user-visible journey, API/resource contract, state transition and security/data-integrity boundary.
2. Select the test layers that match the changed boundaries: Unit for deterministic pure logic; Feature for HTTP validation, authorization, response shape and persisted outcomes; Integration for database, storage, transaction, queue or external-boundary invariants; and frontend tests for React state/rendering contracts. Do not force every feature through every layer.
3. Add or update a Playwright journey when the change affects navigation, interaction, responsive/RTL behavior, keyboard/accessibility, cross-role behavior or an end-to-end recovery path. Prefer one meaningful journey with a strong failure/retry assertion over duplicating every backend permutation in the browser.
4. Cover relevant negative paths: unauthorized actor, wrong owner/participant, invalid transition, empty/loading/error/retry, duplicate submission, stale state and failure recovery. Select only cases that apply to the changed behavior.
5. Update `tests/QUALITY-MATRIX.md` when the supported journey, actor boundary or known coverage gap changes. Keep its statements explicit about what is covered versus still missing.
6. Name tests after the actor and observable invariant. Assert both the user-visible/API outcome and that forbidden or failed operations did not mutate protected state.
7. Do not add a browser test for an internal-only refactor unless it changes observable behavior or integration risk. Do not target arbitrary 100% line coverage.

When adding or changing a test command, report, fixture or diagnostic artifact, add focused tests for the tooling itself and update package scripts, `scripts/README.md` and `tests/README.md` as appropriate. Keep the report generator dependency-free and distinguish missing/stale evidence from a passing result.

## Batch verification handoff

For an explicitly authorized batch, plan verification across the combined changed surface and ask the maintainer to run it once at the end:
- Build one consolidated command list from the actual changed files and existing project scripts; group backend PHPUnit/Pint, frontend Node tests/lint/build and Playwright only where those boundaries changed.
- Do not mechanically run every suite for every task. Select checks by changed boundary and risk, and deduplicate overlapping commands.
- Include the exact Playwright command only when navigation, interaction, responsive/RTL, keyboard/accessibility or end-to-end recovery behavior changed. State the configured MySQL/MariaDB persistence risk.
- State which checks are intentionally not applicable and why. Never imply that a backend-only change needs Playwright or that a React-only presentation change needs PHPUnit without a backend contract impact.
- The assistant must not execute the consolidated commands unless the user separately authorizes those exact checks. Batch implementation authorization is not verification authorization.
- Report the maintainer's combined results against each PR/issue and identify any failure that blocks the batch approval.

## Reporting and release evidence
- Generate the cross-suite report with `npm run test:report`; it reads existing JUnit files and Git metadata but does not run verification.
- Run its focused unit tests with `npm run test:reporting`.
- Treat CURRENT as a clean-worktree report generated at or after HEAD, STALE as invalid/older/unverifiable evidence, and MISSING as no result. Never infer that an unreported suite passed.
- Track lint/static analysis, builds, automated accessibility scans, manual keyboard/screen-reader and visual review, and reproducible performance evidence separately from test results.

## Determinism and isolation

- Backend PHPUnit tests use the isolated bootstrap, in-memory SQLite, array cache/session/mail, sync queue, stderr logging and isolated file storage/view paths.
- **Playwright is stateful and uses the already-running local development application and that application's configured MySQL/MariaDB database. It does not create or use a separate SQLite test database.** Browser journeys can create or mutate persistent records in that database.
- Before running Playwright, inspect the effective `.env` target and confirm it is a dedicated, disposable or safely backed-up development database. Never target production, staging, or a database containing important user data. A localhost tunnel does not prove that the underlying database is a development database.
- The `test:browser` runner performs environment checks and requires the local/development application environment and MySQL connection; it does not reset or isolate the database, application storage, cache, sessions or views.
- The browser runner attaches to the already-running app. Start the normal local app using the documented `npm run dev` workflow; there are no `browser:prepare` or `dev:browser` package scripts in the current `package.json`.
- The runner does not start services, run migrations or seeders, or reset the database/storage. Test-created records may remain after the run; review and clean up only known test records using the project's documented safe procedures.
- The runner writes browser test reports/diagnostics under `build/test-reports/browser` by default. Do not assume this makes application data isolated.
- Use unique test identities and deterministic fixtures. Keep seeded demo data repeatable and separate from transient test data.
- Remove only known test-specific stale caches and reports. Never flush a developer's general cache or storage.

## Reporting and commands
- Keep backend, frontend and browser JUnit reports under `build/test-reports/`.
- Delete a report before its run so stale results cannot be mistaken for current output.
- Public test commands are declared in `package.json` and dispatched by `scripts/project.mjs`; keep documentation synchronized with both.
- Distinguish tests, lint, builds, accessibility audits, performance audits and static analysis; do not imply one substitutes for another.

## Accessibility, product and performance
- Preserve Persian-first RTL and test mixed-direction content, keyboard navigation, focus visibility, accessible names, semantic landmarks, reduced motion and responsive overflow.
- Check the new semantic tokens, typography, spacing, component states and semantic color contrast in both light and dark themes. Retain only the five Rademan brand color anchors; do not assume legacy RAD tokens are target requirements.
- Add automated accessibility checks as a supplement to manual assistive-technology and keyboard review; do not claim automated scans prove WCAG conformance.
- Add Lighthouse/Core Web Vitals budgets only after establishing a reproducible local production-like target, fixed viewport/device/network profile and repeatable data.
- Avoid flaky hard timing assertions. Prefer budgets and stable measurements with recorded context.

## Safe repair policy
- Offer opt-in automatic repair only for deterministic formatting and lint fixes.
- Never automatically rewrite business logic, authorization, migrations, accessibility behavior, visual design or test expectations to make a suite green.
- Never delete, skip or weaken a failing test without equivalent or stronger coverage and an explained reason.

## Permission boundary
- Follow `AGENTS.md`. Never execute tests, lint, builds, browser automation, Lighthouse, scanners, migrations, seeders or verification unless explicitly authorized.
- Never dispatch, rerun or otherwise initiate GitHub Actions without explicit permission for the specific workflow/run.
- Adding or editing test code is not permission to execute it. Report unexecuted verification honestly.
- Do not add dependencies without a concrete need, compatibility review and user authorization where required.
