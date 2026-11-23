# Rademan UI/UX Redesign Specification

**Target baseline:** `agent/chatgpt` (existing working branch; legacy flat ref retained until an owner-approved migration)  
**Product direction:** Editorial Contemporary Art  
**Primary locale:** Persian (RTL), with English (LTR) support  
**Responsive strategy:** Mobile-first, adaptive navigation  
**Scope:** Full frontend experience; preserve backend contracts and authorization

This document turns the approved redesign direction into a branch-specific implementation contract. It distinguishes intended work from verified implementation progress.

## Implementation status

- The legacy `agent/chatgpt` ref is preserved. Because Git cannot create nested refs beneath it, the workflow's collision-safe namespace is used: persistent lane `agent-chatgpt/lane` and task branch `agent-chatgpt/rademan-redesign`.
- Stage 0 source inventory is underway. The inspected repository confirms the existing React/Laravel foundation, RTL shell, semantic tokens, responsive workspace shell and route-level lazy loading.
- First implementation slice: mobile workspace navigation now prioritizes frequent destinations. Artist and buyer navigation retain their existing primary destinations; admin mobile navigation is limited to four high-frequency destinations while all six admin destinations remain available in the desktop sidebar and mobile drawer. Regression tests were added. The three focused Node tests passed against local copies of the current navigation module and test source; the full repository lint, frontend suite, browser suite and production build remain unrun because no complete local project runtime is attached to this GitHub editing session.
- PWA audit: the inspected repository tree contains no web manifest or service-worker file, and `vite.config.js` has no PWA plugin. PWA implementation remains deferred until install icons, offline behavior and cache-safety tests can be verified together.

## 1. Product experience

Rademan should feel like a contemporary art gallery with an editorial voice and a practical creative workspace. Artwork and artist stories lead the public experience. Authenticated experiences prioritize tasks and information relevant to each role.

The product has four experience areas:

- **Discover:** home, artwork catalogue/detail, artist directory/profile, collections.
- **Buyer Studio:** overview, inquiries/messages, and only those account or saved-work features supported by the current product.
- **Artist Studio:** overview, artwork/content library, public profile settings, inquiries/messages.
- **Admin Console:** overview, artwork review, editorial curation, reports/trust, users and roles.

Shared capabilities include authentication, authorization, artwork/artist data, messaging, notifications, localization, themes, and UI primitives.

## 2. Verified baseline observations

The inspected branch contains:

- Laravel 13 with React 18, React Router 7, TanStack Query 5, Tailwind CSS, Radix UI, Lucide, and Vite.
- Lazy-loaded routes in `resources/js/app/AppRouter.jsx`.
- Shared layouts and responsive workspace presentation in `resources/js/app/Layouts.jsx`.
- Centralized role navigation in `resources/js/app/workspaceNavigation.js`.
- Semantic design tokens, Persian-first font declarations, light/dark/system themes, reduced-motion handling, and compatibility aliases in `resources/css/app.css`.
- A Persian RTL HTML document shell, theme-color handling, SEO metadata, fonts, and route-specific loading skeletons in `resources/views/app.blade.php`.
- An existing editorial-style public homepage in `resources/js/app/HomePage.jsx`.
- Existing shared primitives in `resources/js/components/ui/`.

The proposed palette is already represented in the CSS foundation: ivory `#F7F5F0`, charcoal `#242320`, terracotta `#A64F31`, sand `#D8C9B7`, and olive `#536052`. Do not replace this foundation wholesale. Audit and refine it based on rendered screens and contrast checks.

The inspected Vite configuration does not currently include a PWA plugin. The inspected Blade shell does not show a web manifest link or service-worker registration. Before implementing PWA behavior, perform a complete asset/configuration audit to avoid duplicate infrastructure.

## 3. Design principles

1. Artwork is the primary visual content; UI chrome stays quiet.
2. Editorial hierarchy comes from typography, image scale, whitespace, captions, and composition—not decorative gradients or excessive cards.
3. Public discovery and authenticated workspaces share foundations but use distinct layouts.
4. Persian RTL is the default implementation path; English LTR is a fully supported alternate.
5. Responsive behavior is intentional at every viewport. Do not simply compress desktop layouts.
6. Every feature includes loading, empty, error, success, disabled, and permission states as relevant.
7. Preserve API contracts, URLs, data semantics, authorization, and existing user workflows unless evidence justifies a deliberate change.

## 4. Visual system

### 4.1 Palette and semantic tokens

Continue using the existing `--rd-*` semantic token system. Refine semantic roles only where a measured visual or accessibility issue exists.

Key roles include:

- Canvas: warm ivory.
- Surface: white or theme-appropriate elevated surface.
- Primary text: charcoal.
- Secondary text: muted neutral.
- Border: restrained warm gray.
- Primary action: terracotta.
- Success accent: olive.

Dark mode must remain a separately tuned semantic palette. Never tint or filter artwork images to fit the theme.

### 4.2 Typography

- Persian: Vazirmatn, using available and licensed weights.
- Latin: Inter.
- Keep body copy readable with comfortable Persian line height.
- Use strong display hierarchy for editorial headlines and restrained typography for metadata.
- Isolate mixed-direction fragments such as URLs, emails, IDs, and phone numbers.
- Use tabular numerals for prices and metrics when appropriate.

### 4.3 Composition

- Public pages: generous content width, editorial image composition, deliberate whitespace.
- Workspaces: stable content width, clear page headers, predictable sections.
- Artwork grids: choose image ratios per content type; do not force every card into an identical crop.
- Controls: minimum 44px touch target where practical.
- Prefer subtle borders and surface changes over stacked shadows and heavily rounded containers.

## 5. RTL and localization contract

The current Blade shell is Persian RTL. Keep it so, but centralize locale behavior before adding English.

- Set `lang` and `dir` at the document root for the active locale.
- Keep translation strings out of reusable components.
- Use CSS logical properties instead of hardcoded left/right properties.
- Use `dir="auto"` for user-generated content of unknown direction.
- Isolate LTR fragments explicitly.
- Mirror only directional icons, not logos, artwork, or neutral symbols.
- Test menus, dialogs, focus order, breadcrumbs, tables, form validation, punctuation, dates, and mixed-script strings in both locales.
- Do not claim English support until all primary routes, system states, and forms are translated.

Suggested locale structure (adapt to the library already present or selected):

```text
resources/js/i18n/
  index.js
  locales/
    fa/
      common.json
      discover.json
      buyer.json
      artist.json
      admin.json
    en/
      common.json
      discover.json
      buyer.json
      artist.json
      admin.json
```

## 6. Responsive navigation

Use the existing `workspaceNavigation.js` as the single source for workspace destinations and role-specific navigation. Extend it with metadata only when needed (icon, group, visibility, or mobile priority); do not maintain separate hardcoded route inventories.

- **Public mobile:** compact header, prominent search entry, menu sheet, and optional bottom navigation only for high-frequency public destinations.
- **Public desktop:** horizontal navigation with a restrained editorial header.
- **Authenticated mobile:** role-specific bottom navigation for primary destinations; secondary destinations in an account/more area.
- **Authenticated desktop:** persistent collapsible sidebar or rail with a distinct workspace identity.
- **Messaging mobile:** inbox list transitions to a full-screen conversation.
- **Messaging desktop:** two-pane conversation list and active conversation.

All routes must remain deep-linkable and keyboard accessible.

## 7. Component architecture

Keep shared primitives in `resources/js/components/ui/`. Add domain components only where there is real reuse.

Recommended boundaries:

- `components/layout/`: public/workspace shells, page header, sidebar, mobile navigation.
- `components/editorial/`: hero, collection feature, editorial section header.
- `components/artwork/`: artwork card, grid, gallery, metadata, actions.
- `components/artist/`: artist card, profile header, biography, portfolio.
- `components/messaging/`: conversation list, item, panel, message bubble, composer.
- `components/forms/`: field wrapper, image upload presentation, validation summary.
- `components/feedback/`: loading, empty, error, alert, toast.
- `features/discover/`, `features/buyer/`, `features/artist/`, `features/admin/`: route-level feature modules and feature-specific hooks.

Do not move files solely to match this tree. Migrate incrementally when a change improves ownership or reuse.

### Component contracts

- **ArtworkCard:** receives artwork data and a named presentation variant; never fetches its own record or invents missing metadata.
- **ArtistCard:** supports missing portrait/biography gracefully.
- **PageHeader:** title, optional description/breadcrumbs, and action slot.
- **EmptyState:** distinct from loading and error states; optional permitted next action.
- **DataTable:** desktop table plus an intentional narrow-screen presentation.
- **ConversationPanel:** preserves message ordering, read states, attachments, participant identity, and permission boundaries.

Prefer composition and a small number of explicit variants over many boolean props.

## 8. Route-level experience requirements

### Discover

- **Home:** editorial hero, featured artwork/collection, recent works, artist spotlight, collections, participation CTA.
- **Catalogue:** search, sort, filters, active filter chips, shareable URL state, artwork grid.
- **Artwork detail:** prominent artwork image, title, artist attribution, supported metadata, inquiry action.
- **Artist directory/profile:** searchable directory and artist-led portfolio presentation.
- **Collections:** curatorial introduction and selected works.

Do not imply price, availability, dimensions, authenticity, or shipping details unless provided by the backend.

### Buyer Studio

Prioritize overview, inquiries/messages, and account preferences already supported by current routes and APIs. Do not add a saved-works feature unless its persistence and API contract exist.

### Artist Studio

Prioritize overview, content library, public profile, and inquiries. Artwork management should be image-led on mobile and may use a structured table/list on desktop where that improves editing efficiency.

### Admin Console

Prioritize overview, content review, editorial curation, reports/trust, and user/role management. Make destructive or high-impact actions explicit and confirm them. Preserve audit behavior where supported.

## 9. Messaging invariants

The messaging redesign is a presentation and responsive-layout change unless a separately justified API change is approved.

Preserve:

- conversation identity and participant authorization;
- message history and ordering;
- read/unread state;
- attachment handling and access checks;
- send/loading/failure states;
- current query invalidation and synchronization behavior;
- contextual artwork references where present.

Do not queue private messages offline unless idempotency, retry, duplicate prevention, and conflict behavior are designed and tested.

## 10. PWA requirements

First audit the full repository for existing manifests, icons, service workers, deployment headers, and Vite/Laravel integration.

If absent, add a single Vite-compatible PWA implementation with:

- manifest, app name, start URL, theme/background colors, standalone display;
- proper 192px and 512px install icons, including maskable variants;
- versioned service worker and controlled update lifecycle;
- cache-first behavior for fingerprinted static assets;
- network-first navigation with a safe offline fallback where appropriate;
- explicit offline/online status and retry affordance;
- cleanup of sensitive client state on logout.

Never cache authenticated API responses, private workspace data, messages, or private attachments by default. Public artwork caching must respect access and licensing rules. A service worker must not intercept or replay state-changing requests.

## 11. Performance, accessibility, and security

- Preserve lazy route loading.
- Lazy-load below-the-fold imagery and use eager/high-priority loading only for the true hero.
- Use responsive image sizes and explicit dimensions/aspect ratios to reduce layout shift.
- Maintain visible focus, semantic headings, labels, keyboard operation, and reduced-motion support.
- Test contrast in light and dark themes; run the existing color accessibility audit.
- Treat client-side navigation as presentation only; server authorization remains authoritative.
- Do not persist sensitive records in local storage or Cache Storage.
- Ensure logout clears sensitive client-side caches and state.

## 12. Implementation sequence

### Stage 0 — Inventory and design baseline
- Map routes to page components, layouts, API calls, shared components, and tests.
- Audit existing tokens, RTL styles, breakpoints, image behavior, and accessibility.
- Capture representative mobile and desktop baselines.
- Confirm current dependencies and PWA assets/configuration.

**Exit:** inventory and regression baseline are complete.

### Stage 1 — Shared foundations and shells
- Consolidate tokens without breaking compatibility aliases.
- Establish locale/direction infrastructure.
- Refine public and workspace shells.
- Make navigation data-driven and responsive.
- Standardize page headers and feedback states.

**Exit:** all existing routes render correctly in the correct shell at mobile and desktop sizes.

### Stage 2 — Discover
- Redesign home, catalogue, artwork detail, artist directory/profile, and collections.
- Standardize artwork/artist card variants and URL-backed catalogue filters.

**Exit:** complete discovery journey works in Persian RTL and English LTR.

### Stage 3 — Buyer and Artist Studio
- Refine overview, artwork/content management, profile, and inquiry flows.
- Verify all role-specific actions and permission boundaries.

**Exit:** existing buyer and artist workflows remain complete.

### Stage 4 — Messaging and Admin
- Implement responsive inbox/conversation behavior.
- Refine moderation, curation, reporting, and user management.

**Exit:** messaging and admin workflows pass role and viewport checks.

### Stage 5 — PWA and release quality
- Add installability and safe offline behavior.
- Verify service-worker lifecycle, cache isolation, logout, and update behavior.
- Run accessibility, performance, and regression suites.

**Exit:** installable and safe PWA with verified release checks.

## 13. Acceptance checklist

### UX and responsive
- [ ] No horizontal overflow at supported mobile widths.
- [ ] Artwork remains the visual priority.
- [ ] Public and workspace layouts are distinct.
- [ ] Mobile navigation and touch actions work without hover.
- [ ] Desktop workspace navigation is persistent and understandable.
- [ ] Loading, empty, error, success, and permission states are designed.

### RTL and localization
- [ ] Persian remains default RTL.
- [ ] English LTR works across all major routes.
- [ ] Mixed Persian/Latin content is correct.
- [ ] Icons and directional controls behave correctly.
- [ ] Keyboard and assistive-technology checks cover both directions.

### Functional and security
- [ ] Existing URLs and API contracts remain compatible.
- [ ] Server-side authorization is unchanged or strengthened.
- [ ] Buyer, artist, admin, and messaging workflows remain intact.
- [ ] Failed mutations never appear successful.
- [ ] Logout clears sensitive client-side state.

### PWA and performance
- [ ] Installability is verified on supported browsers.
- [ ] Offline fallback is usable and truthful.
- [ ] Private API responses and messages are not cached.
- [ ] Service-worker updates are controlled.
- [ ] Images do not cause avoidable layout shift.
- [ ] Lighthouse/Core Web Vitals are measured against a recorded baseline.
- [ ] Real-device Android and iOS checks are completed.

## 14. Non-goals unless new evidence requires them

- Rewriting Laravel or replacing React.
- Introducing a second UI/component framework.
- Replacing TanStack Query with another server-state solution.
- Changing database or API contracts solely for visual reasons.
- Adding speculative product features that do not exist in the current backend.
- Caching private workspace or messaging data for offline use.

## 15. Delivery discipline

- Follow `AGENTS.md` and `AI/DEVELOPMENT-WORKFLOW.md`.
- Keep task branches isolated and do not merge directly to `main`.
- Run relevant lint, accessibility, frontend, backend, and browser checks where the environment permits.
- Report exact verification performed and anything not run.
- Treat this document as the design contract; update it when implementation evidence justifies a change.
