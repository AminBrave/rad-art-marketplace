#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'build');
const outputZip = path.join(outputDir, 'rad-file.zip');
const temporaryZip = outputZip + '.tmp.zip';
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

function required(relativePath) {
    const fullPath = path.join(root, relativePath);
    if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
        throw new Error('Missing required deployment file: ' + relativePath);
    }
    return fullPath;
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

    if (fs.lstatSync(sourcePath).isSymbolicLink()) throw new Error('Refusing to package symbolic link: ' + sourcePath);
    return true;
}

function validateManifest() {
    const manifestPath = required('build/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        throw new Error('build/manifest.json must contain an object.');
    }
    for (const entry of ['resources/css/app.css', 'resources/js/app.jsx']) {
        if (!manifest[entry]?.file) throw new Error('Vite manifest is missing ' + entry);
    }
    for (const value of Object.values(manifest)) {
        for (const asset of [value?.file, ...(value?.css || []), ...(value?.assets || [])]) {
            if (asset && !fs.existsSync(path.join(root, 'build', asset))) {
                throw new Error('Vite manifest references a missing asset: ' + asset);
            }
        }
    }
}

function createZip() {
    if (isWindows) {
        const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
        const command = 'Compress-Archive -Path (Join-Path ' + quote(stagingDir) + " '*') -DestinationPath " + quote(temporaryZip) + ' -CompressionLevel Fastest -Force';
        run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command]);
    } else {
        run('zip', ['-qr', temporaryZip, '.'], { cwd: stagingDir });
    }
}

try {
    for (const item of ['.htaccess', 'index.php', 'artisan', 'composer.json', 'composer.lock', '.env.example', 'vendor/autoload.php']) required(item);

    console.log('[cPanel] Building production Vite assets...');
    run(isWindows ? 'node.exe' : 'node', ['scripts/project.mjs', 'build:cpanel']);
    validateManifest();

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

    if (!fs.existsSync(path.join(stagingDir, 'vendor/autoload.php'))) {
        throw new Error('The existing vendor/autoload.php was not included in the deployment staging directory.');
    }

    fs.mkdirSync(outputDir, { recursive: true });
    const previousZip = outputZip + '.previous';
    fs.rmSync(temporaryZip, { force: true });
    fs.rmSync(previousZip, { force: true });

    try {
        createZip();
        if (fs.existsSync(outputZip)) fs.renameSync(outputZip, previousZip);
        fs.renameSync(temporaryZip, outputZip);
        fs.rmSync(previousZip, { force: true });
    } catch (error) {
        fs.rmSync(temporaryZip, { force: true });
        if (fs.existsSync(previousZip) && !fs.existsSync(outputZip)) fs.renameSync(previousZip, outputZip);
        throw error;
    }

    const sizeMb = (fs.statSync(outputZip).size / 1024 / 1024).toFixed(2);
    console.log('[cPanel] Created ' + path.relative(root, outputZip) + ' (' + sizeMb + ' MB).');
    console.log('[cPanel] Extract the archive contents directly into public_html.');
    console.log('[cPanel] Create the production .env on the server; it is not included.');
} finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
}
