import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');
const blade = readFileSync(new URL('../../resources/views/app.blade.php', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../../tailwind.config.js', import.meta.url), 'utf8');
const primitives = readFileSync(new URL('../../resources/js/components/ui/primitives.jsx', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../../resources/js/components/ui/cards.jsx', import.meta.url), 'utf8');
const feedback = readFileSync(new URL('../../resources/js/components/ui/feedback.jsx', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../../resources/js/components/ui/navigation.jsx', import.meta.url), 'utf8');
const dialog = readFileSync(new URL('../../resources/js/components/ui/Dialog.jsx', import.meta.url), 'utf8');
const skeletons = readFileSync(new URL('../../resources/js/components/ui/skeletons.jsx', import.meta.url), 'utf8');
const showcase = readFileSync(new URL('../../resources/js/app/ComponentShowcase.jsx', import.meta.url), 'utf8');
const publicPages = ['ArtworkCatalogue.jsx', 'ArtistDirectoryPage.jsx', 'ArtworkDetailPage.jsx'].map((file) => readFileSync(new URL('../../resources/js/app/' + file, import.meta.url), 'utf8'));
const layouts = readFileSync(new URL('../../resources/js/app/Layouts.jsx', import.meta.url), 'utf8');
const buyerWorkspace = readFileSync(new URL('../../resources/js/app/BuyerWorkspace.jsx', import.meta.url), 'utf8');
const routeLoading = readFileSync(new URL('../../resources/js/app/RoutingPages.jsx', import.meta.url), 'utf8');
const queryClient = readFileSync(new URL('../../resources/js/lib/queryClient.js', import.meta.url), 'utf8');
const artistWorkspace = readFileSync(new URL('../../resources/js/app/ArtistWorkspaceOverview.jsx', import.meta.url), 'utf8');
const messaging = readFileSync(new URL('../../resources/js/app/MessagingCenter.jsx', import.meta.url), 'utf8');
const messagingQueries = readFileSync(new URL('../../resources/js/app/useMessagingQueries.js', import.meta.url), 'utf8');
const artworkDetail = readFileSync(new URL('../../resources/js/app/ArtworkDetailPage.jsx', import.meta.url), 'utf8');
const artworkStudio = readFileSync(new URL('../../resources/js/app/ArtworkStudio.jsx', import.meta.url), 'utf8');
const conversationApi = readFileSync(new URL('../../app/Http/Controllers/Api/V1/ConversationController.php', import.meta.url), 'utf8');
const messageModel = readFileSync(new URL('../../app/Models/Message.php', import.meta.url), 'utf8');
const adminWorkspace = readFileSync(new URL('../../resources/js/app/AdminWorkspace.jsx', import.meta.url), 'utf8');

test('semantic palette, typography, spacing and layout tokens have one CSS source', () => {
    for (const token of [
        '--color-canvas', '--color-ink', '--color-terracotta', '--color-terracotta-strong',
        '--color-sand', '--color-olive', '--color-paper', '--color-text-muted',
        '--color-border', '--color-success', '--color-danger', '--color-warning', '--color-info',
        '--color-success-surface', '--color-danger-surface', '--color-warning-surface', '--color-info-surface', '--color-accent-surface', '--color-inverse-text', '--color-message-own', '--color-message-peer',
        '--font-persian', '--font-latin', '--text-base', '--leading-copy',
        '--space-1', '--space-4', '--space-8', '--radius-md', '--content-width',
        '--page-gutter', '--control-height-md', '--artwork-ratio',
    ]) {
        assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing design token: ${token}`);
    }
});

test('Tailwind semantic aliases reference CSS variables rather than duplicate literal values', () => {
    for (const alias of ['canvas:', 'terracotta:', 'muted:', 'warning:', 'info:', 'success: {', 'danger: {', 'warning: {', 'info: {', 'accent: {', 'inverse:', 'overlay:', 'fontSize:', 'lineHeight:', 'spacing:']) {
        assert.ok(tailwind.includes(alias), `Missing Tailwind alias: ${alias}`);
    }
    assert.ok(tailwind.includes('var(--color-canvas)'));
    assert.ok(tailwind.includes('var(--text-base)'));
    assert.ok(tailwind.includes('var(--space-4)'));
});

test('shared primitives use centralized component contracts and expose accessible states', () => {
    assert.ok(primitives.includes('bg-terracotta'));
    assert.ok(primitives.includes('bg-danger'));
    assert.ok(primitives.includes('focus-visible:outline-focus'));
    assert.ok(primitives.includes('aria-[invalid=true]:border-danger'));
    assert.doesNotMatch(css, /\.ra-(?:button|control)/);
    assert.ok(primitives.includes('aria-busy={loading || undefined}'));
    assert.ok(primitives.includes("'aria-describedby': describedBy"));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
});

test('shared content and feedback components use semantic surface and state contracts', () => {
    assert.ok(cards.includes('bg-surface-muted'));
    assert.ok(cards.includes('border border-border'));
    assert.ok(cards.includes('aspect-[4/5]'));
    assert.ok(feedback.includes('border-dashed'));
    assert.ok(feedback.includes('border-danger/30'));
    assert.ok(feedback.includes('border-s-2 border-success'));
    assert.ok(feedback.includes('app-skeleton'));
    assert.ok(feedback.includes('border-s-success'));
});

test('RAD visual tokens are declared in one canonical root block', () => {
    assert.equal((css.match(/:root\s*\{/g) ?? []).length, 1);
    assert.ok(css.includes('--color-message-own:'));
    assert.ok(css.includes('--color-success-surface:'));
});

test('shared presentation primitives compose RAD semantic utilities instead of custom component selectors', () => {
    for (const utility of ['max-w-[48rem]', 'leading-heading', 'bg-success-surface', 'border-border-strong', 'bg-surface-muted', 'shadow-soft', 'focus-visible:outline-focus']) {
        assert.ok(primitives.includes(utility), 'Missing shared semantic utility: ' + utility);
    }
    for (const component of ['PageContainer', 'PageHeader', 'SectionHeader', 'Surface', 'StatusBadge', 'WorkspaceHero', 'DashboardMetricCard']) {
        assert.ok(primitives.includes('function ' + component), 'Missing shared component: ' + component);
    }
    assert.doesNotMatch(css, /\.ra-(?:page|surface|badge|form-field|tabs|menu|dialog|pagination)/);
});


test('public catalogue, artist directory and artwork detail use shared page layout primitives', () => {
    assert.ok(publicPages[0].includes('PageContainer') && publicPages[0].includes('PageHeader'));
    assert.ok(publicPages[1].includes('PageContainer') && publicPages[1].includes('SectionHeader'));
    assert.ok(publicPages[2].includes('PageContainer'));
    assert.ok(buyerWorkspace.includes('WorkspaceHero') && buyerWorkspace.includes('<Surface'));
});

test('public and role-based workspaces express shell layout with responsive utilities', () => {
    for (const utility of ['min-h-screen', 'bg-canvas', 'sticky top-0', 'lg:grid-cols-[220px_minmax(0,1fr)]']) {
        assert.ok(layouts.includes(utility), 'Missing shell utility: ' + utility);
    }
});

test('navigation and dialogs use Radix behavior with Tailwind semantic utility styling', () => {
    for (const utility of ['data-[state=active]:border-terracotta', 'bg-paper', 'focus:bg-surface-muted', 'focus-visible:ring-focus']) {
        assert.ok(navigation.includes(utility), 'Missing navigation utility: ' + utility);
    }
    for (const utility of ['fixed inset-0 z-50', 'bg-ink/55', 'border-border', 'focus-visible:ring-focus']) {
        assert.ok(dialog.includes(utility), 'Missing dialog utility: ' + utility);
    }
    assert.ok(showcase.includes('WorkspaceHero'));
    assert.ok(showcase.includes('DashboardMetricCard'));
});


test('initial Blade loading shell uses responsive utilities instead of page-specific CSS selectors', () => {
    assert.ok(blade.includes('md:grid-cols-[minmax(0,1fr)_minmax(16rem,.9fr)]'));
    assert.ok(blade.includes('bg-surface-muted'));
    assert.ok(blade.includes('aspect-[4/5]'));
    assert.doesNotMatch(blade, /app-boot__/);
    assert.doesNotMatch(css, /\.app-boot(?:__|\s*\{)/);
});

test('application stylesheet is limited to tokens, base/loading rules and documented messaging edge cases', () => {
    assert.doesNotMatch(css, /\.ra-(?:button|control|page|surface|badge|form-field|tabs|menu|dialog|pagination)/);
    assert.ok(css.includes('Verified edge-case CSS'));
    assert.ok(css.includes('.rad-messaging'));
    assert.ok(css.includes('.app-skeleton'));
});

test('shared UI component source does not introduce arbitrary hex or raw palette colors', () => {
    const componentSources = [primitives, cards, feedback, navigation, dialog, skeletons, layouts, buyerWorkspace, artistWorkspace, messaging, artworkDetail, artworkStudio, adminWorkspace, ...publicPages];
    const arbitraryHex = /#[0-9a-fA-F]{3,8}\b/;
    const rawPalette = /\b(?:bg|text|border|ring)-(?:red|green|blue|amber|emerald|orange|yellow|purple|pink|indigo|cyan|teal|lime|sky|rose|violet|fuchsia|stone|zinc|gray|slate|neutral)-\d{2,3}(?:\/\d{1,3})?\b/;
    for (const source of componentSources) {
        assert.equal(arbitraryHex.test(source), false, 'Shared components must use semantic color tokens, not hex literals.');
        assert.equal(rawPalette.test(source), false, 'Shared components must use semantic color roles, not raw palette utilities.');
    }
});


test('route fallbacks preserve page-specific geometry for catalogues, artists and messaging', () => {
    assert.ok(routeLoading.includes("pathname === '/artworks'"));
    assert.ok(routeLoading.includes("pathname === '/artists'"));
    assert.ok(routeLoading.includes('ArtworkCardSkeleton'));
    assert.ok(routeLoading.includes('ArtistCardSkeleton'));
    assert.ok(routeLoading.includes('min-h-[34rem]'));
    assert.ok(routeLoading.includes('role="status"'));
    assert.ok(routeLoading.includes('aria-busy="true"'));
});

test('shared query cache keeps recently visited data warm and supports stale-while-revalidate screens', () => {
    assert.ok(queryClient.includes('staleTime: 60_000'));
    assert.ok(queryClient.includes('gcTime: 10 * 60_000'));
    assert.ok(queryClient.includes('refetchOnReconnect: true'));
    assert.ok(artistWorkspace.includes("queryKey: ['artist-workspace', 'artworks', user?.id]"));
    assert.ok(artistWorkspace.includes('enabled: !profileLoading && Boolean(profile?.slug)'));
    assert.ok(routeLoading.includes("queryKey: profileKey"));
    assert.ok(routeLoading.includes('queryClient.setQueryData(profileKey, nextProfile)'));
});


test('artwork-origin direct messaging loads the canonical conversation context before consuming the deep link', () => {
    const startIndex = messaging.indexOf("request({ method: 'post', url: '/api/v1/conversations/direct'");
    const detailIndex = messaging.indexOf("axios.get('/api/v1/conversations/' + conversationId");
    const consumeIndex = messaging.indexOf("next.delete('artist')");
    assert.ok(startIndex >= 0 && detailIndex > startIndex && consumeIndex > detailIndex);
    assert.ok(messaging.includes("selected?.contexts?.some((context) => context.artwork?.slug)"));
    assert.ok(messagingQueries.includes("queryKey: messagingKeys.detail(conversationId, userId)"));
    assert.ok(messaging.includes("setDirectStartAttempt((attempt) => attempt + 1)"));
    assert.ok(artworkDetail.includes("'&artwork=' + encodeURIComponent(artwork.slug)"));
});

test('loading skeletons mirror the main structures of the major project surfaces', () => {
    for (const component of [
        'ArtworkStudioListSkeleton',
        'ConversationInboxSkeleton',
        'MessageHistorySkeleton',
        'AdminRecordListSkeleton',
        'AdminUserCardsSkeleton',
        'ArtworkModerationSkeleton',
        'MessageReportsSkeleton',
        'DashboardMetricSkeleton',
        'ArtistRecentWorkSkeleton',
        'WorkspaceIdentitySkeleton',
        'CollectionCardSkeleton',
        'CollectionDetailSkeleton',
        'AdminEditorialSkeleton',
        'NotificationListSkeleton',
        'HomePageSkeleton',
    ]) assert.ok(skeletons.includes('export function ' + component), 'Missing skeleton: ' + component);
    assert.ok(artworkStudio.includes('<ArtworkStudioListSkeleton count={3} />'));
    assert.ok(adminWorkspace.includes('<ArtworkModerationSkeleton count={4} />'));
    assert.ok(adminWorkspace.includes('<AdminUserCardsSkeleton count={4} />'));
    assert.ok(adminWorkspace.includes('<MessageReportsSkeleton count={3} />'));
    assert.ok(messaging.includes('<ConversationInboxSkeleton count={6} />'));
    assert.ok(messaging.includes('<MessageHistorySkeleton count={5}'));
    assert.ok(skeletons.includes('aspect-[4/3]'));
    assert.ok(skeletons.includes('aspect-[4/5]'));
    assert.ok(skeletons.includes('aria-label="در حال آماده‌سازی صفحه اصلی"'));
    assert.ok(skeletons.includes('sm:min-h-64'));
});


test('artwork-origin messages persist and render a reply-style artwork reference for both participants', () => {
    assert.ok(messaging.includes('artwork_id: pendingArtwork?.id ?? null'));
    assert.ok(messaging.includes('message.artwork &&'));
    assert.ok(messaging.includes("to={'/artworks/' + message.artwork.slug}"));
    assert.ok(messaging.includes('setPendingArtwork(artwork)'));
    assert.ok(messaging.includes('پاسخ درباره این اثر'));
    assert.ok(messaging.includes('اثر مورد گفتگو'));
    assert.ok(messaging.includes("aria-label={'ارسال پیام درباره ' + artwork.title}"));
    assert.ok(conversationApi.includes("Schema::hasColumn('messages', 'artwork_id')"));
    assert.ok(conversationApi.includes("'artwork_id' => $supportsArtworkReferences"));
    assert.ok(conversationApi.includes("$message->relationLoaded('artwork')"));
    assert.ok(conversationApi.includes("'image_url' => '/api/v1/artworks/'.$artwork->slug.'/image'"));
    assert.ok(conversationApi.includes("$artwork->artistProfile?->user_id"));
    assert.ok(messageModel.includes("'artwork_id'"));
    assert.ok(messageModel.includes('function artwork(): BelongsTo'));
});
