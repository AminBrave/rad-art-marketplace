<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/bootstrap/app.php';

// Only the cPanel root entry point changes Laravel's public path.
// Local development and the standard public/index.php remain unchanged.
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
