# Product Vision and Scope

Rademan is a Persian-first art discovery and artist-contact marketplace. Visitors discover artworks and independent artists; buyers initiate and manage relationships with artists.

## Actors
- Visitor: public artists, approved artworks, curated collections and featured artists.
- Artist: profile/portfolio, artwork submission and direct conversation responses; Inquiry implementation is retained but disabled by default.
- Buyer: discovery, direct conversations and follow-up; Inquiry history/submission is disabled by default.
- Admin/editor: user management, artwork moderation, message reports and editorial curation.

## Value loop
Discover → evaluate artist/artwork → contact → continue conversation → trust through moderation and safety.

## Implemented scope evidenced in source
Public artist directory/profile; artwork catalogue/detail/filtering; artist profile and artwork management; moderation lifecycle; retained buyer Inquiry module (disabled by default); canonical buyer/artist conversations; message history, read/delivery state, reactions, attachments, archive/mute, block/report; in-app notifications; curated collections and featured artists.

## Explicit non-goals until accepted and implemented
The Inquiry module is disabled in the default configuration; see [Feature Registry](../architecture/feature-registry.md). Do not assume checkout, cart, payment capture, refunds, shipping, tax, escrow, commissions or payouts. Email message notifications are unavailable in current code. Do not claim real-time transport without evidence.

## Principles
Trust before reach; artist agency; buyer clarity; human moderation; privacy by default; RTL-first responsive accessibility.

## Metrics to define before instrumentation
Discovery engagement, profile-to-contact conversion, response time, conversation continuation, moderation turnaround, report resolution, performance and E2E reliability. Define baseline and event semantics before targets.
