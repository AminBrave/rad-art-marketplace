import assert from 'node:assert/strict';
import test from 'node:test';

import { getWorkspacePrimaryLinks } from '../../resources/js/app/workspaceNavigation.js';

test('buyer and artist messaging navigation keeps the پیام‌ها label', () => {
    const expected = [
        ['buyer', '/dashboard/buyer/messages'],
        ['artist', '/dashboard/artist/messages'],
    ];

    for (const [role, route] of expected) {
        const link = getWorkspacePrimaryLinks(role).find((item) => item.to === route);

        assert.ok(link, `Expected ${role} workspace to include its messaging route.`);
        assert.equal(link.label, 'پیام‌ها');
        assert.equal(link.shortLabel, 'پیام‌ها');
    }
});
