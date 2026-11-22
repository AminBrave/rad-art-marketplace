# Rademan — product and architecture brief

> Product intent and target direction. For implementation facts, inspect the latest `main` source, migrations, configuration and tests. This document never overrides those facts.

## Product identity
Rademan is a **mobile-first, installable visual content platform connecting artists and buyers through artwork discovery and direct messaging**. It is not an Instagram clone, conventional e-commerce marketplace, or merely an artwork catalogue.

The core loop is: discover visual work → understand the artist and artwork context → start or continue a private buyer–artist conversation.

## Four product experiences
1. **Discover (public):** guest-accessible artwork, artist and editorial-collection discovery; artwork stories and artist profiles; contextual entry into buyer–artist chat.
2. **Buyer Studio:** authenticated buyer overview and canonical Inquiries destination, plus account/preferences only where implemented. Discover remains shared public experience.
3. **Artist Studio:** creator overview, one content library, profile/public presentation, and canonical Inquiries destination.
4. **Admin Console:** operational overview, content review/moderation, editorial curation, reports/trust and safety, and user/role governance.

## Inquiries means messaging
“Inquiries” is the product-facing name for the existing buyer–artist messaging/chat capability. It is not a contact form, lead queue or separate feature.

Preserve the existing conversation list, active conversation, history, composer, contextual artwork/artist references, conversation identity, permissions, synchronization, drafts, attachments, message actions, read state and safety controls. Treat the current implementation as a substantial subsystem to refactor in place, not replace. Inspect the current source before asserting any detailed capability. Do not invent messaging features.

## Experience principles
- Mobile-first PWA; design phone interactions first, then progressively enhance tablet and desktop. Desktop remains first-class.
- Persian-first content and correct RTL are first-class; mixed Persian/Latin text must remain legible.
- Public discovery uses an art-editorial visual language; authenticated studios prioritize clarity, speed and task completion.
- Complete light and dark themes; support system preference and an explicit light/dark/system choice where implemented.
- Target WCAG 2.2 AA; do not communicate state through color alone.
- Preserve trust, privacy and server-enforced authorization.

## Brand identity and design strategy
Retain only these five brand color anchors:
- Ivory `#F7F5F0`
- Charcoal `#242320`
- Terracotta `#A64F31`
- Sand `#D8C9B7`
- Olive `#536052`

Do not preserve the legacy RAD design system as an architectural constraint. Rebuild information architecture, typography, spacing, grids, components, navigation, interaction patterns and responsive behavior from first principles. The colors are identity references, not a mandate to keep legacy tokens or components. Validate all semantic color pairs in both themes for contrast.

## PWA boundaries
PWA means an installable web application, not a native app. Verify manifest, icons, service-worker lifecycle, install behavior, viewport/safe-area handling and degraded-network behavior before claiming support. Never cache private workspace or chat data in unsafe shared caches. Do not promise offline messaging or background sync unless implemented and verified.

## Source-of-truth hierarchy
- **Implementation facts:** latest `main` branch source, migrations, tests, configuration and observed runtime behavior. Inspect current main head before material implementation claims.
- **Product intent:** this brief and explicit product-owner decisions in the current conversation / authorized GitHub issues.
- **Task scope and authorization:** live GitHub issues and explicit owner approval.
- **Documentation and agent skills:** derived guidance only; update or retire stale material when it conflicts with the current product direction or latest main implementation.
- Older documentation, historical permission statements, old skills and stale issue/PR descriptions are not implementation authority when they conflict with latest main or current owner direction.

This hierarchy does not weaken platform safety requirements, actual backend authorization, privacy protections or explicit approval gates. Never bypass a real security control merely because a stale document describes it differently.

## Confirmed exclusions unless separately approved and evidenced
Do not introduce checkout, orders, shipping, payments, payouts, refunds, subscriptions, commissions, booking, escrow, social follows/likes/comments/feed, Instagram OAuth/import/status, saved collections, global search or artist-owned editorial collections unless current implementation evidence and explicit product approval support the capability. Do not imply native apps or offline messaging.

## Engineering baseline
Current inspected architecture includes Laravel backend; React 18; React Router; TanStack Query; Vite. Verify exact installed versions in manifests before version-specific changes. Frontend routes are defined in `resources/js/app/AppRouter.jsx`; server API declarations are currently grouped in `routes/web.php` under `api/v1`, while `routes/api.php` exposes the health endpoint. This is a source-inspection snapshot, not a runtime guarantee.

## Resolve unknowns
Inspect the latest main implementation and trace routes, middleware, controllers, policies, models, persistence, API clients and UI state. Separate confirmed facts, hypotheses, assumptions and unknowns. Ask only when a decision blocks safe progress; otherwise use a small reversible assumption and label it.
