# Project scripts

Run commands from the repository root. **Use the npm commands in `package.json` as the public interface.** Multi-step and environment-sensitive workflows are implemented by `scripts/project.mjs`; direct one-command tools remain in `package.json`.

## Principles

- One canonical command per workflow; do not add compatibility aliases without a concrete external consumer.
- Keep npm script names grouped by setup, development, database, tests, lint and builds.
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
| Development | `npm run dev:check` | Run the read-only local environment preflight without starting services |
| Development | `npm run dev` | Validate `.env`, reject production/debug-off or unsafe database targets, check dependencies/stale Vite hot file, then start Laravel + Vite + Caddy |
| Database | `npm run db:sqlite:init` | Create the local SQLite file only if absent |
| Database | `npm run db:status` | Show migration status after local environment/database preflight |
| Database | `npm run db:migrate` | Apply pending migrations after local environment/database preflight |
| Database | `npm run db:seed` | Run `DatabaseSeeder` after local environment/database preflight |
| Database | `npm run db:seed:demo` | Run `DemoDatabaseSeeder` after local environment/database preflight |
| Database | `npm run db:fresh` | **Destructive:** preflight, drop all configured development database tables, migrate and seed |
| Database | `npm run db:export:cpanel` | Export the current development MySQL database to a protected `public/build/database-export/*.sql.gz` dump |
| Tests | `npm run test:backend` | Backend PHPUnit tests using isolated in-memory SQLite |
| Tests | `npm run test:unit` | Unit PHPUnit suite |
| Tests | `npm run test:feature` | Feature PHPUnit suite |
| Tests | `npm run test:integration` | Integration PHPUnit suite |
| Tests | `npm run test:frontend` | Frontend Node tests |
| Tests | `npm run test:browser` | Prepare isolated SQLite, run Playwright in a temporary local app, then stop it |
| Reports | `npm run test:report` | Generate the cross-suite quality summary from existing JUnit files; does not run tests |
| Reports | `npm run test:reporting` | Run focused Python unit tests for report parsing and freshness classification |
| Lint | `npm run lint` | ESLint check |
| Lint | `npm run lint:fix` | Apply ESLint autofixes |
| Accessibility | `npm run a11y:colors` | Run focused color-accessibility tests |
| Production | `npm run production` | Build standard Vite assets and verify the manifest plus required CSS/JS output |
| Build | `npm run build:cpanel` | Build and verify cPanel Vite production assets |

Use the npm database commands for local development. Direct `php artisan` invocations bypass the project preflight and do not receive the launcher's scoped cache paths.

### Export a seeded database for cPanel / phpMyAdmin

Run `npm run db:export:cpanel` after seeding the development MySQL database. It requires `mysqldump` on PATH and writes `public/build/database-export/rademan-development-seed.sql.gz`. The dump contains the current database's schema and all rows; it does not seed, reset or modify the source database. To create a clean demo-only snapshot first, `npm run db:fresh` rebuilds the configured development database and runs `DatabaseSeeder` (destructive: it drops existing tables and data). `npm run db:seed` alone is additive/idempotent and does not remove unrelated records.

The dump is a MySQL import file, not a SQLite converter. It does not include `CREATE DATABASE` or `USE`, so create/select the destination database in cPanel/phpMyAdmin before importing. Upload the `.sql.gz` file through phpMyAdmin's Import tab. Retrieve it from the development project with cPanel File Manager or FTP; direct Apache access to the export folder is denied by its `.htaccess`. The generated `.sql.gz` is ignored by Git. Run the export after `npm run production`, because a subsequent Vite production build recreates `public/build` and removes generated files there.

**Production safety:** the demo seeder creates known test accounts (including `admin@rademan.test`) with the shared password `Demo@12345`. Do not expose or use these demo credentials on a live site. Before importing this snapshot into production, remove/replace demo accounts and inspect the dump for any local user data, messages or other development-only records. This command exports every table and row in the configured database; it cannot determine which rows are safe to publish.

## Default HTTPS development and LAN access

The normal development command first runs a read-only preflight, then serves Laravel + Vite through Caddy. Install Caddy and make its executable available on PATH before starting development.

    npm run dev

Before `npm run dev` starts services, and before the npm database commands invoke Artisan, the preflight validates the local `.env` and refuses unsafe `APP_ENV`, `APP_DEBUG`, `APP_KEY` or database settings. The dev startup additionally checks frontend dependencies and rejects an existing Vite `public/hot` file; database commands require PHP dependencies but can run while the normal dev server is active. It never edits `.env`, clears caches, migrates a database or changes application data. The dev launcher bypasses Laravel's config/route/event optimization-cache paths without deleting old files; normal application cache, sessions and Composer-managed package manifests are left alone. A database reached through an SSH tunnel on `127.0.0.1` still looks local to the check, so never tunnel a production database into the development environment. A remote development database requires the explicit one-command opt-in `RAD_ALLOW_REMOTE_DEV_DATABASE=true`; use that only after confirming the database is isolated and disposable. The opt-in is intentionally not stored in `.env`. Bash example: `RAD_ALLOW_REMOTE_DEV_DATABASE=true npm run dev`. PowerShell example: `$env:RAD_ALLOW_REMOTE_DEV_DATABASE="true"; npm run dev` (then clear it with `Remove-Item Env:RAD_ALLOW_REMOTE_DEV_DATABASE`). Run `npm run dev:check` first if you want to inspect the configuration without starting services.

It automatically detects this computer's private LAN IPv4 address when there is one unambiguous candidate. If several network interfaces have private addresses (for example Wi-Fi plus a VPN or virtual adapter), select the address other devices use to reach this computer:

Bash:

    RAD_LAN_HOST=192.168.1.25 npm run dev

PowerShell:

    $env:RAD_LAN_HOST="192.168.1.25"
    npm run dev

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
- The temporary Playwright test app remains loopback-only and is not exposed to LAN devices. Its remote-host rejection remains unchanged.
- If the computer uses WSL2, Docker, a VPN, or multiple network adapters, LAN routing may require host-specific networking setup; set RAD_LAN_HOST to the reachable address and ensure the host firewall permits TCP 443.

The rad.home.arpa name is optional convenience DNS; direct access by the LAN IP does not require it.

## Production

The primary production asset command is npm run production. It runs the standard Vite production build and then verifies that the manifest contains both application entry points and that their emitted files exist inside the build output. It refuses to build while public/hot exists, preventing a development Vite server from taking precedence over production assets. It does not start Laravel, preview the site or run Artisan cache commands. For the cPanel repository-root document layout, use npm run build:cpanel; that command performs the same output verification against the cPanel manifest.

### Production environment checklist

Configure the deployed server's untracked .env independently from local development:

- APP_ENV=production
- APP_DEBUG=false
- APP_KEY must be set to the stable key generated for this application; never regenerate it on an existing installation.
- APP_URL must be the public HTTPS origin, for example https://your-domain.example. Laravel already reads APP_URL in config/app.php; do not introduce URL_APP or hardcode the production hostname in source.
- SESSION_SECURE_COOKIE=true when the site is served over HTTPS.
- DB_CONNECTION, DB_HOST, DB_DATABASE, DB_USERNAME and DB_PASSWORD must target the production database. Keep credentials out of Git.
- Configure mail, queue, session and cache drivers for the actual hosting topology; do not copy local credentials or test-only settings.

Before a release, back up the database and uploaded files, run the authorized automated test/lint/build checks against the release commit, deploy the matching code and assets together, then apply forward migrations with php artisan migrate --force. Confirm the health endpoint, authentication, key user journeys, logs and asset loading after deployment. Do not run migrate:fresh or seed demo data on production.

Keep Laravel config, route and event optimization caches disabled in the deployed environment by preserving the APP_CONFIG_CACHE, APP_ROUTES_CACHE and APP_EVENTS_CACHE values from .env.example (or equivalent paths that do not exist). Do not run artisan optimize, config:cache, route:cache, event:cache or view:cache. Composer's package/service provider manifests are separate framework metadata and may be generated normally. This does not disable fingerprinted production assets or normal browser caching.

The production asset build is not a deployment or a complete release verification: it does not validate the deployed .env, database connectivity, HTTPS/proxy configuration, backups, migrations or live user journeys.

## Browser-test lifecycle

Playwright is retained as a test workflow; it no longer has a separate development server or Caddy profile.

1. Stop the normal npm run dev process because the temporary test stack uses the same local Laravel/Vite ports.
2. Run npm run test:browser. The command prepares only database/browser-testing.sqlite and isolated browser-test storage, then runs migrate:fresh --seed against that SQLite database.
3. The command starts temporary loopback-only Laravel and Vite processes, waits for the API health and Vite readiness checks, runs the full suite, and stops both processes.
4. To run one test, append its Python unittest ID after --, for example: npm run test:browser -- test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications.

The runner remains guarded: it requires browser_test_ready=true and rejects non-loopback URLs. Never point browser tests at the normal development database, a shared database, staging or production. Install Python Playwright and Chromium using the instructions in tests/README.md.

## Dispatcher boundary

scripts/project.mjs owns only workflows that need multiple steps, isolated test environments, report generation or service lifecycle management. It is not a second public command registry.

The dispatcher tasks are setup, dev:check, dev, production, build:cpanel, db:sqlite:init, db:status, db:migrate, db:seed, db:seed:demo, db:fresh, test:backend, test:unit, test:feature, test:integration, test:frontend, test:browser, test:report and test:reporting. Lint and focused accessibility tests are defined directly in package.json. Database commands are routed through the dispatcher so they inherit the local environment/database preflight.

Use node scripts/project.mjs --help for the concise internal task list.

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
