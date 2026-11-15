#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIP } from 'node:net';
import { networkInterfaces } from 'node:os';
import { runDevelopmentPreflight } from './dev-environment.mjs';

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
    return first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}

function assignedPrivateIpv4Addresses() {
    return Object.entries(networkInterfaces()).flatMap(([name, addresses]) =>
        (addresses ?? []).filter((address) => !address.internal
            && (address.family === 'IPv4' || address.family === 4)
            && isPrivateLanAddress(address.address))
            .map((address) => ({ name, address: address.address })),
    );
}

function requireLanHost() {
    const assigned = assignedPrivateIpv4Addresses();
    const configured = process.env.RAD_LAN_HOST?.trim();
    if (configured) {
        if (!isPrivateLanAddress(configured)) throw new Error('RAD_LAN_HOST must be a private LAN IPv4 address.');
        if (!assigned.some(({ address }) => address === configured)) {
            const available = assigned.map(({ name, address }) => address + ' (' + name + ')').join(', ') || 'none detected';
            throw new Error('RAD_LAN_HOST ' + configured + ' is not assigned to this computer. Detected: ' + available + '.');
        }
        return configured;
    }
    const virtualInterface = /docker|container|veth|(^|[-_])br[-_]?|virbr|vmnet|vbox|virtual|wsl|tailscale|zerotier|(^|[-_])(tun|tap|wg)([-_]|$)/i;
    const candidates = assigned.filter(({ name }) => !virtualInterface.test(name));
    if (candidates.length === 1) return candidates[0].address;
    if (candidates.length === 0) throw new Error('No suitable private LAN IPv4 address was detected. Set RAD_LAN_HOST to this computer’s reachable private address.');
    throw new Error('Multiple LAN addresses were detected: ' + candidates.map(({ name, address }) => address + ' (' + name + ')').join(', ') + '. Set RAD_LAN_HOST explicitly.');
}

function noCacheEnvironment(scope) {
    const directory = resolve(root, 'storage', 'framework', 'cache-disabled');
    return {
        APP_CONFIG_CACHE: resolve(directory, scope + '-config.php'),
        APP_ROUTES_CACHE: resolve(directory, scope + '-routes.php'),
        APP_EVENTS_CACHE: resolve(directory, scope + '-events.php'),
        APP_SERVICES_CACHE: resolve(root, 'bootstrap', 'cache', scope + '-services.php'),
        APP_PACKAGES_CACHE: resolve(root, 'bootstrap', 'cache', scope + '-packages.php'),
    };
}

function developmentEnvironment(host) {
    return {
        ...process.env,
        ...noCacheEnvironment('development'),
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
            cwd: root, stdio: 'inherit',
            shell: isWindows && /\.(cmd|bat)$/i.test(command),
            env: process.env, ...options,
        });
        child.once('error', rejectRun);
        child.once('close', (code, signal) => code === 0
            ? resolveRun()
            : rejectRun(new Error(command + ' exited with ' + (signal ? 'signal ' + signal : 'code ' + code) + '.')));
    });
}

async function runSteps(steps) {
    for (const [label, command, args, options = {}] of steps) {
        console.log('\n[project] ' + label + '\n');
        await run(command, args, options);
    }
}

function stopChild(child) {
    if (!child.pid || child.exitCode !== null) return;
    if (isWindows) {
        const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true });
        killer.unref();
    } else child.kill('SIGTERM');
}

async function startServices(services) {
    const children = [];
    let stopping = false;
    let failure = null;
    const stopAll = (exitCode = 0) => {
        if (stopping) return;
        stopping = true;
        for (const child of children) stopChild(child);
        process.exitCode = exitCode;
    };
    stopAll.failure = () => failure;
    for (const service of services) {
        console.log('[project] Starting ' + service.label + '...');
        const child = spawn(service.command, service.args, {
            cwd: root, stdio: 'inherit',
            shell: isWindows && /\.(cmd|bat)$/i.test(service.command),
            env: service.env ?? process.env,
        });
        children.push(child);
        child.once('error', (error) => {
            failure = new Error('Could not start ' + service.label + ': ' + error.message);
            console.error('[project] ' + failure.message);
            stopAll(1);
        });
        child.once('close', (code, signal) => {
            if (!stopping) {
                failure = new Error(service.label + ' stopped (' + (signal || code) + ').');
                console.error('[project] ' + failure.message + ' Stopping remaining services.');
                stopAll(code ?? 1);
            }
        });
    }
    process.once('SIGINT', () => stopAll(0));
    process.once('SIGTERM', () => stopAll(0));
    return stopAll;
}

async function setup() {
    if (!existsSync('.env')) {
        copyFileSync('.env.example', '.env');
        console.log('[project] Created .env from .env.example. Review database and mail settings.');
    }
    await runSteps([
        ['Install PHP dependencies', composer, ['install']],
        ['Install JavaScript dependencies', npm, ['ci']],
    ]);
    const env = readFileSync('.env', 'utf8');
    if (!/^APP_KEY=.+/m.test(env)) await run(php, ['artisan', 'key:generate']);
    console.log('\n[project] Setup complete. Configure your database, then run npm run db:migrate.');
}

function initializeSqlite() {
    const databasePath = resolve(root, 'database', 'database.sqlite');
    mkdirSync(dirname(databasePath), { recursive: true });
    if (!existsSync(databasePath)) {
        writeFileSync(databasePath, '');
        console.log('[project] Created ' + databasePath);
    } else console.log('[project] SQLite database already exists; left unchanged.');
}

function ensureReportDirectory() {
    mkdirSync(resolve(root, 'build', 'test-reports'), { recursive: true });
    mkdirSync(resolve(root, 'storage', 'framework', 'testing', 'views'), { recursive: true });
}

function testEnvironment() {
    return {
        ...process.env, ...noCacheEnvironment('phpunit'),
        APP_ENV: 'testing', APP_KEY: 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        APP_DEBUG: 'true', APP_URL: 'http://localhost', APP_TIMEZONE: 'Asia/Tehran',
        APP_LOCALE: 'fa', APP_FALLBACK_LOCALE: 'en', APP_FAKER_LOCALE: 'fa_IR',
        DB_CONNECTION: 'sqlite', DB_DATABASE: ':memory:', DB_FOREIGN_KEYS: 'true', DB_URL: '',
        CACHE_STORE: 'array', SESSION_DRIVER: 'array', SESSION_DOMAIN: '',
        MAIL_MAILER: 'array', QUEUE_CONNECTION: 'sync', LOG_CHANNEL: 'stderr',
        FILESYSTEM_DISK: 'local',
        RAD_ART_LOCAL_STORAGE_PATH: resolve(root, 'storage', 'framework', 'testing', 'storage', 'private'),
        RAD_ART_PUBLIC_STORAGE_PATH: resolve(root, 'storage', 'framework', 'testing', 'storage', 'public'),
        RAD_ART_BROWSER_TEST_MODE: '0',
        VIEW_COMPILED_PATH: resolve(root, 'storage', 'framework', 'testing', 'views'),
    };
}

function browserTestEnvironment() {
    const runtimeDir = resolve(root, 'storage', 'framework', 'browser-testing');
    return {
        ...process.env, ...noCacheEnvironment('browser-testing'),
        APP_ENV: 'local', APP_KEY: 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        APP_DEBUG: 'true', APP_URL: 'http://127.0.0.1:8000', APP_TIMEZONE: 'Asia/Tehran',
        APP_LOCALE: 'fa', APP_FALLBACK_LOCALE: 'en', APP_FAKER_LOCALE: 'fa_IR',
        DB_CONNECTION: 'sqlite', DB_DATABASE: resolve(root, 'database', 'browser-testing.sqlite'),
        DB_FOREIGN_KEYS: 'true', DB_URL: '', CACHE_STORE: 'array',
        SESSION_DRIVER: 'file', SESSION_FILES: resolve(runtimeDir, 'sessions'),
        SESSION_COOKIE: 'rad_browser_test_session', SESSION_DOMAIN: '',
        SESSION_SECURE_COOKIE: 'false', SESSION_SAME_SITE: 'lax',
        MAIL_MAILER: 'array', QUEUE_CONNECTION: 'sync', LOG_CHANNEL: 'stderr',
        FILESYSTEM_DISK: 'local',
        RAD_ART_LOCAL_STORAGE_PATH: resolve(root, 'storage', 'app', 'browser-testing', 'private'),
        RAD_ART_PUBLIC_STORAGE_PATH: resolve(root, 'storage', 'app', 'browser-testing', 'public'),
        VIEW_COMPILED_PATH: resolve(runtimeDir, 'views'),
        RAD_ART_BROWSER_TEST_MODE: '1',
    };
}

function ensureBrowserDatabase() {
    const databasePath = resolve(root, 'database', 'browser-testing.sqlite');
    mkdirSync(dirname(databasePath), { recursive: true });
    if (existsSync(databasePath)) {
        const stats = lstatSync(databasePath);
        if (stats.isSymbolicLink() || !stats.isFile()) throw new Error('The isolated browser-test database must be a regular file.');
    } else writeFileSync(databasePath, '');
}

function resetBrowserRuntime() {
    const appRuntimeDir = resolve(root, 'storage', 'app', 'browser-testing');
    const frameworkRuntimeDir = resolve(root, 'storage', 'framework', 'browser-testing');
    for (const directory of [appRuntimeDir, frameworkRuntimeDir]) {
        if (existsSync(directory) && lstatSync(directory).isSymbolicLink()) {
            throw new Error('Refusing to reset browser-test storage through a symbolic link: ' + directory);
        }
    }
    rmSync(appRuntimeDir, { recursive: true, force: true });
    rmSync(frameworkRuntimeDir, { recursive: true, force: true });
    for (const directory of [
        resolve(frameworkRuntimeDir, 'sessions'), resolve(frameworkRuntimeDir, 'views'),
        resolve(appRuntimeDir, 'private'), resolve(appRuntimeDir, 'public'),
    ]) mkdirSync(directory, { recursive: true });
}

async function prepareBrowserEnvironment() {
    ensureBrowserDatabase();
    resetBrowserRuntime();
    console.log('[project] Preparing the isolated Playwright SQLite database and storage.');
    await run(php, ['artisan', 'migrate:fresh', '--seed'], { env: browserTestEnvironment() });
}

async function runBackendTests(suite = 'backend') {
    ensureReportDirectory();
    const reportPath = 'build/test-reports/' + suite + '-junit.xml';
    rmSync(reportPath, { force: true });
    const args = ['vendor/bin/phpunit', '--do-not-cache-result', '--log-junit=' + reportPath];
    if (suite !== 'backend') args.push('--testsuite=' + suite[0].toUpperCase() + suite.slice(1));
    await run(php, args, { env: testEnvironment() });
}

async function runFrontendTests() {
    ensureReportDirectory();
    rmSync(resolve(root, 'build', 'test-reports', 'frontend-junit.xml'), { force: true });
    await run(process.execPath, [
        '--test', '--test-reporter=spec', '--test-reporter-destination=stdout',
        '--test-reporter=junit', '--test-reporter-destination=build/test-reports/frontend-junit.xml',
        'tests/js/*.test.js',
    ]);
}

async function generateQualityReport() {
    mkdirSync(resolve(root, 'build', 'test-reports'), { recursive: true });
    await run(python, pythonArgs(['scripts/summarize_test_reports.py']));
}

async function runReportingTests() {
    await run(python, pythonArgs(['-m', 'unittest', 'discover', '-s', 'tests/python', '-p', 'test_*.py']));
}

async function startDevelopment() {
    runDevelopmentPreflight({ root, processValues: process.env });
    const host = requireLanHost();
    const env = developmentEnvironment(host);
    console.log('[project] Local development: https://rad.localhost');
    console.log('[project] LAN development: https://' + host);
    console.log('[project] Optional LAN hostname: https://rad.home.arpa (configure local DNS first).');
    console.log('[project] Laravel and Vite remain on loopback; Caddy is the only LAN-facing service.');
    return startServices([
        { label: 'Laravel (loopback)', command: php, args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'], env },
        { label: 'Vite (loopback, LAN-aware HMR)', command: npm, args: ['exec', '--', 'vite', '--mode', 'lan'], env },
        { label: 'Caddy HTTPS reverse proxy (local + LAN)', command: 'caddy', args: ['run', '--config', 'Caddyfile.dev', '--adapter', 'caddyfile'], env },
    ]);
}

function verifyProductionManifest(manifestPath) {
    if (!existsSync(manifestPath)) throw new Error('Vite build completed without producing the expected manifest: ' + manifestPath);
    let manifest;
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); }
    catch { throw new Error('Vite produced an unreadable manifest: ' + manifestPath); }

    for (const entryName of ['resources/css/app.css', 'resources/js/app.jsx']) {
        const entry = manifest[entryName];
        if (!entry || typeof entry.file !== 'string') throw new Error('Production manifest is missing the required entry: ' + entryName);
        for (const asset of [entry.file, ...(entry.css ?? [])]) {
            const outputRoot = resolve(dirname(manifestPath));
            const assetPath = resolve(outputRoot, asset);
            const relativeAsset = relative(outputRoot, assetPath);
            const escapesOutput = relativeAsset === '..' || relativeAsset.startsWith('..' + sep) || isAbsolute(relativeAsset);
            if (!asset || escapesOutput || !existsSync(assetPath)) throw new Error('Production build references a missing or unsafe asset: ' + asset);
        }
    }
}

async function buildProduction(cpanel = false) {
    if (existsSync(resolve(root, 'public', 'hot'))) throw new Error('public/hot exists. Stop the Vite development server before creating production assets.');
    const viteCli = resolve(root, 'node_modules', 'vite', 'bin', 'vite.js');
    if (!existsSync(viteCli)) throw new Error('Vite is not installed. Run npm run setup before building production assets.');
    const args = [viteCli, 'build'];
    if (cpanel) args.push('--config', 'vite.config.cpanel.js');
    await run(process.execPath, args);
    const manifestPath = resolve(root, cpanel ? 'build/manifest.json' : 'public/build/manifest.json');
    verifyProductionManifest(manifestPath);
    console.log('[project] Production asset manifest and required CSS/JS files verified.');
}
async function waitForBrowserApp(stopServices) {
    const healthUrl = 'http://127.0.0.1:8000/api/v1/health';
    const viteUrl = 'http://127.0.0.1:5173/@vite/client';
    const deadline = Date.now() + 45000;
    let lastError = 'services are starting';
    while (Date.now() < deadline) {
        const failure = stopServices.failure();
        if (failure) throw failure;
        try {
            const healthResponse = await fetch(healthUrl, { headers: { Accept: 'application/json' } });
            const health = await healthResponse.json();
            const viteResponse = await fetch(viteUrl);
            if (healthResponse.ok && health.browser_test_ready === true && viteResponse.ok) return;
            lastError = 'Laravel health or Vite readiness check returned an unexpected response';
        } catch (error) {
            lastError = error.message;
        }
        await new Promise((resolveWait) => setTimeout(resolveWait, 500));
    }
    throw new Error('Temporary Playwright app did not become ready at ' + healthUrl + '. Last observation: ' + lastError);
}

async function runBrowserTests() {
    await prepareBrowserEnvironment();
    const env = browserTestEnvironment();
    const stopServices = await startServices([
        {
            label: 'Temporary isolated Laravel app (loopback)',
            command: php, args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'], env,
        },
        {
            label: 'Temporary Vite development server (loopback)',
            command: npm, args: ['exec', '--', 'vite', '--mode', 'browser-test'],
            env,
        },
    ]);
    try {
        await waitForBrowserApp(stopServices);
        await run(python, pythonArgs(['tests/browser/run_tests.py', ...process.argv.slice(3)]), {
            env: {
                ...env, RAD_ART_TEST_MODE: '1',
                RAD_ART_BASE_URL: 'http://127.0.0.1:8000',
                RAD_ART_IGNORE_HTTPS_ERRORS: 'false',
            },
        });
    } finally {
        stopServices(0);
    }
}

function usage() {
    console.log([
        'Rademan project tasks',
        'setup                 Install dependencies and create .env if absent',
        'dev                   Validate local configuration, then start Laravel + Vite + Caddy',
        'production            Build and verify standard production assets',
        'build:cpanel          Build and verify cPanel production assets',
        'db:sqlite:init        Create the local SQLite database file if absent',
        'test:backend          Run all PHPUnit suites',
        'test:unit             Run PHPUnit Unit',
        'test:feature          Run PHPUnit Feature',
        'test:integration      Run PHPUnit Integration',
        'test:frontend         Run frontend Node tests',
        'test:browser          Prepare isolated SQLite and run Playwright temporarily',
        'test:report           Summarize existing JUnit reports',
        'test:reporting        Test the report generator',
    ].join(String.fromCharCode(10)));
}

const task = process.argv[2];
try {
    switch (task) {
        case 'setup': await setup(); break;
        case 'db:sqlite:init': initializeSqlite(); break;
        case 'dev': await startDevelopment(); break;
        case 'production': await buildProduction(false); break;
        case 'build:cpanel': await buildProduction(true); break;
        case 'test:backend': await runBackendTests(); break;
        case 'test:unit':
        case 'test:feature':
        case 'test:integration': await runBackendTests(task.slice(5)); break;
        case 'test:frontend': await runFrontendTests(); break;
        case 'test:browser': await runBrowserTests(); break;
        case 'test:report': await generateQualityReport(); break;
        case 'test:reporting': await runReportingTests(); break;
        case '--help':
        case '-h':
        case undefined: usage(); break;
        default:
            console.error('Unknown task: ' + task);
            usage();
            process.exitCode = 2;
    }
} catch (error) {
    console.error('[project] ' + error.message);
    process.exitCode = 1;
}
