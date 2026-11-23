import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const layout = readFileSync(new URL('../../resources/js/app/Layouts.jsx', import.meta.url), 'utf8');
const controller = readFileSync(new URL('../../app/Http/Controllers/Api/V1/NotificationController.php', import.meta.url), 'utf8');

test('Notification center renders social activity and preserves message notification navigation', () => {
    assert.match(layout, /اعلان‌ها/);
    assert.match(layout, /item\.title/);
    assert.match(layout, /item\.target_url/);
    assert.match(layout, /item\.kind === 'artist_followed'/);
    assert.match(layout, /item\.kind === 'artwork_liked'/);
    assert.match(layout, /conversation=/);
});

test('Notification center exposes pagination and independent in-app preference controls', () => {
    assert.match(layout, /صفحه‌بندی اعلان‌ها/);
    assert.match(layout, /in_app_follows/);
    assert.match(layout, /in_app_artwork_likes/);
    assert.match(layout, /in_app_artwork_comments/);
    assert.match(layout, /in_app_comment_replies/);
    assert.match(layout, /in_app_messages/);
});

test('Notification API keeps reads recipient-scoped and includes social notification types', () => {
    assert.match(controller, /whereIn\('type', \$types\)/);
    assert.match(controller, /SocialActivityNotification::class/);
    assert.match(controller, /whereKey\(\$notification\)/);
    assert.match(controller, /'target_url'/);
    assert.match(controller, /'unread_count'/);
});
