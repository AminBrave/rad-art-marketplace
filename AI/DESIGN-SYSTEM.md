# Rademan — current design system

This document describes the visual foundations and shared UI implementation currently in the repository. The source code is authoritative; update this reference when tokens, component ownership or shared patterns change.

## Design principles

- Keep artwork and artist content central to discovery.
- Use clear hierarchy, purposeful whitespace and restrained surfaces; avoid decorative containers that do not clarify relationships.
- Keep public discovery and authenticated workspaces visually coherent while supporting their different tasks and navigation.
- Make loading, empty, error, permission, disabled, busy and success states understandable.
- Design for Persian RTL, English LTR and mixed-direction content.
- Support responsive layouts, keyboard interaction, visible focus and reduced motion.
- Preserve meaning and legibility in both light and dark themes.

## Token source and layers

Canonical source: `resources/css/tokens.css`. It is imported by `resources/css/app.css`; `tailwind.config.js` maps utilities to the CSS variables.

The token file has three layers:

1. **Primitives:** brand anchors, typography, spacing and geometry.
2. **Semantic roles:** canvas/surfaces, text, borders/dividers, actions, focus and status colors.
3. **Component tokens:** named recipes such as editorial heroes, skeletons, messaging surfaces, focus-ring geometry and media ratios.

Use semantic `--rd-*` variables in components. Do not add raw palette values or create a second token source in Tailwind. Legacy variables in `tokens.css` are compatibility aliases; do not add new consumers.

Current brand anchors are Ivory `#F7F5F0`, Charcoal `#242320`, Terracotta `#A64F31`, Sand `#D8C9B7` and Olive `#536052`. Semantic roles adapt for explicit dark mode and system dark preference.

## Media

- Artwork frame ratio: 3:4 (`--rd-artwork-ratio`, Tailwind `aspect-artwork`).
- Portrait frame ratio: 4:5 (`--rd-portrait-ratio`, Tailwind `aspect-portrait`).
- Use `object-contain` when the full artwork composition must remain visible.
- Use `object-cover` only when cropping is intentional, such as portrait avatars or ambient/editorial imagery.
- Reserve the final frame geometry in loading and unavailable-image states.

## Shared UI ownership

Generic UI is owned by `resources/js/shared/ui/`; import through `resources/js/shared/ui/index.js`.

The public entry point currently exports:

- **Controls:** Button, IconButton, Badge, TextInput, TextareaField, FileInput, SelectField and Checkbox.
- **Forms:** FormField and SearchField.
- **Compositions:** PageContainer, PageHeader, SectionHeader, Surface, StatusBadge, WorkspaceHero and DashboardMetricCard.
- **Navigation:** tabs, dropdown menus, breadcrumbs and pagination.
- **Overlays:** Dialog, AlertDialog and Tooltip.
- **Feedback:** Skeleton, EmptyState, ErrorState, SuccessState, PermissionState, UploadFeedback and Toast.
- **Layout/content:** Container, Section, Box, Flex, Grid, Card, Callout, Separator, Avatar, Table, DataList and related semantic primitives.
- **Brand:** BrandLogo.

Check the live public export before relying on a component name or adding another shared abstraction. Domain-specific cards and workflow components belong to their owning feature, not shared UI. `resources/js/components/ui/` is a deprecated compatibility facade; new code should not import from it.

## Composition and interaction

- Prefer semantic HTML for headings, paragraphs, lists, tables and landmarks.
- Use shared controls for common actions and form inputs; keep labels, help and validation feedback associated with the control.
- Set button types explicitly in forms.
- Use composition and a small number of meaningful variants rather than many unrelated boolean props.
- Keep keyboard focus visible. Dialogs and menus must preserve expected keyboard and focus behavior.
- Use logical CSS properties and direction-neutral layout so RTL and LTR both work.
- Do not communicate status by color alone.
- Respect reduced-motion preferences and avoid unnecessary animation.

## Gestalt in practice

- **Proximity:** group related metadata and form labels/errors.
- **Similarity:** repeat visual treatments only when elements share meaning.
- **Common region:** frame true groups such as dialogs; do not card-wrap every section.
- **Continuity:** align page headers and content to shared layout guides.
- **Figure-ground:** preserve focus on artwork and primary tasks.
- **Closure:** use spacing and selective dividers before adding full borders.
- **Prägnanz:** remove redundant borders, labels and decoration.

## Verification

For affected UI, check the relevant Persian RTL and English LTR states, mixed-direction text, light/dark/system themes, responsive widths, keyboard/focus behavior, loading/error/empty states and reduced motion. Record manual/browser/accessibility checks separately from lint, static architecture checks and production builds.
