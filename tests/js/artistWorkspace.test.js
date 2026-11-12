import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const overview = read('../../resources/js/app/ArtistWorkspaceOverview.jsx');
const profile = read('../../resources/js/app/RoutingPages.jsx');
const artwork = read('../../resources/js/app/ArtworkStudio.jsx');
const router = read('../../resources/js/app/AppRouter.jsx');

test('artist onboarding progress is derived from named profile fields and actual artwork totals', () => {
    for (const field of ['display_name', 'bio', 'city', 'website_url', 'instagram_handle', 'is_public']) {
        assert.ok(overview.includes(field), `Missing profile completion input: ${field}`);
    }
    assert.ok(overview.includes('counts.artworks'));
    assert.ok(overview.includes('aria-valuenow={progress}'));
    assert.ok(overview.includes('ثبت اولین اثر برای بررسی'));
    assert.ok(!/analytics|engagement|reach|impressions/i.test(overview));
});

test('artists can preview their own private profile without changing visibility', () => {
    assert.ok(profile.includes('پیش‌نمایش خصوصی پروفایل'));
    assert.ok(profile.includes("to={'/artists/' + profile.slug}"));
    assert.ok(profile.includes('این پیش‌نمایش فقط برای شما'));
});

test('artwork submission explains moderation outcomes and validates image dimensions before upload', () => {
    for (const status of ['pending_review', 'approved', 'rejected', 'changes_requested']) {
        assert.ok(artwork.includes(status));
    }
    assert.ok(artwork.includes('preview.naturalWidth'));
    assert.ok(artwork.includes('preview.naturalHeight'));
    assert.ok(artwork.includes('6000'));
    assert.ok(artwork.includes('اطلاعات فرم حفظ شده است'));
    assert.ok(artwork.includes('بازخورد مدیر'));
});

test('direct messaging remains available in the artist workspace without a legacy inbox section', () => {
    assert.ok(router.includes('MessagingCenter'));
    assert.ok(router.includes('path="messages"'));
    assert.equal(router.includes('InquiryCenter'), false);
    assert.equal(router.includes('path="inquiries"'), false);
});
