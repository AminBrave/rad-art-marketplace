# NPM Scripts Reference

This file documents every command exposed by the root `package.json` `scripts` object.
Run commands from the repository root with `npm run <script>`.

The `package.json` entries are ordered by workflow: setup, development, database,
quality, build and production. Keep new scripts in the relevant group and keep this
reference and the `scripts/project.mjs` help output in sync.

## Quick start

| Goal | Command |
|---|---|
| Install/configure project dependencies | `npm run setup` |
| Start local HTTP development | `npm run dev` |
| Start local HTTPS development | `npm run dev:https` |
| Apply database migrations | `npm run db:migrate` |
| Run backend and frontend tests | `npm run test` |
| Run the full non-browser quality workflow | `npm run verify` |
| Build production assets | `npm run build` |

## Setup

| Script | What it does |
|---|---|
| `setup` | Creates `.env` from `.env.example` if needed, installs Composer and npm dependencies, and generates an application key only when missing. Review `.env` before using the application. |

## Development

| Script | What it does |
|---|---|
| `dev` | Starts Laravel and Vite over local HTTP. |
| `dev:https` | Starts Laravel, Vite HTTPS mode and Caddy for `https://rad.localhost`. Caddy must be installed and its local certificate trusted. |
| `dev:local` | Alias for `dev:https`. |
| `preview` | Starts Laravel's PHP development server at `http://127.0.0.1:8000`; it does not start Vite. |

## Database

Review the active `.env` database settings before running database commands.

| Script | What it does | Caution |
|---|---|---|
| `db:sqlite:init` | Creates `database/database.sqlite` only if it does not already exist. | Existing database is left unchanged. |
| `db:status` | Runs Laravel's `migrate:status` command directly. | Reads the configured database. |
| `db:migrate` | Applies pending migrations through the project runner. | Changes the configured database schema. |
| `db:seed` | Runs `DatabaseSeeder`. | Inserts seed data into the configured database. |
| `db:seed:demo` | Runs `DemoDatabaseSeeder`. | Inserts demo data into the configured database. |
| `db:fresh` | Runs `migrate:fresh --seed`. | **Destructive:** drops all tables in the configured database before rebuilding and seeding it. |

## Quality: tests

These commands execute tests. Run them only when execution has been explicitly authorized.
Backend PHPUnit commands use the isolated in-memory SQLite test environment. Browser tests
use a separate persistent SQLite database and isolated storage.

| Script | What it does |
|---|---|
| `test` | Runs backend PHPUnit tests followed by frontend Node tests. |
| `test:backend` | Runs the complete backend PHPUnit suite with isolated in-memory SQLite. |
| `test:unit` | Runs only the PHPUnit Unit suite. |
| `test:feature` | Runs only the PHPUnit Feature suite. |
| `test:integration` | Runs only the PHPUnit Integration suite. |
| `test:frontend` | Runs the frontend Node test files and writes `build/test-reports/frontend-junit.xml`. |
| `test:browser` | Runs the guarded Playwright suite against `RAD_ART_BASE_URL` (defaults are defined in browser test configuration). |
| `browser:prepare` | Rebuilds and seeds only `database/browser-testing.sqlite` and the isolated browser-test runtime. | **Destructive to browser-test data only.** Stop `dev:browser` first. Never point this environment at a normal, staging or production database. |
| `dev:browser` | Starts Laravel, Vite and Caddy against the prepared isolated browser-test environment at `https://rad.localhost`. | Requires a successful `browser:prepare`; keeps the browser-test database and uploaded fixtures separate from normal development data. |

### Browser-test sequence

1. Stop any running `dev:browser` process.
2. Run `npm run browser:prepare` to rebuild the isolated browser-test database and fixtures.
3. Run `npm run dev:browser` in a dedicated terminal and leave it running.
4. In another terminal, run `npm run test:browser` when browser execution is authorized.

Do not use `db:fresh` as a substitute for `browser:prepare`.

## Quality: accessibility, lint and repair

| Script | What it does |
|---|---|
| `a11y:colors` | Runs the focused color-accessibility Node test file. |
| `lint` | Runs ESLint against `resources/js` with warnings treated as errors. |
| `lint:fix` | Runs ESLint autofixes against `resources/js`. Review the resulting diff. |
| `fix:style` | Runs PHP Pint fixes and ESLint autofixes through the project runner. Intended for deterministic style repairs only; review the resulting diff. |

## Quality: combined verification

These are broader workflows. They execute tests and/or lint/build commands; they are not
documentation-only or dry-run commands.

| Script | What it does |
|---|---|
| `verify:backend` | Backend PHPUnit suite followed by PHP Pint style checks. |
| `verify:frontend` | Frontend Node tests, ESLint and both production builds. |
| `verify` | Runs backend and frontend quality workflows. Does not run Playwright. |
| `verify:all` | Runs `verify` and then the guarded Playwright suite against the prepared browser-test app. |

### Compatibility aliases

The `test:quality*` scripts are retained for compatibility with existing local workflows.
Prefer the shorter `verify*` names for new documentation and automation.

| Script | Equivalent workflow |
|---|---|
| `test:quality` | `verify` |
| `test:quality:backend` | `verify:backend` |
| `test:quality:frontend` | `verify:frontend` |
| `test:quality:browser` | `test:browser` |
| `test:quality:all` | `verify:all` |

## Build

| Script | What it does |
|---|---|
| `build` | Creates the standard Vite production build. |
| `build:cpanel` | Creates the cPanel-targeted Vite production build using `vite.config.cpanel.js`. |

## Production maintenance

| Script | What it does | Caution |
|---|---|---|
| `prod:optimize` | Runs Laravel's `optimize` command to cache configuration, routes, events and views. | Changes generated Laravel cache files. |
| `prod:clear` | Runs Laravel's `optimize:clear` command. | Clears Laravel optimization caches; do not run against a live environment without an operational plan. |

## Script ownership and conventions

- Prefer adding new task implementations to `scripts/project.mjs` when they need shared
  environment setup, cross-platform process handling or a multi-step workflow.
- Keep simple one-command tools as direct npm scripts when no shared setup is needed
  (for example, `lint`, `build` and `db:status`).
- Use consistent prefixes: `dev:` for development environments, `db:` for database
  operations, `test:` for focused test execution, `verify:` for combined quality
  workflows, `build` for asset builds and `prod:` for production maintenance.
- Keep related entries adjacent in `package.json` so the manifest remains easy to scan
  in editors and script explorers.
- When changing a script, update this reference and the `scripts/project.mjs` usage
  output when applicable.
- Do not add scripts that run tests, builds, migrations, seeders, cache clearing or
  other side-effecting checks to automatic editor tasks without explicit approval.
