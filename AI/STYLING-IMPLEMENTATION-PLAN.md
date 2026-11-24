# Rademan styling and design-system implementation plan

**Target branch:** `agent-chatgpt/rademan-redesign`  
**Status:** In progress  
**Scope:** Global styles, Tailwind theme, shared UI, all public/workspace routes, documentation and regression coverage.

## Architecture contract

1. CSS custom properties in `resources/css/app.css` are the canonical design-token source.
2. Tailwind maps utilities to those semantic tokens; it does not introduce a competing palette or scale.
3. Shared React components own reusable visual and interaction patterns.
4. Route-level `<main>` elements remain full-width canvases.
5. Each section owns its background and uses the shared `Container` for its content measure:
   - `wide`: standard content width and page gutters.
   - `reading`: long-form measure and page gutters.
   - `full`: edge-to-edge content.
6. Route files compose sections; they do not reimplement common controls or invent competing page-width systems.
7. Messaging, media viewing and editing may retain explicitly scoped immersive layouts.
8. Preserve route behavior, data contracts, authorization, form semantics, RTL and accessibility.

## File-by-file sequence

### Phase 1 — foundation and ownership
- [x] `resources/js/components/ui/layout.jsx`: canonical Container implementation.
- [x] `resources/js/components/ui/primitives.jsx`: retain PageContainer as a compatibility alias; begin shared button-radius normalization.
- [ ] `resources/css/app.css`: keep semantic tokens authoritative; document full-width main-frame behavior; audit aliases, theme parity and global selectors.
- [ ] `tailwind.config.js`: map utilities directly to canonical tokens; define semantic content widths and control radius.
- [ ] `resources/js/components/ui/index.js`: expose the canonical Container and compatibility alias without duplicate implementations.
- [ ] `AI/DESIGN-SYSTEM.md` and `AI/DESIGN-SYSTEM-CATALOGUE.md`: keep implementation guidance aligned with actual behavior.

### Phase 2 — shared component normalization
- [ ] `primitives.jsx`: Button, IconButton, badges, form fields and shared controls.
- [ ] `layout.jsx`: Surface, Card, Separator, typography and data display.
- [ ] `navigation.jsx`: tabs, menus, breadcrumbs and pagination.
- [ ] `feedback.jsx`: loading, empty, error, success and media states.
- [ ] `cards.jsx` and `skeletons.jsx`: domain cards and geometry-matched loading states.
- [ ] Component showcase and design foundation: exercise real shared variants.

### Phase 3 — public route migration
- [ ] `HomePage.jsx`, `EditorialPages.jsx`, `PublicInfoPages.jsx`.
- [ ] `ArtworkCatalogue.jsx`, `ArtworkDetailPage.jsx`, `ArtworkGallery.jsx`, `ArtworkStudio.jsx`.
- [ ] `ArtistDirectoryPage.jsx`, `ArtistProfilePage.jsx`.
- [ ] `AuthPage.jsx` and `RoutingPages.jsx`.
- [ ] Remove route-local max-width/gutter wrappers where they duplicate Container; move full-bleed backgrounds to outer sections.

### Phase 4 — workspace route migration
- [ ] `Layouts.jsx`: workspace grid and shell allow section-owned full-bleed backgrounds while preserving navigation rails.
- [ ] `BuyerWorkspace.jsx`, `ArtistWorkspaceOverview.jsx`, artist workspace pages.
- [ ] `AdminWorkspace.jsx` and admin feature pages.
- [ ] Messaging: preserve its intentional split-pane/immersive behavior; normalize shared controls without constraining the conversation canvas.

### Phase 5 — cleanup and enforcement
- [ ] Audit remaining raw buttons and form controls; migrate to shared primitives when semantics match.
- [ ] Audit border thickness, radius, hard-coded colors, arbitrary values and duplicate class combinations.
- [ ] Remove obsolete token aliases only after a repository-wide usage check proves they are unused.
- [ ] Add/update tests for container modes, button variants, RTL, themes and responsive overflow.
- [ ] Keep exceptions documented and narrowly scoped.

### Phase 6 — verification
- [ ] Run formatting/lint and targeted unit tests.
- [ ] Run the full relevant test suite and existing browser smoke tests.
- [ ] Compare public and workspace routes at 320, 360, 390, 430, 768, 1024, 1280 and 1440px.
- [ ] Inspect light/dark, RTL/mixed-direction, loading/empty/error/disabled states.
- [ ] Record automated results separately from manual visual QA.

## Acceptance criteria

- Main route canvases span available viewport width and do not own content gutters.
- Full-bleed section backgrounds reach both viewport edges without horizontal overflow.
- Wide and reading content align to consistent tokens across public and workspace routes.
- A single implementation owns each shared component pattern.
- Shared buttons use one radius token; page-local exceptions are deliberate and documented.
- Semantic colors, typography, spacing, radii and divider hierarchy derive from canonical tokens.
- No route, API, authorization or business behavior changes as a side effect of styling refactors.
- All claimed verification has an actual test or browser result attached.
