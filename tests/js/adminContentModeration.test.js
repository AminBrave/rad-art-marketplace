import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('admin unified content moderation is routed and linked only in the admin workspace', async () => {
    const [router, navigation, page] = await Promise.all([
        read('../../resources/js/app/AppRouter.jsx'),
        read('../../resources/js/app/workspaceNavigation.js'),
        read('../../resources/js/app/AdminContentModeration.jsx'),
    ]);

    assert.match(router, /const AdminContentModeration = lazy\(\(\) => import\('\.\/AdminContentModeration'\)\)/);
    assert.match(router, /<Route path="contents" element=\{withRouteFallback\(<AdminContentModeration \/>\)\} \/>/);
    assert.match(navigation, /to: '\/admin\/contents', label: 'بررسی کتابخانه محتوا'/);
    assert.match(page, /moderation_status: status/);
    assert.match(page, /\/contents\/' \+ content\.id \+ '\/moderation/);
    assert.match(page, /قابل بررسی نیست/);
    assert.match(page, /تأیید هنرمند/);
    assert.match(page, /invalidateQueries\(\{ queryKey: \['admin', 'contents'/);
});

test('admin content moderation UI never renders provider credentials or source snapshots', async () => {
    const page = await read('../../resources/js/app/AdminContentModeration.jsx');

    for (const forbidden of ['access_token', 'refresh_token', 'source_metadata', 'source_permalink', 'source_caption', 'media_path', 'external_id']) {
        assert.equal(page.includes(forbidden), false, 'unexpected private source field: ' + forbidden);
    }
});
