# Rademan — experience and design direction

> This is the target design brief, not a specification to preserve the legacy RAD component system. Confirm implementation facts in the latest `main` branch.

## Design objective
Build a coherent, contemporary visual-content platform for discovering artists and artworks and continuing into direct buyer–artist conversations. Use an art-editorial language for public discovery and a focused professional workspace language for authenticated tasks.

Retain only Rademan's five brand color anchors: Ivory `#F7F5F0`, Charcoal `#242320`, Terracotta `#A64F31`, Sand `#D8C9B7`, Olive `#536052`. Everything else—tokens, typography, spacing, grid, component architecture, navigation, interaction patterns and responsive rules—is open for redesign.

## Product information architecture
### Discover — public
- Home / editorial entry
- Artworks catalogue and artwork detail
- Artists directory and artist profile
- Editorial collections and collection detail
- About, Help, Contact
- Contextual “Start inquiry” entry points that open the existing buyer–artist conversation flow

### Buyer Studio
- Overview
- Inquiries (existing messaging)
- Account/preferences only where the current implementation supports them
- Discover remains a shared public destination, not a duplicated buyer catalogue

### Artist Studio
- Overview
- Content library (existing artwork management)
- Public profile management
- Inquiries (existing messaging)

### Admin Console
- Overview
- Artwork review/moderation
- Editorial collections and featured-artist curation
- Message reports / trust and safety
- User and role governance

Do not add Saved, checkout, orders, analytics, artist-owned collection management, social engagement, Instagram integration or other unverified destinations.

## Navigation principles
- Keep public discovery navigation distinct from role-specific workspace navigation.
- Give Buyer and Artist a single canonical Inquiries destination backed by existing messaging routes and state.
- Overview previews may deep-link into that canonical conversation; do not create a second inbox.
- On mobile, prioritize the active task and a clear list ↔ conversation back path. Keep the composer keyboard-safe and message history independently scrollable.
- On desktop, messaging should use an efficient conversation list + active conversation layout.
- Use role-aware navigation without treating client-side guards as authorization; backend controls remain authoritative.
- Navigation labels and exact placement are proposals until reconciled with current source and owner-approved IA.

## Visual and interaction system to create
1. Semantic design tokens for surfaces, text, borders, focus, status, overlays and elevation.
2. Typography scale validated for Persian-first RTL and mixed Persian/Latin content. Select fonts based on glyph coverage, readability and loading performance; do not assume a font choice before testing.
3. Responsive layout primitives and artwork-focused grids with intentional image ratios.
4. Accessible controls, form states, dialogs, menus, notifications, empty/loading/error states and feedback.
5. Motion used sparingly, with reduced-motion support.
6. Light, dark and system theme behavior across every surface, including messaging, media, forms, dialogs and statuses.

## Theme and accessibility
- Complete light and dark themes are required target behavior; system preference and explicit light/dark/system selection should be supported where compatible with the existing account/preferences architecture.
- Meet WCAG 2.2 AA contrast and keyboard/focus expectations.
- Never rely on color alone for status or actions.
- Validate RTL, focus order, touch targets, zoom/reflow, reduced motion, screen-reader names and validation feedback.

## Mobile-first PWA
Design for phone viewport and touch first, then tablet and desktop. Verify install metadata, manifest/icons, service-worker lifecycle, standalone display, safe-area and viewport behavior before claiming PWA readiness. Private conversations and workspace data must not be placed in unsafe shared caches. Offline messaging/background sync are not implied.

## Messaging preservation contract
The current messaging subsystem is a core product capability. Redesign its shell and ergonomics without silently changing contracts or behavior:
- Preserve conversation identity, list/detail/history, pagination/sync and current polling semantics.
- Preserve message composer, send/retry, replies, editing/deletion, attachments, artwork references and reactions where confirmed in source.
- Preserve read state, archive/mute, report/block and safety behavior where confirmed.
- Preserve user-scoped cache isolation and conversation state restoration where confirmed.
- Preserve artwork/artist origin context and buyer-only direct-conversation creation constraints where enforced.
- Preserve server-side participant authorization and role boundaries.
- Trace current implementation before modifying any of these.

## Implementation source map
- Router: `resources/js/app/AppRouter.jsx`
- Role navigation: `resources/js/app/workspaceNavigation.js`
- Layouts: `resources/js/app/Layouts.jsx`, `resources/js/app/RoutingPages.jsx`
- Messaging shell: `resources/js/app/MessagingCenter.jsx`, `MessagingInboxPanel.jsx`, `ConversationHeader.jsx`, `MessageTimeline.jsx`, `MessageComposer.jsx`, `RelatedArtworkStrip.jsx`, `MessagingStatusBanners.jsx`
- Messaging data/cache: `useMessagingQueries.js`, `messagingQueryUtils.js`
- Styling: `resources/css/app.css`
These are starting points; follow callers and backend request paths before implementation.

## Decision rule
This document describes target experience principles. The latest `main` branch establishes what exists. Product-owner direction establishes what should change. If an old component catalogue, legacy design guide or skill conflicts with this refactor, update that guidance rather than preserving the old design system.
