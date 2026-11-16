# cPanel deployment (repository-root document root)

This guide describes the `public_html` deployment profile. It places the Laravel project in the domain document root and relies on the root `.htaccess` file to deny direct access to application code, dependencies, private storage, configuration and dotfiles.

**Use this profile only when the hosting provider honors Apache/LiteSpeed `.htaccess` rules.** If the host ignores these rules, do not extract this package into a web-accessible directory. Instead, keep the Laravel project outside the document root and point the domain document root at Laravel's `public/` directory.

## Build the deployment ZIP

On the build machine, install the repository's Node dependencies and ensure these tools are available:

- Node.js 20.13 or newer.
- On Linux/macOS: the `zip` and `unzip` command-line tools.
- On Windows: PowerShell with the built-in `Compress-Archive` command.

Then run:

```sh
npm ci
npm run build:cpanel
```

The single packaging script runs the existing cPanel production asset build, stages the project including the already-installed `vendor/` directory, validates the archive, and writes. It does not run Composer or download/install PHP dependencies. Ensure `vendor/` is already present from your normal production setup before building:

```
build/rad-file.zip
```

The archive is validated before it replaces an existing ZIP. Its contents are rooted at `public_html`; it does not contain an enclosing project directory. The archive includes the existing `vendor/` dependencies unchanged and compiled `build/` assets. It does not include `.env`, Git metadata, Node dependencies, tests, local SQLite databases, private/public upload contents, or runtime logs, sessions and storage cache contents. Composer-generated package discovery metadata is retained under `bootstrap/cache`.

## Prepare cPanel

1. Confirm the domain uses PHP 8.3+ and enable the PHP extensions required by Laravel 13, including PDO MySQL, Ctype, cURL, DOM, Fileinfo, Filter, Hash, Mbstring, OpenSSL, PCRE, Session, Tokenizer and XML.
2. Back up the current site and database before replacing files.
3. In cPanel File Manager, open the domain's `public_html` directory and extract `rad-file.zip` **directly into that directory**. The root `.htaccess` and `index.php` must sit directly in `public_html`, not in a nested folder.
4. Create the production environment file on the server by copying `.env.example` to `.env`. Never upload a development `.env` from the build machine.
5. Set at least:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://your-domain.example`
   - A unique production `APP_KEY` (generate it on the server with `php artisan key:generate` after the environment file is configured).
   - The cPanel MySQL database name, username, password and host in `DB_*`.
   - Production SMTP settings in `MAIL_*`.
   - `SESSION_SECURE_COOKIE=true` when HTTPS is active.
   - Keep the cPanel-friendly `SESSION_DRIVER=file`, `CACHE_STORE=file` and `QUEUE_CONNECTION=database` unless the hosting setup has been deliberately configured for alternatives.
6. Create the database and grant its cPanel database user the required privileges. Import any required data separately; the package does not export or include a database.
7. Ensure PHP can write to `storage/` and `bootstrap/cache/`. Do not make the whole project world-writable. Keep private uploads under Laravel's private storage and do not create a public symlink to them.
8. After the production environment and database are configured, run the required migrations from the project directory using the hosting terminal:
   `php artisan migrate --force`.
9. Install a valid TLS certificate before serving the site. The root `.htaccess` redirects HTTP to HTTPS.

Do not run seeders against production unless you have separately reviewed and explicitly chosen the data they create.

## Mandatory security checks before launch

Test these URLs over HTTPS after extraction. Each must return **403 or 404**, never source code, JSON, credentials or file contents:

- `/.env`
- `/.env.example`
- `/composer.json` and `/composer.lock`
- `/artisan`
- `/vendor/autoload.php`
- `/bootstrap/app.php`
- `/app/`
- `/storage/logs/laravel.log`
- `/public/`
- `/build/manifest.json`

Also confirm:

- The home page loads and Laravel can read the Vite manifest.
- Referenced `/build/assets/*` files return successfully.
- HTTPS remains active and HTTP redirects to HTTPS.
- No private artwork or message attachments are accessible through a public URL.

If any blocked path exposes content, stop. Do not launch this document-root profile on that host; move the Laravel project outside the web root and configure the document root to Laravel's `public/` directory instead.

## Operational notes

- Keep a verified backup and the previous release so the deployment can be rolled back.
- Keep `.env` server-only and never commit or include it in a deployment archive.
- The package is a file deployment artifact, not a database backup or a deployment automation tool.
- The standard Laravel `public/` directory remains part of the source repository but is denied by the root `.htaccess` in this deployment profile.
