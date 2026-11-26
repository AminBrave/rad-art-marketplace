# Rademan — UI, UX & Design System Catalogue

**Catalogue status:** implementation reference for the current redesign branch  
**Branch:** `agent-chatgpt/rademan-redesign`  
**Product direction:** editorial art marketplace, Persian-first RTL, adaptive navigation  
**Source of truth:** the exported shared UI surface in `resources/js/components/ui/index.js`, implementation files under `resources/js/components/ui/`, global tokens in `resources/css/app.css`, and the current application shells/routes.

This catalogue records what is implemented in the codebase at the time of writing. It is not a claim that every route, component state, viewport, or accessibility criterion has passed visual QA. Where implementation and the intended design language diverge, the catalogue calls out the gap rather than silently describing the intended state as current behavior.

## 1. Product experience principles

1. **Artwork leads.** Artwork is the primary content; metadata, pricing, artist identity and actions support it.
2. **Editorial rather than generic SaaS.** Use considered typography, whitespace, strong hierarchy, deliberate composition and restrained surface treatments.
3. **Role-aware, visually coherent.** Public discovery, buyer, artist and admin areas share semantic tokens and component patterns while navigation and density adapt to each task.
4. **Persian-first and bidirectional.** RTL is the default. Latin names, URLs, identifiers, prices, email addresses and mixed-direction user content must remain legible.
5. **Clarity before decoration.** Status, availability, ownership, permissions and next actions must be explicit.
6. **State-complete UX.** Loading, empty, no-results, validation, error, permission, disabled, busy, success, upload and recovery states are first-class.
7. **Responsive by intent.** Mobile may change navigation, order and density, but not remove essential information or actions.
8. **Preserve product behavior.** UI changes must not alter API contracts, route permissions, moderation semantics, privacy, messaging delivery or mutation behavior.

## 1.1 Gestalt principles as practical UI rules

Apply these principles across the entire product:

| Principle | Practical rule |
|---|---|
| Proximity | Related labels, values, controls and descriptions stay close; unrelated groups receive a larger gap. |
| Similarity | Repeated components share styling and interaction. Variations communicate meaningful differences only. |
| Common region | A card or panel encloses one coherent group or task, never decoration for its own sake. |
| Alignment / continuity | Reuse shared container edges, baselines and grid tracks to create a clear reading path. |
| Figure–ground | Primary content and artwork remain visually dominant against quiet surfaces and restrained decoration. |
| Closure | Whitespace and a single clear boundary define groups; avoid stacked borders. |
| Prägnanz | Prefer the simplest composition that communicates the purpose; remove redundant labels and ornamental clutter. |
| Hierarchy | One dominant page title, followed by section headings, supporting copy and actions. |

Evaluate these rules across mobile/tablet/desktop and RTL/LTR. Do not mistake visual sameness for consistency: route-specific information architecture may differ while shared components, spacing and alignment remain predictable.

### Discovery hero and breadcrumb standard

- Public discovery pages use the shared `DiscoveryHero` anatomy and tokens: homepage, artwork catalogue, artist directory/profile, artwork detail and collection index/detail.
- The layout, typography, content width, vertical rhythm, surface, actions and responsive behavior remain consistent. Route identity comes from a restrained decorative shape variant (`ribbon`, `orbit`, `grid`, `arch`, `frame`, `diamond` or `layers`), not a new hero layout.
- Breadcrumbs appear only in public discovery and only at the top of the first hero. The homepage is the root and omits a redundant trail.
- Never show breadcrumbs in dashboards, admin pages, settings, messaging, or artist/buyer workspaces. Never place a separate breadcrumb strip above/below the hero.
- Breadcrumbs use localized ancestor labels, a current-page item, semantic navigation/list markup and `aria-current="page"`.
- Use `PageHeader` and `WorkspaceHero` for task/workspace pages; do not attach discovery breadcrumbs to them.

## 2. Visual foundations

### 2.1 Brand palette and semantic color roles

Brand anchors (CSS variables):
- Ivory: `--rd-brand-ivory` — `#F7F5F0`
- Charcoal: `--rd-brand-charcoal` — `#242320`
- Terracotta: `--rd-brand-terracotta` — `#A64F31`
- Sand: `--rd-brand-sand` — `#D8C9B7`
- Olive: `--rd-brand-olive` — `#536052`

CSS `--rd-*` variables are the canonical token source. Tailwind maps directly to them. Legacy `--color-*`, `--text-*`, `--space-*` and related names are one-way compatibility aliases; do not add new consumers of those aliases. Components should consume semantic roles rather than hard-code brand values:
- Canvas and surfaces: `--rd-canvas`, `--rd-surface`, `--rd-surface-raised`, `--rd-surface-muted`
- Text: `--rd-text-primary`, `--rd-text-secondary`, `--rd-text-tertiary`
- Rules: `--rd-border-subtle`, `--rd-border-strong`, `--rd-divider-section`, `--rd-divider-group`, `--rd-divider-nested`
- Actions and states: `--rd-action`, `--rd-action-hover`, `--rd-action-text`, `--rd-focus`, `--rd-success`, `--rd-warning`, `--rd-danger`, `--rd-info`
- Derived state surfaces: `--rd-success-surface`, `--rd-danger-surface`, `--rd-warning-surface`, `--rd-info-surface`, `--rd-accent-surface`, `--rd-focus-soft`.
- Overlay and loading: `--rd-overlay`, `--rd-skeleton-base`, `--rd-skeleton-highlight`
- Messaging: `--rd-message-own`, `--rd-message-peer`

The dark theme is declared under `:root[data-theme='dark']`; semantic roles adapt while brand anchors remain stable. Theme review must include surfaces, text, dividers, controls, feedback, overlays, focus and skeletons.

### 2.2 Divider and border hierarchy

All structural rules use the shared `--rd-line-width: 1px`. Importance is expressed by tint, not thickness:
- **Section boundary:** `--rd-divider-section` — strongest structural separator.
- **Peer group boundary:** `--rd-divider-group` — quieter separation between related groups.
- **Nested boundary:** `--rd-divider-nested` — lightest separation within a group.

Use proximity, alignment and whitespace before adding a line. Use similarity for repeated controls, common region for true groups, and avoid stacking a card border, inner border and separator around the same content. A child separator must never visually outweigh its parent boundary.

Tailwind semantic utilities: `border-divider-section`, `border-divider-group`, `border-divider-nested`; the shared `Separator` supports `tone="section|group|nested"`.

### 2.3 Typography

- Persian primary family: Vazirmatn (`--rd-font-persian`).
- Latin companion family: Inter (`--rd-font-latin`).
- Combined stack: `--rd-font-sans`.
- Semantic sizes: `--rd-text-xs` through `--rd-text-5xl`.
- Line-height roles: `--rd-leading-copy`, `--rd-leading-heading`, `--rd-leading-tight`, `--rd-leading-relaxed`.
- Weight roles: regular, medium, semibold, bold and extrabold.

Use heading typography for hierarchy, readable line lengths for long-form copy, tabular numerals for metrics, and explicit LTR/auto direction for identifiers or mixed-direction content when necessary.

### 2.4 Spacing, page width and responsive geometry

Use semantic layout tiers for major sections, content groups, compact workspace stacks and component internals; all semantic utilities resolve through the canonical 4px spacing unit.
Spacing uses a 4px base scale: `--rd-space-1` to `--rd-space-24` (0.25rem to 6rem). Layout tokens include:
- `--rd-content-width`: overall content maximum.
- `--rd-content-reading-width`: long-form reading measure.
- `--rd-page-gutter`: fluid page edge spacing.
- `--rd-header-height` and `--rd-workspace-nav-height`.
- `--rd-control-height-sm|md|lg`.

Use the canonical `Container` for consistent section widths. `PageContainer` is a compatibility alias for older imports and should not be used in new code. Page-level composition should not independently invent horizontal gutters on every route.

### 2.5 Shape, elevation and media

The canonical shape token is `--rd-radius-0: 0`; legacy radius aliases and Tailwind radius utilities resolve to this token. Shared components express square geometry directly and do not depend on radius utilities or global CSS overrides. Elevation tokens: `--rd-shadow-soft` and `--rd-shadow-raised`. Artwork ratios include `--rd-artwork-ratio` (4:3) and `--rd-portrait-ratio` (4:5).

Artwork itself should remain undistorted. Use `object-contain` when the complete work is the subject; use `object-cover` only for a deliberate editorial crop, avatar or ambient image. Keep the media frame and its internal padding intentional; the image should occupy the available frame without erasing the frame's breathing room.

### 2.6 Card composition\n\n- Use the shared `Card` for meaningful grouped information, metric tiles, featured people and editorial step groups.\n- A card uses a complete one-pixel boundary and a semantic surface (`bg-paper`, `bg-surface` or `bg-surface-muted`); do not style card-like groups as transparent `border-y` strips.\n- Keep nested separators lighter than the card boundary. Prefer proximity and alignment over extra inner borders.\n- Keep standalone editorial sections open; cards are for coherent groups, not every paragraph or list item.\n- The canonical geometry is square across every component. `--rd-radius-0` is the source token; Tailwind's legacy radius utilities resolve to zero during migration, and shared UI components omit radius utilities.\n\n## 3. Section-owned content width and full-bleed composition — mandatory

**The public route-level `<main>` and workspace `.rd-page-frame` are unconstrained content canvases, not content-width containers.** In a workspace, the main column sits beside the navigation rail; a `Section bleed` expands to the viewport and compensates for that rail. Every section owns its own content measure.

### Canonical contract

- The public route-level `<main>` and workspace `.rd-page-frame` remain free of content max-widths and page gutters. The workspace shell may define the sidebar/main grid, but it must not add route-content gutters.
- Each normal section places its background, border, and vertical rhythm on the outer semantic `<section>`.
- Section content is constrained independently with the shared `Container` component:
  - `width="wide"`: centered standard content width with the shared page gutters.
  - `width="reading"`: centered long-form reading measure with the shared page gutters.
  - `width="full"`: edge-to-edge content with no maximum width or automatic page gutters.
- A full-bleed section must not put its background on the constrained inner container. The outer section owns the background; the inner container owns content alignment. Inside a workspace, the shared bleed rules align the inner wide/reading container with the content column rather than the viewport center.
- Use the same `--rd-content-width`, `--rd-content-reading-width`, `--rd-page-gutter`, `--rd-workspace-sidebar-width`, and `--rd-workspace-column-gap` tokens across routes. Do not invent route-specific width tokens.
- Page headers, section headers, card grids, forms, tables and toolbars should use the appropriate section container rather than adding independent centered wrappers.
- Reading width is an inner content measure. It must not constrain the background or sibling sections.
- Public and workspace shells may have different navigation chrome, but their ordinary section content follows the same container contract.
- Messaging, media viewers and editors may use explicit immersive layouts when their task requires them. Keep these exceptions scoped to the experience, not as alternate defaults for ordinary routes.

### Required composition

```jsx
<section className="w-full bg-surface-muted py-12">
    <Container width="wide">
        {/* Content aligned to the shared page grid */}
    </Container>
</section>
```

For long-form copy, use `<Container width="reading">`; for genuinely edge-to-edge content, use `<Container width="full">`. Use `<Section bleed>` when a section must break out of a constrained workspace column and span the viewport.

### Gestalt application

- **Common region:** the outer section creates the visual region; the inner container establishes content alignment.
- **Alignment and continuity:** repeat the same wide-container guides across sections, even when backgrounds differ.
- **Proximity:** use spacing to group related content before adding dividers.
- **Similarity:** reuse the same container widths and section rhythm across route families.
- **Hierarchy:** use typography, whitespace, column spans and tonal backgrounds—not arbitrary outer widths.
- **Figure/ground:** allow artwork and full-bleed media to occupy the viewport when appropriate, while preserving legibility and intentional framing.

### Review gate

A route is not layout-complete until:
- the main element spans the available viewport width;
- each section chooses its own content width;
- full-bleed backgrounds reach both viewport edges without horizontal overflow;
- constrained content aligns to the same wide-container guides across routes;
- reading-width content remains narrower without narrowing its section background;
- workspace and public routes preserve the same ordinary content alignment;
- immersive exceptions are explicit and do not leak into normal pages.

## 4. Shared component catalogue

All shared components are exported through `resources/js/components/ui/index.js`. Prefer imports from this barrel in route-level code.

### 4.1 Actions and form controls — `primitives.jsx`

| Component | Responsibility | Current API / behavior |
|---|---|---|
| `Button` | Text action | `variant`: primary, secondary, outline, ghost, danger; `size`: sm, md, lg; supports loading, disabled, explicit type; forwards ref. |
| `IconButton` | Icon-only action | Requires accessible `label` or `title`; size sm/md/lg; tooltip; forwards ref. |
| `Badge` | Compact status/context label | neutral, success, warning, danger, info, accent. |
| `StatusBadge` | Domain status mapping | Maps known moderation/availability statuses to semantic Badge variants; accepts status and optional display label. |
| `FormField` | Label and field relationship | Generates ID if absent; supports required marker, hint, error; associates described-by and invalid state with a single child control. |
| `TextInput` | Single-line input | Shared control baseline; forwards ref and native input props. |
| `TextareaField` | Multiline input | Shared control baseline, default 4 rows, resizable vertically; forwards ref. |
| `FileInput` | File selection | Shared control baseline and styled file selector; forwards ref. |
| `SelectField` | Accessible select | Radix Select wrapper; accepts option children, controlled/uncontrolled value, placeholder, disabled, required, RTL by default. |
| `Checkbox` | Boolean selection | Radix Checkbox wrapper; supports controlled/uncontrolled usage and label content. |
| `SearchField` | Search control | Shared search input pattern; see implementation for current props. |

**Form contract:** use `FormField` for labels, required indicators, hints and validation. Use the matching shared control rather than recreating its baseline styles in a page. Set `type="submit"` explicitly on submit buttons. Icon-only controls must have an accessible name. Preserve refs and native attributes for focus management and form integration.

### 4.2 Page structure and semantic composition — `primitives.jsx`, `layout.jsx`

| Component | Responsibility |
|---|---|
| `Container` | Canonical section-owned content width; `wide`, `reading`, `full` modes. |
| `DiscoveryHero` | Shared public-discovery hero with optional breadcrumb, actions, media and one restrained route-specific geometric shape. |
| `PageHeader` | Task/workspace page title, eyebrow, description and actions; no discovery breadcrumb. |
| `SectionHeader` | Section-level title, description and actions. |
| `WorkspaceHero` | High-emphasis workspace introduction. |
| `Surface` | default, muted, raised and interactive surface variants. |
| `DashboardMetricCard` | Metric label, value, detail and optional destination. |
| `Box` | Minimal semantic wrapper with ref forwarding. |
| `Flex` | Flex layout with direction, alignment, justification, wrap and gap. |
| `Grid` | Grid layout with configured column count and gap. |
| `Container` | Canonical wide, reading or full-width content wrapper; the only implementation of section content widths. |
| `Section` | Semantic section wrapper; `bleed` opts into a viewport-width background/content region when nested in a constrained shell. |
| `Inset` | Logical or physical padding helper. |
| `Heading`, `Text`, `Strong`, `Em` | Semantic typography helpers. |
| `Code`, `Quote`, `Blockquote` | Inline/block quotation and code treatments. |
| `Separator` | Horizontal/vertical 1px rule with section/group/nested tone. |
| `AspectRatio` | Ratio-constrained media/content frame. |
| `Avatar` | Image with fallback and size variants. |
| `Card` | Bordered paper surface, optionally interactive. |
| `Callout` | info, success, warning and danger contextual note. |
| `Progress`, `Spinner`, `Kbd` | Progress, loading and keyboard hint primitives. |
| `AccessibleIcon`, `VisuallyHidden` | Accessible naming and visually-hidden content. |
| `Table` | Responsive horizontal-scroll wrapper for semantic table. |
| `DataList`, `DataListItem` | Label/value information layout with nested dividers. |

### 4.3 Navigation — `navigation.jsx`

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: Radix tabs with active and focus styling.
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`: accessible menu composition; content defaults to RTL and end alignment.
- `Breadcrumbs`: page path with current-page semantics.
- `Pagination`: previous/next and compact page selection; hides when fewer than two pages exist.

Use navigation components for navigation, not generic clickable containers. Preserve current-page semantics and keyboard behavior.

### 4.4 Dialogs, overlays and tooltip

- `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogTitle`, `DialogDescription`: shared Radix dialog surface and responsive placement.
- `AlertDialog`, `AlertDialogTrigger`, `AlertDialogCancel`, `AlertDialogAction`, `AlertDialogContent`, `AlertDialogTitle`, `AlertDialogDescription`: confirmation flow for consequential actions.
- `Tooltip`: supplemental context for controls; never the only accessible name.

Keep dialog focus contained and restored, support Escape/outside dismissal where appropriate, and use alert dialogs for decisions with consequences.

### 4.5 Feedback and media — `feedback.jsx`

| Component | Responsibility |
|---|---|
| `Skeleton`, `SkeletonLines` | Loading placeholders; match destination geometry and respect reduced motion. |
| `MediaImage` | Image loading, skeleton, error fallback and optional image variant. |
| `EmptyState` | No-content/no-results explanation with optional action. |
| `ErrorState` | Error explanation and optional retry action. |
| `SuccessState` | Concise success feedback. |
| `PermissionState` | Access restriction explanation. |
| `UploadFeedback` | File name, upload state, progress and message. |
| `Toast` | Transient success/error/info notification. |

Image states must be meaningful and must not collapse the reserved media frame. Provide useful alt text when the image conveys content; use empty alt for decorative media.

### 4.6 Domain cards and skeletons

- `ArtworkCard`: artwork image in a portrait frame using `MediaImage` with `object-contain`; shows category, title, artist and formatted price; links to artwork detail.
- `ArtistCard`: artist identity, initial/avatar treatment, city, biography excerpt and profile link.
- Skeleton exports include artwork/artist cards, artwork detail, artist profile, forms, studio lists, conversation inbox/history, admin lists/dashboard, collection cards/details, notifications and homepage.

Domain cards should present real data only. Do not fabricate ratings, sales, availability or other marketplace facts.

## 5. Interaction states and behavior

Every relevant control or page must account for:
- Rest, hover, focus-visible, pressed, selected/current, expanded/collapsed.
- Disabled and busy/submitting states.
- Loading and background refresh.
- Empty and no-results states.
- Client validation and server validation errors.
- Network/server failure and retry/recovery.
- Permission denied, private or unavailable content.
- Success confirmation and destructive-action confirmation.
- Long content, missing optional fields and malformed/unavailable media.

Focus must be visible and must not cause layout shifts. Hover must not be the only affordance. Reduced-motion preferences must be respected.

## 6. Responsive, RTL and accessibility standards

### Responsive behavior
- Public navigation and workspace navigation adapt between wide and narrow layouts.
- Workspaces use desktop navigation rails and compact mobile navigation patterns; messaging has a dedicated split-view/mobile transition.
- Account for safe-area insets, sticky/fixed elements, mobile browser chrome and virtual keyboard.
- Avoid horizontal page overflow; tables may use a local horizontal-scroll wrapper when necessary.
- Test at 320, 360, 390, 430, 768, 1024, 1280 and 1440px widths.

### RTL and mixed direction
- RTL is the default for Persian-first surfaces.
- Prefer logical properties/utilities (`ps`, `pe`, `start`, `end`) over hard-coded left/right.
- Use `dir="ltr"` for code, keyboard shortcuts and page-number sequences when appropriate.
- Use `dir="auto"` or explicit direction for user-provided names, identifiers, URLs and mixed-direction strings.
- Verify numerals, punctuation, currency and text truncation in both directions.

### Accessibility
- Use semantic HTML and heading order.
- Associate labels, hints and errors with controls.
- Give icon-only actions accessible names.
- Maintain keyboard operation, visible focus, dialog focus management and escape behavior.
- Announce asynchronous status changes without making entire interactive regions live.
- Do not communicate state by color alone.
- Review contrast in both themes and for disabled, placeholder, focus and status states.
- Respect reduced motion and touch target needs.

## 7. Component ownership and implementation rules

- `primitives.jsx`: low-level controls and shared page primitives.
- `layout.jsx`: semantic layout, typography, grouping and data-display primitives.
- `navigation.jsx`: navigation and menu patterns.
- `feedback.jsx`: feedback, loading and media states.
- `cards.jsx`: reusable marketplace domain cards.
- `skeletons.jsx`: page/feature loading compositions.
- `index.js`: public shared UI export surface.
- `resources/js/app/`: route-level composition and feature orchestration.

Pages should compose shared components rather than reimplement common controls. Add a shared variant when a pattern is reused with materially different semantics. Keep domain/API orchestration out of generic primitives. Preserve native semantic elements when no shared component adds value.

## 8. Known implementation gaps to resolve

These are code-level observations, not claims about the rendered result:
1. **Square geometry is consistent across the interface.** Shared controls, pagination, message bubbles, status indicators, overlays and domain-specific surfaces all use zero corner radius through the canonical `--rd-radius-0` token. Semantic grouping comes from surface, border, spacing and typography.
2. **Structural divider hierarchy is normalized; control borders remain semantic boundaries.** Structural section/group/nested dividers use 1px rules and semantic tints. Stronger/dashed borders remain for control boundaries, focus, validation or intentional accents; audit remaining route-specific cases.
3. **Card treatment is intentionally not universal.** `ArtworkCard` and `ArtistCard` use different compositions; some shared `Card`/ `Surface` consumers still need route-level visual review to ensure grouped content is coherent.
4. **Image behavior is role-dependent.** Artwork uses containment, while avatars and editorial imagery may use cover. Audit each usage rather than applying one global object-fit rule.
5. **API documentation depth varies.** Some components have concise contracts documented here; for exact props, inspect the source implementation and its TypeScript/JSDoc if available.
6. **Visual verification remains open.** The existence of tokens and components does not prove pixel-level consistency, accessibility conformance or responsive correctness.

## 9. Quality checklist for future changes

Before considering a component or page complete:
- [ ] Reuse the shared export where an equivalent component exists.
- [ ] Confirm semantic HTML, accessible name, labels and descriptions.
- [ ] Check hover, focus, pressed, disabled, busy and error states.
- [ ] Check Persian RTL and mixed Latin/number content.
- [ ] Check light and dark themes.
- [ ] Check narrow, medium and wide viewports.
- [ ] Check image loading, missing media and fallback geometry.
- [ ] Apply Gestalt grouping; remove redundant borders and containers.
- [ ] Preserve route, API, authorization and mutation contracts.
- [ ] Add/update tests for changed behavior and run relevant checks.
- [ ] Record browser/manual visual QA separately from automated test results.

## 10. Source map

- Tokens and global styles: `resources/css/app.css`
- Tailwind semantic mappings: `tailwind.config.js`
- Shared export surface: `resources/js/components/ui/index.js`
- Controls/page primitives: `resources/js/components/ui/primitives.jsx`
- Layout and semantic primitives: `resources/js/components/ui/layout.jsx`
- Navigation: `resources/js/components/ui/navigation.jsx`
- Feedback/media: `resources/js/components/ui/feedback.jsx`
- Domain cards: `resources/js/components/ui/cards.jsx`
- Loading compositions: `resources/js/components/ui/skeletons.jsx`
- Public/workspace shells: `resources/js/app/Layouts.jsx`
- Route and overhaul coverage ledger: `AI/COMPLETE-APPLICATION-OVERHAUL.md`
- Design principles and implementation contract: `AI/DESIGN-SYSTEM.md`
