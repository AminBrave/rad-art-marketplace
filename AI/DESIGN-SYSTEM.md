# Rademan — design and experience guidance

This document describes useful design principles and the current product context. It is guidance, not a fixed specification. The user's latest direction can change the information architecture, visual language, interaction model, platform priorities or design system.

## Current UI catalogue

The implementation-level component and pattern inventory is maintained in [`AI/DESIGN-SYSTEM-CATALOGUE.md`](./DESIGN-SYSTEM-CATALOGUE.md). Use that catalogue alongside this principles document and the [complete application overhaul ledger](./COMPLETE-APPLICATION-OVERHAUL.md). The catalogue records current code behavior and known gaps; it does not imply visual QA completion.

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

CSS `--rd-*` variables are the canonical design-token source; Tailwind maps directly to them. Legacy `--color-*`, `--text-*`, `--space-*` and related aliases are one-way compatibility bridges and should not be used by new code. Choose semantic tokens, typography, spacing, grids, radii, elevation, icons and motion to support the design. Reuse current components when they fit; refactor or replace them when that produces a better result. Do not follow the legacy RAD catalogue as a specification.

## Accessibility and localization

### Accessible controls, form states, dialogs, menus, notifications

Use the shared Radix-backed primitives for controls and overlays where they fit. Every form control needs a programmatic label, associated help/error text where applicable, visible keyboard focus, and a clear disabled or busy state. Dialogs and menus must preserve keyboard navigation and their expected Escape/outside-dismiss behavior. Notifications and asynchronous updates should use concise, appropriately scoped live announcements rather than making entire interactive regions live.

- Prefer semantic HTML and native platform behavior.
- Provide meaningful names, labels, focus states and keyboard interactions.
- Maintain sufficient contrast and do not communicate meaning through color alone.
- Respect reduced-motion preferences.
- Test RTL direction, mixed Persian/Latin text, numbers, punctuation and alignment where relevant.
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

### Review and migration rules

Before adding or changing a control, search the shared UI barrel and reuse the closest component. When a repeated pattern has materially different semantics, add an explicit variant to the shared component rather than creating a one-off page implementation. Review all route-level screens for raw interactive controls, duplicated Tailwind strings, inconsistent labels, focus treatment, and error handling. Exceptions must be intentional and documented (for example, a custom canvas editor or a specialized native browser interaction).

## Section-owned content width and full-bleed composition

The route-level `<main>` is a full-width canvas. It must not own the content maximum width, centering margin or horizontal page gutters. Each section owns its own background and content width.

- Use the canonical `Container` from `resources/js/components/ui/layout.jsx`; `PageContainer` is a compatibility alias for existing imports only.
- Use `Section bleed` for full-viewport backgrounds when a section is nested in a constrained workspace column; its inner `Container` keeps content aligned to the workspace grid.
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

The current overhaul uses an art-journal/editorial direction rather than a generic rounded SaaS dashboard. Apply these rules consistently across public pages, artist/buyer workspaces, administration, messaging, loading states and overlays:

- **Artwork is the primary visual content.** Give images generous space, preserve their full composition with `object-contain` where the work itself is the subject, and use cropping only when the image's role is editorial/ambient. Never distort artwork to fill a frame.
- **Use typography and composition for hierarchy.** Prefer strong page titles, concise eyebrow labels, generous vertical rhythm, clear metadata groupings and deliberate asymmetry over piles of cards.
- **Reduce unnecessary containers.** Use open layouts, dividers, tonal sections and border-led groupings. Reserve filled/raised surfaces for a real interaction or information grouping; do not wrap every item in a card.
- **Keep shapes disciplined.** Favor square or subtly rounded editorial frames. Use pill shapes only when the meaning is status, count, avatar, or a genuinely compact control.

- **Use a tonal, one-pixel rule hierarchy.** Every structural border and separator uses the same 1px thickness; communicate importance only through color tint. Page/major-section boundaries use `--rd-divider-section`; boundaries between peer groups and cards use the lighter `--rd-divider-group`; separators between items or subgroups inside a group use the lightest `--rd-divider-nested`. Keep the hierarchy consistent from top to bottom: a nested rule must never visually outweigh the boundary of its parent group. The tokens adapt with the active theme.
- **Apply Gestalt grouping deliberately.** Use proximity before drawing a line: related labels, values, controls and metadata should read as one unit through spacing and alignment. Use similarity for repeated controls and cards; use common region only when content truly belongs together. Reserve section rules for changes of subject, group rules for peer clusters, and nested rules for subdivisions. Avoid stacking a card border, inner border and divider around the same content; whitespace and alignment should do most of the grouping.
- **Keep line geometry invariant.** Borders and separators share the `--rd-line-width` token (1px). Do not make an important boundary thicker; change only its semantic tint. Avoid high-contrast default outlines around nested content.
- **Use semantic color roles.** Terracotta is the primary accent, ink anchors high-contrast editorial regions, and olive/success/warning/danger are reserved for meaning. Verify both explicit themes and system theme.
- **Keep interaction feedback precise.** Hover and focus should reveal affordance without shifting content unexpectedly. Motion is restrained and must respect reduced-motion preferences.
- **Loading states mirror the final composition.** Skeletons must match the page's geometry, tonal regions, spacing and content density; a rounded generic placeholder is not an acceptable substitute for a bespoke page frame.
- **Preserve responsive intent.** A mobile layout may change ordering, density, navigation and controls, but must retain the same information and actions without horizontal overflow.
- **Maintain bidirectional correctness.** Use logical spacing and borders where possible. Apply `dir="auto"` or explicit LTR treatment to user-provided Latin names, URLs, identifiers and mixed-direction content where needed.

The complete route-by-route, state-by-state and quality-gate ledger is maintained in `AI/COMPLETE-APPLICATION-OVERHAUL.md`. Treat it as the coverage source of truth; this section defines the visual grammar, not a claim that every route has already passed review.
