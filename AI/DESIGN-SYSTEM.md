# Rademan — design and experience guidance

This document describes useful design principles and the current product context. It is guidance, not a fixed specification. The user's latest direction can change the information architecture, visual language, interaction model, platform priorities or design system.

## Current UI catalogue

The implementation-level component and pattern inventory is maintained in [`AI/DESIGN-SYSTEM-CATALOGUE.md`](./DESIGN-SYSTEM-CATALOGUE.md). Use that catalogue alongside this principles document and the [complete application overhaul ledger](./COMPLETE-APPLICATION-OVERHAUL.md). The catalogue records current code behavior and known gaps; it does not imply visual QA completion. The staged foundation migration is specified in [`AI/PHASE-1-DESIGN-SYSTEM-REFACTOR.md`](./PHASE-1-DESIGN-SYSTEM-REFACTOR.md); treat it as the implementation backlog for layout ownership, hero contracts, Tailwind/token cleanup and verification.

## Design objective

Create a distinctive, usable art platform that makes artwork discovery and artist–audience interaction feel clear and considered. Choose the right experience for the requested users, task and device rather than forcing every feature into a pre-existing layout.

## Product information architecture

Organize discovery, artist presentation, buyer journeys and administrative work around clear user goals. Keep navigation, page hierarchy and content relationships coherent across public pages and role-based workspaces; verify route behavior and permissions before changing the information architecture.

## Current experience context

The current product is organized around public discovery, buyer experiences, artist experiences and administration. Current navigation and route behavior live in the application; inspect them before changing or documenting them.

Do not assume that current labels, role boundaries, routes or page composition are permanent. Follow the user's requested product model and update the implementation and documentation coherently.

## Design workflow

1. Understand the users, task, context, content and constraints.
2. Inspect the current screen, shared components, tokens, routes and related states.
3. Explore suitable interaction and layout approaches; explain meaningful alternatives when a decision matters.
4. Design loading, empty, error, success, disabled, permission and recovery states as relevant.
5. Consider mobile, tablet, desktop, keyboard, assistive technology, RTL and mixed-direction content.
6. Implement with appropriate reusable patterns without creating abstractions for their own sake.
7. Review the result against the intended user outcome and revise where needed.

Use the smallest process that fits the work. A small UI fix does not require a full discovery exercise or design specification.

## Visual system

The existing brand colors—Ivory #F7F5F0, Charcoal #242320, Terracotta #A64F31, Sand #D8C9B7 and Olive #536052—can inform the visual identity. They are not immutable.

CSS `--rd-*` variables are the canonical design-token source; Tailwind maps directly to them. The 4px `--rd-space-unit` is the base spacing unit, and standard numeric spacing utilities (`p-4`, `gap-6`, `mt-8`, etc.) resolve through that scale rather than Tailwind's independent defaults. Use the named `--rd-space-*` tokens for semantic layout decisions and `page-gutter` for responsive page insets. Legacy `--color-*`, `--text-*`, `--space-*` and related aliases are one-way compatibility bridges and should not be used by new code. Choose semantic tokens, typography, spacing, grids, radii, elevation, icons and motion to support the design. Reuse current components when they fit; refactor or replace them when that produces a better result. Do not follow the legacy RAD catalogue as a specification.

### Editorial hero surfaces

- Use the shared `.rd-hero-surface` for prominent page heroes and editorial feature panels. It composes a restrained radial accent, layered surface and low-contrast grid texture instead of using `bg-ink` or inverse-text shortcuts.
- Hero foreground, muted copy, accent, border and glow use dedicated `--rd-hero-*` semantic tokens. Define both explicit dark-theme and system-dark values; do not infer hero contrast from the generic `ink` or `inverse` roles.
- Keep headings and supporting copy on the hero foreground/muted roles, and make actions contrast against the active hero palette. Decorative geometry must remain non-interactive, avoid clipping content and respect the zero-radius visual language.
- Use `UnifiedHero` as the shared full-width hero primitive for discovery, editorial, and workspace pages. Use `PageHeader` / `WorkspaceHero` for task-oriented workspace pages. Keep the same theme-aware hero surface and contrast tokens; do not attach discovery breadcrumbs to workspace heroes.
- Hero descendants and media must be shrinkable (`min-width: 0`, `max-width: 100%`). A `.rd-bleed` section must not introduce document-level horizontal scrolling; keep the viewport clipped at the root and never size hero media from intrinsic image width.
- Hero surface backgrounds span the viewport; all hero content is nested in the shared width-constrained `Container`. For split desktop heroes, use a flexible copy column and a bounded media column with a single gap. Do not combine percentage widths that total 100% with a nonzero gap, and remove auto margins from flex children at desktop breakpoints.

### Gestalt rules — system-wide design contract

Apply Gestalt principles to every route, component and responsive state, not only editorial pages:

- **Proximity:** keep labels, values, controls and helper text close to the element they explain. Use spacing to show relatedness; separate unrelated tasks with larger gaps.
- **Similarity:** repeated actions, cards, section headings, form controls and navigation affordances share visual treatment and behavior. Differences must communicate a meaningful state or role.
- **Common region:** group content only when it belongs together. A card, panel or hero surface must enclose one coherent task or story; avoid decorative containers around unrelated content.
- **Alignment and continuity:** use shared container edges, baselines and grid tracks to create predictable reading paths. Align page heroes, section headings and content across routes.
- **Figure–ground:** preserve strong contrast between primary content and its surface. Artwork remains the focal figure; decoration, metadata and controls must not compete with it.
- **Closure:** use borders, backgrounds and whitespace only where they clarify a complete group. Do not stack multiple borders around the same content.
- **Prägnanz (good form):** prefer the simplest coherent composition that communicates the task. Remove redundant labels, repeated headings, ornamental clutter and competing visual patterns.
- **Hierarchy:** establish one dominant page title, then section titles, supporting copy and actions. Use scale, weight, contrast and whitespace consistently rather than adding more boxes.

Review every screen at mobile, tablet and desktop widths and in both LTR and RTL. Gestalt is an evaluation method, not a reason to force symmetry or identical layouts where tasks differ.

### Discovery hero and breadcrumb contract

- All public discovery routes use the shared `UnifiedHero`: homepage, artwork discovery, artist directory/profile, artwork detail and collection index/detail.
- Keep the same hero anatomy, content measure, typography scale, spacing, surface, action treatment and responsive stacking. Use the shared radial-accent and layered-gradient background with its low-contrast grid texture; do not add the removed title-square motif or route-specific decorative geometry.
- Breadcrumbs belong only to public discovery routes and must sit at the top of that route's first hero, before the eyebrow/title. Do not render a separate breadcrumb row above or below the hero.
- The homepage is the root destination and does not need a redundant breadcrumb. Dashboards, admin tools, artist/buyer workspaces, settings, messaging and other task-oriented workspace screens must not show breadcrumbs.
- A breadcrumb trail contains navigable ancestors and one current-page item. Use localized labels, semantic `nav`/ordered-list markup and `aria-current="page"`.
- Keep discovery hero text, breadcrumbs, actions and media inside the shared `Container`. Decorative geometry is non-interactive and must not reduce contrast, obscure artwork or create overflow.
- Use `PageHeader` / `WorkspaceHero` for workspace and task pages when appropriate; do not pass discovery breadcrumbs into them.

## Accessibility and localization

### Accessible controls, form states, dialogs, menus, notifications

Use the shared Radix-backed primitives for controls and overlays where they fit. Every form control needs a programmatic label, associated help/error text where applicable, visible keyboard focus, and a clear disabled or busy state. Dialogs and menus must preserve keyboard navigation and their expected Escape/outside-dismiss behavior. Notifications and asynchronous updates should use concise, appropriately scoped live announcements rather than making entire interactive regions live.

- Prefer semantic HTML and native platform behavior.
- Provide meaningful names, labels, focus states and keyboard interactions.
- Maintain sufficient contrast and do not communicate meaning through color alone.
- Respect reduced-motion preferences.
- The document root is the single owner of language and direction. `LanguageProvider` persists the `fa` / `en` preference and updates `<html lang dir>` without changing the current route; do not add `dir="rtl"` to individual components.
- Keep inline `dir="ltr"` or `dir="auto"` only for technical identifiers, URLs and mixed-direction user content when needed. Prefer logical alignment, spacing, inset and border utilities so layouts adapt to both directions.
- English UI labels must use the shared translation dictionary. Artist names, artwork titles, biographies and other API/user-authored content remain in their source language unless the API provides localized values.
- Test both locales for navigation, date/number formatting, mixed Persian/Latin content and responsive layout.
- Treat WCAG guidance as a design and evaluation reference; describe the actual scope of any conformance assessment accurately.

## Responsive and installable experiences

Design for the devices and usage context relevant to the feature. If installability or offline behavior is requested, inspect the manifest, icons, service worker, lifecycle, storage and network behavior before making implementation claims. Protect private workspace and messaging data when considering caching or offline support.

## Messaging experience

The application currently has buyer–artist messaging. Inspect the current conversation identity, list/history, composer, contextual artwork, permissions, synchronization, attachments and safety flows before changing it. Avoid accidental duplicate destinations or data-contract changes. These are considerations for informed design, not a prohibition on user-requested redesign.

## Implementation references

- Application routes: resources/js/app/AppRouter.jsx
- Workspace navigation: resources/js/app/workspaceNavigation.js
- Shared UI: resources/js/components/ui/
- Global styles and tokens: resources/css/app.css

Verify these paths and their current contents before relying on them.


## Component architecture and consistency contract

The application uses a layered component model. Page files compose user journeys; they should not redefine the visual implementation of common controls.

### Ownership

- `resources/js/components/ui/primitives.jsx`: low-level, accessible controls such as `Button`, `IconButton`, `FormField`, `TextInput`, `TextareaField`, `FileInput`, `SelectField` and `Checkbox`.
- `resources/js/components/ui/layout.jsx`: page containers, section structure and layout primitives.
- `resources/js/components/ui/navigation.jsx`: tabs, menus and navigation primitives.
- `resources/js/components/ui/feedback.jsx`: alerts, empty states, errors, success feedback and status presentation.
- `resources/js/components/ui/cards.jsx`: reusable artwork, artist and collection presentation.
- `resources/js/components/ui/index.js`: the public export surface. App pages should import shared UI from this barrel rather than reach into implementation files.
- `resources/js/app/`: route-level page composition and feature orchestration. Extract a domain component only when it is reused or has a coherent independent responsibility; do not move API orchestration into generic UI primitives.

### Non-negotiable form contract

- Use `FormField` for visible labels, required indicators, help text and validation feedback.
- Use `TextInput`, `TextareaField`, `SelectField`, `Checkbox` and `FileInput` for their matching controls. Do not add page-local control-class constants for ordinary form controls.
- Shared controls own baseline height, typography, border, background, focus, disabled and invalid states. Pages may pass a small layout or semantic variant through `className`; they must not restyle the full control from scratch.
- Keep native file inputs encapsulated in `FileInput`, including visually-hidden attachment pickers.
- Use `Button` for actions and `IconButton` for icon-only actions. Always set the intended button type explicitly in forms.
- Preserve native semantic elements when no shared component adds value (for example, headings, paragraphs, tables, lists, and form/landmark elements).
- Shared controls must forward refs when consumers need focus management, support controlled and uncontrolled usage where appropriate, and preserve native input attributes.

### Section rhythm and headings

- Separate major page sections with generous, consistent vertical breathing room. Use the shared `SectionHeader` for a compact editorial heading: a short accent marker, concise title, optional supporting line and a quiet bottom rule. Avoid large banners or repeated decorative framing for ordinary sections. The `Section` primitive owns major-section spacing through the semantic `py-section sm:py-section-wide` utilities. Semantic spacing tiers distinguish page padding/top offsets, compact/regular/relaxed sections, content groups, related items, component internals and workspace density while resolving through the same canonical 4px scale. `Container` owns width and gutters only; it never adds implicit vertical padding. Workspace route shells are full-width and add no content gutters or top padding. Each nested `Container` owns the same responsive page gutters as discovery pages.
- Keep spacing inside cards and between related controls tighter than spacing between major sections. Do not compensate for section rhythm with extra borders or decorative separators.

### Card and surface contract

- Use the shared `Card` for coherent information groups, dashboard metrics, editorial steps, featured people and grouped controls. A card uses a complete one-pixel boundary and a semantic surface; keep all corners square and avoid `border-y` plus transparent backgrounds for objects that should read as cards.
- Use proximity and spacing inside a card before adding nested borders. Use `border-divider-nested` only for true internal separation.
- Interactive cards need one clear hit target, visible keyboard focus and a hover state that does not depend on color alone. Keep action links/buttons semantically distinct when a card contains multiple actions.
- Square geometry is owned by `--rd-radius-0` and Tailwind's border-radius theme mapping. Do not add global `*` selectors, `!important`, or component-level radius overrides. Shared components should omit radius utilities; legacy utilities resolve to the zero token during migration.

### Review and migration rules

Before adding or changing a control, search the shared UI barrel and reuse the closest component. When a repeated pattern has materially different semantics, add an explicit variant to the shared component rather than creating a one-off page implementation. Review all route-level screens for raw interactive controls, duplicated Tailwind strings, inconsistent labels, focus treatment, and error handling. Exceptions must be intentional and documented (for example, a custom canvas editor or a specialized native browser interaction).

## Section-owned content width and full-bleed composition

The public route-level `<main>` and workspace `.rd-page-frame` are content canvases, not content-width containers. The workspace shell may place a navigation rail beside the main column; `Section bleed` expands a section background to the viewport and keeps its inner container aligned with that column. Each section owns its own background and content width. The wide `Container` variant does not need a `rd-container--wide` modifier; width is expressed by the container's width utilities and gutters are supplied by the shared `.rd-container` contract.

- Use the canonical `Container` from `resources/js/components/ui/layout.jsx`; `PageContainer` is a compatibility alias for existing imports only.
- Use `Section bleed` for full-viewport backgrounds when a section is nested in a workspace column; its inner wide/reading `Container` is offset to align with the workspace content grid.
- `width="wide"` provides the standard centered content measure and page gutters.
- `width="reading"` provides the long-form reading measure and the same page gutters.
- `width="full"` provides edge-to-edge content without a max-width or automatic gutters.
- Put full-width backgrounds on the outer `<section>`; put aligned content inside `<Container width="wide">`.
- Do not recreate content widths with route-specific `max-w-*`, `mx-auto` and `px-*` combinations when the shared Container expresses the intended role.
- Public and workspace shells may differ in navigation chrome, but ordinary section content must use the same width tokens and alignment conventions.
- Keep messaging, editors and media viewers as explicit immersive exceptions.

```jsx
<section className="w-full bg-surface-muted py-12">
    <Container width="wide">
        {/* Section content */}
    </Container>
</section>
```


## Complete-overhaul visual language

The current overhaul uses an art-journal/editorial direction rather than a generic SaaS dashboard. Apply these rules consistently across public pages, artist/buyer workspaces, administration, messaging, loading states and overlays:

- **Artwork is the primary visual content.** Give images generous space, use a consistent 3:4 portrait frame throughout discovery, detail, studio and administration views. Keep a passepartout around the media and use `object-cover` inside that frame; never distort the source image.
- **Use typography and composition for hierarchy.** Prefer strong page titles, concise eyebrow labels, generous vertical rhythm, clear metadata groupings and deliberate asymmetry over piles of cards.
- **Reduce unnecessary containers.** Use open layouts, dividers, tonal sections and border-led groupings. Reserve filled/raised surfaces for a real interaction or information grouping; do not wrap every item in a card.
- **Keep geometry consistent.** All elements, controls, media frames, cards, overlays and decorative shapes use zero corner radius. Express hierarchy through spacing, border tint, surface and typography—not rounded silhouettes.

- **Use a tonal, one-pixel rule hierarchy.** Every structural border and separator uses the same 1px thickness; communicate importance only through color tint. Page/major-section boundaries use `--rd-divider-section`; boundaries between peer groups and cards use the lighter `--rd-divider-group`; separators between items or subgroups inside a group use the lightest `--rd-divider-nested`. Keep the hierarchy consistent from top to bottom: a nested rule must never visually outweigh the boundary of its parent group. The tokens adapt with the active theme.
- **Apply Gestalt grouping deliberately.** Use proximity before drawing a line: related labels, values, controls and metadata should read as one unit through spacing and alignment. Use similarity for repeated controls and cards; use common region only when content truly belongs together. Reserve section rules for changes of subject, group rules for peer clusters, and nested rules for subdivisions. Avoid stacking a card border, inner border and divider around the same content; whitespace and alignment should do most of the grouping.
- **Keep line geometry invariant.** Borders and separators share the `--rd-line-width` token (1px). Do not make an important boundary thicker; change only its semantic tint. Avoid high-contrast default outlines around nested content.
- **Use semantic color roles.** Terracotta is the primary accent, ink anchors high-contrast editorial regions, and olive/success/warning/danger are reserved for meaning. Verify both explicit themes and system theme.
- **Keep interaction feedback precise.** Hover and focus should reveal affordance without shifting content unexpectedly. Motion is restrained and must respect reduced-motion preferences.
- **Loading states mirror the final composition.** Skeletons must match the page's geometry, tonal regions, spacing and content density; a generic placeholder with different geometry is not an acceptable substitute for a bespoke page frame.
- **Preserve responsive intent.** A mobile layout may change ordering, density, navigation and controls, but must retain the same information and actions without horizontal overflow.
- **Maintain bidirectional correctness.** Use logical spacing and borders where possible. Apply `dir="auto"` or explicit LTR treatment to user-provided Latin names, URLs, identifiers and mixed-direction content where needed.

The complete route-by-route, state-by-state and quality-gate ledger is maintained in `AI/COMPLETE-APPLICATION-OVERHAUL.md`. Treat it as the coverage source of truth; this section defines the visual grammar, not a claim that every route has already passed review.


## Unified section and hero spacing

- All full-width hero variants render through `UnifiedHero`; page and workspace headers are thin wrappers around that primitive.
- Hero surfaces use the theme-aware gradient and low-contrast grid texture. Do not add the removed title-backed square motif. Keep colors theme-token driven and expose surface variants through the shared hero primitive.
- Semantic sections share the `--rd-layout-section` / `--rd-layout-section-wide` vertical rhythm. A section should own its spacing once: do not combine global section padding with an additional equivalent `py-section` utility.
- Nested sections should use group spacing or explicit compact spacing rather than stacking full section padding.
- Chat shells are dense application workspaces and must not inherit public-content section padding.
- The homepage hero occupies the available viewport between the global header and mobile bottom navigation; desktop height accounts for the header only.


## Hero surface and discovery section rhythm

- The shared `.rd-hero-surface` combines the theme-aware radial/linear color surface with a low-contrast grid. The title has no decorative square backdrop. The grid is a structural layer owned by `UnifiedHero`, not route-level markup.
- A hero or section owns vertical spacing exactly once. `.rd-unified-hero` uses its inner Container for vertical padding; the outer hero section has no additional block padding. `PageHeader`, `WorkspaceHero` and `DiscoveryHero` use the same full-bleed frame; hero content and following sections align to the same content width and responsive gutters. Workspace shells remain full-width with no outer max-width, gutter or top padding. Page heroes sit outside the content Container; `rd-workspace-content` owns the section's vertical padding and inter-group rhythm while its direct child sections remain padding-free. Keep custom vertical padding off those nested sections.
- Discovery result headings, result grids, pagination or load-more controls belong to one semantic results section. Do not separate pagination from the result set it controls.
- Homepage featured artwork uses a fixed 3:4 portrait frame at every breakpoint. Responsive layout may change its width, never its aspect ratio.

- The artwork archive reports both the total available artworks and the currently loaded result count alongside its load-more pagination control.
