import assert from 'node:assert/strict';
import test from 'node:test';
import { formatArtworkPrice } from '../../resources/js/utils/formatArtworkPrice.js';

test('an undisclosed price is presented explicitly', () => {
    assert.equal(formatArtworkPrice(null), 'قیمت اعلام نشده');
    assert.equal(formatArtworkPrice(undefined), 'قیمت اعلام نشده');
    assert.equal(formatArtworkPrice(''), 'قیمت اعلام نشده');
});

test('a numeric zero is displayed as an amount, not hidden or described as free', () => {
    assert.equal(formatArtworkPrice('0.00'), '۰ ریال');
});

test('a positive price is localized and suffixed with Rial', () => {
    assert.equal(formatArtworkPrice('1250000.00'), '۱٬۲۵۰٬۰۰۰ ریال');
});
