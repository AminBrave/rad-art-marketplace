import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { isIP } from 'node:net';

export function parseDotEnv(source) {
    const values = {};
    for (const rawLine of source.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!match) continue;

        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
            if (match[2].trim().startsWith('"')) {
                value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\"/g, '"');
            }
        } else {
            value = value.replace(/\s+#.*$/, '').trim();
        }
        values[match[1]] = value;
    }
    return values;
}

function hasValidAppKey(value) {
    const key = String(value ?? '');
    if (key.startsWith('base64:')) {
        const encoded = key.slice(7);
        const decoded = Buffer.from(encoded, 'base64');
        return decoded.length === 32 && decoded.toString('base64').replace(/=+$/, '') === encoded.replace(/=+$/, '');
    }
    return key.length === 32;
}

function isLocalDatabaseHost(host) {
    const normalized = String(host ?? '').trim().toLowerCase().replace(/^\[|\]$/g, '');
    return ['localhost', '127.0.0.1', '::1', 'host.docker.internal'].includes(normalized)
        || (isIP(normalized) === 4 && normalized.startsWith('127.'));
}

function isInside(parent, candidate) {
    const path = relative(parent, candidate);
    return path === '' || (!path.startsWith('..' + sep) && path !== '..' && !isAbsolute(path));
}

function databaseHost(values) {
    if (!values.DB_URL) return { host: values.DB_HOST || '127.0.0.1' };

    let parsed;
    try {
        parsed = new URL(values.DB_URL);
    } catch {
        return { error: 'DB_URL is not a valid database URL. Check its scheme and host.' };
    }

    if (parsed.protocol === 'sqlite:') {
        return { error: 'DB_URL uses SQLite, but DB_CONNECTION is mysql. Keep DB_CONNECTION and DB_URL consistent.' };
    }
    if (!['mysql:', 'mariadb:'].includes(parsed.protocol)) {
        return { error: 'DB_URL must use the mysql:// or mariadb:// scheme for a MySQL connection.' };
    }
    if (!parsed.hostname) return { error: 'DB_URL must include a database host.' };
    return { host: parsed.hostname };
}

export function validateDevelopmentEnvironment({ fileValues = {}, processValues = {}, root = process.cwd() } = {}) {
    const values = { ...fileValues, ...processValues };
    const errors = [];
    const warnings = [];
    const fileEnvironment = String(fileValues.APP_ENV ?? '').toLowerCase();
    const environment = String(values.APP_ENV ?? 'local').toLowerCase();
    const debug = String(values.APP_DEBUG ?? 'false').toLowerCase();

    if (fileEnvironment === 'production' || environment === 'production') {
        errors.push('The configured APP_ENV is production. Use a separate local .env file; development startup will not run against production settings.');
    } else if (!['local', 'development'].includes(environment)) {
        errors.push('APP_ENV must be local or development (currently ' + (values.APP_ENV || 'unset') + ').');
    }

    if (String(fileValues.APP_DEBUG ?? debug).toLowerCase() === 'false' || debug !== 'true') {
        errors.push('APP_DEBUG must be true for local development so application errors are visible.');
    }

    if (!hasValidAppKey(values.APP_KEY)) {
        errors.push('APP_KEY is missing or invalid. Generate a local 32-byte key with php artisan key:generate; do not reuse the production key.');
    }

    const configuredDatabase = String(values.DB_DATABASE ?? '');
    if (/(^|[._-])prod(uction)?([._-]|$)/i.test(configuredDatabase)) {
        errors.push('DB_DATABASE looks like a production database name. Use a dedicated local development database; the explicit remote-database opt-in is not a substitute for checking the target.');
    }

    const connection = String(values.DB_CONNECTION ?? 'mysql').toLowerCase();
    if (!['mysql', 'sqlite'].includes(connection)) {
        errors.push('DB_CONNECTION must be mysql or sqlite for the supported local development setup.');
    } else if (connection === 'mysql') {
        const target = databaseHost(values);
        if (target.error) errors.push(target.error);
        else if (!isLocalDatabaseHost(target.host)) {
            const override = String(processValues.RAD_ALLOW_REMOTE_DEV_DATABASE ?? '').toLowerCase() === 'true';
            if (!override) {
                errors.push('The development database host is not loopback (' + target.host + '). Refusing to risk a shared or production database. Use a local database, or explicitly set RAD_ALLOW_REMOTE_DEV_DATABASE=true for a reviewed remote development database.');
            } else {
                warnings.push('Remote development database explicitly allowed (' + target.host + '). Confirm it is disposable/development-only; this command does not verify ownership or environment.');
            }
        }
    } else {
        let database = String(values.DB_DATABASE ?? 'database/database.sqlite');
        if (values.DB_URL) {
            try {
                const parsed = new URL(values.DB_URL);
                if (parsed.protocol !== 'sqlite:') errors.push('DB_URL must use the sqlite: scheme when DB_CONNECTION=sqlite.');
                else database = decodeURIComponent(parsed.pathname || parsed.hostname);
            } catch {
                errors.push('DB_URL is not a valid SQLite database URL.');
            }
        }
        if (database !== ':memory:') {
            const path = resolve(root, database);
            const databaseDirectory = resolve(root, 'database');
            if (!isInside(databaseDirectory, path)) {
                const override = String(processValues.RAD_ALLOW_REMOTE_DEV_DATABASE ?? '').toLowerCase() === 'true';
                if (!override) errors.push('SQLite DB_DATABASE must be inside the repository database/ directory. Refusing an external database path; use RAD_ALLOW_REMOTE_DEV_DATABASE=true only after confirming it is a development database.');
                else warnings.push('External SQLite database path explicitly allowed. Confirm it is not shared or production data.');
            }
        }
    }

    const configuredUrl = values.APP_URL;
    if (configuredUrl) {
        try {
            const host = new URL(configuredUrl).hostname.toLowerCase();
            if (!(host === 'localhost' || host.endsWith('.localhost') || host === '127.0.0.1' || host === '::1')) {
                warnings.push('APP_URL points to ' + host + ', but the development launcher deliberately overrides it with https://rad.localhost.');
            }
        } catch {
            errors.push('APP_URL is not a valid URL. Use a local URL such as http://localhost.');
        }
    }

    return { errors, warnings };
}

export function runDevelopmentPreflight({ root = process.cwd(), processValues = process.env } = {}) {
    const envPath = resolve(root, '.env');
    if (!existsSync(envPath)) {
        throw new Error('Local .env file is missing. Run npm run setup first; this creates it from .env.example without overwriting an existing file.');
    }

    const fileValues = parseDotEnv(readFileSync(envPath, 'utf8'));
    const { errors, warnings } = validateDevelopmentEnvironment({ fileValues, processValues, root });
    if (errors.length) {
        throw new Error('Development environment check failed:\n- ' + errors.join('\n- ') + '\n\nFix these settings in your local .env and run npm run dev again.');
    }

    for (const relativePath of ['vendor/autoload.php', 'node_modules/vite/bin/vite.js']) {
        if (!existsSync(resolve(root, relativePath))) {
            throw new Error('Required project dependency is missing: ' + relativePath + '. Run npm run setup, then retry npm run dev.');
        }
    }

    if (existsSync(resolve(root, 'public/hot'))) {
        throw new Error('public/hot already exists. Another Vite process may be running, or a previous run ended unexpectedly. Stop the old process; if it is no longer running, remove public/hot and retry.');
    }

    for (const warning of warnings) console.warn('[project] Warning: ' + warning);
    console.log('[project] Development configuration validated (local environment, debug enabled, database target checked, dependencies present).');
}
