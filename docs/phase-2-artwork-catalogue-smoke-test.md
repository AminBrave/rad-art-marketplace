# Phase 2 — Artwork catalogue smoke test

Run after pulling the feature branch and applying migrations.

## Setup

```bash
git checkout feature/phase-1-identity-permissions
git pull origin feature/phase-1-identity-permissions
php artisan migrate
npm run dev
```

In another terminal, run `php artisan serve` and open the local URL.

## Artist submission and editing

1. Sign in as an artist account with a completed artist profile.
2. In the artwork editor, enter a title, category, optional description/specifications/price, availability, and a JPG, PNG, or WebP image smaller than 5 MB.
3. Submit the artwork. Confirm it appears in the artist's list with **در انتظار بررسی**.
4. Confirm its image preview works for the signed-in owner.
5. Edit the artwork and save. Confirm it returns to pending review.
6. Try submitting an SVG, an oversized image, or an inactive category; confirm validation errors appear.
7. Sign in as a different artist and try to update the first artist's artwork endpoint. The server must return 403.
8. Sign out and try to submit an artwork. The server must return 401.

## Public catalogue

1. Open the homepage and scroll to the artwork catalogue.
2. Confirm pending works do not appear.
3. After an administrator marks a test artwork as `approved` in the database, confirm it appears in the catalogue.
4. Search by title/medium and filter by category.
5. Open the artwork detail page and follow the artist profile link.
6. Try opening an unapproved artwork's image URL as a guest. It must be denied.

## Notes

The admin moderation queue and approval/rejection API are not included in this milestone. For a smoke test only, a test record can be marked approved directly in the local database; do not expose a public status-edit endpoint.
