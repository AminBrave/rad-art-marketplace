import {
    copyFileSync,
    existsSync,
    lstatSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(projectRoot, 'build');
const outputPath = resolve(outputDirectory, 'rad-file.zip');
const isWindows = process.platform === 'win32';
const composerCommand = isWindows ? 'composer.bat' : 'composer';
const pythonCommand = isWindows ? 'py' : 'python3';
const pythonPrefix = isWindows ? ['-3'] : [];

function fail(message) {
    throw new Error(message);
}

function requireFile(path, label) {
    const fullPath = resolve(projectRoot, path);
    if (!existsSync(fullPath) || !lstatSync(fullPath).isFile()) {
        fail('Required ' + label + ' is missing: ' + path);
    }
    return fullPath;
}

function copyTree(source, destination, include = () => true, relativePath = '') {
    const sourceInfo = lstatSync(source);
    if (sourceInfo.isSymbolicLink()) {
        fail('Refusing to package a symbolic link: ' + source);
    }
    if (sourceInfo.isDirectory()) {
        mkdirSync(destination, { recursive: true });
        for (const name of readdirSync(source).sort()) {
            const childRelative = relativePath ? relativePath + '/' + name : name;
            const childSource = join(source, name);
            const childInfo = lstatSync(childSource);
            if (childInfo.isSymbolicLink()) {
                fail('Refusing to package a symbolic link: ' + childSource);
            }
            if (!include(childRelative, childInfo)) continue;
            copyTree(childSource, join(destination, name), include, childRelative);
        }
        return;
    }
    if (!sourceInfo.isFile()) {
        fail('Refusing to package a non-regular file: ' + source);
    }
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(source, destination);
}

function copyRequiredDirectory(name, stage, include) {
    const source = resolve(projectRoot, name);
    if (!existsSync(source) || !lstatSync(source).isDirectory()) {
        fail('Required project directory is missing: ' + name);
    }
    copyTree(source, resolve(stage, name), include);
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: projectRoot,
        encoding: 'utf8',
        shell: isWindows,
        ...options,
    });
    if (result.error) fail('Could not start ' + command + ': ' + result.error.message);
    if (result.status !== 0) {
        const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
        fail(command + ' failed with exit code ' + result.status + (details ? ':\n' + details : '.'));
    }
    return result;
}

function validateBuildOutput() {
    const manifestPath = requireFile('build/manifest.json', 'cPanel Vite manifest');
    const assetsPath = resolve(projectRoot, 'build/assets');
    if (!existsSync(assetsPath) || !lstatSync(assetsPath).isDirectory()) {
        fail('The cPanel Vite build did not create build/assets/.');
    }

    let manifest;
    try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    } catch {
        fail('The cPanel Vite manifest is not valid JSON.');
    }
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        fail('The cPanel Vite manifest must contain an object of build entries.');
    }
    for (const entryName of ['resources/css/app.css', 'resources/js/app.jsx']) {
        if (!manifest[entryName]?.file) fail('The cPanel Vite manifest is missing ' + entryName + '.');
    }
}

function createRuntimeDirectories(stage) {
    for (const directory of [
        'bootstrap/cache',
        'storage/app/private',
        'storage/app/public',
        'storage/framework/cache/data',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/logs',
    ]) {
        mkdirSync(resolve(stage, directory), { recursive: true, mode: 0o775 });
    }
}

function prepareStage(stage) {
    for (const name of ['.htaccess', 'index.php', 'artisan', 'composer.json', 'composer.lock', '.env.example']) {
        const source = requireFile(name, 'deployment file');
        copyFileSync(source, resolve(stage, name));
    }

    for (const name of ['app', 'config', 'database', 'routes']) {
        copyRequiredDirectory(name, stage, (path) => {
            if (name !== 'database') return true;
            return !/\.(?:sqlite|sqlite3|db)(?:[-.].*)?$/i.test(path)
                && !/\.(?:sql|sql\.gz)$/i.test(path);
        });
    }

    const bootstrapCacheFilter = (path) => !path.startsWith('cache/') || path === 'cache/.gitignore';
    copyRequiredDirectory('bootstrap', stage, bootstrapCacheFilter);

    const views = resolve(projectRoot, 'resources/views');
    if (!existsSync(views) || !lstatSync(views).isDirectory()) {
        fail('Required Laravel Blade views are missing: resources/views');
    }
    copyTree(views, resolve(stage, 'resources/views'));

    const languageDirectory = resolve(projectRoot, 'lang');
    if (existsSync(languageDirectory)) copyTree(languageDirectory, resolve(stage, 'lang'));

    const manifest = requireFile('build/manifest.json', 'cPanel Vite manifest');
    copyFileSync(manifest, resolve(stage, 'build/manifest.json'));
    copyRequiredDirectory('build/assets', stage);

    createRuntimeDirectories(stage);
}

function installProductionDependencies(stage) {
    run(composerCommand, ['--version']);
    console.log('[cpanel] Installing locked PHP production dependencies in the temporary package tree.');
    run(composerCommand, [
        'install',
        '--no-dev',
        '--prefer-dist',
        '--optimize-autoloader',
        '--no-interaction',
        '--no-progress',
    ], { cwd: stage });

    if (!existsSync(resolve(stage, 'vendor/autoload.php'))) {
        fail('Composer completed without creating vendor/autoload.php.');
    }
}

const zipAndValidate = String.raw`
import json
import os
import sys
import zipfile

stage, output = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9, allowZip64=True) as archive:
    for current, directories, files in os.walk(stage):
        directories.sort()
        files.sort()
        for name in directories:
            path = os.path.join(current, name)
            if os.path.islink(path):
                raise SystemExit("Refusing to archive symbolic link: " + path)
            relative = os.path.relpath(path, stage).replace(os.sep, "/") + "/"
            archive.write(path, relative)
        for name in files:
            path = os.path.join(current, name)
            if os.path.islink(path) or not os.path.isfile(path):
                raise SystemExit("Refusing to archive non-regular file: " + path)
            relative = os.path.relpath(path, stage).replace(os.sep, "/")
            archive.write(path, relative)

with zipfile.ZipFile(output, "r") as archive:
    bad_entry = archive.testzip()
    if bad_entry:
        raise SystemExit("ZIP integrity check failed at: " + bad_entry)
    names = set(archive.namelist())
    required = {
        ".htaccess",
        "index.php",
        "artisan",
        "composer.json",
        "composer.lock",
        "vendor/autoload.php",
        "build/manifest.json",
    }
    missing = sorted(required - names)
    if missing:
        raise SystemExit("ZIP is missing required root entries: " + ", ".join(missing))
    forbidden = []
    for name in names:
        normalized = name.rstrip("/")
        parts = normalized.split("/")
        if normalized == ".env" or (normalized.startswith(".env.") and normalized != ".env.example"):
            forbidden.append(name)
        if any(part in {".git", "node_modules"} for part in parts) or parts[0] == "tests":
            forbidden.append(name)
        if normalized.startswith(("storage/app/private/", "storage/app/public/", "storage/logs/")):
            forbidden.append(name)
        if normalized.startswith(("storage/framework/cache/", "storage/framework/sessions/", "storage/framework/views/")):
            forbidden.append(name)
        if normalized.endswith((".sqlite", ".sqlite3", ".db")):
            forbidden.append(name)
    if forbidden:
        raise SystemExit("ZIP contains excluded development or private paths: " + ", ".join(sorted(set(forbidden))[:20]))

    manifest = json.loads(archive.read("build/manifest.json"))
    referenced = set()
    for entry in manifest.values():
        if not isinstance(entry, dict):
            continue
        for key in ("file",):
            if isinstance(entry.get(key), str):
                referenced.add("build/" + entry[key].lstrip("/"))
        for key in ("css", "assets"):
            for item in entry.get(key, []):
                if isinstance(item, str):
                    referenced.add("build/" + item.lstrip("/"))
    missing_assets = sorted(path for path in referenced if path not in names)
    if missing_assets:
        raise SystemExit("ZIP is missing manifest assets: " + ", ".join(missing_assets[:20]))
`;

export async function packageCpanel() {
    validateBuildOutput();
    requireFile('.htaccess', 'root Apache security rules');
    requireFile('index.php', 'root Laravel front controller');
    requireFile('composer.lock', 'Composer lock file');
    mkdirSync(outputDirectory, { recursive: true });

    const stageParent = mkdtempSync(join(tmpdir(), 'rademan-cpanel-'));
    const stage = resolve(stageParent, 'public_html');
    const temporaryArchive = outputPath + '.tmp-' + process.pid;
    const backupArchive = outputPath + '.previous-' + process.pid;

    try {
        mkdirSync(stage, { recursive: true });
        prepareStage(stage);
        installProductionDependencies(stage);

        const pythonArgs = [...pythonPrefix, '-c', zipAndValidate, stage, temporaryArchive];
        console.log('[cpanel] Creating and validating a ZIP with public_html contents at its root.');
        run(pythonCommand, pythonArgs, { cwd: outputDirectory });

        if (existsSync(outputPath)) renameSync(outputPath, backupArchive);
        try {
            renameSync(temporaryArchive, outputPath);
            if (existsSync(backupArchive)) rmSync(backupArchive, { force: true });
        } catch (error) {
            if (existsSync(backupArchive) && !existsSync(outputPath)) renameSync(backupArchive, outputPath);
            throw error;
        }

        console.log('[cpanel] Created ' + relative(projectRoot, outputPath) + '.');
        console.log('[cpanel] The ZIP passed its integrity, required-entry, exclusion, and Vite-manifest checks.');
        console.log('[cpanel] Extract the ZIP contents directly into public_html. Create the production .env on the server; it is not included.');
    } finally {
        rmSync(stageParent, { recursive: true, force: true });
        rmSync(temporaryArchive, { force: true });
        if (existsSync(backupArchive) && existsSync(outputPath)) rmSync(backupArchive, { force: true });
    }
}
