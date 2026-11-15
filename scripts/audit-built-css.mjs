import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputDirectory = resolve(root, 'build/a11y-css');
const manifestPath = resolve(outputDirectory, 'manifest.json');

assert.ok(existsSync(manifestPath), 'Compiled Vite manifest is missing. Run npm run a11y:build.');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const cssAssets = new Set();

for (const entry of Object.values(manifest)) {
    for (const asset of [entry.file, ...(entry.css ?? [])]) {
        if (typeof asset === 'string' && asset.endsWith('.css')) cssAssets.add(asset);
    }
}

assert.ok(cssAssets.size > 0, 'Vite manifest does not reference any compiled CSS assets.');

const definitions = new Set();
const references = new Set();
let semanticUtilityRules = 0;
let colorDeclarations = 0;

for (const asset of cssAssets) {
    const assetPath = resolve(outputDirectory, asset);
    const relativeAsset = relative(outputDirectory, assetPath);
    assert.ok(
        relativeAsset !== '..' && !relativeAsset.startsWith('..' + sep) && !isAbsolute(relativeAsset),
        'Manifest contains a CSS asset outside the audit output directory: ' + asset,
    );
    assert.ok(existsSync(assetPath), 'Manifest CSS asset does not exist: ' + asset);

    const rootNode = postcss.parse(readFileSync(assetPath, 'utf8'), { from: assetPath });
    rootNode.walkDecls((declaration) => {
        if (declaration.prop.startsWith('--')) definitions.add(declaration.prop);
        for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
            references.add(match[1]);
        }
        if (/^(?:color|background-color|border(?:-top|-right|-bottom|-left)?-color|outline-color|text-decoration-color|fill|stroke)$/.test(declaration.prop)) {
            colorDeclarations += 1;
            if (/var\(\s*--color-[\w-]+/.test(declaration.value)) {
                semanticUtilityRules += 1;
            }
        }
    });
}

assert.ok(definitions.has('--color-canvas'), 'Compiled CSS lost the --color-canvas design token.');
assert.ok(definitions.has('--color-ink'), 'Compiled CSS lost the --color-ink design token.');
assert.ok(colorDeclarations > 0, 'Compiled CSS contains no inspectable color declarations.');
assert.ok(semanticUtilityRules > 0, 'No compiled Tailwind color utilities reference RAD semantic color tokens.');

const missing = [...references].filter((name) => name.startsWith('--color-') && !definitions.has(name));
assert.deepEqual(
    missing,
    [],
    'Compiled CSS references undefined RAD color tokens. Check Tailwind mappings and CSS token declarations.',
);

console.log('[a11y:build] Inspected ' + cssAssets.size + ' compiled CSS asset(s), ' + colorDeclarations
    + ' color declarations and ' + semanticUtilityRules + ' token-backed color declarations.');
