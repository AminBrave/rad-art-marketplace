import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { cn } from '../../resources/js/lib/utils.js';

const languageContext = readFileSync(new URL('../../resources/js/app/LanguageContext.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../../tailwind.config.js', import.meta.url), 'utf8');
const primitives = readFileSync(new URL('../../resources/js/components/ui/primitives.jsx', import.meta.url), 'utf8');
const layoutPrimitives = readFileSync(new URL('../../resources/js/components/ui/layout.jsx', import.meta.url), 'utf8');
const uiIndex = readFileSync(new URL('../../resources/js/components/ui/index.js', import.meta.url), 'utf8');
const cards = readFileSync(new URL('../../resources/js/components/ui/cards.jsx', import.meta.url), 'utf8');
const feedback = readFileSync(new URL('../../resources/js/components/ui/feedback.jsx', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../../resources/js/components/ui/navigation.jsx', import.meta.url), 'utf8');
const dialog = readFileSync(new URL('../../resources/js/components/ui/Dialog.jsx', import.meta.url), 'utf8');
const tooltip = readFileSync(new URL('../../resources/js/components/ui/Tooltip.jsx', import.meta.url), 'utf8');
const alertDialog = readFileSync(new URL('../../resources/js/components/ui/AlertDialog.jsx', import.meta.url), 'utf8');
const skeletons = readFileSync(new URL('../../resources/js/components/ui/skeletons.jsx', import.meta.url), 'utf8');
const showcase = readFileSync(new URL('../../resources/js/app/ComponentShowcase.jsx', import.meta.url), 'utf8');
const publicPages = ['ArtworkCatalogue.jsx', 'ArtistDirectoryPage.jsx', 'ArtworkDetailPage.jsx'].map((file) => readFileSync(new URL('../../resources/js/app/' + file, import.meta.url), 'utf8'));
const layouts = readFileSync(new URL('../../resources/js/app/Layouts.jsx', import.meta.url), 'utf8');
const appRouter = readFileSync(new URL('../../resources/js/app/AppRouter.jsx', import.meta.url), 'utf8');
const workspaceNavigation = readFileSync(new URL('../../resources/js/app/workspaceNavigation.js', import.meta.url), 'utf8');
const buyerWorkspace = readFileSync(new URL('../../resources/js/app/BuyerWorkspace.jsx', import.meta.url), 'utf8');
const routeLoading = readFileSync(new URL('../../resources/js/app/RoutingPages.jsx', import.meta.url), 'utf8');
const queryClient = readFileSync(new URL('../../resources/js/lib/queryClient.js', import.meta.url), 'utf8');
const artistWorkspace = readFileSync(new URL('../../resources/js/app/ArtistWorkspaceOverview.jsx', import.meta.url), 'utf8');
const messaging = readFileSync(new URL('../../resources/js/app/MessagingCenter.jsx', import.meta.url), 'utf8');
const messagingInbox = readFileSync(new URL('../../resources/js/app/MessagingInboxPanel.jsx', import.meta.url), 'utf8');
const messagingAvatarUtils = readFileSync(new URL('../../resources/js/app/messagingAvatarUtils.js', import.meta.url), 'utf8');
const conversationHeader = readFileSync(new URL('../../resources/js/app/ConversationHeader.jsx', import.meta.url), 'utf8');
const messageTimeline = readFileSync(new URL('../../resources/js/app/MessageTimeline.jsx', import.meta.url), 'utf8');
const messageComposer = readFileSync(new URL('../../resources/js/app/MessageComposer.jsx', import.meta.url), 'utf8');
const relatedArtworkStrip = readFileSync(new URL('../../resources/js/app/RelatedArtworkStrip.jsx', import.meta.url), 'utf8');
const messagingStatusBanners = readFileSync(new URL('../../resources/js/app/MessagingStatusBanners.jsx', import.meta.url), 'utf8');
const messagingSurface = messaging + '\n' + messagingInbox + '\n' + conversationHeader + '\n' + messageTimeline + '\n' + messageComposer + '\n' + relatedArtworkStrip + '\n' + messagingStatusBanners;
const messagingQueries = readFileSync(new URL('../../resources/js/app/useMessagingQueries.js', import.meta.url), 'utf8');
const artworkDetail = readFileSync(new URL('../../resources/js/app/ArtworkDetailPage.jsx', import.meta.url), 'utf8');
const artworkEngagement = readFileSync(new URL('../../resources/js/app/ArtworkEngagement.jsx', import.meta.url), 'utf8');
const artworkStudio = readFileSync(new URL('../../resources/js/app/ArtworkStudio.jsx', import.meta.url), 'utf8');
const conversationApi = readFileSync(new URL('../../app/Http/Controllers/Api/V1/ConversationController.php', import.meta.url), 'utf8');
const messageModel = readFileSync(new URL('../../app/Models/Message.php', import.meta.url), 'utf8');
const adminWorkspace = readFileSync(new URL('../../resources/js/app/AdminWorkspace.jsx', import.meta.url), 'utf8');
const bootShell = readFileSync(new URL('../../resources/views/app.blade.php', import.meta.url), 'utf8');
const authContext = readFileSync(new URL('../../resources/js/app/AuthContext.jsx', import.meta.url), 'utf8');
const webRoutes = readFileSync(new URL('../../routes/web.php', import.meta.url), 'utf8');
const publicPageController = readFileSync(new URL('../../app/Http/Controllers/PublicPageController.php', import.meta.url), 'utf8');
const legacyApp = readFileSync(new URL('../../resources/js/app/App.jsx', import.meta.url), 'utf8');
const homePage = readFileSync(new URL('../../resources/js/app/HomePage.jsx', import.meta.url), 'utf8');
const authPage = readFileSync(new URL('../../resources/js/app/AuthPage.jsx', import.meta.url), 'utf8');
const artistProfile = readFileSync(new URL('../../resources/js/app/ArtistProfilePage.jsx', import.meta.url), 'utf8');
const artworkGallery = readFileSync(new URL('../../resources/js/app/ArtworkGallery.jsx', import.meta.url), 'utf8');
const artworkCatalogue = readFileSync(new URL('../../resources/js/app/ArtworkCatalogue.jsx', import.meta.url), 'utf8');
const editorialPages = readFileSync(new URL('../../resources/js/app/EditorialPages.jsx', import.meta.url), 'utf8');
const publicInfoPages = readFileSync(new URL('../../resources/js/app/PublicInfoPages.jsx', import.meta.url), 'utf8');
const designSystem = readFileSync(new URL('../../AI/DESIGN-SYSTEM.md', import.meta.url), 'utf8');

test('hero headers omit decorative squares and accent pseudo-elements', () => {
    assert.doesNotMatch(primitives, /rd-hero-decoration|before:bg-\[color:var\(--rd-hero-accent\)\]/);
});

test('workspace full-bleed content mirrors its horizontal offset in RTL', () => {
    assert.match(css, /\[dir='rtl'\] \.rd-workspace-main \.rd-bleed[\s\S]*?transform: translateX\(var\(--rd-workspace-bleed-offset\)\)/);
});


test('workspace page sections use explicit shared Section spacing', () => {
    for (const source of [adminWorkspace, artworkStudio, routeLoading, editorialPages]) {
        assert.doesNotMatch(source, /<Container\s+as="section"/);
        assert.match(source, /<Section spacing="(?:none|compact|regular|relaxed)"/);
    }
});

test('workspace page headers share the full-width hero contract', () => {
    for (const source of [adminWorkspace, artworkStudio, routeLoading, editorialPages]) {
        assert.match(source, /<PageHeader(?:\s|\n)/);
        assert.doesNotMatch(source, /<PageHeader[^>]*\bbleed=\{false\}/);
    }
    assert.match(primitives, /export function PageHeader\(props\)\s*\{\s*return <UnifiedHero/);
});

test('workspace heroes use the shared full-width grid hero implementation', () => {
    assert.match(primitives, /export function WorkspaceHero\(props\)\s*\{\s*return <UnifiedHero/);
    assert.ok(primitives.includes("surface = 'grid'"));
    assert.ok(primitives.includes("bleed && 'rd-bleed'"));
    assert.ok(artistWorkspace.includes('<Container width="wide" className="rd-workspace-content space-y-workspace-relaxed">'));
    assert.doesNotMatch(artistWorkspace, /<div className="rd-container min-w-0 mx-auto w-full max-w-content space-y-7">/);
});

test('artwork and artist cards preserve matte spacing with cover imagery and card surfaces', () => {
    assert.ok(cards.includes('p-3 sm:p-4'), 'Artwork images retain passepartout spacing.');
    assert.ok(cards.includes('imageClassName="object-cover'), 'Artwork imagery covers its padded media frame.');
    assert.ok(cards.includes('bg-paper'), 'Artist cards use the shared card surface.');
    assert.ok(cards.includes('border border-border bg-paper'), 'Artist cards use a consistent card boundary.');
});

test('artwork media uses a consistent 3:4 portrait frame throughout the application', () => {
    assert.ok(css.includes('--rd-artwork-ratio: 3 / 4;'));
    for (const source of [cards, artworkGallery, artworkDetail, artworkStudio, adminWorkspace, homePage, skeletons, routeLoading, bootShell]) {
        assert.doesNotMatch(source, /aspect-\[(?:4\/3|4\/5|5\/4)\]/, 'Artwork surfaces must use the shared portrait proportion.');
    }
    assert.ok(cards.includes('imageClassName="object-cover'));
    assert.ok(artworkDetail.includes('imageClassName="object-cover'));
    assert.ok(artworkStudio.includes('imageClassName="object-cover'));
});

test('artwork catalogue uses accessible infinite pagination and workspace containers avoid duplicate gutters', () => {
    assert.ok(artworkCatalogue.includes('useInfiniteQuery'));
    assert.ok(artworkCatalogue.includes('getNextPageParam'));
    assert.ok(artworkCatalogue.includes('new window.IntersectionObserver'));
    assert.ok(artworkCatalogue.includes('fetchNextPage'));
    assert.ok(artworkCatalogue.includes('بارگذاری آثار بیشتر'));
    assert.doesNotMatch(artworkCatalogue, /صفحه‌بندی آثار/);
    assert.doesNotMatch(layoutPrimitives, /max-w-content(?:-reading)? px-page-gutter/);
    assert.ok(css.includes('.rd-workspace-main .rd-bleed .rd-container:not(.rd-container--reading):not(.rd-container--full)'));
});


test('messaging avatars and artwork chips use square geometry without decorative shine', () => {
    assert.doesNotMatch(primitives, /rd-shine|shine/i);
    assert.doesNotMatch(messagingInbox, /rd-shine|shine/i);
    assert.doesNotMatch(conversationHeader, /rd-shine|shine/i);
    assert.doesNotMatch(relatedArtworkStrip, /rd-shine|shine/i);
    assert.doesNotMatch(css, /rd-shine|rd-shine-sequence|rd-shine-hover/);
    assert.doesNotMatch(css, /@keyframes rd-shine/);
    assert.doesNotMatch(messagingInbox, /h-10 w-10[^\\n]*rounded-full/);
    assert.doesNotMatch(conversationHeader, /h-11 w-11[^\\n]*rounded-full/);
    assert.doesNotMatch(relatedArtworkStrip, /rounded-full/);
    assert.ok(messageTimeline.includes('rd-message-bubble--own'));
    assert.ok(messageTimeline.includes('rd-message-bubble--peer'));
    assert.ok(css.includes('rd-message-bubble--own::before'));
    assert.ok(css.includes('rd-message-bubble--peer::before'));
});

test('homepage hero stacks artwork above copy on mobile and keeps a two-column desktop layout', () => {
    assert.ok(homePage.includes('mediaPosition="before"'), 'Homepage hero artwork must precede its copy on mobile.');
    assert.ok(primitives.includes("mediaPosition = 'after'"), 'The shared hero keeps media order configurable without changing other pages.');
    assert.ok(primitives.includes("mediaPosition === 'before' && 'order-last lg:order-first'"));
    assert.ok(primitives.includes("mediaPosition === 'before' && 'order-first lg:order-last'"));
    assert.ok(homePage.includes('relative aspect-[3/4] w-full overflow-hidden'));
    assert.ok(css.includes('grid-template-columns: minmax(0, 1fr);'), 'Mobile homepage hero must use one full-width column.');
    assert.ok(primitives.includes('lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,.85fr)]'), 'The shared hero restores its balanced two-column layout on desktop.');
    assert.doesNotMatch(css, /grid-template-columns: minmax\(0, 1fr\) minmax\(6\.5rem, \.52fr\)/, 'Mobile hero must not squeeze the image beside its copy.');
});

test('locale switching persists globally and owns document language and direction', () => {
    assert.ok(languageContext.includes("const STORAGE_KEY = 'rademan-locale'"));
    assert.ok(languageContext.includes('root.lang = locale'));
    assert.ok(languageContext.includes("root.dir = locale === 'fa' ? 'rtl' : 'ltr'"));
    assert.ok(languageContext.includes('window.localStorage.setItem(STORAGE_KEY, locale)'));
    assert.ok(languageContext.includes("window.addEventListener('storage', syncLocale)"));
    assert.ok(layouts.includes('function LanguageControl'));
    assert.ok(layouts.includes('onClick={() => setLocale(nextLocale)}'));
    assert.ok(bootShell.includes('document.documentElement.lang = locale'));
    assert.ok(bootShell.includes('document.documentElement.dir = locale === "fa" ? "rtl" : "ltr"'));
    assert.equal((bootShell.match(/dir="rtl"/g) ?? []).length, 1, 'Only the document root declares the default RTL direction.');
    const directionalSources = [layouts, homePage, messagingInbox, messageTimeline, messaging, conversationHeader, messageComposer, relatedArtworkStrip, artistWorkspace, buyerWorkspace, adminWorkspace, routeLoading, artworkDetail, artworkStudio, artistProfile, artworkGallery, ...publicPages, primitives, cards, feedback, navigation, dialog, alertDialog, tooltip, skeletons, showcase, editorialPages, publicInfoPages];
    for (const source of directionalSources) assert.doesNotMatch(source, /dir=["']rtl["']/);
    assert.doesNotMatch(layoutPrimitives, /rd-container--wide/);
    assert.ok(layoutPrimitives.includes("resolvedWidth !== 'wide' &&"));
    assert.ok(css.includes(":root[lang='en']"));
    assert.ok(css.includes('.rd-hero-surface :where(img, picture, video, canvas, svg)'));
    assert.ok(css.includes('overflow-x: clip;'));
});
test('public and workspace navigation expose role-aware destinations and an artist profile preview', () => {
    assert.ok(layouts.includes('setOpen(false);\n        onNavigate?.();'), 'Opening a notification closes its dialog and the parent navigation drawer before routing.');
    assert.ok(layouts.includes('navigate(item.target_url || (item.conversation_id'), 'Opening a notification navigates to its target even if marking it read fails.');
    assert.ok(layouts.includes('function PublicBottomNavigation'));
    assert.ok(layouts.includes('to: dashboardHref'));
    assert.ok(layouts.includes("outletContext?.profile?.slug"));
    assert.ok(workspaceNavigation.includes("shortLabel: 'داشبورد'"));
    assert.ok(workspaceNavigation.includes("'/dashboard/artist/settings', label: 'تنظیمات', shortLabel: 'تنظیمات', mobilePrimary: false"));
    assert.ok(layouts.includes('data-testid="public-bottom-navigation"'));
    assert.ok(layouts.includes('function AuthenticatedBottomNavigation'));
    assert.ok(layouts.includes('data-testid="authenticated-bottom-navigation"'));
    assert.ok(layouts.includes('unreadConversationCount={unreadConversationCount}'), 'Discovery navigation receives the unread conversation count.');
    assert.ok(layouts.includes('function PublicBottomNavigation({ user, unreadConversationCount = 0 })'));
    assert.ok(layouts.includes('<NotificationBell user={user} onNavigate={() => setMobileMenuOpen(false)} />'), 'Both drawers expose notifications with a callback that closes the parent drawer.');
    assert.ok(layouts.includes("label: t('کشف')") && layouts.includes("label: t('هنرمندان')") && layouts.includes("label: t('مجموعه‌ها')"), 'Discover sidebar labels match the public bottom navigation.');
    assert.ok(layouts.includes("const publicDiscoveryLinks = [") && layouts.includes("{ to: '/artworks', label: 'کشف', Icon: Compass") && layouts.includes("{ to: '/collections', label: 'مجموعه‌ها', Icon: Bookmark"), 'Both drawers reuse the same Discover destination definitions.');
    assert.ok(layouts.includes("label: t(user ? (user.role === 'artist' ? 'فضای هنرمند' : user.role === 'admin' ? 'مدیریت' : 'فضای خریدار') : 'حساب کاربری')"), 'Discover separates the Workspace group from its Discover destinations.');
    assert.ok(layouts.includes("t(user ? 'حساب کاربری' : 'ورود')"), 'The public bottom navigation uses the account label for signed-in users.');
    assert.ok(layouts.includes("t(item.shortLabel ?? workspaceNavigationLabels[item.to] ?? item.label)"), 'Workspace sidebar labels use the same compact names as its bottom navigation.');
    assert.ok(layouts.includes("isActive ? 'text-terracotta-strong' : 'text-muted hover:text-ink'"), 'Sidebar destinations use text-only active styling without a background.');
    assert.doesNotMatch(layouts, /isActive\s*\?\s*'bg-paper[^']*shadow-soft'/, 'No sidebar active state adds a background or shadow.');
    assert.ok(layouts.includes("after:absolute after:inset-x-1/3 after:top-0 after:h-0.5 after:bg-terracotta"), 'Public active navigation keeps its top indicator line.');
    assert.ok(layouts.includes("after:absolute after:inset-x-1/4 after:top-0 after:h-0.5 after:rounded-full after:bg-terracotta"), 'Workspace active navigation keeps its top indicator line.');
    assert.doesNotMatch(layouts, /isActive[\s\S]{0,180}bg-paper/, 'Active bottom navigation destinations have no background.');
    assert.ok(layouts.includes('inline-flex h-5 min-w-5 items-center justify-center'), 'Unread bubbles center their number in both navigation bars.');
    assert.ok(layouts.includes("label: t(user?.role === 'artist' ? 'فضای هنرمند' : user?.role === 'admin' ? 'مدیریت' : 'فضای خریدار')"), 'Workspace section labels reflect the signed-in role.');
    assert.ok(layouts.includes("item.to + '#submitted-artworks'"), 'The artist content navigation targets the submitted-artworks section.');
    assert.ok(readFileSync(new URL('../../resources/js/app/ArtworkStudio.jsx', import.meta.url), 'utf8').includes('id="submitted-artworks"'));
    assert.ok(layouts.includes('const profileHref = artistProfileQuery.data?.slug'));
    assert.ok(layouts.includes("label: 'پیش‌نمایش پروفایل'"));
    assert.ok(layouts.includes("outletContext?.profile?.slug"));
    assert.ok(artistWorkspace.includes('پیش‌نمایش پروفایل'));
    assert.ok(artistWorkspace.includes('ویرایش پروفایل'));
    assert.ok(artistProfile.includes('<DiscoveryHero') && artistProfile.includes('alt={t("تصویر نمایه هنرمند")}'), 'Artist identity is presented in the shared discovery hero with meaningful image text.');
    assert.ok(artistProfile.includes('دنبال‌کننده'));
    assert.ok(artistProfile.includes('grid min-w-0 max-w-full grid-cols-1'), 'Artist artwork results use a min-width-safe responsive grid.');
});

test('featured collections header follows the full-width artwork gallery header pattern', () => {
    const heroStart = editorialPages.indexOf('eyebrow={t("انتخاب سردبیر")}');
    const heroEnd = editorialPages.indexOf('/>', heroStart);
    assert.ok(heroStart >= 0 && heroEnd > heroStart);
    assert.ok(editorialPages.slice(heroStart, heroEnd).includes('title={t("مجموعه‌های منتخب")}'));
    assert.doesNotMatch(editorialPages.slice(heroStart, heroEnd), /max-w-3xl/, 'The collection hero copy is not constrained by a route-specific width.');
});

test('comment discussions use nested cards and a clear reply hierarchy', () => {
    assert.ok(artworkEngagement.includes('aria-label={t("پاسخ‌های این دیدگاه")}'));
    assert.ok(artworkEngagement.includes('border-s-2 border-terracotta/40'));
    assert.ok(artworkEngagement.includes('bg-surface-muted p-3 sm:p-4'));
    assert.ok(artworkEngagement.includes('space-y-3'));
});

test('semantic radius utilities reference design tokens without global CSS overrides', () => {
    assert.ok(css.includes('--rd-radius-0: 0;'));
    assert.ok(css.includes('--rd-radius-sm: var(--rd-radius-0);'));
    assert.doesNotMatch(css, /border-radius:\s*0\s*!important/);
    assert.ok(tailwind.includes("full: 'var(--rd-radius-pill)'"));
    assert.ok(tailwind.includes("card: 'var(--rd-radius-lg)'"));
    assert.ok(tailwind.includes("pill: 'var(--rd-radius-pill)'"));
    for (const source of [primitives, layoutPrimitives, feedback, navigation, dialog, alertDialog, tooltip, skeletons, messageTimeline, messageComposer, homePage]) {
        assert.doesNotMatch(source, /\brounded-(?:sm|md|lg|xl|2xl|3xl)\b/, 'Components must use semantic radius aliases rather than arbitrary radius scales.');
    }
});


test('homepage discovery groups and artist spotlight use reusable card structure with RTL layout', () => {
    assert.ok(homePage.includes('grid-cols-[3rem_minmax(0,1fr)]'));
    assert.ok(homePage.includes('bg-surface-muted py-section sm:py-section-wide'));
    assert.ok(homePage.includes("ARTIST SPOTLIGHT / {t('هنرمند منتخب')}"));
    assert.ok(homePage.includes('rd-hero-surface') && homePage.includes('border-y border-[color:var(--rd-hero-line)]'));
    assert.ok(homePage.includes('<Card'));
});

test('editorial hero surfaces define readable light and dark semantic palettes', () => {
    assert.ok(css.includes('--rd-hero-background: #EAE4D9;'));
    assert.ok(css.includes('--rd-hero-background: #20211D;'));
    assert.ok(css.includes(':root[data-theme=\'dark\']'));
    assert.ok(css.includes('@media (prefers-color-scheme: dark)'));
    assert.ok(css.includes('.rd-hero-surface'));
    assert.ok(primitives.includes('rd-hero-surface') && primitives.includes('text-[color:var(--rd-hero-foreground)]'), 'Shared PageHeader and WorkspaceHero use theme-aware foregrounds.');
    assert.ok(homePage.includes('text-[color:var(--rd-hero-foreground)]'));
    assert.ok(artistProfile.includes('text-[color:var(--rd-hero-foreground)]'), 'Public artist profiles use the shared theme-aware hero foreground.');
    assert.ok(routeLoading.includes('rd-hero-surface'), 'Artist directory loading state mirrors the theme-aware hero.');
});

test('buttons enforce square geometry and shared alignment', () => {
    assert.ok(primitives.includes("className, 'rounded-none whitespace-nowrap'"));
    assert.ok(primitives.includes("className, 'rounded-none shrink-0'"));
});

test('section primitives provide consistent vertical rhythm', () => {
    assert.ok(layoutPrimitives.includes("regular: 'py-section sm:py-section-wide'"));
    assert.ok(layoutPrimitives.includes("none: 'py-0'"));
    assert.doesNotMatch(layoutPrimitives, /Element === ['\"]section['\"]/);
    assert.doesNotMatch(layoutPrimitives.slice(layoutPrimitives.indexOf('export const Container'), layoutPrimitives.indexOf('export const Section')), /py-16|py-24/);
});

test('class composition understands semantic radius and content-width utilities', () => {
    assert.equal(cn('rounded-md', 'rounded-control'), 'rounded-control');
    assert.equal(cn('rounded-full', 'rounded-control'), 'rounded-control');
    assert.equal(cn('max-w-content', 'max-w-full'), 'max-w-full');
    assert.equal(cn('max-w-content-reading', 'max-w-content'), 'max-w-content');
});

test('semantic palette, typography, spacing and layout tokens have one CSS source', () => {
    for (const token of [
        '--color-canvas', '--color-ink', '--color-terracotta', '--color-terracotta-strong',
        '--color-sand', '--color-olive', '--color-paper', '--color-text-muted',
        '--color-border', '--color-success', '--color-danger', '--color-warning', '--color-info',
        '--color-success-surface', '--color-danger-surface', '--color-warning-surface', '--color-info-surface', '--color-accent-surface', '--color-inverse-text', '--color-message-own', '--color-message-peer',
        '--font-persian', '--font-latin', '--text-base', '--leading-copy',
        '--space-1', '--space-4', '--space-8', '--radius-md', '--content-width',
        '--page-gutter', '--control-height-md', '--artwork-ratio', '--workspace-bottom-nav-height',
        '--workspace-bottom-nav-primary-height',
    ]) {
        assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing design token: ${token}`);
    }
});

test('Tailwind semantic aliases reference CSS variables rather than duplicate literal values', () => {
    for (const alias of ['canvas:', 'terracotta:', 'muted:', 'warning:', 'info:', 'success: {', 'danger: {', 'warning: {', 'info: {', 'accent: {', 'inverse:', 'fontSize:', 'lineHeight:', 'spacing:']) {
        assert.ok(tailwind.includes(alias), `Missing Tailwind alias: ${alias}`);
    }
    assert.ok(tailwind.includes('var(--rd-canvas)'));
    assert.ok(tailwind.includes('var(--rd-text-primary)'));
    assert.ok(tailwind.includes('var(--rd-action)'));
    assert.ok(tailwind.includes("control: 'var(--rd-radius-md)'"));
    assert.ok(tailwind.includes('var(--rd-success)'));
    assert.ok(css.includes('--text-base: var(--rd-text-base)'));
    assert.ok(css.includes('--space-4: var(--rd-space-4)'));
});

test('shared primitives express accessible component contracts with semantic Tailwind utilities', () => {
    assert.ok(primitives.includes('border border-divider-group bg-paper p-5'));
    assert.ok(primitives.includes("raised: 'border border-divider-group bg-surface shadow-soft'"));
    assert.ok(primitives.includes("interactive: 'border border-divider-group bg-surface"));
    assert.ok(primitives.includes('bg-terracotta text-inverse'));
    assert.ok(primitives.includes('focus-visible:outline'));
    assert.ok(primitives.includes('aria-[invalid=true]:border-danger'));
    assert.ok(primitives.includes('aria-busy={loading || undefined}'));
    assert.ok(primitives.includes("'aria-describedby': describedBy"));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
    assert.ok(primitives.includes('bg-accent-surface text-terracotta-strong'));
    assert.ok(primitives.includes('before:bg-terracotta'), 'SectionHeader keeps its restrained eyebrow rule; hero headers remain free of decorative accents.');
    assert.ok(primitives.includes('text-[clamp(1.75rem,4.2vw,3.5rem)]'));
    assert.ok(primitives.includes('max-sm:items-stretch max-sm:flex-col'), 'SectionHeader stacks its title and actions on narrow screens.');
    assert.ok(primitives.includes('max-sm:w-full'), 'SectionHeader actions can use the full available width on mobile.');
    assert.doesNotMatch(primitives, /ra-[a-z]/);
});

test('shared content and feedback components use semantic utility classes', () => {
    assert.ok(cards.includes('bg-surface-muted'));
    assert.ok(cards.includes('aspect-[3/4]'));
    assert.ok(feedback.includes('color-mix(in_srgb,var(--color-danger)_30%,transparent)'));
    assert.ok(feedback.includes('animate-skeleton-shimmer'));
    assert.ok(feedback.includes('border-s-4'));
    assert.doesNotMatch(cards, /ra-[a-z]/);
    assert.doesNotMatch(feedback, /ra-[a-z]/);
});

test('Rademan semantic design tokens are declared centrally and resolve through theme-aware roles', () => {
    assert.equal((css.match(/:root \{/g) ?? []).length, 1);
    assert.ok(css.includes('--rd-overlay: rgb(36 35 32 / 64%)'));
    assert.ok(css.includes('--color-overlay: var(--rd-overlay)'));
    assert.ok(css.includes('--rd-message-own:'));
    assert.ok(css.includes('--rd-success:'));
    assert.ok(css.includes('--rd-success-surface:'));
    assert.ok(css.includes('--color-success-surface: var(--rd-success-surface)'));
    assert.ok(tailwind.includes('var(--rd-success-surface)'));
    assert.ok(tailwind.includes('var(--rd-shadow-soft)'));
    assert.ok(css.includes('--color-action-text: var(--rd-action-text)'));
    assert.doesNotMatch(css, /--color-[\w-]+:\s*#[0-9a-f]/i);
    assert.ok(css.includes(":root[data-theme='dark']"));
    assert.ok(css.includes('@media (prefers-color-scheme: dark)'));
});

test('shared layout and form primitives expose semantic utility compositions', () => {
    for (const utility of ['max-w-content', 'max-w-content-reading', 'full: \'w-full max-w-none\'', 'rd-bleed']) {
        assert.ok(layoutPrimitives.includes(utility), 'Missing canonical layout utility contract: ' + utility);
    }
    for (const component of ['Container', 'Section', 'Separator', 'Card']) {
        assert.ok(layoutPrimitives.includes('function ' + component), 'Missing shared layout component: ' + component);
    }
    assert.ok(primitives.includes('export const PageContainer = Container'), 'PageContainer must remain a compatibility alias to the canonical Container.');
    for (const component of ['PageHeader', 'SectionHeader', 'Surface', 'StatusBadge', 'WorkspaceHero', 'DashboardMetricCard']) {
        assert.ok(primitives.includes('function ' + component), 'Missing shared component: ' + component);
    }
    assert.doesNotMatch(primitives, /ra-[a-z]/);
});

test('artist profile content cannot expand the viewport horizontally', () => {
    assert.ok(artistProfile.includes('<div className="min-h-[65vh] overflow-x-clip">'));
    assert.ok(artistProfile.includes('<Container width="wide">'));
    assert.ok(artistProfile.includes('<Section spacing="regular" className="mt-10 min-w-0 max-w-full"'));
    assert.ok(artistProfile.includes('grid min-w-0 max-w-full grid-cols-1'));
    assert.ok(artistProfile.includes('className="min-w-0 [overflow-wrap:anywhere]"'));
    assert.ok(primitives.includes('break-words text-[clamp(1.75rem,4.2vw,3.5rem)]'), 'Shared hero headings wrap long artist names safely.');
});
test('route canvases stay full-width and route content uses shared section containers', () => {
    assert.match(css, /\.rd-page-frame\s*\{[^}]*width:\s*100%;[^}]*margin:\s*0;/s);
    assert.ok(layoutPrimitives.includes("bleed && 'rd-bleed'"));
    assert.match(css, /\.rd-bleed\s*\{[^}]*width:\s*auto;[^}]*max-width:\s*100vw;/s);
    assert.doesNotMatch(css.match(/\.rd-bleed\s*\{[^}]*\}/s)?.[0] ?? '', /(?:^|[;\s])width:\s*100vw/);
    assert.ok(css.includes('.rd-workspace-main .rd-bleed .rd-container:not(.rd-container--reading):not(.rd-container--full)'));
    assert.ok(css.includes('overflow-x: clip;'), 'Viewport bleed must not create document-level horizontal scrolling.');
    assert.doesNotMatch(css, /--rd-workspace-sidebar-width|--rd-workspace-column-gap/, 'The fixed-sidebar layout tokens are no longer part of the workspace shell.');
    assert.ok(layouts.includes('rd-workspace-main min-w-0 w-full'));
    assert.doesNotMatch(layouts, /lg:grid-cols-\[var\(--rd-workspace-sidebar-width/);
    assert.ok(layouts.includes('rd-workspace-main min-w-0'));
    assert.ok(layoutPrimitives.includes("wide: 'mx-auto w-full max-w-content'") && layouts.includes('<PageShell variant="workspace">'));
    assert.ok(layouts.includes('pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)]'));
    assert.ok(layoutPrimitives.includes("resolvedWidth !== 'wide' &&"));
    assert.ok(layoutPrimitives.includes("wide: 'mx-auto w-full max-w-content'"));
    assert.ok(skeletons.includes('<Section as=\"header\" spacing=\"none\" bleed'), 'Full-bleed loading skeleton headers explicitly opt out of section rhythm.');
    assert.ok(skeletons.includes('<Container as=\"div\" width=\"wide\"'));
    assert.ok(!skeletons.includes('<main '), 'Route skeletons must not introduce nested main landmarks.');
    assert.match(routeLoading, /<Section spacing="none" bleed/ , 'Loading states must preserve full-bleed section composition.');
    assert.ok(homePage.includes('<Container width=\"wide\" className=\"grid gap-4 sm:grid-cols-3\">'));
    assert.ok(homePage.includes('<Section spacing="regular"'));
    assert.doesNotMatch(homePage, /<Container as="section"/);
    for (const source of [homePage, editorialPages, authPage, publicInfoPages, artistProfile]) {
        assert.ok(!source.includes('<main '), 'Route content must not create a nested main landmark.');
    }
});

test('public catalogue, artist directory and artwork detail use shared page layout primitives', () => {
    assert.ok(publicPages[0].includes('Container') && publicPages[0].includes('DiscoveryHero'));
    assert.ok(publicPages[1].includes('Container') && publicPages[1].includes('SectionHeader'));
    assert.ok(publicPages[1].includes('<DiscoveryHero'), 'Artist directory uses the shared discovery hero rather than a route-specific Section hero.');
    assert.ok(primitives.includes('rd-hero-surface'), 'Discovery and workspace heroes share the same adaptive surface primitive.');
    assert.ok(publicPages[2].includes('Container') && publicPages[2].includes('width=\"wide\"'));
    assert.ok(buyerWorkspace.includes('WorkspaceHero') && buyerWorkspace.includes('<SectionHeader'));
    assert.ok(buyerWorkspace.includes('<Section spacing="none"'), 'Buyer Studio composes its content with the shared Section primitive.');
    assert.ok(buyerWorkspace.includes('<SectionHeader'), 'Buyer Studio uses the shared section heading pattern.');
    assert.ok(designSystem.includes('Product information architecture'));
});

test('public and role-based workspaces use shared semantic shell utilities', () => {
    assert.ok(layouts.includes('sticky top-0 z-40 border-b border-divider-section'));
    assert.ok(layouts.includes('<PageShell as="main" id="main-content">'));
    assert.ok(layouts.includes('<PageShell variant="workspace">'));
    assert.ok(layoutPrimitives.includes('rd-page-frame') && layoutPrimitives.includes('min-w-0 w-full'));
    assert.ok(layoutPrimitives.includes("wide: 'mx-auto w-full max-w-content'"));
    assert.doesNotMatch(layouts, /ra-[a-z]/);
});

test('navigation and dialog primitives use Tailwind state and focus utilities', () => {
    assert.ok(navigation.includes('data-[state=active]:border-terracotta'));
    assert.ok(navigation.includes('data-[disabled]:pointer-events-none'));
    assert.ok(navigation.includes('focus-visible:ring-2'));
    assert.ok(navigation.includes('aria-current="page"'));
    assert.ok(dialog.includes('bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]'));
    assert.ok(dialog.includes('max-h-[min(88dvh,48rem)]'));
    assert.ok(dialog.includes('border border-border bg-paper'));
    assert.doesNotMatch(navigation, /ra-[a-z]/);
    assert.doesNotMatch(dialog, /ra-[a-z]/);
});

test('form controls and helper hints use accessible shared Radix primitives', () => {
    assert.ok(primitives.includes('forwardRef(function Button'));
    assert.ok(primitives.includes('<select'));
    assert.ok(primitives.includes('CheckboxPrimitive.Root'));
    assert.ok(primitives.includes("type: 'checkbox'"));
    assert.ok(primitives.includes('data-[state=checked]:bg-terracotta'));
    assert.ok(tooltip.includes('TooltipPrimitive.Root'));
    assert.ok(alertDialog.includes('AlertDialogPrimitive.Root'));
    assert.ok(feedback.includes('ToastPrimitive.Provider'));
    assert.ok(feedback.includes('ToastPrimitive.Viewport'));
    assert.ok(designSystem.includes('Accessible controls, form states, dialogs, menus, notifications'));
    assert.ok(editorialPages.includes('<AlertDialogAction asChild>'));
    assert.ok(editorialPages.includes('event.preventDefault(); publish(collection, false)'));
    assert.ok(editorialPages.includes('<AlertDialogTitle>'));
    assert.match(messageTimeline, /import\s*\{[^}]*\bDropdownMenu\b[^}]*\}\s*from\s*['"]\.\.\/components\/ui['"]/);
    assert.doesNotMatch(messaging, /@radix-ui/);
    assert.ok(messagingInbox.includes('<Tooltip content={t("گزینه‌های گفتگو")}>'));
    assert.ok(messageTimeline.includes('<Tooltip content={t("افزودن واکنش")}>'));
    assert.ok(artworkStudio.includes('<SelectField'));
    assert.ok(editorialPages.includes('<Checkbox'));
    assert.ok(uiIndex.includes('Checkbox'), 'Checkbox is exported through the shared UI component barrel.');
});

test('public and workspace navigation plus notifications use the shared RAD Radix Dialog drawer', () => {
    assert.ok(layouts.includes('<Dialog open={open} onOpenChange={setOpen}>'));
    assert.ok(layouts.includes('<Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>'));
    assert.ok(layouts.includes('<DialogTrigger asChild>'));
    assert.ok(layouts.includes('<DialogContent'));
    assert.ok(layouts.includes('<DialogTitle className="text-base tracking-tight">{t("اعلان‌ها")}</DialogTitle>'), 'The notification drawer exposes its visible title through Radix DialogTitle.');
    assert.ok(layouts.includes('<DialogClose asChild>'));
    assert.ok(layouts.includes('workspace-notification-panel'));
    assert.ok(layouts.includes('placement="drawer"'));
    assert.ok(layouts.includes('حساب کاربری'));
    assert.ok(layouts.includes('<nav aria-label={section.label}>'), 'The shared sidebar labels each navigation group from its section heading.');
    assert.doesNotMatch(layouts, /panelPosition|closeOnOutsidePointer|mobileMenuPanelRef|closeMobileMenu/);
    assert.ok(layouts.includes('aria-haspopup="dialog"'));
    assert.ok(dialog.includes('bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]'));
    assert.doesNotMatch(layouts, /document\.body\.style\.overflow|addEventListener\('keydown', closeOnEscape/);
    assert.ok(layouts.includes('fixed inset-x-0 bottom-0 z-50'));
    assert.ok(layouts.includes('lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.ok(layouts.includes('lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.ok(adminWorkspace.includes('<PageHeader'));
    assert.ok(artistWorkspace.includes('<PageHeader'));
    assert.ok(buyerWorkspace.includes('<WorkspaceHero'));
    assert.ok(artistWorkspace.includes('<SectionHeader'));
    assert.ok(buyerWorkspace.includes('<SectionHeader'));
    assert.ok(adminWorkspace.includes('<SectionHeader'));
    assert.ok(artworkStudio.includes('<SectionHeader'));
    assert.ok(editorialPages.includes('<SectionHeader'));
    assert.ok(routeLoading.includes('<WorkspaceHero'));
    assert.ok(routeLoading.includes('<PageHeader'));
    assert.doesNotMatch(messaging, /<PageHeader/);
    assert.ok(conversationHeader.includes('after:bg-terracotta'), 'The extracted conversation header retains its terracotta top accent.');
    const heroStart = primitives.indexOf('export function UnifiedHero');
    const heroEnd = primitives.indexOf('\n}\n\nconst sharedHeroDefaults', heroStart);
    assert.ok(heroStart >= 0 && heroEnd > heroStart);
    const hero = primitives.slice(heroStart, heroEnd);
    assert.ok(hero.includes('rd-hero-surface'), 'The workspace hero uses the shared editorial surface.');
    assert.doesNotMatch(hero, /overflow-hidden|bg-ink|text-inverse/, 'The hero must not clip descendants or force inverse text colors.');
    assert.ok(hero.includes('text-[color:var(--rd-hero-foreground)]') && hero.includes('text-[color:var(--rd-hero-muted)]'));
    assert.ok(hero.includes('<Container width="wide"'), 'The hero delegates width and horizontal spacing to the shared Container.');
    assert.ok(layoutPrimitives.includes("wide: 'mx-auto w-full max-w-content'") && layoutPrimitives.includes("resolvedWidth !== 'wide' &&"), 'The wide Container delegates its gutter to the shared CSS container rule.');
    assert.ok(hero.includes('grid min-w-0 items-center gap-7 lg:gap-12'), 'Hero copy and media use the shared responsive grid.');
    assert.ok(hero.includes('flex min-w-0 flex-wrap items-center gap-3'), 'Hero actions can shrink and wrap without widening the page.');
    assert.ok(hero.includes('text-[color:var(--rd-hero-accent)]'));
    assert.ok(!artworkStudio.includes('className="border-0 pb-0 pt-0"'));
});;

test('messaging avatar helpers share one canonical implementation across inbox and conversation header', () => {
    assert.ok(messaging.includes("from './messagingAvatarUtils'"));
    assert.ok(messagingInbox.includes("from './messagingAvatarUtils'"));
    assert.ok(messaging.includes('avatarInitial={avatarInitial}'));
    assert.ok(messaging.includes('avatarTone={avatarTone}'));
    assert.ok(messagingInbox.includes('avatarTone(thread.participant?.name)'));
    assert.ok(messagingInbox.includes('avatarInitial(thread.participant?.name)'));
    assert.equal((messaging.match(/function avatarTone\s*\(/g) ?? []).length, 0);
    assert.equal((messaging.match(/function avatarInitial\s*\(/g) ?? []).length, 0);
    assert.equal((messagingInbox.match(/function avatarTone\s*\(/g) ?? []).length, 0);
    assert.equal((messagingInbox.match(/function avatarInitial\s*\(/g) ?? []).length, 0);
    assert.ok(messagingAvatarUtils.includes('export function avatarTone(name)'));
    assert.ok(messagingAvatarUtils.includes('export function avatarInitial(name)'));
    assert.ok(messagingAvatarUtils.includes('value.codePointAt(0) ?? 0'));
    assert.ok(messagingAvatarUtils.includes('String(name ?? \'گفتگو\').trim()'));
    assert.ok(messagingAvatarUtils.includes('String(name ?? \'گ\').trim().slice(0, 1) || \'گ\''));
    for (const tone of [
        'bg-[color:color-mix(in_srgb,var(--color-sand)_65%,transparent)] text-ink',
        'bg-[color:color-mix(in_srgb,var(--color-olive)_10%,transparent)] text-olive',
        'bg-[color:color-mix(in_srgb,var(--color-terracotta)_10%,transparent)] text-terracotta-strong',
        'bg-surface-muted text-ink',
    ]) assert.ok(messagingAvatarUtils.includes(tone), 'Missing shared avatar tone: ' + tone);
});

test('messaging status banners preserve accessible presentation and remain a dedicated component', () => {
    assert.ok(messaging.includes('<MessagingStatusBanners'));
    assert.ok(messagingStatusBanners.includes('{notice && <p role="status"'));
    assert.ok(messagingStatusBanners.includes('{error && <p role="alert"'));
    assert.ok(messagingStatusBanners.includes("دریافت گفتگوها انجام نشد. دوباره تلاش کنید."));
    assert.ok(messagingStatusBanners.includes('directStartLoading &&'));
    assert.ok(messagingStatusBanners.includes('directStartError &&'));
    assert.ok(messagingStatusBanners.includes('LoaderCircle'));
    assert.ok(messagingStatusBanners.includes('onClick={onRetryInbox}'));
    assert.ok(messagingStatusBanners.includes('onClick={onRetryDirectStart}'));
    assert.ok(messagingStatusBanners.indexOf('{notice &&') < messagingStatusBanners.indexOf('{error &&'));
    assert.ok(messagingStatusBanners.indexOf('{error &&') < messagingStatusBanners.indexOf('{inboxError &&'));
    assert.ok(messagingStatusBanners.indexOf('{inboxError &&') < messagingStatusBanners.indexOf('{directStartLoading &&'));
    assert.ok(messagingStatusBanners.indexOf('{directStartLoading &&') < messagingStatusBanners.indexOf('{directStartError &&'));
});

test('messaging conversation filters use the shared RAD-styled Radix Tabs primitive', () => {
    assert.ok(messagingInbox.includes('<Tabs value={threadFilter} onValueChange={setThreadFilter}'));
    const filterTriggerClasses = [...messagingInbox.matchAll(/<TabsTrigger[^>]*className="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(filterTriggerClasses.length, 3, 'All three inbox filters use the shared Tabs primitive.');
    for (const className of filterTriggerClasses) {
        assert.match(className, /inline-flex/);
        assert.match(className, /flex-row/);
        assert.match(className, /items-center/);
        assert.match(className, /justify-center/);
    }
    assert.ok(messagingInbox.includes('<TabsContent value={threadFilter}'));
    assert.ok(messagingInbox.includes('<ul className="min-h-0 flex-1 divide-y'));
    assert.ok(messagingInbox.includes('<TabsList aria-label={t("فیلتر گفتگوها")}'));
    assert.ok(messagingInbox.includes('<TabsTrigger value="all"'));
    assert.ok(messagingInbox.includes('<TabsTrigger value="unread"'));
    assert.ok(messagingInbox.includes('<TabsTrigger value="archived"'));
    assert.ok(navigation.includes('data-[state=active]:border-terracotta'));
    assert.doesNotMatch(messaging, /document\.getElementById\('conversation-filter-/);
});;


test('messaging fills the workspace viewport and keeps compact Telegram-inspired density', () => {
    assert.ok(messaging.includes('flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden'));
    assert.ok(messaging.includes('grid h-full min-h-0 w-full min-w-0 flex-1 grid-cols-1'));
    assert.ok(layouts.includes('const isMessagingRoute = pathname.endsWith(\'/messages\')'));
    assert.ok(layouts.includes('h-[calc(100dvh-var(--rd-workspace-header-height)-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('sm:h-[calc(100dvh-var(--rd-workspace-header-height-wide)-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('h-[calc(100dvh-var(--rd-workspace-header-height)-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.doesNotMatch(layouts, /lg:grid-cols-\[15rem_minmax\(0,1fr\)\]/);
    assert.doesNotMatch(layouts, /direction:ltr|<aside dir="rtl"|<main dir="rtl"/);
    
    
    assert.ok(layouts.includes("className={isMessagingRoute ?") && layouts.includes("flex h-dvh flex-col overflow-hidden bg-canvas text-ink") && layouts.includes("min-h-screen bg-canvas text-ink"));
    assert.doesNotMatch(messaging, /RAD \/ MESSAGES|ارتباط مستقیم|PageHeader/);
    assert.doesNotMatch(layouts, /ناوبری فضای کاری|RAD \/ MENU/);
    assert.ok(messageTimeline.includes('min-w-0 w-fit max-w-[88%]'));
    assert.ok(messagingInbox.includes('min-h-[4.75rem] w-full items-center gap-3'));
    assert.ok(messagingInbox.includes('absolute end-1 top-1/2 -translate-y-1/2'));
    assert.ok(messageTimeline.includes('mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-subtle'), 'Message metadata uses the current compact timeline spacing.');
    assert.ok(messageComposer.includes('max-h-28 min-h-[2.35rem] max-sm:min-h-9 w-full resize-none'));
    assert.ok(messageComposer.includes('absolute start-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9'));
    assert.ok(messageComposer.includes('ps-10 pe-3 py-[.4rem]'));
    assert.doesNotMatch(messaging, /md:min-h-\[min\(580px/);
    assert.doesNotMatch(messaging, /min-h-\[5\.35rem\]/);
});

test('messaging is viewport-locked between the authenticated app header and bottom navigation on mobile', () => {
    assert.ok(messagingInbox.includes('<h2 className="text-sm font-extrabold leading-6 text-ink">{t("پیام‌ها")}</h2>'), 'The inbox heading remains compact inside its panel.');
    assert.ok(messagingInbox.includes('<p className="mt-0.5 text-[10px] leading-4 text-muted">{t("یک بستر امن برای ارتباط خریدار با هنرمند.")}</p>'));
    assert.doesNotMatch(messageTimeline, /\brounded(?:-[a-z0-9-]+)?/);
    assert.ok(messaging.includes('flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden'));
    assert.ok(messaging.includes('grid h-full min-h-0 w-full min-w-0 flex-1'));
    assert.ok(messagingInbox.includes('divide-y divide-border/70 overflow-y-auto'), 'The inbox list scrolls inside its fixed panel.');
    const inboxList = messagingInbox.match(/<ul className="([^"]+)"/);
    assert.ok(inboxList, 'The conversation inbox list is present.');
    assert.doesNotMatch(inboxList[1], /scrollbar-gutter/ , 'The inbox list must not reserve a gutter that leaves a blank strip beside its content.');
    assert.ok(messageTimeline.includes('overflow-y-auto overscroll-contain'), 'Message history scrolls inside its fixed panel.');
    assert.ok(layouts.includes('flex h-dvh flex-col overflow-hidden'), 'Messaging locks the authenticated shell to the dynamic viewport.');
    assert.ok(layouts.includes('h-[calc(100dvh-var(--rd-workspace-header-height)-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('sm:h-[calc(100dvh-var(--rd-workspace-header-height-wide)-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('AuthenticatedBottomNavigation mobileLinks={mobileWorkspaceLinks} unreadConversationCount={unreadConversationCount}'));
    assert.ok(layouts.includes("fixed inset-x-0 bottom-0 z-50"));
    assert.ok(routeLoading.includes('fixed inset-x-0 bottom-0 z-50'));
    assert.ok(layouts.includes('lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.ok(layouts.includes('lg:h-16 lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.doesNotMatch(layouts, /<aside[^>]*lg:block/);
    assert.ok(layouts.includes('AuthenticatedBottomNavigation mobileLinks={mobileWorkspaceLinks} unreadConversationCount={unreadConversationCount}'));
    assert.ok(layouts.includes("className={isMessagingRoute ?") && layouts.includes("flex h-dvh flex-col overflow-hidden bg-canvas text-ink") && layouts.includes("min-h-screen bg-canvas text-ink"));
});

test('messaging chat geometry follows RTL logical flow and uses Radix collision-aware overlays', () => {
    assert.ok(messageTimeline.includes('<div ref={containerRef}'));
    assert.match(messageTimeline, /import\s*\{[^}]*\bDropdownMenu\b[^}]*\}\s*from\s*['"]\.\.\/components\/ui['"]/);
    assert.doesNotMatch(messaging + messageTimeline, /@radix-ui/);
    assert.ok(messageTimeline.split('<DropdownMenu.Root').length - 1 >= 2, 'Message reaction and action overlays use Radix.');
    assert.ok(messageTimeline.includes('<DropdownMenu.Portal>'));
    assert.ok(messageTimeline.includes('sideOffset={8} collisionPadding={8}'));
    assert.ok(messageTimeline.includes('var(--radix-dropdown-menu-content-available-height)'));
    assert.ok(messageTimeline.includes('flex-nowrap items-center gap-1 overflow-x-auto'));
    assert.ok(messageTimeline.includes('min-w-0 flex-wrap items-center justify-end gap-1.5'));
    assert.ok(messageTimeline.includes('overflow-x-hidden overflow-y-auto'));
    assert.ok(messagingInbox.includes('absolute end-1 top-1/2 -translate-y-1/2'));
    assert.ok(messageComposer.includes('absolute start-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9'));
    assert.ok(messageComposer.includes('ps-10 pe-3 py-[.4rem]'));
    assert.doesNotMatch(messaging, /getChatPopoverPosition|toggleChatPopover|createPortal|data-chat-popover-boundary/);
});

test('messaging actions use Radix menu semantics and preserve reply focus', () => {
    assert.ok(messaging.includes("const [openPopover, setOpenPopover] = useState(null)"));
    assert.ok(messaging.includes('const setPopoverOpen = (id, open) => setOpenPopover'));
    assert.ok(messageTimeline.includes('onCloseAutoFocus={(event) => {'));
    assert.ok(messageTimeline.includes('focusComposerAfterMenuCloseRef.current = true'));
    assert.ok(messageTimeline.includes('draftRef.current?.focus()'));
    assert.ok(messageTimeline.includes('<DropdownMenu.Trigger asChild>'));
    assert.ok(messagingInbox.includes("updateThreadSetting(thread, 'archived'"));
    assert.ok(messagingInbox.includes("updateThreadSetting(thread, 'muted'"));
    assert.ok(messageTimeline.includes('data-[highlighted]:bg-surface-muted'));
    assert.ok(messageTimeline.includes('aria-label={t("افزودن واکنش")}'));
    assert.ok(messageTimeline.includes('aria-label={t("عملیات پیام")}'));
    assert.ok(!messaging.includes("document.addEventListener('pointerdown'"));
    assert.ok(!messaging.includes("document.addEventListener('keydown'"));
    assert.ok(!messaging.includes("window.addEventListener('scroll', reposition"));
});

test('shared dialogs retain outside-click and Escape dismissal behavior', () => {
    assert.ok(dialog.includes('DialogPrimitive.Root'));
    assert.ok(dialog.includes('<DialogPrimitive.Overlay'));
    assert.ok(dialog.includes('<DialogPrimitive.Content'));
    assert.doesNotMatch(dialog, /onPointerDownOutside=\{[^}]*preventDefault/);
    assert.doesNotMatch(dialog, /onEscapeKeyDown=\{[^}]*preventDefault/);
});

test('responsive workspace navigation supports mobile task access and desktop role navigation', () => {
    const bottomStart = layouts.indexOf('function AuthenticatedBottomNavigation({ mobileLinks, unreadConversationCount = 0 })');
    const bottomEnd = layouts.indexOf('export function WorkspaceLayout', bottomStart);
    const bottomNavigation = layouts.slice(bottomStart, bottomEnd);
    const workspaceStart = layouts.indexOf('export function WorkspaceLayout');
    const workspaceLayout = layouts.slice(workspaceStart);

    assert.ok(bottomStart >= 0 && bottomEnd > bottomStart);
    assert.ok(bottomNavigation.includes('data-testid="authenticated-bottom-navigation"'));
    assert.ok(bottomNavigation.includes('fixed inset-x-0 bottom-0 z-50'));
    assert.ok(bottomNavigation.includes('pb-[env(safe-area-inset-bottom)]'));
    assert.ok(bottomNavigation.includes('fixed inset-x-0 bottom-0 z-50'));
    assert.ok(bottomNavigation.includes('lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.ok(bottomNavigation.includes('lg:h-16 lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.ok(bottomNavigation.includes('mobileLinks.map((item)'));
    assert.ok(layouts.includes('<PublicBottomNavigation user={user} unreadConversationCount={unreadConversationCount} />'));
    assert.ok(layouts.includes("user?.role === 'buyer' ? '/dashboard/buyer'"));
    assert.ok(layouts.includes('const dashboardHref ='));
    assert.ok(layouts.includes('function PublicBottomNavigation'));
    assert.ok(workspaceLayout.includes('<AuthenticatedBottomNavigation mobileLinks={mobileWorkspaceLinks} unreadConversationCount={unreadConversationCount} />'));
    assert.ok(workspaceLayout.includes('outletContext?.profile?.slug'));
    assert.ok(workspaceLayout.includes('workspaceLinks.map((item)'));
    assert.ok(workspaceLayout.includes('unreadInboxQuery'));
    assert.ok(workspaceLayout.includes("params: { filter: 'unread' }"));
    assert.ok(workspaceLayout.includes('refetchInterval: 30_000'));

    assert.ok(workspaceLayout.includes('<DialogTrigger asChild>'));
    assert.ok(workspaceLayout.includes("aria-label={t('باز کردن منوی حساب کاربری')}"));
    assert.ok(workspaceLayout.includes('<DialogContent'));
    assert.ok(workspaceLayout.includes('placement="drawer"'));
    assert.ok(layouts.includes('<nav aria-label={section.label}>'), 'The shared sidebar labels each navigation group from its section heading.');
    assert.ok(workspaceLayout.includes('workspaceLinks.map((item)'));
    assert.ok(bottomNavigation.includes('fixed inset-x-0 bottom-0 z-50'));
    assert.ok(bottomNavigation.includes('lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.ok(workspaceLayout.includes('<PageShell variant="workspace">'), 'Workspace content uses the shared full-width page frame.');
    assert.ok(css.includes('.rd-container:not(.rd-container--full) {\n    padding-inline: var(--rd-page-gutter);'), 'Shared sections own their default horizontal gutters.');
    assert.ok(layoutPrimitives.includes("wide: 'mx-auto w-full max-w-content'") && css.includes('.rd-container:not(.rd-container--full)'), 'Wide Containers own content width while the shared CSS rule applies gutters.');
    assert.ok(css.includes('.rd-page-frame--workspace {\n    width: 100%;'), 'Workspace page frame stays full-width without owning section gutters.');
    assert.ok(workspaceLayout.includes('<ThemeControl />'), 'Workspace appearance controls are available from the hamburger drawer.');
    assert.ok(workspaceLayout.includes('<LanguageControl />'), 'Workspace language control is available from the hamburger drawer.');
    assert.ok(layouts.includes("'/dashboard/artist/settings': SettingsIcon"));
    assert.ok(layouts.includes("'/dashboard/buyer/settings': SettingsIcon"));
    assert.ok(layouts.includes("'/admin/settings': SettingsIcon"));
    assert.ok(workspaceNavigation.includes("label: 'تنظیمات'"));
    assert.ok(appRouter.includes('<Route path="settings" element={<WorkspaceSettingsPage />} />'));
    assert.ok(routeLoading.includes('export function WorkspaceSettingsPage()'));
    assert.ok(routeLoading.includes('id="notification-settings-title"'));
    assert.ok(routeLoading.includes('ذخیره خودکار'));
    assert.ok(routeLoading.includes('border border-divider-group bg-paper p-4'));
    assert.ok(routeLoading.includes('تنظیمات اعلان‌های درون‌برنامه‌ای') || routeLoading.includes('اعلان‌های درون‌برنامه‌ای'));
    assert.doesNotMatch(layouts, /تنظیمات اعلان درون‌برنامه‌ای/, 'Notification preferences no longer live inside the notification drawer.');

    assert.ok(layouts.includes('function SidebarNavigation('), 'Discover and workspace drawers share one sidebar navigation renderer.');
    assert.ok(layouts.includes('<SidebarNavigation'), 'Both application shells render the same sidebar navigation panel.');
    assert.ok(layouts.includes("label: t('ردّمن')"), 'The shared panel includes the Rademan information section using the current brand label.');
    assert.ok(layouts.includes("label: t('کشف')"), 'The shared panel includes the same discovery section.');
    assert.ok(layouts.includes("label: t(user?.role === 'artist'"), 'The workspace section is included in the shared panel.');
    assert.ok(layouts.includes('publicDiscoveryLinks'), 'All discovery destinations are available in both sidebar contexts.');
    assert.ok(layouts.includes('onClick={onLogout}'), 'The shared sidebar invokes its dedicated logout callback only for the logout action.');
    assert.ok(layouts.includes('onLogout={handleLogout}'), 'Both layouts pass their logout flow to the shared sidebar.');
    assert.ok(layouts.includes("'/collections', label: 'مجموعه‌ها'"), 'Collections remain a first-class discovery destination.');
    assert.ok(layouts.includes("'/dashboard/artist/artworks/new'"), 'Artist creation destinations are included in the public-context workspace section.');
    assert.doesNotMatch(layouts, /publicSecondaryLinks|const publicLinks = \[/, 'Legacy split navigation lists are removed.');
    assert.ok(layouts.includes("aria-label={t('ناوبری بخش‌های عمومی')}"), 'Public discovery navigation remains available with localized labeling.');
    assert.ok(layouts.includes('<nav aria-label={section.label}>'), 'Both drawers render localized section labels through the shared sidebar navigation.');
    assert.ok(layouts.includes('my-5 border-t border-border'), 'Discover and workspace navigation sections use the same divider spacing.');
    assert.ok(layouts.includes('flex min-h-11 w-full items-center gap-3 border-s-2 border-transparent px-3 text-start text-sm font-semibold no-underline'), 'Discover drawer links use the shared full-width row geometry.');
    assert.ok(layouts.includes('DialogContent placement="drawer" className="flex flex-col px-4 py-5"'), 'The shared discovery drawer owns its horizontal and outer vertical padding.');
    assert.ok(layouts.includes('min-h-0 flex-1 overflow-y-auto py-5'), 'The shared navigation panel owns vertical scroll padding without duplicating drawer gutters.');
    assert.ok(layouts.includes('<ThemeControl />'), 'The public shell exposes the global theme control.');
    assert.ok(routeLoading.includes('cycleTheme'), 'Workspace theme preferences live on the settings route.');
    assert.ok(!css.includes('.rd-page-frame--workspace .rd-container {'), 'Workspace Container gutters must not be reset by a page-shell CSS override.');
    assert.ok(css.includes('--workspace-bottom-nav-primary-height: var(--rd-workspace-nav-height);'));
    assert.ok(css.includes('--workspace-bottom-nav-height: var(--rd-workspace-nav-height);'));
    assert.doesNotMatch(css, /--workspace-bottom-nav-secondary-height/);
    assert.ok(routeLoading.includes("getWorkspacePrimaryLinks('artist')"));
    assert.ok(routeLoading.includes("getWorkspacePrimaryLinks('buyer')"));
    assert.ok(routeLoading.includes("getWorkspacePrimaryLinks('admin')"));
    assert.ok(workspaceLayout.includes('data-experience={user?.role ?? \'workspace\'}'));
});

test('product and design guidance defines the new Rademan experience architecture', () => {
    for (const principle of [
        'distinctive, usable art platform',
        'Current experience context',
        'Visual system',
        'Accessibility and localization',
        'Responsive and installable experiences',
        'Messaging experience',
        'Implementation references',
    ]) assert.ok(designSystem.includes(principle), 'Missing current product/design guidance: ' + principle);
});
test('auth bootstrap resolves session state before React mounts without caching personalized HTML', () => {
    assert.ok(bootShell.includes('id="rad-auth-bootstrap"'));
    assert.ok(bootShell.includes('request()->user()'));
    assert.ok(authContext.includes("document.getElementById('rad-auth-bootstrap')"));
    assert.ok(authContext.includes('if (!initialAuth.available && !initialRefreshStartedRef.current)'));
    assert.ok(authContext.includes("axios.get('/api/v1/auth/me')"), 'The legacy endpoint remains available as a fallback when the Blade bootstrap is absent or invalid.');
    assert.ok(webRoutes.includes("Route::get('/', [PublicPageController::class, 'app'])"));
    assert.ok(webRoutes.includes("Route::get('/{path?}', [PublicPageController::class, 'app'])"));
    assert.ok(publicPageController.includes("->header('Cache-Control', 'private, no-store, max-age=0, must-revalidate')"));
    assert.equal((publicPageController.match(/response\(\)->view\('app'/g) ?? []).length, 1, 'Only the private app-view helper should render the SPA shell directly.');
    assert.ok(publicPageController.includes('return $this->appView(['));
});

test('protected-route auth loading preserves the centered workspace shell and bottom navigation', () => {
    assert.ok(routeLoading.includes('function WorkspaceAuthLoading'));
    assert.ok(routeLoading.includes('max-w-content'));
    assert.ok(routeLoading.includes('max-w-content'));
    assert.ok(routeLoading.includes('<WorkspaceAuthLoading><RouteLoading label="در حال بررسی نشست کاربری…'));
    assert.ok(routeLoading.includes('<WorkspaceAuthLoading><RouteLoading label="در حال بررسی سطح دسترسی…'));
});

test('workspace first-paint skeleton uses the same constrained shell as the loaded workspace', () => {
    assert.ok(bootShell.includes("mx-auto w-full max-w-content px-page-gutter"));
    assert.doesNotMatch(bootShell, /lg:grid-cols-\[15rem_minmax\(0,1fr\)\]/);
    assert.ok(bootShell.includes("$isMessagingRoute = request()->is('dashboard/artist/messages', 'dashboard/buyer/messages')"));
    assert.ok(bootShell.includes('workspace-bottom-nav-primary-height'));
    assert.ok(bootShell.includes("$workspaceNavigationCount = request()->is('dashboard/buyer*') ? 3 : 5"));
    assert.ok(routeLoading.includes("pathname.startsWith('/dashboard/buyer') ? 3 : 5"));
    assert.ok(bootShell.includes("$isArtworkStudio = request()->is('dashboard/artist/artworks', 'dashboard/artist/artworks/new')"));
    assert.ok(bootShell.includes('fixed inset-x-0 bottom-0 z-50'));
    assert.ok(bootShell.includes('lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.ok(bootShell.includes('lg:h-16 lg:w-fit lg:grid-flow-col lg:auto-cols-[7rem]'));
    assert.doesNotMatch(bootShell, /<aside[^>]*lg:block/);
});

test('Blade first-paint skeletons use route-specific geometry for studio forms, directories and collections', () => {
    assert.ok(bootShell.includes("$isArtworkStudio = request()->is('dashboard/artist/artworks', 'dashboard/artist/artworks/new')"));
    assert.ok(bootShell.includes("$isCollectionDetail = request()->is('collections/*')"));
    assert.ok(bootShell.includes("$isCollectionIndex = request()->is('collections')"));
    assert.ok(bootShell.includes("request()->is('admin/editorial')"));
    assert.ok(bootShell.includes("request()->is('dashboard/artist')"));
    assert.ok(bootShell.includes("request()->is('dashboard/buyer')"));
    assert.ok(bootShell.includes("request()->is('dashboard/artist/messages', 'dashboard/buyer/messages')"));
    assert.ok(bootShell.includes('@elseif ($isArtworkStudio)'));
    assert.ok(bootShell.includes('@elseif ($isArtistProfileSettings)'));
    assert.ok(bootShell.includes('@elseif ($isAuthForm)'));
    assert.ok(bootShell.includes('aspect-[3/4]'));
    assert.ok(bootShell.includes('h-14 w-14 shrink-0 rounded-full'));
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


test('active frontend surfaces use semantic Rademan colors and avoid raw palette utilities', () => {
    const componentSources = [primitives, cards, feedback, navigation, dialog, skeletons];
    const applicationSources = [legacyApp, homePage, authPage, artistProfile, artworkGallery, artworkCatalogue, editorialPages, publicInfoPages, layouts, buyerWorkspace, routeLoading, artistWorkspace, messaging, messageComposer, artworkDetail, artworkStudio, adminWorkspace, ...publicPages];
    const sources = [...componentSources, ...applicationSources];
    const rawPalette = /\b(?:bg|text|border|ring)-(?:red|green|blue|amber|emerald|orange|yellow|purple|pink|indigo|cyan|teal|lime|sky|rose|violet|fuchsia|stone|zinc|gray|slate|neutral)-\d{2,3}(?:\/\d{1,3})?\b/;
    for (const source of sources) {
        assert.equal(rawPalette.test(source), false, 'Application surfaces must use semantic Rademan color roles.');
        assert.doesNotMatch(source, /\bra-[\w-]+/, 'Application components must not depend on legacy RAD CSS selectors.');
    }
});

test('route fallbacks mirror loaded page geometry for catalogues, workspaces, admin and messaging', () => {
    assert.ok(routeLoading.includes("pathname === '/artworks'"));
    assert.ok(routeLoading.includes("pathname === '/artists'"));
    assert.ok(routeLoading.includes('ArtworkCardSkeleton'));
    assert.ok(routeLoading.includes('ArtistCardSkeleton'));
    assert.ok(routeLoading.includes("pathname === '/dashboard/artist/artworks'"));
    assert.ok(routeLoading.includes("pathname === '/dashboard/artist/artworks/new'") || routeLoading.includes("pathname.startsWith('/dashboard/artist/artworks')"));
    assert.ok(routeLoading.includes('ArtworkStudioListSkeleton count={3} announce={false}'));
    assert.ok(routeLoading.includes("pathname === '/admin/editorial'"));
    assert.ok(routeLoading.includes('AdminEditorialSkeleton announce={false}'));
    assert.ok(routeLoading.includes('ArtistWorkspaceOverviewSkeleton'));
    assert.ok(routeLoading.includes('BuyerDashboardSkeleton'));
    assert.ok(routeLoading.includes('if (isCollectionDetail) return <CollectionDetailSkeleton />;'));
    assert.ok(routeLoading.includes('hasRequestedConversation'));
    assert.ok(routeLoading.includes('flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden'));
    assert.doesNotMatch(routeLoading, /min-h-\[34rem\]/, 'Messaging fallback must fill the viewport-locked workspace slot instead of imposing a guessed minimum height.');
    assert.ok(routeLoading.includes('role="status"'));
    assert.ok(routeLoading.includes('aria-busy="true"'));
});

test('shared query cache keeps recently visited data warm and supports stale-while-revalidate screens', () => {
    assert.ok(queryClient.includes('staleTime: 60_000'));
    assert.ok(queryClient.includes('gcTime: 10 * 60_000'));
    assert.ok(queryClient.includes('refetchOnReconnect: true'));
    assert.ok(artistWorkspace.includes("queryKey: ['artist-workspace', 'artworks', user?.id]"));
    assert.ok(artistWorkspace.includes('enabled: !profileLoading && Boolean(profile?.slug)'));
    assert.ok(artistWorkspace.includes('className="w-full"'), 'Artist overview uses the compact page frame.');
    assert.doesNotMatch(artistWorkspace, /rounded-xl border border-border bg-paper p-5 shadow-soft/);
    assert.ok(routeLoading.includes("queryKey: profileKey"));
    assert.ok(routeLoading.includes('queryClient.setQueryData(profileKey, nextProfile)'));
});


test('artwork-origin direct messaging loads the canonical conversation context before consuming the deep link', () => {
    const startIndex = messaging.indexOf("request({ method: 'post', url: '/api/v1/conversations/direct'");
    const detailIndex = messaging.indexOf("axios.get('/api/v1/conversations/' + conversationId");
    const consumeIndex = messaging.indexOf("next.delete('artist')");
    assert.ok(startIndex >= 0 && detailIndex > startIndex && consumeIndex > detailIndex);
    assert.ok(messaging.includes("conversation.contexts?.find((context) => context.artwork?.slug === artworkSlug)?.artwork"), 'The parent resolves canonical artwork context before consuming the deep link.');
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
    assert.ok(messagingInbox.includes('<ConversationInboxSkeleton count={6} />'));
    assert.ok(messageTimeline.includes('<MessageHistorySkeleton count={5}'));
    assert.ok(skeletons.includes('aspect-[3/4]'));
    assert.ok(skeletons.includes('aspect-[3/4]'));
    assert.ok(skeletons.includes('aria-label="در حال آماده‌سازی صفحه اصلی"'));
    assert.ok(skeletons.includes('sm:min-h-64'));
});


test('artwork-origin messages persist and render a reply-style artwork reference for both participants', () => {
    assert.ok(messaging.includes('artwork_id: pendingArtwork?.id ?? null'));
    assert.ok(messageTimeline.includes('message.artwork &&'));
    assert.ok(messageTimeline.includes("to={'/artworks/' + message.artwork.slug}"));
    assert.ok(messaging.includes('setPendingArtwork(artwork)'));
    assert.ok(messageComposer.includes('پاسخ درباره این اثر'), 'The extracted composer renders the selected artwork reply context.');
    assert.ok(messageTimeline.includes('اثر مورد گفتگو'));
    assert.ok(relatedArtworkStrip.includes("aria-label={t('ارسال پیام درباره ') + localizedValue(artwork, 'title', locale)}"), 'The related-artwork strip owns the buyer artwork-selection control.');
    assert.ok(conversationApi.includes("Schema::hasColumn('messages', 'artwork_id')"));
    assert.ok(conversationApi.includes("'artwork_id' => $supportsArtworkReferences"));
    assert.ok(conversationApi.includes("$message->relationLoaded('artwork')"));
    assert.ok(conversationApi.includes("'image_url' => '/api/v1/artworks/'.$artwork->slug.'/image'"));
    assert.ok(conversationApi.includes("$artwork->artistProfile?->user_id"));
    assert.ok(messageModel.includes("'artwork_id'"));
    assert.ok(messageModel.includes('function artwork(): BelongsTo'));
});

test('Radix checkbox form bridge cannot expand a page to the full available row width', () => {
    const checkboxStart = primitives.indexOf('export function Checkbox({');
    const checkboxEnd = primitives.indexOf('\n}\n\nexport function SearchField', checkboxStart);
    const checkbox = primitives.slice(checkboxStart, checkboxEnd);
    assert.ok(checkboxStart >= 0 && checkboxEnd > checkboxStart);
    assert.ok(checkbox.includes('group inline-flex w-fit min-w-0 max-w-full min-h-11'), 'Labeled checkboxes must size to their content and remain shrinkable.');
    assert.doesNotMatch(checkbox, /group inline-flex min-h-11 items-center/);
});

test('messaging composer height is driven by its send control and compact padding', () => {
    assert.ok(messageComposer.includes('border border-border-strong bg-surface'));
    assert.doesNotMatch(messageComposer, /\brounded(?:-[a-z0-9-]+)?/);
    assert.ok(messageComposer.includes('min-h-[2.35rem] max-sm:min-h-9 w-full resize-none'));
    assert.doesNotMatch(messageComposer, /relative flex min-h-\[3\.1rem\] items-end/);
});


test('production forms and actions reuse the shared UI component contract', () => {
    assert.ok(primitives.includes('export const TextInput = forwardRef'));
    assert.ok(primitives.includes('export const TextareaField = forwardRef'));
    assert.ok(primitives.includes('export const FileInput = forwardRef'));
    assert.ok(primitives.includes("'aria-invalid': error ? true"));
    assert.ok(uiIndex.includes('TextInput, TextareaField, FileInput, SelectField, Checkbox'));

    for (const [name, source] of [
        ['artist profile', routeLoading],
        ['artwork studio', artworkStudio],
        ['authentication', authPage],
        ['admin console', adminWorkspace],
        ['editorial tools', editorialPages],
        ['messaging composer', messageComposer],
        ['messaging inbox', messagingInbox],
        ['artwork engagement', readFileSync(new URL('../../resources/js/app/ArtworkEngagement.jsx', import.meta.url), 'utf8')],
        ['public artwork gallery', artworkGallery],
        ['artwork catalogue', artworkCatalogue],
        ['artist profile page', artistProfile],
        ['artwork detail', artworkDetail],
        ['workspace layouts', layouts],
        ['shared navigation primitives', navigation],
        ['feedback components', feedback],
        ['message timeline', messageTimeline],
        ['conversation header', conversationHeader],
        ['related artwork strip', relatedArtworkStrip],
        ['messaging status banners', messagingStatusBanners],
        ['development specimen', legacyApp],
    ]) {
        assert.doesNotMatch(source, /<(?:input|textarea|select|button)\b/, `${name} should use shared controls and action primitives`);
    }

    assert.ok(routeLoading.includes('<FormField label={t("نام نمایشی")}'));
    assert.ok(artworkStudio.includes('<TextInput name="title"'));
    assert.ok(messageComposer.includes('<FileInput'));
    assert.match(messageComposer, /<Button\b(?=[^>]*\btype="submit")(?=[^>]*\bvariant="ghost")[^>]*>/);
});
