# Phase 1 — Rademan design-system foundation refactor

**Status:** Implementation in progress; first shared-primitive slice committed  
**Target branch:** `refactor/290-unified-layout-spacing`  
**Related work:** PR #291, issue #290  
**Scope:** Shared layout contracts, spacing ownership, hero API, Tailwind/token conventions, and regression coverage  
**Non-goals:** Redesigning every screen, changing backend/API contracts, replacing React/Tailwind/Radix, or rewriting messaging

---

## 1. Executive decision

Rademan should use a **component-led, feature-oriented frontend with explicit layout ownership**.

Keep the existing React + Tailwind + Radix + TanStack Query stack. Do not introduce another component framework or a global CSS-in-JS layer. Strengthen the existing project-owned UI library and let feature folders own domain components.

The foundation has five rules:

1. **Page shell owns the viewport frame**, not content width or section spacing.
2. **Container owns horizontal gutters and maximum reading width.**
3. **PageSection owns vertical page rhythm and optional section surface.**
4. **PageHero owns the full-width hero frame, inner content alignment, and hero spacing.**
5. **Feature components own domain-specific composition; pages coordinate data and compose features.**

A layout decision must have one owner. No global HTML-element selector should silently create page layout. No child should need a CSS exception to undo spacing introduced by an ancestor or tag selector.

The target is near-zero *layout overrides*, not zero CSS. Keep CSS for design tokens, theme values, complex hero textures, message-bubble geometry, reduced-motion behavior, and browser-level fixes that are genuinely awkward in Tailwind. Prefer Tailwind utilities and component variants for ordinary layout and state styling.

## 2. Evidence-based current-state findings

These are source-level observations from the target branch; they are not claims of runtime visual verification.

### 2.1 Layout and spacing ownership

- `resources/css/app.css` applies vertical padding to every native `section` through a global selector. This makes the tag itself a layout primitive, including nested sections that may represent a semantic landmark rather than a page section.
- The same stylesheet contains workspace-specific child-section resets, hero padding exceptions, and a chat-shell `!important` reset. These are signs that multiple layers currently compete to own spacing.
- `Section` in `resources/js/components/ui/layout.jsx` separately adds `py-section sm:py-section-wide` when its rendered element is a `section`. This duplicates the implicit global rule and makes spacing depend on both element type and component usage.
- `Container` already owns responsive inline gutters through `.rd-container:not(.rd-container--full)`, with reading, wide and full width variants. Preserve this clear responsibility.
- `PageShell`, `PageSection`, and `PageHero` are not yet established as one explicit page-composition contract.

### 2.2 Hero API

- `UnifiedHero` is the underlying implementation; `PageHeader`, `DiscoveryHero`, and `WorkspaceHero` are wrappers with different prop surfaces.
- The wrappers do not expose a consistent set of supported capabilities.
- `WorkspaceHero` hard-codes bleed behavior, while `PageHeader` exposes a bleed prop and `DiscoveryHero` does not.
- Hero bleed and width behavior also depend on global CSS classes and route/workspace context. This needs a documented contract and a regression matrix before simplifying CSS.

### 2.3 Tailwind and tokens

- `tailwind.config.js` maps semantic colors, typography, spacing and widths to CSS variables. This is worth preserving.
- The spacing configuration contains both numeric utilities and named semantic tiers, plus `editorial-*` aliases that duplicate the numeric scale.
- `app.css` defines canonical `--rd-*` tokens and a substantial compatibility layer of legacy aliases. Existing consumers mean aliases must be migrated deliberately, not deleted in one pass.
- All Tailwind border-radius keys currently resolve to zero, including `rounded-full`. This makes familiar utility names misleading and should be addressed as an explicit shape-system decision rather than changed accidentally.
- `Flex` and `Grid` accept numeric gaps by writing inline styles. Standard spacing should normally use statically discoverable Tailwind classes or semantic variants; inline styles should remain for genuinely data-driven values.

### 2.4 Regression coverage

- `tests/js/designSystemCoverage.test.js` currently asserts that every native `section` receives default global padding. That assertion protects the current coupling and must be replaced as part of the migration.
- Static source tests are useful for enforcing token and architecture rules, but cannot verify actual geometry, keyboard behavior, clipping, visual hierarchy, or RTL layout.

## 3. Target architecture and ownership contract

### 3.1 Page composition

The intended composition is:

```jsx
<PageShell>
    <PageHero
        variant="workspace"
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
    />

    <PageSection spacing="relaxed">
        <Container width="wide">
            <SectionHeader title={sectionTitle} description={sectionDescription} />
            {/* Feature components */}
        </Container>
    </PageSection>
</PageShell>
```

This is a contract example, not a demand to wrap every existing DOM node. Use semantic HTML inside feature components. A page with a specialized split view, full-bleed gallery, or messaging workspace may use a different composition while retaining the same ownership rules.

### 3.2 Component responsibilities

| Component | Owns | Must not own |
|---|---|---|
| `PageShell` | Full-width page frame, min-width safety, page-level composition | Content max-width, implicit section padding |
| `Container` | Reading/wide/full max-width and responsive inline gutters | Vertical spacing, card styling |
| `PageSection` | Explicit vertical spacing, optional section surface/bleed | Inner content max-width |
| `PageHero` | Hero surface, grid texture, title hierarchy, inner Container, hero vertical rhythm | Route data fetching or feature-specific business logic |
| `SectionHeader` | Eyebrow/title/description/actions hierarchy for a content group | Outer section padding |
| Feature component | Domain-specific UI and its local interaction states | Global page gutters and route-level page spacing |
| Page/route | Data orchestration, route state, composition | Reimplementing shared visual patterns |

### 3.3 API contracts

#### PageShell

- Semantic wrapper, normally rendered as `main` or a route-level `div` when the layout already owns the main landmark.
- Full width, `min-w-0`, no implicit horizontal or vertical padding.
- Does not add a max-width. It must not constrain a full-width hero.
- Avoid nested `main` landmarks.

#### Container

Retain the current `reading | wide | full` widths.

- `reading`: centered reading measure plus page gutters.
- `wide`: centered content width plus page gutters.
- `full`: edge-to-edge, no automatic inline gutters.
- Do not add vertical padding.
- Do not add route-specific exceptions to compensate for parent gutters.

#### PageSection

Use explicit spacing variants, for example:

- `none`
- `compact`
- `regular`
- `relaxed`

A top-level content section must declare its spacing intent. Nested semantic sections should use `none` unless they are intentionally separate page-level groups. Do not infer spacing from the native `section` tag.

The component may support a surface and bleed variant only where those variants have real, repeatable use cases. Avoid a generic prop for every CSS property.

#### PageHero

Keep one canonical implementation. Public/workspace wrappers may remain for discoverability or route-specific type safety, but must forward the same supported layout contract.

Recommended stable inputs:

- `eyebrow`, `title`, `description`
- `actions`, `media`, `children`
- `breadcrumbs` (public discovery only)
- `variant` or `surface` from a small documented set
- `level` for semantic heading level
- optional `className` for exceptional composition, not routine spacing changes

Hero frame behavior must be consistent: background spans the viewport, inner content aligns with the same Container as the following sections, and vertical rhythm is owned exactly once. Do not use a route-specific `bleed` boolean if every supported hero is full-bleed. If a genuinely contained hero is needed, model it as an explicit named variant.

Preserve the current grid surface and theme-aware hero tokens. Do not reintroduce the removed title-square motif.

#### SectionHeader

Retain the existing component as the canonical content-group header. Consolidate the homepage's custom section heading and other local equivalents after comparing their real differences. Preserve meaningful variants through explicit props rather than separate near-duplicate components.

### 3.4 What should not become a component

Do not create wrappers for every `div`, `span`, `p`, or one-off flex row. Extract a component when it represents a repeated product pattern, owns meaningful behavior/accessibility, has a stable visual contract, or is complex enough to improve readability when isolated.

Prefer native semantic HTML plus Tailwind for a one-off composition. The goal is fewer duplicated patterns, not maximum component count.

## 4. Phase 1 file-by-file implementation backlog

Work in small, reviewable commits. The order below is intentional: first establish ownership and tests, then migrate call sites, then remove obsolete CSS.

### P0 — Layout contract and global spacing

| File | Change | Acceptance |
|---|---|---|
| `resources/css/app.css` | Remove the global `section { padding-block: ... }` rule. Remove workspace child-section and hero padding resets when no longer needed. Retain only documented structural CSS such as token definitions, hero texture, bleed mechanics and messaging geometry. | A raw `section` has no implicit layout spacing. No page relies on a tag selector for vertical rhythm. |
| `resources/js/components/ui/layout.jsx` | Give `Section` an explicit spacing API (`none/compact/regular/relaxed`) and remove spacing inference based on `Element === 'section'`. Keep `Container` width/gutter responsibility unchanged. | Section spacing comes only from its explicit variant; a non-section element can intentionally use the same spacing. |
| `resources/js/app/Layouts.jsx` | Confirm public/workspace/admin route shells are full-width and do not duplicate gutters or section spacing. Keep navigation/sidebar layout separate from page content composition. | Public and workspace page content can align to the same Container without parent padding compensation. |
| `resources/js/app/RoutingPages.jsx` | Update the route loading shell to use the same PageShell/Container/Section ownership as the loaded page; remove duplicated shell spacing. | Loading-to-loaded transition does not jump horizontally or vertically. |
| `resources/js/app/ArtistWorkspaceOverview.jsx`, `BuyerWorkspace.jsx`, `AdminWorkspace.jsx`, `ArtworkStudio.jsx`, `EditorialPages.jsx`, `RoutingPages.jsx` | Inventory native top-level `section` elements. Convert page-level groups to explicit `PageSection`/shared Section usage; leave nested semantic sections unpadded. Remove local padding utilities only when the shared owner replaces them. | Every top-level section has one spacing owner; no double padding. |
| `resources/js/app/HomePage.jsx`, `ArtistDirectoryPage.jsx`, `ArtworkCatalogue.jsx`, `ArtistProfilePage.jsx`, `ArtworkDetailPage.jsx`, `EditorialPages.jsx` | Verify public discovery sections also use the same explicit Section spacing contract. Preserve their current visual rhythm unless a mismatch is demonstrated. | Workspace and discovery use the same layout ownership rules, not necessarily identical section content. |

### P0 — Hero contract

| File | Change | Acceptance |
|---|---|---|
| `resources/js/components/ui/primitives.jsx` | Define one canonical hero API and align `PageHeader`, `DiscoveryHero`, and `WorkspaceHero` wrappers. Remove redundant bleed flags if full-bleed is the invariant. Ensure wrappers forward media/children/actions/heading level only where supported. | All wrappers produce the same outer frame, inner content alignment and vertical rhythm. |
| `resources/css/app.css` | Keep the hero grid texture and semantic theme tokens. Reduce hero selectors to documented visual effects and true bleed behavior. Remove exceptions made obsolete by explicit PageSection spacing. | Hero background is full-width; content aligns to page gutters; no title-square motif; no duplicate vertical padding. |
| `resources/js/app/ComponentShowcase.jsx` | Make the showcase reflect the actual supported hero API; remove examples that pass ignored props. | Showcase examples compile against the real component contract and cover all supported variants. |
| `tests/js/designSystemCoverage.test.js` | Replace assertions that require implicit section padding with assertions for explicit Section spacing and shared hero behavior. | Tests fail if global section padding or wrapper-specific spacing drift returns. |

### P1 — Tailwind and token normalization

| File | Change | Acceptance |
|---|---|---|
| `tailwind.config.js` | Remove duplicate `editorial-*` spacing aliases after their consumers are migrated. Keep numeric scale token-backed and semantic layout tokens only for genuinely semantic roles. | One canonical spacing vocabulary; no utility generation regressions. |
| `resources/css/app.css` | Audit `--color-*`, `--text-*`, `--space-*`, `--radius-*` compatibility aliases. Migrate consumers to `--rd-*`/semantic Tailwind classes before deleting aliases. | No active consumer of deprecated aliases except explicitly documented third-party/Blade integration. |
| `tailwind.config.js`, `resources/css/app.css`, UI component files | Resolve the radius contract: current mapping makes `rounded-full` and every other radius utility square. Decide whether the product intentionally uses square geometry everywhere or whether avatars/pills need a semantic radius token. Do not silently change the visual identity during the spacing refactor. | Tailwind utility names have honest, predictable semantics; visual shape decision is documented and tested. |
| `resources/js/components/ui/layout.jsx` | Replace inline numeric `gap` styles in `Flex`/`Grid` with a finite static spacing map or Tailwind class variants. Retain inline style only for custom/data-driven gap values when required. | Standard gaps are statically discoverable by Tailwind; no runtime-generated utility class strings. |
| `resources/js/lib/utils.js` | Keep `cn()` as the class merge boundary; document class-merging conventions and avoid redundant wrapper utilities. | Variant defaults can be safely overridden without conflicting Tailwind classes. |

### P1 — Accessibility and component correctness

| File | Change | Acceptance |
|---|---|---|
| `resources/js/components/ui/layout.jsx` | Reset Avatar image failure when `src` changes; preserve meaningful fallback/alt semantics. | Changing a previously failed avatar URL retries the image. |
| `resources/js/components/ui/primitives.jsx` | Combine existing child `aria-describedby` IDs when FormField adds hint/error IDs; do not overwrite them. Audit forwarded refs and native props. | Descriptions remain fully associated and interactive primitives remain composable. |
| `resources/js/components/ui/navigation.jsx` | Move hard-coded Persian pagination accessible labels into the shared translation system; verify LTR/RTL direction and disabled states. | Pagination is localized in both supported locales and keyboard accessible. |
| `resources/js/components/ui/feedback.jsx`, `skeletons.jsx` | Verify consistent status semantics and reduced-motion handling. Keep live regions scoped to actual asynchronous updates. | Loading/error/success feedback is announced appropriately without duplicate announcements. |

### P1 — Tests, docs and inventory

| File | Change | Acceptance |
|---|---|---|
| `tests/js/designSystemCoverage.test.js` | Add architecture assertions for no global section spacing, explicit Section variants, no layout `!important`, no deprecated spacing aliases after migration, canonical hero wrappers and no ignored showcase props. | Tests enforce the new ownership model, not old implementation details. |
| `AI/DESIGN-SYSTEM.md` | Document ownership contracts and explicit spacing; distinguish stable design principles from implementation details. | Documentation matches component behavior. |
| `AI/DESIGN-SYSTEM-CATALOGUE.md` | Update component APIs, current source paths, known gaps and examples. | Catalogue matches the exported component surface. |
| `AI/COMPLETE-APPLICATION-OVERHAUL.md` | Link Phase 1 status and record migrations/verification honestly. | One discoverable source of truth for broader application work. |

## 5. Migration sequence and commit boundaries

Do not combine every change into one large patch.

1. **Commit A — Lock the target contract:** add/adjust regression tests to describe explicit layout ownership; update docs with the new rules.
2. **Commit B — Add explicit primitives:** implement Section spacing variants and the PageShell/PageHero contract without removing old behavior yet. Keep compatibility wrappers temporarily.
3. **Commit C — Migrate page call sites:** migrate top-level sections by route family: public discovery, artist/buyer workspace, admin/editorial, settings/profile. Migrate loading shells in the same route family.
4. **Commit D — Remove implicit CSS:** delete global section padding and obsolete workspace/chat/hero resets only after all consumers are migrated. Replace chat's reset with explicit chat layout classes rather than another broad selector.
5. **Commit E — Normalize Tailwind:** remove duplicate spacing aliases, migrate token consumers, resolve radius semantics, and replace standard inline gaps.
6. **Commit F — Correct shared component behavior:** Avatar, FormField, pagination localization, and related accessibility fixes.
7. **Commit G — Visual and interaction verification:** responsive, theme, RTL/LTR, keyboard, reduced-motion, loading and error states. Update catalogue and overhaul ledger with verified results.

Every commit should preserve current route URLs, authorization rules, API payloads, query keys, mutations, and product behavior unless a separate approved task explicitly changes them.

## 6. Gestalt and visual acceptance criteria

Use these as review questions on every affected route:

- **Proximity:** labels, values, fields and helper text read as one group; unrelated tasks have a larger separation.
- **Similarity:** equivalent controls, statuses, cards, headings and actions share visual behavior.
- **Common region:** each card/panel groups one coherent task; avoid nested borders around the same information.
- **Alignment:** hero inner edges, section headings, filters and results align to the same Container.
- **Figure–ground:** artwork is the primary figure; controls, metadata and decoration remain subordinate.
- **Closure:** use whitespace first; use borders/surfaces only when they clarify a real group.
- **Prägnanz:** remove redundant headings, wrappers, decorative layers and repeated metadata.
- **Hierarchy:** one page-level h1, ordered section headings, clear primary action, consistent secondary actions.

Functional parity matters as much as appearance. Verify loading, empty, error, success, disabled, permission-denied, long-content, and validation states.

## 7. Required verification matrix

Run and record the actual result for each applicable check. Do not mark a check complete because source assertions pass.

| Dimension | Required cases |
|---|---|
| Viewport | 320, 375, 640/768, 1024, 1280, 1440px |
| Direction | Persian RTL and English LTR |
| Theme | Light, dark, system preference |
| Page families | Public discovery, artist, buyer, admin, editorial, settings, messaging |
| Hero | Full-bleed background, shared content edges, no horizontal overflow, consistent vertical rhythm |
| Section | No implicit native-section padding; one explicit spacing owner |
| Navigation | Desktop sidebar/header, mobile drawer/bottom navigation, active and focus states |
| States | Loading, empty, error, permission, success, disabled |
| Accessibility | Keyboard-only, focus visibility, labels/descriptions, landmark/heading order, reduced motion |
| Tooling | ESLint, focused Node tests, frontend test suite, production build, browser visual/smoke suite |

### Phase 1 exit criteria

Phase 1 is complete only when:

- No global native `section` spacing rule remains.
- No layout spacing depends on a route-specific `!important` reset.
- Every page-level section uses one explicit spacing owner.
- Hero wrappers share one documented frame and spacing contract.
- Discovery/workspace content gutters align at all tested breakpoints and directions.
- Tailwind spacing utilities use one canonical scale; duplicate aliases are either removed or documented with active migration consumers.
- The component showcase and design-system catalogue match actual APIs.
- Automated checks and browser verification have been run and their results recorded.

## 8. Scope guardrails

- Do not redesign all screens as part of Phase 1.
- Do not force messaging into generic page-section spacing. Messaging keeps its dense split-view composition while using the same tokens and shared controls.
- Do not extract every HTML element into a component.
- Do not introduce a global `Card` around every group. Use Gestalt proximity and whitespace before common-region decoration.
- Do not delete compatibility tokens before searching all JS, JSX, CSS, Blade and generated/static sources for consumers.
- Do not change artwork ratios, moderation semantics, permissions, route contracts or API behavior as collateral cleanup.
- Do not claim visual verification until the browser matrix has actually been run.

---

## 9. Suggested next PR slices after Phase 1

Once the foundation is stable, continue in feature-oriented slices:

1. **Shared patterns:** ResultsHeader, FilterPanel, PageActions, PageState, ResultsNavigation, FormActions.
2. **Artwork and artist features:** ArtworkCard, ArtistCard, ArtworkMetadata, portfolio/list patterns.
3. **Workspace dashboards:** MetricCard, readiness/status groups, task summaries.
4. **Administration:** filterable records, moderation queue, detail/action panel, confirmation patterns.
5. **Messaging:** extract focused hooks and subcomponents while preserving its dedicated responsive shell.
6. **UX improvements:** buyer return-visit dashboard, artist moderation guidance, admin task prioritization, and discovery refinement.

Each slice should have a short feature-specific contract and tests. Do not make the shared UI layer depend on application feature modules.

## 8. Implementation log

### Slice 1 — Shared primitive contracts

**Implemented on the target branch:**

- `Section` now accepts `spacing="none|compact|regular|relaxed"`; spacing no longer depends on whether the rendered element is a native `section`.
- The default remains `regular` temporarily to preserve existing layouts while page call sites are migrated. New and migrated call sites should pass an explicit spacing value. This compatibility default is not the final architecture.
- `PageHeader`, `DiscoveryHero`, and `WorkspaceHero` now forward the same core hero capabilities (content, actions, media, children, heading level, surface, and title/description classes). Discovery-only breadcrumbs remain available on the public-facing wrappers.
- The shared hero continues to use the grid surface by default. The removed title-square decoration remains excluded.
- Design-system coverage now checks the explicit Section spacing variants and canonical hero delegation.

**Not yet completed in this slice:**

- The global native `section` padding rule remains in place until page-level call sites have been migrated. Removing it now would create spacing regressions in pages that still rely on the global rule.
- Workspace/chat CSS exceptions have not been removed.
- The Section compatibility default has not yet been removed.
- Automated tests, lint, production build, and browser verification have not been run in this environment.

**Next implementation step:** migrate public discovery and workspace page sections to explicit spacing ownership, then remove the global native-section rule only after the remaining consumers are accounted for.

### Slice 2 — Page section migration

**Implemented on the target branch:**

- Migrated native section wrappers to the shared `Section` primitive in `HomePage`, `ArtistProfilePage`, `ArtworkDetailPage`, `EditorialPages`, `ArtistWorkspaceOverview`, `BuyerWorkspace`, `AdminWorkspace`, `ArtworkStudio`, and `RoutingPages`.
- Public discovery/editorial compositions explicitly use `spacing="regular"`; workspace compositions and route loading/settings compositions explicitly use `spacing="none"` where their parent shell or local layout already owns spacing.
- `Section`'s `none` variant emits `py-0`, so it can explicitly opt out of the still-present global native-section padding during the staged migration.
- Added regression coverage asserting that these page files import the shared primitive, no longer render native section tags directly, and declare their spacing intent.

**Still outstanding:**

- The global native `section` rule remains until remaining consumers (including the dedicated messaging shell and any component-level sections) are audited.
- Workspace and chat CSS compatibility exceptions remain until the global rule is removed.
- No test, lint, production build, or browser run has been performed in this environment.



### Slice 3 — Remove implicit native-section spacing

**Implemented on the target branch:**

- Removed the global `section { padding-block: ... }` rule. Native HTML section elements no longer acquire page spacing merely because of their tag name.
- Removed the workspace child-section reset and the hero section reset; both became redundant once section spacing was explicit.
- Removed the chat-specific section reset. The chat shell retains its own structural zero-padding rule without selecting every descendant section.
- Converted structural wrappers in `skeletons.jsx` from native `section` elements to neutral `div` wrappers. Loading placeholders are not independent page landmarks and should not inherit semantic page layout.
- Kept semantic sections in the remaining real page/feature compositions where they provide meaningful grouping; those compositions already own their spacing through explicit utilities or the shared `Section` primitive.
- Updated regression assertions to prevent reintroducing global native-section spacing or chat/workspace tag-specific resets.
- Follow-up cleanup: removed the remaining `.rd-chat-shell` `padding-block: 0 !important` override. The chat route already declares responsive `py-3 sm:py-4 lg:py-6` on its shell; the override had silently neutralized those intended utilities. The shell now owns its spacing through its layout classes.


**Verification status:**

- Source-level audit confirms no global native-section spacing selector remains, and the skeleton component file no longer uses native section wrappers.
- Automated tests, lint, production build, and browser verification have not been run in this environment. The existing verification matrix remains required before merge.

**Next implementation step:** audit the remaining `Section` consumers and remove the temporary default spacing value only after all call sites declare their intended spacing.


### Slice 4 — Require explicit Section spacing

**Implemented on the target branch:**

- Audited frontend JSX call sites and found four remaining uses without an explicit spacing variant: two catalogue groups and two route-loading panels.
- Added `spacing="regular"` to the catalogue filter and results groups, preserving their intended page-section rhythm.
- Added `spacing="none"` to loading skeleton groups whose own `py-*` utilities already define their vertical padding.
- Removed the `Section` component's implicit `regular` default. Missing or invalid spacing now resolves to `none`, preventing accidental page rhythm from being applied silently.
- Added a source-wide regression check over all frontend JS/JSX files: every `<Section>` call must declare `spacing` explicitly.

**Verification status:**

- Source audit of the touched call sites reports no missing `spacing` props.
- Automated tests, lint, production build, and browser verification have not been run in this environment.


### Slice 5 — shared route frame

- Added the exported `PageShell` layout primitive. It owns only the full-width, min-width-safe route frame and deliberately does not impose max-width, gutters, or vertical spacing.
- Replaced the public layout's hand-authored `rd-page-frame` main wrapper with `PageShell as="main"`, preserving the primary landmark and skip-link target.
- Replaced the authenticated workspace's hand-authored route-frame div with `PageShell variant="workspace"`; the specialized messaging viewport remains separate because it has distinct height/overflow behavior.
- Documented the ownership boundary: `PageShell` = route frame, `Container` = content width and gutters, `Section` = vertical rhythm.
- Added source-level regression coverage for the shared export and both layout consumers.
- Validation remains pending: automated tests, lint, production build, and browser QA have not been run in this environment.


### Slice 6 — Separate homepage section semantics from content width

**Implemented on the target branch:**

- Converted the homepage's recent-works and artist-spotlight groups from `<Container as="section">` into semantic `<Section spacing="regular">` wrappers containing `<Container width="wide">`.
- Removed vertical spacing utilities from those Containers. Section now owns the page rhythm; Container owns the content width and responsive inline gutters.
- Added a regression test to prevent these homepage sections from reverting to a Container-as-section composition.

**Design rationale:**

- Keeps semantic grouping and visual spacing in the Section primitive.
- Keeps max-width and page gutters in the Container primitive.
- Prevents the content-width primitive from silently taking on page-section responsibilities.
- Preserves the existing section content, responsive grid behavior, and visual order.

**Verification status:**

- Source-level review confirms both converted sections have explicit Section spacing and wide Containers.
- Automated tests, lint, production build, and browser verification have not been run in this environment.
