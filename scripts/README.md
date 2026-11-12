# NPM and project scripts reference

This document covers every root `package.json` script, every task handled by
`scripts/project.mjs`, and the Composer scripts in `composer.json`.

Run commands from the repository root. Prefer the npm aliases: they provide a
consistent cross-platform entry point.

## Ordering convention

The `scripts` object in `package.json` is intentionally grouped in this order:

1. Setup
2. Development servers
3. Database operations
4. Focused tests and browser-test lifecycle
5. Combined verification
6. Lint and style repair
7. Accessibility-focused test
8. Asset builds
9. Production cache maintenance

Keep new entries in their matching group and keep this guide synchronized. Related
aliases are adjacent to their underlying workflows. JSON does not support comments,
so this guide provides the section labels.

## Quick start

| Goal | Command |
|---|---|
| Install dependencies and create local environment file | `npm run setup` |
| Start local HTTP development | `npm run dev` |
| Start local HTTPS development | `npm run dev:https` |
| Apply local database migrations | `npm run db:migrate` |
| Run backend and frontend tests | `npm test` |
| Run backend + frontend quality workflow | `npm run verify` |
| Build production assets | `npm run build` |

## Setup

| npm script | Implementation | Description |
|---|---|---|
| `setup` | `project.mjs setup` | Creates `.env` from `.env.example` if missing, installs Composer and npm dependencies, and generates an application key only when missing. Review `.env` before using the app. |

## Development

| npm script | Implementation | Description |
|---|---|---|
| `dev` | `project.mjs dev` | Starts Laravel and Vite over local HTTP. |
| `dev:https` | `project.mjs dev:https` | Starts Laravel, Vite HTTPS mode and Caddy at `https://rad.localhost`. Requires Caddy and trusted local certificates. |
| `dev:local` | Alias of `dev:https` | Compatibility alias for the HTTPS local stack. |
| `dev:browser` | `project.mjs dev:browser` | Starts Laravel, Vite and Caddy using the isolated browser-test database and storage. Requires `browser:prepare`. |
| `preview` | Direct Artisan server command | Starts Laravel's PHP server at `127.0.0.1:8000`; does not start Vite. |

## Database operations

Review the active `.env` database configuration before using these commands.

| npm script | Implementation | Description / caution |
|---|---|---|
| `db:sqlite:init` | `project.mjs db:sqlite:init` | Creates `database/database.sqlite` only if absent; leaves an existing file unchanged. |
| `db:status` | Direct Artisan command | Displays migration status. |
| `db:migrate` | `project.mjs db:migrate` | Applies pending migrations to the configured database. |
| `db:seed` | `project.mjs db:seed` | Runs `DatabaseSeeder`; writes seed data. |
| `db:seed:demo` | `project.mjs db:seed:demo` | Runs `DemoDatabaseSeeder`; writes demo data. |
| `db:fresh` | `project.mjs db:fresh` | **Destructive:** drops every table, then migrates and seeds the configured database. |
| `browser:prepare` | `project.mjs browser:prepare` | **Destructive only to isolated browser-test data:** rebuilds `database/browser-testing.sqlite`, resets isolated browser storage/runtime, then migrates and seeds. Stop `dev:browser` first. |

Never use the browser-test environment with a personal, staging or production database.

## Focused test commands

All commands in this section execute tests. Execute them only when explicitly
authorized. Backend tests use isolated in-memory SQLite. Browser tests use a
separate persistent SQLite database and isolated storage.

| npm script | Dispatcher task | Description |
|---|---|---|
| `test` | `test` | Runs backend PHPUnit tests followed by frontend Node tests. |
| `test:backend` | `backend:test` | Runs all PHPUnit suites with isolated in-memory SQLite. |
| `test:unit` | `unit` | Runs the PHPUnit Unit suite. |
| `test:feature` | `feature` | Runs the PHPUnit Feature suite. |
| `test:integration` | `integration` | Runs the PHPUnit Integration suite. |
| `test:frontend` | `frontend:test` | Runs `tests/js/*.test.js` with Node's test runner. |
| `test:browser` | `browser` | Runs guarded Playwright tests against `RAD_ART_BASE_URL`. Requires the prepared and running isolated browser app. |

### Browser-test lifecycle

1. Stop any running `dev:browser` process.
2. Run `npm run browser:prepare` to recreate the dedicated database and isolated runtime.
3. Run `npm run dev:browser` in a dedicated terminal and leave it running.
4. In a second terminal, run `npm run test:browser` when browser-test execution is authorized.
5. Stop the browser development stack with Ctrl+C.

The browser runner restricts targets to local hosts and checks the health endpoint's
browser-test readiness flag. Do not use `db:fresh` as a substitute for
`browser:prepare`.

## Combined quality workflows

These commands run tests, lint and/or production builds; they are not passive status
checks. Use the narrowest suitable workflow.

| npm script | Dispatcher task | Workflow |
|---|---|---|
| `verify:backend` | `backend` | Backend PHPUnit tests, then PHP Pint check. |
| `verify:frontend` | `frontend` | Frontend tests, ESLint and both production builds. |
| `verify` | `verify` | Backend workflow followed by frontend workflow. Does not run Playwright. |
| `verify:all` | `verify:all` | `verify` plus Playwright; requires the prepared/running browser environment. |
| `test:quality` | Alias of `verify` | Compatibility alias. |
| `test:quality:backend` | Alias of `verify:backend` | Compatibility alias. |
| `test:quality:frontend` | Alias of `verify:frontend` | Compatibility alias. |
| `test:quality:browser` | Alias of `test:browser` | Compatibility alias. |
| `test:quality:all` | Alias of `verify:all` | Compatibility alias. |

## Lint, repair and accessibility test

| npm script | Implementation | Description |
|---|---|---|
| `lint` | Direct ESLint command | Checks `resources/js`; warnings are errors. |
| `lint:fix` | Direct ESLint command | Applies ESLint autofixes; review modified source. |
| `fix:style` | `project.mjs fix:style` | Runs Pint fixer then ESLint autofix. Intended for deterministic style changes only; review the diff. |
| `a11y:colors` | Direct Node test command | Runs the focused color-accessibility test file. Executes a test. |

## Builds

| npm script | Implementation | Description |
|---|---|---|
| `build` | Direct Vite command | Creates the standard production asset build. |
| `build:cpanel` | Direct Vite command | Creates the cPanel-targeted build using `vite.config.cpanel.js`. |

## Production cache maintenance

| npm script | Dispatcher task | Description / caution |
|---|---|---|
| `prod:optimize` | `project.mjs prod:optimize` | Runs Laravel `optimize` to cache config, routes, events and views. |
| `prod:clear` | `project.mjs prod:clear` | Runs Laravel `optimize:clear`; clears optimization caches and can affect a live deployment. |

Use production cache commands only in the intended environment and deployment
procedure.

## Project dispatcher task reference

Most multi-step or environment-sensitive npm scripts delegate to
`node scripts/project.mjs <task>`.

| Dispatcher task | Called by |
|---|---|
| `setup` | `npm run setup` |
| `dev`, `dev:https`, `dev:local` | Development scripts |
| `db:sqlite:init`, `db:migrate`, `db:seed`, `db:seed:demo`, `db:fresh` | Database scripts |
| `test`, `backend:test`, `unit`, `feature`, `integration`, `frontend:test`, `browser` | Test scripts |
| `browser:prepare`, `dev:browser` | Browser lifecycle scripts |
| `backend`, `frontend`, `verify`, `verify:all` | Combined quality scripts |
| `fix:style` | Style repair script |
| `build`, `build:cpanel` | Build scripts |
| `prod:optimize`, `prod:clear` | Production cache scripts |
| `--help` / `-h` | Prints dispatcher help |

Run `node scripts/project.mjs --help` for the concise task summary.

## Composer scripts

These are defined in `composer.json`, separately from npm:

| Composer command | Description |
|---|---|
| `composer test` | Runs PHPUnit using the isolated `tests/bootstrap.php` bootstrap. |
| `composer lint` | Runs Laravel Pint in check-only mode. |
| `composer lint:fix` | Applies Laravel Pint formatting fixes. |

## JUnit reports

| Report file | Producer |
|---|---|
| `build/test-reports/backend-junit.xml` | Backend test command / backend verification |
| `build/test-reports/unit-junit.xml` | Unit suite |
| `build/test-reports/feature-junit.xml` | Feature suite |
| `build/test-reports/integration-junit.xml` | Integration suite |
| `build/test-reports/frontend-junit.xml` | Frontend tests / frontend verification |
| `build/test-reports/browser-junit.xml` | Browser runner |

Reports are generated artifacts. Do not commit them unless they are explicitly required
as project deliverables.

## Maintenance conventions

- Put new npm scripts in the matching group in `package.json`.
- Use `dev:`, `db:`, `test:`, `verify:`, `build` and `prod:` consistently.
- Keep direct one-command tools direct when no shared environment handling is needed.
- Put multi-step or environment-sensitive orchestration in `scripts/project.mjs`.
- Update this guide and the dispatcher's help text when adding or changing tasks.
- Do not silently add tests, builds, migrations, seeders or cache mutation to automatic
  editor tasks.
