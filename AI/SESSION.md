# AI handoff — current project state

> Concise cross-chat handoff. Latest `main` is the implementation source of truth; this file is not.

## Current objective
Reconstruct Rademan around four connected experiences: public Discover, Buyer Studio, Artist Studio and Admin Console. Rademan is a mobile-first visual-content platform connecting artists and buyers through artwork discovery and direct messaging. The existing buyer–artist chat remains a core product capability and must be preserved.

## Product and design direction
- Product intent and exclusions: `AI/PROJECT.md`.
- Target IA, navigation, themes, PWA and messaging preservation: `AI/DESIGN-SYSTEM.md`.
- Retain only five brand color anchors: Ivory #F7F5F0, Charcoal #242320, Terracotta #A64F31, Sand #D8C9B7, Olive #536052. Rebuild the rest of the design system.
- Do not assume commerce, social-feed, Instagram integration, saved items, global search or other unverified capabilities.
- “Inquiries” is the existing messaging feature, not a new lead-management concept.

## Source-of-truth rules
- Before material implementation claims or changes, inspect latest `main`, record its SHA and trace current source, migrations, tests and configuration.
- Older docs, old agent skills, historical permission statements and stale issue descriptions are derived/historical only when they conflict with latest main or current owner direction.
- Never weaken actual server-side authorization, privacy or safety enforcement.
- Update stale documentation and skills to align with this product direction.
- GitHub issues/PRs are task scope and review records; explicit owner approval and platform safety gates still apply.

## Repository baseline
- Repository: `AminBrave/rad-art-marketplace`.
- Baseline main inspected for this reconstruction: `4db615e7ff271446640dd79ad2aa1c24553f7966` (2026-11-21).
- Work branch: `refactor/rademan-product-foundation`.
- Initial source-level audit and reconstruction documents are in `AI/RECONSTRUCTION/`.
- Frontend: React 18, React Router, TanStack Query, Vite. Backend: Laravel. Verify exact versions in manifests before relying on specific APIs.
- Router: `resources/js/app/AppRouter.jsx`; role navigation: `resources/js/app/workspaceNavigation.js`; API routes: `routes/web.php` under `api/v1`; health endpoint: `routes/api.php`.

## Confirmed initial findings (source inspection only)
- Existing public discovery includes artwork catalogue/details, artist directory/profiles and editorial collections.
- Existing workspaces include buyer overview/messages; artist overview/profile/artwork management/messages; admin users, artwork moderation, message reports and editorial curation.
- Messaging is substantial: conversation list, history/pagination, polling sync, composer, message actions, attachments, artwork context and safety workflows exist in current source. Inspect before changing.
- Messaging sync currently polls at five-second intervals in `useMessagingQueries.js`; do not describe it as WebSocket/push real-time.
- Conversation endpoints are participant-authorized; direct conversation creation is buyer-role constrained in `routes/web.php`. Trace policies/controllers before any access change.
- Initial CSS inspection found a light semantic token system; a complete dark theme was not established by that inspection.
- Initial repository-tree inspection found no manifest/service-worker implementation; installability is not established.
- `resources/js/app/App.jsx` and `AppRouter.jsx` both contain substantial code; verify entrypoint/import usage before classifying the former as legacy or removing anything.

## Work completed
- Created branch `refactor/rademan-product-foundation` from main baseline `4db615e7ff271446640dd79ad2aa1c24553f7966`.
- Added current-state, target-architecture, capability-matrix, route-map, messaging-preservation, implementation-roadmap and index documents under `AI/RECONSTRUCTION/`.
- Updated project/design direction, agent instructions, task workflow, human guide and relevant repository skills; marked the legacy component catalogue reference-only.
- Started the first code slice: semantic `--rd-*` tokens and Tailwind bindings; browser-persisted light/dark/system theme provider and early theme application; theme controls in public/workspace headers; product-aligned role navigation labels; improved workspace sidebar identity and narrow mobile public header.
- Existing route paths, API/data contracts and messaging components/behavior were not intentionally changed.

## Verification and safety status
- Code and documentation changes are on the working branch only. No tests, lint, builds, type checks, browser automation, migrations, scanners, CI, deployment or runtime verification have been run.
- The earlier source-level baseline remains static inspection. The new theme/shell implementation is not yet runtime-verified.
- Do not run executable verification or initiate CI without explicit permission for the specific execution.
- Messaging components, APIs, data and authorization code were not changed in the first code slice.

## Next actions
1. Review the complete code diff for the semantic tokens, theme lifecycle, navigation and layout changes.
2. Obtain explicit permission to run lint, token tests, production build and browser verification; validate light/dark/system across public, buyer, artist, admin and messaging surfaces.
3. Fix verified defects, update #265–#268 with implementation evidence, then open a focused PR for review. Do not merge without separate approval.
