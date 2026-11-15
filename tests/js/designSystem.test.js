import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');
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
const bootShell = readFileSync(new URL('../../resources/views/app.blade.php', import.meta.url), 'utf8');
const legacyApp = readFileSync(new URL('../../resources/js/app/App.jsx', import.meta.url), 'utf8');
const homePage = readFileSync(new URL('../../resources/js/app/HomePage.jsx', import.meta.url), 'utf8');
const authPage = readFileSync(new URL('../../resources/js/app/AuthPage.jsx', import.meta.url), 'utf8');
const artistProfile = readFileSync(new URL('../../resources/js/app/ArtistProfilePage.jsx', import.meta.url), 'utf8');
const artworkGallery = readFileSync(new URL('../../resources/js/app/ArtworkGallery.jsx', import.meta.url), 'utf8');
const artworkCatalogue = readFileSync(new URL('../../resources/js/app/ArtworkCatalogue.jsx', import.meta.url), 'utf8');
const editorialPages = readFileSync(new URL('../../resources/js/app/EditorialPages.jsx', import.meta.url), 'utf8');
const publicInfoPages = readFileSync(new URL('../../resources/js/app/PublicInfoPages.jsx', import.meta.url), 'utf8');

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
    for (const alias of ['canvas:', 'terracotta:', 'muted:', 'warning:', 'info:', 'success: {', 'danger: {', 'warning: {', 'info: {', 'accent: {', 'inverse:', 'fontSize:', 'lineHeight:', 'spacing:']) {
        assert.ok(tailwind.includes(alias), `Missing Tailwind alias: ${alias}`);
    }
    assert.ok(tailwind.includes('var(--color-canvas)'));
    assert.ok(tailwind.includes('var(--text-base)'));
    assert.ok(tailwind.includes('var(--space-4)'));
});

test('shared primitives express accessible component contracts with semantic Tailwind utilities', () => {
    assert.ok(primitives.includes('bg-terracotta text-inverse'));
    assert.ok(primitives.includes('focus-visible:outline'));
    assert.ok(primitives.includes('aria-[invalid=true]:border-danger'));
    assert.ok(primitives.includes('aria-busy={loading || undefined}'));
    assert.ok(primitives.includes("'aria-describedby': describedBy"));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
    assert.doesNotMatch(primitives, /ra-[a-z]/);
});

test('shared content and feedback components use semantic utility classes', () => {
    assert.ok(cards.includes('bg-surface-muted'));
    assert.ok(cards.includes('aspect-[4/5]'));
    assert.ok(feedback.includes('color-mix(in_srgb,var(--color-danger)_30%,transparent)'));
    assert.ok(feedback.includes('animate-skeleton-shimmer'));
    assert.ok(feedback.includes('border-s-4'));
    assert.doesNotMatch(cards, /ra-[a-z]/);
    assert.doesNotMatch(feedback, /ra-[a-z]/);
});

test('RAD visual tokens are declared in one canonical root block', () => {
    assert.equal((css.match(/:root\s*\{/g) ?? []).length, 1);
    assert.ok(css.includes('--color-overlay: rgb(36 35 32 / 64%)'));
    assert.ok(css.includes('--overlay-backdrop-blur: 8px;'));
    assert.ok(css.includes('--color-message-own:'));
    assert.ok(css.includes('--color-success-surface:'));
});

test('shared layout and form primitives expose semantic utility compositions', () => {
    for (const utility of ['max-w-[var(--content-wide-width)]', 'max-w-[var(--content-reading-width)]', 'border-b border-border', 'bg-surface-muted', 'bg-terracotta text-inverse', 'aria-[invalid=true]:border-danger']) {
        assert.ok(primitives.includes(utility), 'Missing shared utility contract: ' + utility);
    }
    for (const component of ['PageContainer', 'PageHeader', 'SectionHeader', 'Surface', 'StatusBadge', 'WorkspaceHero', 'DashboardMetricCard']) {
        assert.ok(primitives.includes('function ' + component), 'Missing shared component: ' + component);
    }
    assert.doesNotMatch(primitives, /ra-[a-z]/);
});

test('public catalogue, artist directory and artwork detail use shared page layout primitives', () => {
    assert.ok(publicPages[0].includes('PageContainer') && publicPages[0].includes('PageHeader'));
    assert.ok(publicPages[1].includes('PageContainer') && publicPages[1].includes('SectionHeader'));
    assert.ok(publicPages[2].includes('PageContainer'));
    assert.ok(buyerWorkspace.includes('WorkspaceHero') && buyerWorkspace.includes('<Surface'));
});

test('public and role-based workspaces use shared semantic shell utilities', () => {
    for (const utility of ['min-h-screen bg-canvas text-ink', 'sticky top-0 z-40 border-b border-border', 'grid min-w-0 max-w-content', 'rounded-xl border border-border bg-paper']) {
        assert.ok(layouts.includes(utility), 'Missing shell utility: ' + utility);
    }
    assert.doesNotMatch(layouts, /ra-[a-z]/);
});

test('navigation and dialog primitives use Tailwind state and focus utilities', () => {
    assert.ok(navigation.includes('data-[state=active]:border-terracotta'));
    assert.ok(navigation.includes('data-[disabled]:pointer-events-none'));
    assert.ok(navigation.includes('focus-visible:ring-2'));
    assert.ok(navigation.includes('aria-current="page"'));
    assert.ok(dialog.includes('bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]'));
    assert.ok(dialog.includes('max-h-[min(88dvh,48rem)]'));
    assert.ok(dialog.includes('rounded-xl border border-border-strong bg-paper'));
    assert.doesNotMatch(navigation, /ra-[a-z]/);
    assert.doesNotMatch(dialog, /ra-[a-z]/);
});

test('dashboard headers and notification drawer use the shared accessible RAD dialog primitive', () => {
    assert.ok(layouts.includes('aria-haspopup="dialog"'));
    assert.ok(layouts.includes('<Dialog open={open} onOpenChange={setOpen}>'));
    assert.ok(layouts.includes('<DialogTrigger asChild>'));
    assert.ok(layouts.includes('<DialogContent'));
    assert.ok(layouts.includes('<DialogTitle id="workspace-notification-title"'));
    assert.ok(layouts.includes('<DialogClose asChild>'));
    assert.ok(layouts.includes('workspace-notification-panel'));
    assert.ok(layouts.includes('!right-0 !top-0 !h-dvh'));
    assert.doesNotMatch(layouts, /panelPosition|closeOnOutsidePointer|aria-modal="false"/);
    assert.ok(layouts.includes('aria-haspopup="dialog"'));
    assert.ok(layouts.includes('aria-modal="true"'));
    assert.ok(layouts.includes('bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]'));
    assert.ok(layouts.includes('workspace-mobile-menu'));
    assert.ok(layouts.includes('document.body.style.overflow = \'hidden\''));
    assert.ok(layouts.includes('lg:hidden'));
    assert.ok(layouts.includes('hidden min-w-0 rounded-xl border border-border bg-paper'));
    assert.ok(adminWorkspace.includes('<PageHeader'));
    assert.ok(artistWorkspace.includes('<WorkspaceHero'));
    assert.ok(buyerWorkspace.includes('<WorkspaceHero'));
    assert.ok(messaging.includes('<PageHeader'));
    assert.ok(messaging.includes('after:bg-terracotta'));
});

test('boot shell and application presentation use Tailwind utilities with no component CSS selectors', () => {
    assert.ok(bootShell.includes('grid grid-cols-1 items-center gap-12'));
    assert.ok(bootShell.includes('lg:grid-cols-[minmax(0,1fr)_minmax(16rem,.9fr)]'));
    assert.doesNotMatch(bootShell, /app-boot__/);
    assert.doesNotMatch(css, /\.ra-[\w-]+|\.app-boot(?:__[\w-]+)?/);
    assert.doesNotMatch(css, /\.rad-messaging|\.app-skeleton/);
    assert.ok(tailwind.includes('skeleton-shimmer'));
    assert.ok(feedback.includes('motion-reduce:animate-none'));
    assert.doesNotMatch(messaging, /rad-messaging|composer-shell|message-edit-shell|message-artwork-card__|related-artworks-chip__|related-artworks-strip__|message-conversation-avatar-link/);
});

test('shared UI component source does not introduce arbitrary hex or raw palette colors', () => {
    const componentSources = [primitives, cards, feedback, navigation, dialog, skeletons];
    const arbitraryHex = /#[0-9a-fA-F]{3,8}\b/;
    const rawPalette = /\b(?:bg|text|border|ring)-(?:red|green|blue|amber|emerald|orange|yellow|purple|pink|indigo|cyan|teal|lime|sky|rose|violet|fuchsia|stone|zinc|gray|slate|neutral)-\d{2,3}(?:\/\d{1,3})?\b/;
    for (const source of componentSources) {
        assert.equal(arbitraryHex.test(source), false, 'Shared components must use semantic color tokens, not hex literals.');
        assert.equal(rawPalette.test(source), false, 'Shared components must use semantic color roles, not raw palette utilities.');
    }
});


test('active frontend surfaces use semantic RAD colors and avoid raw palette utilities', () => {
    const componentSources = [primitives, cards, feedback, navigation, dialog, skeletons];
    const applicationSources = [legacyApp, homePage, authPage, artistProfile, artworkGallery, artworkCatalogue, editorialPages, publicInfoPages, layouts, buyerWorkspace, routeLoading, artistWorkspace, messaging, artworkDetail, artworkStudio, adminWorkspace, ...publicPages];
    const sources = [...componentSources, ...applicationSources];
    const rawPalette = /\b(?:bg|text|border|ring)-(?:red|green|blue|amber|emerald|orange|yellow|purple|pink|indigo|cyan|teal|lime|sky|rose|violet|fuchsia|stone|zinc|gray|slate|neutral)-\d{2,3}(?:\/\d{1,3})?\b/;
    const tokenOpacity = /\b(?:bg|text|border|ring)-(?:paper|inverse|canvas|ink|terracotta|sand|olive|muted|subtle|border|surface|surface-muted|success|danger|warning|info|accent|focus)(?:-[\w-]+)?\/\d+\b/;
    for (const source of sources) {
        assert.equal(rawPalette.test(source), false, 'Application surfaces must use semantic RAD color roles.');
        assert.equal(tokenOpacity.test(source), false, 'Semantic token opacity must use a valid color-mix utility.');
        assert.doesNotMatch(source, /\bra-[\w-]+/, 'Application components must not depend on legacy RAD CSS selectors.');
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
