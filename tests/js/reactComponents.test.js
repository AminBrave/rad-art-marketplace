import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup as renderToStaticMarkupRaw } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

// Use Vite's existing JSX pipeline and React's server renderer so component
// contracts can be tested without adding a second DOM/test dependency stack.
const vite = await createServer({
    configFile: false,
    root: process.cwd(),
    plugins: [
        react(),
        {
            // Replace only navigation.jsx's router dependency before Vite's
            // SSR externalizer sees it. The component contracts need Link's
            // anchor output, while browser journeys cover real router behavior.
            name: 'react-router-link-ssr-test-double',
            enforce: 'pre',
            transform(code, id) {
                if (!id.replaceAll('\\', '/').endsWith('/resources/js/components/ui/navigation.jsx')) {
                    return null;
                }

                return code.replace(
                    "import { Link } from 'react-router-dom';",
                    "import { Link } from 'virtual:test-react-router-link';",
                );
            },
            resolveId(source) {
                return source === 'virtual:test-react-router-link' ? '\0test-react-router-link' : null;
            },
            load(id) {
                if (id !== '\0test-react-router-link') return null;
                return `
                    import React from 'react';
                    export function Link({ to, ...props }) {
                        return React.createElement('a', { href: to, ...props });
                    }
                `;
            },
        },
    ],
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
});

const language = await vite.ssrLoadModule('/resources/js/app/LanguageContext.jsx');
const renderToStaticMarkup = (element) => renderToStaticMarkupRaw(
    React.createElement(language.LanguageProvider, null, element),
);

const primitives = await vite.ssrLoadModule('/resources/js/components/ui/primitives.jsx');
const feedback = await vite.ssrLoadModule('/resources/js/components/ui/feedback.jsx');
const navigation = await vite.ssrLoadModule('/resources/js/components/ui/navigation.jsx');
const skeletons = await vite.ssrLoadModule('/resources/js/components/ui/skeletons.jsx');

after(async () => {
    await vite.close();
});

test('Button exposes disabled and busy semantics while loading', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.Button, { loading: true }, 'ارسال'),
    );

    assert.match(html, /<button[^>]*disabled=""/);
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /ارسال/);
    assert.match(html, /focus-visible:outline/);
});

test('FormField associates its label, hint and validation error with the control', () => {
    const html = renderToStaticMarkup(
        React.createElement(
            primitives.FormField,
            { id: 'email', label: 'ایمیل', hint: 'نشانی ورود', error: 'ایمیل معتبر نیست', required: true },
            React.createElement(primitives.TextInput, { type: 'email', name: 'email' }),
        ),
    );

    assert.match(html, /<label[^>]*for="email"/);
    assert.match(html, /<input[^>]*id="email"/);
    assert.match(html, /aria-invalid="true"/);
    assert.match(html, /aria-describedby="email-hint email-error"/);
    assert.match(html, /id="email-hint"/);
    assert.match(html, /id="email-error"/);
    assert.match(html, /role="alert"/);
});

test('SearchField renders a labelled search landmark and submit control', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.SearchField, {
            value: 'آبرنگ',
            onChange: () => {},
            onSearch: () => {},
            label: 'جست‌وجو در آثار',
            buttonLabel: 'جست‌وجو',
        }),
    );

    assert.match(html, /role="search"/);
    assert.match(html, /type="search"/);
    assert.match(html, /جست‌وجو در آثار/);
    assert.match(html, /جست‌وجو/);
});

test('ErrorState announces errors and provides an actionable retry control', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.ErrorState, {
            title: 'دریافت اطلاعات ناموفق بود',
            description: 'اتصال را بررسی کنید.',
            onRetry: () => {},
            retryLabel: 'تلاش دوباره',
        }),
    );

    assert.match(html, /role="alert"/);
    assert.match(html, /دریافت اطلاعات ناموفق بود/);
    assert.match(html, /تلاش دوباره/);
});

test('UploadFeedback clamps progress to the valid accessible range', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.UploadFeedback, {
            fileName: 'artwork.png',
            status: 'uploading',
            progress: 140,
        }),
    );

    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-valuemin="0"/);
    assert.match(html, /aria-valuemax="100"/);
    assert.match(html, /aria-valuenow="100"/);
    assert.match(html, /width:100%/);
});

test('MediaImage reserves its frame and exposes the RAD skeleton while loading', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.MediaImage, {
            src: '/storage/artworks/sample.webp',
            alt: 'اثر نمونه',
            className: 'aspect-[4/5] w-full',
            loading: 'lazy',
            decoding: 'async',
        }),
    );

    assert.match(html, /aria-busy="true"/);
    assert.match(html, /animate-skeleton-shimmer/);
    assert.match(html, /motion-reduce:animate-none/);
    assert.match(html, /loading="lazy"/);
    assert.match(html, /decoding="async"/);
    assert.match(html, /alt="اثر نمونه"/);
});

test('MediaImage supports eager high-priority media and accessible missing-image fallback', () => {
    const hero = renderToStaticMarkup(
        React.createElement(feedback.MediaImage, {
            src: '/storage/artworks/hero.webp',
            alt: 'اثر شاخص',
            loading: 'eager',
            fetchPriority: 'high',
        }),
    );
    const missing = renderToStaticMarkup(
        React.createElement(feedback.MediaImage, {
            src: null,
            alt: 'تصویر اثر نمونه',
            className: 'aspect-[4/5] w-full',
        }),
    );

    assert.match(hero, /loading="eager"/);
    assert.match(hero, /fetchpriority="high"/i);
    assert.match(missing, /role="img"/);
    assert.match(missing, /تصویر اثر نمونه/);
    assert.doesNotMatch(missing, /app-skeleton/);
});

test('EmptyState renders a semantic heading and helpful description', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.EmptyState, {
            title: 'اثری پیدا نشد',
            description: 'فیلترها را تغییر دهید.',
        }),
    );

    assert.doesNotMatch(html, /dir="rtl"/);
    assert.match(html, /<h2[^>]*>اثری پیدا نشد<\/h2>/);
    assert.match(html, /فیلترها را تغییر دهید/);
});


test('IconButton and Badge expose their accessible label and semantic state', () => {
    const icon = renderToStaticMarkup(
        React.createElement(primitives.IconButton, { label: 'بستن پنجره' }, '×'),
    );
    const badge = renderToStaticMarkup(
        React.createElement(primitives.Badge, { variant: 'success' }, 'تأییدشده'),
    );

    assert.match(icon, /aria-label="بستن پنجره"/);
    assert.match(icon, /data-state="closed"/);
    assert.doesNotMatch(icon, /title=/);
    assert.match(badge, /تأییدشده/);
    assert.match(badge, /bg-success-surface/);
});

test('Button preserves explicit disabled state and submit semantics', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.Button, {
            type: 'submit',
            variant: 'danger',
            disabled: true,
        }, 'حذف'),
    );

    assert.match(html, /type="submit"/);
    assert.match(html, /disabled=""/);
    assert.match(html, /bg-danger/);
    assert.match(html, /حذف/);
});

test('Page and section headers retain the requested heading hierarchy', () => {
    const page = renderToStaticMarkup(
        React.createElement(primitives.PageHeader, {
            level: 2,
            eyebrow: 'فضای هنرمند',
            title: 'مدیریت آثار',
            description: 'آثار خود را مرور کنید.',
        }),
    );
    const section = renderToStaticMarkup(
        React.createElement(primitives.SectionHeader, {
            level: 3,
            id: 'recent-work',
            title: 'آثار اخیر',
        }),
    );

    assert.match(page, /<h2[^>]*>مدیریت آثار<\/h2>/);
    assert.match(page, /فضای هنرمند/);
    assert.doesNotMatch(page, /before:bg-terracotta/);
    assert.match(section, /<h3[^>]*id="recent-work"[^>]*>آثار اخیر<\/h3>/);

    const hero = renderToStaticMarkup(
        React.createElement(primitives.WorkspaceHero, {
            eyebrow: 'فضای هنرمند',
            title: 'خوش آمدید',
            description: 'مدیریت حضور هنری شما',
        }),
    );

    assert.doesNotMatch(hero, /dir="rtl"/);
    assert.match(hero, /class="[^"]*rd-container[^"]*max-w-content/);
    assert.doesNotMatch(hero, /rd-container--wide/);
    assert.match(hero, /rd-hero-surface/);
    assert.match(hero, /rd-hero-surface--grid/);
    assert.match(hero, /rd-bleed/);
    assert.match(hero, /text-\[color:var\(--rd-hero-foreground\)\]/);
    assert.match(hero, /text-\[color:var\(--rd-hero-muted\)\]/);
    assert.doesNotMatch(hero, /border-b border-border/);
    const embeddedHero = renderToStaticMarkup(
        React.createElement(primitives.WorkspaceHero, { bleed: false, title: 'نمونه تعبیه‌شده' }),
    );
    assert.doesNotMatch(embeddedHero, /rd-bleed/);
    assert.match(embeddedHero, /rd-container[^\"]*max-w-content/);
    assert.doesNotMatch(embeddedHero, /rd-container--wide/);
    assert.match(hero, /خوش آمدید/);
});

test('DiscoveryHero can place artwork above its copy on mobile while restoring desktop order', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.DiscoveryHero, {
            mediaPosition: 'before',
            title: 'کشف هنر',
            media: React.createElement('div', null, 'اثر منتخب'),
        }),
    );
    assert.match(html, /rd-unified-hero__title-wrap[^"]*order-last lg:order-first/);
    const mediaOrderClass = html.indexOf('order-first lg:order-last');
    const mediaContent = html.indexOf('اثر منتخب');
    assert.ok(mediaOrderClass >= 0 && mediaContent > mediaOrderClass, 'The media wrapper receives mobile-first ordering and contains the artwork.');
});

test('PageContainer and Surface preserve semantic element and variant contracts', () => {
    const container = renderToStaticMarkup(
        React.createElement(primitives.PageContainer, { as: 'main', width: 'reading' }, 'محتوا'),
    );
    const surface = renderToStaticMarkup(
        React.createElement(primitives.Surface, { as: 'article', variant: 'interactive' }, 'جزئیات'),
    );

    assert.match(container, /<main[^>]*max-w-content-reading/);
    assert.match(container, /محتوا/);
    assert.match(surface, /<article[^>]*focus-within:outline/);
    assert.match(surface, /جزئیات/);
});

test('DashboardMetricCard renders a navigable metric as a link when a destination is supplied', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.DashboardMetricCard, {
            label: 'آثار منتشرشده',
            value: 12,
            detail: 'در گالری عمومی',
            to: '/dashboard/artist/artworks',
        }),
    );

    assert.match(html, /<a[^>]*href="\/dashboard\/artist\/artworks"/);
    assert.match(html, /آثار منتشرشده/);
    assert.match(html, />12</);
});

test('FormField generates a stable label-control association when no ID is supplied', () => {
    const html = renderToStaticMarkup(
        React.createElement(
            primitives.FormField,
            { label: 'عنوان اثر' },
            React.createElement(primitives.TextareaField, { name: 'title' }),
        ),
    );
    const labelId = html.match(/<label[^>]*for="([^"]+)"/)?.[1];
    const controlId = html.match(/<textarea[^>]*id="([^"]+)"/)?.[1];

    assert.ok(labelId, 'The generated field label must reference a control.');
    assert.equal(controlId, labelId);
});

test('SuccessState and PermissionState announce non-error outcomes', () => {
    const success = renderToStaticMarkup(
        React.createElement(feedback.SuccessState, {
            title: 'تغییرات ذخیره شد',
            description: 'پروفایل به‌روزرسانی شد.',
        }),
    );
    const permission = renderToStaticMarkup(
        React.createElement(feedback.PermissionState, {
            title: 'دسترسی مجاز نیست',
            description: 'این بخش برای نقش هنرمند است.',
        }),
    );

    assert.match(success, /role="status"/);
    assert.match(success, /تغییرات ذخیره شد/);
    assert.match(permission, /role="status"/);
    assert.match(permission, /دسترسی مجاز نیست/);
});

test('Toast delegates announcements, dismissal and viewport behavior to Radix Toast', () => {
    const feedbackSource = readFileSync(new URL('../../resources/js/components/ui/feedback.jsx', import.meta.url), 'utf8');

    assert.match(feedbackSource, /ToastPrimitive\.Provider/);
    assert.match(feedbackSource, /ToastPrimitive\.Root/);
    assert.match(feedbackSource, /ToastPrimitive\.Viewport/);
    assert.match(feedbackSource, /ToastPrimitive\.Close asChild/);
    assert.match(feedbackSource, /variant === 'error' \? 'foreground' : 'background'/);
    assert.match(feedbackSource, /duration = Infinity/);
});;

test('SkeletonLines exposes one loading announcement while hiding decorative skeletons', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.SkeletonLines, { lines: 2 }),
    );

    assert.match(html, /role="status"/);
    assert.match(html, /در حال بارگذاری/);
    assert.match(html, /motion-reduce:animate-none/);
    assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 2);
});

test('MediaImage fallback exposes accessible missing-source and load-error states', () => {
    const missing = renderToStaticMarkup(
        React.createElement(feedback.MediaImage, { src: '', alt: 'اثر بدون تصویر' }),
    );

    assert.match(missing, /role="img"/);
    assert.match(missing, /aria-label="اثر بدون تصویر: تصویر در دسترس نیست"/);
    assert.match(missing, /تصویر در دسترس نیست/);
    assert.match(missing, /خطا در نمایش تصویر/);
    assert.match(missing, /نشانی تصویر ثبت نشده است/);

    const mediaSource = readFileSync(new URL('../../resources/js/components/ui/feedback.jsx', import.meta.url), 'utf8');
    assert.ok(mediaSource.includes('onError={() => setFailedSrc(imageSrc)}'));
    assert.match(mediaSource, /فایل پیدا نشد یا دریافت آن ناموفق بود/);
});

test('UploadFeedback clamps progress at both ends of the accessible range', () => {
    const lower = renderToStaticMarkup(
        React.createElement(feedback.UploadFeedback, { status: 'uploading', progress: -10 }),
    );
    const upper = renderToStaticMarkup(
        React.createElement(feedback.UploadFeedback, { status: 'uploading', progress: 140 }),
    );

    assert.match(lower, /aria-valuenow="0"/);
    assert.match(lower, /width:0%/);
    assert.match(upper, /aria-valuenow="100"/);
    assert.match(upper, /width:100%/);
});

test('Breadcrumbs expose the current page without making it a link', () => {
    const html = renderToStaticMarkup(
        React.createElement(navigation.Breadcrumbs, {
            items: [
                { label: 'خانه', to: '/' },
                { label: 'آثار', to: '/artworks' },
                { label: 'اثر نمونه' },
            ],
        }),
    );

    assert.match(html, /aria-label="مسیر صفحه"/);
    assert.match(html, /aria-current="page"/);
    assert.match(html, /اثر نمونه/);
    assert.equal((html.match(/<a\b/g) ?? []).length, 2);
});

test('Pagination exposes the active page and disables navigation at boundaries', () => {
    const firstPage = renderToStaticMarkup(
        React.createElement(navigation.Pagination, {
            currentPage: 1,
            lastPage: 8,
            onPageChange: () => {},
        }),
    );
    const lastPage = renderToStaticMarkup(
        React.createElement(navigation.Pagination, {
            currentPage: 8,
            lastPage: 8,
            onPageChange: () => {},
        }),
    );

    assert.match(firstPage, /aria-label="صفحه‌بندی"/);
    assert.match(firstPage, /aria-label="صفحه 1"[^>]*aria-current="page"/);
    assert.match(firstPage, /<button[^>]*disabled=""[^>]*>قبلی<\/button>/);
    assert.match(lastPage, /aria-label="صفحه 8"[^>]*aria-current="page"/);
    assert.match(lastPage, /<button[^>]*disabled=""[^>]*>بعدی<\/button>/);
});


test('StatusBadge maps known review states to semantic status surfaces', () => {
    const approved = renderToStaticMarkup(
        React.createElement(primitives.StatusBadge, { status: 'approved', label: 'تأییدشده' }),
    );
    const unknown = renderToStaticMarkup(
        React.createElement(primitives.StatusBadge, { status: 'unmapped-state' }),
    );

    assert.match(approved, /bg-success-surface/);
    assert.match(approved, /تأییدشده/);
    assert.match(unknown, /bg-surface-muted/);
});

test('WorkspaceHero inherits global direction and renders a primary page heading', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.WorkspaceHero, {
            eyebrow: 'فضای هنرمند',
            title: 'مدیریت آثار',
            description: 'آثار و پروفایل خود را مدیریت کنید.',
        }),
    );

    assert.doesNotMatch(html, /dir="rtl"/);
    assert.match(html, /<h1[^>]*>مدیریت آثار<\/h1>/);
    assert.match(html, /آثار و پروفایل خود را مدیریت کنید/);
});

test('TextInput, TextareaField and Radix SelectField preserve accessible form semantics', () => {
    const input = renderToStaticMarkup(
        React.createElement(primitives.TextInput, { type: 'email', name: 'email', dir: 'ltr', required: true }),
    );
    const textarea = renderToStaticMarkup(
        React.createElement(primitives.TextareaField, { name: 'bio', rows: 5, maxLength: 500 }),
    );
    const select = renderToStaticMarkup(
        React.createElement(primitives.SelectField, { name: 'status', value: 'approved', required: true, 'aria-label': 'وضعیت اثر' },
            React.createElement('option', { value: 'approved' }, 'تأییدشده'),
        ),
    );

    assert.match(input, /type="email"/);
    assert.match(input, /dir="ltr"/);
    assert.match(input, /required=""/);
    assert.match(textarea, /rows="5"/);
    assert.match(textarea, /maxLength="500"|maxlength="500"/i);
    assert.match(select, /role="combobox"/);
    assert.match(select, /aria-label="وضعیت اثر"/);
    assert.match(select, /dir="rtl"/);
    assert.match(select, /name="status"/);
    assert.match(select, /required=""/);
});

test('Checkbox uses the Radix checkbox interaction and exposes its accessible state', () => {
    const checkbox = renderToStaticMarkup(
        React.createElement(primitives.Checkbox, { checked: true, name: 'is_public', 'aria-label': 'نمایش عمومی پروفایل' }, 'نمایش عمومی پروفایل'),
    );

    assert.match(checkbox, /role="checkbox"/);
    assert.match(checkbox, /aria-checked="true"/);
    assert.match(checkbox, /aria-label="نمایش عمومی پروفایل"/);
    assert.match(checkbox, /name="is_public"/);
    assert.match(checkbox, /نمایش عمومی پروفایل/);
});

test('Tabs expose tablist, selected state and linked panel semantics', () => {
    const html = renderToStaticMarkup(
        React.createElement(navigation.Tabs, { defaultValue: 'artists' },
            React.createElement(navigation.TabsList, { 'aria-label': 'نوع محتوا' },
                React.createElement(navigation.TabsTrigger, { value: 'artists' }, 'هنرمندان'),
                React.createElement(navigation.TabsTrigger, { value: 'artworks' }, 'آثار'),
            ),
            React.createElement(navigation.TabsContent, { value: 'artists' }, 'فهرست هنرمندان'),
            React.createElement(navigation.TabsContent, { value: 'artworks' }, 'فهرست آثار'),
        ),
    );

    assert.match(html, /role="tablist"/);
    assert.match(html, /role="tab"/);
    assert.match(html, /aria-selected="true"/);
    assert.match(html, /role="tabpanel"/);
    assert.doesNotMatch(html, /dir="rtl"/);
});


test('ArtworkStudioListSkeleton mirrors the loaded artwork cards and announces its loading state', () => {
    const html = renderToStaticMarkup(React.createElement(skeletons.ArtworkStudioListSkeleton, { count: 2 }));
    assert.match(html, /role="status"/);
    assert.match(html, /در حال دریافت آثار هنرمند/);
    assert.match(html, /flex aspect-\[3\/4\] items-center justify-center bg-surface-muted p-3/);
    assert.match(html, /space-y-3 p-4/);
    assert.equal((html.match(/<article/g) ?? []).length, 2);
});

test('ConversationInboxSkeleton preserves the real inbox list and row geometry', () => {
    const html = renderToStaticMarkup(React.createElement(skeletons.ConversationInboxSkeleton, { count: 3 }));
    assert.match(html, /<div[^>]*role="status"/);
    assert.match(html, /<ul[^>]*aria-hidden="true"/);
    assert.match(html, /در حال دریافت گفتگوها/);
    assert.match(html, /min-h-0 flex-1/);
    assert.match(html, /min-h-\[4\.25rem\]/);
    assert.match(html, /absolute end-2 top-1\/2/);
    assert.equal((html.match(/<li/g) ?? []).length, 3);
});

test('MessageHistorySkeleton retains a single loading announcement and the message-bubble layout', () => {
    const html = renderToStaticMarkup(React.createElement(skeletons.MessageHistorySkeleton, { count: 4 }));
    assert.match(html, /role="status"/);
    assert.match(html, /در حال دریافت پیام‌ها/);
    assert.match(html, /w-\[min\(78%,28rem\)\]/);
    assert.equal((html.match(/border border-border p-4/g) ?? []).length, 4);
});

test('ArtistRecentWorkSkeleton keeps the semantic list structure of the loaded workspace', () => {
    const html = renderToStaticMarkup(React.createElement(skeletons.ArtistRecentWorkSkeleton));
    assert.match(html, /<div[^>]*role="status"/);
    assert.match(html, /<ul[^>]*aria-hidden="true"/);
    assert.equal((html.match(/<li/g) ?? []).length, 4);
});

test('workspace overview skeletons match their loaded hero and content sections without nested live regions', () => {
    const admin = renderToStaticMarkup(React.createElement(skeletons.AdminDashboardSkeleton));
    const artist = renderToStaticMarkup(React.createElement(skeletons.ArtistWorkspaceOverviewSkeleton));
    const buyer = renderToStaticMarkup(React.createElement(skeletons.BuyerDashboardSkeleton));

    assert.match(admin, /bg-ink mt-0 py-4"><div class="[^"]*p-6 sm:p-8/);
    assert.match(admin, /xl:grid-cols-\[minmax\(0,1\.2fr\)_minmax\(18rem,\.8fr\)\]/);
    assert.match(admin, /xl:grid-cols-4/);
    assert.equal((admin.match(/role="status"/g) ?? []).length, 1);

    assert.match(artist, /در حال آماده‌سازی فضای هنرمند/);
    assert.match(artist, /lg:grid-cols-\[1fr_15rem\]/);
    assert.match(artist, /border-y border-divider-section bg-transparent py-6 sm:py-7/);
    assert.doesNotMatch(artist, /در حال دریافت شاخص‌ها/);
    assert.equal((artist.match(/role="status"/g) ?? []).length, 1);

    assert.match(buyer, /در حال آماده‌سازی فضای خریدار/);
    assert.match(buyer, /md:grid-cols-3/);
    assert.equal((buyer.match(/role="status"/g) ?? []).length, 1);
});

test('collection and message-report skeletons announce data loading when used inside loaded pages', () => {
    const collections = renderToStaticMarkup(React.createElement(skeletons.CollectionCardSkeleton, { count: 2 }));
    const reports = renderToStaticMarkup(React.createElement(skeletons.MessageReportsSkeleton, { count: 2 }));
    assert.match(collections, /role="status"/);
    assert.match(collections, /در حال دریافت مجموعه‌ها/);
    assert.match(reports, /role="status"/);
    assert.match(reports, /در حال دریافت گزارش‌های پیام/);
});
