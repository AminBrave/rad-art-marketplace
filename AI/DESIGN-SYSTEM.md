# Rademan — Instagram-inspired design system

## Purpose
Rademan adopts Instagram's recognizable interface principles—minimal chrome, image-first discovery, compact typography, clear dividers, simple controls, blue primary actions, profile-led identity and predictable responsive navigation—while retaining Rademan's existing art-marketplace capabilities and brand identity.

This is a design-language reference, not a request to reproduce Instagram's proprietary assets, copy, social graph or product features.

## Product information architecture

The visual redesign applies consistently to the existing Discover, Buyer Studio, Artist Studio and Admin Console routes. It changes presentation and navigation ergonomics, not the underlying capabilities or role permissions.

## Product integrity
Keep the existing product experiences and backend contracts:
- **Discover:** home, artworks, artwork detail, artists, artist profiles, editorial collections, information pages and authentication.
- **Buyer Studio:** buyer overview and the existing canonical buyer–artist conversation inbox.
- **Artist Studio:** artist overview, profile management, artwork/content management and the existing canonical conversation inbox.
- **Admin Console:** overview, users and roles, artwork moderation, editorial curation, message reports and trust/safety.
- Preserve likes, comments, follows and notifications only where implemented in the current application.

Do not add checkout, orders, payments, saved collections, Instagram login/import or other unimplemented features. Keep existing URLs, API contracts, role boundaries, server-side authorization and conversation identity intact.

## Visual foundations

### Color
The five Rademan identity anchors remain available:
- Ivory `#F7F5F0`
- Charcoal `#242320`
- Terracotta `#A64F31`
- Sand `#D8C9B7`
- Olive `#536052`

The interface uses Instagram-inspired semantic roles rather than using brand anchors as every component color.

| Role | Light | Dark |
|---|---|---|
| Canvas | `#FAFAFA` | `#000000` |
| Surface | `#FFFFFF` | `#121212` |
| Raised surface | `#FFFFFF` | `#1C1C1C` |
| Muted surface | `#F5F5F5` | `#262626` |
| Primary text | `#262626` | `#F5F5F5` |
| Secondary text | `#737373` | `#A8A8A8` |
| Divider | `#DBDBDB` | `#363636` |
| Primary action | `#0095F6` | `#0095F6` |
| Destructive | `#ED4956` | `#FF6673` |

Semantic overrides live in `resources/css/instagram.css`; theme selection remains owned by `ThemeContext`. Explicit light, dark and system preference are supported.

### Typography
- Keep Vazirmatn for Persian-first content and Inter for Latin metadata.
- Use a compact hierarchy: strong page title, restrained supporting text, medium-weight card labels and legible metadata.
- Keep Persian RTL as the default; use explicit LTR islands for email, URLs, code, numeric identifiers and Latin metadata.

### Shape, spacing and elevation
- Use compact 3–8px corner radii for controls and cards; preserve circular avatar and pill affordances.
- Prefer 1px dividers and flat surfaces over elevated card stacks.
- Keep a consistent 4px spacing rhythm and comfortable touch targets (44px where practical).
- Artwork remains the visual focal point; preserve image aspect ratios and object-fit intent.

## Component principles
- Navigation: concise labels, clear active state, consistent icons, a persistent desktop rail and a mobile bottom tab bar.
- Artwork tiles: image-first, predictable ratios, restrained metadata and obvious open/detail affordance.
- Artist identity: avatar, name, location/bio and existing profile actions; story-ring styling is decorative only and must not imply unseen story functionality.
- Buttons: blue for primary actions, neutral for secondary actions, red for destructive actions.
- Forms: clear labels, helper/error text, visible focus and consistent disabled/loading states.
- Dialogs and menus: clear hierarchy, predictable dismissal, keyboard support and focus return.
- Feedback: consistent skeleton, empty, error, success and permission states in both themes.
- Messaging: preserve the current conversation list + active thread model, contextual artwork, composer, attachments, message actions, read state and safety controls.

## Responsive behavior
- Phone: one-column content, touch-sized controls, a persistent bottom tab bar, no horizontal page overflow, safe-area-aware fixed elements and a clear return path from a conversation to its list.
- Tablet: compact navigation and two-column content where it improves scanning.
- Desktop: centered content, a persistent Discover navigation rail, image grids, persistent workspace navigation and efficient two-pane messaging.
- Do not hide essential actions or data at any breakpoint.

## Accessibility and quality
- Target WCAG 2.2 AA contrast in both themes.
- Provide accessible controls, form states, dialogs, menus, notifications and feedback in both themes.
- Preserve semantic HTML, accessible names, keyboard navigation, visible focus, validation feedback and reduced-motion preferences.
- Never communicate status by color alone.
- Test Persian RTL, mixed Persian/Latin content, zoom/reflow, touch targets, dialogs, forms, menus and all major page states.

## Implementation map
- Theme state: `resources/js/app/ThemeContext.jsx`
- App entry: `resources/js/app.jsx`
- Theme layer: `resources/css/instagram.css`
- Existing utility foundation: `resources/css/app.css` and `tailwind.config.js`
- Route and role shell: `resources/js/app/AppRouter.jsx`, `Layouts.jsx`, `RoutingPages.jsx`, `workspaceNavigation.js`
- Feature screens remain in `resources/js/app/`; shared primitives remain in `resources/js/components/ui/`.

## Acceptance criteria
- [ ] All existing routes and actor capabilities remain reachable.
- [ ] Light, dark and system themes are coherent across public, workspace, admin and messaging screens.
- [ ] Artwork and artist content remain image-led with consistent grid behavior.
- [ ] Navigation and controls are usable on phone, tablet and desktop.
- [ ] RTL, mixed-direction text, focus, keyboard and reduced-motion behavior remain supported.
- [ ] Existing API, authorization, messaging and data contracts are unchanged.
- [ ] Updated visual tests and browser journeys pass before release.
