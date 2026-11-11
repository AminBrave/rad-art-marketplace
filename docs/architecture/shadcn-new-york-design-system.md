# Rad Art — shadcn/ui New York Design System

## Decision and intent

This is a product-wide UI system adoption, not a palette toggle. The New York style is the primary visual and component reference for all public, authentication, artist, buyer, messaging, moderation and admin interfaces. The implementation remains a locally owned component system: shadcn/ui distributes editable component source; it is not a runtime component package.

Keep the existing Laravel 13 + React 18 + Vite + Tailwind CSS 3.4 stack, API contracts, route behavior, authorization boundaries, and domain data contracts. Do not migrate to Next.js, change backend behavior, or copy demo data into production screens.

## Official documentation used as design authority

The implementation should follow the current official documentation by topic, not blindly import every component or every framework-specific example:

- Introduction and philosophy: open code, composition, predictable APIs, local ownership.
- New York style: `components.json` style metadata and component visual language.
- Theming: semantic CSS variables, light/dark token pairs, radius scale, component-level tokens.
- Components: anatomy, composition, variants, controlled/uncontrolled state, keyboard interaction, disabled/invalid states and API references.
- Forms: Field composition, labels, descriptions, validation feedback, schema validation and accessible error presentation. Retain existing server-side Laravel validation as authoritative.
- RTL: logical spacing/positioning, direction-aware overlays and navigation, Persian text, keyboard behavior and icon direction.
- Blocks: page composition patterns for dashboards, sidebars, authentication and data-heavy workspaces.
- Data tables and charts: task-specific composition, sorting/filtering/pagination and responsive data presentation.
- Typography: consistent semantic hierarchy and readable content rhythm.

Official references:
- https://ui.shadcn.com/docs
- https://ui.shadcn.com/docs/components
- https://ui.shadcn.com/docs/theming
- https://ui.shadcn.com/docs/forms
- https://ui.shadcn.com/docs/rtl
- https://ui.shadcn.com/blocks
- https://ui.shadcn.com/docs/components/aria/data-table

The repository currently uses the classic `new-york` style with Radix primitives. The current RTL guide notes that automatic CLI RTL migration applies to newer styles, not classic New York. Therefore classic New York components must be reviewed and adapted manually with logical CSS properties, explicit portal direction and RTL browser tests. Do not set an RTL config flag and assume the existing component source was transformed.

## Implementation status

The current adoption branch applies the New York semantic language across the route tree and shared shells. This section records what is implemented so the design inventory is not confused with a claim that every component published by shadcn is installed.

### Foundations and runtime

- `components.json` uses `style: new-york`, Stone base color, CSS variables and the project's existing aliases.
- Tailwind maps background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart and sidebar roles to semantic CSS variables.
- Light and dark New York token sets share the same roles; the radius scale is derived from `--radius`.
- New York supports light/dark preference persistence and system preference at first paint. Editorial remains a compatibility theme; the color-scheme control is scoped to New York.
- Existing page utility aliases are mapped to semantic roles during migration, rather than preserving a separate Editorial component API.

### Locally owned component source

Implemented reusable components and compositions include:

- **Foundations:** Button variants/sizes/loading/full-width, ButtonGroup, Badge, Card anatomy and action slot, Separator, Skeleton, Avatar, AspectRatio, Spinner, Kbd, Progress and Toggle.
- **Forms:** FieldSet, FieldLegend, FieldGroup, Field, FieldLabel, FieldDescription, FieldError, FieldSeparator, Input, InputGroup, Textarea, NativeSelect, Checkbox, Radio, controlled RadioGroup and Switch.
- **Navigation:** Tabs, Breadcrumbs, Pagination, DropdownMenu and Sidebar anatomy.
- **Overlays and feedback:** Dialog composition, Alert, EmptyState, ErrorState, SuccessState, PermissionState, Toast and upload progress feedback.
- **Data/domain:** semantic Table anatomy, artwork card, artist card and their loading skeletons.

These are local React 18 components using the installed Radix Dialog, DropdownMenu and Tabs primitives where appropriate. The design system follows shadcn's open-code philosophy: components are owned and edited in this repository.

### Route and page adoption

The New York semantic system and shared patterns have been applied to the public shell and homepage, artwork catalogue/detail, artist directory/profile, collections and public information, login/register, artist workspace and artwork studio, buyer workspace, direct messaging, inquiry screens, admin dashboard/user management/moderation/reporting, notification surfaces and route/loading/error states.

Domain-specific artwork and artist compositions retain their marketplace information architecture; they use shared Card, Badge, Button, Field, Table and feedback patterns instead of being forced into generic dashboard blocks.

### Intentional omissions

The design inventory is a coverage map, not an instruction to install every available shadcn component. Calendar/Date Picker, Input OTP, charting, carousel, resizable panels, command palette, combobox, menubar, context menu, tooltip, drawer/sheet and hover card are not installed because current Rad Art workflows do not require them. Add one when a real route needs it, with the matching official API and tests; do not ship unused dependencies.

### Verification

The browser suite includes saved light/dark preference, live color-scheme switching, semantic token availability, New York authentication field rendering and a 320px overflow sweep across public routes. Final status is determined by the CI run on this exact PR head, not by earlier theme-only CI results.

## Design principles

1. New York is the component language, not merely a color theme: compact controls, clear borders, restrained radius, precise spacing, deliberate elevation, clear focus states and consistent composition.
2. Use semantic roles rather than raw colors: background/foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring and sidebar tokens.
3. Define light and dark modes as complete semantic token sets. Dark mode is not an inverted light palette.
4. Use one shared component API across all pages. Theme and page code must not fork component behavior.
5. Keep the art itself visually dominant. Marketplace-specific artwork and artist cards are domain compositions built from shared primitives, not generic dashboard cards.
6. Persian-first and RTL by default; mixed Latin metadata remains legible and explicitly direction-scoped.
7. Responsive, keyboard accessible, reduced-motion aware, and consistent across loading, empty, error, success, disabled and invalid states.
8. Preserve business logic, endpoint payloads, form names, validation messages, permissions and navigation semantics while changing presentation.

## Component system inventory

### Foundations
- Semantic color roles with light/dark values and contrast checks.
- Radius scale derived from one `--radius` source token.
- Typography roles, line heights, font stacks and numeric/Latin direction rules.
- Spacing, content widths, breakpoints, elevation, motion and focus tokens.
- Surface and overlay layering contract.
- RTL and LTR behavior contract.

### Primitives
Button, Button Group, Badge, Avatar, Card, Separator, Skeleton, Spinner, Kbd, Typography, Aspect Ratio.

### Form controls
Field, Label, Input, Input Group, Textarea, Select, Native Select, Checkbox, Radio Group, Switch, Slider, Calendar, Date Picker, Input OTP, Combobox, Form validation messages.

### Navigation and commands
Breadcrumb, Tabs, Pagination, Menubar, Navigation Menu, Dropdown Menu, Context Menu, Command / Command Dialog, Sidebar, Collapsible, Toggle, Toggle Group.

### Overlays and feedback
Dialog, Alert Dialog, Drawer, Sheet, Popover, Hover Card, Tooltip, Toast/Sonner, Alert, Progress, Empty, Loading, Error and Permission states.

### Data and media
Table, Data Table composition, Chart composition, Carousel, Scroll Area, Resizable panels, artwork/media preview and upload feedback.

Only components that serve an evidenced product workflow should be installed and maintained. The inventory is the coverage map, not a mandate to add unused dependencies.

## Page-level patterns for Rad Art

- Public shell: responsive header, discovery navigation, search entry, account actions, footer.
- Discovery: page header, search/filter toolbar, filter chips, responsive artwork grid, sorting, pagination, empty/loading/error states.
- Artwork detail: media-first composition, metadata, artist attribution, contact action, related work.
- Artist profile: identity header, biography, portfolio grid, contact affordance.
- Authentication: focused form layout, Field patterns, inline validation, pending/disabled states.
- Workspace shell: responsive sidebar/navigation, sticky page header, breadcrumbs, account menu, mobile navigation.
- Workspace overview: metric/summary cards only where metrics exist, recent activity and task-oriented sections.
- Artwork studio: sectioned form, upload dropzone/preview/progress, validation summary and explicit save/publish states.
- Messaging: conversation list/detail split layout, message scroller, composer, attachment and moderation states; preserve privacy and participant boundaries.
- Admin: data tables with search, filters, sorting, pagination, row actions, destructive confirmation and clear moderation status.

## Migration approach

1. Audit: inventory every route, page, shared component, direct native control, repeated pattern, and accessibility/RTL issue. Map each usage to a shadcn component or documented composition.
2. Foundations: replace ad-hoc theme tokens with a complete New York semantic token system; establish dark mode, radius, typography, spacing, overlay and RTL contracts.
3. Primitives: build canonical New York component source under `resources/js/components/ui`, preserving React 18 and current dependency compatibility. Add dependencies only with lockfile changes and compatibility review.
4. Domain compositions: rebuild ArtworkCard, ArtistCard, upload controls, messaging components, moderation controls and dashboard patterns on the canonical primitives.
5. Page migration: migrate public pages, authentication, artist/buyer workspaces, messaging, and admin/moderation. Remove old page-specific styling only after the replacement is verified.
6. Showcase and docs: make the design-system showcase a live catalogue of component variants, states, forms, overlays, tables, navigation, RTL/LTR and dark mode. Document contribution and usage conventions.
7. Verification: frontend unit/component semantics, ESLint, production Vite build, backend regression suite, Playwright across public and authenticated routes, RTL/LTR, dark/light, keyboard navigation and 320px/mobile/tablet/desktop breakpoints.

## Acceptance criteria

- New York is the default, complete design language across every frontend route.
- No route remains on a legacy visual language simply because it was not recolored.
- Reusable primitives expose documented, consistent props and composition APIs.
- Every implemented form uses consistent Field/Label/Description/Error composition and preserves server validation.
- Overlays and menus are portal-safe and direction-aware in RTL.
- All interactive controls expose keyboard/focus/disabled/invalid states.
- Light/dark tokens are complete and every page is readable in both.
- Public, artist, buyer, messaging and admin screens share the same component language while preserving their distinct information architecture.
- No API, authorization, domain workflow or persistence contract changes are introduced by the design migration.
- Tests cover critical component behavior, routes, RTL and responsive regressions.
- Documentation, components.json, dependency manifests and lockfiles agree with the implemented system.

## Compatibility and known constraints

- React 18, Vite 6 and Tailwind 3.4 are the current project constraints. Do not paste Tailwind v4-only configuration or React 19-only APIs from current docs without an explicit migration decision.
- Keep Radix UI as the classic New York primitive layer unless an individual component has a documented compatibility reason to use another primitive.
- Do not replace Vazirmatn/Inter without a separate typography decision.
- The theme preference mechanism is only one part of the adoption; use the component and route coverage above to assess the actual implementation.
- Do not claim all shadcn components are implemented: use the intentional-omissions list above, and add further components only when supported by a product workflow.
