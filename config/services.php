<?php

return [
    'instagram' => [
        'app_id' => env('META_INSTAGRAM_APP_ID'),
        'app_secret' => env('META_INSTAGRAM_APP_SECRET'),
        'config_id' => env('META_INSTAGRAM_CONFIG_ID'),
        'redirect_uri' => env('META_INSTAGRAM_REDIRECT_URI'),
        'graph_version' => env('META_GRAPH_API_VERSION', 'v27.0'),
    ],
];
