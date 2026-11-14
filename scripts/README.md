# Project scripts

Run commands from the repository root. **Use the npm commands in `package.json` as the public interface.** Multi-step and environment-sensitive workflows are implemented by `scripts/project.mjs`; direct one-command tools remain in `package.json`.

## Principles

- One canonical command per workflow; do not add compatibility aliases without a concrete external consumer.
- Keep npm script names grouped by setup, development, database, tests, verification, lint, builds and production.
- Keep orchestration in `scripts/project.mjs`; keep direct Vite, ESLint and Artisan one-liners in `package.json`.
- Update this reference and dispatcher help whenever a task changes.
- Tests, lint, builds, migrations, seeders and cache mutation are opt-in. Follow `AGENTS.md`; never run them without explicit user authorization.

## AI context (read-only)

| Command | Purpose |
|---|---|
| `npm run ai:context -- --task "<task>"` | Print the project contract, brief, session handoff, only task-matched skills |


The context command reads `AGENTS.md`, the product brief, the current handoff and task-matched skill files. It does not install dependencies, execute application code, inspect the network or run verification. With no task description, no task-specific skills are loaded.

## Canonical npm commands

| Area | Command | Purpose |
|---|---|---|
| Setup | `npm run setup` | Install Composer/npm dependencies and create `.env` if absent |
| Development | `npm run dev` | Laravel + Vite over local HTTP |
| Development | `npm run dev:https` | Laravel + Vite + Caddy over local HTTPS |
| Development | `npm run dev:browser` | Start the isolated browser-test application, Vite and Caddy |
| Preview | `npm run preview` | Start Laravel's PHP preview server without Vite |
| Database | `npm run db:sqlite:init` | Create the local SQLite file only if absent |
| Database | `npm run db:status` | Show migration status |
| Database | `npm run db:migrate` | Apply pending migrations |
| Database | `npm run db:seed` | Run `DatabaseSeeder` |
| Database | `npm run db:seed:demo` | Run `DemoDatabaseSeeder` |
| Database | `npm run db:fresh` | **Destructive:** drop all configured database tables, migrate and seed |
| Tests | `npm test` | Backend PHPUnit + frontend Node tests |
| Tests | `npm run test:backend` | Backend PHPUnit tests using isolated in-memory SQLite |
| Tests | `npm run test:unit` | Unit PHPUnit suite |
| Tests | `npm run test:feature` | Feature PHPUnit suite |
| Tests | `npm run test:integration` | Integration PHPUnit suite |
| Tests | `npm run test:frontend` | Frontend Node tests |
| Browser | `npm run browser:prepare` | **Destructive to isolated browser-test data only:** rebuild browser SQLite and storage |
| Browser | `npm run test:browser` | Guarded Playwright tests against the configured local browser app |
| Browser | `npm run test:browser -- <unittest-name>` | Run one Playwright test by its Python unittest name |
| Verification | `npm run verify:backend` | Backend tests + PHP Pint check |
| Verification | `npm run verify:frontend` | Frontend tests + ESLint + standard and cPanel builds |
| Verification | `npm run verify` | Backend and frontend quality workflows |
| Verification | `npm run verify:all` | `verify` plus Playwright |
| Lint | `npm run lint` | ESLint check |
| Lint | `npm run lint:fix` | Apply ESLint autofixes |
| Style | `npm run fix:style` | Apply PHP Pint and ESLint fixes |
| Accessibility | `npm run a11y:colors` | Run focused color-accessibility tests |
| Build | `npm run build` | Standard Vite production build |
| Build | `npm run build:cpanel` | cPanel Vite production build |
| Production | `npm run prod:optimize` | Cache Laravel config, routes, events and views |
| Production | `npm run prod:clear` | Clear Laravel optimization caches |

## Browser-test lifecycle

1. Stop any existing `dev:browser` process.
2. Run `npm run browser:prepare` to recreate only `database/browser-testing.sqlite` and isolated browser-test runtime/storage.
3. Run `npm run dev:browser` in a dedicated terminal.
4. Run `npm run test:browser` in a second terminal, only when authorized. For one test, append its unittest name after `--` (example below).
5. Stop the development stack with Ctrl+C.

Focused example (PowerShell, CMD or Bash):

```bash
npm run test:browser -- test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications
```

The runner adds `tests/browser` to Python's import path, so direct `PYTHONPATH` setup is not needed. Each run refreshes these local reports under `build/test-reports/`:

- `browser-junit.xml` — CI-compatible test results.
- `browser-run.log` — terminal output and full unittest tracebacks.
- `browser-debug.json` — Python/platform/Playwright metadata, selected tests, timings and structured failures.
- `browser-artifacts/<test-name>/<run-id>/failure.png`, `trace.zip`, and `debug.json` — captured by the instrumented notification-preference regression test when it fails. Open a trace with `python -m playwright show-trace <path-to-trace.zip>`.

Browser tests must use the isolated browser database and storage. Never point them at a normal developer, staging or production database. The browser runner's local-host and readiness guards are mandatory.

## Dispatcher boundary

`scripts/project.mjs` owns workflows that need multiple steps, shared environment configuration, isolated test environments, service lifecycle management or guarded destructive behavior. It is not a second public command registry.

The dispatcher accepts these internal tasks:

- Setup: `setup`
- Development: `dev`, `dev:https`, `dev:browser`
- Database: `db:sqlite:init`, `db:migrate`, `db:seed`, `db:seed:demo`, `db:fresh`
- Tests: `test`, `backend:test`, `unit`, `feature`, `integration`, `frontend:test`, `browser`, `browser:prepare`
- Quality: `backend`, `frontend`, `verify`, `verify:all`
- Style: `fix:style`
- Production: `prod:optimize`, `prod:clear`

Use `node scripts/project.mjs --help` for the concise internal task list. Build, lint, preview and migration-status one-liners are intentionally defined directly in `package.json`.

## Reports

Test reports are generated under `build/test-reports/`. They are local artifacts and should not be committed unless explicitly requested. Each runner must remove its own stale report before writing a new one.

## Composer scripts

Composer has its own focused commands in `composer.json`:

- `composer test` — PHPUnit
- `composer lint` — PHP Pint check
- `composer lint:fix` — apply PHP Pint fixes

Keep Composer and npm responsibilities distinct; do not add duplicate aliases just to expose the same command through both package managers.
