# MVP 2 Release Checklist

Use this checklist for a release candidate. A checked item requires evidence for that release; documentation, a merged PR, or CI alone is not evidence of production readiness. Assign an owner and record commit IDs, workflow links, test results, and hosting evidence.

## Scope and delivery

- [x] MVP 2 feature stages 1–5 are integrated; Stage 6 source-level QA and automated checks are recorded separately.
- [ ] Stage 6 QA issues are complete or explicitly accepted as documented residual risk by the product owner.
- [ ] README, roadmap, API reference, route map, changelog, and manual test guidance match the release.
- [ ] No deferred or unsupported feature is promised in UI copy or documentation.

## Build and code quality

- [ ] Confirm target runtime supports PHP 8.3+ and required extensions.
- [ ] Review pending migrations, schema impact, and rollback/forward-fix plan.
- [ ] Run `composer test`.
- [ ] Run `composer lint`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run build:cpanel` to verify the documented cPanel frontend build path.
- [ ] Review dependency advisories and lockfile changes.
- [ ] Record release commit SHA and CI result.

## Environment and operations

- [ ] Confirm production MySQL, HTTPS, document root, private storage, and file permissions.
- [ ] Confirm valid TLS certificate and automatic HTTP-to-HTTPS redirect without loops.
- [ ] Confirm session cookies are marked Secure in production.
- [ ] Confirm HSTS is present on HTTPS responses and covers only verified hostnames.
- [ ] Verify HTTP/2 negotiation on the production TLS endpoint.
- [ ] Verify HTTP/3 negotiation if the hosting provider supports/enables it; otherwise record the provider limitation.
- [ ] Confirm `APP_ENV=production`, `APP_DEBUG=false`, and secure secret handling.
- [ ] Confirm pre-release database and private-upload backups exist and are readable.
- [ ] Complete a restore drill or verify a recent successful restore.
- [ ] Confirm rollback owner and recovery procedure.
- [ ] Run the [cPanel deployment and smoke-test procedure](cpanel-deployment.md) if cPanel remains the selected host.

## Public marketplace

- [ ] Verify homepage, artwork catalogue, search, category filters, and pagination.
- [ ] Verify artwork detail, public artist directory, artist profiles, and approved-only portfolios.
- [ ] Verify About, Help, and Contact pages and all public navigation/footer links.
- [ ] Verify private profiles, unapproved artwork, and private image files remain inaccessible publicly.

## SEO and shareability

- [ ] Confirm public artwork, artist and published-collection pages emit unique server-rendered title/description, canonical, Open Graph/Twitter and factual JSON-LD in the initial HTML.
- [ ] Confirm canonical origins use production `APP_URL`, not the incoming Host header.
- [ ] Validate `/sitemap.xml` contains only public artists, approved artworks belonging to public profiles, published collections and public static pages.
- [ ] Validate `/robots.txt` references the production sitemap and excludes authenticated workspace roots without blocking public artwork image URLs.
- [ ] Confirm private profiles, pending/private artworks and draft/unpublished collections are absent from public metadata and sitemap.
- [ ] Verify actual social preview fetches and crawler behavior on the deployed hostname; local HTML tests are not external indexing evidence.

## Authentication and workspaces

- [ ] Verify Buyer/Artist registration, login, logout, session restoration, and Admin provisioning.
- [ ] Verify guest `GET /api/v1/auth/me` returns HTTP 200 with `data: null`; authenticated sessions return the user payload, and logout remains protected.
- [ ] Verify server-side role and ownership boundaries.
- [ ] Verify artist profile, artwork submission/edit, upload, moderation feedback, and inquiry inbox workflows.
- [ ] Verify buyer sent-inquiry history/detail and privacy.
- [ ] Verify admin overview, moderation, and user management.
- [ ] Verify inquiry and conversation payloads omit both parties' email addresses and private storage paths; verify all conversation operations are participant-scoped.

## Performance and Lighthouse evidence

- [ ] Run Lighthouse mobile and desktop against the production-like release candidate for homepage, catalogue, artwork detail, artist profile, and authenticated role workspaces.
- [ ] Attach Lighthouse reports and record Chrome/Lighthouse version, host, build SHA, test location, network/CPU throttling, and run count.
- [ ] Record median LCP, CLS, INP, TTFB, transfer size, request count, and initial/route chunk sizes across repeat runs.
- [ ] Fix every actionable performance audit or document a justified exception with evidence and owner.
- [ ] Confirm no avoidable layout shifts occur during initial boot, route transitions, image loading, font loading, pagination, and workspace data loading.
- [ ] Review backend query counts and database query plans using production-like data; document any justified indexes or query changes.

## UX, accessibility, privacy, and legal

- [ ] Verify Persian-first copy, RTL, mixed-direction fields, dates, and number formatting.
- [ ] Verify keyboard access, focus visibility, contrast, labels, responsive breakpoints, and reduced motion.
- [ ] Review privacy notice, retention/deletion policy, and site contact details.
- [ ] Obtain site-owner and qualified local-counsel review of legal text.
- [ ] Review legal basis/consent before enabling any analytics provider; analytics collection is currently disabled.

## Stage 6 evidence boundary

The Stage 6 PR records source-level localization/RTL review, image-loading corrections, and automated CI. It does not certify real-browser/device accessibility, visual contrast across all rendered states, performance metrics, production-host compatibility, backup automation, or a successful restore. Those require access to the target environment and must remain unchecked until evidence is attached.

## Known limitations and product decisions

These capabilities remain outside the approved scope: payments, cart/checkout, orders, shipping, group chat, public social networking, native mobile apps, AI recommendations, subscriptions, advertising, general-purpose admin category CRUD, and featured placements. Private one-to-one messaging and message-specific safety/moderation are approved under M05. Real-time transport and optional email must not be enabled until target-host compatibility and operational controls are verified.

Email verification and password-reset UX are not implemented. Analytics is a proposal only. Hosting PHP 8.3+ compatibility, production deployment, backup automation, restore success, and browser/device QA remain unverified until evidence is attached.

## After release

- [ ] Run smoke tests with non-production test accounts.
- [ ] Review Laravel logs, browser console, and critical route failures.
- [ ] Verify private files are not web-accessible.
- [ ] Monitor moderation backlog and abuse/rate-limit signals.
- [ ] Keep previous release and backups until sign-off.


## M00 closeout evidence — 2026-11-10

- [x] M00 implementation PRs #85, #87 and #86 are merged into main.
- [x] Latest automated CI passed on 6da7d608333ba046a90cc050808854f0d2767474: [run #42715135296](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42715135296). Backend composer install, composer test, composer lint; frontend npm ci, npm run test:frontend, npm run lint, npm run build.
- [ ] Browser E2E for buyer inquiry detail route, refresh, role redirects and ownership isolation.
- [ ] Browser verification of artwork totals across pages and null/zero/positive price values.
- [ ] Independent review recorded for M00 PR changes and dependency lockfiles.
- [ ] Stage 6 QA issues #26–#29 complete or explicitly accepted as residual risk.
- [ ] Accessibility/responsive/RTL checks, performance measurements, target-host checks and backup/restore drill evidenced.

**Release decision:** M00 implementation is integrated and automated CI is green. M00 is not fully signed off, and this checklist must not be treated as a production deployment approval until the unchecked release gates are completed.


## M00 browser and API regression evidence — 2026-11-10

- [x] Buyer browser regression suite merged in PR #89.
- [x] Artwork total and price-state browser suite merged in PR #90.
- [x] [CI run #42721783132](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42721783132) passed backend, frontend, and Chromium browser jobs; 9 browser tests passed.
- [x] Existing backend `ArtistInquiryTest` covers cross-buyer detail 404, recipient isolation, and private-field omission.
- [ ] Manual cross-browser/device and viewport matrix.
- [ ] Keyboard, focus, screen-reader, contrast, reduced-motion, RTL and mixed-direction QA.
- [ ] Repeatable Lighthouse/Core Web Vitals and network/performance evidence.
- [ ] Target-host compatibility/configuration and production deployment verification.
- [ ] Backup creation and successful restore drill.

**M00 status:** implementation and automated regression coverage are integrated. Do not mark release readiness complete until all remaining manual/operational gates are verified or explicitly accepted as deferred risk.


## M05 — Secure messaging release gates

- [ ] Verify migrations on the supported production MySQL version and rehearse rollback/forward recovery.
- [ ] Verify participant-only access for conversation, message, attachment and report resources, including cross-account 404 behavior.
- [ ] Verify sender-only message edit/delete, content-free deletion tombstones, reply context, reaction idempotency, and sent/server-accepted/read state semantics.
- [ ] Verify rate limits, block/report behavior, admin audit trail, retention and private attachment storage.
- [ ] Verify notification content and deep links do not disclose message bodies or private resources to unauthorized recipients.
- [ ] Enable email only after queue/worker availability, sender identity, retry/failure handling, preferences and unsubscribe controls are verified.
- [ ] Enable real-time transport only after persistent process/broadcasting support is verified on the target host; otherwise document the polling fallback.
- [ ] Complete independent security review and product-owner acceptance before messaging launch.
