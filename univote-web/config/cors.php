<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your Laravel application.
    | This configuration is used by the HandleCors middleware to add CORS
    | headers to responses.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [
        '#^192\.168\.0\.\d{1,3}$#',  // Allow all requests from 192.168.0.x
        '#^10\.0\.2\.\d{1,3}$#',     // Allow Android emulator
        '#^127\.0\.0\.\d{1,3}$#',    // Allow localhost
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
