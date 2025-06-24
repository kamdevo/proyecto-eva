<?php

return [

    /*
    |--------------------------------------------------------------------------
    | React Frontend Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the React frontend
    | integration with the Laravel backend API.
    |
    */

    // URLs del frontend React
    'frontend_urls' => [
        'development' => env('REACT_DEV_URL', 'http://localhost:5173'),
        'production' => env('REACT_PROD_URL', 'https://eva-frontend.com'),
    ],

    // Configuración de CORS específica para React
    'cors' => [
        'allowed_origins' => [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
        ],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allowed_headers' => [
            'Accept',
            'Authorization',
            'Content-Type',
            'X-Requested-With',
            'X-CSRF-TOKEN',
            'X-Socket-ID',
        ],
    ],

    // Configuración de autenticación para React
    'auth' => [
        'token_name' => 'eva-token',
        'token_expiration' => 60 * 24 * 7, // 7 días en minutos
        'refresh_threshold' => 60 * 24, // 1 día en minutos
    ],

    // Configuración de respuestas API para React
    'api_responses' => [
        'include_metadata' => true,
        'include_pagination_meta' => true,
        'include_timestamps' => true,
        'date_format' => 'Y-m-d H:i:s',
        'timezone' => 'America/Bogota',
    ],

    // Configuración de archivos para React
    'file_uploads' => [
        'max_size' => 10 * 1024 * 1024, // 10MB
        'allowed_types' => [
            'images' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'documents' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
            'archives' => ['zip', 'rar', '7z'],
        ],
        'storage_path' => 'uploads',
        'public_path' => 'storage/uploads',
    ],

    // Configuración de cache para React
    'cache' => [
        'static_data_ttl' => 60 * 60, // 1 hora
        'dynamic_data_ttl' => 60 * 10, // 10 minutos
        'user_data_ttl' => 60 * 30, // 30 minutos
    ],

    // Configuración de paginación para React
    'pagination' => [
        'default_per_page' => 10,
        'max_per_page' => 100,
        'page_name' => 'page',
        'per_page_name' => 'per_page',
    ],

    // Configuración de validación para React
    'validation' => [
        'return_first_error_only' => false,
        'include_field_names' => true,
        'custom_messages' => true,
    ],

    // Configuración de logging para React requests
    'logging' => [
        'log_requests' => env('LOG_API_REQUESTS', false),
        'log_responses' => env('LOG_API_RESPONSES', false),
        'log_errors' => true,
        'log_slow_queries' => true,
        'slow_query_threshold' => 1000, // ms
    ],

    // Configuración de rate limiting para React
    'rate_limiting' => [
        'enabled' => env('API_RATE_LIMITING', true),
        'max_attempts' => 60,
        'decay_minutes' => 1,
        'skip_successful_requests' => false,
    ],

    // Configuración de notificaciones para React
    'notifications' => [
        'enabled' => true,
        'channels' => ['database', 'broadcast'],
        'real_time' => env('REAL_TIME_NOTIFICATIONS', false),
    ],

    // Configuración de exportación para React
    'exports' => [
        'enabled' => true,
        'formats' => ['excel', 'pdf', 'csv'],
        'max_records' => 10000,
        'timeout' => 300, // segundos
    ],

    // Configuración de búsqueda para React
    'search' => [
        'min_length' => 2,
        'max_results' => 50,
        'highlight_results' => true,
        'fuzzy_search' => false,
    ],

    // Configuración de WebSocket para React (si se implementa)
    'websocket' => [
        'enabled' => env('WEBSOCKET_ENABLED', false),
        'host' => env('WEBSOCKET_HOST', 'localhost'),
        'port' => env('WEBSOCKET_PORT', 6001),
        'scheme' => env('WEBSOCKET_SCHEME', 'ws'),
    ],

    // Configuración de desarrollo para React
    'development' => [
        'debug_mode' => env('APP_DEBUG', false),
        'show_sql_queries' => env('SHOW_SQL_QUERIES', false),
        'mock_data' => env('USE_MOCK_DATA', false),
        'disable_cache' => env('DISABLE_API_CACHE', false),
    ],

    // Configuración de seguridad para React
    'security' => [
        'csrf_protection' => false, // Deshabilitado para API
        'sanitize_input' => true,
        'validate_content_type' => true,
        'require_https' => env('REQUIRE_HTTPS', false),
    ],

    // Configuración de monitoreo para React
    'monitoring' => [
        'track_performance' => env('TRACK_API_PERFORMANCE', false),
        'track_usage' => env('TRACK_API_USAGE', false),
        'alert_on_errors' => env('ALERT_ON_API_ERRORS', false),
    ],

];
