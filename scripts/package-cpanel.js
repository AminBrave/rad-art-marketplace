#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'build');
const outputZip = path.join(outputDir, 'rad-file.zip');
const isWindows = process.platform === 'win32';

const archivePaths = [
    '.htaccess',
    'index.php',
    'artisan',
    'composer.json',
    'composer.lock',
    'app',
    'bootstrap',
    'config',
    'database',
    'resources',
    'routes',
    'storage',
    'vendor',
    'build/manifest.json',
    'build/assets',
];

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: root,
        stdio: 'inherit',
        ...options,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(command + ' failed with exit code ' + result.status);
}

console.log('[cPanel] Building production assets...');
run(process.execPath, ['scripts/project.mjs', 'build:cpanel']);

fs.mkdirSync(outputDir, { recursive: true });
fs.rmSync(outputZip, { force: true });

console.log('[cPanel] Creating ZIP...');
if (isWindows) {
    run('tar.exe', ['-a', '-c', '-f', outputZip, '-C', root, ...archivePaths]);
} else {
    run('zip', ['-q', '-r', outputZip, ...archivePaths]);
}

console.log('[cPanel] Created build/rad-file.zip');
