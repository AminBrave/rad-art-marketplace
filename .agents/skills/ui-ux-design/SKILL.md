---
name: ui-ux-design
description: Design and review Rademan product journeys, information architecture, interaction behavior, visual hierarchy, responsive layouts, accessibility and Persian RTL experiences.
---

# UI and UX Design

## Purpose

Use this skill for user journeys, navigation, page structure, interaction design, visual hierarchy, design-system changes, usability reviews and interface specifications. It complements—not replaces—`AI/DESIGN-SYSTEM.md`, `AI/RAD-COMPONENT-CATALOGUE.md`, `react-frontend` and `quality-engineering`.

## Design workflow

1. **Understand the actor and task.** Identify role, user intent, entry point, context, constraints and expected outcome.
2. **Inspect the existing experience.** Trace the actual route, shared shell, RAD tokens/components, responsive behavior, API states and related user journey. Do not infer capabilities from labels or mockups.
3. **Define structure before decoration.** Map information architecture, navigation hierarchy, content priority, page regions, primary action and recovery path.
4. **Specify interaction behavior.** Describe trigger, state transition, keyboard behavior, focus entry/return, dismissal, validation, feedback and edge cases. Identify modal vs non-modal behavior.
5. **Design all relevant states.** Include loading, empty, populated, error, permission denied, disabled, submitting, success, stale data and retry/recovery states as applicable.
6. **Use the RAD system.** Reuse current semantic tokens, typography, spacing, layout primitives and project-owned wrappers. Consult the component catalogue before introducing or changing a shared component.
7. **Design responsively.** Consider narrow mobile, tablet and desktop, touch targets, safe areas, long Persian labels, artwork aspect ratios, content overflow and fixed navigation clearance.
8. **Design accessibly.** Use semantic HTML, accessible names, logical landmarks, keyboard support, visible focus, sensible focus management, sufficient contrast, reduced motion and status cues beyond color.
9. **Validate the design.** Use source-backed visual inspection, representative content, keyboard walkthroughs and user feedback where available. State what was inspected versus not tested.
10. **Hand off clearly.** Provide page/flow structure, component mapping, interaction/state matrix, content/copy notes, responsive rules and acceptance criteria. Do not start implementation if a product or material design decision is unresolved.

## Persian-first and RTL requirements

- Treat RTL as a structural layout concern, not a final text-alignment override.
- Prefer CSS logical properties and established Tailwind logical utilities for inline/block positioning.
- Preserve correct ordering for icons, labels, avatars, timestamps, controls and navigation in RTL.
- Handle mixed Persian/Latin names, URLs, email addresses, numbers, punctuation and user-generated text deliberately; use `dir="auto"` where appropriate.
- Check Vazirmatn/Inter typography roles, line-height, truncation, wrapping and long content.
- Test representative Persian content, Latin-only content, mixed-direction strings and emoji sequences where relevant.
- Never assume a mirrored layout is automatically usable; controls and icon meaning may be direction-independent or intentionally physical.

## Interaction and accessibility rules

- Prefer native semantic HTML for links, buttons, forms, labels, headings, tables and landmarks.
- Use existing Radix-backed RAD wrappers for supported interactive patterns. Do not recreate menu, dialog, tabs, select, checkbox, tooltip or toast behavior with ad-hoc event handlers.
- Preserve focus containment only for true modal dialogs; contextual popovers must not become accidental modal traps.
- Define Escape, outside interaction, close-on-navigation and focus restoration behavior.
- Ensure visible keyboard focus, logical tab order, accessible names, adequate touch targets and error/status announcements.
- Respect `prefers-reduced-motion`; do not rely on animation or color alone to communicate meaning.
- Treat automated accessibility checks as useful signals, not proof of WCAG conformance.

## Rademan design constraints

- `AI/DESIGN-SYSTEM.md` is the canonical product-level interface direction; implementation source remains authoritative for what currently exists.
- `AI/RAD-COMPONENT-CATALOGUE.md` is the implementation-level component inventory and adoption contract.
- Preserve the authenticated app shell and role-aware navigation contracts; do not invent routes or roles.
- Artwork and artist identity remain central. Do not sacrifice image quality, content legibility or trust cues for decorative effects.
- Keep the shared RAD visual language. Do not introduce stock shadcn/Radix Themes styling or a parallel token system.
- Product behavior, role access, data visibility and API contracts cannot be decided by a visual design proposal.

## Design handoff checklist

- [ ] Actor, goal, entry point and user outcome are explicit.
- [ ] Current route and existing components were inspected.
- [ ] Information hierarchy and primary action are clear.
- [ ] Relevant loading/empty/error/permission/success states are specified.
- [ ] Responsive behavior and content overflow are addressed.
- [ ] Persian RTL and mixed-direction content are addressed.
- [ ] Keyboard, focus, semantic names, contrast and reduced motion are addressed.
- [ ] RAD tokens and shared primitives are reused.
- [ ] API/data/security implications and unresolved product decisions are called out.
- [ ] Acceptance criteria describe observable behavior, not subjective “looks good” alone.
