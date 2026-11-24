# Rademan styling and design-system implementation plan

**Target branch:** `agent-chatgpt/rademan-redesign`  
**Status:** In progress  
**Scope:** Global styles, Tailwind theme, shared UI, all public/workspace routes, documentation and regression coverage.

## Architecture contract

1. CSS custom properties in `resources/css/app.css` are the canonical design-token source.
2. Tailwind maps utilities to those semantic tokens; it does not introduce a competing palette or scale.
3. Shared React components own reusable visual and interaction patterns.
4. Public `<main>` and workspace `.rd-page-frame` remain unconstrained by content widths/gutters; workspace main columns sit beside the navigation rail and full-bleed sections compensate for that offset.
5. Each section owns its background and uses the shared `Container` for its content measure:
   - `wide`: standard content width and page gutters.
   - `reading`: long-form measure and page gutters.
   - `full`: edge-to-edge content.
6. Route files compose sections; they do not reimplement common controls or invent competing page-width systems.
7. Messaging, media viewing and editing may retain explicitly scoped immersive layouts.
8. Preserve route behavior, data contracts, authorization, form semantics, RTL and accessibility.

## File-by-file sequence

### Current implementation status

The foundation, shared container/section architecture, public-route migrations, workspace-route migrations, loading skeletons, and shared control/surface normalization have been applied on this branch. The remaining work is the final audit of route-specific arbitrary values and class duplication, followed by browser-based visual and responsive verification.

Regression tests have been added or updated, but they have **not been executed** in this session. The repository's available color-accessibility workflow is manually dispatched; no workflow run or browser test result is available for the current branch head.

## Phase 1 — foundation and ownership
- [x] `resources/js/components/ui/layout.jsx`: canonical Container implementation.
- [x] `resources/js/components/ui/primitives.jsx`: retain PageContainer as a compatibility alias; begin shared button-radius normalization.
- [x] `resources/css/app.css`: document full-width main-frame behavior and add the explicit full-bleed section breakout utility; token alias/theme audit remains open.
- [x] `tailwind.config.js`: map typography, spacing, radius and content-width utilities directly to canonical tokens; define semantic content widths and control radius.
- [x] `resources/js/components/ui/index.js`: exports the canonical Container and the PageContainer compatibility alias without duplicate implementations.
- [x] `resources/js/lib/utils.js`: extend Tailwind class merging for semantic radius and content-width utilities.
- [x] `AI/DESIGN-SYSTEM.md` and `AI/DESIGN-SYSTEM-CATALOGUE.md`: update guidance to section-owned widths and the canonical Container/Section APIs.

### Phase 2 — shared component normalization
- [x] `primitives.jsx`: canonical Container alias, shared Button/IconButton radius, form-control radius and full-bleed WorkspaceHero composition.
- [x] `layout.jsx`: semantic Card/Callout radii and shared Section bleed behavior; Separator remains semantic.
- [x] `navigation.jsx`: normalize pagination radius and menu surface radius; active tab indicator remains a deliberate 2px state marker.
- [x] `feedback.jsx`, `Dialog.jsx`, `AlertDialog.jsx`, `Tooltip.jsx`: normalize surface radii and structural borders.
- [x] `skeletons.jsx` and `RoutingPages.jsx`: align public/workspace loading states with Container widths, full-bleed hero/filter sections and no nested main landmarks.
- [x] `DesignFoundation.jsx`: render the specimen inside the canonical Container; `ComponentShowcase.jsx` already exercises shared variants.
- [x] `App.jsx`: reduce the development-only legacy entry to the design-system specimen; production routing remains in `AppRouter.jsx`.
- [ ] Remaining route-local controls and specialized navigation still need a repository-wide audit.

### Phase 3 — public route migration
- [x] `HomePage.jsx`, `EditorialPages.jsx`, `PublicInfoPages.jsx`.
- [x] `ArtworkCatalogue.jsx`, `ArtworkDetailPage.jsx` (shared section widths and full-bleed filter section).
- [x] `ArtworkGallery.jsx`.
- [x] `ArtistDirectoryPage.jsx`, `ArtistProfilePage.jsx`.
- [x] `AuthPage.jsx` and `RoutingPages.jsx`.
- [ ] Finish auditing remaining route-local max-width/gutter wrappers and migrate full-bleed backgrounds where still needed.

### Phase 4 — workspace route migration
- [x] `Layouts.jsx`: remove normal workspace shell gutters so route containers own them; add viewport bleed alignment around the desktop navigation rail.
- [x] `BuyerWorkspace.jsx`, `ArtistWorkspaceOverview.jsx`, `ArtworkStudio.jsx`, and `ArtistProfileSettings`: use section content containers; WorkspaceHero is full-bleed with aligned inner content.
- [x] `AdminWorkspace.jsx` and `EditorialPages.jsx` admin editorial tools: use shared containers.
- [x] Messaging: preserve its intentional split-pane/immersive behavior; normalize composer controls, message actions, attachment surfaces and status feedback without constraining the conversation canvas.

### Phase 5 — cleanup and enforcement
- [x] Audit application route files for raw buttons and native form controls; all route actions/forms use shared primitives or intentional semantic links. Remaining work is styling and semantic review of specialized links/controls.
- [x] Normalize structural dividers and shared surface/control radii; one-way token aliases and derived state surfaces now resolve from canonical `--rd-*` values.
- [ ] Remove obsolete token aliases only after a repository-wide usage check proves they are unused.
- [x] Add/update static regression assertions for container modes, semantic class merging, button radius, theme-aware aliases, workspace bleed alignment and skeleton composition.
- [ ] Finish route-wide hard-coded color, arbitrary value and duplicate class audits; specialized message bubble geometry remains an intentional immersive exception.
- [ ] Keep exceptions documented and narrowly scoped.

### Phase 6 — verification
- [ ] Run formatting/lint and targeted unit tests.
- [ ] Run the full relevant test suite and existing browser smoke tests.
- [ ] Compare public and workspace routes at 320, 360, 390, 430, 768, 1024, 1280 and 1440px.
- [ ] Inspect light/dark, RTL/mixed-direction, loading/empty/error/disabled states.
- [ ] Record automated results separately from manual visual QA.

## Acceptance criteria

- Public main and workspace content frames fill their shell's available width without owning content max-widths or gutters.
- Full-bleed section backgrounds reach both viewport edges without horizontal overflow.
- Wide and reading content align to consistent tokens across public and workspace routes.
- A single implementation owns each shared component pattern.
- Shared buttons use one radius token; page-local exceptions are deliberate and documented.
- Semantic colors, typography, spacing, radii and divider hierarchy derive from canonical tokens.
- No route, API, authorization or business behavior changes as a side effect of styling refactors.
- All claimed verification has an actual test or browser result attached.
