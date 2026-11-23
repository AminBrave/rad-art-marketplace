---
name: ui-ux-design
description: Design and review Rademan's Instagram-inspired Discover, Buyer Studio, Artist Studio and Admin Console experiences, including responsive behavior, accessibility and Persian RTL.
---

# UI and UX Design

## Purpose
Design and review the complete Rademan experience using the approved Instagram-inspired visual language. The current task baseline is the product-owner-supplied `agent/chatgpt` branch; do not consult historical issues or pull requests as design or implementation authority.

## Product experience model
1. **Discover:** public artwork, artist and editorial collection discovery, with contextual entry into buyer–artist conversations.
2. **Buyer Studio:** buyer overview and one canonical Inquiries destination.
3. **Artist Studio:** artist overview, artwork/content library, profile management and one canonical Inquiries destination.
4. **Admin Console:** operational overview, artwork moderation, editorial curation, reports/trust and safety, and user/role governance.

“Inquiries” is the existing buyer–artist messaging capability. It is not a new contact form or separate lead-management product.

## Visual direction
- Follow Instagram's recognizable visual language: image-first content, compact typography, restrained chrome, clear dividers, simple controls, blue primary actions, profile-led identity and responsive navigation.
- Preserve Rademan's five identity anchors: Ivory `#F7F5F0`, Charcoal `#242320`, Terracotta `#A64F31`, Sand `#D8C9B7`, Olive `#536052`. Use semantic interface colors independently of these brand anchors.
- Support explicit light, dark and system themes. The shared theme state lives in `resources/js/app/ThemeContext.jsx`; the Instagram-inspired semantic adapter is `resources/css/instagram.css`.
- Keep Vazirmatn for Persian-first content and Inter for Latin metadata. Persian RTL and mixed Persian/Latin content are first-class.
- Prefer flat surfaces, compact radii, subtle dividers, consistent spacing and image-led grids over heavy cards and decorative effects.
- Do not copy Instagram assets, proprietary content, social graph or unimplemented product features.

## Design workflow
1. Identify the actor, task, entry point, context and expected outcome.
2. Inspect the current branch's routes, layouts, page components, shared primitives and API state before changing behavior.
3. Separate existing capabilities from visual proposals. Do not invent routes or product features.
4. Define navigation, hierarchy, interaction and responsive behavior before applying page-level polish.
5. Cover loading, empty, populated, error, permission-denied, disabled, submitting and success states.
6. Design phone-first, then tablet and desktop. Account for safe areas, keyboard, long Persian labels, image ratios and overflow.
7. Preserve semantic HTML, accessible names, keyboard/focus behavior, contrast and reduced motion. Target WCAG 2.2 AA.
8. Validate source-backed behavior and run the relevant tests/build before claiming verification. Clearly distinguish implementation from tests actually executed.

## Messaging preservation
Preserve conversation identity, buyer/artist roles, participant authorization, list/history/pagination, polling/sync behavior, composer, contextual artwork references, attachments, message actions, read state, archive/mute and safety workflows where confirmed in source. Keep the existing canonical inbox; do not create a second messaging destination or alter API/data/permission contracts as a design side effect.

Mobile messaging must provide a clear conversation-list ↔ active-conversation path, keyboard-safe composer and independently usable history scrolling. Desktop should retain efficient conversation-list + active-thread behavior.

## PWA and privacy
Treat installability as a verified runtime property, not an assumption. Do not cache private workspace or conversation data in unsafe shared caches. Offline messaging/background sync are not implied.

## Design handoff checklist
- [ ] Existing routes, product capabilities and role boundaries are preserved.
- [ ] Instagram-inspired visual language is consistent across all four product experiences.
- [ ] Light, dark and system themes cover every surface.
- [ ] Phone, tablet and desktop behavior is addressed.
- [ ] Persian RTL and mixed-direction content are correct.
- [ ] Keyboard, focus, accessible names, contrast and reduced motion are covered.
- [ ] Messaging continuity, safety and authorization are preserved.
- [ ] Relevant tests/builds are run and results are reported accurately.
