# RAD Component Catalogue

**Status:** Canonical implementation contract  
**Audience:** Product design, frontend engineering, code-generation agents, reviewers  
**Scope:** Rademan web application  
**Implementation root:** `resources/js/components/ui/`  
**Visual source of truth:** `resources/css/app.css`, `tailwind.config.js`, and the RAD tokens documented in `AI/DESIGN-SYSTEM.md`

This document defines the component vocabulary and implementation rules for every new or revised interface in Rademan. It is intended to be used before writing page-level UI. The live catalogue at `/?design-system` must demonstrate the implemented components and their meaningful variants and states. Documentation must not claim a component is implemented until its wrapper, export, showcase example, and usage migration are present.

## 1. Non-negotiable architecture

### Radix owns interaction; RAD owns presentation

- Use **Radix Primitives** for supported interactive patterns: semantics, keyboard behaviour, roving focus, focus management, dismissal, portals, collision-aware positioning, controlled/uncontrolled state, and ARIA relationships.
- Use **RAD tokens and RAD wrappers** for every visual decision: color, typography, spacing, dimensions, borders, radii, elevation, animation, responsive behaviour, and RTL layout.
- Do not install or import `@radix-ui/themes`, its CSS, or its `Theme` provider. Do not use Radix Themes visual defaults.
- Do not introduce a second component styling system. Tailwind classes are allowed only when they resolve to RAD tokens or deliberate semantic layout utilities.
- Prefer semantic HTML for static content and native browser controls where they are the more appropriate accessible primitive. Radix is not a requirement for every HTML element.
- Do not reimplement an interaction already supplied by an applicable Radix primitive unless a documented platform constraint requires it.

### Component layering

1. **Foundation tokens:** CSS custom properties and Tailwind semantic aliases.
2. **RAD primitives:** project-owned wrappers in `resources/js/components/ui/`.
3. **Domain components:** artwork, artist, conversation, workspace and admin components composed from RAD primitives.
4. **Page composition:** routes and pages compose domain components; pages must not create new visual primitives ad hoc.

### Public API conventions

- Export supported components from `resources/js/components/ui/index.js`.
- Prefer named exports and compound APIs for multi-part Radix components (for example `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`).
- Keep the API close to Radix's mental model; do not hide important Radix capabilities behind narrow bespoke props.
- RAD wrappers may supply RAD defaults but must preserve caller overrides and forward refs where the underlying primitive supports them.
- Use `asChild` where Radix supports it, and document when the child must accept a ref and spread props.
- Use controlled and uncontrolled state in the same way as the underlying primitive.
- Keep components composable. Avoid page-specific business logic in the shared UI layer.
- Avoid implicit global direction. Set `dir="rtl"` at the appropriate application or component boundary; allow explicit LTR islands for email addresses, URLs, code, numbers, and Latin metadata.
- Every overlay/popover/menu must have a clear portal and layering policy. Every trigger must expose its expanded/pressed/selected state through the primitive's semantics.
- Use logical CSS properties (`ps`, `pe`, `ms`, `me`, `start`, `end`) rather than physical left/right for direction-sensitive layout.

## 2. RAD visual foundations

The live values remain in `resources/css/app.css`; this table names the semantic contract, not a second source of literal values.

| Token family | Required semantic roles |
|---|---|
| Color | canvas, paper, ink, muted text, subtle text, border, strong border, surface, muted surface, action, action text, focus, inverse text, success, warning, danger, info and their surfaces |
| Typography | Persian-first Vazirmatn, Latin Inter, semantic size scale, heading/copy line heights, regular-to-extrabold weights |
| Spacing | 4px rhythm; named spacing tokens; page gutter |
| Shape | small, medium, large, panel and pill radii |
| Elevation | soft and raised shadows; shared overlay scrim and blur |
| Layout | reading/content widths, control heights, artwork and portrait aspect ratios |
| Motion | short purposeful transitions; reduced-motion support; no motion required to understand state |
| Direction | RTL by default for Persian UI; explicit LTR for code and Latin-only data |

### State contract

Every applicable component must demonstrate and style the following states where relevant:

- default, hover, focus-visible, active/pressed, selected, open/expanded
- disabled and read-only
- invalid/error and required
- loading/busy
- empty, success, warning and destructive confirmation
- responsive and overflow behaviour
- RTL and mixed-direction content
- reduced-motion behaviour

Status must never be communicated by color alone. Focus must remain visible against every surface. Touch targets should normally be at least 44px high unless the control is intentionally compact and has an accessible alternative.

## 3. Complete component inventory

The inventory distinguishes the full Radix primitive vocabulary from the RAD components the product actually needs. A primitive can be available in the catalogue without being forced into a page where native HTML is better. Every Radix package used by the application must be declared in the package manifest and lockfile together.

### 3.1 Radix interactive primitives

| Primitive | RAD wrapper / API | Required catalogue coverage | Adoption guidance |
|---|---|---|---|
| Accordion | `Accordion.Root/Item/Header/Trigger/Content` | single and multiple, collapsible, disabled item, keyboard navigation | FAQ, grouped settings and disclosure panels |
| Alert Dialog | `AlertDialog.Root/Trigger/Portal/Overlay/Content/Title/Description/Action/Cancel` | destructive confirmation, pending action, cancel and confirm | Irreversible or high-impact actions |
| Aspect Ratio | `AspectRatio.Root` | landscape, portrait, square and responsive media | Artwork and artist media |
| Avatar | `Avatar.Root/Image/Fallback` | image, fallback, loading and broken-image cases | Artist, participant and account identity |
| Checkbox | `Checkbox.Root/Indicator` | unchecked, checked, indeterminate, disabled, invalid | Independent boolean settings |
| Collapsible | `Collapsible.Root/Trigger/Content` | open/closed, controlled, keyboard and motion | Inline disclosure, not navigation |
| Context Menu | `ContextMenu.Root/Trigger/Portal/Content/Item/CheckboxItem/RadioGroup/RadioItem/Label/Separator/Sub/ SubTrigger/SubContent` | pointer and keyboard invocation, nested menu, disabled and checked items | Contextual actions; never hide essential actions exclusively here |
| Dialog | `Dialog.Root/Trigger/Portal/Overlay/Content/Title/Description/Close` | modal, non-modal where justified, drawer, scroll, focus return | Primary modal and drawer foundation |
| Direction | `Direction.Provider` | RTL and LTR nested regions | Use only where direction context is required |
| Dropdown Menu | `DropdownMenu.Root/Trigger/Portal/Content/Item/CheckboxItem/RadioGroup/RadioItem/Label/Separator/Sub/SubTrigger/SubContent` | open, disabled, checked, nested and keyboard states | Compact action menus |
| Form | `Form.Root/Field/Label/Control/Message/ValidityState` | required, invalid, hint, validation message and submission | Use when Radix Form materially improves native form validation integration |
| Hover Card | `HoverCard.Root/Trigger/Portal/Content` | open delay, close delay, touch fallback and focus behaviour | Supplemental previews; never essential content |
| Label | `Label.Root` | associated, required and disabled form labels | Shared accessible label wrapper |
| Menubar | `Menubar.Root/Menu/Trigger/Portal/Content/Item/CheckboxItem/RadioGroup/RadioItem/Label/Separator/Sub` | keyboard navigation, nested menus, disabled and selected | Desktop application menu only if product needs it |
| Navigation Menu | `NavigationMenu.Root/List/Item/Trigger/Content/Link/Indicator/Viewport` | active route, dropdown, keyboard and responsive behaviour | Site navigation where a disclosure menu is appropriate |
| Popover | `Popover.Root/Trigger/Anchor/Portal/Content/Close` | open, collision, alignment, controlled, outside dismissal | Lightweight contextual panels; no modal focus trap |
| Portal | `Portal` | layering and SSR/client mounting behaviour | Prefer portal parts provided by compound primitives |
| Progress | `Progress.Root/Indicator` | determinate, indeterminate, zero and complete | Upload and task progress |
| Radio Group | `RadioGroup.Root/Item/Indicator` | selected, unselected, disabled, required, horizontal/vertical and RTL arrows | Mutually exclusive options |
| Scroll Area | `ScrollArea.Root/Viewport/Scrollbar/Thumb/Corner` | vertical/horizontal/both, keyboard, touch and reduced motion | Only when a styled scroll region is necessary; preserve native scrolling |
| Select | `Select.Root/Trigger/Value/Icon/Portal/Content/Viewport/Item/ItemText/ItemIndicator/Group/Label/Separator/ScrollUpButton/ScrollDownButton` | placeholder, selected, disabled, grouped, searchable decision, collision and keyboard | Custom option lists; native select remains preferred for simple forms |
| Separator | `Separator.Root` | decorative/semantic, horizontal/vertical | Visual grouping and semantic separators |
| Slider | `Slider.Root/Track/Range/Thumb` | single/range, min/max, step, disabled, keyboard and value labels | Numeric ranges with clear output |
| Slot | `Slot` and `Slottable` | prop/ref composition and child precedence | Internal composition utility; avoid as a page-level component |
| Switch | `Switch.Root/Thumb` | checked, unchecked, disabled, labelled and controlled | Immediate on/off preferences |
| Tabs | `Tabs.Root/List/Trigger/Content` | automatic/manual activation, orientation, direction, disabled, selected | Related peer content within one view |
| Toast | `Toast.Provider/Root/Title/Description/Action/Close/Viewport` | success, info, warning, error, action, duration, pause and live region | Temporary non-blocking feedback |
| Toggle | `Toggle.Root` | pressed/unpressed, disabled, label and pressed state | Single binary toolbar action |
| Toggle Group | `ToggleGroup.Root/Item` | single/multiple, required, disabled, roving focus, RTL | Segmented filters and formatting controls |
| Toolbar | `Toolbar.Root/Button/Link/ToggleGroup/Separator` | roving focus, orientation, direction and disabled | Related compact action clusters |
| Tooltip | `Tooltip.Provider/Root/Trigger/Portal/Content/Arrow` | delay, instant, keyboard focus, touch fallback, collision | Supplemental hints only; never the only label |

### 3.2 RAD static, semantic and domain components

These are RAD-owned wrappers or domain components, not Radix primitives. Use semantic HTML and native browser behaviour.

| Category | Catalogue components |
|---|---|
| Layout | Box, Flex, Grid, Container, Section, Inset, Stack, Cluster, Divider |
| Typography | Heading, Text, Strong, Em, Code, Quote, Blockquote, Kbd, VisuallyHidden |
| Surfaces | Card, Surface, Panel, Callout, EmptyState, ErrorState, SuccessState |
| Actions | Button, IconButton, Link, LinkButton |
| Forms | FormField, TextInput, TextareaField, SearchField, native SelectField, FieldHint, FieldError |
| Data display | Table, DataList, DataListItem, Badge, StatusBadge, Progress |
| Media | Avatar, AspectRatio, MediaImage, ArtworkMedia |
| Feedback | Spinner, Skeleton, SkeletonLines, Toast, UploadFeedback |
| Navigation | Breadcrumbs, Pagination, PageHeader, SectionHeader, WorkspaceHero |
| Domain | ArtworkCard, ArtistCard, DashboardMetricCard and domain-specific skeletons |

Static components must not imitate interactive Radix semantics. For example, a card that navigates must use a real link or button; a visual tab-like row must not claim the tab role unless it implements the tab keyboard model.

### 3.3 Utilities and hooks

Use Radix utilities where they solve a real composition or interaction problem. Document their usage in code examples and do not re-export implementation internals as broad public APIs.

- **Slot / Slottable:** compose a RAD control with a child element while preserving props and refs.
- **Direction Provider:** provide direction context only for a subtree that needs a different direction.
- **Portal:** render overlay content outside clipping/stacking contexts.
- **Visually Hidden:** provide accessible text without visual presentation.
- **Primitive composition:** preserve Radix controlled/uncontrolled state and `asChild` semantics.
- **Focus and dismissal behaviour:** rely on the primitive rather than custom document listeners for equivalent patterns.
- **Positioning:** use primitive collision handling and expose Radix positioning props where appropriate.
- **Refs:** forward refs through all wrappers that wrap a focusable or measurable primitive.

Do not add a generic state, positioning, focus-trap or dismissal utility when Radix already provides the behaviour. Do not add Radix packages solely to wrap a static HTML element.

## 4. Wrapper implementation contract

Every Radix wrapper must:

1. Import the matching `@radix-ui/react-*` primitive directly.
2. Keep Radix's compound component structure discoverable and predictable.
3. Apply only RAD tokens and RAD semantic classes; no hard-coded theme colors or arbitrary styling values.
4. Forward refs and preserve all supported primitive props.
5. Preserve `asChild`, `as`, controlled state, event callbacks and keyboard semantics where provided.
6. Set sensible RAD defaults without preventing caller overrides.
7. Use portal, overlay, z-index and collision defaults consistent with the global overlay contract.
8. Support RTL, nested LTR content and logical alignment.
9. Respect reduced motion.
10. Include tests for interaction and accessibility where the project test harness supports them.
11. Be exported from the central UI entry point.
12. Appear in the live catalogue with a working example and state variations.
13. Have a short API and usage note in this document or a linked component guide.
14. Be adopted by existing product code before the component is marked complete.

### Compound component naming

Use the same root/part names consistently. Preferred:

```jsx
<Popover.Root>
  <Popover.Trigger asChild>
    <Button variant="outline">Open</Button>
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content sideOffset={8}>
      ...
      <Popover.Arrow />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

Named convenience exports may be retained for compatibility during migration, but new examples should teach the compound API. Do not render a compound namespace object as a React component.

## 5. Live catalogue information architecture

The `/?design-system` route is the interactive reference. It must remain development-only unless the product explicitly approves a public documentation route.

Required catalogue sections:

1. **Overview:** principles, version/status, links to documentation and component adoption rules.
2. **Foundations:** palette, semantic color roles, typography, spacing, shape, elevation, grid/content widths, motion, breakpoints and direction.
3. **Accessibility:** keyboard/focus contract, semantic structure, contrast, status communication, reduced motion, screen-reader naming and touch target guidance.
4. **Actions:** buttons, icon buttons, links, toggle and toggle group.
5. **Forms:** label, input, textarea, select, checkbox, radio, switch, slider, validation, disabled and loading states.
6. **Navigation:** tabs, breadcrumbs, pagination, navigation menu, menubar and toolbar.
7. **Overlays:** dialog, alert dialog, popover, tooltip, hover card, dropdown menu and context menu.
8. **Disclosure:** accordion and collapsible.
9. **Feedback:** toast, progress, spinner, skeleton, empty/error/success states and upload feedback.
10. **Data display:** cards, badges, tables, data lists and metrics.
11. **Media:** avatar, aspect ratio and artwork media.
12. **Layout:** box, flex, grid, container, section, inset and scroll area.
13. **Domain patterns:** artwork, artist, workspace, messaging and moderation examples.
14. **Recipes:** common compositions, form layouts, responsive panels, action menus, confirmation flows and chat contextual actions.
15. **Do / Don't:** approved and anti-pattern examples, including RTL and mixed-direction pitfalls.
16. **API reference:** component exports, compound part names, variants, state props, required labels and package dependencies.
17. **Migration status:** implemented, showcased, adopted, verified; never collapse these into one ambiguous status.

Every interactive demo must be keyboard-operable and must not submit real data or call production APIs. Examples must use safe local sample data.

## 6. Application-wide adoption rules

- New page code imports shared UI from `resources/js/components/ui/index.js` or a documented domain-component entry point.
- Reuse shared components before writing page-local button, field, badge, alert, card, modal, menu, tab, toast or skeleton styling.
- Page-local classes may control layout and content-specific composition; they must not create a new component visual language.
- Migrate repeated patterns first, then one-off controls where a shared primitive clearly improves consistency or accessibility.
- Preserve API payloads, validation, permissions, route behaviour, loading states and user-visible copy during visual refactors.
- Do not replace native forms or semantic elements with Radix without a concrete accessibility or interaction benefit.
- Avoid changing unrelated backend or business logic during design-system adoption.
- Preserve Persian-first content, RTL layout, mixed Persian/Latin content, numeral formatting, long-label wrapping, and narrow viewport behaviour.
- Every migration should remove duplicated styles or implementations rather than add another abstraction layer.

## 7. Definition of done

A component is **catalogued** only when its documented API and live example exist.

A component is **implemented** only when its RAD wrapper, dependency, exports, styling, and states exist.

A component is **adopted** only when the applicable existing product usage has migrated to it.

A component is **verified** only when authorized checks and manual review have been completed and recorded.

The RAD design system is **ready for future development** only when:

- all relevant Radix primitives and utilities in the inventory have a deliberate implemented/not-applicable decision;
- every implemented component has API documentation and a working catalogue example;
- foundations and semantic tokens are documented and match the code;
- existing pages consistently consume shared primitives;
- duplicate and conflicting interaction patterns have been removed or explicitly justified;
- RTL, LTR islands, responsive overflow, keyboard interaction, focus, reduced motion and state coverage are addressed;
- tests/build/lint and manual catalogue review have been run with explicit authorization;
- the migration status is accurate and no component is labelled complete based on documentation alone.

## 8. Initial repository baseline

At the time this catalogue was authored, the project already has RAD token foundations and a first set of Radix integrations:

- Dialog, Alert Dialog, Dropdown Menu, Tabs, Checkbox, Select, Tooltip and Toast are present in the current shared UI layer.
- The RAD static/layout catalogue includes Box, Flex, Grid, Container, Section, Inset, Heading, Text, Strong, Em, Code, Quote, Blockquote, Separator, AspectRatio, Avatar, Card, Callout, Progress, Spinner, Kbd, AccessibleIcon, VisuallyHidden, Table, DataList and DataListItem.
- The live showcase demonstrates only a subset of the total inventory.
- Several product pages still use page-local native controls and styles. Native controls are not automatically defects; they should be reviewed against the adoption rules.
- Accordion, Collapsible, Context Menu, Hover Card, Menubar, Navigation Menu, Popover, Radio Group, Scroll Area, Slider, Switch, Toggle, Toggle Group and Toolbar are not yet part of the shared wrapper catalogue at this baseline.
- Package installation and lockfile generation must be performed by the repository's package manager. Never hand-edit generated lockfile metadata or claim a dependency is installed merely because its manifest entry exists.

Update this baseline as components are implemented, showcased, adopted and verified.


## 9. Upstream Radix catalogue coverage

This section maps the full current Radix Themes component and utility catalogue to RAD equivalents. It is a reference inventory, **not an instruction to install or visually inherit Radix Themes**. Radix Themes is pre-styled; its Getting Started guide installs `@radix-ui/themes`, imports `@radix-ui/themes/styles.css`, and wraps the application in `Theme`. That setup is intentionally not used in Rademan because it would introduce a second visual system. Use the upstream catalogue as a component taxonomy and use Radix Primitives for the interaction foundations. See the [Radix Themes Getting Started guide](https://www.radix-ui.com/themes/docs/overview/getting-started).

### 9.1 Every component in the Radix Themes documentation

| Radix Themes component | RAD catalogue destination | Implementation foundation |
|---|---|---|
| Alert Dialog | AlertDialog | `@radix-ui/react-alert-dialog` |
| Aspect Ratio | AspectRatio | `@radix-ui/react-aspect-ratio` |
| Avatar | Avatar | `@radix-ui/react-avatar` |
| Badge | Badge / StatusBadge | RAD semantic HTML |
| Button | Button / IconButton | RAD semantic HTML |
| Callout | Callout | RAD semantic HTML |
| Card | Card / Surface / Panel | RAD semantic HTML |
| Checkbox | Checkbox | `@radix-ui/react-checkbox` |
| Checkbox Group | CheckboxGroup | Checkbox primitives + fieldset/legend; controlled value array |
| Checkbox Cards | CheckboxCardGroup / CheckboxCard | Checkbox primitives + RAD card composition |
| Context Menu | ContextMenu | `@radix-ui/react-context-menu` |
| Data List | DataList / DataListItem | semantic `dl`, `dt`, `dd` |
| Dialog | Dialog | `@radix-ui/react-dialog` |
| Dropdown Menu | DropdownMenu | `@radix-ui/react-dropdown-menu` |
| Hover Card | HoverCard | `@radix-ui/react-hover-card` |
| Icon Button | IconButton | RAD Button + accessible name |
| Inset | Inset | RAD layout utility |
| Popover | Popover | `@radix-ui/react-popover` |
| Progress | Progress | `@radix-ui/react-progress` |
| Radio | Radio / RadioGroup | `@radix-ui/react-radio-group` |
| Radio Group | RadioGroup | `@radix-ui/react-radio-group` |
| Radio Cards | RadioCardGroup / RadioCard | RadioGroup primitives + RAD card composition |
| Scroll Area | ScrollArea | `@radix-ui/react-scroll-area` |
| Segmented Control | SegmentedControl | ToggleGroup or Tabs, chosen by semantics |
| Select | Select | `@radix-ui/react-select` |
| Separator | Separator | `@radix-ui/react-separator` |
| Skeleton | Skeleton / SkeletonLines | RAD CSS animation + reduced-motion |
| Slider | Slider | `@radix-ui/react-slider` |
| Spinner | Spinner | RAD CSS animation + reduced-motion |
| Switch | Switch | `@radix-ui/react-switch` |
| Table | Table | semantic table elements |
| Tabs | Tabs | `@radix-ui/react-tabs` |
| Tab Nav | TabNav | React Router links + semantic navigation; use Tabs only for in-page tab panels |
| Text Area | TextareaField | native textarea + RAD styles |
| Text Field | TextInput / SearchField | native input + RAD styles |
| Tooltip | Tooltip | `@radix-ui/react-tooltip` |

### 9.2 Every documented Radix primitive and low-level utility

The following is the full primitive family to account for in the RAD implementation. Some are intended as low-level building blocks rather than direct user-facing catalogue components.

| Primitive / utility | Package | RAD policy |
|---|---|---|
| Accordion | `@radix-ui/react-accordion` | Public compound component |
| Alert Dialog | `@radix-ui/react-alert-dialog` | Public compound component |
| Aspect Ratio | `@radix-ui/react-aspect-ratio` | Public component |
| Avatar | `@radix-ui/react-avatar` | Public component |
| Checkbox | `@radix-ui/react-checkbox` | Public component |
| Collapsible | `@radix-ui/react-collapsible` | Public compound component |
| Context Menu | `@radix-ui/react-context-menu` | Public compound component |
| Dialog | `@radix-ui/react-dialog` | Public compound component |
| Direction | `@radix-ui/react-direction` | Export a scoped provider utility only if needed |
| Dropdown Menu | `@radix-ui/react-dropdown-menu` | Public compound component |
| Form | `@radix-ui/react-form` | Evaluate alongside native form + existing validation; use if it adds clear value |
| Hover Card | `@radix-ui/react-hover-card` | Public compound component |
| Label | `@radix-ui/react-label` | Public accessible label |
| Menubar | `@radix-ui/react-menubar` | Public compound component; use only if app has desktop menu use case |
| Navigation Menu | `@radix-ui/react-navigation-menu` | Public compound component where disclosure navigation fits |
| Popover | `@radix-ui/react-popover` | Public compound component |
| Portal | `@radix-ui/react-portal` | Internal utility; prefer compound primitive Portal parts |
| Presence | `@radix-ui/react-presence` | Internal animation/mount utility; do not expose unless a concrete need exists |
| Primitive | `@radix-ui/react-primitive` | Internal low-level utility; use via Radix wrappers, not app imports |
| Progress | `@radix-ui/react-progress` | Public component |
| Radio Group | `@radix-ui/react-radio-group` | Public compound component |
| Roving Focus | `@radix-ui/react-roving-focus` | Internal keyboard utility; use through composite primitives |
| Scroll Area | `@radix-ui/react-scroll-area` | Public compound component; native overflow preferred by default |
| Select | `@radix-ui/react-select` | Public compound component |
| Separator | `@radix-ui/react-separator` | Public component |
| Slider | `@radix-ui/react-slider` | Public compound component |
| Slot | `@radix-ui/react-slot` | Internal composition utility; expose through documented RAD composition helper if needed |
| Switch | `@radix-ui/react-switch` | Public component |
| Tabs | `@radix-ui/react-tabs` | Public compound component |
| Toast | `@radix-ui/react-toast` | Public compound component/provider |
| Toggle | `@radix-ui/react-toggle` | Public component |
| Toggle Group | `@radix-ui/react-toggle-group` | Public compound component |
| Toolbar | `@radix-ui/react-toolbar` | Public compound component |
| Tooltip | `@radix-ui/react-tooltip` | Public compound component/provider |
| Visually Hidden | `@radix-ui/react-visually-hidden` | Public accessibility utility |

**Do not install every package blindly.** Install the full component set below when implementing the complete catalogue. Keep low-level dependencies only when a direct import is required; Radix component packages may bring their own transitive dependencies. Check the current Radix installation instructions and peer compatibility at install time.

### 9.3 Full primitive package installation command

The project already declares Dialog, Dropdown Menu, Tabs, Checkbox, Select, Tooltip, Alert Dialog and Toast. Running the command below in the repository root installs the remaining public primitive families needed for the full RAD catalogue and lets npm reconcile `package.json` and `package-lock.json` together:

```bash
npm install \
  @radix-ui/react-accordion \
  @radix-ui/react-aspect-ratio \
  @radix-ui/react-avatar \
  @radix-ui/react-collapsible \
  @radix-ui/react-context-menu \
  @radix-ui/react-direction \
  @radix-ui/react-form \
  @radix-ui/react-hover-card \
  @radix-ui/react-label \
  @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-popover \
  @radix-ui/react-portal \
  @radix-ui/react-progress \
  @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area \
  @radix-ui/react-separator \
  @radix-ui/react-slider \
  @radix-ui/react-slot \
  @radix-ui/react-switch \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group \
  @radix-ui/react-toolbar \
  @radix-ui/react-visually-hidden
```

This command deliberately does **not** install `@radix-ui/themes`, does not import its stylesheet, and does not add a `Theme` provider. Existing RAD styling remains the only visual authority. Do not install `@radix-ui/react-icons` by default: the project already uses `lucide-react` and should retain one icon system unless a separate product decision changes that.

### 9.4 RAD compound component API map

All multi-part wrappers should have stable, documented compound names. The canonical naming pattern is:

- `Accordion.Root, Item, Header, Trigger, Content`
- `AlertDialog.Root, Trigger, Portal, Overlay, Content, Title, Description, Action, Cancel`
- `Avatar.Root, Image, Fallback`
- `Checkbox.Root, Indicator`
- `Collapsible.Root, Trigger, Content`
- `ContextMenu.Root, Trigger, Portal, Content, Item, CheckboxItem, RadioGroup, RadioItem, Label, Separator, Sub, SubTrigger, SubContent`
- `Dialog.Root, Trigger, Portal, Overlay, Content, Title, Description, Close`
- `DropdownMenu.Root, Trigger, Portal, Content, Item, CheckboxItem, RadioGroup, RadioItem, Label, Separator, Sub, SubTrigger, SubContent`
- `HoverCard.Root, Trigger, Portal, Content`
- `Menubar.Root, Menu, Trigger, Portal, Content, Item, CheckboxItem, RadioGroup, RadioItem, Label, Separator, Sub`
- `NavigationMenu.Root, List, Item, Trigger, Content, Link, Indicator, Viewport`
- `Popover.Root, Trigger, Anchor, Portal, Content, Close`
- `Progress.Root, Indicator`
- `RadioGroup.Root, Item, Indicator`
- `ScrollArea.Root, Viewport, Scrollbar, Thumb, Corner`
- `Select.Root, Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText, ItemIndicator, Group, Label, Separator, ScrollUpButton, ScrollDownButton`
- `Slider.Root, Track, Range, Thumb`
- `Switch.Root, Thumb`
- `Tabs.Root, List, Trigger, Content`
- `Toast.Provider, Root, Title, Description, Action, Close, Viewport`
- `Toggle.Root`
- `ToggleGroup.Root, Item`
- `Toolbar.Root, Button, Link, ToggleGroup, Separator`
- `Tooltip.Provider, Root, Trigger, Portal, Content, Arrow`

Part exports should be named exports and may additionally be grouped under a namespace for a consistent compound API. Do not export both a namespace object and attempt to render it as a JSX component. Document any deviations required by existing compatibility.

## 10. Local installation handoff and execution order

The package command in §9.3 is the only dependency installation step currently required for the planned wrapper set. Run it from the repository root on `feat/177-radix-first-migration`. Commit the generated manifest and lockfile together, then continue with the following implementation slices:

1. **Foundation and composition:** reconcile existing wrappers with compound APIs, ref forwarding, `asChild`, direction, portal, focus and z-index contracts; add missing shared static equivalents from §9.1.
2. **Core controls:** Accordion, Collapsible, Popover, Radio Group, Switch, Slider, Toggle, Toggle Group, Progress, Separator, Avatar, Aspect Ratio, Label.
3. **Menus and navigation:** Context Menu, Hover Card, Navigation Menu, Menubar, Toolbar, Scroll Area; retain native navigation and overflow where more appropriate.
4. **Forms and grouped patterns:** Checkbox Group/Cards, Radio Cards, Segmented Control, Form wrappers; preserve current native input integration and server validation.
5. **Catalogue:** render every implemented component, all meaningful variants and state examples, and the full foundations/accessibility/recipes/API sections described in §5.
6. **Application migration:** search all routes and domain components for duplicated controls, dialogs, menus, tabs, status, forms and feedback. Migrate by feature area, preserving all product logic and existing contracts.
7. **Verification:** only after explicit authorization, run the approved install/build/lint/test/accessibility checks and record exact results. Do not label unverified items as verified.

### Local commands after the dependency installation

```bash
# Inspect exactly what the install changed
git diff -- package.json package-lock.json

# Then, only when ready and explicitly authorized:
npm run lint
npm run build:cpanel
npm run test:frontend
```

The commands above are suggestions, not evidence that verification has been run. Follow `AGENTS.md`: package installation, tests, lint, builds, browser automation and CI require explicit user authorization. The install command is provided for the user to execute locally; this assistant has not run it.
