import assert from 'node:assert/strict';
import test from 'node:test';

import { getWorkspaceMobileLinks, getWorkspacePrimaryLinks } from '../../resources/js/app/workspaceNavigation.js';

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

test('admin retains every destination while mobile navigation prioritizes four frequent destinations', () => {
    const allLinks = getWorkspacePrimaryLinks('admin');
    const mobileLinks = getWorkspaceMobileLinks('admin');

    assert.equal(allLinks.length, 6);
    assert.equal(mobileLinks.length, 4);
    assert.ok(allLinks.some((item) => item.to === '/admin/message-reports'));
    assert.ok(allLinks.some((item) => item.to === '/admin/artwork-comment-reports'));
    assert.ok(mobileLinks.every((item) => item.mobilePrimary !== false));
    assert.ok(!mobileLinks.some((item) => item.to.endsWith('-reports')));
});

test('buyer and artist mobile navigation preserves their complete primary journeys', () => {
    for (const role of ['buyer', 'artist']) {
        assert.deepEqual(
            getWorkspaceMobileLinks(role).map((item) => item.to),
            getWorkspacePrimaryLinks(role).map((item) => item.to),
        );
    }
});
