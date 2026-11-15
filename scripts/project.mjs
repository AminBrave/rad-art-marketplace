#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { copyFileSync, createWriteStream, existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIP } from 'node:net';
import { networkInterfaces } from 'node:os';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { parseDotEnv, runDevelopmentPreflight } from './dev-environment.mjs';

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
        VIEW_COMPILED_PATH: resolve(root, 'storage', 'framework', 'testing', 'views'),
    };
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

function developmentArtisanEnvironment() {
    return {
        ...process.env, ...noCacheEnvironment('development'),
        APP_ENV: 'local', APP_DEBUG: 'true', APP_URL: 'http://localhost',
        SESSION_DOMAIN: '', SESSION_SECURE_COOKIE: 'false',
    };
}

async function runDevelopmentArtisan(args) {
    runDevelopmentPreflight({ root, processValues: process.env, requireFrontend: false, checkHotFile: false });
    await run(php, ['artisan', ...args], { env: developmentArtisanEnvironment() });
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
async function auditBuiltColorAccessibility() {
    const outputDirectory = resolve(root, 'build', 'a11y-css');
    const manifestPath = resolve(outputDirectory, 'manifest.json');
    const viteCli = resolve(root, 'node_modules', 'vite', 'bin', 'vite.js');
    if (!existsSync(viteCli)) throw new Error('Vite is not installed. Run npm run setup before auditing compiled CSS.');

    // Use an isolated output directory so this audit can run while the normal
    // development Vite server is active. It never touches public/build or .env.
    await run(process.execPath, [
        viteCli, 'build', '--outDir', 'build/a11y-css', '--manifest', 'manifest.json', '--emptyOutDir',
    ]);
    verifyProductionManifest(manifestPath);
    await run(process.execPath, ['scripts/audit-built-css.mjs']);
}

async function runBrowserTests() {
    runDevelopmentPreflight({ root, processValues: process.env, requireFrontend: true, checkHotFile: false });
    const envPath = resolve(root, '.env');
    if (!existsSync(envPath)) throw new Error('The existing development .env is required. Run npm run setup and configure it first.');
    const values = { ...parseDotEnv(readFileSync(envPath, 'utf8')), ...process.env };
    const configuredUrl = String(values.DB_URL ?? '').trim();
    const environment = String(values.APP_ENV ?? 'local').toLowerCase();
    const driver = String(values.DB_CONNECTION ?? 'mysql').toLowerCase();
    if (!['local', 'development'].includes(environment)) {
        throw new Error('Playwright can only attach to the current local development environment (APP_ENV=local or development).');
    }
    if (driver !== 'mysql' || (configuredUrl && !configuredUrl.startsWith('mysql:'))) {
        throw new Error('Playwright requires the current development .env to use the MySQL connection. No database settings were changed.');
    }
    const baseUrl = process.env.RAD_ART_BASE_URL || 'https://rad.localhost';
    console.log('[project] Running Playwright against the already-running development app at ' + baseUrl);
    console.log('[project] The existing .env MySQL/MariaDB database is used through the app. No app services, database, migrations, seeders or storage are started/reset.');
    await run(python, pythonArgs(['tests/browser/run_tests.py', ...process.argv.slice(3)]), {
        env: {
            ...process.env,
            RAD_ART_DEV_MODE: '1',
            RAD_ART_BASE_URL: baseUrl,
            RAD_ART_IGNORE_HTTPS_ERRORS: 'false',
            RAD_ART_TEST_REPORT_DIR: process.env.RAD_ART_TEST_REPORT_DIR || 'build/test-reports/browser',
        },
    });
}

function developmentMysqlConfig() {
    const fileValues = parseDotEnv(readFileSync(resolve(root, '.env'), 'utf8'));
    const values = { ...fileValues, ...process.env };
    if (String(values.DB_CONNECTION ?? 'mysql').toLowerCase() !== 'mysql') {
        throw new Error('The cPanel SQL export requires DB_CONNECTION=mysql. SQLite databases cannot be exported as a MySQL/phpMyAdmin dump by this command.');
    }

    let host = values.DB_HOST || '127.0.0.1';
    let port = values.DB_PORT || '3306';
    let username = values.DB_USERNAME || '';
    let password = values.DB_PASSWORD || '';
    let database = values.DB_DATABASE || '';
    const socket = values.DB_SOCKET || '';

    if (values.DB_URL) {
        let url;
        try { url = new URL(values.DB_URL); }
        catch { throw new Error('DB_URL is not a valid MySQL connection URL.'); }
        if (!['mysql:', 'mariadb:'].includes(url.protocol)) {
            throw new Error('DB_URL must use mysql:// or mariadb:// for the cPanel SQL export.');
        }
        host = url.hostname || host;
        port = url.port || port;
        username = decodeURIComponent(url.username) || username;
        password = decodeURIComponent(url.password) || password;
        database = decodeURIComponent(url.pathname.replace(/^\/+/, '')) || database;
    }

    if (!database) throw new Error('DB_DATABASE is empty. Set the development database name in .env.');
    if (!username) throw new Error('DB_USERNAME is empty. Set the MySQL development username in .env.');
    if (!socket && !host) throw new Error('DB_HOST is empty. Set the MySQL development host in .env.');

    const numericPort = Number(port);
    if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
        throw new Error('DB_PORT must be a valid TCP port between 1 and 65535.');
    }

    return { host, port: String(numericPort), username, password, database, socket };
}

async function exportDevelopmentDatabase() {
    runDevelopmentPreflight({ root, processValues: process.env, requireFrontend: false, checkHotFile: false });
    const config = developmentMysqlConfig();
    const outputDirectory = resolve(root, 'public', 'build', 'database-export');
    const outputPath = resolve(outputDirectory, 'rademan-development-seed.sql.gz');
    const accessPath = resolve(outputDirectory, '.htaccess');
    const accessRules = [
        'Options -Indexes',
        '<IfModule mod_authz_core.c>',
        '    Require all denied',
        '</IfModule>',
        '<IfModule !mod_authz_core.c>',
        '    Order allow,deny',
        '    Deny from all',
        '</IfModule>',
        '',
    ].join('\n');

    for (const directory of [resolve(root, 'public', 'build'), outputDirectory]) {
        if (existsSync(directory)) {
            const stats = lstatSync(directory);
            if (stats.isSymbolicLink() || !stats.isDirectory()) {
                throw new Error('Refusing to write the database export through a non-directory or symbolic link: ' + directory);
            }
        } else mkdirSync(directory);
    }

    if (existsSync(accessPath) && lstatSync(accessPath).isSymbolicLink()) {
        throw new Error('Refusing to replace a symbolic-link export access rule: ' + accessPath);
    }
    writeFileSync(accessPath, accessRules, { mode: 0o644 });

    if (existsSync(outputPath) && (lstatSync(outputPath).isSymbolicLink() || !lstatSync(outputPath).isFile())) {
        throw new Error('Refusing to replace a non-regular database export target: ' + outputPath);
    }

    const temporaryPath = outputPath + '.tmp-' + process.pid;
    if (existsSync(temporaryPath)) throw new Error('A temporary database export already exists: ' + temporaryPath);

    const args = [
        '--single-transaction', '--quick', '--skip-lock-tables', '--skip-add-locks',
        '--default-character-set=utf8mb4', '--hex-blob', '--no-tablespaces',
    ];
    if (config.socket) args.push('--socket=' + config.socket);
    else args.push('--host=' + config.host, '--port=' + config.port);
    args.push('--user=' + config.username, '--', config.database);

    const childEnvironment = { ...process.env };
    delete childEnvironment.DB_PASSWORD;
    if (config.password) childEnvironment.MYSQL_PWD = config.password;
    else delete childEnvironment.MYSQL_PWD;

    console.log('[project] Exporting the configured development MySQL database. No database rows will be changed.');
    const dump = spawn('mysqldump', args, {
        cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: childEnvironment, windowsHide: true,
    });
    let stderr = '';
    dump.stderr.setEncoding('utf8');
    dump.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-8000); });

    const streamTask = pipeline(
        dump.stdout,
        createGzip({ level: 9 }),
        createWriteStream(temporaryPath, { flags: 'wx', mode: 0o600 }),
    );
    const processTask = new Promise((resolveDump, rejectDump) => {
        dump.once('error', (error) => rejectDump(new Error('Could not start mysqldump. Install the MySQL client tools and make mysqldump available on PATH. ' + error.message)));
        dump.once('close', (code, signal) => {
            if (code === 0) resolveDump();
            else rejectDump(new Error('mysqldump failed (' + (signal ? 'signal ' + signal : 'exit code ' + code) + '). ' + stderr.trim()));
        });
    });

    try {
        await Promise.all([streamTask, processTask]);
        renameSync(temporaryPath, outputPath);
    } catch (error) {
        dump.kill();
        const results = await Promise.allSettled([streamTask, processTask]);
        rmSync(temporaryPath, { force: true });
        throw results[1].status === 'rejected' ? results[1].reason : error;
    }

    const size = lstatSync(outputPath).size;
    console.log('[project] Created ' + relative(root, outputPath) + ' (' + size + ' bytes).');
    console.log('[project] The export folder denies direct Apache web access. Retrieve the file through cPanel File Manager or FTP.');
    console.log('[project] Import it in phpMyAdmin after selecting the destination database; the dump does not create or select a database.');
}

function usage() {
    console.log([
        'Rademan project tasks',
        'setup                 Install dependencies and create .env if absent',
        'dev:check             Validate local configuration without starting services',
        'dev                   Validate local configuration, then start Laravel + Vite + Caddy',
        'production            Build and verify standard production assets',
        'a11y:build            Build Vite CSS in an isolated folder and audit compiled design tokens',
        'build:cpanel          Build and verify cPanel production assets',
        'db:sqlite:init        Create the local SQLite database file if absent',
        'db:status             Check local database migration status',
        'db:migrate            Run local database migrations',
        'db:seed               Seed the local database',
        'db:seed:demo          Seed local demo data',
        'db:fresh              Destructively recreate and seed the configured dev database',
        'db:export:cpanel       Export the current local MySQL database as a protected .sql.gz file',
        'test:backend          Run all PHPUnit suites',
        'test:unit             Run PHPUnit Unit',
        'test:feature          Run PHPUnit Feature',
        'test:integration      Run PHPUnit Integration',
        'test:frontend         Run frontend Node tests',
        'test:browser          Run all Playwright tests against the already-running local MySQL development app',
        'test:report           Summarize existing JUnit reports',
        'test:reporting        Test the report generator',
    ].join(String.fromCharCode(10)));
}
const task = process.argv[2];
try {
    switch (task) {
        case 'setup': await setup(); break;
        case 'db:sqlite:init': initializeSqlite(); break;
        case 'db:status': await runDevelopmentArtisan(['migrate:status']); break;
        case 'db:migrate': await runDevelopmentArtisan(['migrate']); break;
        case 'db:seed': await runDevelopmentArtisan(['db:seed']); break;
        case 'db:seed:demo': await runDevelopmentArtisan(['db:seed', '--class=DemoDatabaseSeeder']); break;
        case 'db:fresh': await runDevelopmentArtisan(['migrate:fresh', '--seed']); break;
        case 'db:export:cpanel': await exportDevelopmentDatabase(); break;
        case 'dev:check': runDevelopmentPreflight({ root, processValues: process.env }); break;
        case 'dev': await startDevelopment(); break;
        case 'production': await buildProduction(false); break;
        case 'a11y:build': await auditBuiltColorAccessibility(); break;
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
