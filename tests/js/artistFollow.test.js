import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../../resources/js/app/ArtistProfilePage.jsx', import.meta.url), 'utf8');

test('Public artist profiles expose an accessible follow toggle for eligible accounts', () => {
    assert.match(page, /\['buyer', 'artist'\]\.includes\(user\?\.role\)/);
    assert.match(page, /\/api\/v1\/artists\//);
    assert.match(page, /profile\?\.is_following/);
    assert.match(page, /profile\?\.followers_count/);
    assert.match(page, /aria-pressed=\{Boolean\(followState\.is_following\)\}/);
    assert.match(page, /دنبال کردن هنرمند/);
    assert.match(page, /دنبال‌کننده/);
});

test('Guest follow attempts are routed through login and follow errors are announced', () => {
    assert.match(page, /برای دنبال کردن وارد شوید/);
    assert.match(page, /role="alert"/);
    assert.match(page, /followState\.is_own_profile/);
});
