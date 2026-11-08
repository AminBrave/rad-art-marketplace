# cPanel Deployment Guide

This guide targets cPanel shared hosting. It deliberately avoids Docker, Redis, queue workers, daemons, and root access.

## 1. Verify the hosting account before deployment

Laravel 13 requires PHP 8.3 or newer. In cPanel, open **MultiPHP Manager** and confirm that the domain can use PHP 8.3+. Confirm these extensions are enabled for the same PHP version used by the web application:

- Ctype, cURL, DOM, Fileinfo, Filter, Hash, Mbstring, OpenSSL, PCRE, PDO, PDO MySQL, Session, Tokenizer, XML
- GD or Imagick if image processing requirements are added
- SQLite/PDO SQLite is only needed on the development/test machine for the current in-memory test suite

Do not proceed by bypassing Composer platform or security checks. If PHP 8.3+ is unavailable, ask the host to upgrade or revisit the hosting/framework plan.

## 2. Prepare the domain and database

1. Create a MySQL database and a dedicated database user in cPanel.
2. Grant that user only the privileges required for this database.
3. Create the target domain/subdomain and confirm SSL is active.
4. Prefer a deployment layout where the Laravel project is outside `public_html` and only Laravel's `public/` contents are exposed as the document root.
5. If the host forces the document root to `public_html`, place the application outside it and point the public entry point to that private application directory. Never expose `.env`, `vendor/`, source files, or private storage.

## 3. Build and upload

Build assets on a trusted development/build machine:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
```

Upload the application source (excluding `.env`, `node_modules/`, local databases, test artifacts, and development-only files) and the generated `public/build` directory. Upload dependencies if Composer is unavailable on the host; otherwise install production dependencies on the host using the correct PHP CLI binary.

## 4. Configure production

Create the production `.env` outside the public web root. Set at minimum:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain.example`
- a unique `APP_KEY` generated with `php artisan key:generate`
- MySQL database credentials
- `SESSION_DRIVER=file`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync`, and `FILESYSTEM_DISK=local` unless the hosting design is deliberately changed
- a real SMTP mail transport and sender identity for verification and password-reset mail

Use the PHP selector's matching CLI binary for Artisan and Composer. Do not paste secrets into source control or support tickets.

## 5. Storage and web server

Run:

```bash
php artisan storage:link
php artisan migrate --force
php artisan optimize
```

The application uses private local storage for artwork originals; do not expose that directory through a public symlink. Ensure `storage/` and `bootstrap/cache/` are writable by the PHP process. The public artwork image route must remain the only public delivery path for approved artwork.

Configure the domain document root to Laravel's `public/` directory. Confirm that requests for `.env`, `composer.json`, `vendor/`, and private upload paths return 403/404 and never source contents.

## 6. Mail configuration

Configure SMTP credentials through cPanel/environment configuration. Verify sender-domain DNS (SPF, DKIM, and DMARC) with the mail provider. Test both email verification and password-reset messages in a staging environment before opening registration.

## 7. Release smoke test

After deployment:

- Open the home page on desktop and mobile.
- Register and verify a new account.
- Request and complete a password reset.
- Sign in as buyer, artist, and administrator; verify role boundaries.
- Browse/search/filter approved artwork and open an artwork image.
- Submit artwork and verify it remains private while pending.
- Approve artwork as admin and verify it becomes public.
- Submit a buyer inquiry and verify only its intended artist and sender can see it.
- Exercise category, report, and featured-placement administration.
- Verify About, Help, Legal, and Contact pages.
- Inspect browser console, Laravel logs, mail delivery, and failed requests.
- Confirm debug mode is off and private files are not web-accessible.

## 8. Rollback

Keep the previous release directory and database backup until the new release passes smoke tests. Roll back application code and assets together. Do not blindly roll back migrations that may have accepted production data; use a forward corrective migration where possible.

## Hosting-specific sign-off

The deployment cannot be declared ready until the actual cPanel account confirms PHP 8.3+, required extensions, document-root control (or a safe equivalent), writable storage, MySQL access, and SMTP delivery.
