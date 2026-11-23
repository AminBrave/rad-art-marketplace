# Rademan application component catalogue

This is the active component reference for the new Rademan application system. It replaces the previous RAD catalogue and its editorial-first assumptions.

## Architecture
1. **Tokens:** `resources/css/app.css` — colors, typography, spacing, shape, elevation, responsive dimensions and light/dark/system roles.
2. **Application presentation:** `resources/css/rademan.css` — responsive shell, page composition and semantic component slots.
3. **Shared primitives:** `resources/js/components/ui/` — behavior, accessibility and reusable React components.
4. **Domain surfaces:** artwork, artist, messaging, workspace and admin compositions.
5. **Routes:** `resources/js/app/AppRouter.jsx` — feature page assembly.

## Semantic UI slots
- `data-ui="button"`: primary, secondary, outline, ghost and destructive actions.
- `data-ui="icon-button"`: compact icon action with accessible label.
- `data-ui="badge"`: neutral, success, warning, danger, info and accent states.
- `data-ui="page-heading"` and `data-ui="section-heading"`: page hierarchy and section hierarchy.
- `data-ui="workspace-hero"`: task-oriented workspace introduction.
- `data-ui="surface"`, `data-ui="metric"`: shared information surfaces.
- `data-ui="form-field"`, `data-ui="input"`, `data-ui="textarea"`, `data-ui="select"`, `data-ui="checkbox"`: consistent form behavior and state.

## Layout primitives
`Box`, `Flex`, `Grid`, `Container`, `Section`, `Inset`, `Heading`, `Text`, `Avatar`, `Card`, `Callout`, `Progress`, `Spinner`, `Table` and `DataList` provide semantic layout and content composition.

## Domain cards
- `ArtworkCard`: artwork-first 4:5 media, artist identity, category, title and formatted price. Keeps the canonical artwork and artist destinations.
- `ArtistCard`: creator identity, location, concise bio and profile destination.
- Messaging cards and inbox rows remain domain components because they own conversation identity and action behavior.

## Interactive components
Radix primitives own keyboard behavior, focus management, dismissal and ARIA relationships for dialogs, menus, tabs, selects, checkboxes, tooltips and alert dialogs. Rademan owns presentation through semantic tokens and slots.

## Required behavior
- Preserve accessible labels, validation, helper text, errors, disabled and loading states.
- Support controlled and uncontrolled state where the underlying primitive allows it.
- Use logical CSS properties for RTL.
- Keep component APIs composable and free of page-specific business logic.
- Never create a second ad hoc theme system or hardcode palette values in feature screens.

## Reference implementation
- Tokens: `resources/css/app.css`
- Presentation: `resources/css/rademan.css`
- Tailwind aliases: `tailwind.config.js`
- Component exports: `resources/js/components/ui/index.js`
- Design tests: `tests/js/designSystem.test.js`, `tests/js/designSystemCoverage.test.js`, `tests/js/rademanDesignSystem.test.js`, `tests/js/pwaApplicationShell.test.js`
