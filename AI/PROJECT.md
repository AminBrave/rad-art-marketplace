# Rademan — product context

Rademan is an art discovery and artist–audience platform. The application combines public artwork and artist discovery with authenticated experiences for buyers, artists and administrators.

## Current experience areas

- **Public discovery:** homepage, artwork catalogue and detail, artist directory and profiles, collections, and public information pages.
- **Buyer workspace:** buyer dashboard and messaging.
- **Artist workspace:** artist overview, profile settings, artwork management and messaging.
- **Administration:** dashboard, artwork moderation, user management, reports and editorial curation.

These describe the current product areas. Verify routes and capabilities in the live implementation before making feature claims or changing navigation.

## Product experience considerations

- Persian-first content with English UI support and RTL/LTR directionality.
- Artwork and artist content should remain the focus of discovery experiences.
- Public pages and authenticated workspaces have distinct navigation and permission needs.
- Messaging is a core buyer–artist interaction; changes require attention to conversation identity, participant access, attachments, delivery state and recovery.
- Accessibility, responsive behavior, clear feedback and useful loading/empty/error states are part of product quality.

## Brand context

The current token source includes these brand anchors: Ivory `#F7F5F0`, Charcoal `#242320`, Terracotta `#A64F31`, Sand `#D8C9B7` and Olive `#536052`. Treat them as current brand inputs, not immutable constraints.

## Source of truth

The user's latest explicit direction defines the intended product outcome. Current routes, source, migrations, configuration and runtime evidence establish what is implemented. Distinguish implemented behavior from proposed or unverified work.

For implementation ownership, see [ARCHITECTURE.md](ARCHITECTURE.md). For visual and interaction guidance, see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).
