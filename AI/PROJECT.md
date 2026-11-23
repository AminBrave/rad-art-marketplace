# Rademan — product and architecture brief

## Product identity
Rademan is a mobile-first visual art discovery and marketplace platform connecting artists and buyers through artwork discovery, artist profiles and direct buyer–artist conversations.

The interface adopts an Instagram-inspired visual language: image-first layouts, restrained chrome, compact typography, clear dividers, profile-led identity, simple navigation and blue primary actions. Rademan remains its own product; the design reference does not imply Instagram's product features, social graph or integrations.

## Existing product experiences
1. **Discover (public):** artwork, artist and editorial-collection discovery; artwork detail and artist profiles; contextual entry into buyer–artist conversations.
2. **Buyer Studio:** buyer overview and the canonical Inquiries destination backed by existing messaging.
3. **Artist Studio:** artist overview, content library/artwork management, profile management and canonical Inquiries.
4. **Admin Console:** overview, content review/moderation, editorial curation, reports/trust and safety, and user/role governance.

## Design system
- Instagram-inspired visual design with complete light, dark and system themes.
- Preserve the five Rademan brand anchors: Ivory `#F7F5F0`, Charcoal `#242320`, Terracotta `#A64F31`, Sand `#D8C9B7`, Olive `#536052`.
- Use semantic Instagram-like UI roles: near-white/black canvas, white/dark surfaces, subtle dividers, high-contrast text and blue primary actions.
- Persian-first RTL and mixed Persian/Latin content are first-class.
- Mobile-first responsive layouts, accessible focus, reduced motion and WCAG 2.2 AA contrast are required.

## Engineering boundaries
Preserve the existing Laravel backend, React application, routes, API contracts, TanStack Query data behavior, authentication, role restrictions, server-side authorization, messaging identity and safety workflows. UI refactors must not weaken backend authorization or introduce new data capabilities.

Do not introduce checkout, orders, payments, saved collections, Instagram OAuth/import or other unimplemented features. Keep existing URLs unless an explicit migration is separately approved.

## PWA and privacy
Treat installability as a verified runtime property, not an assumption. Never cache private workspace or conversation data in unsafe shared caches. Offline messaging/background sync are not implied.

## Source-of-truth
For this task, the product owner's supplied `agent/chatgpt` branch is the baseline for implementation. Do not use historical issues or pull requests as design or implementation references. Inspect source and tests on that branch before changing feature behavior. This task authorizes a UI/UX redesign; it does not authorize unrelated backend or product-scope changes.

## Application shell and PWA
- The product is an installable, Persian RTL PWA with a standalone display mode, responsive app navigation and safe-area-aware mobile controls.
- Public discovery uses a compact app bar, desktop navigation rail and mobile tab bar; legacy marketing header/footer are removed from the React public layout.
- Workspaces retain their role-specific navigation and workflows while adopting the same compact application shell and mobile navigation behavior.
- The service worker caches only public navigations and same-origin static assets. It must bypass APIs, authentication endpoints, dashboards, admin and private conversations. Offline mutation, messaging sync and private-data caching are out of scope.
- Verify install prompts, icon rendering, update lifecycle, offline fallback and responsive behavior on actual target browsers before claiming PWA release readiness.

