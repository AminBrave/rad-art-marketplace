<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Feature Registry
|--------------------------------------------------------------------------
|
| This file is the single source of truth for application feature switches.
| Keep values as booleans and consume them at both server and client
| boundaries. Do not read feature environment variables directly in routes
| or frontend components; change the registry value here instead.
|
*/

return [
    'inquiries' => false,
    'messaging' => true,
];
