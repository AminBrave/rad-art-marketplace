# Rademan — design and experience guidance

This document describes useful design principles and the current product context. It is guidance, not a fixed specification. The user's latest direction can change the information architecture, visual language, interaction model, platform priorities or design system.

## Design objective

Create a distinctive, usable art platform that makes artwork discovery and artist–audience interaction feel clear and considered. Choose the right experience for the requested users, task and device rather than forcing every feature into a pre-existing layout.

## Product information architecture

Organize discovery, artist presentation, buyer journeys and administrative work around clear user goals. Keep navigation, page hierarchy and content relationships coherent across public pages and role-based workspaces; verify route behavior and permissions before changing the information architecture.

## Current experience context

The current product is organized around public discovery, buyer experiences, artist experiences and administration. Current navigation and route behavior live in the application; inspect them before changing or documenting them.

Do not assume that current labels, role boundaries, routes or page composition are permanent. Follow the user's requested product model and update the implementation and documentation coherently.

## Design workflow

1. Understand the users, task, context, content and constraints.
2. Inspect the current screen, shared components, tokens, routes and related states.
3. Explore suitable interaction and layout approaches; explain meaningful alternatives when a decision matters.
4. Design loading, empty, error, success, disabled, permission and recovery states as relevant.
5. Consider mobile, tablet, desktop, keyboard, assistive technology, RTL and mixed-direction content.
6. Implement with appropriate reusable patterns without creating abstractions for their own sake.
7. Review the result against the intended user outcome and revise where needed.

Use the smallest process that fits the work. A small UI fix does not require a full discovery exercise or design specification.

## Visual system

The existing brand colors—Ivory #F7F5F0, Charcoal #242320, Terracotta #A64F31, Sand #D8C9B7 and Olive #536052—can inform the visual identity. They are not immutable.

Choose semantic tokens, typography, spacing, grids, radii, elevation, icons and motion to support the design. Reuse current components when they fit; refactor or replace them when that produces a better result. Do not follow the legacy RAD catalogue as a specification.

## Accessibility and localization

### Accessible controls, form states, dialogs, menus, notifications

Use the shared Radix-backed primitives for controls and overlays where they fit. Every form control needs a programmatic label, associated help/error text where applicable, visible keyboard focus, and a clear disabled or busy state. Dialogs and menus must preserve keyboard navigation and their expected Escape/outside-dismiss behavior. Notifications and asynchronous updates should use concise, appropriately scoped live announcements rather than making entire interactive regions live.

- Prefer semantic HTML and native platform behavior.
- Provide meaningful names, labels, focus states and keyboard interactions.
- Maintain sufficient contrast and do not communicate meaning through color alone.
- Respect reduced-motion preferences.
- Test RTL direction, mixed Persian/Latin text, numbers, punctuation and alignment where relevant.
- Treat WCAG guidance as a design and evaluation reference; describe the actual scope of any conformance assessment accurately.

## Responsive and installable experiences

Design for the devices and usage context relevant to the feature. If installability or offline behavior is requested, inspect the manifest, icons, service worker, lifecycle, storage and network behavior before making implementation claims. Protect private workspace and messaging data when considering caching or offline support.

## Messaging experience

The application currently has buyer–artist messaging. Inspect the current conversation identity, list/history, composer, contextual artwork, permissions, synchronization, attachments and safety flows before changing it. Avoid accidental duplicate destinations or data-contract changes. These are considerations for informed design, not a prohibition on user-requested redesign.

## Implementation references

- Application routes: resources/js/app/AppRouter.jsx
- Workspace navigation: resources/js/app/workspaceNavigation.js
- Shared UI: resources/js/components/ui/
- Global styles and tokens: resources/css/app.css

Verify these paths and their current contents before relying on them.
