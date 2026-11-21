# Rademan — project brief

> Compact source of truth for AI coding chats. Update only when product intent or confirmed architecture changes.

## Product identity
- Product: Rademan (RAD), a Persian-first artist discovery and artist-contact marketplace.
- Core intent: help people discover artists and make appropriate contact through a coherent, trustworthy experience.
- Experience: image-led, editorial, marketplace-oriented, Persian-first, RTL-aware and responsive.
- Recorded stack: PHP 8.3+, Laravel 13, React 18, JavaScript, React Router 7, TanStack Query 5 and Vite. Verify installed versions in manifests before using version-specific APIs.

## Product intent and decision authority
The product owner's canonical product vision and future-direction decisions are recorded as 41 individually addressable decision comments in GitHub issue #150. That register is brainstorming/future vision, not an implementation backlog.

- Retrieve only the specific decision requested; do not read unrelated decisions by default.
- A decision does not automatically become an MVP, delivery task, architecture requirement or implementation authorization.
- The confirmed launch direction recorded in #150 is discovery and direct buyer–artist connection; do not infer checkout or platform payment gates.
- Any implementation requires separate, explicit product-owner authorization and a focused GitHub delivery issue.
- Each authorized issue defines its own smallest useful MVP, exclusions, acceptance criteria and dependencies.
- Current implementation must be established from source and runtime evidence, not from product-intent documents.

## Problem definition
The product is intended to address the gap between discovering artists and being able to contact them through a coherent, trustworthy experience. Product decisions and future possibilities are recorded in #150. Do not invent requirements or assume they are implemented.

## Principles
1. Persian-first content and correct RTL behavior are first-class.
2. Artwork and artist identity are central to the visual experience.
3. Trust, privacy and authorization are enforced server-side.
4. Prefer a simple, coherent vertical slice over speculative platform complexity.
5. Preserve the RAD design system, API contracts and established patterns.
6. Source, migrations, tests and runtime behavior are truth; docs guide intent, not proof of implementation.
7. Authenticated experiences should use a coherent, app-like responsive shell across public and workspace routes: persistent role-aware primary navigation, clearly separated primary workspace and secondary discovery/support groups inside the dashboard hamburger drawer, a primary-only mobile/tablet bottom bar, and a retained compact contextual header. See [`AI/DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) for the canonical interface rules.

## Confirmed artist-content architecture

- `ArtistContent` is the source-aware library record; Rademan-authored title/description/publication fields are separate from provider snapshot and sync metadata.
- `Artwork` remains the artwork-specific domain record and links one-to-one to its content companion. Existing artwork columns and public API contracts remain in place during the compatibility period.
- `ArtistCollection` and `artist_collection_items` are artist-owned and separate from admin-managed `CuratedCollection`. Composite foreign keys enforce that a collection and its content items share the same artist owner.
- Legacy artwork companions are created with `php artisan rademan:backfill-artist-content` after the schema migration. The command supports `--dry-run` and bounded `--chunk`; it is not run automatically during deployment. Backfilled content remains draft until the artist explicitly approves and publishes it.
- The artist-only `/api/v1/artist/content` API lists the authenticated artist's paginated library with type/source/publication filters. Explicit approve, publish and unpublish actions enforce artist ownership, native-source-only operation, public-profile visibility, artist approval, and existing artwork moderation for artwork companions.
- The artist-only `/api/v1/artist/collections` API supports private-by-default collection CRUD, ordered membership replacement, collection ordering, and explicit publish/unpublish actions. Membership is same-owner only. Publishing requires a public artist profile and every item to be native, artist-approved and published; artwork items must also pass existing admin moderation. Membership changes, content unpublishing, and artwork edits invalidate affected public collections back to private.
- The artist workspace exposes the unified library at `/dashboard/artist/content`, linked from the artist navigation and dashboard. It supports paginated/filterable content review, explicit artist approval and publication actions, private-by-default collection CRUD, ordered collection membership, collection ordering, and public/private collection transitions through the owner-scoped API. Collection list responses include their ordered item summaries for this workspace; the endpoint supports bounded `per_page` values up to 100.
- Artist library resources use explicit allow-lists and omit provider IDs, source captions/permalinks/metadata, and internal media paths. Public Discovery read endpoints, non-artwork content creation/uploads, and admin content governance are not part of this API slice.
- Instagram source fields remain placeholders for imported library records. A bounded Unified Login proof of concept now exists on the #256 task branch: artist-only OAuth start/callback, one-time session state validation, server-side authorization-code exchange, encrypted business-system token storage, assigned professional-account discovery, and a read-only sample media-metadata probe. It deliberately does not create ArtistContent imports, persist media binaries/CDN URLs/captions, refresh tokens, synchronize in the background, or expose connection credentials through an API. Meta app approval, a real configured Meta app, live OAuth validation, and legal/privacy approval remain external gates.

## Explicit non-goals unless approved
Do not assume checkout, orders, shipping, payouts, subscriptions, commissions, booking, escrow or other commerce capabilities exist or belong in scope.

## Resolve unknowns
Inspect current implementation and product evidence first. Separate confirmed facts from assumptions. Ask one focused question only if a decision blocks safe implementation; otherwise state the smallest reversible assumption. Record approved durable decisions.

## Starting point
Read `AGENTS.md` first. It selects this brief, the current handoff and only task-relevant skills. Inspect source before implementation and check open issues before creating duplicate work.
