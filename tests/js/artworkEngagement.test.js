import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const component = readFileSync(new URL('../../resources/js/app/ArtworkEngagement.jsx', import.meta.url), 'utf8');
const detailPage = readFileSync(new URL('../../resources/js/app/ArtworkDetailPage.jsx', import.meta.url), 'utf8');

test('Artwork engagement keeps reads public and gates mutations to eligible signed-in roles', () => {
    assert.match(component, /\/api\/v1\/artworks\/.*\/comments\?page=/);
    assert.match(component, /comment_id=/);
    assert.match(component, /const currentPage = pagination\.current_page \?\? page/);
    assert.match(component, /useLocation/);
    assert.match(component, /\}, \[slug, hash, locationKey, commentTargetIdFromHash\]\);/);
    assert.match(component, /setCommentTargetId\(''\)/);
    assert.match(component, /\['buyer', 'artist'\]\.includes\(user\?\.role\)/);
    assert.match(component, /axios\.post\('\/api\/v1\/artworks\/'/);
    assert.match(component, /aria-pressed=\{Boolean\(artwork\.liked_by_me\)\}/);
    assert.match(component, /state=\{\{ from: \{ pathname: '\/artworks\/' \+ slug \} \}\}/);
});

test('Artwork sharing supports native share, clipboard fallback and an accessible status message', () => {
    assert.match(component, /navigator\.share/);
    assert.match(component, /navigator\.clipboard\?\.writeText/);
    assert.match(component, /role="status"/);
    assert.match(component, /نشانی اثر:/);
});

test('Artwork comments expose bounded plain-text input, reply controls and moderation reporting', () => {
    assert.match(component, /maxLength=\{2000\}/);
    assert.match(component, /parent_id: replyTo\.id/);
    assert.match(component, /reports'/);
    assert.match(component, /گزارش دیدگاه/);
    assert.match(component, /گزارش شما ثبت شد/);
    assert.match(component, /deleteMutation\.isError/);
    assert.match(component, /aria-label=\{t\("صفحه‌بندی دیدگاه‌ها"\)\}/);
});

test('Artwork detail page renders engagement only when public social counts are present and preserves Inquiries', () => {
    assert.match(detailPage, /typeof artwork\.likes_count === 'number' && typeof artwork\.comments_count === 'number'/);
    assert.match(detailPage, /<ArtworkEngagement artwork=\{artwork\} slug=\{slug\} \/>/);
    assert.match(detailPage, /dashboard\/buyer\/messages/);
});
