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
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => ':memory:',
    'DB_URL' => '',
    'CACHE_STORE' => 'array',
    'SESSION_DRIVER' => 'array',
    'MAIL_MAILER' => 'array',
    'QUEUE_CONNECTION' => 'sync',
    'LOG_CHANNEL' => 'stderr',
    'FILESYSTEM_DISK' => 'local',
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

$viewCacheDirectory = $runtimeDirectory.'/views';
if (! is_dir($viewCacheDirectory) && ! mkdir($viewCacheDirectory, 0775, true) && ! is_dir($viewCacheDirectory)) {
    throw new RuntimeException('Unable to create isolated test view cache: '.$viewCacheDirectory);
}

require $root.'/vendor/autoload.php';
