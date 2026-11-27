import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = path.join(projectRoot, 'resources', 'js');
const sourceExtensions = new Set(['.js', '.jsx']);

const appEntryFile = path.join(jsRoot, 'app.jsx');
const roots = {
    app: path.join(jsRoot, 'app'),
    features: path.join(jsRoot, 'features'),
    shared: [
        path.join(jsRoot, 'shared'),
        path.join(jsRoot, 'components', 'ui'),
        path.join(jsRoot, 'lib'),
        path.join(jsRoot, 'utils'),
    ],
};

function isWithin(candidate, directory) {
    const relativePath = path.relative(directory, candidate);
    return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function walk(directory) {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) return walk(absolutePath);
        return entry.isFile() && sourceExtensions.has(path.extname(entry.name))
            ? [absolutePath]
            : [];
    });
}

function resolveLocalImport(sourceFile, specifier) {
    if (specifier.startsWith('@/')) {
        return path.resolve(jsRoot, specifier.slice(2));
    }
    if (specifier.startsWith('.')) {
        return path.resolve(path.dirname(sourceFile), specifier);
    }
    return null;
}

function findImports(source) {
    const imports = [];
    const patterns = [
        /\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?(['"])([^'"]+)\1/g,
        /\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(source)) !== null) {
            const specifier = match[2];
            const before = source.slice(0, match.index);
            imports.push({
                specifier,
                line: before.split('\n').length,
            });
        }
    }

    return imports;
}

function featurePath(target) {
    if (!isWithin(target, roots.features)) return null;
    return path.relative(roots.features, target).split(path.sep).filter(Boolean);
}

function isFeaturePublicEntry(relativeParts) {
    return relativeParts.length === 0
        || relativeParts.length === 1
        || (relativeParts.length === 2 && /^index\.(?:js|jsx)$/.test(relativeParts[1]));
}

const sourceFiles = [
    ...roots.shared.flatMap(walk),
    ...walk(roots.features),
    ...walk(roots.app),
    ...(fs.existsSync(appEntryFile) ? [appEntryFile] : []),
].filter((file, index, all) => all.indexOf(file) === index);

const violations = [];

for (const sourceFile of sourceFiles) {
    const relativeFile = path.relative(projectRoot, sourceFile).split(path.sep).join('/');
    const isShared = roots.shared.some((directory) => isWithin(sourceFile, directory));
    const isFeature = isWithin(sourceFile, roots.features);
    const isApp = isWithin(sourceFile, roots.app) || sourceFile === appEntryFile;
    const currentFeature = isFeature
        ? path.relative(roots.features, sourceFile).split(path.sep)[0]
        : null;

    const source = fs.readFileSync(sourceFile, 'utf8');
    for (const imported of findImports(source)) {
        const target = resolveLocalImport(sourceFile, imported.specifier);
        if (!target) continue;

        const targetIsApp = isWithin(target, roots.app);
        const targetFeature = featurePath(target);

        if (isShared && (targetIsApp || targetFeature !== null)) {
            violations.push({
                file: relativeFile,
                line: imported.line,
                message: 'Shared code must not depend on app or feature modules.',
                specifier: imported.specifier,
            });
        }

        if (isFeature && targetIsApp) {
            violations.push({
                file: relativeFile,
                line: imported.line,
                message: 'Feature modules must not depend on the app composition layer.',
                specifier: imported.specifier,
            });
        }

        if (isFeature && targetFeature && targetFeature[0] !== currentFeature
            && !isFeaturePublicEntry(targetFeature)) {
            violations.push({
                file: relativeFile,
                line: imported.line,
                message: 'Cross-feature imports must use the other feature public entry point.',
                specifier: imported.specifier,
            });
        }

        if (isApp && targetFeature && !isFeaturePublicEntry(targetFeature)) {
            violations.push({
                file: relativeFile,
                line: imported.line,
                message: 'The app layer must import a feature through its public entry point.',
                specifier: imported.specifier,
            });
        }
    }
}

if (violations.length) {
    console.error('\nFrontend architecture boundary violations:');
    for (const violation of violations) {
        console.error(`  ERROR ${violation.file}:${violation.line} — ${violation.message} Import: ${violation.specifier}`);
    }
    console.error(`\nFound ${violations.length} violation(s).`);
    process.exitCode = 1;
} else {
    console.log(`Frontend architecture boundaries passed across ${sourceFiles.length} source file(s).`);
}
