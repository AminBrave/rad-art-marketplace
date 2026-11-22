# Rademan reconstruction — current state

**Evidence baseline:** `main` at `4db615e7ff271446640dd79ad2aa1c24553f7966` (2026-11-21). This document records implementation evidence at that commit. Re-check source before implementation if the branch changes.

## Stack and application shape
- PHP / Laravel backend; React 18 frontend; React Router; TanStack Query; Vite. Exact dependency ranges are in `package.json`.
- React entry/router: `resources/js/app/AppRouter.jsx`; application/auth context in `App.jsx` and `AuthContext.jsx`.
- Public and authenticated layouts: `resources/js/app/Layouts.jsx`; role workspace composition in `RoutingPages.jsx`.
- Backend browser/API route declarations are currently grouped in `routes/web.php`; `routes/api.php` only declares the health endpoint.
- Shared UI primitives are under `resources/js/components/ui/`; current CSS tokens are in `resources/css/app.css`.

## Confirmed product areas
- Public: home, artwork catalogue/detail, artist directory/profile, editorial collections, about/help/contact, login/register.
- Buyer: overview and direct conversation inbox.
- Artist: overview, profile settings, artwork management, direct conversation inbox.
- Admin: overview, users/roles, artwork moderation, message reports, editorial collections/featured artists.
- Messaging is a substantial subsystem with canonical direct conversations, artwork contexts, history/sync, composer, replies, editing/deletion, attachments, reactions, read state, archive/mute and safety/report/block flows.

## Important implementation observations
- Role-specific UI routes are guarded in `AppRouter.jsx` by `RequireRole`; backend route groups also apply auth and role middleware.
- Conversation access is participant-scoped in `app/Policies/ConversationPolicy.php`; direct conversation creation is buyer-only and validates public artist profile / approved artwork context in `DirectConversationController.php`.
- Frontend messaging uses TanStack Query; message synchronization currently polls every five seconds while active (`useMessagingQueries.js`).
- Artist artwork management has create/edit/upload and review-status presentation (`ArtworkStudio.jsx`).
- Buyer overview is primarily a discovery/inquiry launchpad rather than a data-rich buyer activity dashboard (`BuyerWorkspace.jsx`).
- Existing role navigation is centralized in `workspaceNavigation.js`.

## Confirmed gaps against the approved direction
- Current CSS sets `color-scheme: light` and defines one light token set; a complete dark theme is not established in the inspected CSS.
- The recursive repository tree at the evidence commit contains no web app manifest or service-worker implementation; installability is not established by this audit.
- The current visual system and project guidance still describe the legacy RAD design system. Product owner direction is to retain only the five brand color anchors and rebuild the rest.
- Current role navigation labels/organization differ from the approved Discover / Buyer Studio / Artist Studio / Admin Console IA.

## Evidence limits
This is a source-level audit, not a runtime verification. No tests, builds, browser automation, migrations, CI or deployment were run. Route behavior, data access and security conclusions must be verified against full relevant call paths and tests before modifying them. Do not infer that absence from a partial file proves absence elsewhere; use the complete tree and search before implementation.
