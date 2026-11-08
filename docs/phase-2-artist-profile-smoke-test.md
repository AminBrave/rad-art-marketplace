# Artist profile — local smoke test

Run this after pulling the profile milestone branch and applying migrations.

```bash
php artisan migrate
npm run dev
php artisan serve
```

1. Register or sign in as an artist.
2. Complete the profile form with display name, biography, city, website, and Instagram handle.
3. Save and refresh; confirm the profile values are restored.
4. Open the `/artists/{slug}` public profile page while signed out and confirm public profile details are visible.
5. Turn off public visibility; confirm the public page returns not found while the owner can still view and edit the profile after signing in.
6. Register a second artist. Confirm that artist cannot read or update the first artist's private profile by API.
7. Sign in as an administrator. Confirm the admin can read and update another artist's profile through the authenticated profile API.

Automated checks:

```bash
composer test
composer lint
npm run lint
npm run build
```
