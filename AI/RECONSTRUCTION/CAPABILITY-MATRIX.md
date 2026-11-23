# Rademan reconstruction — capability matrix

**Baseline:** `main` commit `4db615e7ff271446640dd79ad2aa1c24553f7966`. Status is source-inspection level, not runtime verification.

| Capability | Current evidence | Target disposition |
|---|---|---|
| Public artwork discovery | `ArtworkCatalogue.jsx`, `PublicArtworkController`, API routes | Refactor presentation; preserve APIs |
| Artwork detail/context | `ArtworkDetailPage.jsx`, public artwork API | Refactor; preserve inquiry context |
| Artist directory/profile | `ArtistDirectoryPage.jsx`, `ArtistProfilePage.jsx`, `ArtistProfileController` | Refactor presentation |
| Editorial collections | `EditorialPages.jsx`, `PublicEditorialController`, admin editorial routes | Preserve; clarify public/admin separation |
| Buyer overview | `BuyerWorkspace.jsx` | Refactor into Buyer Studio overview |
| Artist overview/profile | `ArtistWorkspaceOverview.jsx`, profile routes | Refactor; preserve profile contract |
| Artist artwork library | `ArtworkStudio.jsx`, artist artwork endpoints | Refactor into one Content Library |
| Buyer/artist chat | `MessagingCenter.jsx`, messaging components/hooks/actions/controllers; `ConversationPolicy`; direct-conversation and messaging feature tests; browser buyer–artist journey | Preserve behavior/contracts; integrate as one canonical Inquiries destination |
| Messaging safety | report/block/safety routes and middleware | Preserve |
| Admin moderation | `AdminWorkspace.jsx`, moderation controller/routes | Refactor workspace presentation; preserve decisions |
| Admin editorial | `EditorialPages.jsx`, editorial controller/routes | Preserve |
| Admin users/roles | `AdminWorkspace.jsx`, admin user routes | Preserve authorization and operations |
| Light theme | CSS light tokens | Rebuild semantic token architecture |
| Dark theme | Not established in inspected CSS | Implement and verify across all four experiences |
| PWA installability | No manifest/service worker found in inspected repository tree | Implement and verify; do not claim current installability |
| Offline behavior | Not established | Define conservative degraded-network behavior; do not cache private workspace/chat data |
| Instagram import | No evidence established in this audit | Defer unless source metadata/integration is confirmed |
| Saved items/social/checkout | No evidence established | Out of scope absent separate approval |

## Additional source-backed notes
- Direct conversation creation is buyer-role constrained, public-artist-profile constrained, rejects self-contact and blocked pairs, and validates approved artwork ownership before adding artwork context.
- ConversationPolicy authorizes viewing, sending and updating only for the buyer or artist participant.
- Admin editorial APIs create/update/publish/reorder curated collections and manage featured-artist selections; this is admin editorial curation, not artist-owned collection management.
- Relevant test files exist for direct conversations, messaging, inbox settings, attachments, notifications, safety, canonical conversation constraints, admin moderation, editorial, artist profiles and public discovery-to-messaging browser journeys. They were not executed.

## Disposition definitions
- **Preserve:** behavior/contracts remain intact.
- **Refactor:** same capability, improved architecture or UX.
- **Replace:** only with an approved replacement and regression coverage.
- **Defer:** not part of the current approved product scope.

Before changing a row, inspect the complete implementation path, related migrations, policies, callers and tests. This matrix is a working map, not a permission to change backend contracts.
