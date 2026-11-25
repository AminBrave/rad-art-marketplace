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

test('admin retains every destination while mobile navigation exposes dashboard, review, editorial, users and settings', () => {
    const allLinks = getWorkspacePrimaryLinks('admin');
    const mobileLinks = getWorkspaceMobileLinks('admin');

    assert.equal(allLinks.length, 7);
    assert.equal(mobileLinks.length, 5);
    assert.ok(allLinks.some((item) => item.to === '/admin/message-reports'));
    assert.ok(allLinks.some((item) => item.to === '/admin/artwork-comment-reports'));
    assert.ok(mobileLinks.every((item) => item.mobilePrimary !== false));
    assert.ok(!mobileLinks.some((item) => item.to.endsWith('-reports')));
    assert.ok(mobileLinks.some((item) => item.to === '/admin'));
    assert.ok(mobileLinks.some((item) => item.to === '/admin/settings'));
});

test('artist mobile navigation promotes creation and keeps settings in the drawer', () => {
    const primary = getWorkspacePrimaryLinks('artist');
    const mobile = getWorkspaceMobileLinks('artist');

    assert.ok(primary.some((item) => item.to === '/dashboard/artist/artworks/new' && item.label === 'ثبت اثر جدید'));
    assert.deepEqual(mobile.map((item) => item.to), [
        '/dashboard/artist',
        '/dashboard/artist/artworks',
        '/dashboard/artist/artworks/new',
        '/dashboard/artist/messages',
        '/dashboard/artist/profile',
    ]);
    assert.equal(primary.find((item) => item.to === '/dashboard/artist/settings')?.mobilePrimary, false);
});

test('buyer mobile navigation retains its primary destinations', () => {
    assert.deepEqual(getWorkspaceMobileLinks('buyer').map((item) => item.to), [
        '/dashboard/buyer',
        '/dashboard/buyer/messages',
        '/dashboard/buyer/settings',
    ]);
});
