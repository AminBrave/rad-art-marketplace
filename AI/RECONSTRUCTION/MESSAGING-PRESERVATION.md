# Rademan reconstruction — messaging preservation contract

Messaging is a product-critical subsystem. **Inquiries is the user-facing name for the existing buyer–artist chat.** It must not be replaced by a contact form, a new lead queue or a new messaging implementation.

## Verified baseline at main commit `4db615e7ff271446640dd79ad2aa1c24553f7966`
- Frontend shell: `MessagingCenter.jsx`, `MessagingInboxPanel.jsx`, `ConversationHeader.jsx`, `MessageTimeline.jsx`, `MessageComposer.jsx`, `RelatedArtworkStrip.jsx`, `MessagingStatusBanners.jsx`.
- Query/cache behavior: `useMessagingQueries.js` and `messagingQueryUtils.js`.
- Backend: `DirectConversationController`, `ConversationController`, messaging Actions, models, policies, middleware and migrations.
- One canonical direct conversation per buyer/artist pair is represented by `pair_key`; artwork context is stored separately.
- Direct conversation creation is buyer-only and requires a public artist profile; optional artwork context must be approved and belong to that artist.
- Conversation detail, message history and writes are participant-authorized through `ConversationPolicy`.
- Frontend synchronization polls every five seconds while active; do not claim WebSocket/push real-time behavior without new evidence.

## Behaviors to preserve
- Conversation list, active conversation, history pagination and incremental sync.
- Composer, sending, retry/error feedback and message deduplication behavior.
- Artwork/artist-originated context and related artwork presentation.
- Replies, own-message edit/delete, reactions and read state.
- Attachments and attachment previews/downloads.
- Archive/mute settings, search/filter and inbox pagination.
- Report, block/unblock and safety status.
- Participant identity, server authorization, rate limits and blocked-conversation behavior.
- Per-conversation draft/file/scroll restoration where currently implemented.
- Query cache isolation across user identity changes.

## Responsive requirements for reconstruction
- Mobile: clear list-to-conversation transition, back navigation, keyboard-safe composer, stable history scrolling and usable attachment interactions.
- Desktop: efficient conversation list + active conversation layout.
- Keep the existing URL/deep-link and artwork/artist context behavior unless a migration is separately approved.

## Explicit non-goals
Do not invent presence, typing indicators, push notifications, background sync, offline sending or additional chat capabilities. Do not cache private chat or workspace data in shared caches. Do not weaken participant authorization or safety behavior.

## Verification plan (not executed)
After explicit verification permission, cover buyer and artist isolation, direct conversation creation/idempotency, context integrity, history/pagination/sync, sending/deduplication, attachment authorization, message actions/reactions/read state, archive/mute, report/block, cross-user cache cleanup and mobile/desktop navigation. Existing tests include direct conversation, messaging, safety, attachments, notifications and browser buyer–artist messaging journeys.
