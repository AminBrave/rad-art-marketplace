# Demo data and test accounts

The demo dataset is for local development and automated testing only. It is disabled outside Laravel's `local` and `testing` environments.

## Seed the dataset

After configuring the local environment:

```bash
php artisan migrate
php artisan db:seed
```

The default `DatabaseSeeder` invokes `DemoDatabaseSeeder`. You can also run it explicitly with `php artisan db:seed --class=DemoDatabaseSeeder`.

Seeding is repeatable: stable emails and slugs are updated in place, not duplicated. The seeder does not truncate tables or delete user-created records. It does overwrite the seeded demo accounts and demo slugs, including their demo passwords and seeded profile/artwork fields.

**Safety:** demo seeding refuses to run unless `APP_ENV=local` or `APP_ENV=testing`. Never remove this guard or reuse the public demo password for real accounts.

## Demo accounts

All demo accounts use password `Demo@12345`.

| Role | Email | Purpose |
| --- | --- | --- |
| Admin | `admin@rademan.test` | User management and moderation |
| Artist | `artist@rademan.test` | Main public profile, 15 approved portfolio works, artist inbox |
| Buyer | `buyer@rademan.test` | Inquiry submission and buyer history |

Additional accounts: `artist-02@rademan.test` through `artist-14@rademan.test`, and `buyer-02@rademan.test` through `buyer-04@rademan.test`. All use the same password. The fourteenth artist profile is private.

## Included variations

- 1 admin, 14 artist accounts/profiles (13 public and 1 private), and 4 buyers.
- All six active categories plus one inactive category for filter/validation checks.
- 70 artworks across all categories and all moderation states: approved, pending review, rejected, and changes requested.
- All availability states: available, sold, and not for sale.
- Nullable and populated descriptions, media, dimensions, year, and price; zero-priced and unpriced works are included.
- Moderation notes, reviewer IDs, and timestamps.
- 15 approved works on the main artist profile to test the 12-item portfolio pagination boundary.
- 48 inquiries across new, read, and archived states, with and without an associated artwork.
- Locally generated SVG artwork placeholders on the private local storage disk; these are synthetic test assets, not licensed portfolio photography.

## Useful routes

- `/artworks`: public catalogue, category filters, search, pagination.
- `/artists`: artist directory, search, pagination.
- `/artists/arman-rezaei`: public artist profile and load-more portfolio.
- `/artists/artist-14`: private profile; guests should receive not found.
- Artist workspace: sign in as `artist@rademan.test`.
- Buyer workspace: sign in as `buyer@rademan.test`.
- Admin workspace: sign in as `admin@rademan.test`; test each moderation filter and user role.

See [MVP 2 QA checklist](qa-checklist.md) and [manual smoke tests](manual-smoke-tests.md) for broader verification.
