# RAD design system

This document defines the product-wide interface language and interaction architecture for Rademan. It complements the implementation source in `resources/css/app.css`, `tailwind.config.js`, and `resources/js/components/ui/`. If this document and the implementation differ, inspect the current source and update this definition deliberately; do not introduce a parallel visual system.

## Product experience direction

Rademan is a Persian-first, artwork-led discovery and artist-contact product. Its interface should feel like a coherent, responsive web app rather than a collection of disconnected pages. The app-like direction applies consistently to public pages viewed by authenticated users and to role-based workspaces.

This is a web application direction, not a claim that the product currently ships as an installable PWA, supports offline mode, or has native-app capabilities. Those capabilities require separate product and engineering approval.

## Persistent authenticated shell

Every route rendered while a user is authenticated must retain a consistent shell:

- Keep the existing page header. It carries RAD identity, current context, account actions, and the existing header navigation. A bottom bar supplements the header; it never replaces or silently removes header navigation.
- On mobile and tablet, show a fixed bottom navigation on both public-layout routes and authenticated workspace routes.
- On desktop, retain the existing header and workspace sidebar/navigation model. The fixed bottom navigation remains hidden at the desktop breakpoint; do not duplicate it beside the desktop sidebar.
- Guest experiences remain unchanged and do not receive authenticated navigation.
- The shell is presentation only. Laravel middleware, policies and server-side authorization remain the security boundary.

## Two-level bottom navigation

The authenticated bottom navigation has two visibly distinct tiers:

1. **Primary destinations** — the existing role-specific workspace routes. These are the user's frequent, task-oriented destinations and receive the stronger visual treatment, icon, concise Persian label and active-route indicator.
2. **Secondary destinations** — lower-priority public discovery and support routes already present in the router (for example artworks, artists, collections, about, help and contact). They appear in a separate, quieter, horizontally scrollable row divided from the primary tier.

Rules:

- Derive primary destinations from the canonical role route definitions. Artist, buyer and admin users must only see destinations appropriate to their current role.
- Never invent a route or infer that a feature exists from a label. Only use destinations confirmed in the current router.
- Keep the primary tier concise (normally no more than five items). If it grows, prioritize or move infrequent items to the secondary tier rather than shrinking labels into illegibility.
- Keep secondary navigation visually subordinate: smaller type, muted default color, clear separator and a distinct accessible navigation landmark.
- Do not duplicate primary workspace destinations in the secondary tier.
- Active state must work for nested routes and remain understandable without color alone. Use semantic links and `aria-current` behavior supplied by the router.
- Preserve RTL reading order, touch targets, visible keyboard focus, long-label resilience and reduced-motion behavior.

## Responsive behavior and safe areas

- The bottom bar is fixed to the viewport edge on mobile/tablet and uses the device safe-area inset.
- Reserve matching bottom space in the page shell so content, forms, dialogs' underlying pages and the public footer are not hidden behind it.
- The navigation may scroll horizontally when secondary links exceed the viewport; it must not cause page-level horizontal overflow.
- Preserve the current desktop layout and its navigation hierarchy at the desktop breakpoint.
- Test narrow widths (including 320px), tablet widths, desktop, long Persian labels, nested routes, keyboard focus and safe-area behavior.

## Visual language

Use the current RAD semantic tokens and project-owned primitives:

- Ivory/canvas surfaces, charcoal ink, terracotta action emphasis, sand and olive accents.
- Vazirmatn for Persian and Inter for Latin content.
- The established 4px spacing rhythm, semantic border/surface roles, existing radii and elevation tokens.
- Editorial restraint: artwork and artist identity remain central; navigation should be quiet, legible and predictable.
- Avoid raw palette utilities, arbitrary one-off hex colors, parallel component CSS systems and unreviewed visual conventions.

## Accessibility and interaction

- Use semantic `nav` landmarks with distinct accessible labels for primary and secondary navigation.
- Use real router links, visible focus states, sufficiently large touch targets and clear active states.
- Keep the header and bottom navigation keyboard reachable without trapping focus.
- Respect `prefers-reduced-motion`, safe-area insets, RTL direction and mixed Persian/Latin text.
- Do not communicate active state through color alone; include a shape/position/weight cue.
- Navigation must not alter authentication, role permissions, route contracts, API behavior or data visibility.

## Change and verification checklist

For any future page or component:

- Reuse the current RAD tokens and primitives.
- Preserve the authenticated shell on every route that can render for a signed-in user.
- Keep header navigation and role context intact.
- Place frequent role actions in primary navigation and lower-priority confirmed public routes in the separated secondary tier.
- Check responsive content clearance, safe areas, nested-route active states, keyboard focus, RTL and reduced motion.
- Add focused regression coverage for changed navigation contracts.
- Follow `AGENTS.md`: tests, lint, builds, browser automation, scanners and CI require separate explicit permission. Adding tests does not authorize running them.
