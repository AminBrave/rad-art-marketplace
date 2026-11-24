import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatArtworkPrice } from '../../resources/js/utils/formatArtworkPrice.js';
import { localizedValue } from '../../resources/js/utils/localizedContent.js';

test('localizedValue prefers English content and falls back to Persian content', () => {
    assert.equal(localizedValue({ title: 'عنوان فارسی', title_en: 'English title' }, 'title', 'en'), 'English title');
    assert.equal(localizedValue({ title: 'عنوان فارسی', title_en: '' }, 'title', 'en'), 'عنوان فارسی');
    assert.equal(localizedValue({ title: 'عنوان فارسی', title_en: 'English title' }, 'title', 'fa'), 'عنوان فارسی');
});

test('artwork prices use locale-appropriate digits and currency labels', () => {
    assert.equal(formatArtworkPrice(1250000, 'en'), '1,250,000 IRR');
    assert.match(formatArtworkPrice(1250000, 'fa'), /ریال$/);
    assert.equal(formatArtworkPrice(null, 'en'), 'Price not provided');
    assert.equal(formatArtworkPrice(null, 'fa'), 'قیمت اعلام نشده');
});

test('all literal frontend translation keys exist exactly once in the English dictionary', () => {
    const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
    const dictionaryPath = resolve(root, 'resources/js/app/LanguageContext.jsx');
    const dictionarySource = readFileSync(dictionaryPath, 'utf8');
    const dictionaryKeys = [...dictionarySource.matchAll(/^\s*"((?:[^"\\]|\\.)+)"\s*:/gm)].map((match) => match[1]);

    assert.equal(new Set(dictionaryKeys).size, dictionaryKeys.length, 'translation dictionary keys must be unique');

    const files = [];
    const collect = (directory) => {
        for (const entry of readdirSync(directory)) {
            const path = resolve(directory, entry);
            if (statSync(path).isDirectory()) collect(path);
            else if (/\.(jsx?|tsx?)$/.test(path) && path !== dictionaryPath) files.push(path);
        }
    };
    collect(resolve(root, 'resources/js/app'));
    collect(resolve(root, 'resources/js/components'));
    collect(resolve(root, 'resources/js/utils'));

    const known = new Set(dictionaryKeys);
    const missing = [];
    for (const path of files) {
        const source = readFileSync(path, 'utf8');
        for (const match of source.matchAll(/\bt\(\s*(["'\x60])((?:\\.|(?!\1)[\s\S])*)\1\s*\)/g)) {
            const key = match[2];
            if (!key.includes(String.fromCharCode(36) + '{') && !known.has(key)) {
                missing.push(relative(root, path) + ': ' + key);
            }
        }
    }

    assert.deepEqual(missing, [], 'every literal t() key must have an English translation');
});
