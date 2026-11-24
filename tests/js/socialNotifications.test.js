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

test('Notification center exposes pagination and independent read controls', () => {
    assert.match(layout, /صفحه‌بندی اعلان‌ها/);
    assert.match(layout, /setPage\(\(value\) => value - 1\)/);
    assert.match(layout, /setPage\(\(value\) => value \+ 1\)/);
    assert.match(layout, /markOneRead/);
    assert.match(layout, /markAllRead/);
    assert.match(layout, /notificationsQuery\.isFetching/);
});

test('Notification API keeps reads recipient-scoped and includes social notification types', () => {
    assert.match(controller, /whereIn\('type', \$types\)/);
    assert.match(controller, /SocialActivityNotification::class/);
    assert.match(controller, /whereKey\(\$notification\)/);
    assert.match(controller, /'target_url'/);
    assert.match(controller, /'unread_count'/);
});
