# Project scripts

Run commands from the repository root. The npm scripts in package.json are the public interface. Environment workflows are deliberately small: one development command and one production-build command.

## Core workflows

| Command | Purpose |
|---|---|
| npm run setup | Install Composer/npm dependencies and create .env from .env.example when absent |
| npm run dev | Start Laravel, Vite and Caddy for local HTTPS and trusted-LAN development |
| npm run production | Build fingerprinted production assets with Vite; no Laravel cache commands |
| npm run build:cpanel | Build the cPanel-specific asset layout |

There is no production preview server. Run the production build, then deploy it using the hosting workflow for the target environment.

## Development

Run npm run dev. Caddy serves HTTPS on the development computer at https://rad.localhost and, when a private LAN address is detected, at https://<RAD_LAN_HOST>. Laravel and Vite remain bound to loopback; Caddy is the only LAN-facing service.

If multiple private network addresses are detected, set RAD_LAN_HOST to the address other devices use.

Bash: RAD_LAN_HOST=192.168.1.25 npm run dev

PowerShell: set $env:RAD_LAN_HOST="192.168.1.25", then run npm run dev.

The .localhost hostname is loopback-only. Use the LAN IP from another device. Each device must trust Caddy's local public root certificate. Never share Caddy's private root key or expose this development server through router port forwarding.

The development process overrides APP_URL to https://rad.localhost and points Laravel's optimization-cache paths at non-existent files. It does not clear, generate or consume Laravel optimization caches.

## Production

npm run production runs only vite build. It creates fingerprinted static assets and does not invoke Artisan, generate Laravel optimization caches, start a server or change deployment state.

For cPanel's repository-root document layout, use npm run build:cpanel instead.

Set APP_URL in the deployed server's untracked .env file to the exact public HTTPS origin, for example https://your-domain.example. Laravel already reads this standard variable through config/app.php. Do not add URL_APP or hardcode a production hostname in source.

Keep Laravel optimization caches disabled in the deployed environment. Preserve the APP_CONFIG_CACHE, APP_ROUTES_CACHE, APP_EVENTS_CACHE, APP_SERVICES_CACHE and APP_PACKAGES_CACHE values from .env.example, or set equivalent paths that do not exist. Do not run artisan optimize, config:cache, route:cache, event:cache or view:cache. This policy concerns Laravel-generated optimization caches; fingerprinted production assets and normal browser caching remain enabled.

## Database

| Command | Purpose |
|---|---|
| npm run db:sqlite:init | Create the local SQLite file only if absent |
| npm run db:status | Show migration status |
| npm run db:migrate | Apply pending migrations |
| npm run db:seed | Run DatabaseSeeder |
| npm run db:seed:demo | Run DemoDatabaseSeeder |
| npm run db:fresh | Destructive: drop configured tables, migrate and seed |

## Tests

| Command | Purpose |
|---|---|
| npm run test:backend | Run all PHPUnit suites with isolated in-memory SQLite |
| npm run test:unit | Run PHPUnit Unit |
| npm run test:feature | Run PHPUnit Feature |
| npm run test:integration | Run PHPUnit Integration |
| npm run test:frontend | Run frontend Node tests |
| npm run test:browser | Prepare isolated browser SQLite, start temporary local Laravel/Vite, run Playwright, then stop services |
| npm run test:report | Summarize existing JUnit reports; does not run tests |
| npm run test:reporting | Run focused Python tests for report parsing |

For Playwright, install python -m pip install -r requirements-test.txt and python -m playwright install chromium.

The Playwright workflow is a test runner, not a second development environment. It recreates only database/browser-testing.sqlite and isolated browser-test storage, runs migrations and seeders against that SQLite file, starts temporary loopback-only Laravel and Vite processes, waits for the health checks, runs the selected test(s), and stops both processes. It does not start Caddy or expose the app to the LAN. Stop npm run dev before running Playwright because both workflows use the default local Laravel/Vite ports.

Run one test by appending its Python unittest ID after --:
  npm run test:browser -- test_notifications_and_preferences.MessageNotificationBrowserTests.test_buyer_can_disable_in_app_message_notifications

Reports are written under build/test-reports/. Do not commit generated reports unless explicitly requested.

## Command boundaries

scripts/project.mjs contains only multi-step setup, development, test isolation, report generation and service lifecycle workflows. It is not a second public command registry. One-command Artisan, ESLint and Vite commands remain directly in package.json.

Tests, lint, builds, migrations and seeders are opt-in. Follow AGENTS.md and obtain explicit authorization before executing verification or changing local/production state.
