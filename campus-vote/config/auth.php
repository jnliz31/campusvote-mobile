<?php

return [
    'defaults' => [
        'guard' => 'voter',
        'passwords' => 'voters',
    ],

    'guards' => [
        'voter' => [
            'driver' => 'session',
            'provider' => 'voters',
        ],
        'admin' => [
            'driver' => 'session',
            'provider' => 'admins',
        ],
    ],

    'providers' => [
        'voters' => [
            'driver' => 'eloquent',
            'model' => App\Models\Voter::class,
        ],
        'admins' => [
            'driver' => 'eloquent',
            'model' => App\Models\Admin::class,
        ],
    ],

    'passwords' => [
        'voters' => [
            'provider' => 'voters',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
        'admins' => [
            'provider' => 'admins',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];