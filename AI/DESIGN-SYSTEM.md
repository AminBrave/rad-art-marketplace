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
- Give the messaging route the exact available workspace height: use the dynamic viewport (`100dvh`) minus the sticky workspace header and, below desktop, the fixed primary bottom navigation plus its safe-area inset. At desktop, subtract only the workspace header. The workspace content wrapper must not add a second bottom-navigation spacer on this route. This lets the layout follow mobile browser chrome changes without overlapping the shell.
- Keep the page heading compact and the inbox/chat panel as the remaining `flex-1 min-h-0` area. The conversation header, related-artwork strip and composer stay fixed inside the panel; only message history scrolls. Do not use a guessed `clamp()` height or force a minimum that exceeds the remaining viewport.
- Preserve the standard RAD `PageHeader` sizing and spacing in the messaging inbox, matching other workspace pages. On mobile inbox view, let the document scroll: the page heading scrolls away first, followed by the inbox pane title row, while the inbox shell is tall enough that the search, filters and conversation list occupy the full available viewport at the bottom of the scroll. Keep the inbox pane title in normal flow; do not make it sticky. Once a conversation is selected, hide the page-level header and inbox pane entirely on mobile so the conversation takes the full available workspace height between the app-shell header and bottom navigation. Do not change the shared `PageHeader` component or its typography scale to achieve this.
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
