<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Exception;

/**
 * @OA\Tag(
 *     name="HealthController",
 *     description="Operaciones del HealthController"
 * )
 */
class HealthController extends Controller
{
    /**
     * Health check básico del sistema
     */
    public function health()
    {
        try {
            \Log::info('Ejecutando método en HealthController', ['user_id' => auth()->id()]);
            return response()->json([
                'status' => 'ok',
                'message' => 'Sistema EVA funcionando correctamente',
                'timestamp' => now()->toISOString(),
                'version' => '1.0.0'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error en health check básico',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Health check avanzado con métricas del sistema
     */
    public function healthAdvanced()
    {
        try {
            \Log::info('Ejecutando método en HealthController', ['user_id' => auth()->id()]);
            $startTime = microtime(true);
            
            // Verificar conexión a base de datos
            $dbStatus = $this->checkDatabase();
            
            // Verificar cache
            $cacheStatus = $this->checkCache();
            
            // Calcular tiempo de respuesta
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            $overallStatus = ($dbStatus['status'] === 'ok' && $cacheStatus['status'] === 'ok') ? 'ok' : 'warning';
            
            return response()->json([
                'status' => $overallStatus,
                'message' => 'Health check avanzado completado',
                'timestamp' => now()->toISOString(),
                'response_time_ms' => $responseTime,
                'checks' => [
                    'database' => $dbStatus,
                    'cache' => $cacheStatus,
                    'memory' => $this->getMemoryUsage(),
                    'disk' => $this->getDiskUsage()
                ],
                'system_info' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'environment' => app()->environment(),
                    'timezone' => config('app.timezone')
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error en health check avanzado',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * Monitoreo en tiempo real del sistema
     */
    public function monitor()
    {
        try {
            \Log::info('Ejecutando método en HealthController', ['user_id' => auth()->id()]);
            $metrics = [
                'timestamp' => now()->toISOString(),
                'uptime' => $this->getUptime(),
                'connections' => $this->getActiveConnections(),
                'performance' => [
                    'cpu_usage' => $this->getCpuUsage(),
                    'memory_usage' => $this->getMemoryUsage(),
                    'disk_usage' => $this->getDiskUsage(),
                    'response_time' => $this->getAverageResponseTime()
                ],
                'database' => [
                    'active_connections' => $this->getDatabaseConnections(),
                    'query_count' => $this->getQueryCount(),
                    'slow_queries' => $this->getSlowQueries()
                ],
                'cache' => [
                    'hit_rate' => $this->getCacheHitRate(),
                    'memory_usage' => $this->getCacheMemoryUsage()
                ]
            ];

            return response()->json([
                'status' => 'ok',
                'message' => 'Monitoreo en tiempo real',
                'metrics' => $metrics
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error en monitoreo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar estado de la base de datos
     */
    private function checkDatabase()
    {
        try {
            $startTime = microtime(true);
            DB::connection()->getPdo();
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            return [
                'status' => 'ok',
                'message' => 'Conexión a base de datos exitosa',
                'response_time_ms' => $responseTime,
                'connection_name' => DB::connection()->getName()
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error de conexión a base de datos',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verificar estado del cache
     */
    private function checkCache()
    {
        try {
            $testKey = 'health_check_' . time();
            $testValue = 'test_value';
            
            Cache::put($testKey, $testValue, 60);
            $retrieved = Cache::get($testKey);
            Cache::forget($testKey);
            
            if ($retrieved === $testValue) {
                return [
                    'status' => 'ok',
                    'message' => 'Cache funcionando correctamente',
                    'driver' => config('cache.default')
                ];
            } else {
                return [
                    'status' => 'warning',
                    'message' => 'Cache no está funcionando correctamente'
                ];
            }
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error en cache',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtener uso de memoria
     */
    private function getMemoryUsage()
    {
        $memoryUsage = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        $memoryLimit = ini_get('memory_limit');
        
        return [
            'current_mb' => round($memoryUsage / 1024 / 1024, 2),
            'peak_mb' => round($memoryPeak / 1024 / 1024, 2),
            'limit' => $memoryLimit,
            'percentage' => round(($memoryUsage / $this->parseMemoryLimit($memoryLimit)) * 100, 2)
        ];
    }

    /**
     * Obtener uso de disco
     */
    private function getDiskUsage()
    {
        $path = base_path();
        $totalBytes = disk_total_space($path);
        $freeBytes = disk_free_space($path);
        $usedBytes = $totalBytes - $freeBytes;
        
        return [
            'total_gb' => round($totalBytes / 1024 / 1024 / 1024, 2),
            'used_gb' => round($usedBytes / 1024 / 1024 / 1024, 2),
            'free_gb' => round($freeBytes / 1024 / 1024 / 1024, 2),
            'percentage' => round(($usedBytes / $totalBytes) * 100, 2)
        ];
    }

    /**
     * Métodos de monitoreo simplificados para evitar errores
     */
    private function getUptime()
    {
        return 'N/A - Requiere configuración específica del servidor';
    }

    private function getActiveConnections()
    {
        return 'N/A - Requiere configuración específica del servidor';
    }

    private function getCpuUsage()
    {
        return 'N/A - Requiere configuración específica del servidor';
    }

    private function getAverageResponseTime()
    {
        return 'N/A - Requiere implementación de métricas';
    }

    private function getDatabaseConnections()
    {
        try {
            return DB::select('SHOW STATUS LIKE "Threads_connected"')[0]->Value ?? 'N/A';
        } catch (Exception $e) {
            return 'N/A';
        }
    }

    private function getQueryCount()
    {
        return 'N/A - Requiere implementación de métricas';
    }

    private function getSlowQueries()
    {
        return 'N/A - Requiere configuración de logs';
    }

    private function getCacheHitRate()
    {
        return 'N/A - Requiere implementación de métricas';
    }

    private function getCacheMemoryUsage()
    {
        return 'N/A - Requiere configuración específica';
    }

    /**
     * Parsear límite de memoria
     */
    private function parseMemoryLimit($limit)
    {
        if ($limit == -1) {
            return PHP_INT_MAX;
        }
        
        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit)-1]);
        $limit = (int) $limit;
        
        switch($last) {
            case 'g':
                $limit *= 1024;
            case 'm':
                $limit *= 1024;
            case 'k':
                $limit *= 1024;
        }
        
        return $limit;
    }
}
