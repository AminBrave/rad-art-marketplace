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
| Development | `npm run dev` | Laravel + Vite behind HTTPS on localhost and the LAN (default) |
| Development | `npm run dev:browser` | Start the isolated browser-test application, Vite and Caddy |
| Preview | `npm run preview` | Serve the production build behind HTTPS on localhost and the LAN |
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
| Reports | `npm run test:report` | Generate the cross-suite quality summary from existing JUnit files; does not run tests |
| Reports | `npm run test:reporting` | Run focused Python unit tests for report parsing and freshness classification |
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

## Default HTTPS development and LAN access

The normal development command serves the same running Laravel + Vite application through Caddy. Install Caddy and make its executable available on PATH before starting either development or preview.

    npm run dev

It automatically detects this computer's private LAN IPv4 address when there is one unambiguous candidate. If several network interfaces have private addresses (for example Wi-Fi plus a VPN or virtual adapter), select the address other devices use to reach this computer:

Bash:

    RAD_LAN_HOST=192.168.1.25 npm run dev

PowerShell:

    $env:RAD_LAN_HOST="192.168.1.25"
    npm run dev

Use the same RAD_LAN_HOST override with npm run preview after npm run build.

| Where you open Rademan | URL |
|---|---|
| Development computer | https://rad.localhost |
| Any device on the same LAN | https://<RAD_LAN_HOST> |
| Any LAN device with local DNS configured | https://rad.home.arpa |

**Important hostname behavior:** .localhost is loopback-only by design. It always points a device back to itself, so rad.localhost cannot reach your development computer from a phone or another computer. Use the LAN IP or rad.home.arpa on those devices. Configure rad.home.arpa in your router's local DNS to resolve to the development computer's LAN IP; otherwise, use the IP URL. A DHCP reservation for the development computer is recommended so the IP remains stable.

### HTTPS certificate trust on devices

Caddy issues certificates from its local development CA. This gives the LAN IP and local hostnames HTTPS certificates without sending private keys or traffic to a public CA. Each client device must trust this CA; never bypass browser certificate warnings or disable TLS verification.

1. Start npm run dev once on the development computer so Caddy creates its local CA.
2. On the development computer, run caddy trust in an elevated terminal if Caddy could not install the root certificate automatically.
3. Export only Caddy's public root certificate, root.crt, from its data directory. The default locations are:
   - Windows: %AppData%\Caddy\pki\authorities\local\root.crt
   - macOS: ~/Library/Application Support/Caddy/pki/authorities/local/root.crt
   - Linux: ~/.local/share/caddy/pki/authorities/local/root.crt
4. Transfer that public root.crt to each trusted phone/tablet/computer and install it as a trusted certificate authority using that device's OS/browser certificate settings. On iOS, also enable full trust for the installed root certificate. Firefox may use its own certificate store depending on configuration.

**Never copy or share Caddy's root private key.** Only distribute root.crt. Reinstall the public root certificate if you intentionally reset Caddy's local CA.

### Network exposure and process boundaries

- Caddy is the only LAN-facing service. HTTPS is served on TCP port 443; Caddy may also listen on TCP port 80 to redirect HTTP requests to HTTPS.
- Laravel (127.0.0.1:8000) and Vite (127.0.0.1:5173) remain bound to loopback; Vite assets and HMR are reverse-proxied through HTTPS.
- Allow inbound TCP 443 on the computer's **private-network** firewall profile. Allow TCP 80 only if you want Caddy's HTTP-to-HTTPS redirect to be reachable. Do not configure router port forwarding or expose this development server to public networks.
- Keep the computer and test devices on a trusted LAN. This is a development environment, not a production deployment.
- The isolated Playwright app remains loopback-only and is not exposed to LAN devices. Its remote-host rejection remains unchanged.
- If the computer uses WSL2, Docker, a VPN, or multiple network adapters, LAN routing may require host-specific networking setup; set RAD_LAN_HOST to the reachable address and ensure the host firewall permits TCP 443.

The rad.home.arpa name is optional convenience DNS; direct access by the LAN IP does not require it.

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
- Development: `dev`, `preview`, `dev:browser`
- Database: `db:sqlite:init`, `db:migrate`, `db:seed`, `db:seed:demo`, `db:fresh`
- Tests: `test`, `backend:test`, `unit`, `feature`, `integration`, `frontend:test`, `browser`, `browser:prepare`
- Quality: `backend`, `frontend`, `verify`, `verify:all`
- Style: `fix:style`
- Production: `prod:optimize`, `prod:clear`

Use `node scripts/project.mjs --help` for the concise internal task list. Build, lint and migration-status one-liners are intentionally defined directly in `package.json`; preview is orchestrated because it starts both Laravel and Caddy.

## Reports

Test reports are generated under `build/test-reports/`. They are local artifacts and should not be committed unless explicitly requested. Each runner must remove its own stale report before writing a new one.

Run `npm run test:report` to create `build/test-reports/quality-summary.md`. The report summarizes backend, frontend and browser JUnit counts and links to the detailed reports and browser diagnostics. It labels a suite `MISSING` when no JUnit file exists and `STALE` when XML is invalid, the report predates the current Git HEAD, the worktree has project changes, or Git freshness cannot be established. `CURRENT` means the report was generated at or after HEAD with a clean worktree; it is evidence for that checked-out snapshot, not proof that lint, builds, accessibility, performance or manual review were completed. Missing suites are never counted as passing. The command reads existing files and Git metadata only.

Run `npm run test:reporting` for the focused unit tests of this report generator. These tests are separate from the backend, frontend and browser suites.

## Composer scripts

Composer has its own focused commands in `composer.json`:

- `composer test` — PHPUnit
- `composer lint` — PHP Pint check
- `composer lint:fix` — apply PHP Pint fixes

Keep Composer and npm responsibilities distinct; do not add duplicate aliases just to expose the same command through both package managers.
