# Manual Smoke Tests

These checks validate the features currently implemented in `main`. Run them against a disposable local/test database, never against production data. They complement—not replace—the automated test suite and the release QA checklist.

## Prepare a local environment

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure a disposable database in .env
php artisan migrate
npm install
npm run dev
```

In a second terminal, run `php artisan serve` and open the Laravel URL. For the automated suite, the CLI PHP environment must have `pdo_sqlite` and `sqlite3` enabled.

## Authentication and role boundaries

1. Register a Buyer and an Artist using separate email addresses. Confirm each account receives the selected role.
2. Attempt registration with `role=admin`; expect validation failure. Public registration must never create an administrator.
3. Refresh while signed in; confirm the session is restored. Sign out and sign in again.
4. Try an incorrect password and duplicate email; confirm understandable validation errors.
5. Promote a disposable account to Admin with `php artisan users:make-admin admin@example.com`.
6. Confirm guest access to protected APIs returns 401 and authenticated wrong-role access returns 403.
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
```

Record actual results and any manual/browser limitations in the PR and release checklist. Do not mark a check complete because the page exists or CI passed.
