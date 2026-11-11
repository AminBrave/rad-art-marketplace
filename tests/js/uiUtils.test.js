import assert from 'node:assert/strict';
import test from 'node:test';
import { cn } from '../../resources/js/lib/utils.js';

test('cn merges conflicting Tailwind utilities and ignores false values', () => {
    assert.equal(cn('px-2', false, 'px-4', ['font-bold']), 'px-4 font-bold');
});
