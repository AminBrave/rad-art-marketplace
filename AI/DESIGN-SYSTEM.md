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

## Two-level header navigation and primary bottom navigation

Authenticated workspace headers expose two distinct navigation levels:

1. **Primary header navigation** — the current role's frequent workspace destinations, sourced from the same canonical role route definitions used by the desktop sidebar and mobile bottom bar.
2. **Secondary header navigation** — lower-priority public discovery and support destinations already present in the router (for example artworks, artists, collections, about, help and contact). This row is visually quieter and clearly separated from the primary row.

The fixed mobile/tablet bottom navigation contains **primary workspace destinations only**. It must never contain secondary discovery, about, help, contact or other low-priority links. The bottom bar is a compact mobile companion to the dashboard's primary header navigation, not a second location for the full site map.

Rules:

- Keep both primary and secondary navigation in the dashboard header, with separate semantic `nav` landmarks, labels and visual hierarchy.
- Derive primary destinations from the canonical role route definitions. Artist, buyer and admin users must only see destinations appropriate to their current role.
- Derive secondary destinations only from confirmed routes in the current router. Never invent a route or imply a feature exists from a label.
- Keep the primary header tier prominent and task-oriented. Keep the secondary header tier visually subordinate through smaller typography, muted color and a clear separator.
- The mobile/tablet bottom bar renders only the role-specific primary destinations, with icons, concise Persian labels and a clear active-route indicator.
- Do not duplicate primary workspace destinations in the secondary header tier.
- Active state must work for nested routes and remain understandable without color alone. Use semantic links and `aria-current` behavior supplied by the router.
- Preserve RTL reading order, touch targets, visible keyboard focus, long-label resilience and reduced-motion behavior.

## Responsive behavior and safe areas

- The primary bottom bar is fixed to the viewport edge on mobile/tablet and uses the device safe-area inset.
- Reserve matching bottom space for the primary bar only so content and the public footer are not hidden behind it.
- Header navigation rows may scroll horizontally when their links exceed the viewport; they must not cause page-level horizontal overflow.
- Preserve the current desktop sidebar and header/account controls. The bottom bar remains hidden at the desktop breakpoint.
- Test narrow widths (including 320px), tablet widths, desktop, long Persian labels, nested routes, keyboard focus and safe-area behavior.

## Visual language

Use the current RAD semantic tokens and project-owned primitives:

- Ivory/canvas surfaces, charcoal ink, terracotta action emphasis, sand and olive accents.
- Vazirmatn for Persian and Inter for Latin content.
- The established 4px spacing rhythm, semantic border/surface roles, existing radii and elevation tokens.
- Editorial restraint: artwork and artist identity remain central; navigation should be quiet, legible and predictable.
- Avoid raw palette utilities, arbitrary one-off hex colors, parallel component CSS systems and unreviewed visual conventions.

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
