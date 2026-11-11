# Developer Workflow: Install, Run, Test, Build and Release

This guide is the operational entry point for Rademan. It covers local development on Windows, macOS and Linux; database setup; test layers; production builds; and the controlled release process.

For server topology, backups and recovery details, also read [Deployment and Recovery](deployment-and-recovery.md). For the reasoning behind test layers and coverage, see [Testing Strategy](../engineering/testing-strategy.md).

## 1. Supported toolchain

Install these tools before setup:

| Tool | Version / purpose |
|---|---|
| PHP | 8.3 or newer; CLI must be on PATH |
| Composer | Composer 2 |
| PHP extensions | Laravel/runtime extensions and the selected database driver (`pdo_mysql` or `pdo_sqlite`). The test suite requires `pdo_sqlite` and `sqlite3`; commonly required extensions include `mbstring`, `openssl`, `fileinfo`, `tokenizer`, `xml`, `ctype`, `curl` and `dom` |
| Node.js | 20 or newer |
| npm | Included with Node.js; use the lockfile via `npm ci` |
| Database | MySQL/MariaDB for production-like local development, or SQLite for lightweight local work |
| Python | Python 3 with pip, for browser tests only |
| Caddy | Optional; only needed for the local HTTPS profile |

Verify versions:

~~~bash
php -v
composer --version
node --version
npm --version
python --version
~~~

On Windows, use PowerShell or Git Bash in VS Code. The npm commands in this guide work in either terminal. The project task runner is Node-based and does not require Bash.

## 2. Clone and install

~~~bash
git clone https://github.com/AminBrave/rad-art-marketplace.git
cd rad-art-marketplace
npm run setup
~~~

`npm run setup` is safe to repeat. It:
1. Creates `.env` from `.env.example` only when `.env` does not exist.
2. Installs PHP packages with Composer.
3. Installs the exact JavaScript dependencies from `package-lock.json` using `npm ci`.
4. Generates an application key only when `APP_KEY` is empty.

It does not create a database, run migrations, seed data, or overwrite an existing `.env`.

Review `.env` before continuing. Configure the database, application URL and mail settings. Never commit `.env` or production secrets.

## 3. Configure the local database

### Option A — MySQL (recommended for production parity)

Create a local database using your MySQL client:

~~~sql
CREATE DATABASE rad_art_marketplace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
~~~

Set these values in `.env`:

~~~dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rad_art_marketplace
DB_USERNAME=your_local_database_user
DB_PASSWORD=your_local_database_password
~~~

### Option B — SQLite (quick local setup)

Run:

~~~bash
npm run db:sqlite:init
~~~

Then set the following in `.env`:

~~~dotenv
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
~~~

The SQLite initializer creates the file only if it is missing; it never truncates an existing database.

### Apply migrations and seed demo content

~~~bash
npm run db:migrate
npm run db:seed:demo
~~~

The default `DatabaseSeeder` also delegates to `DemoDatabaseSeeder`, so `npm run db:seed` is an equivalent convenience command for local/testing environments.

Demo seed data is intentionally restricted to Laravel's `local` and `testing` environments. The seeder refuses to write demo records in other environments. Do not weaken that guard or seed demo accounts on a production database.

Demo sign-in accounts use the shared password `Demo@12345`:

| Role | Email |
|---|---|
| Admin | `admin@rademan.test` |
| Artist | `artist@rademan.test` |
| Buyer | `buyer@rademan.test` |

These are public test credentials, not real accounts. Never reuse the password or email addresses outside local/testing environments.

### Database reset warning

~~~bash
npm run db:fresh
~~~

This command runs `php artisan migrate:fresh --seed`: it drops every table in the configured database, recreates the schema and seeds demo records. It is destructive. Check `.env` and the active database before running it. Never use it against production or any database containing data you need.

## 4. Start the application locally

### Standard HTTP development (recommended)

~~~bash
npm run dev
~~~

This starts Laravel and Vite together:

- Laravel: http://127.0.0.1:8000
- Vite development server: http://127.0.0.1:5173

Press `Ctrl+C` once to stop the managed processes.

### Local HTTPS development (optional)

~~~bash
npm run dev:https
~~~

This starts Laravel, Vite in the `https` mode, and Caddy using `Caddyfile.dev`. It serves the application at https://rad.localhost.

Requirements:
- Caddy must be installed and available on PATH.
- Caddy's local certificate authority must be trusted by the operating system/browser. Run `caddy trust` if required by your Caddy installation; on Windows this may require administrator approval.
- Keep `.env.https` and `Caddyfile.dev` as local development configuration. Do not reuse them as production TLS configuration.

If you only need HTTP, use `npm run dev`; Caddy is not required.

## 5. Test and verify

### Quick tests

~~~bash
npm test
~~~

Runs the backend PHPUnit suite and frontend Node tests.

### Run one backend layer

~~~bash
npm run test:unit
npm run test:feature
npm run test:integration
~~~

Or run all backend tests directly:

~~~bash
npm run test:backend
~~~

### Frontend tests and static checks

~~~bash
npm run test:frontend
npm run lint
composer lint
~~~

### Full local verification (without browser tests)

~~~bash
npm run verify
~~~

This runs, in sequence:
1. All Laravel tests.
2. PHP formatting/style validation.
3. Frontend tests.
4. ESLint.
5. Standard Vite production build.
6. cPanel-targeted production build.

### Browser / Playwright tests

Install the pinned Python test dependency and Chromium once:

~~~bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
~~~

Start the local app in one terminal. For HTTPS, run `npm run dev:https`. For HTTP, run `npm run dev`.

In a second terminal, run the browser suite.

PowerShell:

~~~powershell
$env:RAD_ART_BASE_URL = "http://127.0.0.1:8000"
npm run test:browser
~~~

Git Bash / macOS / Linux:

~~~bash
RAD_ART_BASE_URL=http://127.0.0.1:8000 npm run test:browser
~~~

For the HTTPS profile, omit `RAD_ART_BASE_URL`; the runner defaults to `https://rad.localhost`.

To run every verification layer, including Playwright:

~~~bash
npm run verify:all
~~~

The browser suite requires a running local application and a disposable local/test database. Never point it at production. Browser tests include both API-mocked UI regressions and unmocked full-stack journeys; they are intentionally separate from the backend and frontend unit suites.

## 6. Build assets

### Standard Laravel deployment

~~~bash
npm run build
~~~

Builds Vite assets into Laravel's standard `public/build` directory. Use this profile when the web server document root is Laravel's `public/` directory.

### cPanel build profile

~~~bash
npm run build:cpanel
~~~

Builds the cPanel-specific asset layout using `vite.config.cpanel.js`. It writes the Vite build to the repository-level `build/` directory. Run `npm run lint` separately as a quality gate; `npm run verify` runs both. Use it only with the reviewed cPanel deployment layout described in [Deployment and Recovery](deployment-and-recovery.md). Do not assume that changing the Vite build profile makes exposing the Laravel repository root as a document root safe.

Builds should be produced on a trusted development/CI machine. Node.js and npm are not required on the production server when the compiled assets are deployed.

### Preview the standard production build locally

Stop the development servers first so Laravel does not use the Vite hot-reload endpoint. Then run:

~~~bash
npm run build
npm run preview
~~~

Open http://127.0.0.1:8000. This serves the compiled `public/build` assets through Laravel's local PHP server, while retaining your local `.env` and database. It is a production-asset smoke test, not a production security/configuration test. Keep `APP_ENV=local` and `APP_DEBUG=true` locally; do not expose this server publicly. For the cPanel profile, validate the build on a staging host that matches the intended document-root layout.

## 7. Production preparation and deployment

Production deployment is a controlled release, not a single blind script. Back up data, review migrations and confirm the target hosting layout before changing production.

### Production environment

Configure hosting environment variables (or a protected server-side `.env`) with at least:

~~~dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example
APP_KEY=base64:YOUR_UNIQUE_GENERATED_KEY
APP_TIMEZONE=Asia/Tehran
APP_LOCALE=fa

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_production_database
DB_USERNAME=your_production_user
DB_PASSWORD=your_production_password

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_SECURE_COOKIE=true
~~~

Use a unique key generated for the production environment and preserve it across deployments. Configure SMTP credentials securely. Do not copy demo credentials, local database values or `APP_DEBUG=true` to production.

### Build and install

On the trusted build/deployment machine:

~~~bash
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
npm ci
npm run build
~~~

For the reviewed cPanel layout, replace `npm run build` with:

~~~bash
npm run build:cpanel
~~~

Deploy the application code, Composer `vendor/` dependencies and the matching compiled assets together. Keep secrets, private uploads and writable storage outside public access. Do not deploy `node_modules/`.

### Controlled production release

After taking a database and uploaded-file backup, and after reviewing the migration plan:

~~~bash
php artisan down
php artisan migrate --force
php artisan optimize
php artisan up
~~~

Run the maintenance commands from the application release directory using the production PHP binary and the correct environment. If a command fails, do not blindly continue; inspect logs and follow the recovery plan.

The equivalent project shortcut for Laravel optimization is:

~~~bash
npm run prod:optimize
~~~

This shortcut requires Node.js because it dispatches Artisan through the project runner. On a production server without Node.js, use `php artisan optimize` directly.

To clear cached configuration/routes/views after correcting a deployment configuration:

~~~bash
php artisan optimize:clear
~~~

Or, where Node.js is installed, `npm run prod:clear`.

### Post-deploy checks

- Confirm the home page, login, public artist/artwork discovery and authenticated role-specific flows.
- Confirm that uploads and private attachments remain private and storage permissions are correct.
- Confirm that queues, scheduled tasks, SMTP and database connectivity work.
- Inspect `storage/logs/laravel.log` and hosting/web-server error logs.
- Confirm the deployed commit and compiled assets match the intended release.
- Bring the application out of maintenance mode only after the release is healthy.

See [Deployment and Recovery](deployment-and-recovery.md) for cPanel cron configuration, queue operations, backup and recovery cautions.

## 8. Command reference

| Command | Purpose |
|---|---|
| `npm run setup` | Install dependencies and initialize local `.env` if missing |
| `npm run dev` | Start Laravel + Vite over HTTP |
| `npm run dev:https` | Start Laravel + Vite + Caddy over local HTTPS |
| `npm run db:sqlite:init` | Create local SQLite file if absent |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:status` | Show migration status |
| `npm run db:seed` | Run the default local/testing seeder |
| `npm run db:seed:demo` | Seed demo data in local/testing only |
| `npm run db:fresh` | Destructive reset, migrate and seed |
| `npm test` | Backend + frontend tests |
| `npm run test:unit` / `test:feature` / `test:integration` | Individual backend test suites |
| `npm run test:browser` | Playwright browser suite |
| `npm run verify` | Tests, lint and both production builds |
| `npm run verify:all` | Full verification including browser tests |
| `npm run build` | Standard Laravel production assets |\n| `npm run preview` | Serve standard compiled assets locally through Laravel |
| `npm run build:cpanel` | cPanel-specific production assets |
| `npm run prod:optimize` | Cache Laravel production metadata |
| `npm run prod:clear` | Clear Laravel optimization caches |

## 9. Troubleshooting

- **Composer reports a missing PHP extension:** enable the named extension in the PHP CLI configuration, then restart the terminal and rerun `composer install`.
- **PHP version mismatch:** check `php -v` and ensure the CLI PHP is 8.3+; a web-server PHP version may differ from CLI PHP.
- **npm install fails or lockfile is out of sync:** use `npm ci`; do not delete or regenerate the lockfile as a routine fix.
- **Database connection refused:** check that MySQL is running, the database exists, and the `.env` host/port/credentials match. After changing `.env`, clear cached config with `php artisan config:clear`.
- **Vite assets are missing:** keep `npm run dev` running during development, or run the appropriate production build before testing a built deployment.
- **Port 8000 or 5173 is occupied:** stop the other process or change the port consistently in the Laravel/Vite configuration and test URL.
- **HTTPS certificate warnings:** verify Caddy is running and its local CA is trusted; otherwise use the HTTP profile.
- **Browser tests cannot connect:** confirm the app is running and that `RAD_ART_BASE_URL` matches its actual local URL. Check the local database and demo data.
- **Permission/cache errors:** ensure `storage/` and `bootstrap/cache/` are writable by the application user; clear caches and rebuild them for the active environment.
