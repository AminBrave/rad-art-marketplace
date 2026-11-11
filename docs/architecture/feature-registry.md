# Feature Registry

## Source of truth

config/features.php is the server-side source of truth for feature availability. It currently defines:

| Feature | Default | Purpose |
|---|---:|---|
| inquiries | false | Artist inquiry submission, buyer/artist inquiry inboxes, and inquiry-to-conversation entry point |


Change a feature's boolean in this file rather than scattering environment checks or duplicated constants through the application.

Laravel injects the configured registry into window.__RAD_FEATURES__ from the application shell. Frontend code reads it through resources/js/app/features.js (isFeatureEnabled). Missing or unknown browser flags fail closed.

## Enforcement rules

A feature switch must be enforced at every relevant boundary:

1. **Backend routes and APIs are authoritative.** Apply the feature:<key> middleware to every feature-specific route. The middleware reads config('features.<key>') at request time and returns 404 when disabled. Keeping route definitions in place lets tests and operators re-enable the feature without editing route files; hiding a link is not access control.
2. **Frontend navigation and routes mirror availability.** Gate route registration, navigation items, public entry points and dashboard content with isFeatureEnabled('<key>').
3. **Keep permissions separate.** Feature availability answers whether a capability exists in this deployment. Policies, role middleware and ownership checks still decide which user may perform an enabled capability.
4. **Preserve unrelated modules.** A feature should not own shared infrastructure routes unless those routes are exclusive to it. Direct messaging remains independently enabled even while the inquiry-to-conversation bridge is disabled.
5. **Test both sides of the switch.** Cover disabled endpoint 404 responses, disabled UI entry points, enabled behavior, and regressions in dependent but independent features.

## Disabling and re-enabling Inquiry

Inquiry is disabled by default. Its controllers, React screens, model, migration, tests and existing artist_inquiries rows are retained. No destructive migration or data cleanup is part of a feature toggle.

The Inquiry endpoints remain declared but are blocked by feature middleware, returning 404 while disabled. This includes submission, buyer and artist inbox/detail/status endpoints, and the endpoint that creates a conversation from an inquiry. Public artist profiles no longer render the inquiry form. Buyer dashboards direct users to the direct-message inbox instead.

Direct messaging remains enabled independently: buyer-initiated conversations and the conversation, message, attachment, safety, notification and inbox endpoints continue to be registered. Do not remove or gate these shared messaging routes when changing the Inquiry flag.

To re-enable Inquiry, set inquiries to true, rebuild/clear Laravel's cached configuration as appropriate for the deployment, and run the feature-registry and inquiry test suites before release. Existing inquiry data becomes available again because it was not deleted.

## Adding a feature

1. Add a boolean key to config/features.php (default conservatively to false for incomplete or optional capabilities).
2. Apply feature:<key> middleware to backend routes and guard any non-route entry points, scheduled work or queued jobs that can invoke the capability.
3. Read the same key through isFeatureEnabled to gate React routes, navigation and user-facing entry points.
4. Add backend tests for enabled and disabled behavior, plus frontend tests for registry handling and navigation/route visibility.
5. Update API, frontend, system overview and feature documentation in the same change.
6. Deploy with Laravel configuration cache refreshed; never rely on a live environment-variable read in a cached route definition.

Feature flags are deployment-level switches, not a substitute for authorization or a full plugin/module isolation architecture. Add service/provider boundaries only when a feature's dependencies justify them.
