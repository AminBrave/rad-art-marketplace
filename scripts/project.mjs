#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';
const php = 'php';
const composer = isWindows ? 'composer.bat' : 'composer';
const python = isWindows ? 'py' : 'python3';
const pythonArgs = (args) => isWindows ? ['-3', ...args] : args;

function run(command, args = [], options = {}) {
    return new Promise((resolveRun, rejectRun) => {
        const child = spawn(command, args, {
            cwd: root,
            stdio: 'inherit',
            shell: isWindows,
            env: process.env,
            ...options,
        });

        child.once('error', rejectRun);
        child.once('close', (code, signal) => {
            if (code === 0) {
                resolveRun();
                return;
            }

            rejectRun(new Error(`${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}.`));
        });
    });
}

async function runSteps(steps) {
    for (const [label, command, args, options = {}] of steps) {
        console.log(`\n[project] ${label}\n`);
        await run(command, args, options);
    }
}

function stopChild(child) {
    if (!child.pid || child.exitCode !== null) return;

    if (isWindows) {
        const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
            stdio: 'ignore',
            windowsHide: true,
        });
        killer.unref();
    } else {
        child.kill('SIGTERM');
    }
}

async function startServices(services) {
    const children = [];
    let stopping = false;

    const stopAll = (exitCode = 0) => {
        if (stopping) return;
        stopping = true;
        for (const child of children) stopChild(child);
        process.exitCode = exitCode;
    };

    for (const service of services) {
        console.log(`[project] Starting ${service.label}...`);
        const child = spawn(service.command, service.args, {
            cwd: root,
            stdio: 'inherit',
            shell: isWindows,
            env: service.env ?? process.env,
        });
        children.push(child);

        child.once('error', (error) => {
            console.error(`[project] Could not start ${service.label}: ${error.message}`);
            stopAll(1);
        });

        child.once('close', (code, signal) => {
            if (!stopping) {
                console.error(`[project] ${service.label} stopped (${signal || code}). Stopping the remaining services.`);
                stopAll(code ?? 1);
            }
        });
    }

    process.once('SIGINT', () => stopAll(0));
    process.once('SIGTERM', () => stopAll(0));
}

async function setup() {
    if (!existsSync('.env')) {
        copyFileSync('.env.example', '.env');
        console.log('[project] Created .env from .env.example. Review database and mail settings before continuing.');
    }

    await runSteps([
        ['Install PHP dependencies', composer, ['install']],
        ['Install JavaScript dependencies', npm, ['ci']],
    ]);

    const env = readFileSync('.env', 'utf8');
    if (!/^APP_KEY=.+/m.test(env)) {
        await run(php, ['artisan', 'key:generate']);
    }

    console.log('\n[project] Setup complete. Configure your database in .env, then run npm run db:migrate.');
}

function initializeSqlite() {
    const databasePath = resolve(root, 'database', 'database.sqlite');
    mkdirSync(dirname(databasePath), { recursive: true });
    if (!existsSync(databasePath)) {
        writeFileSync(databasePath, '');
        console.log(`[project] Created ${databasePath}`);
    } else {
        console.log('[project] SQLite database already exists; left unchanged.');
    }
}

function ensureReportDirectory() {
    mkdirSync(resolve(root, 'build', 'test-reports'), { recursive: true });
    mkdirSync(resolve(root, 'storage', 'framework', 'testing', 'views'), { recursive: true });
}

function browserTestEnvironment() {
    const cacheDir = resolve(root, 'bootstrap', 'cache');
    const runtimeDir = resolve(root, 'storage', 'framework', 'browser-testing');
    return {
        ...process.env,
        APP_ENV: 'local',
        APP_KEY: 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        APP_DEBUG: 'true',
        APP_URL: 'https://rad.localhost',
        APP_TIMEZONE: 'Asia/Tehran',
        APP_LOCALE: 'fa',
        APP_FALLBACK_LOCALE: 'en',
        APP_FAKER_LOCALE: 'fa_IR',
        DB_CONNECTION: 'sqlite',
        DB_DATABASE: resolve(root, 'database', 'browser-testing.sqlite'),
        DB_FOREIGN_KEYS: 'true',
        DB_URL: '',
        CACHE_STORE: 'file',
        CACHE_PREFIX: 'rad_browser_test_',
        RAD_ART_CACHE_PATH: resolve(runtimeDir, 'cache'),
        SESSION_DRIVER: 'file',
        SESSION_FILES: resolve(runtimeDir, 'sessions'),
        SESSION_COOKIE: 'rad_browser_test_session',
        SESSION_SECURE_COOKIE: 'true',
        SESSION_SAME_SITE: 'lax',
        MAIL_MAILER: 'array',
        QUEUE_CONNECTION: 'sync',
        LOG_CHANNEL: 'stderr',
        FILESYSTEM_DISK: 'local',
        RAD_ART_LOCAL_STORAGE_PATH: resolve(root, 'storage', 'app', 'browser-testing', 'private'),
        RAD_ART_PUBLIC_STORAGE_PATH: resolve(root, 'storage', 'app', 'browser-testing', 'public'),
        VIEW_COMPILED_PATH: resolve(runtimeDir, 'views'),
        RAD_ART_BROWSER_TEST_MODE: '1',
        APP_CONFIG_CACHE: resolve(cacheDir, 'config.browser-testing.php'),
        APP_ROUTES_CACHE: resolve(cacheDir, 'routes.browser-testing.php'),
        APP_EVENTS_CACHE: resolve(cacheDir, 'events.browser-testing.php'),
        APP_SERVICES_CACHE: resolve(cacheDir, 'services.browser-testing.php'),
        APP_PACKAGES_CACHE: resolve(cacheDir, 'packages.browser-testing.php'),
    };
}

function ensureBrowserDatabase() {
    const databasePath = resolve(root, 'database', 'browser-testing.sqlite');
    mkdirSync(dirname(databasePath), { recursive: true });
    if (existsSync(databasePath) && lstatSync(databasePath).isSymbolicLink()) {
        throw new Error('Refusing to use a symbolic link for the isolated browser-test database.');
    }
    if (!existsSync(databasePath)) {
        writeFileSync(databasePath, '');
    }

    return databasePath;
}

function ensureBrowserRuntimeDirectories() {
    const runtimeDir = resolve(root, 'storage', 'framework', 'browser-testing');
    for (const directory of [
        resolve(runtimeDir, 'cache'),
        resolve(runtimeDir, 'sessions'),
        resolve(runtimeDir, 'views'),
        resolve(root, 'storage', 'app', 'browser-testing', 'private'),
        resolve(root, 'storage', 'app', 'browser-testing', 'public'),
    ]) {
        mkdirSync(directory, { recursive: true });
    }
}

function clearBrowserBootstrapCaches() {
    for (const cacheFile of [
        'config.browser-testing.php',
        'routes.browser-testing.php',
        'events.browser-testing.php',
        'services.browser-testing.php',
        'packages.browser-testing.php',
    ]) {
        rmSync(resolve(root, 'bootstrap', 'cache', cacheFile), { force: true });
    }
}

function resetBrowserRuntime() {
    rmSync(resolve(root, 'storage', 'app', 'browser-testing'), { recursive: true, force: true });
    rmSync(resolve(root, 'storage', 'framework', 'browser-testing'), { recursive: true, force: true });
    clearBrowserBootstrapCaches();
    ensureBrowserRuntimeDirectories();
}

async function prepareBrowserEnvironment() {
    ensureBrowserDatabase();
    resetBrowserRuntime();
    console.log('[project] Rebuilding only database/browser-testing.sqlite and isolated browser-test storage.');
    await run(php, ['artisan', 'migrate:fresh', '--seed'], { env: browserTestEnvironment() });
}

function testEnvironment() {
    const cacheDir = resolve(root, 'bootstrap', 'cache');
    return {
        ...process.env,
        APP_ENV: 'testing',
        APP_KEY: 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        APP_DEBUG: 'true',
        APP_URL: 'http://localhost',
        APP_TIMEZONE: 'Asia/Tehran',
        APP_LOCALE: 'fa',
        APP_FALLBACK_LOCALE: 'en',
        APP_FAKER_LOCALE: 'fa_IR',
        DB_CONNECTION: 'sqlite',
        DB_DATABASE: ':memory:',
        DB_FOREIGN_KEYS: 'true',
        DB_URL: '',
        CACHE_STORE: 'array',
        SESSION_DRIVER: 'array',
        MAIL_MAILER: 'array',
        QUEUE_CONNECTION: 'sync',
        LOG_CHANNEL: 'stderr',
        FILESYSTEM_DISK: 'local',
        RAD_ART_LOCAL_STORAGE_PATH: resolve(root, 'storage', 'framework', 'testing', 'storage', 'private'),
        RAD_ART_PUBLIC_STORAGE_PATH: resolve(root, 'storage', 'framework', 'testing', 'storage', 'public'),
        RAD_ART_BROWSER_TEST_MODE: '0',
        VIEW_COMPILED_PATH: resolve(root, 'storage', 'framework', 'testing', 'views'),
        APP_CONFIG_CACHE: resolve(cacheDir, 'config.testing.php'),
        APP_ROUTES_CACHE: resolve(cacheDir, 'routes.testing.php'),
        APP_EVENTS_CACHE: resolve(cacheDir, 'events.testing.php'),
        APP_SERVICES_CACHE: resolve(cacheDir, 'services.testing.php'),
        APP_PACKAGES_CACHE: resolve(cacheDir, 'packages.testing.php'),
    };
}

async function runBackendTests(suite = 'backend') {
    ensureReportDirectory();
    const reportPath = resolve(root, 'build', 'test-reports', `${suite}-junit.xml`);
    rmSync(reportPath, { force: true });
    const args = ['vendor/bin/phpunit', '--do-not-cache-result', `--log-junit=${reportPath}`];
    if (suite !== 'backend') {
        const suiteName = suite[0].toUpperCase() + suite.slice(1);
        args.push(`--testsuite=${suiteName}`);
    }
    await run(php, args, { env: testEnvironment() });
}

async function runFrontendTests() {
    ensureReportDirectory();
    rmSync(resolve(root, 'build', 'test-reports', 'frontend-junit.xml'), { force: true });
    await run(process.execPath, [
        '--test',
        '--test-reporter=spec',
        '--test-reporter-destination=stdout',
        '--test-reporter=junit',
        '--test-reporter-destination=build/test-reports/frontend-junit.xml',
        'tests/js/*.test.js',
    ]);
}

async function verifyBackend() {
    await runBackendTests();
    await runSteps([
        ['PHP style', composer, ['lint']],
    ]);
}

async function verifyFrontend() {
    await runFrontendTests();
    await runSteps([
        ['Frontend lint', npm, ['run', 'lint']],
        ['Standard production build', npm, ['run', 'build']],
        ['cPanel production build', npm, ['run', 'build:cpanel']],
    ]);
}

async function verify(includeBrowser = false) {
    await verifyBackend();
    await verifyFrontend();
    if (includeBrowser) {
        console.log('\n[project] Browser tests require the local development stack and a disposable local test database. They mutate application data.\n');
        await run(python, pythonArgs(['tests/browser/run_tests.py']), {
            env: { ...process.env, RAD_ART_TEST_MODE: '1' },
        });
    }
}

async function startBrowserDevelopment() {
    const databasePath = ensureBrowserDatabase();
    if (!existsSync(databasePath) || lstatSync(databasePath).size === 0) {
        throw new Error('Browser test database is empty. Run npm run browser:prepare first.');
    }

    clearBrowserBootstrapCaches();
    ensureBrowserRuntimeDirectories();
    const services = [
        {
            label: 'Laravel browser-test application (isolated SQLite)',
            command: php,
            args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
            env: browserTestEnvironment(),
        },
        {
            label: 'Vite',
            command: npm,
            args: ['exec', '--', 'vite', '--mode', 'https'],
        },
        {
            label: 'Caddy local HTTPS proxy',
            command: 'caddy',
            args: ['run', '--config', 'Caddyfile.dev'],
        },
    ];

    console.log('[project] Browser test environment: https://rad.localhost');
    console.log('[project] Database: database/browser-testing.sqlite');
    console.log('[project] Cache, sessions, compiled views and uploaded files are isolated under storage/*/browser-testing.');
    return startServices(services);
}

async function startDevelopment(secure = false) {
    // Local development must not inherit stale production config from a previous optimize run.
    await artisan('config:clear');
    await artisan('route:clear');

    const services = [
        {
            label: 'Laravel',
            command: php,
            args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
            env: { ...process.env, APP_ENV: 'local' },
        },
        {
            label: 'Vite',
            command: npm,
            args: secure ? ['exec', '--', 'vite', '--mode', 'https'] : ['exec', '--', 'vite', '--host', '127.0.0.1'],
        },
    ];

    if (secure) {
        services.push({
            label: 'Caddy local HTTPS proxy',
            command: 'caddy',
            args: ['run', '--config', 'Caddyfile.dev'],
        });
        console.log('[project] Local HTTPS: https://rad.localhost (Caddy must be installed and trusted).');
    } else {
        console.log('[project] Laravel: http://127.0.0.1:8000 | Vite: http://127.0.0.1:5173');
    }

    return startServices(services);
}

function usage() {
    console.log(`Rademan project tasks

Usage: npm run <task>  (or node scripts/project.mjs <task>)

Setup
  setup                 Install Composer/npm packages and create .env if missing
  db:sqlite:init        Create database/database.sqlite if it does not exist

Development
  dev                   Start Laravel + Vite over local HTTP
  dev:https             Start regular local Laravel + Vite + Caddy
  browser:prepare       DESTRUCTIVE only to isolated browser-testing.sqlite and browser-test storage
  dev:browser           Start Laravel + Vite + Caddy against the isolated browser-test environment

Database (review .env before running)
  db:migrate            Apply pending migrations
  db:seed               Run DatabaseSeeder (demo data; local/testing only)
  db:seed:demo           Run DemoDatabaseSeeder (local/testing only)
  db:fresh              DESTRUCTIVE: drop all tables, migrate and seed

Quality (all commands below execute checks; invoke only when authorized)
  test                  Run backend and frontend tests
  backend:test          Run backend tests in isolated SQLite in-memory environment
  unit                  Run the Unit PHPUnit suite in isolated SQLite memory
  feature               Run the Feature PHPUnit suite in isolated SQLite memory
  integration           Run the Integration PHPUnit suite in isolated SQLite memory
  backend               Backend tests + PHP style
  frontend              Frontend tests (including color accessibility) + lint + both builds
  fix:style             Apply PHP Pint and ESLint formatting fixes only
  verify                Run backend and frontend quality checks
  verify:all            Run verify plus Playwright against the prepared isolated browser-test app
  frontend:test         Run frontend tests and write a JUnit report
  browser               Run guarded Playwright tests against local RAD_ART_BASE_URL
  build                 Standard Vite production build
  build:cpanel          cPanel-targeted production build

Production
  prod:optimize         Cache Laravel configuration, routes, events and views
  prod:clear            Clear Laravel optimization caches
`);
}

const task = process.argv[2];
const artisan = (...args) => run(php, ['artisan', ...args]);

try {
    switch (task) {
        case 'setup':
            await setup();
            break;
        case 'db:sqlite:init':
            initializeSqlite();
            break;
        case 'dev':
            await startDevelopment(false);
            break;
        case 'dev:https':
        case 'dev:local':
            await startDevelopment(true);
            break;
        case 'browser:prepare':
            await prepareBrowserEnvironment();
            break;
        case 'dev:browser':
            await startBrowserDevelopment();
            break;
        case 'db:migrate':
            await artisan('migrate');
            break;
        case 'db:seed':
            await artisan('db:seed');
            break;
        case 'db:seed:demo':
            await artisan('db:seed', '--class=DemoDatabaseSeeder');
            break;
        case 'db:fresh':
            await artisan('migrate:fresh', '--seed');
            break;
        case 'test':
            await runBackendTests();
            await runFrontendTests();
            break;
        case 'backend:test':
            await runBackendTests();
            break;
        case 'unit':
        case 'feature':
        case 'integration':
            await runBackendTests(task);
            break;
        case 'frontend:test':
            await runFrontendTests();
            break;
        case 'backend':
            await verifyBackend();
            break;
        case 'frontend':
            await verifyFrontend();
            break;
        case 'fix:style':
            await runSteps([
                ['Apply PHP Pint fixes', composer, ['lint:fix']],
                ['Apply ESLint fixes', npm, ['run', 'lint:fix']],
            ]);
            break;
        case 'all':
        case 'verify:all':
            await verify(true);
            break;
        case 'verify':
            await verify(false);
            break;
        case 'browser':
            await run(python, pythonArgs(['tests/browser/run_tests.py']), {
                env: { ...process.env, RAD_ART_TEST_MODE: '1' },
            });
            break;
        case 'build':
            await run(npm, ['run', 'build']);
            break;
        case 'build:cpanel':
            await run(npm, ['run', 'build:cpanel']);
            break;
        case 'prod:optimize':
            await artisan('optimize');
            break;
        case 'prod:clear':
            await artisan('optimize:clear');
            break;
        case '--help':
        case '-h':
        case undefined:
            usage();
            break;
        default:
            console.error(`Unknown task: ${task}\n`);
            usage();
            process.exitCode = 2;
    }
} catch (error) {
    console.error(`\n[project] ${error.message}`);
    process.exitCode = 1;
}
