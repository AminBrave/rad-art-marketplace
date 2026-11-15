import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDotEnv, validateDevelopmentEnvironment } from '../../scripts/dev-environment.mjs';

const root = '/workspace/rademan';
const safeEnvironment = {
    APP_ENV: 'local',
    APP_DEBUG: 'true',
    APP_KEY: 'base64:ZmFrZS1sb2NhbC1hcHAtc2VjcmV0LWtleQ==',
    APP_URL: 'http://localhost',
    DB_CONNECTION: 'mysql',
    DB_HOST: '127.0.0.1',
    DB_DATABASE: 'rad_art_marketplace',
};

test('parses quoted, unquoted and exported dotenv values', () => {
    assert.deepEqual(parseDotEnv([
        'APP_NAME="Rad Art Marketplace"',
        'APP_ENV=local # local only',
        "export DB_HOST='127.0.0.1'",
        'EMPTY=',
    ].join('\n')), {
        APP_NAME: 'Rad Art Marketplace',
        APP_ENV: 'local',
        DB_HOST: '127.0.0.1',
        EMPTY: '',
    });
});

test('accepts a local development configuration', () => {
    assert.deepEqual(validateDevelopmentEnvironment({ fileValues: safeEnvironment, root }), {
        errors: [],
        warnings: [],
    });
});

test('rejects production environment settings even when the shell tries to override APP_ENV', () => {
    const result = validateDevelopmentEnvironment({
        fileValues: { ...safeEnvironment, APP_ENV: 'production' },
        processValues: { APP_ENV: 'local' },
        root,
    });
    assert.match(result.errors.join(' '), /APP_ENV is production/);
});

test('rejects disabled debug and missing application key', () => {
    const result = validateDevelopmentEnvironment({
        fileValues: { ...safeEnvironment, APP_DEBUG: 'false', APP_KEY: '' },
        root,
    });
    assert.match(result.errors.join(' '), /APP_DEBUG must be true/);
    assert.match(result.errors.join(' '), /APP_KEY is missing/);
});

test('rejects a remote database unless the developer explicitly opts in', () => {
    const result = validateDevelopmentEnvironment({
        fileValues: { ...safeEnvironment, DB_HOST: 'db.production.example' },
        root,
    });
    assert.match(result.errors.join(' '), /not loopback/);
});

test('allows a reviewed remote development database only with an explicit shell opt-in', () => {
    const result = validateDevelopmentEnvironment({
        fileValues: { ...safeEnvironment, DB_HOST: 'dev-db.example' },
        processValues: { RAD_ALLOW_REMOTE_DEV_DATABASE: 'true' },
        root,
    });
    assert.deepEqual(result.errors, []);
    assert.match(result.warnings.join(' '), /Remote development database explicitly allowed/);
});

test('rejects SQLite files outside the repository database directory', () => {
    const result = validateDevelopmentEnvironment({
        fileValues: { ...safeEnvironment, DB_CONNECTION: 'sqlite', DB_DATABASE: '/shared/production.sqlite' },
        root,
    });
    assert.match(result.errors.join(' '), /inside the repository database/);
});

test('rejects unsupported database drivers and malformed APP_URL values', () => {
    const result = validateDevelopmentEnvironment({
        fileValues: { ...safeEnvironment, DB_CONNECTION: 'pgsql', APP_URL: 'not-a-url' },
        root,
    });
    assert.match(result.errors.join(' '), /DB_CONNECTION must be mysql or sqlite/);
    assert.match(result.errors.join(' '), /APP_URL is not a valid URL/);
});
