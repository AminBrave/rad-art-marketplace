# Test Suite Guide

The suite follows the product domains and test pyramid documented in [Testing Strategy](../docs/engineering/testing-strategy.md), [Coverage Matrix](../docs/engineering/test-coverage-matrix.md) and [API/Route Test Map](../docs/engineering/api-route-test-map.md).

## Directory ownership
- Unit/: isolated PHP logic; no HTTP/database boot.
- Feature/: Laravel HTTP/API and application behavior.
- Integration/: real database, filesystem, queue and notification boundaries.
- js/: Node.js tests for pure frontend logic and Vite SSR component rendering.
- browser/: Python Playwright tests. Keep mocked UI regressions distinct from unmocked full-stack journeys.
- browser/accessibility/: document direction, landmarks, accessible names and image alt smoke checks.
- Support/: shared test builders, fixtures and assertions; never place test cases here.

New backend tests should be grouped by domain below the layer, for example Feature/Messaging/MessagePrivacyTest.php or Unit/Support/PersianSearchTest.php. Existing flat tests remain supported while the suite is migrated incrementally.

## Naming
Prefer names that state actor, behavior and expected result:
- test_buyer_can_start_a_direct_conversation_with_an_artist
- test_non_participant_cannot_read_a_private_conversation
- test_unapproved_artwork_is_excluded_from_public_search

Avoid names that refer only to controller or method implementation details.

## Running

~~~bash
composer test
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature
php artisan test --testsuite=Integration
npm run test:frontend
./scripts/verify browser
~~~

Do not run browser tests against production. Browser tests require a local disposable application and database.
