#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'build');
const outputZip = path.join(outputDir, 'rad-file.zip');
const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rad-file-cpanel-'));
const stagingDir = path.join(stagingRoot, 'public_html');
const isWindows = process.platform === 'win32';

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: root,
        stdio: 'inherit',
        shell: isWindows,
        ...options,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(command + ' failed with exit code ' + result.status);
}

function shouldCopy(sourcePath) {
    const relativePath = path.relative(root, sourcePath).split(path.sep).join('/');
    if (!relativePath) return true;

    const segments = relativePath.split('/');
    const first = segments[0];
    const base = path.basename(sourcePath);

    if (
        first === '.git' ||
        first === 'node_modules' ||
        first === '.github' ||
        first === '.agents' ||
        first === 'tests' ||
        first === '.vscode' ||
        first === '.idea' ||
        first.startsWith('.env') && relativePath !== '.env.example' ||
        relativePath === 'rad-file.zip' ||
        relativePath === 'build/rad-file.zip' ||
        base === '.DS_Store' ||
        base === 'Thumbs.db'
    ) return false;

    if (first === 'build' && relativePath !== 'build' && relativePath !== 'build/assets' && relativePath !== 'build/manifest.json' && !relativePath.startsWith('build/assets/')) {
        return false;
    }

    if (first === 'resources' && relativePath !== 'resources' && relativePath !== 'resources/views' && !relativePath.startsWith('resources/views/')) {
        return false;
    }

    if (first === 'database' && /\.(?:sqlite|sqlite3|db|sql)(?:\.gz)?$/i.test(relativePath)) {
        return false;
    }

    const excluded = [
        'storage/logs',
        'storage/framework/cache',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/app/private',
        'storage/app/public',
        'public/storage',
    ];
    if (excluded.some((item) => relativePath === item || relativePath.startsWith(item + '/'))) return false;
    if (relativePath.startsWith('bootstrap/cache/') && !['packages.php', 'services.php'].includes(base)) return false;

    return true;
}

function createZip() {
    if (isWindows) {
        const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
        const command = 'Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory(' + quote(stagingDir) + ', ' + quote(outputZip) + ', [System.IO.Compression.CompressionLevel]::Fastest, $false)';
        run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command]);
    } else {
        run('zip', ['-qr', outputZip, '.'], { cwd: stagingDir });
    }
}

try {
    console.log('[cPanel] Building production Vite assets...');
    run(isWindows ? 'node.exe' : 'node', ['scripts/project.mjs', 'build:cpanel']);

    fs.mkdirSync(stagingDir, { recursive: true });
    for (const name of fs.readdirSync(root)) {
        const source = path.join(root, name);
        if (!shouldCopy(source)) continue;
        fs.cpSync(source, path.join(stagingDir, name), {
            recursive: true,
            filter: shouldCopy,
            dereference: false,
        });
    }

    for (const directory of [
        'bootstrap/cache',
        'storage/app/private',
        'storage/app/public',
        'storage/framework/cache/data',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/logs',
    ]) fs.mkdirSync(path.join(stagingDir, directory), { recursive: true });

    fs.mkdirSync(outputDir, { recursive: true });
    createZip();

    const sizeMb = (fs.statSync(outputZip).size / 1024 / 1024).toFixed(2);
    console.log('[cPanel] Created ' + path.relative(root, outputZip) + ' (' + sizeMb + ' MB).');
    console.log('[cPanel] Extract the archive contents directly into public_html.');
    console.log('[cPanel] Create the production .env on the server; it is not included.');
} finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
}
