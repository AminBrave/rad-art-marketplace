# Rademan — current architecture

This document is a source-backed map of the implementation, not a target architecture. It should be updated when code changes materially and may be superseded by a user-approved redesign. Verify every relevant path before relying on it.

## Technology observed

The manifests currently declare:
- PHP 8.3+ and Laravel 13.
- React 18 and JavaScript.
- React Router 7 and TanStack Query 5.
- Vite 8 and Node 20.19+.

See composer.json and package.json for current constraints and scripts.

## Application entry points

- Laravel serves the application and defines HTTP routes.
- The production frontend mount is resources/js/app.jsx.
- resources/js/app/AppRouter.jsx contains the React Router configuration and lazy-loaded route screens.
- resources/js/app/RoutingPages.jsx and related layout/auth modules provide route and workspace boundaries.
- resources/js/app/workspaceNavigation.js centralizes role-specific workspace navigation.

## Backend routing

- routes/web.php currently contains public web routes and a grouped api/v1 route set.
- routes/api.php currently contains the health endpoint.
- The placement of routes is an implementation observation, not a recommendation that they must remain there. Evaluate Laravel middleware, CSRF, authentication, rate limiting, route naming and compatibility before reorganizing.

## Frontend state and UI

- Shared UI components currently live under resources/js/components/ui/.
- Global CSS and semantic design variables currently live in resources/css/app.css.
- TanStack Query is used for server-state concerns; inspect the actual hooks and query keys before changing caching or synchronization behavior.
- Route guards improve navigation and user experience; server-side authorization remains the security boundary.

## Product domains observed

The application includes public artwork and artist discovery, editorial/collection pages, buyer and artist workspaces, messaging, and administration functionality. Backend routes also expose artwork interactions and artist-follow behavior. Verify the exact current feature state through routes, controllers, policies, models, migrations and UI before describing it as complete.

Messaging is a substantial domain. Trace conversation identity, participant authorization, message lifecycle, attachments, reactions, read state, synchronization and safety/reporting behavior before changing its contracts.

## Architecture decision guidance

For a proposed architectural change:
1. Define the concrete problem and desired outcome.
2. Map the current request, data and state flow.
3. Compare at least one simpler option with any more elaborate alternative.
4. Consider compatibility, migration, security, performance and operational costs.
5. Recommend the option with the best overall fit and explain the trade-offs.
6. Follow the user's chosen direction.

Do not preserve this architecture simply because it is documented. Do not replace it merely to follow a fashionable pattern. Let requirements and evidence drive the change.

## Frontend target architecture

The source-backed current-state map above is distinct from the approved target ownership and dependency rules. See [FRONTEND-ARCHITECTURE.md](FRONTEND-ARCHITECTURE.md) for the feature-first target structure, migration constraints, compatibility policy and boundary-check command. The target document does not imply that its folders or boundaries have already been fully implemented.
