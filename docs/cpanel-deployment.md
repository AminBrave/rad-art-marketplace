# cPanel Deployment Guide

This guide describes a possible deployment procedure for cPanel shared hosting. It is not evidence that the application has been deployed or that a particular hosting account is compatible.

The current application is a Laravel 13 + React/Vite MVP. Avoid introducing runtime dependencies on Docker, Redis, queue workers, daemons, or root access.

## 1. Verify hosting compatibility first

Laravel 13 requires PHP 8.3 or newer. In cPanel MultiPHP Manager, confirm that the target domain can use PHP 8.3+ and that the PHP web runtime and CLI runtime use compatible versions.

Confirm Laravel-required PHP extensions are enabled, including Ctype, cURL, DOM, Fileinfo, Filter, Hash, Mbstring, OpenSSL, PCRE, PDO, PDO MySQL, Session, Tokenizer, and XML. The local test suite additionally uses SQLite/PDO SQLite; this is a development/CI requirement, not a production database requirement.

Do not bypass Composer platform checks or security advisories. If PHP 8.3+ is unavailable, resolve hosting/framework compatibility before deployment.

## 2. Prepare the domain and database

1. Create a MySQL database and a dedicated database user in cPanel.
2. Grant only the privileges required by this application.
3. Configure the domain/subdomain and enable HTTPS.
4. Prefer placing the Laravel project outside `public_html` and setting the domain document root to Laravel's `public/` directory.
5. If document-root configuration is restricted, keep the application outside the public directory and use a reviewed hosting-specific entry-point arrangement. Never expose `.env`, `vendor/`, source files, or private storage.

## 3. Build and upload

Build on a trusted development/build machine:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
npm run build
```

Upload application source and generated `public/build` assets. Exclude `.env`, `node_modules/`, local databases, test artifacts, and development-only files. If Composer is unavailable on the host, prepare production dependencies using a compatible PHP environment.

## 4. Configure production

Create production `.env` outside the public web root. Configure at minimum:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain.example`
- A unique `APP_KEY`
- MySQL connection details
- `SESSION_DRIVER=file`
- `CACHE_STORE=file`
- `QUEUE_CONNECTION=sync`
- `FILESYSTEM_DISK=local`

Use the PHP selector's matching CLI binary for Composer and Artisan. Keep credentials out of source control, public directories, and support tickets.

Email verification, password reset, and email delivery are not implemented. Do not treat mail configuration as a working product feature.

## 5. Storage and web server

Ensure `storage/` and `bootstrap/cache/` are writable by the PHP process. Artwork originals are stored on Laravel's private local disk and delivered through an application route with authorization checks. Do not symlink the private artwork directory into a public path.

Run migrations as a controlled release step:

```bash
php artisan migrate --force
php artisan optimize
```

Set the domain document root to Laravel's `public/` directory. Verify requests for `.env`, `composer.json`, `vendor/`, source files, and private upload paths return 403/404 and never reveal file contents.

## 6. Release smoke test

After deployment, use dedicated non-production test accounts and verify the currently implemented public marketplace:

- Homepage, `/artworks`, `/artists`, `/about`, `/help`, and `/contact` load over HTTPS.
- Artwork search, category filtering, pagination, detail routes, and public artist profiles work.
- Only approved artwork and public artist profiles are exposed.
- Private images remain inaccessible by direct filesystem URL.
- Buyer/Artist registration, login/logout, and server-side role boundaries work.
- Artist profile and artwork ownership rules are enforced.
- Admins can moderate artwork; non-admins cannot.
- Buyers can submit inquiries only to public artists and attach only that artist's approved artwork.
- Buyers see only their own sent inquiries; artists see only inquiries addressed to their profile.
- Inquiry read/archive updates work and payloads do not expose email addresses.
- Browser console, Laravel logs, and failed requests are reviewed.

Complete the artist, buyer, and admin workspace checks only after the corresponding MVP 2 stages are implemented. Do not mark planned workspace behavior as passed. Use [manual smoke tests](manual-smoke-tests.md) and [QA checklist](qa-checklist.md).

## 7. Rollback

Keep the previous release directory and a verified database/files backup until the new release passes smoke tests. Roll back application code and assets together. Do not blindly roll back migrations that may have accepted production data; prefer a forward corrective migration where possible.

## Hosting sign-off

Deployment readiness requires evidence that the actual cPanel account supports PHP 8.3+, required extensions, safe document-root isolation, writable storage, MySQL, HTTPS, and successful smoke tests. Backup automation and restore readiness require a successful restore drill, not merely a configured schedule.
