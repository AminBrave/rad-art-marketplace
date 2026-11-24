# Rademan — complete application overhaul execution map

**Status:** Active implementation  
**Working branch:** `agent-chatgpt/rademan-redesign`  
**Pull request:** #283 (draft; do not merge without owner approval)  
**Product direction:** distinctive editorial art-market experience; Persian-first RTL with resilient LTR handling  
**Constraint:** preserve existing Laravel/API contracts, authentication, role boundaries, moderation policy, privacy rules, and user data unless a separate approved product change is required.

This document is the coverage ledger for the complete application overhaul. It is intentionally broader than a homepage redesign or component refresh. Every route, shared surface, interaction state, viewport, and accessibility concern below must be reviewed and either redesigned, verified as already meeting the target, or explicitly recorded as not applicable. A checkbox is not complete merely because a component exists; the rendered experience and behavior must be inspected.

## 1. Experience principles

1. **Artwork first:** images and the artist's intent lead the visual hierarchy. Metadata supports discovery without competing with the work.
2. **Editorial, not generic SaaS:** deliberate typography, asymmetrical composition where useful, strong rhythm, restrained surfaces, meaningful whitespace, and a recognizable Rademan identity.
3. **One product, role-aware tools:** public discovery, buyer, artist, and admin experiences share a visual grammar while retaining task-appropriate navigation and density.
4. **Persian-first, genuinely bidirectional:** RTL is the default; mixed Latin names, URLs, prices, numbers, dates, email addresses, and user-generated content must remain legible and correctly ordered.
5. **Progressive clarity:** show the next useful action, explain statuses in plain language, and never hide important state behind decoration.
6. **Trust through transparency:** distinguish public, private, pending, approved, rejected, sold, unavailable, and restricted content accurately.
7. **No dead ends:** every loading, empty, error, permission, disabled, success, retry, and destructive-confirmation state has a clear outcome.
8. **Responsive by intent:** mobile is not a squeezed desktop. Navigation, content order, controls, tables, and messaging adapt to the actual task.
9. **Accessible by default:** semantic structure, keyboard operation, visible focus, screen-reader names, sufficient contrast, reduced motion, and touch targets are part of completion.
10. **Preserve behavior:** visual work must not silently alter API payloads, routes, permissions, moderation rules, query synchronization, or mutation semantics.

## 2. Route and feature coverage ledger

### Public discovery and information

- [ ] `/` — homepage: editorial hero, featured work, discovery paths, categories, artists, curated collections, editorial selections, artist onboarding CTA, footer and all data states.
- [ ] `/artworks` — catalogue: search, category, medium, availability, sort, active-filter chips, clear-all, result count, pagination, responsive filter layout, skeleton/error/empty states.
- [ ] `/artworks/:slug` — artwork detail: image viewing, title, artist identity, category, technique, dimensions, year, price, availability, description, engagement, inquiry path, related works, not-found and permission states.
- [ ] `/artists` — directory: search, result count, artist cards, pagination, no-results/error/loading.
- [ ] `/artists/:slug` — public artist portfolio: identity, biography, location, external links, follow state, artwork filtering, infinite loading, empty portfolio, private/unavailable states.
- [ ] `/collections` — curated collection index, collection counts, empty/loading/error.
- [ ] `/collections/:slug` — collection story, artwork grid, breadcrumb, missing/empty states.
- [ ] `/about` — brand story, mission, platform model, content hierarchy.
- [ ] `/help` — help information architecture, readable answers, contact escalation.
- [ ] `/contact` — contact information and all form validation/submission states if a form exists.
- [ ] `/login` — sign-in form, password visibility if supported, validation, server errors, busy state, recovery and navigation.
- [ ] `/register` — registration, role choice, field validation, password confirmation, success/error states.
- [ ] `/unauthorized` — clear permission explanation and safe next action.
- [ ] `*` — not-found page, recovery links, no broken shell or dead end.

### Artist workspace

- [ ] `/dashboard/artist` — overview: profile readiness, real metrics, recent works, moderation status, messaging entry point, useful next action.
- [ ] `/dashboard/artist/profile` — profile editing, public/private visibility, social links, validation, save feedback, unsaved/busy/error states, preview.
- [ ] `/dashboard/artist/artworks` — artwork creation/editing, image selection/preview, validation, upload progress, retry, save, submit-for-review, edit/re-submit, pagination, moderation feedback, empty/error states.
- [ ] `/dashboard/artist/messages` — complete messaging workspace and all message/conversation states.

### Buyer workspace

- [ ] `/dashboard/buyer` — buyer orientation, discovery shortcuts, conversation activity and next steps without inventing unsupported saved/purchase features.
- [ ] `/dashboard/buyer/messages` — complete messaging workspace and all message/conversation states.

### Administration

- [ ] `/admin` — operational dashboard, real metrics, priority queues, clear shortcuts to every admin function, partial-data failures.
- [ ] `/admin/artworks` — review queue, artwork context, image inspection, status navigation, approve/reject/request-changes, notes, confirmations and feedback.
- [ ] `/admin/users` — account search/list, role display and changes, protected self-role behavior, elevation confirmation, pagination and errors.
- [ ] `/admin/editorial` — collection creation/editing, featured artist selection, validation, save states, empty/error states.
- [ ] `/admin/message-reports` — report context, involved parties, moderation decisions, safe review actions, confirmation and resolution feedback.
- [ ] `/admin/artwork-comment-reports` — comment context, artwork context, reporting reason, moderation decisions, resolution feedback.

### Global shell and cross-cutting surfaces

- [ ] Public header, desktop navigation, mobile drawer, signed-in state, signed-out state, account controls, theme control, notification control, logout and logout failure.
- [ ] Artist, buyer, and admin workspace shells: desktop sidebar, mobile bottom navigation, mobile drawer, active state, role identity, page title/context, safe-area handling.
- [ ] Footer and all global links.
- [ ] Notifications: unread/read states, loading, empty, error, mark-read, dismissal and navigation.
- [ ] Messaging: inbox/conversation split view, mobile transition/back, search/filter, active conversation, unread/read, send/edit/delete, reactions, attachments, upload failure/retry/idempotency, report/block, disabled/busy states, long content and scroll behavior.
- [ ] Theme: explicit light/dark/system modes, persistence, OS preference, all semantic colors, charts/media/overlays and focus states.
- [ ] Route fallback and skeletons: dimensions and layout must match the destination to avoid disruptive layout shift.
- [ ] All dialogs, alert dialogs, dropdowns, selects, tooltips, tabs, pagination, toasts, banners, file pickers and confirmation surfaces.

## 3. Shared design-system coverage

- [ ] Tokens: semantic colors, dark theme, typography, type scale, line lengths, spacing, responsive gutters, grid, radii, borders, elevation, focus, motion, z-index and safe areas.
- [ ] Typography: Persian text hierarchy, Latin companion type, numerals, currency, metadata, long titles, truncation and mixed-direction strings.
- [ ] Primitives: buttons, icon buttons, text inputs, textareas, file inputs, selects, checkboxes, search, labels, hints, validation and disabled/busy states.
- [ ] Composition: page containers, page/section headers, workspace heroes, surfaces, cards, metrics, tables, data lists and separators.
- [ ] Navigation: tabs, breadcrumbs, menus, pagination, active states, mobile patterns and keyboard behavior.
- [ ] Feedback: badges/status, skeletons, empty states, errors, success, permission states, upload feedback and toasts.
- [ ] Media: artwork image containment/cropping, aspect-ratio consistency, broken-image fallback, alt text, responsive loading and zoom/viewing behavior where supported.
- [ ] Component ownership: primitives own low-level controls; shared feature components own reusable patterns; routes compose experiences and do not duplicate base controls.

## 4. Interaction and state matrix

For every route and reusable component, review all applicable states:

- Initial, loading, background-refresh, partial-data, success, empty, no-results, validation-error, server-error, offline/retry, forbidden, not-found, disabled, submitting, uploading, destructive-confirmation, optimistic-update, stale-data, and recovery.
- Hover, focus-visible, pressed, selected, expanded, collapsed, active, current, visited, and touch behavior.
- Long Persian/English strings, missing optional fields, unusually large images, very narrow screens, zoomed layouts, and large text.
- Form behavior: labels, required markers, inline errors, field-level help, server validation mapping, submit disabling, duplicate-submit protection, preserved values after failure, and clear success feedback.
- Navigation behavior: browser back/forward, query-string persistence, deep links, route changes, focus/scroll restoration, and unauthorized destinations.

## 5. Responsive and accessibility verification

- [ ] Widths: 320, 360, 390, 430, 768, 1024, 1280, 1440, and wide desktop.
- [ ] RTL and LTR, including mixed-direction text in the same component.
- [ ] Keyboard-only pass: logical order, no traps, skip link, visible focus, Escape behavior, dialog focus return, menu/select operation.
- [ ] Screen-reader pass: landmarks, heading order, labels, descriptions, errors, status announcements, icon names, image alternatives, and live regions.
- [ ] Contrast pass for text, controls, borders, focus, status colors, placeholders, disabled states, and both themes.
- [ ] Touch target pass, safe-area insets, sticky/fixed elements, virtual keyboard and mobile scrolling.
- [ ] Reduced-motion pass and no meaning conveyed by color alone.

## 6. Engineering constraints and regression protection

- Keep existing API endpoints, payloads, authorization checks, public visibility boundaries, moderation status semantics, and mutation behavior unless an independently approved change is made.
- Do not add fabricated data, fake counters, fake reviews, fake availability, or unsupported buyer features.
- Keep route-level code splitting and avoid increasing the initial bundle without a reason.
- Preserve query keys, cache invalidation, URL-backed filters, pagination, deep links, and messaging idempotency.
- Keep forms semantically correct; shared buttons default to `type="button"`, so submit actions must explicitly set `type="submit"`.
- Do not introduce nested interactive elements, duplicate IDs/ARIA attributes, or clickable non-semantic containers.
- Add or update regression tests for every changed interaction contract. Source-level assertions supplement, but do not replace, browser tests.
- Keep all work on the task branch and PR #283 draft. Do not merge or promote to `main`.

## 7. Delivery gates

A route is considered redesigned only after its visual hierarchy, interaction states, responsive behavior, accessibility, and existing business behavior have been reviewed. A shared component change is not complete until all consumers are checked for layout regressions.

Before the overhaul can be called complete, run and report the current repository's relevant checks, including lint, production build, frontend/design-system tests, backend/feature/integration tests where affected, RTL responsive browser tests, messaging attachment/retry/idempotency tests, and keyboard/accessibility/color checks. Record exact commands and results. Any unexecuted browser, assistive-technology, or manual visual review remains explicitly open.

## 8. Implementation sequence

1. Shared visual foundation and shell.
2. Public discovery: homepage, catalogue, artwork detail, artist directory/profile, collections, information pages, authentication.
3. Artist workspace: overview, profile editor, artwork studio.
4. Buyer workspace and messaging.
5. Admin dashboard and every moderation/editorial workflow.
6. Every component state, responsive breakpoint, theme, RTL/LTR and accessibility pass.
7. Regression suite, visual QA, documentation and PR handoff.

Work proceeds in vertical slices, but the coverage ledger remains the source of truth until every applicable item is verified.

## 9. Current implementation log

### Slice A — shared editorial foundation (implemented; fresh verification pending)

- Updated shared artwork and artist card treatments in `resources/js/components/ui/cards.jsx`.
- Refined shared button, page-header, section-header, workspace-hero, metric-card and surface treatments in `resources/js/components/ui/primitives.jsx`.
- Updated centered dialog and alert-dialog framing in `resources/js/components/ui/Dialog.jsx` and `AlertDialog.jsx`.
- Refreshed public header/footer identity in `resources/js/app/Layouts.jsx`.
- Elevated homepage hero, featured artwork framing and category rhythm in `resources/js/app/HomePage.jsx`.
- Refined catalogue filter composition in `resources/js/app/ArtworkCatalogue.jsx` and artist directory introduction in `resources/js/app/ArtistDirectoryPage.jsx`.
- Refined collection index hierarchy in `resources/js/app/EditorialPages.jsx`.
- Improved buyer onboarding and artist workspace identity/content hierarchy in `BuyerWorkspace.jsx` and `ArtistWorkspaceOverview.jsx`.
- Refined artwork detail framing and messaging composer surfaces in `ArtworkDetailPage.jsx` and `MessageComposer.jsx`.
- Aligned route fallbacks and reusable loading skeletons with the updated visual grammar in `RoutingPages.jsx` and `components/ui/skeletons.jsx`.
- Documented the editorial visual language in `AI/DESIGN-SYSTEM.md`.

**Verification state:** the user confirmed the previous local test suite passed before this slice. No fresh lint, build, automated test, browser, keyboard, screen-reader, or visual-regression run has been observed after these edits. This slice is therefore implemented but not yet verified.

### Still open

All unchecked route, state, breakpoint, accessibility and regression items in sections 2–7 remain open until individually reviewed. In particular, do not infer that a shared-component update alone completes every consumer route. Continue with route-specific review of authentication and public information pages, artist profile editing and artwork studio, every admin workflow, messaging inbox/history/safety/attachment states, notification preferences, and all responsive/theme combinations.

### Slice B — role workspaces, authoring, overlays and loading consistency (implemented; fresh verification pending)

- Refreshed the role-aware workspace shell, desktop navigation rail and mobile navigation treatment in `resources/js/app/Layouts.jsx`.
- Restyled sign-in/registration and the artist profile editor without changing authentication or profile mutation behavior in `AuthPage.jsx` and `RoutingPages.jsx`.
- Refined artist artwork editor and portfolio image frames in `ArtworkStudio.jsx`; image validation, upload progress, edit/re-submit flow and API mutations remain intact.
- Aligned message composer framing with the updated design system in `MessageComposer.jsx`.
- Updated shared dialog and confirmation dialog framing in `Dialog.jsx` and `AlertDialog.jsx`.
- Updated route-specific and reusable loading skeletons in `RoutingPages.jsx` and `skeletons.jsx` to better match the revised page geometry.

**Verification state:** no GitHub Actions PR workflow runs are associated with the latest commit. These changes still require a fresh local lint/build/test/browser pass and manual visual inspection in both themes and at the required viewport widths.

### Slice C — administration, public information and recovery states (implemented; fresh verification pending)

- Updated the admin dashboard's artwork preview to preserve the complete artwork image and refined report metrics into the editorial surface system in `AdminWorkspace.jsx`.
- Refined public About/Help/Contact reading hierarchy in `PublicInfoPages.jsx`.
- Restyled unauthorized and not-found recovery pages in `RoutingPages.jsx`.
- Kept moderation decisions, role-change confirmation, report review, destructive confirmations and all server-side permission checks unchanged.

**Verification state:** these additions are also unverified by a fresh local run. No route is marked complete in the ledger solely because this visual pass has been applied.
