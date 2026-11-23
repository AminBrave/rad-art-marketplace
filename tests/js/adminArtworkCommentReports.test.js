import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const admin = readFileSync(new URL('../../resources/js/app/AdminWorkspace.jsx', import.meta.url), 'utf8');
const router = readFileSync(new URL('../../resources/js/app/AppRouter.jsx', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../../resources/js/app/workspaceNavigation.js', import.meta.url), 'utf8');

test('Admin can inspect paginated artwork comment reports and review their context', () => {
    assert.match(admin, /export function AdminArtworkCommentReportsPage/);
    assert.match(admin, /\/artwork-comment-reports/);
    assert.match(admin, /report\.comment\?\.body/);
    assert.match(admin, /report\.comment\?\.artwork\?\.slug/);
    assert.match(admin, /action === 'remove_comment'/);
    assert.match(admin, /'dismissed'/);
    assert.match(admin, /<Pagination/);
});

test('Comment removal requires explicit confirmation and records an accessible outcome', () => {
    assert.match(admin, /confirmRemovalId/);
    assert.match(admin, /بله، حذف دیدگاه/);
    assert.match(admin, /ثبت تصمیم انجام نشد/);
    assert.match(admin, /<ErrorState/);
    assert.match(admin, /<SuccessState/);
});

test('Artwork comment moderation is reachable only inside the admin route and navigation', () => {
    assert.match(router, /<Route path="artwork-comment-reports"/);
    assert.match(navigation, /\/admin\/artwork-comment-reports/);
});
