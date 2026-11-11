<?php

return [
    'defaultTheme' => 'editorial',
    'allowRuntimeSwitching' => true,
    'persistSelection' => true,
    'storageKey' => 'rad-art-theme',
    'themes' => [
        'editorial' => [
            'id' => 'editorial',
            'name' => 'Editorial',
            'description' => 'سامانه طراحی اصیل راد آرت',
            'enabled' => true,
        ],
        'new-york' => [
            'id' => 'new-york',
            'name' => 'New York',
            'description' => 'سبک New York از shadcn/ui با هویت راد آرت',
            'enabled' => true,
        ],
    ],
];
