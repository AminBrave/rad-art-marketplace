# Rad Art design foundations

The approved visual direction is **Contemporary Art Editorial**: a calm, curated Persian art-gallery experience. Artwork should carry the visual weight; interface decoration stays restrained.

## Source of truth

- Global CSS custom properties: `resources/css/app.css`
- Tailwind semantic aliases: `tailwind.config.js`
- Font loading and document direction: `resources/views/app.blade.php`
- Development specimen: `resources/js/app/DesignFoundation.jsx`

Use semantic utilities such as `bg-canvas`, `text-ink`, `text-muted`, `border-border`, `bg-terracotta`, and `text-terracotta-strong`. Avoid repeating raw hex values in page components.

## Palette and accessible use

| Token | Value | Intended use |
|---|---|---|
| canvas | `#F7F5F0` | Main page background |
| ink | `#242320` | Primary text |
| terracotta | `#B65C3A` | Primary action fill; pair with white text |
| terracotta-strong | `#9A452B` | Text links, small text accents, focus ring |
| sand | `#D8C9B7` | Decorative borders and low-emphasis surfaces, not body text |
| olive | `#536052` | Restrained success/secondary semantic accent |
| paper | `#FFFFFF` | Cards and form surfaces |

The approved terracotta has approximately 4.58:1 contrast against white, suitable for normal-size white button text. Against ivory it is approximately 4.21:1, so use the darker `terracotta-strong` for text on ivory. Sand is decorative only and must not be used for readable text. Keep body copy in ink or muted text.

## Typography

- Persian-first UI: Vazirmatn, weights 400–800.
- Latin names, metadata, and LTR fields: Inter.
- Global document language/direction remains `fa` / `rtl`; isolate mixed-direction content with `dir="ltr"` where appropriate.
- Prefer logical CSS properties (`margin-inline`, `padding-inline`, `border-inline-start`) over left/right-specific declarations.

Fonts are loaded from Google Fonts in the Blade entry document. If self-hosting is introduced later, preserve the same family names and weights.

## Layout and component rhythm

- 4px base spacing scale, exposed as CSS variables.
- Tailwind responsive defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.
- Prefer restrained radii: 4px, 8px, 12px, and 16px. Avoid defaulting every surface to pill or oversized rounded corners.
- Use subtle elevation only when it clarifies hierarchy; prefer borders and whitespace.
- Focus indicators are global and visible; reduced-motion preferences are respected.
- Artwork cards use a fixed aspect-ratio media frame, lazy loading, asynchronous decoding, and a localized broken-image fallback. The homepage hero and artwork detail image use eager/high-priority loading; detail media reserves a responsive aspect ratio.
- The Blade entry point renders a static first-paint skeleton before React mounts. Route-level skeletons reserve media and content space while lazy-loaded feature bundles are fetched; reduced-motion users receive a static shimmer-free placeholder.
- Google Fonts use `display=optional` to reduce late font swaps and avoidable text reflow. Recheck typography and CLS on the actual production host because font availability and network timing affect rendered metrics.

## Preview

In local development, open the app with `?design-system` (for example `http://127.0.0.1:8000/?design-system`) to view the foundation specimen. It is intentionally disabled in production and does not replace real page QA.

## Premium discovery experience principles (approved target)

The premium direction builds on the existing Contemporary Art Editorial foundation; it is not a replacement theme.

- **Artwork first:** use generous image areas and intentional crops; interface chrome must not compete with the work.
- **Editorial rhythm:** vary image scale and grid composition deliberately; avoid a uniform wall of identical rounded cards.
- **Curation over volume:** featured selections and collections need a clear editorial rationale, concise introductions and coherent ordering.
- **Typography as hierarchy:** use a restrained display/body/metadata scale; preserve Vazirmatn for Persian and Inter for Latin metadata.
- **Trust through clarity:** show artist attribution, medium, year, dimensions, availability and price only when the data is known. Never imply unknown price means free or unknown availability means available.
- **Contact with context:** inquiry actions should identify the artist and, when applicable, the artwork; do not imply checkout or chat.
- **Motion is subordinate:** use subtle transitions only when they clarify interaction; respect reduced-motion preferences.
- **Responsive art viewing:** mobile must retain legible metadata, useful image framing and a reachable contact action without reducing the artwork to a tiny thumbnail.
- **Editorial featuring is not advertising:** curated artist selections are content decisions, not paid ranking or sponsored placement.

For each new page, review the design-system specimen and shared components first. Update this document and the specimen when a reusable visual rule changes. Verify actual rendered RTL/LTR, keyboard, focus, contrast and responsive states rather than relying on source inspection alone.
