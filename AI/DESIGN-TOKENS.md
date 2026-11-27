# Rademan design token contract

**Canonical implementation:** `resources/css/tokens.css`  
**CSS entry point:** `resources/css/app.css` imports tokens before Tailwind's base, component and utility layers.  
**Utility mapping:** `tailwind.config.js` maps semantic utilities to the canonical CSS variables.

This document defines how token values are layered and consumed. It does not prescribe a visual redesign; retain the established ivory/charcoal/terracotta/sand/olive identity unless a separately approved design decision changes it.

## 1. Three token layers

### Layer 1 — primitive values

Primitives are raw design inputs. They are not the preferred direct inputs for ordinary components.

- Brand anchors: `--rd-brand-ivory`, `--rd-brand-charcoal`, `--rd-brand-terracotta`, `--rd-brand-sand`, `--rd-brand-olive`.
- Type foundations: `--rd-font-persian`, `--rd-font-latin`, `--rd-text-*`, `--rd-leading-*`, `--rd-weight-*`.
- Spacing scale: `--rd-space-1` through `--rd-space-24`, based on 4px increments.
- Geometry and layout foundations: `--rd-radius-0`, `--rd-line-width`, `--rd-shadow-*`, `--rd-content-width`, `--rd-content-reading-width`, `--rd-page-gutter`, header/navigation and control heights.

Primitive changes should be deliberate because semantic and component tokens may derive from them.

### Layer 2 — semantic roles

Semantic tokens express purpose rather than a particular palette value. Components should prefer these roles:

| Purpose | Canonical tokens |
|---|---|
| Page and surfaces | `--rd-canvas`, `--rd-surface`, `--rd-surface-raised`, `--rd-surface-muted` |
| Text | `--rd-text-primary`, `--rd-text-secondary`, `--rd-text-tertiary`, `--rd-inverse-text` |
| Borders and grouping | `--rd-border-subtle`, `--rd-border-strong`, `--rd-divider-section`, `--rd-divider-group`, `--rd-divider-nested` |
| Actions and focus | `--rd-action`, `--rd-action-hover`, `--rd-action-text`, `--rd-focus`, `--rd-focus-soft` |
| Status | `--rd-success`, `--rd-danger`, `--rd-warning`, `--rd-info` and their `*-surface` variants |

Light values are defined at `:root`. Explicit dark values are defined at `:root[data-theme='dark']`; system-dark values apply only when neither explicit theme is selected. Brand primitives remain stable across themes. Theme variants must keep semantic roles—including status surfaces, focus, dividers, overlays, skeletons and hero contrast—defined consistently.

### Layer 3 — component-specific tokens

Component tokens encode visual recipes for named reusable patterns. Current groups include:

- Editorial hero: `--rd-hero-*`.
- Loading/media placeholders: `--rd-skeleton-*`.
- Messaging: `--rd-message-own`, `--rd-message-peer`.
- Focus-ring geometry: `--rd-focus-ring-width`, `--rd-focus-ring-offset`.
- Artwork and portrait media geometry: `--rd-artwork-ratio`, `--rd-portrait-ratio`.

Add a component token only when a pattern has a stable reusable visual responsibility. Do not create a token for every one-off margin, color mix or page-specific value.

## 2. Naming and consumption rules

1. Define canonical tokens with the `--rd-` prefix in `tokens.css`.
2. Components use semantic roles first; use component tokens for the named pattern they belong to.
3. Primitive brand colors are used to derive semantic roles, not as ad hoc component colors.
4. Raw hex/rgb values belong in the token source unless a value is truly content-specific or a browser/platform requirement.
5. Legacy `--color-*`, `--text-*`, `--space-*`, `--radius-*` and related aliases are one-way compatibility bridges. Do not add new consumers; migrate old consumers incrementally.
6. Tailwind is a mapping layer, not a second source of truth. Add a Tailwind extension only when it points directly to an existing canonical token.
7. Preserve logical properties and direction-neutral tokens. Do not encode left/right assumptions in shared tokens.

## 3. Tailwind mapping contract

The current mapping includes:

- Semantic colors: `bg-canvas`, `bg-surface`, `text-ink`, `text-muted`, `border-divider-section|group|nested`, `text-success|danger|warning|info`, their surface variants and `focus`.
- Typography: `font-sans|persian|latin`, the semantic type scale, line-height roles and token-backed font weights.
- Spacing: `page-gutter` and `editorial-1` through `editorial-24` for the canonical spacing scale.
- Geometry: square radius compatibility mappings, `shadow-soft|raised`, `max-w-content|content-reading`.
- Media ratios: `aspect-artwork` and `aspect-portrait`.

Do not duplicate values in Tailwind config. If a token changes, its mapped utility should update automatically.

## 4. Artwork media contract

- Canonical artwork frame: `--rd-artwork-ratio: 3 / 4`, exposed as `aspect-artwork`.
- Portrait identity frame: `--rd-portrait-ratio: 4 / 5`, exposed as `aspect-portrait`.
- Discovery cards, artwork detail, artist studio previews/lists and admin review previews use the canonical artwork ratio.
- Use `object-contain` for the artwork itself so the complete source composition remains visible. The surrounding frame may provide a neutral surface and intentional passepartout spacing.
- Use `object-cover` only when cropping is the explicit purpose, such as avatars, editorial thumbnails or ambient imagery. Never stretch an image to fill a frame.
- Loading skeletons and unavailable-image fallbacks reserve the same frame geometry as the final image.

## 5. Gestalt and component guidance

- **Proximity:** group an artwork's title, artist, category and price; keep form labels, controls and errors adjacent.
- **Similarity:** repeat treatments for equivalent cards, controls, nav items and statuses; similarity must imply similar meaning.
- **Common region:** frame a cohesive dialog, artwork image or truly related metric group; do not card-wrap every section.
- **Continuity:** align page/section headers and content to shared container guides; maintain a clear navigation and message-reading path.
- **Figure-ground:** preserve artwork as the focal content and keep dialogs/overlays clearly separated from the page.
- **Closure:** use whitespace and selective dividers when users can infer a group without a full border.
- **Prägnanz:** remove duplicate borders, redundant labels and decoration that competes with the task.

Apply these rules concretely: artwork cards prioritize the full image; artist cards group identity and profile context; form fields bind label/control/help/error; navigation uses consistent current states; page and section headers establish reading hierarchy; dialogs create a focused region; status badges pair text with color; message bubbles group sender and sequence; dashboard metrics pair value, label and context.

## 6. Review checklist

- [ ] New values are assigned to the correct token layer.
- [ ] Semantic tokens are defined for light, explicit dark and system-dark modes.
- [ ] Tailwind extensions reference tokens instead of duplicating values.
- [ ] No new component consumes legacy compatibility aliases.
- [ ] Artwork frames use `aspect-artwork` and `object-contain` unless a crop is intentional.
- [ ] RTL/LTR, focus, reduced motion and narrow/wide layouts are considered.
