import { spawn } from 'node:child_process';

const commands = [
    {
        name: 'Laravel',
        command: 'php',
        args: ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
    },
    {
        name: 'Vite',
        command: 'npm',
        args: ['run', 'dev:https'],
    },
    {
        name: 'Caddy',
        command: 'caddy',
        args: ['run', '--config', 'Caddyfile.dev'],
    },
];

const children = [];
let stopping = false;

function stopAll(exitCode = 0) {
    if (stopping) return;
    stopping = true;

    for (const child of children) {
        if (!child.killed) child.kill();
    }

    process.exitCode = exitCode;
}

for (const task of commands) {
    console.log(`[dev:local] Starting ${task.name}...`);

    const child = spawn(task.command, task.args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });

    children.push(child);

    child.on('error', (error) => {
        console.error(`[dev:local] Could not start ${task.name}: ${error.message}`);
        console.error('[dev:local] Check that PHP, Node/npm, and Caddy are installed and available on PATH.');
        stopAll(1);
    });

    child.on('exit', (code, signal) => {
        if (!stopping) {
            console.error(`[dev:local] ${task.name} stopped (code: ${code}, signal: ${signal}). Stopping the other services.`);
            stopAll(code ?? 1);
        }
    });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
