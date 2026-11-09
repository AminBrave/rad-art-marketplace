# MVP 2 QA Checklist

This checklist tracks verification across the whole MVP 2 delivery. Run the relevant sections as features are merged, then complete all applicable items before release. A passing CI workflow does not replace browser, accessibility, security, or real-device verification.

## Automated quality gates

- [ ] `composer test`
- [ ] `php artisan test --filter=DemoDatabaseSeederTest`
- [ ] Seed the disposable local database with `php artisan db:seed` and verify the demo accounts/data in [demo data guide](demo-data.md).
- [ ] `composer lint`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run build:cpanel`
- [ ] Record the exact commit SHA and CI workflow result.

## Public marketplace — implemented; manual verification pending

- [ ] Open the homepage and confirm public artwork/category/artist content and fallbacks.
- [ ] Open `/artworks`; search, filter by category, paginate, and refresh with query parameters.
- [ ] Open an artwork detail route directly and refresh.
- [ ] Open `/artists`; search, paginate, and refresh with query parameters.
- [ ] Open a public artist profile directly; verify approved portfolio works only.
- [ ] Open `/about`, `/help`, and `/contact` directly and follow navigation/footer links.
- [ ] Verify private profiles and unapproved artwork are not publicly exposed.
- [ ] Verify unknown public paths render the not-found page.

## Authentication and role boundaries

- [ ] Register Buyer and Artist accounts; confirm Admin cannot be self-registered.
- [ ] Verify login, guest session bootstrap (`GET /api/v1/auth/me` returns HTTP 200 with `data: null`), session restoration, logout, and expired-session handling.
- [ ] Verify logout is protected and other protected feature APIs still reject guests with HTTP 401.
- [ ] Guest opening protected workspace routes is redirected to login.
- [ ] Buyer, Artist, and Admin are each restricted to their permitted workspace.
- [ ] Wrong-role access renders the unauthorized page.
- [ ] Verify server-side authorization and ownership using API requests, not only hidden UI controls.

## Artist workspace — Stage 3

- [ ] Artist overview uses real API data only.
- [ ] Artist can manage only their own profile and artworks.
- [ ] Submission/edit forms match API validation and image constraints.
- [ ] Upload preview/progress/error states work where supported.
- [ ] Moderation status and feedback reflect backend responses.
- [ ] Artist inbox lists only inquiries addressed to their profile.
- [ ] Read/archive actions update server state; no reply/chat UI is implied.

## Buyer workspace — Stage 4

- [ ] Buyer overview and inquiry history use only the authenticated buyer's records.
- [ ] Inquiry detail links and statuses reflect the API.
- [ ] Empty, loading, error, and unauthorized states work.
- [ ] No reply/chat, email-delivery, or unsupported account settings are implied.

## Admin workspace — Stage 5

- [ ] Admin-only navigation and route guard are correct; API denies non-admin access.
- [ ] Overview pending-artwork and user totals match paginator metadata; partial API failures are recoverable.
- [ ] Moderation filters and pagination preserve URL state and match API results.
- [ ] Approve, reject, and request-changes use exact API payloads; notes are required for the latter two.
- [ ] Only pending-review artworks expose actions; invalid/concurrent decisions show server errors.
- [ ] User pagination and fields match the API response.
- [ ] Role assignment offers only `artist` and `admin`; server blocks self-demotion.
- [ ] No unsupported search, Buyer-role assignment, deletion, suspension, or analytics UI is present.

## Persian, RTL, accessibility, and responsive behavior — Stage 6

### Source-level review recorded for this PR

- The Blade document declares `lang="fa"` and `dir="rtl"`; Vazirmatn and Inter are configured as the approved font families.
- Inspected marketplace/workspace views use Persian number/date/price formatting and explicit LTR treatment for account email and URL fields.
- Global visible focus styling and `prefers-reduced-motion` handling are present.
- Artwork cards now have a localized failed-image fallback, lazy loading, and asynchronous decoding. Homepage hero and artwork detail imagery use eager/high-priority loading; detail media reserves a responsive aspect ratio.
- These are source-level findings, not proof that all UI strings, rendered contrast, viewport layouts, or assistive-technology behavior passed real-browser testing.

- [ ] All user-facing MVP 2 copy is Persian and RTL is consistent.
- [ ] Mixed Persian/Latin names, URLs, emails, and numeric values display correctly.
- [ ] Keyboard-only navigation and visible focus work.
- [ ] Labels, validation errors, dialogs, status announcements, and touch targets are accessible.
- [ ] Contrast and reduced-motion behavior are acceptable.
- [ ] Phone, tablet, desktop, and wide-desktop layouts have no critical overflow.
- [ ] Artwork alternatives, loading, aspect ratio, and layout stability are verified.

## Performance, security, and release

- [x] Artwork-card images are lazy-loaded and decoded asynchronously; homepage hero and artwork detail imagery are eager/high-priority.
- [x] Artwork-card and detail containers reserve image aspect ratios; artwork cards show a localized fallback when an image fails.
- [ ] Verify workspace/upload image behavior and actual layout shift using browser tooling.
- [ ] Verify public artist profile portfolio pagination and artist artwork management pagination, including page changes and error states.
- [x] A static first-paint skeleton is present before React mounts; route-level loading placeholders preserve navigation shells and reserve media dimensions.
- [x] Public and workspace feature screens are split into lazy-loaded route bundles; artist artwork/inquiry tools load when opened.
- [x] Public artist portfolios and artist artwork management use bounded simple pagination (12 records/page) rather than unbounded responses.
- [ ] Verify every route's loading skeleton against its final rendered layout at supported viewport widths.
- [ ] Run Lighthouse mobile and desktop on homepage, catalogue, artwork detail, artist profile, and authenticated workspace routes; record exact scores and actionable audits.
- [ ] Record repeatable LCP, CLS, INP, TTFB, transfer-size, request-count, and route-bundle measurements before/after.
- [ ] Public route loading, bundle behavior, and API waterfalls are measured in a production-like environment; optimizations are evidence-based.
- [ ] Private image access and upload validation remain protected.
- [ ] Target PHP version/extensions, HTTPS, document root, and storage permissions are verified.
- [ ] Backup exists, is readable, and a restore drill succeeds.
- [ ] Production-like smoke tests and rollback plan are recorded.

Use [manual smoke tests](manual-smoke-tests.md) for feature-specific steps and [release checklist](release-checklist.md) for sign-off. Mark items only after actual execution.


## M00 automated verification evidence — 2026-11-10

**Passed CI:** commit 6da7d608333ba046a90cc050808854f0d2767474 · [GitHub Actions run #42715135296](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42715135296)

Observed successful steps:
- Backend job: composer install, composer test, and composer lint.
- Frontend job: npm ci, npm run test:frontend, npm run lint, and npm run build.

These are verified CI results. They do not check off the manual/browser/device, accessibility, performance-measurement, production-host, or backup/restore items above. M00-specific browser E2E coverage for the buyer inquiry detail route and artwork count/price display is not evidenced. The Stage 6 tracker issues #26–#29 were reopened on 2026-11-10 because their previous closed state conflicted with their unchecked acceptance criteria.
