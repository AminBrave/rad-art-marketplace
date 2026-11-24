import test from 'node:test';
import assert from 'node:assert/strict';
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
