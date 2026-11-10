# Demo data and test accounts

The demo dataset is designed to exercise the complete current Rademan MVP (M00–M04): public discovery, buyer/artist workspaces, admin moderation and user management, curated editorial content, privacy boundaries, pagination, empty states, and image fallbacks.

It is for local development and automated testing only. It is disabled outside Laravel's `local` and `testing` environments.

## Seed the dataset

After configuring the local environment:

```bash
php artisan migrate
php artisan db:seed
```

The default `DatabaseSeeder` invokes `DemoDatabaseSeeder`. You can also run it explicitly with `php artisan db:seed --class=DemoDatabaseSeeder`.

Seeding is repeatable: stable emails and slugs are updated in place, not duplicated. The seeder does not truncate tables or delete user-created records. It does overwrite the seeded demo accounts and demo slugs, including their demo passwords and seeded profile/artwork/editorial fields.

**Safety:** demo seeding refuses to run unless `APP_ENV=local` or `APP_ENV=testing`. Never remove this guard or reuse the public demo password for real accounts. For a completely clean local database only, `php artisan migrate:fresh --seed` drops and recreates every table; do not run that against a database containing data you need.

## Demo accounts

All demo accounts use password `Demo@12345`.

| Role | Email | Purpose |
| --- | --- | --- |
| Admin | `admin@rademan.test` | User management, artwork moderation, collections, featured artists |
| Artist | `artist@rademan.test` | Main public profile, 16 approved works, artist inbox and artwork pagination |
| Buyer | `buyer@rademan.test` | Inquiry submission and buyer history (12 sent inquiries) |
| Buyer with empty inbox | `buyer-empty@rademan.test` | Buyer dashboard empty state |
| Artist with private incomplete profile | `new-artist-01@rademan.test` | Onboarding, private profile preview, no artworks/inquiries |
| Artist with public incomplete profile | `new-artist-02@rademan.test` | Partial onboarding, public empty portfolio, no artworks/inquiries |

Additional accounts: `artist-02@rademan.test` through `artist-14@rademan.test`, `new-artist-03@rademan.test` (registered without a profile), and `buyer-02@rademan.test` through `buyer-04@rademan.test`. The fourteenth established artist profile is private. All accounts use the same password.

## Included variations

- 23 users: 1 Admin, 16 Artist accounts (15 with profiles and one registered without a profile), and 5 Buyers.
- 16 artist profiles: 14 public and 2 private, including fully completed and intentionally partial onboarding profiles.
- 6 active categories and 1 inactive category for filter/validation checks.
- 71 artworks across all categories and all moderation states: approved, pending review, rejected, and changes requested.
- All availability states: available, sold, and not for sale.
- Nullable and populated descriptions, media, dimensions, year, and price; zero-priced and unpriced works are included.
- Moderation notes, reviewer IDs, and timestamps.
- 16 approved works on the main artist profile to test the 12-item portfolio pagination boundary.
- One approved artwork intentionally points to a missing private image file to test image endpoint 404 and UI fallback behavior.
- 48 inquiries across new, read, and archived states, with and without an associated artwork; a separate buyer and two profiled artists have empty inboxes.
- Five curated collections: published with ordered artworks, draft, scheduled for the future, mixed approved/pending/private works, and published empty collection.
- Six featured-artist selections: active without dates, active bounded window, future, expired, unpublished, and private-profile selection.
- Editorial audit rows for seeded collection and featured-artist records.
- Locally generated SVG artwork placeholders on the private local storage disk; these are synthetic test assets, not licensed portfolio photography.

## Useful routes

- `/artworks`: public catalogue, category filters, search, sorting and pagination.
- `/artists`: artist directory, search and pagination.
- `/artists/arman-rezaei`: public artist profile and load-more portfolio.
- `/artists/artist-14`: private profile; guests should receive not found.
- `/artists/new-artist-private-preview`: private profile; owner/Admin can preview, guests and unrelated users should receive not found.
- Artist workspace: sign in as `artist@rademan.test`.
- Buyer workspace: sign in as `buyer@rademan.test`; empty buyer: `buyer-empty@rademan.test`.
- Admin workspace: sign in as `admin@rademan.test`; test each moderation filter, user role, collection and featured-artist state.

See [MVP 2 QA checklist](qa-checklist.md) and [manual smoke tests](manual-smoke-tests.md) for broader verification.
