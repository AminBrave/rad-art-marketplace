# Rademan — implementation snapshot

**Snapshot date:** 2026-11-23  
**Inspected ref:** agent/chatgpt  
**Purpose:** concise source-backed orientation for future work. This is a point-in-time observation, not a target architecture or a restriction on future user requests.

Re-inspect the relevant files before relying on any statement below. Update or remove this snapshot when it becomes stale.

## Stack observed in manifests

- PHP ^8.3, Laravel ^13.0 — composer.json
- React ^18.3.1, React Router ^7.18.5, TanStack Query ^5.107.1, Vite ^8.3.8 — package.json
- JavaScript modules; Node engine >=20.19.0

These are the observed dependency constraints, not a ban on proposing or adopting alternatives.

## Application structure observed

- Production React mount: resources/js/app.jsx.
- Main client router: resources/js/app/AppRouter.jsx; it uses React Router, lazy-loaded feature screens and authentication/role boundaries.
- Workspace navigation is centralized in resources/js/app/workspaceNavigation.js.
- Shared UI components are under resources/js/components/ui/.
- Global styling and semantic CSS variables are in resources/css/app.css.
- Browser-facing pages and the api/v1 route group are currently declared in routes/web.php; routes/api.php currently declares the health endpoint.

## Product areas observed

The router and navigation include public discovery/artwork/artist/editorial areas, buyer and artist workspaces, messaging, and administration areas for users, artwork and reports. Confirm route details in the current router and backend routes before making changes.

The codebase includes a substantial buyer–artist conversation subsystem. Its exact capabilities and invariants should be traced through current routes, controllers, policies, models, migrations, frontend queries/components and tests before changing it.

## Styling observations

resources/css/app.css defines semantic --rd-* variables and brand variables, alongside compatibility aliases and theme-related rules. Inspect actual usage before removing aliases or changing token semantics.

## Evidence limits

This snapshot is based on source and manifest inspection. It is not a full code review, runtime audit, accessibility assessment, test run, build, security assessment or deployment review. No claim about runtime health or complete feature coverage is implied.
