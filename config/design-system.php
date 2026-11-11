<?php

return [
    'defaultTheme' => 'new-york',
    'allowRuntimeSwitching' => true,
    'persistSelection' => true,
    'storageKey' => 'rad-art-theme',
    'themes' => [
        'editorial' => [
            'id' => 'editorial',
            'name' => 'Editorial',
            'description' => 'پوسته کلاسیک راد آرت',
            'enabled' => true,
        ],
        'new-york' => [
            'id' => 'new-york',
            'name' => 'New York',
            'description' => 'سامانه طراحی کامل مبتنی بر shadcn/ui New York',
            'enabled' => true,
        ],
    ],
];
