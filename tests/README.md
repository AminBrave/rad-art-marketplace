# Rademan Quality Engineering

This directory contains the automated quality checks for Rademan, a Persian-first artist discovery, portfolio publishing, editorial curation and artist-contact marketplace.

The suite is organized by the boundary being verified: Laravel domain/API behavior, database and storage integration, frontend logic and component contracts, and complete browser journeys. Browser coverage includes visitor-facing artist-directory empty/error/retry states and keyboard-submitted search, expired-session recovery to the originally requested workspace, and duplicate-registration submission protection. Test names should describe observable behavior and the user/security invariant—not the implementation detail.

## Start here

- [Quality matrix](QUALITY-MATRIX.md) — user journeys, actor/permission boundaries, scenario coverage and prioritized gaps.
- [Project agent contract](../AGENTS.md) — security, RTL, isolation and verification permissions.
- [Quality engineering skill](../.agents/skills/quality-engineering/SKILL.md) — test design and environment conventions.
- [Script reference](../scripts/README.md) — full command and report documentation.

## Current structure

```text
tests/
├── Unit/                         # Pure domain/support logic
├── Feature/                      # Laravel HTTP contracts and application behavior
│   └── Discovery/                 # Persian search normalization scenarios
├── Integration/
│   ├── Database/                  # Constraints and relational invariants
│   └── Storage/                   # Filesystem and rollback behavior
├── js/                            # Node test runner, React SSR and frontend contracts
├── browser/                       # Playwright end-to-end journeys
│   ├── accessibility/             # Browser accessibility checks and helpers
│   ├── test_artist_directory_resilience.py # Empty/error/retry and keyboard search journeys
│   └── test_auth_session_resilience.py     # Session expiry and duplicate registration
├── bootstrap.php                  # Isolated PHPUnit runtime
└── README.md                      # This guide
```

The current layout is intentionally retained. Existing feature tests cover several cohesive domains in individual files; do not move or rename them in bulk just to match a theoretical folder tree. Add a subdirectory when a domain has enough tests to make navigation materially clearer, then update the PHPUnit suite discovery only if needed.

## Test layers and ownership

| Layer | Location | Best for | Avoid |
|---|---|---|---|
| Unit | `tests/Unit` | Pure formatting, normalization, domain rules and deterministic helpers | HTTP routing, framework boot or duplicating feature assertions |
| Feature | `tests/Feature` | Request validation, authentication, role/ownership checks, response contracts and persisted outcomes | Browser layout or visual assertions |
| Integration | `tests/Integration` | Database constraints, storage, transactions, rollback and external boundaries | Repeating every controller happy path |
| Frontend | `tests/js` | Utilities, query behavior, design primitives, accessible markup contracts and React component rendering | Claiming browser interaction works based only on SSR |
| Browser | `tests/browser` | Real user journeys, navigation, responsive behavior, RTL, keyboard and accessibility | Re-testing every backend validation permutation |
| Manual | Release checklist / QA session | Screen-reader behavior, real devices, visual judgement and usability | Treating automated scans as proof of WCAG conformance |

## Existing focused commands

Run only with explicit authorization. The repository contract prohibits running tests, builds, lint, scanners, migrations or CI without the user's permission.

| Command | Scope |
|---|---|
| `npm run test:unit` | PHPUnit Unit suite |
| `npm run test:feature` | PHPUnit Feature suite |
| `npm run test:integration` | PHPUnit Integration suite |
| `npm run test:backend` | All PHPUnit suites |
| `npm run test:frontend` | Node frontend tests in `tests/js/*.test.js` |
| `npm run test:browser` | Playwright browser suite against the configured base URL |
| `npm run a11y:colors` | Focused semantic color/accessibility checks |
| `npm test` | Backend and frontend tests |
| `npm run verify` | Backend tests/style plus frontend tests/lint/builds |
| `npm run verify:all` | `verify` plus browser tests |

Browser tests require the isolated environment. `npm run browser:prepare` rebuilds only `database/browser-testing.sqlite` and isolated browser-test storage; `npm run dev:browser` starts the isolated app. Never point browser tests at a normal developer, staging or production database. See `scripts/README.md` for details.

## Scenario authoring standards

1. **Name the actor and outcome.** Prefer `test_non_participant_cannot_download_private_attachment` over `test_attachment_access`.
2. **Cover the negative boundary.** For protected operations include guest, authenticated wrong-role, wrong-owner/non-participant, and valid actor as applicable.
3. **Assert both response and state.** Verify status/payload and that forbidden or invalid requests did not mutate records or storage.
4. **Exercise lifecycle transitions.** Test valid state changes, invalid transitions, repeat requests, stale state and resubmission.
5. **Use deterministic, isolated fixtures.** Unique identities, fake storage, in-memory SQLite for PHPUnit, and the dedicated browser database for Playwright.
6. **Test API contracts deliberately.** Include status codes, validation shape, pagination, nullability, privacy-safe fields and stable resource structure.
7. **Keep tests independent.** No reliance on test order, shared seeded state, external network or wall-clock timing.
8. **Prefer user-observable assertions.** Browser tests should use accessible roles/names and visible outcomes rather than brittle CSS or DOM structure.
9. **Do not weaken a test to pass.** Fix the product defect or replace the assertion with equivalent/stronger coverage and document why.
10. **Do not equate line coverage with product quality.** Track critical journey and security-boundary coverage alongside any future coverage percentage.

## Planned architecture (incremental)

Add these directories only when new scenarios justify them; existing files remain in place until a safe, separately reviewed migration is worthwhile.

```text
tests/
├── Unit/
│   ├── Domain/{Artwork,Artist,Messaging,Discovery}/
│   └── Support/
├── Feature/
│   ├── Authentication/
│   ├── Authorization/
│   ├── Artists/
│   ├── Artworks/
│   ├── Discovery/
│   ├── Messaging/
│   ├── Notifications/
│   ├── Editorial/
│   ├── Admin/
│   └── SEO/
├── Integration/
│   ├── Database/
│   ├── Storage/
│   ├── Notifications/
│   ├── Transactions/
│   └── Concurrency/
├── Contract/{API,Resources}/
├── js/{unit,components,hooks,state,accessibility}/
├── browser/
│   ├── journeys/{visitor,buyer,artist,admin}/
│   ├── accessibility/
│   ├── responsive/
│   ├── visual/
│   └── fixtures/
├── performance/{lighthouse,load}/
├── security/{authorization,uploads,input-validation}/
└── Support/
```

Do not add empty directories or placeholder test classes. Keep the current PHPUnit, Node and Playwright frameworks. Introduce new tooling only for a concrete gap, with dependency compatibility and maintenance costs reviewed first.

## Reporting

- PHPUnit and Node JUnit output belongs under `build/test-reports/`.
- Browser artifacts belong in the browser runner's configured isolated output location.
- A missing report is not a passing report. Delete stale reports before a run (the existing runner already does this).
- Report separately: automated tests, lint/static analysis, build, accessibility scan, performance measurement and manual review.
- Always label verification that was not executed as **Not run**; never infer success from source edits.
