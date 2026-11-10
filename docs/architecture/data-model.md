# Data Model and Persistence

## Entities
User (artist/buyer/admin); ArtistProfile (one-to-one); Category; Artwork; ArtistInquiry; Conversation; ConversationContext; Message; MessageReaction; MessageAttachment; UserBlock; MessageReport; MessageModerationAudit; CuratedCollection and ordered items; FeaturedArtistSelection; EditorialAudit; Laravel database notifications.

## Invariants
1. Profile ownership and role must agree.
2. Public directory requires public profile.
3. Public catalogue/portfolio expose approved works only.
4. Artist edit resets moderation approval.
5. At most one canonical conversation per buyer/artist pair (unique pair key).
6. Conversation access requires participant membership and respects blocks.
7. Removed/moderated message content and child records must not leak.
8. Editorial visibility depends on status, time window and public eligibility.

## Migration policy
Add forward migrations; do not edit historical deployed migrations. Add indexes based on measured query patterns. Use transactions for multi-record invariants. Test up and safe rollback. Data-transform migrations require backup/forward-recovery planning. Canonical conversation migration is data-sensitive; do not change it without migration-specific tests and recovery plan.

Before schema changes, map reads/writes, relationships, policies, serialization, seed data and deletion behavior. Update data, API and domain graph nodes.
