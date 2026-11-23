---
name: ui-ux-design
description: Design and review the complete Rademan application across Discover, Buyer Studio, Artist Studio, Admin Console and messaging using the Rademan app-first design system.
---

# Rademan UI and UX engineering

## Design authority
Use the current Rademan system in `resources/css/app.css`, `resources/css/rademan.css`, `tailwind.config.js` and `resources/js/components/ui/`. Do not reintroduce the previous editorial design architecture, the old Instagram CSS adapter or the old application-shell stylesheet.

Instagram is an interaction reference only: image-led browsing, creator identity, concise navigation, compact metadata and a mobile-first feed rhythm. Rademan owns its color, typography, layout, components and product behavior.

## Surfaces to redesign
- Discover: home, catalogue, artwork detail, artist directory/profile, collections, public information and auth.
- Buyer Studio: overview, notifications, conversation inbox.
- Artist Studio: overview, profile settings, artwork studio and conversation inbox.
- Admin Console: overview, user/role management, artwork moderation, editorial, message reports and comment reports.
- Messaging: inbox, thread, contextual artwork, reply, attachment, reactions, moderation and safety.

## Required workflow
1. Read current route definitions and source for the section being changed.
2. Understand the actor, task, route, loading/error/empty/success states and data contract.
3. Rebuild layout hierarchy and interaction using shared primitives, not one-off visual wrappers.
4. Apply semantic theme tokens; never add arbitrary palette shades or literal colors to Tailwind classes.
5. Design phone-first, then tablet and desktop. Verify RTL, long Persian content, mixed-direction values, touch, keyboard and safe areas.
6. Preserve existing behavior and authorization. Do not invent features, endpoints or data.
7. Run relevant tests and builds. State exactly what has and has not been verified.

## Visual rules
- Canvas/surface contrast is quiet; content and artwork carry the hierarchy.
- Artwork imagery is primary; creator identity and metadata are secondary.
- Use one semantic action accent, neutral surfaces, consistent dividers and restrained elevation.
- Shared buttons, fields, badges, tabs, menus, cards, dialogs, skeletons and feedback states must look and behave consistently.
- Desktop Discover has a persistent rail; mobile Discover has a bottom tab bar.
- Workspaces have a compact top bar, desktop role navigation and mobile bottom navigation/drawer.
- Messaging is a two-pane workflow on desktop and a clear inbox/thread flow on mobile.
- Support system/light/dark modes across every state.

## Accessibility and quality
- Target WCAG 2.2 AA.
- Preserve semantic HTML, accessible names, focus visibility, keyboard support, reduced motion and focus management.
- Avoid horizontal overflow; support 320px viewport and 200% zoom.
- Do not rely on color alone for state.
- PWA installability is a runtime property; test it on actual devices.
- Never cache private user or conversation data in a shared service-worker cache.

## Preservation
Keep existing URLs, API contracts, query behavior, role boundaries, authentication, server-side authorization, canonical conversation identity, attachments and safety workflows. A visual redesign must not change business logic unless explicitly requested.
