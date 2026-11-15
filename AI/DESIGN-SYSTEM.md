# RAD design system

This document defines the product-wide interface language and interaction architecture for Rademan. It complements the implementation source in `resources/css/app.css`, `tailwind.config.js`, and `resources/js/components/ui/`. If this document and the implementation differ, inspect the current source and update this definition deliberately; do not introduce a parallel visual system.

## Product experience direction

Rademan is a Persian-first, artwork-led discovery and artist-contact product. Its interface should feel like a coherent, responsive web app rather than a collection of disconnected pages. The app-like direction applies consistently to public pages viewed by authenticated users and to role-based workspaces.

This is a web application direction, not a claim that the product currently ships as an installable PWA, supports offline mode, or has native-app capabilities. Those capabilities require separate product and engineering approval.

## Persistent authenticated shell

Every route rendered while a user is authenticated must retain a consistent shell:

- Keep the compact dashboard header for RAD identity, current page context, role, notifications and account actions. Do not render primary or secondary navigation rows in this header.
- Put both navigation tiers inside the dashboard hamburger drawer: role-specific primary workspace destinations first, then lower-priority public discovery and support destinations.
- Keep the fixed mobile/tablet bottom navigation on public-layout routes and authenticated workspace routes; it contains primary workspace destinations only.
- On desktop, retain the existing workspace sidebar for primary destinations. The hamburger menu remains available so secondary discovery/support links are reachable without adding another header navigation row.
- Guest experiences remain unchanged and do not receive authenticated navigation.
- The shell is presentation only. Laravel middleware, policies and server-side authorization remain the security boundary.

## Hamburger navigation and primary bottom navigation

The dashboard header contains the hamburger trigger, not navigation link rows. Opening it reveals a drawer with two clearly separated groups:

1. **Primary workspace navigation** — frequent destinations for the current role, sourced from the canonical role route definitions also used by the desktop sidebar and mobile bottom bar.
2. **Secondary site navigation** — lower-priority public discovery and support destinations already present in the router (for example artworks, artists, collections, about, help and contact).

The fixed mobile/tablet bottom navigation contains **primary workspace destinations only**. It must never contain secondary discovery, about, help, contact or other low-priority links.

Rules:

- Do not render primary or secondary navigation rows beneath or beside the dashboard header. The hamburger trigger is the only navigation entry point in the dashboard header.
- Keep both primary and secondary groups inside the hamburger drawer, with separate semantic `nav` landmarks, accessible labels and a clear visual separator.
- Derive primary destinations from the canonical role route definitions. Artist, buyer and admin users must only see destinations appropriate to their current role.
- Derive secondary destinations only from confirmed routes in the current router. Never invent a route or imply a feature exists from a label.
- Order primary destinations before secondary destinations. Make the secondary group visually quieter than the primary group.
- Keep the hamburger drawer available at mobile, tablet and desktop sizes; preserve focus containment, Escape handling, focus restoration, body scroll locking and close-on-navigation behavior.
- The mobile/tablet bottom bar renders only the role-specific primary destinations, with icons, concise Persian labels and a clear active-route indicator.
- Active state must work for nested routes and remain understandable without color alone. Use semantic links and `aria-current` behavior supplied by the router.
- Preserve RTL reading order, touch targets, visible keyboard focus, long-label resilience and reduced-motion behavior.

## Responsive behavior and safe areas

- The primary bottom bar is fixed to the viewport edge on mobile/tablet and uses the device safe-area inset.
- Reserve matching bottom space for the primary bar only so content and the public footer are not hidden behind it.
- The dashboard header stays compact; navigation links live in the hamburger drawer rather than horizontal header rows.
- Preserve the current desktop sidebar for primary workspace navigation and show the same role-aware Lucide icons used by the mobile bottom bar beside each destination label. Keep the hamburger available at desktop sizes for secondary site navigation.
- Test narrow widths (including 320px), tablet widths, desktop, long Persian labels, nested routes, keyboard focus and safe-area behavior.

## Visual language

Use the current RAD semantic tokens and project-owned primitives:

- Ivory/canvas surfaces, charcoal ink, terracotta action emphasis, sand and olive accents.
- Vazirmatn for Persian and Inter for Latin content.
- The established 4px spacing rhythm, semantic border/surface roles, existing radii and elevation tokens.
- Editorial restraint: artwork and artist identity remain central; navigation should be quiet, legible and predictable.
- Avoid raw palette utilities, arbitrary one-off hex colors, parallel component CSS systems and unreviewed visual conventions.

## Dashboard page and section headings

- Every authenticated dashboard page and account-management screen uses the shared PageHeader for its single page-level h1: eyebrow, title, optional description and optional actions share one consistent hierarchy, alignment, spacing, responsive stacking and divider treatment.
- PageHeader uses a restrained terracotta edge accent, a compact semantic eyebrow pill, a strong but controlled responsive title scale, and readable supporting copy. Keep the heading editorial and spacious; do not wrap the whole header in a heavy hero card or add decorative artwork behind it.
- Keep primary actions grouped beside the page title on wide screens and naturally stacked beneath the description on narrow screens. Do not stretch unrelated actions to fill the row.
- WorkspaceHero is a compatibility wrapper around PageHeader, not a separate visual treatment. Do not reintroduce dark hero panels, oversized title variants or page-specific title spacing in dashboard routes.
- Use the shared SectionHeader for dashboard section headings (h2/h3), including optional eyebrow, description and actions. Its smaller type scale and subtle sand edge accent must remain visibly subordinate to PageHeader. Do not hand-build alternate eyebrow/title stacks or vary section-title typography between artist, buyer and admin workspaces.
- Apply the same hierarchy to artist, buyer, admin overview, admin user management, artwork studio, editorial management, artist profile settings and messaging. Public editorial pages may reuse PageHeader while retaining their content-specific widths.
- Keep content-specific headings inside artwork cards, report cards, forms and conversation rows at their semantic subordinate level; they are not page or section headers and should not be promoted to h1.
- Preserve page-specific copy, actions, data, and layout; standardization applies to heading hierarchy and presentation, not to content or feature behavior.
- Keep one h1 per dashboard route, use h2 for primary sections and h3 for nested sections/cards, and preserve heading order for screen-reader navigation.
## Messaging and segmented filters

- Treat the conversation filter as one continuous segmented control: its three equal-width options fill the full parent width with no inset padding or inter-button gap.
- Use the parent border, clipped outer radius and semantic RAD surface tokens to define the control boundary; do not create a second inset frame around the options.
- Each option spans its grid track, uses the shared control-height rhythm (at least 44px), and retains a clear selected state with sufficient contrast.
- Keep keyboard roving focus and RTL arrow-key behavior intact. Focus indicators must remain visible inside the clipped group, and motion must respect reduced-motion preferences.
- Messaging surfaces, filters, inputs, alerts and action controls must inherit the current RAD semantic colors, spacing, radii, typography and interaction states. Avoid one-off visual systems or arbitrary palette values.

## Messaging interaction patterns

- Keep inbox-row actions such as archive and mute inside a compact three-dot popover attached to that conversation row; do not expose persistent action rows under every conversation.
- Align message reactions and message-action controls in one compact, consistently spaced footer group; keep reaction chips flexible and action triggers fixed-size so wrapping never separates or stretches the controls.
- Keep message reactions in a compact, single-tap horizontal picker anchored to the message. Existing reaction counts remain visible on the message; the picker only contains the available emoji choices.
- Keep message actions in a compact vertical popover anchored to the message, with only actions valid for that message owner (reply for all, edit/delete for own messages, report for other participants' messages).
- These chat popovers are lightweight contextual surfaces, not modal dialogs: no full-screen overlay, no global modal sizing, no focus trap. Use RAD semantic surfaces, border, radius, shadow, typography and focus tokens.
- Anchor every contextual popover to its own three-dot or reaction trigger with a small, consistent gap. Prefer opening below the trigger; flip above only when the visible pane or viewport has insufficient room. Keep the horizontal edge aligned to the trigger where possible, then clamp to the available pane and visual viewport. Render portalled panels above message-history clipping without escaping the chat pane.
- Only one chat popover may be open at a time. Close it on outside pointer/tap, Escape, action selection and conversation change. Keep controls keyboard reachable and announce expanded state with aria-expanded and aria-controls.
- Keep emoji choices horizontally aligned and compact; keep action choices vertically stacked with readable touch targets. Preserve RTL alignment and avoid clipping at narrow widths.

## Messaging layout density and geometry

- Use Telegram as a reference for information density and interaction efficiency, not as a visual skin. Keep RAD semantic colors, typography, borders, radii, shadows, focus states and Persian RTL conventions.
- Make the authenticated messaging route a viewport-locked app surface: the shell uses `100dvh` with no document scrolling, and its content wrapper is exactly the dynamic viewport minus the workspace header and, below desktop, the fixed primary bottom navigation plus its safe-area inset. At desktop, subtract only the workspace header. The header and bottom navigation must never cover the messaging surface.
- Hide the messaging page heading/`ارتباط مستقیم` eyebrow on mobile. The inbox/conversation panel fills the entire available space between the app-shell header and bottom navigation, with `h-full min-h-0` geometry and no page-level scrolling. Keep the inbox list and message history as their own internal scroll regions; keep the conversation header, related-artwork strip and composer fixed inside the panel. Do not use guessed `clamp()` heights or minimum heights that exceed the remaining viewport.
- On desktop messaging routes, keep the workspace sidebar `position: fixed` below the app header and aligned to the centered content container's inline end. Preserve its 15rem grid-column placeholder so the conversation panel retains the same width and position as the other workspace pages; constrain the sidebar to the remaining viewport height and allow its own vertical scrolling when needed.
- Conversation items should be compact single-row targets. Anchor the three-dot action trigger inside the row instead of allocating a second persistent action row beneath every conversation.
- Message bubbles must size to their content with `w-fit` and a readable maximum width. Do not let block-level bubbles stretch to the full available row; constrain long messages and media to the bubble width.
- Keep the message history as the only flexible, vertically scrolling region (`min-h-0`, `flex-1`, `overflow-y-auto`). Header, related-artwork strip and composer remain compact, non-scrolling regions.
- Keep message reactions and message actions in one compact footer row. Reduce excess vertical gaps and padding without shrinking readable Persian line-height or accessible touch targets.
- The composer should remain visually compact, preserve attachment/reply previews, grow only as the draft wraps, and never force the conversation panel beyond its bounded height.

## Messaging RTL layout rules

- Keep the message history, message rows and message content in explicit RTL flow. Do not wrap message rows in LTR containers to achieve right/left alignment with physical `justify-end` utilities.
- In an RTL message row, align the current user's bubble with `justify-start` (inline start/right) and the other participant's bubble with `justify-end` (inline end/left).
- Use CSS logical properties and Tailwind logical utilities (`start/end`, `ps/pe`, `border-s/e`) for directional offsets and spacing. Reserve physical left/right utilities for deliberately asymmetric artwork or iconography that is truly physical.
- Keep emoji choices in one horizontal row; allow horizontal scrolling only on very narrow viewports rather than wrapping them into a vertical stack.
- Render message reaction/action popovers in a portal outside the scrolling message-history clipping context. Measure the trigger, message-history boundary and viewport; keep the entire panel inside both boundaries, open to the left when the right side lacks room (and to the right when the left side is constrained), flip vertically when needed, and reposition on scroll/resize. Keep the popover above fixed shell chrome without placing it above a true modal or navigation drawer.
- Reserve composer space on the same inline side as its attachment control. In RTL, the attachment control is on inline-start and the textarea must use matching inline-start padding.
- Preserve RTL flex/grid ordering for avatars, timestamps, message status, reply previews, attachment previews and related-artwork chips. Use `dir="auto"` for user-provided names and mixed-direction values where appropriate.
- Verify short and long Persian messages, Latin URLs/names, emoji sequences, media cards, narrow screens, both participants' bubbles, and popovers near both chat edges.

## Modal and dialog dismissal

- All product modal dialogs must use the shared RAD Dialog / DialogContent primitive, backed by Radix Dialog. Do not create parallel modal implementations.
- A modal closes when the user clicks or taps outside its content, or presses Escape, unless a specific destructive or legally required flow has an explicitly documented reason to prevent dismissal.
- Outside interaction must not be prevented by default handlers. Preserve Radix focus containment while open and focus restoration after close.
- Contextual chat popovers are not modals and must not use the global dialog overlay or focus trap.

## Accessibility and interaction

- Use semantic `nav` landmarks with distinct accessible labels for primary and secondary header navigation; the bottom bar has a primary-only landmark.
- Use real router links, visible focus states, sufficiently large touch targets and clear active states.
- Keep the header and bottom navigation keyboard reachable without trapping focus.
- Respect `prefers-reduced-motion`, safe-area insets, RTL direction and mixed Persian/Latin text.
- Do not communicate active state through color alone; include a shape/position/weight cue.
- Navigation must not alter authentication, role permissions, route contracts, API behavior or data visibility.

## Change and verification checklist

For any future page or component:

- Reuse the current RAD tokens and primitives.
- Preserve the authenticated shell on every route that can render for a signed-in user.
- Keep header navigation and role context intact, with primary and secondary tiers in the dashboard header.
- Keep the fixed bottom navigation primary-only; never move low-priority public links into it.
- Check responsive content clearance for the primary bar, safe areas, nested-route active states, keyboard focus, RTL and reduced motion.
- Add focused regression coverage for changed navigation contracts.
- Follow `AGENTS.md`: tests, lint, builds, browser automation, scanners and CI require separate explicit permission. Adding tests does not authorize running them.

## Radix-first interaction architecture

Radix UI Primitives are the default behavior and accessibility foundation for every interactive pattern that has a matching Radix primitive. The project-owned RAD wrappers are the only visual integration layer. Radix owns interaction state, keyboard behavior, focus management, dismissal and ARIA mechanics; RAD owns the component API, tokens, typography, spacing, colors, sizing, variants, RTL presentation and responsive behavior.

### Current interaction inventory

| Product pattern | Shared primitive | Current adoption |
| --- | --- | --- |
| Modal dialogs and mobile drawers | RAD Dialog backed by Radix Dialog | Public mobile navigation, workspace mobile navigation, notification drawer, and existing modal surfaces |
| Destructive confirmation | RAD AlertDialog backed by Radix Alert Dialog | Editorial collection unpublish confirmation |
| Contextual actions and reaction choices | Radix Dropdown Menu | Conversation-row actions, conversation actions, message actions and emoji reaction picker |
| Segmented navigation and content modes | RAD Tabs backed by Radix Tabs | Messaging inbox filters and the legacy preview authentication mode selector |
| Single-value option controls | RAD Select through SelectField | Public artwork category filter, artwork category/availability editor, account-role selectors and legacy preview account-role selector |
| Boolean selection controls | RAD Checkbox through Checkbox | Artist profile visibility, editorial artwork/artist selection and in-app message preference |
| Hover/focus helper text | RAD Tooltip backed by Radix Tooltip | Icon buttons and messaging action, reaction, attachment and navigation controls |

### Semantic HTML remains intentional

Radix does not provide a replacement for every HTML element. Keep native semantic HTML for buttons, links, anchors, headings, landmarks, forms, tables, text/email/password/number/file inputs, textareas, labels and static content. These elements should use the shared RAD wrappers/styles where appropriate, but must not be replaced with generic elements or fake Radix wrappers.

Do not add a Radix package merely to claim coverage. Add a primitive when a real product interaction requires it, and use the matching primitive rather than rebuilding its ARIA roles, roving focus, keyboard handling, focus trap or dismissal behavior by hand. In particular, do not emulate Select with Dropdown Menu, Checkbox with a styled div, or a modal with a custom overlay.

### Migration guardrails

- All new and existing interactive patterns must be reviewed against the Radix primitive catalogue before implementation.
- Prefer shared RAD wrappers over importing Radix packages directly in page modules.
- Use RAD AlertDialog for destructive or irreversible confirmations; use RAD Dialog for general modal content and drawers.
- Do not apply stock shadcn defaults or Radix Themes. The RAD token and component layer remains authoritative.
- Keep React form state, API payloads, validation, route behavior and backend contracts unchanged when swapping the interaction primitive.
- Preserve RTL direction, Persian accessible names, touch target sizes, reduced motion, focus visibility, disabled/required states and native form submission semantics.
- Add focused component/source-level regression coverage when shared wrappers or adoption points change.
