import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputZip = path.join(projectRoot, 'rad-file.zip');
const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rad-file-cpanel-'));
const stagingDir = path.join(stagingRoot, 'package');

const requiredFiles = [
    'index.php',
    '.htaccess',
    'vendor/autoload.php',
    'build/manifest.json',
];

for (const relativePath of requiredFiles) {
    if (!fs.existsSync(path.join(projectRoot, relativePath))) {
        console.error(`Missing required deployment file: ${relativePath}`);
        console.error('Install Composer dependencies and run the cPanel build before packaging.');
        process.exitCode = 1;
        fs.rmSync(stagingRoot, { recursive: true, force: true });
        process.exit();
    }
}

function shouldCopy(sourcePath) {
    const relativePath = path.relative(projectRoot, sourcePath).split(path.sep).join('/');
    if (!relativePath) return true;

    const segments = relativePath.split('/');
    const first = segments[0];

    // Never package environment files, Git metadata, local dependencies, or this archive.
    if (
        first === '.git' ||
        first === 'node_modules' ||
        first === 'rad-file' ||
        relativePath === 'rad-file.zip' ||
        first.startsWith('.env')
    ) {
        return false;
    }

    // Do not ship runtime logs, sessions, generated caches, private uploads, or public symlinks.
    const excludedPaths = [
        'storage/logs',
        'storage/framework/cache',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/app/private',
        'public/storage',
    ];

    if (excludedPaths.some((excluded) => relativePath === excluded || relativePath.startsWith(`${excluded}/`))) {
        return false;
    }

    // Laravel regenerates compiled bootstrap cache files on the server.
    if (relativePath.startsWith('bootstrap/cache/') && relativePath.endsWith('.php')) {
        return false;
    }

    // Exclude common machine-specific editor files.
    if (
        segments.includes('.idea') ||
        segments.includes('.vscode') ||
        path.basename(sourcePath) === '.DS_Store' ||
        path.basename(sourcePath) === 'Thumbs.db'
    ) {
        return false;
    }

    return true;
}

try {
    fs.mkdirSync(stagingDir, { recursive: true });
    fs.cpSync(projectRoot, stagingDir, {
        recursive: true,
        filter: shouldCopy,
    });

    fs.rmSync(outputZip, { force: true });

    if (process.platform === 'win32') {
        const quote = (value) => `'${value.replaceAll("'", "''")}'`;
        const command = `Compress-Archive -Path (Join-Path ${quote(stagingDir)} '*') -DestinationPath ${quote(outputZip)} -Force`;
        const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
            stdio: 'inherit',
        });

        if (result.status !== 0) {
            throw new Error('PowerShell could not create rad-file.zip.');
        }
    } else {
        const result = spawnSync('zip', ['-qr', outputZip, '.'], {
            cwd: stagingDir,
            stdio: 'inherit',
        });

        if (result.error || result.status !== 0) {
            throw new Error('The zip command is required to create rad-file.zip.');
        }
    }

    const sizeMb = (fs.statSync(outputZip).size / 1024 / 1024).toFixed(2);
    console.log(`\\nCreated: ${outputZip}`);
    console.log(`Archive size: ${sizeMb} MB`);
    console.log('Included: Laravel source, vendor, root build assets, index.php, and .htaccess.');
    console.log('Excluded: .env files, Git metadata, node_modules, runtime caches/logs, and private uploads.');
} finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
}
