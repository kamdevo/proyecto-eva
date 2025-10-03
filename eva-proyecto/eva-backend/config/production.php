<?php

/**
 * Configuración optimizada para producción
 * Este archivo contiene ajustes específicos para el entorno de producción
 */

return [
    
    /*
    |--------------------------------------------------------------------------
    | Optimizaciones de Producción
    |--------------------------------------------------------------------------
    */
    
    'optimizations' => [
        'config_cache' => true,
        'route_cache' => true,
        'view_cache' => true,
        'event_cache' => true,
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Configuración de Seguridad
    |--------------------------------------------------------------------------
    */
    
    'security' => [
        'force_https' => env('FORCE_HTTPS', true),
        'hsts_enable' => env('HSTS_ENABLE', true),
        'hsts_max_age' => 31536000, // 1 año
        'csrf_protection' => true,
        'xss_protection' => true,
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Configuración de Logging
    |--------------------------------------------------------------------------
    */
    
    'logging' => [
        'level' => env('LOG_LEVEL', 'warning'),
        'days' => env('LOG_DAYS', 14),
        'max_files' => 30,
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Configuración de Cache
    |--------------------------------------------------------------------------
    */
    
    'cache' => [
        'default' => env('CACHE_DRIVER', 'redis'),
        'ttl' => 3600, // 1 hora
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Configuración de Sesiones
    |--------------------------------------------------------------------------
    */
    
    'session' => [
        'driver' => env('SESSION_DRIVER', 'redis'),
        'lifetime' => env('SESSION_LIFETIME', 120),
        'secure' => true,
        'http_only' => true,
        'same_site' => 'lax',
    ],
    
];
