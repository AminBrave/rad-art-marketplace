---
name: quality-engineering
description: Design, implement or maintain Rademan's backend, frontend, browser, accessibility, performance and quality-reporting systems.
---

# Rademan Quality Engineering

## First inspect
1. Read AGENTS.md and the current test scripts/configuration before changing the suite.
2. Confirm actual installed versions in package manifests and lockfiles.
3. Inventory existing backend, frontend and browser coverage. Extend existing tools before adding dependencies or parallel frameworks.
4. Trace test entrypoints through scripts/project.mjs, package.json, composer.json, phpunit.xml and browser configuration.

## Test architecture
- Use focused unit tests for pure domain logic and utilities.
- Use Laravel feature tests for HTTP contracts, validation, authentication, authorization and persistence.
- Use integration tests for database constraints, storage, transactions and external boundaries.
- Use existing Node test runner and React SSR/Vite component coverage for frontend logic and primitive contracts.
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
5. Update tests/QUALITY-MATRIX.md when the supported journey, actor boundary or known coverage gap changes. Keep its statements explicit about what is covered versus still missing.
6. Name tests after the actor and observable invariant. Assert both the user-visible/API outcome and that forbidden or failed operations did not mutate protected state.
7. Do not add a browser test for an internal-only refactor unless it changes observable behavior or integration risk. Do not target arbitrary 100% line coverage.

When adding or changing a test command, report, fixture or diagnostic artifact, add focused tests for the tooling itself and update package scripts, scripts/README.md and tests/README.md as appropriate. Keep the report generator dependency-free and distinguish missing/stale evidence from a passing result.

## Reporting and release evidence
- Generate the cross-suite report with `npm run test:report`; it reads existing JUnit files and Git metadata but does not run verification.
- Run its focused unit tests with `npm run test:reporting`.
- Treat CURRENT as a clean-worktree report generated at or after HEAD, STALE as invalid/older/unverifiable evidence, and MISSING as no result. Never infer that an unreported suite passed.
- Track lint/static analysis, builds, automated accessibility scans, manual keyboard/screen-reader and visual review, and reproducible performance evidence separately from test results.

## Determinism and isolation
- Backend PHPUnit tests must use the isolated bootstrap, in-memory SQLite, array cache/session/mail, sync queue, stderr logging and isolated file storage/view paths.
- Browser tests are stateful and mutate records. They must use only database/browser-testing.sqlite and the isolated browser-test storage/cache/session/view directories. The guarded runner automatically captures console/page errors, API request/response metadata, screenshots and Playwright traces for browser contexts created during a failing test; passing-test temporary artifacts are discarded. Keep explicit diagnostics only when a test needs a focused event timeline or custom failure context.
- Prepare browser data only through npm run browser:prepare; start the isolated app only through npm run dev:browser.
- Browser preflight must reject remote targets and verify the app reports browser_test_ready=true. Never weaken this guard to make a run pass.
- Never point browser tests at a normal developer database or production/staging.
- Use unique test identities and deterministic fixtures. Keep seeded demo data repeatable and separate from transient test data.
- Remove only known test-specific stale caches and reports. Never flush a developer's general cache or storage.

## Reporting and commands
- Keep backend, frontend and browser JUnit reports under build/test-reports/.
- Delete a report before its run so stale results cannot be mistaken for current output.
- Keep focused commands available for unit, feature, integration, frontend and browser scopes.
- Keep the unified runner in sync with package.json and composer.json.
- Distinguish tests, lint, builds, accessibility audits, performance audits and static analysis; do not imply one substitutes for another.

## Accessibility, product and performance
- Preserve Persian-first RTL and test mixed-direction content, keyboard navigation, focus visibility, accessible names, semantic landmarks, reduced motion and responsive overflow.
- Check shared RAD tokens, typography, spacing, component states and semantic color contrast.
- Add automated accessibility checks as a supplement to manual assistive-technology and keyboard review; do not claim automated scans prove WCAG conformance.
- Add Lighthouse/Core Web Vitals budgets only after establishing a reproducible local production-like target, fixed viewport/device/network profile and repeatable data.
- Avoid flaky hard timing assertions. Prefer budgets and stable measurements with recorded context.

## Safe repair policy
- Offer opt-in automatic repair only for deterministic formatting and lint fixes.
- Never automatically rewrite business logic, authorization, migrations, accessibility behavior, visual design or test expectations to make a suite green.
- Never delete, skip or weaken a failing test without equivalent or stronger coverage and an explained reason.

## Permission boundary
- Follow AGENTS.md. Never execute tests, lint, builds, browser automation, Lighthouse, scanners, migrations, seeders or verification unless explicitly authorized.
- Never dispatch, rerun or otherwise initiate GitHub Actions without explicit permission for the specific workflow/run.
- Adding or editing test code is not permission to execute it. Report unexecuted verification honestly.
- Do not add dependencies without a concrete need, compatibility review and user authorization where required.
