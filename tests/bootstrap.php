<?php

declare(strict_types=1);

/*
 * Establish an isolated environment before PHPUnit loads Laravel or any app
 * configuration. This prevents a developer's cached config, database URL,
 * file logs or compiled Blade views from leaking into test execution.
 */
$root = dirname(__DIR__);
$cacheDirectory = $root.'/bootstrap/cache';
$runtimeDirectory = $root.'/storage/framework/testing';

$environment = [
    'APP_ENV' => 'testing',
    'APP_KEY' => 'base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    'APP_DEBUG' => 'true',
    'APP_URL' => 'http://localhost',
    'APP_TIMEZONE' => 'Asia/Tehran',
    'APP_LOCALE' => 'fa',
    'APP_FALLBACK_LOCALE' => 'en',
    'APP_FAKER_LOCALE' => 'fa_IR',
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => ':memory:',
    'DB_FOREIGN_KEYS' => 'true',
    'DB_URL' => '',
    'CACHE_STORE' => 'array',
    'SESSION_DRIVER' => 'array',
    'SESSION_DOMAIN' => '',
    'MAIL_MAILER' => 'array',
    'QUEUE_CONNECTION' => 'sync',
    'LOG_CHANNEL' => 'stderr',
    'FILESYSTEM_DISK' => 'local',
    'RAD_ART_LOCAL_STORAGE_PATH' => $runtimeDirectory.'/storage/private',
    'RAD_ART_PUBLIC_STORAGE_PATH' => $runtimeDirectory.'/storage/public',
    'RAD_ART_BROWSER_TEST_MODE' => '0',
    'VIEW_COMPILED_PATH' => $runtimeDirectory.'/views',
    'APP_CONFIG_CACHE' => $cacheDirectory.'/config.testing.php',
    'APP_ROUTES_CACHE' => $cacheDirectory.'/routes.testing.php',
    'APP_EVENTS_CACHE' => $cacheDirectory.'/events.testing.php',
    'APP_SERVICES_CACHE' => $cacheDirectory.'/services.testing.php',
    'APP_PACKAGES_CACHE' => $cacheDirectory.'/packages.testing.php',
];

foreach ($environment as $name => $value) {
    putenv($name.'='.$value);
    $_ENV[$name] = $value;
    $_SERVER[$name] = $value;
}

foreach ([
    'config.testing.php',
    'routes.testing.php',
    'events.testing.php',
    'services.testing.php',
    'packages.testing.php',
] as $cacheFile) {
    $cachePath = $cacheDirectory.'/'.$cacheFile;
    if (is_file($cachePath) && ! unlink($cachePath)) {
        throw new RuntimeException('Unable to remove stale isolated test cache: '.$cachePath);
    }
}

foreach ([
    $runtimeDirectory.'/views',
    $runtimeDirectory.'/storage/private',
    $runtimeDirectory.'/storage/public',
] as $directory) {
    if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
        throw new RuntimeException('Unable to create isolated test runtime directory: '.$directory);
    }
}

require $root.'/vendor/autoload.php';
