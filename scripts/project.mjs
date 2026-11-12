#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
    for (const [label, command, args] of steps) {
        console.log(`\n[project] ${label}\n`);
        await run(command, args);
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
            env: process.env,
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

async function verifyBackend() {
    await runSteps([
        ['Backend tests', php, ['artisan', 'test']],
        ['PHP style', composer, ['lint']],
    ]);
}

async function verifyFrontend() {
    await runSteps([
        ['Frontend tests', npm, ['run', 'test:frontend']],
        ['Frontend lint', npm, ['run', 'lint']],
        ['Standard production build', npm, ['run', 'build']],
        ['cPanel production build', npm, ['run', 'build:cpanel']],
    ]);
}

async function verify(includeBrowser = false) {
    await verifyBackend();
    await verifyFrontend();
    if (includeBrowser) {
        console.log('\n[project] Browser tests require the local app to be running.\n');
        await run(python, pythonArgs(['tests/browser/run_tests.py']));
    }
}

function startDevelopment(secure = false) {
    const services = [
        {
            label: 'Laravel',
            command: php,
            args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
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
  setup             Install Composer/npm packages and create .env if missing
  db:sqlite:init    Create database/database.sqlite if it does not exist

Development
  dev               Start Laravel + Vite over local HTTP
  dev:https          Start Laravel + Vite + Caddy at https://rad.localhost

Database (review .env before running)
  db:migrate         Apply pending migrations
  db:seed            Run DatabaseSeeder (demo data; local/testing only)
  db:seed:demo       Run DemoDatabaseSeeder (local/testing only)
  db:fresh           DESTRUCTIVE: drop all tables, migrate and seed

Quality
  test               Run backend and frontend tests
  backend            Backend tests + PHP style (legacy verify alias)
  frontend           Frontend tests + lint + both builds (legacy verify alias)
  verify             Run tests, PHP/JS lint and both production builds
  verify:all         Run verify plus Playwright (requires a running local app)
  browser            Run Playwright browser tests against RAD_ART_BASE_URL or http://127.0.0.1:8000

Build
  build              Standard Vite production build
  build:cpanel       cPanel-targeted build
  preview            Serve the standard production build locally (npm script)

Production
  prod:optimize      Cache Laravel configuration, routes, events and views
  prod:clear         Clear Laravel optimization caches
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
            await runSteps([
                ['Backend tests', php, ['artisan', 'test']],
                ['Frontend tests', npm, ['run', 'test:frontend']],
            ]);
            break;
        case 'backend':
            await verifyBackend();
            break;
        case 'frontend':
            await verifyFrontend();
            break;
        case 'all':
            await verify(true);
            break;
        case 'verify':
            await verify(false);
            break;
        case 'verify:all':
            await verify(true);
            break;
        case 'browser':
            await run(python, pythonArgs(['tests/browser/run_tests.py']));
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
