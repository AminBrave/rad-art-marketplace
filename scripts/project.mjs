#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIP } from 'node:net';
import { networkInterfaces } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';
const php = 'php';
const composer = isWindows ? 'composer.bat' : 'composer';
const python = isWindows ? 'py' : 'python3';
const pythonArgs = (args) => isWindows ? ['-3', ...args] : args;

function isPrivateLanAddress(host) {
    if (isIP(host) !== 4) return false;
    const [first, second] = host.split('.').map(Number);
    return first === 10
        || (first === 172 && second >= 16 && second <= 31)
        || (first === 192 && second === 168);
}

function assignedPrivateIpv4Addresses() {
    return Object.entries(networkInterfaces()).flatMap(([name, addresses]) =>
        (addresses ?? [])
            .filter((address) => !address.internal
                && (address.family === 'IPv4' || address.family === 4)
                && isPrivateLanAddress(address.address))
            .map((address) => ({ name, address: address.address })),
    );
}

function requireLanHost() {
    const assigned = assignedPrivateIpv4Addresses();
    const configured = process.env.RAD_LAN_HOST?.trim();

    if (configured) {
        if (!isPrivateLanAddress(configured)) {
            throw new Error('RAD_LAN_HOST must be a private LAN IPv4 address (10/8, 172.16/12 or 192.168/16).');
        }
        if (!assigned.some(({ address }) => address === configured)) {
            const available = assigned.map(({ name, address }) => `${address} (${name})`).join(', ') || 'none detected';
            throw new Error(`RAD_LAN_HOST ${configured} is not assigned to this computer. Detected private addresses: ${available}.`);
        }
        return configured;
    }

    const virtualInterface = /docker|container|veth|(^|[-_])br[-_]?|virbr|vmnet|vbox|virtual|wsl|tailscale|zerotier|(^|[-_])(tun|tap|wg)([-_]|$)/i;
    const candidates = assigned.filter(({ name }) => !virtualInterface.test(name));

    if (candidates.length === 1) return candidates[0].address;

    if (candidates.length === 0) {
        const available = assigned.map(({ name, address }) => `${address} (${name})`).join(', ') || 'none detected';
        throw new Error(`No suitable LAN IPv4 address was detected. Available private addresses: ${available}. Connect this computer to your LAN or set RAD_LAN_HOST to its reachable private address.`);
    }

    const choices = candidates.map(({ name, address }) => `${address} (${name})`).join(', ');
    throw new Error(`Multiple LAN addresses were detected: ${choices}. Set RAD_LAN_HOST to the address other devices use to reach this computer.`);
}

function httpsDevelopmentEnvironment(host) {
    return {
        ...process.env,
        APP_ENV: 'local',
        APP_URL: 'https://rad.localhost',
        SESSION_DOMAIN: '',
        SESSION_SECURE_COOKIE: 'true',
        VITE_DEV_LAN_HOST: host,
        RAD_LAN_HOST: host,
    };
}

function run(command, args = [], options = {}) {
    return new Promise((resolveRun, rejectRun) => {
        const child = spawn(command, args, {
            cwd: root,
            stdio: 'inherit',
            shell: isWindows && /\.(cmd|bat)$/i.test(command),
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
            shell: isWindows && /\.(cmd|bat)$/i.test(service.command),
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
        SESSION_DOMAIN: 'rad.localhost',
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
        APP_CONFIG_CACHE: 'bootstrap/cache/config.browser-testing.php',
        APP_ROUTES_CACHE: 'bootstrap/cache/routes.browser-testing.php',
        APP_EVENTS_CACHE: 'bootstrap/cache/events.browser-testing.php',
        APP_SERVICES_CACHE: 'bootstrap/cache/services.browser-testing.php',
        APP_PACKAGES_CACHE: 'bootstrap/cache/packages.browser-testing.php',
    };
}

function ensureBrowserDatabase() {
    const databasePath = resolve(root, 'database', 'browser-testing.sqlite');
    mkdirSync(dirname(databasePath), { recursive: true });
    if (existsSync(databasePath)) {
        const databaseStats = lstatSync(databasePath);
        if (databaseStats.isSymbolicLink() || !databaseStats.isFile()) {
            throw new Error('The isolated browser-test database path must be a regular file, not a link or directory.');
        }
    }
    if (!existsSync(databasePath)) {
        writeFileSync(databasePath, '');
    }

    return databasePath;
}

function ensureBrowserRuntimeDirectories() {
    const runtimeDir = resolve(root, 'storage', 'framework', 'browser-testing');
    const appRuntimeDir = resolve(root, 'storage', 'app', 'browser-testing');
    for (const baseDirectory of [runtimeDir, appRuntimeDir]) {
        if (existsSync(baseDirectory) && lstatSync(baseDirectory).isSymbolicLink()) {
            throw new Error(`Refusing to use a symbolic link for isolated browser-test runtime path: ${baseDirectory}`);
        }
    }

    for (const directory of [
        resolve(runtimeDir, 'cache'),
        resolve(runtimeDir, 'sessions'),
        resolve(runtimeDir, 'views'),
        resolve(root, 'storage', 'app', 'browser-testing', 'private'),
        resolve(root, 'storage', 'app', 'browser-testing', 'public'),
    ]) {
        mkdirSync(dirname(directory), { recursive: true });
        if (existsSync(directory) && lstatSync(directory).isSymbolicLink()) {
            throw new Error(`Refusing to use a symbolic link for isolated browser-test runtime path: ${directory}`);
        }
        mkdirSync(directory, { recursive: true });
    }
}

function clearBrowserBootstrapCaches() {
    const cacheDirectory = resolve(root, 'bootstrap', 'cache');
    if (existsSync(cacheDirectory) && lstatSync(cacheDirectory).isSymbolicLink()) {
        throw new Error('Refusing to clear browser-test caches through a symbolic link.');
    }

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

function resetBrowserVolatileRuntime() {
    const runtimeDir = resolve(root, 'storage', 'framework', 'browser-testing');
    for (const directory of ['cache', 'sessions', 'views']) {
        rmSync(resolve(runtimeDir, directory), { recursive: true, force: true });
    }
    clearBrowserBootstrapCaches();
    ensureBrowserRuntimeDirectories();
}

async function prepareBrowserEnvironment() {
    ensureBrowserDatabase();
    resetBrowserRuntime();
    console.log('[project] Stop npm run dev:browser before preparing the test database.');
    console.log('[project] Rebuilding only database/browser-testing.sqlite and isolated browser-test storage.');
    await run(php, ['artisan', 'migrate:fresh', '--seed'], { env: browserTestEnvironment() });
}

function testEnvironment() {
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
        SESSION_DOMAIN: '',
        MAIL_MAILER: 'array',
        QUEUE_CONNECTION: 'sync',
        LOG_CHANNEL: 'stderr',
        FILESYSTEM_DISK: 'local',
        RAD_ART_LOCAL_STORAGE_PATH: resolve(root, 'storage', 'framework', 'testing', 'storage', 'private'),
        RAD_ART_PUBLIC_STORAGE_PATH: resolve(root, 'storage', 'framework', 'testing', 'storage', 'public'),
        RAD_ART_BROWSER_TEST_MODE: '0',
        VIEW_COMPILED_PATH: resolve(root, 'storage', 'framework', 'testing', 'views'),
        APP_CONFIG_CACHE: 'bootstrap/cache/config.testing.php',
        APP_ROUTES_CACHE: 'bootstrap/cache/routes.testing.php',
        APP_EVENTS_CACHE: 'bootstrap/cache/events.testing.php',
        APP_SERVICES_CACHE: 'bootstrap/cache/services.testing.php',
        APP_PACKAGES_CACHE: 'bootstrap/cache/packages.testing.php',
    };
}

async function runBackendTests(suite = 'backend') {
    ensureReportDirectory();
    const reportPath = `build/test-reports/${suite}-junit.xml`; // Keep PHPUnit's CLI path relative on Windows.
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

async function generateQualityReport() {
    mkdirSync(resolve(root, 'build', 'test-reports'), { recursive: true });
    await run(python, pythonArgs(['scripts/summarize_test_reports.py']));
}

async function runReportingTests() {
    await run(python, pythonArgs([
        '-m',
        'unittest',
        'discover',
        '-s',
        'tests/python',
        '-p',
        'test_*.py',
    ]));
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
        console.log('\n[project] Browser tests require npm run browser:prepare and npm run dev:browser. They mutate only the isolated browser-test database and storage.\n');
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

    resetBrowserVolatileRuntime();
    console.log('[project] Browser test environment: https://rad.localhost (loopback only).');
    console.log('[project] Database: database/browser-testing.sqlite');
    console.log('[project] Cache, sessions, compiled views and uploaded files are isolated under storage/*/browser-testing.');

    return startServices([
        {
            label: 'Laravel browser-test application (isolated SQLite, loopback)',
            command: php,
            args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
            env: browserTestEnvironment(),
        },
        {
            label: 'Vite (loopback)',
            command: npm,
            args: ['exec', '--', 'vite', '--mode', 'https'],
            env: { ...process.env, VITE_DEV_HTTPS: 'true' },
        },
        {
            label: 'Caddy local HTTPS proxy (loopback only)',
            command: 'caddy',
            args: ['run', '--config', 'Caddyfile.browser', '--adapter', 'caddyfile'],
        },
    ]);
}

async function startDevelopment() {
    const host = requireLanHost();
    const env = httpsDevelopmentEnvironment(host);

    // Local Caddy is the only network-facing service; app and Vite stay on loopback.
    await artisan('config:clear');
    await artisan('route:clear');

    console.log('[project] Local development: https://rad.localhost');
    console.log('[project] LAN development: https://' + host);
    console.log('[project] Optional LAN hostname: https://rad.home.arpa (configure local DNS first).');
    console.log('[project] Caddy terminates HTTPS on port 443; Laravel and Vite remain on loopback.');

    return startServices([
        {
            label: 'Laravel (loopback)',
            command: php,
            args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
            env,
        },
        {
            label: 'Vite (loopback, LAN-aware HMR)',
            command: npm,
            args: ['exec', '--', 'vite', '--mode', 'lan'],
            env,
        },
        {
            label: 'Caddy HTTPS reverse proxy (local + LAN)',
            command: 'caddy',
            args: ['run', '--config', 'Caddyfile.dev', '--adapter', 'caddyfile'],
            env,
        },
    ]);
}

async function startPreview() {
    const host = requireLanHost();
    const env = httpsDevelopmentEnvironment(host);

    await artisan('config:clear');

    console.log('[project] Production-build preview: https://rad.localhost');
    console.log('[project] LAN preview: https://' + host);
    console.log('[project] Optional LAN hostname: https://rad.home.arpa (configure local DNS first).');

    return startServices([
        {
            label: 'Laravel production-build preview (loopback)',
            command: php,
            args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
            env,
        },
        {
            label: 'Caddy HTTPS reverse proxy (local + LAN)',
            command: 'caddy',
            args: ['run', '--config', 'Caddyfile.preview', '--adapter', 'caddyfile'],
            env,
        },
    ]);
}

function usage() {
    console.log(`Rademan project task dispatcher

Usage: node scripts/project.mjs <task>
Prefer the public npm commands documented in scripts/README.md.

Setup
  setup                 Install Composer/npm dependencies and create .env if missing

Development
  dev                   Start Laravel + Vite behind HTTPS on localhost and the LAN
  preview               Serve the production build behind HTTPS on localhost and the LAN
  dev:browser           Start the isolated browser-test application over loopback HTTPS only

Database
  db:sqlite:init        Create database/database.sqlite if it does not exist
  db:migrate            Apply pending migrations
  db:seed               Run DatabaseSeeder
  db:seed:demo          Run DemoDatabaseSeeder
  db:fresh              DESTRUCTIVE: drop all tables, migrate and seed

Focused tests (execute only with explicit authorization)
  test                  Run backend and frontend tests
  backend:test          Run backend PHPUnit tests with in-memory SQLite
  unit                  Run the Unit PHPUnit suite
  feature               Run the Feature PHPUnit suite
  integration           Run the Integration PHPUnit suite
  frontend:test         Run frontend Node tests
  browser [test-name]   Run all or selected guarded Playwright tests
  reporting:test        Run focused tests for the report generator
  browser:prepare       Rebuild the isolated browser database and storage

Reporting (does not run tests)
  report                Generate the cross-suite quality report from existing JUnit files

Quality workflows (execute only with explicit authorization)
  backend               Backend tests + PHP Pint check
  frontend              Frontend tests + ESLint + production builds
  verify                Run backend and frontend quality workflows
  verify:all            Run verify plus Playwright

Style repair
  fix:style             Apply PHP Pint and ESLint fixes

Production cache maintenance
  prod:optimize         Cache Laravel configuration, routes, events and views
  prod:clear            Clear Laravel optimization caches

Builds and one-command tools are exposed directly by package.json.
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
            await startDevelopment();
            break;
        case 'preview':
            await startPreview();
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
        case 'verify:all':
            await verify(true);
            break;
        case 'verify':
            await verify(false);
            break;
        case 'report':
            await generateQualityReport();
            break;
        case 'reporting:test':
            await runReportingTests();
            break;
        case 'browser':
            await run(python, pythonArgs([
                'tests/browser/run_tests.py',
                ...process.argv.slice(3),
            ]), {
                env: { ...process.env, RAD_ART_TEST_MODE: '1' },
            });
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
