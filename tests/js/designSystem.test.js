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
const tooltip = readFileSync(new URL('../../resources/js/components/ui/Tooltip.jsx', import.meta.url), 'utf8');
const alertDialog = readFileSync(new URL('../../resources/js/components/ui/AlertDialog.jsx', import.meta.url), 'utf8');
const skeletons = readFileSync(new URL('../../resources/js/components/ui/skeletons.jsx', import.meta.url), 'utf8');
const showcase = readFileSync(new URL('../../resources/js/app/ComponentShowcase.jsx', import.meta.url), 'utf8');
const publicPages = ['ArtworkCatalogue.jsx', 'ArtistDirectoryPage.jsx', 'ArtworkDetailPage.jsx'].map((file) => readFileSync(new URL('../../resources/js/app/' + file, import.meta.url), 'utf8'));
const layouts = readFileSync(new URL('../../resources/js/app/Layouts.jsx', import.meta.url), 'utf8');
const appRouter = readFileSync(new URL('../../resources/js/app/AppRouter.jsx', import.meta.url), 'utf8');
const buyerWorkspace = readFileSync(new URL('../../resources/js/app/BuyerWorkspace.jsx', import.meta.url), 'utf8');
const routeLoading = readFileSync(new URL('../../resources/js/app/RoutingPages.jsx', import.meta.url), 'utf8');
const queryClient = readFileSync(new URL('../../resources/js/lib/queryClient.js', import.meta.url), 'utf8');
const artistWorkspace = readFileSync(new URL('../../resources/js/app/ArtistWorkspaceOverview.jsx', import.meta.url), 'utf8');
const messaging = readFileSync(new URL('../../resources/js/app/MessagingCenter.jsx', import.meta.url), 'utf8');
const messagingInbox = readFileSync(new URL('../../resources/js/app/MessagingInboxPanel.jsx', import.meta.url), 'utf8');
const messagingSurface = messaging + '\n' + messagingInbox;
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
const designSystem = readFileSync(new URL('../../AI/DESIGN-SYSTEM.md', import.meta.url), 'utf8');

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
    assert.ok(primitives.includes('bg-accent-surface px-3 py-1.5'));
    assert.ok(primitives.includes('before:bg-terracotta'));
    assert.ok(primitives.includes('before:bg-sand'));
    assert.ok(primitives.includes('text-[clamp(1.75rem,3.2vw,2.6rem)]'));
    assert.ok(primitives.includes('max-sm:w-full max-sm:pb-0'));
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

test('artist profile content cannot expand the viewport horizontally', () => {
    assert.ok(artistProfile.includes('w-full min-w-0 max-w-7xl overflow-x-clip'));
    assert.ok(artistProfile.includes('titleClassName="break-words [overflow-wrap:anywhere]"'));
    assert.ok(artistProfile.includes('descriptionClassName="break-words [overflow-wrap:anywhere]"'));
    assert.ok(artistProfile.includes('whitespace-pre-line break-words [overflow-wrap:anywhere]'));
    assert.ok(artistProfile.includes('max-w-full whitespace-normal break-words text-center'));
    assert.ok(artistProfile.includes('grid min-w-0 max-w-full grid-cols-1'));
    assert.ok(artistProfile.includes('className="min-w-0 [overflow-wrap:anywhere]"'));
});

test('public catalogue, artist directory and artwork detail use shared page layout primitives', () => {
    assert.ok(publicPages[0].includes('PageContainer') && publicPages[0].includes('PageHeader'));
    assert.ok(publicPages[1].includes('PageContainer') && publicPages[1].includes('SectionHeader'));
    assert.ok(publicPages[2].includes('PageContainer'));
    assert.ok(buyerWorkspace.includes('WorkspaceHero') && buyerWorkspace.includes('<Surface'));
    assert.ok(designSystem.includes('Dashboard page and section headings'));
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

test('form controls and helper hints use shared RAD-styled Radix primitives', () => {
    assert.ok(primitives.includes('forwardRef(function Button'));
    assert.ok(primitives.includes('SelectPrimitive.Root'));
    assert.ok(primitives.includes('CheckboxPrimitive.Root'));
    assert.ok(primitives.includes("type: 'checkbox'"));
    assert.ok(primitives.includes('data-[state=checked]:bg-terracotta'));
    assert.ok(tooltip.includes('TooltipPrimitive.Root'));
    assert.ok(alertDialog.includes('AlertDialogPrimitive.Root'));
    assert.ok(feedback.includes('ToastPrimitive.Provider'));
    assert.ok(feedback.includes('ToastPrimitive.Viewport'));
    assert.ok(designSystem.includes('RAD Toast backed by Radix Toast'));
    assert.ok(editorialPages.includes('<AlertDialogAction asChild>'));
    assert.ok(editorialPages.includes('event.preventDefault(); publish(collection, false)'));
    assert.ok(editorialPages.includes('<AlertDialogTitle>'));
    assert.ok(messaging.includes("DropdownMenu } from '../components/ui'"));
    assert.doesNotMatch(messaging, /@radix-ui/);
    assert.ok(messagingInbox.includes('<Tooltip content="گزینه‌های گفتگو">'));
    assert.ok(messaging.includes('<Tooltip content="افزودن واکنش">'));
    assert.ok(artworkStudio.includes('<SelectField'));
    assert.ok(editorialPages.includes('<Checkbox'));
    assert.ok(layouts.includes('<Checkbox'));
});

test('public and workspace navigation plus notifications use the shared RAD Radix Dialog drawer', () => {
    assert.ok(layouts.includes('<Dialog open={open} onOpenChange={setOpen}>'));
    assert.ok(layouts.includes('<Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>'));
    assert.ok(layouts.includes('<DialogTrigger asChild>'));
    assert.ok(layouts.includes('<DialogContent'));
    assert.ok(layouts.includes('<DialogTitle id="workspace-notification-title"'));
    assert.ok(layouts.includes('<DialogClose asChild>'));
    assert.ok(layouts.includes('workspace-notification-panel'));
    assert.ok(layouts.includes('placement="drawer"'));
    assert.ok(layouts.includes('حساب کاربری'));
    assert.ok(layouts.includes('ناوبری اصلی'));
    assert.doesNotMatch(layouts, /panelPosition|closeOnOutsidePointer|mobileMenuPanelRef|closeMobileMenu/);
    assert.ok(layouts.includes('aria-haspopup="dialog"'));
    assert.ok(dialog.includes('bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]'));
    assert.doesNotMatch(layouts, /document\.body\.style\.overflow|addEventListener\('keydown', closeOnEscape/);
    assert.ok(layouts.includes('lg:hidden'));
    assert.ok(layouts.includes('hidden min-w-0 rounded-xl border border-border bg-paper'));
    assert.ok(adminWorkspace.includes('<PageHeader'));
    assert.ok(artistWorkspace.includes('<WorkspaceHero'));
    assert.ok(buyerWorkspace.includes('<WorkspaceHero'));
    assert.ok(artistWorkspace.includes('<SectionHeader'));
    assert.ok(buyerWorkspace.includes('<SectionHeader'));
    assert.ok(adminWorkspace.includes('<SectionHeader'));
    assert.ok(artworkStudio.includes('<SectionHeader'));
    assert.ok(editorialPages.includes('<SectionHeader'));
    assert.ok(routeLoading.includes('<WorkspaceHero'));
    assert.ok(routeLoading.includes('<PageHeader'));
    assert.doesNotMatch(messaging, /<PageHeader/);
    assert.ok(messaging.includes('after:bg-terracotta'));
    const heroStart = primitives.indexOf('export function WorkspaceHero');
    const heroEnd = primitives.indexOf('\n}', heroStart);
    assert.ok(heroStart >= 0 && heroEnd > heroStart);
    const hero = primitives.slice(heroStart, heroEnd);
    assert.ok(hero.includes('rounded-xl border border-ink bg-ink'));
    assert.ok(hero.includes('inset-y-0 right-0 w-1.5 bg-terracotta'));
    assert.ok(hero.includes('text-inverse'));
    assert.ok(hero.includes('text-sand'));
    assert.ok(!artworkStudio.includes('className="border-0 pb-0 pt-0"'));
});;

test('messaging conversation filters use the shared RAD-styled Radix Tabs primitive', () => {
    assert.ok(messagingInbox.includes('<Tabs value={threadFilter} onValueChange={setThreadFilter} dir="rtl"'));
    assert.ok(messagingInbox.split('inline-flex flex-row min-w-0 w-full items-center justify-center gap-1.5').length - 1 === 3, 'All inbox filter icons and labels use the same centered RTL row alignment.');
    assert.ok(messagingInbox.includes('<TabsContent value={threadFilter} dir="rtl"'));
    assert.ok(messagingInbox.includes('<ul dir="rtl" className="min-h-0 flex-1 divide-y'));
    assert.ok(messagingInbox.includes('<TabsList aria-label="فیلتر گفتگوها"'));
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
    assert.ok(layouts.includes('h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('lg:h-[calc(100dvh-5rem)]'));
    assert.ok(layouts.includes('lg:grid-cols-[15rem_minmax(0,1fr)]'));
    assert.doesNotMatch(layouts, /direction:ltr|<aside dir="rtl"|<main dir="rtl"/);
    
    
    assert.ok(layouts.includes("isMessagingRoute ? 'flex min-h-0 min-w-0 flex-col overflow-hidden lg:col-start-2' : 'min-w-0'"));
    assert.doesNotMatch(messaging, /RAD \/ MESSAGES|ارتباط مستقیم|PageHeader/);
    assert.doesNotMatch(layouts, /ناوبری فضای کاری|RAD \/ MENU/);
    assert.ok(messaging.includes('min-w-0 w-fit max-w-[88%]'));
    assert.ok(messagingInbox.includes('min-h-[4.25rem] w-full items-center gap-2'));
    assert.ok(messagingInbox.includes('absolute end-1 top-1/2 -translate-y-1/2'));
    assert.ok(messaging.includes('mt-[.55rem] flex flex-wrap items-center justify-between gap-2 text-[10px] text-subtle'));
    assert.ok(messaging.includes('max-h-28 min-h-[2.35rem] max-sm:min-h-9 w-full resize-none'));
    assert.ok(messaging.includes('absolute start-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9'));
    assert.ok(messaging.includes('ps-10 pe-3 py-[.4rem]'));
    assert.doesNotMatch(messaging, /md:min-h-\[min\(580px/);
    assert.doesNotMatch(messaging, /min-h-\[5\.35rem\]/);
});

test('messaging is viewport-locked between the authenticated app header and bottom navigation on mobile', () => {
    assert.ok(messagingInbox.includes('text-sm font-extrabold leading-6 text-ink">پیام‌ها</h2>'), 'Keep the inbox heading compact inside its panel.');
    assert.ok(messagingInbox.includes('text-[10px] leading-4 text-muted">یک بستر امن برای ارتباط خریدار با هنرمند.</p>'));
    assert.ok(messaging.includes("own ? 'rounded-es-[.35rem]"));
    assert.ok(messaging.includes(": 'rounded-ee-[.35rem]"));
    assert.ok(messaging.includes('flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden'));
    assert.ok(messaging.includes('grid h-full min-h-0 w-full min-w-0 flex-1'));
    assert.ok(messagingInbox.includes('divide-y divide-border overflow-y-auto'), 'The inbox list scrolls inside its fixed panel.');
    const inboxList = messagingInbox.match(/<ul dir="rtl" className="([^"]+)"/);
    assert.ok(inboxList, 'The conversation inbox list is present.');
    assert.doesNotMatch(inboxList[1], /scrollbar-gutter/ , 'The inbox list must not reserve a gutter that leaves a blank strip beside its content.');
    assert.ok(messaging.includes('overflow-y-auto overscroll-contain'), 'Message history scrolls inside its fixed panel.');
    assert.ok(layouts.includes('flex h-dvh flex-col overflow-hidden'), 'Messaging locks the authenticated shell to the dynamic viewport.');
    assert.ok(layouts.includes('h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))]'));
    assert.ok(layouts.includes('lg:h-[calc(100dvh-5rem)]'));
    assert.ok(layouts.includes("lg:fixed lg:top-28"));
    assert.ok(layouts.includes("lg:right-[max(calc((100vw_-_var(--content-width))_/_2_+_var(--page-gutter)),var(--page-gutter))]"));
    assert.ok(layouts.includes("lg:max-h-[calc(100dvh_-_8rem)] lg:w-60 lg:overflow-y-auto"));
    assert.ok(layouts.includes('{isMessagingRoute && <div className="hidden lg:block" aria-hidden="true" />}'));
    assert.ok(layouts.includes("overflow-hidden lg:col-start-2"));
    assert.ok(layouts.includes("isMessagingRoute ? 'flex min-h-0 min-w-0 flex-col overflow-hidden lg:col-start-2' : 'min-w-0'"));
});

test('messaging chat geometry follows RTL logical flow and uses Radix collision-aware overlays', () => {
    assert.ok(messaging.includes('<div dir="rtl" ref={messagesContainerRef}'));
    assert.ok(messaging.includes("DropdownMenu } from '../components/ui'"));
    assert.doesNotMatch(messaging, /@radix-ui/);
    assert.ok(messagingSurface.split('<DropdownMenu.Root').length - 1 >= 4, 'All messaging overlays use Radix.');
    assert.ok(messaging.includes('<DropdownMenu.Portal>'));
    assert.ok(messaging.includes('sideOffset={8} collisionPadding={8}'));
    assert.ok(messaging.includes('var(--radix-dropdown-menu-content-available-height)'));
    assert.ok(messaging.includes('flex-nowrap items-center gap-1 overflow-x-auto'));
    assert.ok(messaging.includes('min-w-0 flex-wrap items-center justify-end gap-1.5'));
    assert.ok(messaging.includes('overflow-x-hidden overflow-y-auto'));
    assert.ok(messagingInbox.includes('absolute end-1 top-1/2 -translate-y-1/2'));
    assert.ok(messaging.includes('absolute start-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9'));
    assert.ok(messaging.includes('ps-10 pe-3 py-[.4rem]'));
    assert.doesNotMatch(messaging, /getChatPopoverPosition|toggleChatPopover|createPortal|data-chat-popover-boundary/);
});

test('messaging actions use Radix menu semantics and preserve reply focus', () => {
    assert.ok(messaging.includes("const [openPopover, setOpenPopover] = useState(null)"));
    assert.ok(messaging.includes('const setPopoverOpen = (id, open) => setOpenPopover'));
    assert.ok(messaging.includes('onCloseAutoFocus={(event) => {'));
    assert.ok(messaging.includes('focusComposerAfterMenuCloseRef.current = true'));
    assert.ok(messaging.includes('draftRef.current?.focus()'));
    assert.ok(messaging.includes('<DropdownMenu.Trigger asChild>'));
    assert.ok(messagingInbox.includes("updateThreadSetting(thread, 'archived'"));
    assert.ok(messagingInbox.includes("updateThreadSetting(thread, 'muted'"));
    assert.ok(messaging.includes('data-[highlighted]:bg-surface-muted'));
    assert.ok(messaging.includes('aria-label="افزودن واکنش"'));
    assert.ok(messaging.includes('aria-label="عملیات پیام"'));
    assert.ok(!messaging.includes("document.addEventListener('pointerdown'"));
    assert.ok(!messaging.includes("document.addEventListener('keydown'"));
    assert.ok(!messaging.includes("window.addEventListener('scroll', reposition"));
});

test('shared RAD modal dialogs retain outside-click and Escape dismissal behavior', () => {
    assert.ok(dialog.includes('DialogPrimitive.Root'));
    assert.ok(dialog.includes('<DialogPrimitive.Overlay'));
    assert.ok(dialog.includes('<DialogPrimitive.Content'));
    assert.doesNotMatch(dialog, /onPointerDownOutside=\{[^}]*preventDefault/);
    assert.doesNotMatch(dialog, /onEscapeKeyDown=\{[^}]*preventDefault/);
});

test('authenticated app shell keeps primary-only bottom navigation and places both navigation tiers in the dashboard hamburger drawer', () => {
    const bottomStart = layouts.indexOf('function AuthenticatedBottomNavigation({ primaryLinks })');
    const bottomEnd = layouts.indexOf('\n}\n\nexport function WorkspaceLayout', bottomStart);
    const bottomNavigation = layouts.slice(bottomStart, bottomEnd);
    const workspaceStart = layouts.indexOf('export function WorkspaceLayout');
    const workspaceLayout = layouts.slice(workspaceStart);
    const drawerStart = workspaceLayout.indexOf('<DialogContent');
    const drawerEnd = workspaceLayout.indexOf('</DialogContent>', drawerStart);
    const drawer = workspaceLayout.slice(drawerStart, drawerEnd);

    assert.ok(bottomStart >= 0 && bottomEnd > bottomStart);
    assert.ok(bottomNavigation.includes('data-testid="authenticated-bottom-navigation"'));
    assert.ok(bottomNavigation.includes('fixed inset-x-0 bottom-0 z-50'));
    assert.ok(bottomNavigation.includes('pb-[env(safe-area-inset-bottom)]'));
    assert.ok(bottomNavigation.includes('lg:hidden'));
    assert.ok(bottomNavigation.includes('aria-label="بخش‌های اصلی حساب کاربری"'));
    assert.ok(bottomNavigation.includes('data-nav-priority="primary"'));
    assert.doesNotMatch(bottomNavigation, /secondary|پیوندهای تکمیلی|publicSecondaryLinks/);
    assert.ok(layouts.includes('user && <AuthenticatedBottomNavigation primaryLinks={getWorkspacePrimaryLinks(user.role)} />'));
    assert.ok(workspaceLayout.includes('<AuthenticatedBottomNavigation primaryLinks={links} />'));

    assert.doesNotMatch(workspaceLayout.slice(0, workspaceLayout.indexOf('{logoutError &&')), /ناوبری اصلی فضای کاربری|ناوبری تکمیلی سایت|data-nav-priority="secondary"/);
    assert.ok(workspaceLayout.includes('<DialogTrigger asChild>'));
    assert.ok(workspaceLayout.includes('aria-label="باز کردن منوی حساب کاربری"'));
    assert.ok(workspaceLayout.includes('<DialogContent'));
    assert.ok(workspaceLayout.includes('placement="drawer"'));
    assert.ok(dialog.includes('DialogPrimitive.Overlay'));
    assert.ok(drawer.includes('aria-label="بخش‌های اصلی فضای کاربری"'));
    assert.ok(drawer.includes('aria-label="پیوندهای تکمیلی سایت"'));
    assert.ok(drawer.includes('publicSecondaryLinks.map((item)'));
    assert.ok(drawer.includes('links.map((item)'));
    assert.ok(drawer.indexOf('بخش‌های اصلی فضای کاربری') < drawer.indexOf('پیوندهای تکمیلی سایت'));
    assert.ok(workspaceLayout.includes('aria-label="ناوبری فضای کاربری"'), 'Desktop workspace sidebar remains available.');
    assert.ok(workspaceLayout.includes('const Icon = workspaceNavigationIcons[item.to] ?? LayoutDashboard;'), 'Desktop sidebar uses the same route-aware icon map as mobile.');
    assert.ok(workspaceLayout.includes('<Icon size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />'), 'Desktop sidebar renders decorative Lucide icons beside labels.');
    assert.ok(layouts.includes('aria-label="ناوبری اصلی"'), 'Existing public header navigation must remain available.');

    const publicRoutesStart = appRouter.indexOf('<Route element={<PublicLayout />}>' );
    const publicRoutesEnd = appRouter.indexOf('</Route>', publicRoutesStart);
    assert.ok(publicRoutesStart >= 0 && publicRoutesEnd > publicRoutesStart);
    assert.ok(appRouter.slice(publicRoutesStart, publicRoutesEnd).includes('<Route path="*" element={<NotFoundPage />} />'), 'Public fallback routes must retain the authenticated shell.');

    assert.ok(layouts.includes('pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)]'));
    assert.ok(layouts.includes('user ? "min-h-screen bg-canvas text-ink pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] lg:pb-0" : "min-h-screen bg-canvas text-ink"'));
    assert.ok(layouts.includes("'/dashboard/artist/artworks': Images"));
    assert.ok(layouts.includes("'/dashboard/buyer/messages': MessageCircle"));
    assert.ok(layouts.includes("'/admin/message-reports': Flag"));
    assert.ok(layouts.includes("to: '/contact', label: 'تماس'"));
    assert.ok(routeLoading.includes("getWorkspacePrimaryLinks('artist')"));
    assert.ok(routeLoading.includes("getWorkspacePrimaryLinks('buyer')"));
    assert.ok(routeLoading.includes("getWorkspacePrimaryLinks('admin')"));
    assert.ok(css.includes('--workspace-bottom-nav-primary-height: 4.5rem;'));
    assert.ok(css.includes('--workspace-bottom-nav-height: var(--workspace-bottom-nav-primary-height);'));
    assert.doesNotMatch(css, /--workspace-bottom-nav-secondary-height/);
});
test('RAD design-system definition makes the authenticated app-shell and navigation hierarchy canonical', () => {
    for (const principle of [
        'coherent, responsive web app',
        'Every route rendered while a user is authenticated',
        'Keep the compact dashboard header',
        'public-layout routes and authenticated workspace routes',
        'Put both navigation tiers inside the dashboard hamburger drawer',
        'Secondary site navigation',
        'primary workspace destinations only',
        'safe-area inset',
        'Never invent a route',
    ]) assert.ok(designSystem.includes(principle), 'Missing RAD design-system principle: ' + principle);
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
    assert.ok(messagingInbox.includes('<ConversationInboxSkeleton count={6} />'));
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

test('Radix checkbox form bridge cannot expand a page to the full available row width', () => {
    const checkboxStart = primitives.indexOf('export function Checkbox({');
    const checkboxEnd = primitives.indexOf('\n}\n\nexport function SearchField', checkboxStart);
    const checkbox = primitives.slice(checkboxStart, checkboxEnd);
    assert.ok(checkboxStart >= 0 && checkboxEnd > checkboxStart);
    assert.ok(checkbox.includes('group inline-flex w-fit min-w-0 max-w-full min-h-11'), 'Labeled checkboxes must size to their content and remain shrinkable.');
    assert.doesNotMatch(checkbox, /group inline-flex min-h-11 items-center/);
});

test('messaging composer height is driven by its send control and compact padding', () => {
    assert.ok(messaging.includes('relative flex min-w-0 items-center gap-1.5 rounded-[1rem]'));
    assert.ok(messaging.includes('min-h-[2.35rem] max-sm:min-h-9 w-full resize-none'));
    assert.doesNotMatch(messaging, /relative flex min-h-\[3\.1rem\] items-end/);
});
