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
