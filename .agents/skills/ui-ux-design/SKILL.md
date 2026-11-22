---
name: ui-ux-design
description: Design and review Rademan's Discover, Buyer Studio, Artist Studio and Admin Console experiences, including journeys, IA, interaction, responsive behavior, accessibility and Persian RTL.
---

# UI and UX Design

## Purpose
Use this skill for product journeys, navigation, page structure, interaction design, visual hierarchy, design-system work, usability reviews and interface specifications. Follow `AI/PROJECT.md` and `AI/DESIGN-SYSTEM.md` for current product direction. The latest `main` source establishes what exists; this skill is a procedure, not an implementation authority.

## Product experience model
Design across four connected experiences:
1. **Discover (public):** artwork, artist and editorial collection discovery, with contextual entry into buyer–artist conversations.
2. **Buyer Studio:** buyer overview and one canonical Inquiries destination.
3. **Artist Studio:** artist overview, content library, profile and one canonical Inquiries destination.
4. **Admin Console:** operational overview, artwork moderation, editorial curation, reports/trust and safety, user/role governance.

“Inquiries” is the existing buyer–artist messaging/chat capability. It is not a contact form or a separate lead-management product. Treat messaging as a core system to preserve.

## Design workflow
1. Identify actor, task, intent, entry point, context, constraints and expected outcome.
2. Inspect the latest `main` branch and trace the actual route, shared shell, components, API states, responsive behavior and related journey.
3. Define information architecture and navigation before visual styling. Separate confirmed routes/capabilities from proposals.
4. Specify interaction behavior, state transitions, keyboard behavior, focus entry/return, dismissal, validation, feedback and recovery paths.
5. Cover loading, empty, populated, error, permission denied, disabled, submitting, success and stale states where relevant.
6. Rebuild the design system from first principles. Retain only the five brand anchors: Ivory #F7F5F0, Charcoal #242320, Terracotta #A64F31, Sand #D8C9B7 and Olive #536052. Do not inherit the legacy RAD tokens or component catalogue as mandatory constraints.
7. Design mobile-first for phone, then progressively enhance tablet and desktop. Account for safe areas, keyboard, long Persian labels, image ratios, overflow and fixed navigation clearance.
8. Design accessibly: semantic HTML, accessible names, keyboard support, visible focus, sensible focus management, sufficient contrast, reduced motion and status cues beyond color.
9. Validate through source-backed inspection and authorized review/testing. Distinguish inspected from tested.
10. Hand off structure, flow, component responsibilities, interaction/state matrix, responsive rules, content notes and observable acceptance criteria.

## Messaging preservation
Before changing messaging UX, inspect current frontend, query/cache, API routes, controllers, actions, models, policies, migrations and tests. Preserve existing conversation identity, buyer/artist roles, participant authorization, list/history/pagination, polling/sync behavior, composer, contextual artwork references, drafts, attachments, message actions, read state, archive/mute and safety workflows where confirmed in source. Keep artwork-/artist-originated context. Do not create duplicate inboxes or alter API/data/permission contracts as a design side effect.

Mobile messaging must provide a clear conversation-list ↔ active-conversation path, keyboard-safe composer and independently usable history scrolling. Desktop should make the conversation list and active thread efficient. These are target usability requirements, not claims about current runtime behavior.

## Visual system and themes
- Use only the five brand colors as identity anchors; design semantic color roles and all other foundations anew.
- Complete light and dark themes are required target behavior; system preference and explicit light/dark/system choice should be considered against current settings architecture.
- Validate contrast and all semantic states in both themes.
- Select typography after testing Persian glyph coverage, readability, mixed Persian/Latin text and loading performance.
- Use logical CSS properties and deliberate LTR islands for URLs, email, code and Latin metadata.
- Target WCAG 2.2 AA; never rely on color alone. Respect reduced motion.

## PWA and privacy
Treat installability as a target, not an existing fact. Inspect manifest, icons, service worker, lifecycle and runtime behavior before claiming PWA readiness. Do not propose unsafe caching of private workspace or chat data. Offline messaging/background sync are not implied.

## Source map
Start with `resources/js/app/AppRouter.jsx`, `workspaceNavigation.js`, `Layouts.jsx`, `RoutingPages.jsx`, `resources/css/app.css` and relevant page components. For messaging inspect `MessagingCenter.jsx`, `MessagingInboxPanel.jsx`, `ConversationHeader.jsx`, `MessageTimeline.jsx`, `MessageComposer.jsx`, `RelatedArtworkStrip.jsx`, `MessagingStatusBanners.jsx`, `useMessagingQueries.js` and their backend call paths. Follow callers rather than assuming file names prove behavior.

## Design handoff checklist
- [ ] Actor, goal, entry point and outcome are explicit.
- [ ] Latest main and current route/call path were inspected.
- [ ] Confirmed capabilities are separated from proposals.
- [ ] Navigation and primary action are clear; no invented routes.
- [ ] Messaging preservation and access boundaries are explicit where relevant.
- [ ] Loading/empty/error/permission/success states are specified.
- [ ] Phone, tablet and desktop behavior is addressed.
- [ ] Persian RTL and mixed-direction content are addressed.
- [ ] Keyboard, focus, semantic names, contrast and reduced motion are addressed.
- [ ] Light/dark theme behavior is covered.
- [ ] API/data/security implications and unresolved decisions are called out.
- [ ] Acceptance criteria describe observable behavior.
