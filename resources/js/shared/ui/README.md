# Shared UI component contract

`resources/js/shared/ui/index.js` is the public import surface for domain-independent UI. Import generic UI from `../../shared/ui` (or the equivalent relative path); do not import new code through the deprecated `resources/js/components/ui` compatibility facade.

## Layers and ownership

- **Controls — `controls.jsx`:** low-level actions and inputs. Controls own native semantics, forwarded refs where focus management needs them, disabled/busy/invalid states, keyboard focus visibility and baseline visual treatment.
- **Forms — `forms.jsx`:** `FormField` and `SearchField` compose controls with labels, hints, errors and submit behavior. A page should pass content and behavior, not rebuild the control chrome.
- **Compositions — `compositions.jsx`:** reusable page and information patterns such as `PageHeader`, `SectionHeader`, `WorkspaceHero`, `DashboardMetricCard`, `Surface` and `StatusBadge`. They remain domain-independent.
- **Layout — `layout.jsx`:** semantic layout, typography, media framing, data display and structural primitives.
- **Navigation — `navigation.jsx`:** tabs, menus, breadcrumbs and pagination.
- **Feedback — `feedback.jsx` and `skeletons.jsx`:** generic loading, empty, error, success, permission, upload and toast feedback.
- **Overlays — `Dialog.jsx`, `AlertDialog.jsx`, `Tooltip.jsx`:** accessible overlay/trigger contracts built on Radix.
- **Brand — `BrandLogo.jsx`:** shared identity presentation.
- **Features:** artwork/artist cards and route/workflow-specific skeletons belong to their owning feature, not shared UI. Cross-feature reuse must use a feature's public `index.js` entry point.

## Component API rules

1. Prefer semantic HTML and preserve native attributes. Use buttons for actions and links for navigation; do not turn a non-interactive container into a control.
2. Use explicit, finite variants and sizes for visual differences. Avoid unrelated boolean props and page-local copies of shared control styles.
3. Controlled and uncontrolled behavior should be supported where it is meaningful. Callbacks should preserve familiar native event contracts unless the component documents otherwise.
4. Forward refs for controls that consumers may need to focus or measure.
5. Expose disabled, busy, invalid and selected states through native attributes or ARIA as appropriate; do not rely on color alone.
6. Provide accessible names and programmatic label/help/error associations. Icon-only actions require a label.
7. Preserve keyboard behavior and visible focus. Radix-backed dialogs and menus should retain expected arrow-key, Escape and focus-return behavior.
8. Use logical CSS properties and shared locale/theme contracts. Components must not set document direction; the locale provider owns the root `lang` and `dir`.
9. Keep motion restrained and respect reduced-motion preferences.
10. Avoid adding domain knowledge, API calls or feature imports to shared UI.

## Composition and Gestalt guidance

- **Proximity:** group labels with controls and artwork metadata with the image before adding dividers.
- **Similarity:** keep equivalent controls, states and actions visually consistent.
- **Common region:** use a surface/card only when it clarifies a meaningful information group.
- **Continuity:** maintain a clear reading and navigation path through page headings and sections.
- **Figure-ground:** keep the focal content legible with semantic contrast roles in both themes.
- **Closure:** use restrained borders and tonal grouping; avoid nested boxes around the same content.
- **Prägnanz:** prefer the simplest composition that communicates the task and hierarchy.

## Surface and geometry contract

- The current product direction intentionally uses square geometry. Tailwind's legacy radius utilities map to `--rd-radius-0` for compatibility; new components should omit radius utilities rather than encode rounded variants.
- Use `Card` only for a coherent information group. Prefer whitespace and alignment over wrapping every section in a card.
- Use semantic border/divider tokens and keep the one-pixel hierarchy consistent.
- Keep page loading skeletons structurally aligned with the owning page/feature; generic shared skeletons are not substitutes for a page-specific composition.

## Compatibility

`resources/js/components/ui/` remains a temporary re-export facade so existing imports continue to resolve. New code should import from `shared/ui` and feature-owned components from the relevant feature entry point. Remove the facade only after a later migration confirms there are no remaining callers.
