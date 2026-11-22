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
- Created branch `refactor/rademan-product-foundation`.
- Added current-state, target-architecture, capability-matrix, route-map, messaging-preservation and implementation-roadmap documents under `AI/RECONSTRUCTION/`.
- Updated `AI/PROJECT.md` and `AI/DESIGN-SYSTEM.md` to the current product direction.
- Further audit and remaining agent-skill/documentation alignment are in progress.

## Verification and safety status
- Source inspection only. No tests, lint, builds, type checks, browser automation, migrations, scanners, CI, deployment or runtime verification were run.
- Do not run executable verification or initiate CI without explicit permission for the specific execution.
- No app behavior or UI implementation has been changed in this documentation workstream.

## Next actions
1. Finish source-backed route/API/policy/data audit and inspect the actual app entrypoint plus stale docs/skills.
2. Align the remaining repository instructions and relevant agent skills; label the legacy component catalogue as reference-only.
3. Update issues #265–#268 with confirmed audit findings and propose the first bounded implementation PR (design tokens + shared shell, preserving messaging behavior).
