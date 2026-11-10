# Manual Smoke Tests

These checks validate the features currently implemented in `main`. Run them against a disposable local/test database, never against production data. They complement—not replace—the automated test suite and the release QA checklist.

## Prepare a local environment

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure a disposable database in .env
php artisan migrate
php artisan db:seed # seeds local-only demo data and test accounts
npm ci
npm run dev
```

In a second terminal, run `php artisan serve` and open the Laravel URL. To run the complete local HTTPS stack on a machine with Caddy installed and trusted, configure `APP_URL=https://rad.localhost` and `SESSION_SECURE_COOKIE=true`, then run `npm run dev:local` and open `https://rad.localhost`. For the automated suite, the CLI PHP environment must have `pdo_sqlite` and `sqlite3` enabled.

## Demo accounts and dataset

Use the seeded accounts documented in [demo data and test accounts](demo-data.md). The shared demo password is `Demo@12345`. The dataset includes 14 artist profiles (one private), 3 profile-incomplete artists, 4 buyers, all artwork moderation and availability states, 15 approved works on the main artist profile, 70 artworks with generated private SVG thumbnails, and 48 inquiries. Use the main artist/buyer/admin accounts to verify the three role-specific workspaces. Seed only a disposable local database; the seeder is guarded against non-local/non-testing environments.

## Loading, visual stability, and performance

1. Open each public route directly (home, catalogue, artwork detail, artist directory, artist profile, About, Help, Contact, login, and registration) on a cold cache. Confirm the initial boot skeleton appears before the React screen and that the public navigation shell remains visible while route code loads.
2. Open Artist, Buyer, and Admin workspace routes on a cold cache. Confirm the role-check and route skeletons preserve the workspace frame and do not flash an empty page.
3. Use a slow network profile and CPU throttling. Confirm skeleton blocks reserve the same major media and content regions as the loaded page; record any visible shifts rather than assuming they are absent.
4. Confirm below-the-fold artwork images load lazily, primary imagery loads promptly, broken images show the designed fallback, and no image changes its reserved frame when it loads.
5. Create an artist with more than 12 approved portfolio works. Confirm the public profile initially loads 12 works and “نمایش آثار بیشتر” appends the next page without duplicates; verify the final page hides the control.
6. Create an artist with more than 12 submitted works. Confirm `/dashboard/artist/artworks` displays 12 at a time, previous/next navigation works, and editing/submitting an item returns the list to page 1.
7. Run Lighthouse mobile and desktop on the release candidate for `/`, `/artworks`, a representative `/artworks/{slug}`, `/artists/{slug}`, and representative authenticated workspace routes. Save JSON/HTML reports, environment, browser version, throttling, scores, LCP, CLS, INP, TTFB, and each actionable audit. Repeat runs and compare medians.

## Authentication and role boundaries

1. Register a Buyer and an Artist using separate email addresses. Confirm each account receives the selected role.
2. Attempt registration with `role=admin`; expect validation failure. Public registration must never create an administrator.
3. Refresh while signed in; confirm the session is restored. Sign out and sign in again.
4. Try an incorrect password and duplicate email; confirm understandable validation errors.
5. Promote a disposable account to Admin with `php artisan users:make-admin admin@example.com`.
6. Confirm `GET /api/v1/auth/me` returns HTTP 200 with exactly `{"data": null}` for a guest, and returns the current user payload after login.
7. Confirm logout remains protected; after logout, `GET /api/v1/auth/me` again returns HTTP 200 with `data: null`. Other protected feature APIs still return 401 for guests, and authenticated wrong-role access returns 403.
7. Confirm an administrator cannot remove their own administrator role through the role-update endpoint.

## Artist profile and public directory

1. Sign in as an Artist and create a profile with display name, biography, city, website, and Instagram handle.
2. Confirm the profile is saved after refresh and can be made public/private.
3. Open `/artists`; confirm only public artist profiles are listed.
4. Search the directory by artist name and city; move between pages if enough test profiles exist.
5. Open `/artists/{slug}` as a guest; confirm public profile details and approved portfolio works appear.
6. Make a profile private; confirm guests and unrelated users cannot read it, while its owner retains authorized access.
7. Try to access or update another artist's private profile through the API; the server must deny it.

## Artist workspace

1. Sign in as an Artist and open `/dashboard/artist`; confirm the profile state is accurate and artwork/inquiry summaries load from the existing endpoints.
2. With a new artist account, confirm the overview directs the artist to complete the profile before artwork and inquiry management.
3. Open `/dashboard/artist/artworks`; confirm the current artist sees only their own works and the page handles empty, loading, and API-error states.
4. Create an artwork with an active category and a JPG, JPEG, PNG, or WebP image no larger than 5 MB and 6000 × 6000 pixels. Confirm the local preview and upload feedback are usable.
5. Submit invalid fields and an invalid/oversized image; confirm client guidance and server validation errors are clear and recoverable.
6. Confirm a successful new submission shows the server-returned pending-review state. Edit an existing work; confirm the returned state and review note reflect the server response.
7. Confirm an artist cannot edit another artist's artwork and cannot set owner, moderation status, or reviewer metadata from the client. No delete action should be present.
8. Open `/dashboard/artist/inquiries`; confirm only inquiries addressed to the signed-in artist appear, with page navigation and a separate detail view.
9. Open an inquiry detail, mark it read, then archive it; confirm the server-returned state is shown and actions become unavailable as appropriate.
10. Confirm the detail view contains only API-provided metadata and never exposes buyer email. Verify no reply/chat composer or email-delivery claim appears.
11. Use separate artist accounts to verify recipient isolation through the UI and direct API requests; another artist's inquiry must return 404.

## M04 artist experience

1. Register a fresh Artist and open /dashboard/artist. Confirm the guided checklist explains its five profile fields and does not show a fabricated score or engagement analytics.
2. Save a profile with only a display name and verify the completed-field count changes only for fields actually supplied. Add a biography, city, and one social/website link; confirm the matching checklist items update after save.
3. Keep the profile private and use **پیش‌نمایش خصوصی پروفایل**. Confirm the owner can preview it while a guest and a different artist receive no profile content. Confirm preview does not change the visibility setting.
4. Make the profile public and use the preview link again. Confirm the public-facing profile shows only approved artworks and the profile's actual public details.
5. Submit artwork using JPG/JPEG, PNG, and WebP fixtures within the 5 MB and 6000 × 6000 pixel limits. Confirm preview and upload progress, and verify server response is the source of the resulting moderation state.
6. Select an unsupported file type, a file larger than 5 MB, a corrupt image, and an image exceeding 6000 pixels in either dimension. Confirm each is rejected with a clear, recoverable message before upload. Also submit an invalid image directly to the API and confirm Laravel rejects it.
7. Verify the artist artwork list explains pending review, approved, rejected, and changes-requested states. For rejected/changes-requested work, confirm the actual moderation note is visible and editing/re-submitting retains the artist's form values on failure.
8. Verify an artwork edit returns to pending review and clears previous moderation metadata; public catalogue and portfolio must continue to expose approved works only.
9. Open /dashboard/artist/inquiries and verify the meaning of new, read, and archived states. Mark a new request as read and archive it; confirm server-returned state is displayed and no reply, email, or notification is claimed.
10. Use two artist accounts to verify profile, artwork, and inquiry ownership isolation through both UI and direct API requests.

## Buyer workspace

1. Sign in as a Buyer and open `/dashboard/buyer`; confirm the total is the API paginator total and the latest inquiry matches the newest record.
2. With a Buyer account that has no inquiries, confirm the overview and history show an empty state with a link to discover artists.
3. Open `/dashboard/buyer/inquiries`; confirm only the signed-in buyer's sent inquiries appear, in newest-first order, with the artist, optional artwork, date, and API status.
4. Navigate between history pages and confirm the URL page query and records match the API paginator.
5. Open an inquiry detail from the list, refresh the detail URL, and use the back-to-list action; confirm the page context is preserved.
6. Open a valid inquiry detail URL directly; confirm the original subject/message, artist context, optional artwork context, date, and current server status.
7. Use another Buyer account to request the first buyer's inquiry detail URL; expect the API to return 404 and the UI to show a not-found state without leaking inquiry content.
8. Confirm Buyer status is read-only and there are no reply/chat controls or email addresses. An inquiry is an initial contact request, not a conversation or email-delivery feature.
9. Verify guest and wrong-role workspace navigation is redirected by the role guard, and protected API access remains server-authorized.

## Admin workspace

1. Sign in with a server-provisioned Admin account and open `/admin`; confirm pending-review artwork and total user counts match paginator totals from the two admin endpoints.
2. Confirm the overview handles either endpoint failing independently and never presents fabricated activity, unread counts, or analytics.
3. Open `/admin/artworks`; switch among pending, approved, changes-requested, and rejected filters. Confirm status and page are reflected in the URL and pagination matches the API.
4. Verify artwork image, title, artist, category, description, medium, dimensions, year, creation date, and review note use only fields returned by the API.
5. Approve a pending artwork without a note. Confirm it disappears from the pending queue and the API reports the decision.
6. Reject a pending artwork and request changes for another; each action must require a non-empty note, show server feedback, and refresh the queue. Non-pending items must have no action controls.
7. Open `/admin/users`; verify 20-item server pagination and API-backed account fields.
8. Promote a disposable Buyer or Artist to Admin, and change a different Admin to Artist. Confirm the updated role is reflected after the API response.
9. Confirm there is no Buyer assignment, search, deletion, or suspension UI. Attempt self-demotion through the API and expect HTTP 422.
10. Verify guest and wrong-role requests are denied by Laravel (401/403) even if the UI route is visited directly.

## Public artwork discovery

1. Submit an artwork as an Artist with an active category and a JPG, JPEG, PNG, or WebP image no larger than 5 MB and 6000 × 6000 pixels.
2. Confirm the artwork enters pending review and is not visible in the public gallery or to guests through its detail/image routes.
3. As an Admin, approve the artwork. Confirm it appears in `/artworks` and on its artist's public profile.
4. Search by title, description, or medium; filter by active category; verify page navigation and URL query state.
5. Open `/artworks/{slug}` directly and refresh. Confirm artist link, category, available metadata, image, and inquiry entry point render.
6. Try invalid image formats, oversized images, and inactive categories; confirm server validation rejects them.
7. Confirm an artist cannot edit another artist's artwork and cannot submit or edit while signed out.

## Artwork moderation

1. As an Admin, open the moderation queue and filter by supported statuses.
2. Approve one pending artwork without a note.
3. Reject another pending artwork with a note; verify the artist sees the feedback.
4. Request changes for a third pending artwork with a note.
5. Edit and resubmit the changes-requested artwork as its owner; confirm it returns to pending review and prior review metadata is cleared.
6. Attempt to moderate an already decided artwork; expect HTTP 422.
7. Confirm non-admin users cannot access moderation endpoints and public responses do not expose moderation status or rejection notes.

## Buyer-to-artist inquiries

1. Sign in as a Buyer and submit an inquiry to a public artist profile.
2. Submit a second inquiry from an approved artwork detail page, associating that artwork.
3. Confirm the Buyer sees only their own sent inquiries.
4. Sign in as the recipient Artist; confirm only inquiries addressed to that profile appear.
5. Mark an inquiry read and then archived; confirm the status updates.
6. Attempt to access another buyer's inquiry or another artist's received inquiry; expect the server to deny it.
7. Try a private artist, an artwork belonging to another artist, or a non-approved artwork; the request must be rejected.
8. Test short/long subject and message validation, honeypot rejection, and request throttling.
9. Confirm inquiry payloads omit both parties' email addresses. Do not interpret this feature as email delivery, chat, or a reply channel.

## Public information pages

1. Open `/about`, `/help`, and `/contact` directly and refresh each route.
2. Confirm navigation/footer links resolve and the copy does not promise unsupported services, email delivery, payments, or legal advice.
3. Confirm unknown paths render the not-found page.

## Quality commands

```bash
composer test
composer lint
npm run lint
npm run build
npm run build:cpanel
```

Record actual results and any manual/browser limitations in the PR and release checklist. Do not mark a check complete because the page exists or CI passed.


## Stage 6 release verification

Run these checks at 320, 375, 390, 768, 1024, 1280, and 1536 CSS pixels in current Chromium, Firefox, and WebKit where available. Record browser/version, viewport, operating system, account role, route, and result; do not mark a device/browser as passed unless it was actually tested.

1. Navigate homepage, catalogue, artist directory, artwork detail, artist profile, About, Help, and Contact routes using keyboard only. Confirm logical tab order, visible focus, and no keyboard traps.
2. Repeat critical journeys as Guest, Buyer, Artist, and Admin. Confirm role redirects, direct route refresh, and server-side denial for unauthorized API requests.
3. Submit invalid and valid login/register, artist profile, artwork upload, buyer inquiry, artist read/archive, and admin moderation/user-role forms. Confirm labels, inline errors, required notes, status announcements, and focus behavior.
4. Test Persian text mixed with Latin names, email addresses, URLs, artwork dimensions, years, and large Rial values. Confirm correct direction and readable wrapping.
5. Simulate slow network, failed artwork image requests, empty API responses, 401/403/404/422/429 responses, and retry flows. Confirm image fallback and no private image leakage.
6. Inspect horizontal overflow, touch targets, dialog/menu behavior, table scrolling, contrast, and reduced-motion mode at each viewport.
7. Use browser performance tooling to capture LCP, CLS, image transfer sizes, request counts, and route bundle sizes on a documented test dataset. Compare before/after using the same environment; do not infer a performance score from a production build alone.
8. Run `composer test`, `composer lint`, `npm run lint`, and `npm run build`; attach workflow run and commit SHA.
9. On the actual target host, verify PHP 8.3+, required extensions, HTTPS, document-root isolation, private storage permissions, migrations, logs, and production configuration. Take a backup and complete a restore drill before production sign-off.


## Automated browser regressions

CI runs the buyer and M02 Chromium browser suites against the actual Laravel-served React application using deterministic API fixtures. The 16 tests cover buyer inquiry history/detail navigation, direct deep links and refresh, back navigation with page context, guest/wrong-role redirects, not-found UI privacy, artist artwork totals, price formatting, homepage discovery, URL-backed catalogue filters, artwork detail/related works, artist portfolio filtering/load-more, both discovery-to-inquiry entry points, and viewport overflow at 320, 375, 768, 1024, and 1440 CSS pixels.

Run locally after preparing the app and building the frontend:

```bash
python -m pip install playwright==1.55.0
python -m playwright install --with-deps chromium
php artisan serve --host=127.0.0.1 --port=8000
python -m unittest discover -s tests/browser -p 'test_*.py' -v
```

M02 PR CI [run #42724547388](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42724547388) and post-merge main CI [run #42724722130](https://github.com/AminBrave/rad-art-marketplace/actions/runs/42724722130) passed all 16 Chromium browser tests and the backend/frontend jobs. API authorization and inquiry creation are tested separately by Laravel feature tests, including cross-buyer inquiry isolation and approval/ownership requirements for artwork-linked inquiries.

These automated checks do not replace manual visual design review, Firefox/WebKit, assistive-technology, mixed-direction, image-transfer performance, target-host, or backup/restore checks.


## M02 public discovery and artwork experience

1. Open the homepage as a guest. Confirm the editorial hero links to a real approved artwork, category pathways use active categories returned by the API, and artist spotlights link to public profiles. Do not interpret the newest item or directory order as manually curated editorial placement.
2. Open the catalogue. Search by title, description, medium, and public artist display name. Combine category, medium, and availability filters; change sorting; copy the URL into a new tab and refresh. Confirm filters and page state remain in the URL and results match the API.
3. Exercise every supported sort option (newest, oldest, title ascending/descending, year ascending/descending, and price ascending/descending). Confirm unknown/null year and price values remain last.
4. Confirm catalogue and filter metadata never reveal pending artwork, private artist profiles, private-profile mediums, rejection notes, or moderation state.
5. Open an approved artwork detail URL directly and refresh. Confirm image fallback, title, artist, category, medium, dimensions, year, price semantics, and availability wording. A null price must remain “قیمت اعلام نشده”; zero must remain “۰ ریال”.
6. Confirm related works, when available, are approved/public and share the artwork's category or artist. Confirm the current artwork is not repeated.
7. Open an artist profile. Confirm biography, city, public links, and approved portfolio only. Filter the loaded portfolio by category and load subsequent portfolio pages; confirm no duplicate works.
8. As a Buyer, submit an inquiry from both artwork detail and artist profile. Confirm the correct artist and optional artwork context are used. Guests are sent to login; non-Buyer roles do not receive a Buyer inquiry form.
9. Set browser widths to 320, 375, 768, 1024, and 1440 CSS pixels. Confirm no horizontal overflow, image containers reserve space, filters remain usable, and artwork cards preserve readable hierarchy.
10. Simulate failed image requests and slow API responses. Confirm accessible image fallback, loading, empty, and error states; retry without losing URL-backed filter state.


## M03 — Editorial curation

1. As Admin, open `/admin/editorial`.
2. Create a collection with an introduction and several approved public artworks. Save as draft; verify it is absent from `/collections` and its detail URL returns 404.
3. Publish the collection; verify it appears in the public list and detail page with artworks in the selected order.
4. Edit the introduction and artwork order; save and confirm the stable collection slug remains unchanged.
5. Unpublish the collection; verify the public detail URL returns 404.
6. Select featured public artists, add an editorial introduction, and save. Verify only active published selections appear on the homepage.
7. Confirm pending artworks and works owned by private artist profiles cannot be attached to public collections.
8. Verify non-admin accounts receive 403 from every `/api/v1/admin/editorial/*` endpoint.
9. Verify editorial audit rows record the admin actor and collection/featured-artist actions.


## M05-T01 — Private conversation API foundation

1. Sign in as a seeded Buyer who has sent an inquiry and open POST /api/v1/inquiries/{id}/conversation. Confirm a conversation is returned and the original inquiry text is the first message.
2. Repeat the same request. Confirm the same conversation and initial message are returned; no duplicate conversation/message is created.
3. Sign in as the recipient Artist and open GET /api/v1/artist/conversations. Confirm only conversations addressed to that artist are listed.
4. Sign in as the Buyer and open GET /api/v1/buyer/conversations. Confirm only that buyer's conversations are listed.
5. Send a message from each participant. Retry one POST with the same client_message_id and confirm the API returns the existing message instead of creating a duplicate.
6. Read the message history as the other participant and mark the conversation read. Confirm unread_count is reduced and read_at is set on received messages only.
7. Try to open, list, send to, or mark read a conversation as an unrelated Buyer, another Artist, Guest, and Admin. Confirm non-participant resource access returns 404 and no message content is exposed.
8. Try to reply to a message from another conversation. Confirm validation returns 422.
9. Refresh the API reads and confirm messages, timestamps, sender identity, and inquiry/artwork context remain server-derived.
10. Confirm API responses omit participant email addresses and private storage paths.

The remaining M05 UI, real-time, attachment, notification and safety workflows have separate smoke-test steps when implemented. Do not infer their completion from this API slice.
