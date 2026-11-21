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
    '.env.cpanel',
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

for (const requiredPath of ['.env.cpanel', 'build/manifest.json', 'build/assets']) {
    if (!fs.existsSync(path.join(root, requiredPath))) {
        throw new Error('[cPanel] Required package path is missing: ' + requiredPath);
    }
}
if (!fs.statSync(path.join(root, 'build/assets')).isDirectory()) {
    throw new Error('[cPanel] Expected build/assets to be a directory.');
}

console.log('[cPanel] Creating ZIP...');
if (isWindows) {
    const winRarCandidates = [
        process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'WinRAR', 'WinRAR.exe'),
        process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'WinRAR', 'WinRAR.exe'),
    ].filter(Boolean);
    const winRar = winRarCandidates.find(candidate => fs.existsSync(candidate));

    if (winRar) {
        run(winRar, ['a', '-afzip', '-m5', outputZip, ...archivePaths]);
    } else {
        run('tar.exe', ['-a', '-c', '-f', path.relative(root, outputZip), ...archivePaths]);
    }
} else {
    run('zip', ['-q', '-r', '-9', outputZip, ...archivePaths]);
}

console.log('[cPanel] Created build/rad-file.zip');
