# Phase 3 — Admin Artwork Moderation Smoke Test

Run this checklist against the branch/release under test after installing dependencies and applying migrations.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure a test database in .env
php artisan migrate
npm install
npm run dev
```

In another terminal, run `php artisan serve` and open the local URL.

## Access control

1. Sign in as an administrator and confirm the dashboard shows the artwork review panel.
2. Sign in as an Artist and confirm the moderation panel is not available.
3. As a Guest, request `GET /api/v1/admin/artworks`; expect HTTP 401.
4. As an Artist, request the same endpoint; expect HTTP 403.

## Moderation workflow

1. Submit a new artwork as an Artist. Confirm its status is pending review.
2. As an Admin, open the pending review list and confirm the artwork and artist details appear.
3. Approve one artwork without a note. Confirm its status becomes approved and it appears in the public catalogue.
4. For another pending artwork, try rejecting without a note. The UI/API must require a note.
5. Reject it with a clear note. Confirm its status becomes rejected and the note is visible in the artist studio.
6. For another pending artwork, request changes with a note. Confirm the artist sees the changes-requested state.
7. Edit and resubmit that artwork as its owner. Confirm it returns to pending review and previous moderation note/audit fields are cleared.
8. Try to moderate an already approved/rejected item again without artist resubmission. The API must return HTTP 422.
9. Confirm the administrator can filter the queue by pending review, approved, rejected, and changes requested.

## Review audit

- After a moderation decision, `reviewed_by` identifies the administrator and `reviewed_at` is populated.
- Deleting an administrator must not delete artworks; the nullable reviewer foreign key should become null.
- Public catalogue and detail endpoints expose approved artwork only.
