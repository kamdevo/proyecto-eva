<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration - Sistema EVA
    |--------------------------------------------------------------------------
    |
    | Configuración optimizada para el sistema EVA con soporte para múltiples
    | entornos, validación de orígenes y headers de seguridad avanzados.
    |
    | Características implementadas:
    | - CORS dinámico basado en entorno
    | - Whitelist/blacklist de orígenes
    | - Headers de seguridad adicionales
    | - Validación de patrones de origen
    | - Configuración específica por ruta
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/auth',
        'webhooks/*',
        'health',
        'metrics',
        'export/*',
        'files/*'
    ],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],

    'allowed_origins' => env('APP_ENV') === 'production'
        ? explode(',', env('CORS_ALLOWED_ORIGINS', ''))
        : [
            // Desarrollo - Servidores locales
            'http://localhost:3000',      // React dev server (Create React App)
            'http://localhost:5173',      // Vite dev server
            'http://localhost:4173',      // Vite preview server
            'http://localhost:8080',      // Webpack dev server
            'http://localhost:3001',      // Storybook
            'http://localhost:6006',      // Storybook alternativo

            // IPv4 localhost
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:4173',
            'http://127.0.0.1:8080',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:6006',

            // IPv6 localhost
            'http://[::1]:3000',
            'http://[::1]:5173',
            'http://[::1]:4173',
            'http://[::1]:8080',

            // Red local (para testing en dispositivos móviles)
            'http://192.168.1.100:3000',
            'http://192.168.1.100:5173',
            'http://10.0.0.100:3000',
            'http://10.0.0.100:5173',

            // Herramientas de desarrollo
            'http://localhost:9090',      // Webpack Bundle Analyzer
            'http://localhost:8888',      // Jupyter/Testing tools

            // Dominios de staging/testing
            'https://eva-staging.local',
            'https://eva-test.local',
        ],

    'allowed_origins_patterns' => [
        // Patrones para desarrollo
        '/^http:\/\/localhost:\d+$/',
        '/^http:\/\/127\.0\.0\.1:\d+$/',
        '/^http:\/\/\[::1\]:\d+$/',

        // Patrones para red local (desarrollo móvil)
        '/^http:\/\/192\.168\.\d+\.\d+:\d+$/',
        '/^http:\/\/10\.0\.\d+\.\d+:\d+$/',
        '/^http:\/\/172\.16\.\d+\.\d+:\d+$/',

        // Patrones para subdominios de producción
        '/^https:\/\/[\w-]+\.eva-sistema\.com$/',
        '/^https:\/\/[\w-]+\.eva\.local$/',
    ],

    'allowed_headers' => [
        'Accept',
        'Accept-Language',
        'Authorization',
        'Content-Type',
        'Content-Language',
        'Origin',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'X-Correlation-ID',
        'X-Request-ID',
        'X-Client-Version',
        'X-Device-ID',
        'X-Session-ID',
        'X-Timezone',
        'X-User-Agent',
        'Cache-Control',
        'Pragma',
        'If-Modified-Since',
        'If-None-Match',
    ],

    'exposed_headers' => [
        'X-Correlation-ID',
        'X-Request-ID',
        'X-Rate-Limit-Limit',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset',
        'X-Response-Time',
        'X-Server-Version',
        'X-API-Version',
        'Content-Disposition',
        'Content-Length',
        'Content-Range',
        'ETag',
        'Last-Modified',
        'Location',
        'Retry-After',
    ],

    'max_age' => env('CORS_MAX_AGE', 86400), // 24 horas en producción, 0 en desarrollo

    'supports_credentials' => true,

    /*
    |--------------------------------------------------------------------------
    | Configuración Avanzada de Seguridad
    |--------------------------------------------------------------------------
    */

    'security_headers' => [
        'X-Content-Type-Options' => 'nosniff',
        'X-Frame-Options' => 'DENY',
        'X-XSS-Protection' => '1; mode=block',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()',
        'Cross-Origin-Embedder-Policy' => 'require-corp',
        'Cross-Origin-Opener-Policy' => 'same-origin',
        'Cross-Origin-Resource-Policy' => 'cross-origin',
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Security Policy (CSP)
    |--------------------------------------------------------------------------
    */

    'content_security_policy' => env('APP_ENV') === 'production' ? [
        'default-src' => "'self'",
        'script-src' => "'self' 'unsafe-inline' 'unsafe-eval'",
        'style-src' => "'self' 'unsafe-inline'",
        'img-src' => "'self' data: https:",
        'font-src' => "'self' data:",
        'connect-src' => "'self' " . env('FRONTEND_URL', 'http://localhost:5173'),
        'media-src' => "'self'",
        'object-src' => "'none'",
        'child-src' => "'self'",
        'worker-src' => "'self'",
        'frame-ancestors' => "'none'",
        'form-action' => "'self'",
        'base-uri' => "'self'",
        'manifest-src' => "'self'",
    ] : null, // CSP deshabilitado en desarrollo

];
