# Phase 2 — Artwork Catalogue Smoke Test

Run this checklist against the branch/release under test after installing dependencies and applying migrations. Do not switch to an old milestone branch: the catalogue and moderation features are part of the current integration baseline.

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

In a second terminal, run `php artisan serve` and open the local URL.

## Artist submission and editing

1. Sign in as an Artist account with a completed artist profile.
2. In the artwork editor, enter a title, active category, optional description/specifications/price, availability, and a JPG, PNG, or WebP image no larger than 5 MB and 6000 × 6000 pixels.
3. Submit the artwork. Confirm it appears in the artist's list with pending-review status.
4. Confirm the owner can view the uploaded image through the application route.
5. Edit the artwork and save. Confirm it returns to pending review and previous moderation metadata is cleared.
6. Try submitting an SVG, oversized image, or inactive category; confirm validation errors appear.
7. Sign in as another Artist and try to update the first artist's artwork. The server must deny the request.
8. Sign out and try to submit artwork. The server must return HTTP 401.

## Public catalogue

1. Open the homepage and catalogue.
2. Confirm pending, rejected, and changes-requested artwork do not appear.
3. Approve a test artwork through the administrator moderation workflow.
4. Confirm approved artwork appears in the catalogue.
5. Search by title/description/medium and filter by an active category.
6. Open the artwork detail page and follow the artist profile link.
7. Try opening an unapproved artwork's detail/image endpoint as a guest. Access must be denied or return not found according to the policy response.

## Notes

Artwork moderation is implemented in the current baseline; use the administrator moderation panel/API rather than directly editing database status values. Keep test accounts and test artwork confined to the non-production environment.
