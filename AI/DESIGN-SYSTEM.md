# Rademan — application design system

## Product direction
Rademan is a visual art discovery and marketplace application. The interface borrows interaction principles from Instagram—image-first browsing, creator identity, compact navigation, simple controls and a continuous content rhythm—but uses a Rademan-owned design language. This is a product-wide UI system, not a theme skin or a reproduction of Instagram.

The system replaces the previous editorial/card-heavy visual architecture. The prior Instagram adapter and application-shell stylesheets have been removed. All active screens use one token foundation, one component language and one responsive application shell.

## Product surfaces
- **Discover:** home feed, artwork catalogue, artwork detail, artist directory, artist profiles, editorial collections, public information and authentication.
- **Buyer Studio:** buyer home, notifications and canonical buyer–artist conversations.
- **Artist Studio:** overview, profile settings, artwork/content studio and canonical conversations.
- **Admin Console:** operations overview, user and role governance, artwork moderation, editorial curation, message reports and artwork-comment reports.
- **Messaging:** shared conversation inbox, thread history, contextual artwork, replies, attachments, reactions, message actions and safety controls.

Do not add checkout, orders, payment processing, saved collections, Instagram import or other unsupported product features.

## Foundation
### Single source of truth
- `resources/css/app.css`: global tokens, light/dark palettes, typography, semantic aliases, spacing, shape, responsive dimensions and reset.
- `resources/css/rademan.css`: application shell, page compositions, responsive navigation and cross-product component presentation.
- `tailwind.config.js`: utilities resolve through the semantic token set; do not duplicate literal colors.
- `resources/js/components/ui/`: reusable React primitives, layout, navigation, feedback, cards, dialogs and form controls.
- `resources/js/app/ThemeContext.jsx`: explicit system/light/dark selection and browser theme metadata.
- `resources/js/app/Layouts.jsx`: public shell, role workspace shell, notifications and responsive navigation.

There is no active `instagram.css` or `application-shell.css` adapter.

### Color and theme
| Role | Light | Dark |
|---|---|---|
| Canvas | `#FAFAFA` | `#000000` |
| Surface | `#FFFFFF` | `#121212` |
| Secondary surface | `#F5F5F5` | `#1C1C1C` |
| Elevated/tertiary surface | `#EFEFEF` | `#262626` |
| Primary text | `#171717` | `#F5F5F5` |
| Secondary text | `#737373` | `#B3B3B3` |
| Divider | `#DBDBDB` | `#262626` |
| Primary action | `#0064D9` | `#0064D9` |
| Link/focus accent | `#0064D9` | `#80BDFF` |
| Positive | `#16834A` | `#4ADE80` |
| Destructive | `#DC2626` | `#F87171` |

System preference applies unless the user selects a fixed theme. Theme tokens must be consumed through semantic variables; page components must not hardcode palette values.

### Typography and direction
- Persian-first typography uses Vazirmatn; Latin metadata uses Inter.
- RTL is the default for product surfaces. URLs, email addresses, codes, numeric identifiers and Latin-only strings use explicit LTR islands.
- Page titles are strong and compact; supporting copy and metadata remain quieter but readable.
- Content must reflow with long Persian names, bios, titles and mixed-direction strings.

### Geometry and layout
- 4px spacing rhythm with consistent page gutters.
- Controls target 44px touch height where practical.
- Compact 8/12/18/24px radius scale; pill geometry is reserved for status, tabs and selected actions.
- Prefer flat surfaces and subtle dividers. Use elevation only for menus, dialogs and transient overlays.
- Artwork media is the visual focal point; never distort uploaded artwork to fit a card.

## Application shell
### Discover
- Compact top app bar.
- Desktop navigation rail, icon-only at compact widths and labeled on wide desktop.
- Mobile bottom tab navigation with safe-area padding.
- Centered responsive content canvas and image-led artwork/artist grids.
- No marketing-site footer or legacy brochure header.

### Workspaces
- Shared compact application bar.
- Persistent role navigation on desktop.
- Mobile bottom navigation and an accessible navigation drawer.
- Workspace content is independent of the shell and must remain usable at 320px and up.
- Messaging retains a two-pane desktop experience and a clear list/thread transition on mobile.

### Page compositions
Every product section uses the same visual primitives while retaining its own task hierarchy:
- Home/discovery: editorial feed entry, featured artwork, new work, categories, artists and collections.
- Catalogue: search, filters, sort, count, image grid and pagination.
- Artwork detail: artwork-first presentation, artist context, metadata, availability and existing contact actions.
- Artist directory/profile: searchable creator index, profile identity, follow action and approved portfolio.
- Authentication: focused single-column sign-in/register surface.
- Buyer Studio: conversation entry, activity and discovery actions.
- Artist Studio: profile readiness, work status, artwork management and messages.
- Admin Console: operational metrics, review queue, moderation and governance tools.
- Messaging: inbox, thread, composer, attachment and safety workflows.

## Shared component contracts
Use semantic slots from `data-ui` for visual component styling. Shared components should own behavior and accessibility; pages should compose them rather than create one-off buttons, inputs, badges, dialogs, cards or skeletons.

- Button variants: primary, secondary, outline, ghost and destructive.
- Badge/status: neutral, success, warning, danger, info and accent.
- Surface/card/metric: consistent borders, spacing and density.
- Page and section headings: consistent hierarchy without decorative bars.
- Form field/input/textarea/select/checkbox: labels, hints, errors, focus and disabled state.
- Navigation/tabs/dropdowns/dialogs: keyboard, focus return, dismissal and active state.
- Feedback: skeleton, empty, error, success, permission and toast states.
- Artwork/artist cards: image-first media and creator identity.

## Accessibility
- Target WCAG 2.2 AA for text and interactive contrast.
- Preserve semantic HTML, accessible names, keyboard navigation and visible focus.
- Never communicate state by color alone.
- Respect reduced-motion preferences.
- Support 200% zoom, narrow viewport reflow, touch targets, safe areas and keyboard-safe forms.
- Validate light and dark states, including dialogs, dropdowns, notifications and message bubbles.

## PWA and privacy
- Persian RTL standalone manifest and application icon live under `public/`.
- Service worker registration is production-only.
- The worker caches a static offline fallback and eligible same-origin versioned assets only. It must never cache HTML navigations, API responses, authentication, dashboards, admin or private conversations.
- Offline messaging, background sync and private-data persistence are not supported claims.
- Verify installability and offline fallback in actual Android, iOS and desktop browsers before release.

## Engineering boundaries
Preserve Laravel controllers, API resources, authorization, route contracts, TanStack Query behavior, authentication, role restrictions, conversation identity, messaging safety and storage semantics. A design change must not weaken server-side policy or change data behavior.

## Acceptance checklist
- [ ] Every public and authenticated route uses the new design language.
- [ ] Old visual adapter files and legacy demo screens are absent from the active bundle.
- [ ] Light, dark and system palettes work across every page.
- [ ] Desktop navigation, tablet layout and mobile tabs are usable.
- [ ] Messaging remains canonical and functional.
- [ ] All forms, tables, cards, dialogs, empty/error/loading states use shared primitives.
- [ ] Persian RTL, mixed-direction text, focus, keyboard and reduced motion are supported.
- [ ] PWA install and offline behavior are verified on real devices.
- [ ] Tests, production build and browser journeys pass before release.
