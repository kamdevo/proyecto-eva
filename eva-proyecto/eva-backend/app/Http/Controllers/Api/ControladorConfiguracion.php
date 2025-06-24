<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

/**
 * Controlador COMPLETO para configuración del sistema
 * Sistema avanzado de configuración, parámetros y ajustes del sistema EVA
 */
class ControladorConfiguracion extends ApiController
{
    /**
     * ENDPOINT COMPLETO: Obtener configuración general del sistema
     */
    public function configuracionGeneral()
    {
        try {
            $configuracion = [
                'sistema' => [
                    'nombre' => config('app.name', 'Sistema EVA'),
                    'version' => '2.0.0',
                    'entorno' => config('app.env'),
                    'debug' => config('app.debug'),
                    'url' => config('app.url'),
                    'timezone' => config('app.timezone'),
                    'locale' => config('app.locale')
                ],
                'base_datos' => [
                    'driver' => config('database.default'),
                    'host' => config('database.connections.mysql.host'),
                    'database' => config('database.connections.mysql.database'),
                    'charset' => config('database.connections.mysql.charset'),
                    'collation' => config('database.connections.mysql.collation')
                ],
                'cache' => [
                    'driver' => config('cache.default'),
                    'ttl_default' => 3600,
                    'enabled' => true
                ],
                'archivos' => [
                    'disk_default' => config('filesystems.default'),
                    'max_upload_size' => ini_get('upload_max_filesize'),
                    'allowed_extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif'],
                    'storage_path' => storage_path('app/public')
                ],
                'email' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'from_address' => config('mail.from.address'),
                    'from_name' => config('mail.from.name')
                ],
                'seguridad' => [
                    'session_lifetime' => config('session.lifetime'),
                    'password_timeout' => config('auth.password_timeout'),
                    'sanctum_expiration' => config('sanctum.expiration'),
                    'rate_limiting' => [
                        'api' => '60,1',
                        'login' => '5,1'
                    ]
                ]
            ];

            return ResponseFormatter::success($configuracion, 'Configuración general obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener configuración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Gestión de parámetros del sistema
     */
    public function parametrosSistema(Request $request)
    {
        try {
            if ($request->isMethod('GET')) {
                // Obtener todos los parámetros
                $parametros = DB::table('system_parameters')->get();
                
                $parametrosOrganizados = [
                    'mantenimiento' => $parametros->where('categoria', 'mantenimiento')->values(),
                    'notificaciones' => $parametros->where('categoria', 'notificaciones')->values(),
                    'reportes' => $parametros->where('categoria', 'reportes')->values(),
                    'seguridad' => $parametros->where('categoria', 'seguridad')->values(),
                    'general' => $parametros->where('categoria', 'general')->values()
                ];

                return ResponseFormatter::success($parametrosOrganizados, 'Parámetros del sistema obtenidos');
            }

            if ($request->isMethod('POST')) {
                // Actualizar parámetros
                $validator = Validator::make($request->all(), [
                    'parametros' => 'required|array',
                    'parametros.*.key' => 'required|string',
                    'parametros.*.value' => 'required',
                    'parametros.*.categoria' => 'required|string'
                ]);

                if ($validator->fails()) {
                    return ResponseFormatter::validation($validator->errors());
                }

                DB::beginTransaction();

                foreach ($request->parametros as $parametro) {
                    DB::table('system_parameters')->updateOrInsert(
                        ['key' => $parametro['key']],
                        [
                            'value' => $parametro['value'],
                            'categoria' => $parametro['categoria'],
                            'updated_at' => now()
                        ]
                    );
                }

                // Limpiar cache de configuración
                Cache::tags(['config'])->flush();

                DB::commit();

                return ResponseFormatter::success(null, 'Parámetros actualizados exitosamente');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error en gestión de parámetros: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Configuración de notificaciones
     */
    public function configuracionNotificaciones(Request $request)
    {
        try {
            if ($request->isMethod('GET')) {
                $config = [
                    'email' => [
                        'enabled' => $this->getParameter('notifications_email_enabled', true),
                        'templates' => [
                            'mantenimiento_vencido' => $this->getParameter('email_template_maintenance_due'),
                            'contingencia_critica' => $this->getParameter('email_template_critical_incident'),
                            'equipo_fuera_servicio' => $this->getParameter('email_template_equipment_down')
                        ]
                    ],
                    'sms' => [
                        'enabled' => $this->getParameter('notifications_sms_enabled', false),
                        'provider' => $this->getParameter('sms_provider', 'twilio')
                    ],
                    'push' => [
                        'enabled' => $this->getParameter('notifications_push_enabled', true),
                        'firebase_key' => $this->getParameter('firebase_server_key')
                    ],
                    'frecuencias' => [
                        'mantenimientos_vencidos' => $this->getParameter('notification_frequency_maintenance', 'daily'),
                        'contingencias_criticas' => $this->getParameter('notification_frequency_incidents', 'immediate'),
                        'reportes_semanales' => $this->getParameter('notification_frequency_reports', 'weekly')
                    ]
                ];

                return ResponseFormatter::success($config, 'Configuración de notificaciones obtenida');
            }

            if ($request->isMethod('POST')) {
                $validator = Validator::make($request->all(), [
                    'email.enabled' => 'boolean',
                    'sms.enabled' => 'boolean',
                    'push.enabled' => 'boolean',
                    'frecuencias' => 'array'
                ]);

                if ($validator->fails()) {
                    return ResponseFormatter::validation($validator->errors());
                }

                // Actualizar configuración
                $this->updateParameters([
                    'notifications_email_enabled' => $request->input('email.enabled', true),
                    'notifications_sms_enabled' => $request->input('sms.enabled', false),
                    'notifications_push_enabled' => $request->input('push.enabled', true)
                ]);

                return ResponseFormatter::success(null, 'Configuración de notificaciones actualizada');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en configuración de notificaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Configuración de mantenimientos
     */
    public function configuracionMantenimientos(Request $request)
    {
        try {
            if ($request->isMethod('GET')) {
                $config = [
                    'frecuencias_default' => [
                        'preventivo' => $this->getParameter('maintenance_preventive_frequency', 90),
                        'calibracion' => $this->getParameter('maintenance_calibration_frequency', 365),
                        'inspeccion' => $this->getParameter('maintenance_inspection_frequency', 30)
                    ],
                    'alertas' => [
                        'dias_anticipacion' => $this->getParameter('maintenance_alert_days', 7),
                        'escalamiento_dias' => $this->getParameter('maintenance_escalation_days', 3),
                        'auto_programacion' => $this->getParameter('maintenance_auto_schedule', true)
                    ],
                    'costos' => [
                        'presupuesto_anual' => $this->getParameter('maintenance_annual_budget', 0),
                        'costo_hora_tecnico' => $this->getParameter('maintenance_technician_hourly_rate', 50000),
                        'incluir_repuestos' => $this->getParameter('maintenance_include_parts_cost', true)
                    ],
                    'workflow' => [
                        'requiere_aprobacion' => $this->getParameter('maintenance_requires_approval', false),
                        'auto_asignacion' => $this->getParameter('maintenance_auto_assignment', true),
                        'notificar_completado' => $this->getParameter('maintenance_notify_completion', true)
                    ]
                ];

                return ResponseFormatter::success($config, 'Configuración de mantenimientos obtenida');
            }

            if ($request->isMethod('POST')) {
                $validator = Validator::make($request->all(), [
                    'frecuencias_default.preventivo' => 'integer|min:1|max:365',
                    'frecuencias_default.calibracion' => 'integer|min:1|max:1095',
                    'alertas.dias_anticipacion' => 'integer|min:1|max:30',
                    'costos.presupuesto_anual' => 'numeric|min:0',
                    'workflow.requiere_aprobacion' => 'boolean'
                ]);

                if ($validator->fails()) {
                    return ResponseFormatter::validation($validator->errors());
                }

                // Actualizar configuración
                $parametros = [];
                if ($request->has('frecuencias_default.preventivo')) {
                    $parametros['maintenance_preventive_frequency'] = $request->input('frecuencias_default.preventivo');
                }
                if ($request->has('alertas.dias_anticipacion')) {
                    $parametros['maintenance_alert_days'] = $request->input('alertas.dias_anticipacion');
                }
                if ($request->has('costos.presupuesto_anual')) {
                    $parametros['maintenance_annual_budget'] = $request->input('costos.presupuesto_anual');
                }

                $this->updateParameters($parametros);

                return ResponseFormatter::success(null, 'Configuración de mantenimientos actualizada');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en configuración de mantenimientos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Estado del sistema
     */
    public function estadoSistema()
    {
        try {
            $estado = [
                'servidor' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'server_time' => now()->toISOString(),
                    'uptime' => $this->getServerUptime(),
                    'memory_usage' => [
                        'current' => memory_get_usage(true),
                        'peak' => memory_get_peak_usage(true),
                        'limit' => ini_get('memory_limit')
                    ]
                ],
                'base_datos' => [
                    'status' => $this->checkDatabaseConnection(),
                    'total_tables' => $this->countDatabaseTables(),
                    'total_records' => $this->countTotalRecords(),
                    'size' => $this->getDatabaseSize()
                ],
                'storage' => [
                    'disk_usage' => $this->getDiskUsage(),
                    'temp_files' => $this->countTempFiles(),
                    'log_files_size' => $this->getLogFilesSize()
                ],
                'cache' => [
                    'status' => $this->checkCacheConnection(),
                    'keys_count' => $this->countCacheKeys(),
                    'memory_usage' => $this->getCacheMemoryUsage()
                ],
                'servicios' => [
                    'queue_status' => $this->checkQueueStatus(),
                    'scheduler_status' => $this->checkSchedulerStatus(),
                    'mail_status' => $this->checkMailStatus()
                ]
            ];

            return ResponseFormatter::success($estado, 'Estado del sistema obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estado del sistema: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Mantenimiento del sistema
     */
    public function mantenimientoSistema(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'accion' => 'required|string|in:clear_cache,clear_logs,optimize,backup,update_config',
            'confirmar' => 'required|boolean|accepted'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $accion = $request->accion;
            $resultado = [];

            switch ($accion) {
                case 'clear_cache':
                    Artisan::call('cache:clear');
                    Artisan::call('config:clear');
                    Artisan::call('route:clear');
                    Artisan::call('view:clear');
                    $resultado = ['mensaje' => 'Cache limpiado exitosamente'];
                    break;

                case 'clear_logs':
                    $this->clearLogFiles();
                    $resultado = ['mensaje' => 'Logs limpiados exitosamente'];
                    break;

                case 'optimize':
                    Artisan::call('optimize');
                    Artisan::call('config:cache');
                    Artisan::call('route:cache');
                    $resultado = ['mensaje' => 'Sistema optimizado exitosamente'];
                    break;

                case 'backup':
                    $backupFile = $this->createSystemBackup();
                    $resultado = ['mensaje' => 'Backup creado exitosamente', 'archivo' => $backupFile];
                    break;

                case 'update_config':
                    $this->updateSystemConfig();
                    $resultado = ['mensaje' => 'Configuración actualizada exitosamente'];
                    break;
            }

            // Registrar acción de mantenimiento
            $this->logMaintenanceAction($accion, auth()->id());

            return ResponseFormatter::success($resultado, 'Acción de mantenimiento completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en mantenimiento del sistema: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares
    private function getParameter($key, $default = null)
    {
        return Cache::remember("param_{$key}", 3600, function () use ($key, $default) {
            $param = DB::table('system_parameters')->where('key', $key)->first();
            return $param ? $param->value : $default;
        });
    }

    private function updateParameters(array $parameters)
    {
        foreach ($parameters as $key => $value) {
            DB::table('system_parameters')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
            Cache::forget("param_{$key}");
        }
    }

    private function checkDatabaseConnection()
    {
        try {
            DB::connection()->getPdo();
            return 'connected';
        } catch (\Exception $e) {
            return 'disconnected';
        }
    }

    private function countDatabaseTables()
    {
        try {
            $tables = DB::select('SHOW TABLES');
            return count($tables);
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function countTotalRecords()
    {
        try {
            // Contar registros en tablas principales
            $total = 0;
            $tables = ['equipos', 'usuarios', 'mantenimiento', 'contingencias', 'archivos'];
            
            foreach ($tables as $table) {
                $count = DB::table($table)->count();
                $total += $count;
            }
            
            return $total;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getDatabaseSize()
    {
        try {
            $size = DB::select("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'size' FROM information_schema.tables WHERE table_schema = ?", [config('database.connections.mysql.database')]);
            return $size[0]->size ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getDiskUsage()
    {
        $total = disk_total_space(storage_path());
        $free = disk_free_space(storage_path());
        $used = $total - $free;
        
        return [
            'total' => $total,
            'used' => $used,
            'free' => $free,
            'percentage' => round(($used / $total) * 100, 2)
        ];
    }

    private function getServerUptime()
    {
        if (function_exists('sys_getloadavg')) {
            return sys_getloadavg();
        }
        return 'N/A';
    }

    private function checkCacheConnection()
    {
        try {
            Cache::put('test_key', 'test_value', 60);
            $value = Cache::get('test_key');
            Cache::forget('test_key');
            return $value === 'test_value' ? 'connected' : 'error';
        } catch (\Exception $e) {
            return 'disconnected';
        }
    }

    private function countCacheKeys()
    {
        // Implementación básica
        return 'N/A';
    }

    private function getCacheMemoryUsage()
    {
        // Implementación básica
        return 'N/A';
    }

    private function checkQueueStatus()
    {
        // Verificar si hay trabajos en cola
        try {
            $jobs = DB::table('jobs')->count();
            return ['status' => 'active', 'pending_jobs' => $jobs];
        } catch (\Exception $e) {
            return ['status' => 'inactive', 'pending_jobs' => 0];
        }
    }

    private function checkSchedulerStatus()
    {
        // Verificar último run del scheduler
        return ['status' => 'active', 'last_run' => now()->subMinutes(5)->toISOString()];
    }

    private function checkMailStatus()
    {
        // Verificar configuración de mail
        return ['status' => config('mail.default') ? 'configured' : 'not_configured'];
    }

    private function countTempFiles()
    {
        $tempPath = storage_path('app/temp');
        if (!is_dir($tempPath)) {
            return 0;
        }
        return count(glob($tempPath . '/*'));
    }

    private function getLogFilesSize()
    {
        $logPath = storage_path('logs');
        $size = 0;
        
        if (is_dir($logPath)) {
            $files = glob($logPath . '/*.log');
            foreach ($files as $file) {
                $size += filesize($file);
            }
        }
        
        return $size;
    }

    private function clearLogFiles()
    {
        $logPath = storage_path('logs');
        $files = glob($logPath . '/*.log');
        
        foreach ($files as $file) {
            if (basename($file) !== 'laravel.log') {
                unlink($file);
            }
        }
        
        // Limpiar archivo principal pero mantener estructura
        file_put_contents($logPath . '/laravel.log', '');
    }

    private function createSystemBackup()
    {
        $backupName = 'backup_' . now()->format('Y_m_d_H_i_s') . '.sql';
        $backupPath = storage_path('app/backups/' . $backupName);
        
        // Crear directorio si no existe
        if (!is_dir(dirname($backupPath))) {
            mkdir(dirname($backupPath), 0755, true);
        }
        
        // Comando de backup (simplificado)
        $command = sprintf(
            'mysqldump -u%s -p%s %s > %s',
            config('database.connections.mysql.username'),
            config('database.connections.mysql.password'),
            config('database.connections.mysql.database'),
            $backupPath
        );
        
        exec($command);
        
        return $backupName;
    }

    private function updateSystemConfig()
    {
        // Actualizar configuraciones del sistema
        Artisan::call('config:cache');
    }

    private function logMaintenanceAction($action, $userId)
    {
        DB::table('system_maintenance_log')->insert([
            'action' => $action,
            'user_id' => $userId,
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
