# Phase 1 — Authentication smoke test

Run these checks against a local development database after pulling the branch.

## Prepare

```bash
php artisan migrate
npm run dev
php artisan serve
```

Open the Laravel local URL in the same origin as the Vite-powered page.

## Artist account

1. Open the **ورود / ثبت‌نام** section.
2. Register with a name, valid email, and password of at least 10 characters.
3. Confirm that the account is signed in and displays the **هنرمند** role.
4. Refresh the page and confirm the signed-in state is restored.
5. Sign out, then sign in again with the same credentials.
6. Try an incorrect password and confirm the form displays a validation error.
7. Try registering the same email again and confirm it is rejected.

## Administrator account

1. Register a second account normally.
2. In a terminal, promote it using `php artisan users:make-admin admin@example.com`.
3. Sign in as that account and confirm the user-management table appears.
4. Promote the artist account to admin, then demote it back to artist.
5. Confirm the administrator cannot demote their own account.

## Automated checks

```bash
composer test
composer lint
npm run lint
npm run build
```

The public registration endpoint must never grant admin access, even if a client includes a `role=admin` field. Admin endpoints must return 401 for guests and 403 for authenticated artists.
