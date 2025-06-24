<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Configuración de Monitoreo
    |--------------------------------------------------------------------------
    |
    | Esta configuración define los parámetros para el monitoreo del sistema,
    | incluyendo alertas, umbrales y notificaciones.
    |
    */

    'enabled' => env('MONITORING_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Umbrales de Rendimiento
    |--------------------------------------------------------------------------
    */
    'performance' => [
        'slow_query_threshold' => env('SLOW_QUERY_THRESHOLD', 1000), // milisegundos
        'memory_usage_threshold' => env('MEMORY_USAGE_THRESHOLD', 80), // porcentaje
        'cpu_usage_threshold' => env('CPU_USAGE_THRESHOLD', 80), // porcentaje
        'response_time_threshold' => env('RESPONSE_TIME_THRESHOLD', 2000), // milisegundos
    ],

    /*
    |--------------------------------------------------------------------------
    | Alertas de Negocio
    |--------------------------------------------------------------------------
    */
    'business_alerts' => [
        'maintenance_overdue_threshold' => env('MAINTENANCE_OVERDUE_THRESHOLD', 7), // días
        'calibration_expiry_warning' => env('CALIBRATION_EXPIRY_WARNING', 30), // días
        'warranty_expiry_warning' => env('WARRANTY_EXPIRY_WARNING', 90), // días
        'critical_contingency_threshold' => env('CRITICAL_CONTINGENCY_THRESHOLD', 5), // cantidad
        'equipment_downtime_threshold' => env('EQUIPMENT_DOWNTIME_THRESHOLD', 24), // horas
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Notificaciones
    |--------------------------------------------------------------------------
    */
    'notifications' => [
        'email' => [
            'enabled' => env('EMAIL_NOTIFICATIONS_ENABLED', true),
            'recipients' => [
                'admin' => env('ADMIN_EMAIL', 'admin@eva-system.com'),
                'technical' => env('TECHNICAL_EMAIL', 'technical@eva-system.com'),
                'management' => env('MANAGEMENT_EMAIL', 'management@eva-system.com'),
            ],
        ],
        'slack' => [
            'enabled' => env('SLACK_NOTIFICATIONS_ENABLED', false),
            'webhook_url' => env('SLACK_WEBHOOK_URL'),
            'channel' => env('SLACK_CHANNEL', '#eva-alerts'),
        ],
        'sms' => [
            'enabled' => env('SMS_NOTIFICATIONS_ENABLED', false),
            'provider' => env('SMS_PROVIDER', 'twilio'),
            'emergency_numbers' => explode(',', env('EMERGENCY_SMS_NUMBERS', '')),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Logs de Auditoría
    |--------------------------------------------------------------------------
    */
    'audit' => [
        'enabled' => env('AUDIT_ENABLED', true),
        'retention_days' => env('AUDIT_RETENTION_DAYS', 365),
        'critical_actions' => [
            'equipment_creation',
            'equipment_deletion',
            'user_creation',
            'user_deletion',
            'maintenance_completion',
            'contingency_creation',
            'system_configuration_change',
        ],
        'sensitive_fields' => [
            'password',
            'token',
            'api_key',
            'secret',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Backup
    |--------------------------------------------------------------------------
    */
    'backup' => [
        'enabled' => env('BACKUP_ENABLED', true),
        'frequency' => env('BACKUP_FREQUENCY', 'daily'), // daily, weekly, monthly
        'retention_days' => env('BACKUP_RETENTION_DAYS', 30),
        'storage_disk' => env('BACKUP_STORAGE_DISK', 'local'),
        'include_uploads' => env('BACKUP_INCLUDE_UPLOADS', true),
        'compress' => env('BACKUP_COMPRESS', true),
        'encrypt' => env('BACKUP_ENCRYPT', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Salud del Sistema
    |--------------------------------------------------------------------------
    */
    'health_checks' => [
        'enabled' => env('HEALTH_CHECKS_ENABLED', true),
        'frequency' => env('HEALTH_CHECK_FREQUENCY', 300), // segundos
        'checks' => [
            'database' => [
                'enabled' => true,
                'timeout' => 5, // segundos
            ],
            'cache' => [
                'enabled' => true,
                'timeout' => 3, // segundos
            ],
            'storage' => [
                'enabled' => true,
                'timeout' => 5, // segundos
            ],
            'external_apis' => [
                'enabled' => false,
                'timeout' => 10, // segundos
                'endpoints' => [
                    // 'api_name' => 'https://api.example.com/health'
                ],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Métricas
    |--------------------------------------------------------------------------
    */
    'metrics' => [
        'enabled' => env('METRICS_ENABLED', true),
        'retention_days' => env('METRICS_RETENTION_DAYS', 90),
        'collection_interval' => env('METRICS_COLLECTION_INTERVAL', 60), // segundos
        'track' => [
            'api_requests' => true,
            'database_queries' => true,
            'cache_hits' => true,
            'memory_usage' => true,
            'response_times' => true,
            'error_rates' => true,
            'user_activity' => true,
            'equipment_usage' => true,
            'maintenance_metrics' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Seguridad
    |--------------------------------------------------------------------------
    */
    'security' => [
        'failed_login_threshold' => env('FAILED_LOGIN_THRESHOLD', 5),
        'failed_login_window' => env('FAILED_LOGIN_WINDOW', 900), // segundos (15 minutos)
        'suspicious_activity_threshold' => env('SUSPICIOUS_ACTIVITY_THRESHOLD', 10),
        'ip_whitelist' => explode(',', env('IP_WHITELIST', '')),
        'ip_blacklist' => explode(',', env('IP_BLACKLIST', '')),
        'rate_limit_threshold' => env('RATE_LIMIT_THRESHOLD', 100), // requests per minute
        'session_timeout' => env('SESSION_TIMEOUT', 7200), // segundos (2 horas)
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Reportes Automáticos
    |--------------------------------------------------------------------------
    */
    'reports' => [
        'enabled' => env('AUTO_REPORTS_ENABLED', true),
        'daily' => [
            'enabled' => true,
            'time' => '08:00',
            'recipients' => ['admin', 'technical'],
            'include' => [
                'system_health',
                'pending_maintenances',
                'critical_alerts',
                'equipment_status',
            ],
        ],
        'weekly' => [
            'enabled' => true,
            'day' => 'monday',
            'time' => '09:00',
            'recipients' => ['admin', 'management'],
            'include' => [
                'performance_summary',
                'maintenance_compliance',
                'equipment_utilization',
                'user_activity',
                'security_summary',
            ],
        ],
        'monthly' => [
            'enabled' => true,
            'day' => 1,
            'time' => '10:00',
            'recipients' => ['management'],
            'include' => [
                'comprehensive_report',
                'trends_analysis',
                'cost_analysis',
                'recommendations',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Mantenimiento del Sistema
    |--------------------------------------------------------------------------
    */
    'maintenance' => [
        'auto_cleanup' => [
            'enabled' => env('AUTO_CLEANUP_ENABLED', true),
            'schedule' => env('AUTO_CLEANUP_SCHEDULE', '0 2 * * *'), // cron expression
            'tasks' => [
                'old_logs' => true,
                'expired_sessions' => true,
                'temporary_files' => true,
                'old_backups' => true,
                'cache_cleanup' => true,
            ],
        ],
        'optimization' => [
            'enabled' => env('AUTO_OPTIMIZATION_ENABLED', true),
            'schedule' => env('AUTO_OPTIMIZATION_SCHEDULE', '0 3 * * 0'), // weekly
            'tasks' => [
                'database_optimization' => true,
                'index_optimization' => true,
                'cache_warming' => true,
                'image_optimization' => true,
            ],
        ],
    ],

];
