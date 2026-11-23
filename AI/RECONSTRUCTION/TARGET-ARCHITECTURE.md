# Rademan reconstruction — target architecture

This is the product-owner-approved target direction for the reconstruction. It describes product intent, not proof that the capabilities or routes already exist. Implementation facts remain grounded in the current source branch.

## Product identity
Rademan is a mobile-first, installable visual content platform connecting artists and buyers through artwork discovery and direct messaging. It is not an Instagram clone, a conventional checkout marketplace or merely an artwork catalogue.

## Four connected experiences
1. **Discover (public):** guest-accessible artwork, artist and editorial-collection discovery; artwork stories and artist profiles; contextual entry into buyer–artist conversations.
2. **Buyer Studio:** authenticated buyer overview, canonical Inquiries destination (the existing chat), and account/preferences only where supported. Discover remains shared.
3. **Artist Studio:** artist overview, one content library, public profile/presentation, canonical Inquiries destination (the existing chat), and account/preferences only where supported.
4. **Admin Console:** operational overview, content review/moderation, editorial curation, reports/trust and user/role governance.

## Core invariants
- **Inquiries is the existing buyer–artist messaging system**, not a contact form or separate lead queue. Preserve conversation identity, access boundaries, history, composer, attachments and all currently implemented interactions.
- Preserve existing backend/API/data contracts and server-side authorization unless a separately approved task explicitly changes them.
- Mobile-first installable PWA is required; desktop remains fully supported.
- Complete light and dark themes are required, including system preference and explicit light/dark/system choice where architecture supports it.
- Persian-first RTL and mixed Persian/Latin content are first-class.
- Retain only these brand color anchors: Ivory `#F7F5F0`, Charcoal `#242320`, Terracotta `#A64F31`, Sand `#D8C9B7`, Olive `#536052`. Rebuild typography, spacing, grids, components, navigation and interaction patterns.
- Design for accessibility, keyboard/focus, reduced motion, touch targets and WCAG 2.2 AA contrast.

## Proposed role navigation
- Public: Discover, Artworks, Artists, Collections; About/Help/Contact remain secondary.
- Buyer: Overview, Inquiries; Discover remains shared public experience.
- Artist: Overview, Content Library, Public Profile, Inquiries; account/preferences secondary.
- Admin: Overview, Content Review, Curation, Reports & Trust, Users & Roles.

## Guardrails
Do not add unsupported Saved, global search, artist-owned editorial collections, Instagram import/OAuth, checkout, orders, shipping, payments, payouts, social follow/likes/comments/feed, analytics or messaging capabilities. Confirm capability and obtain separate approval before expanding scope.
