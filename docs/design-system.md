# Rad Art design system

The approved visual direction is **Contemporary Art Editorial**: a calm, curated Persian art-gallery experience. Artwork carries the visual weight; interface decoration stays restrained. This is the single implementation contract for visual foundations and shared UI patterns.

## Source of truth

| Concern | Source |
|---|---|
| Semantic colors, typography, spacing, shape, elevation, component contracts | `resources/css/app.css` |
| Utility aliases that reference the CSS tokens | `tailwind.config.js` |
| Reusable interactive primitives and patterns | `resources/js/components/ui/` |
| Font loading and default document language/direction | `resources/views/app.blade.php` |
| Interactive specimen | `resources/js/app/DesignFoundation.jsx` and `ComponentShowcase.jsx` |

Do not add a second palette, spacing scale, font system, or component library. Prefer semantic utilities such as `bg-canvas`, `text-ink`, `text-muted`, `border-border`, `bg-terracotta`, and `text-terracotta-strong`. New repeated patterns belong in the shared UI components, not duplicated page markup.

## Visual principles

- Artwork first: use restrained borders, whitespace and neutral surfaces.
- Keep the existing palette, Vazirmatn/Inter typography and editorial direction.
- Avoid generic SaaS gradients, excessive rounded cards, decorative dashboard chrome and ornamental motion.
- Use elevation only when it clarifies hierarchy; prefer borders and whitespace.
- Use logical CSS properties (inline/block) so components remain direction-safe.

## Semantic color tokens

| Token | Value | Intended use |
|---|---|---|
| canvas | `#F7F5F0` | Main page background |
| ink | `#242320` | Primary text |
| terracotta | `#B65C3A` | Primary action fill; pair with white text |
| terracotta-strong | `#9A452B` | Links, small text accents, focus |
| sand | `#D8C9B7` | Decorative borders only; never body text |
| olive | `#536052` | Restrained success accent |
| paper | `#FFFFFF` | Cards and form surfaces |
| muted text | `#625E56` | Secondary readable copy |
| subtle text | `#777168` | Supporting metadata; verify contrast for each use |
| border | `#DED8CF` | Standard separators |
| strong border | `#BDB3A6` | Control outlines |
| danger | `#A33D32` | Error and destructive states |
| warning | `#8A5A12` | Warning state |
| info | `#315F78` | Informational state |

The approved terracotta has approximately 4.58:1 contrast against white, suitable for normal-size white button text. Against ivory it is approximately 4.21:1, so use `terracotta-strong` for text on ivory. Sand is decorative only. Do not infer that every color pairing is accessible from the palette alone; contrast must be evaluated for actual foreground/background pairs.

## Typography and direction

- Persian-first UI: Vazirmatn, weights 400–800.
- Latin names, metadata, numbers and explicitly LTR fields: Inter.
- Global document language/direction is `fa` / `rtl`; isolate Latin content with `dir="ltr"` or `dir="auto"` when the content is user-generated or mixed.
- Typography sizes and line heights are exposed as CSS variables and Tailwind aliases.
- Avoid left/right-specific CSS; use `margin-inline`, `padding-inline`, `border-inline-start` and related logical properties.

Fonts are loaded from Google Fonts in the Blade entry document. If self-hosting is introduced, preserve family names and weights and recheck visual metrics.

## Spacing, shape and layout

- 4px base spacing rhythm, exposed as `--space-*` and `editorial-*` Tailwind spacing aliases.
- Tailwind responsive defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.
- Content max width: 80rem; reading width: 48rem; page gutter is fluid via `--page-gutter`.
- Artwork card media uses a 4:3 ratio; portrait imagery uses the 4:5 editorial ratio.
- Restrained radii: 4px, 8px, 12px and 16px. Avoid pill/oversized rounding for ordinary surfaces.
- Control heights are standardized at 36px, 44px and 48px.

## Shared component contracts

- `Button`: primary, secondary, outline, ghost and danger variants; small, medium and large sizes; loading and disabled behavior.
- `IconButton`: accessible name is required; dimensions align with control sizes.
- `Badge`: neutral, success, warning, danger, info and accent semantic variants.
- `FormField`, `TextInput`, `TextareaField`, `SelectField`, `SearchField`: shared control styling and programmatic hint/error relationships.
- `ArtworkCard`, `ArtistCard`: editorial cards using shared surfaces and media framing; artwork imagery is lazy-loaded and has a localized failure fallback.
- `Dialog`, menus, tabs and breadcrumbs: shared navigation/overlay patterns; preserve keyboard operation and focus management supplied by Radix.
- `Skeleton`, `EmptyState`, `ErrorState`, `SuccessState`, `PermissionState`, `UploadFeedback`, `Toast`: consistent feedback and loading patterns.

When adding a variant, document its semantic meaning and ensure disabled, focus-visible, hover and error states remain understandable without relying on color alone.

## Interaction and accessibility

- Keyboard focus is always visible; do not remove outlines without a visible replacement.
- Buttons and fields have a minimum 44px standard target; compact controls must be limited to dense contexts and remain usable.
- Disabled controls must use native `disabled` where applicable and communicate their state.
- Form errors are associated through `aria-describedby` and `aria-invalid`; labels remain programmatically connected.
- Dialogs and menus must retain Escape, focus trapping/return, and keyboard navigation behavior.
- Reduced-motion preferences disable nonessential animation and smooth scrolling.
- Color contrast, screen-reader announcements, keyboard-only workflows and real-device behavior still require manual verification. Automated tests and this specimen do not certify WCAG conformance.

## Loading and imagery

- The Blade entry point renders a static first-paint skeleton before React mounts.
- Route-level skeletons reserve media and content space while lazy-loaded feature bundles are fetched.
- Artwork cards use fixed-ratio media, lazy loading, asynchronous decoding and a localized broken-image fallback.
- Homepage hero and artwork detail imagery use eager/high-priority loading; detail media reserves a responsive aspect ratio.
- Google Fonts use `display=optional` to reduce late font swaps and avoidable text reflow. Recheck typography and CLS on the production host because font availability and network timing affect metrics.

## Specimen and verification

In local development, open the app with `?design-system` (for example `http://127.0.0.1:8000/?design-system`) to view the foundation and interactive component specimen. It is disabled in production and does not replace route-level visual QA.

Automated design-token contract checks live in `tests/js/designSystem.test.js`. Run:

```bash
npm run test:frontend
npm run lint
npm run build
```

Manual acceptance should cover mobile (320/375px), tablet (768/1024px) and desktop (1280/1440px), keyboard-only operation, focus visibility, Persian/Latin mixed-direction content, reduced motion, and actual contrast pairs. Record browser/device and evidence in the milestone issue before sign-off.
