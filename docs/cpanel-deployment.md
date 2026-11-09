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
3. Configure the domain/subdomain and issue/install a valid TLS certificate (for example, AutoSSL/Let's Encrypt).
4. **Recommended:** place the Laravel project outside `public_html` and set the domain document root to Laravel's `public/` directory.
5. If document-root configuration is restricted and you specifically require the entire repository inside `public_html`, follow [the dedicated public_html-root deployment guide](cpanel-public-html-deployment.md). This is a less secure alternative and must pass all of its security checks before use.

Never expose `.env`, `vendor/`, source files, or private storage.

## 3. Build and upload

Build on a trusted development/build machine:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
npm ci
```

For the **recommended standard deployment** (Laravel's `public/` directory is the document root), run:

```bash
npm run build
```

This writes assets to `public/build/`. Upload application source and generated `public/build` assets. Exclude `.env`, `node_modules/`, local databases, test artifacts, and development-only files. If Composer is unavailable on the host, prepare production dependencies using a compatible PHP environment.

For the **entire-project-in-public_html alternative**, use `npm run build:cpanel` instead; it uses `vite.config.cpanel.js` and writes assets to the repository-root `build/` directory. Follow the dedicated guide for the matching root `index.php`, `.htaccess`, and upload layout. Do not mix the two layouts.

## 4. Configure production

For the recommended standard deployment, create production `.env` outside the public web root. For the public_html-root alternative, create it in the repository root only after installing and verifying the protective root `.htaccess` rules. Configure at minimum:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain.example`
- `SESSION_SECURE_COOKIE=true`
- A unique `APP_KEY`
- MySQL connection details
- `SESSION_DRIVER=file`
- `CACHE_STORE=file`
- `QUEUE_CONNECTION=sync`
- `FILESYSTEM_DISK=local`

Use the PHP selector's matching CLI binary for Composer and Artisan. Keep credentials out of source control, public directories, and support tickets.

Email verification, password reset, and email delivery are not implemented. Do not treat mail configuration as a working product feature.

## 5. TLS, HTTP/2, HTTP/3, and web server

The repository's standard `public/.htaccess` redirects HTTP requests to HTTPS and adds a one-year HSTS policy to HTTPS responses. The public_html-root profile has a separate root `.htaccess` with equivalent HTTPS/HSTS behavior. Install a valid certificate before enabling the redirect. HSTS intentionally excludes subdomains and preload until every affected hostname has been verified.

HTTP/2 and HTTP/3 are server/host settings; Laravel and `.htaccess` cannot enable them:
- **HTTPS/TLS:** enable AutoSSL or install a valid certificate for the production hostname and any active `www` alias.
- **HTTP/2:** ask the host to enable HTTP/2 on the TLS virtual host (Apache `mod_http2` or the provider's LiteSpeed equivalent).
- **HTTP/3:** ask the host to enable QUIC/HTTP/3 and permit inbound UDP 443 at the server/firewall/CDN.
- **CDN/proxy:** use Full (strict) TLS with a valid origin certificate and enable the visitor HTTP-to-HTTPS redirect at the edge. Do not use Flexible TLS. The origin rewrite intentionally does not trust a client-supplied `X-Forwarded-Proto` header; if a proxy connects to the origin over plain HTTP, configure a provider-managed trusted scheme/redirect mechanism or HTTPS to the origin to avoid loops.
- **Verify:** inspect the browser Network panel or run `curl -I --http2 https://your-domain.example`. For HTTP/3, use a curl build with HTTP/3 support: `curl --http3-only -I https://your-domain.example`. Confirm the negotiated protocol in browser DevTools. A client curl without HTTP/3 support cannot prove the server lacks it.

Do not advertise HTTP/3 as active until the real production hostname is tested externally. Shared-hosting customers may need their provider to enable these protocols.

## 6. Storage and web server

Ensure `storage/` and `bootstrap/cache/` are writable by the PHP process. Artwork originals are stored on Laravel's private local disk and delivered through an application route with authorization checks. Do not symlink the private artwork directory into a public path.

Run migrations as a controlled release step:

```bash
php artisan migrate --force
php artisan optimize
```

For the recommended deployment, set the domain document root to Laravel's `public/` directory. For the public_html-root alternative, keep the document root at the repository root and use only the root entry point and protective rules from the dedicated guide. In either case, verify requests for `.env`, `composer.json`, `vendor/`, source files, and private upload paths return 403/404 and never reveal file contents.

## 7. Release smoke test

After deployment, use dedicated non-production test accounts and verify the currently implemented public marketplace:

- Homepage, `/artworks`, `/artists`, `/about`, `/help`, and `/contact` load over HTTPS.
- HTTP requests redirect to the matching HTTPS URL without a loop; HSTS is present on HTTPS responses.
- HTTP/2 is negotiated over TLS; HTTP/3 is negotiated if enabled by the hosting provider.
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

Verify the implemented artist, buyer, and admin workspaces as part of the release smoke test; all three MVP 2 workspace stages are integrated. Do not mark any manual check as passed until it has actually been run. Use [manual smoke tests](manual-smoke-tests.md) and [QA checklist](qa-checklist.md).

## 8. Rollback

Keep the previous release directory and a verified database/files backup until the new release passes smoke tests. Roll back application code and assets together. Do not blindly roll back migrations that may have accepted production data; prefer a forward corrective migration where possible.

## Hosting sign-off

Deployment readiness requires evidence that the actual cPanel account supports PHP 8.3+, required extensions, safe document-root isolation, writable storage, MySQL, valid HTTPS, HTTP/2, and (if required) HTTP/3, plus successful smoke tests. Backup automation and restore readiness require a successful restore drill, not merely a configured schedule.
