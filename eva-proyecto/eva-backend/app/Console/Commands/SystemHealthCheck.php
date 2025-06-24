<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use Carbon\Carbon;

class SystemHealthCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:health-check {--format=table : Output format (table, json)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Perform comprehensive system health check';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Iniciando verificación de salud del sistema...');
        $this->newLine();

        $results = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
            'business_logic' => $this->checkBusinessLogic(),
            'performance' => $this->checkPerformance(),
            'security' => $this->checkSecurity(),
        ];

        $overallHealth = $this->calculateOverallHealth($results);

        if ($this->option('format') === 'json') {
            $this->line(json_encode([
                'timestamp' => now()->toISOString(),
                'overall_health' => $overallHealth,
                'checks' => $results
            ], JSON_PRETTY_PRINT));
        } else {
            $this->displayResults($results, $overallHealth);
        }

        return $overallHealth['status'] === 'healthy' ? 0 : 1;
    }

    /**
     * Check database connectivity and performance
     */
    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            
            // Test basic connectivity
            DB::connection()->getPdo();
            
            // Test query performance
            $equipmentCount = Equipo::count();
            $maintenanceCount = Mantenimiento::count();
            
            $duration = round((microtime(true) - $start) * 1000, 2);
            
            $status = $duration < 1000 ? 'healthy' : ($duration < 3000 ? 'warning' : 'critical');
            
            return [
                'status' => $status,
                'response_time_ms' => $duration,
                'equipment_count' => $equipmentCount,
                'maintenance_count' => $maintenanceCount,
                'message' => $status === 'healthy' ? 'Database is responsive' : 'Database response is slow'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'critical',
                'error' => $e->getMessage(),
                'message' => 'Database connection failed'
            ];
        }
    }

    /**
     * Check cache system
     */
    private function checkCache(): array
    {
        try {
            $testKey = 'health_check_' . time();
            $testValue = 'test_value';
            
            $start = microtime(true);
            
            // Test cache write
            Cache::put($testKey, $testValue, 60);
            
            // Test cache read
            $retrieved = Cache::get($testKey);
            
            // Clean up
            Cache::forget($testKey);
            
            $duration = round((microtime(true) - $start) * 1000, 2);
            
            if ($retrieved !== $testValue) {
                return [
                    'status' => 'critical',
                    'message' => 'Cache read/write test failed'
                ];
            }
            
            $status = $duration < 100 ? 'healthy' : ($duration < 500 ? 'warning' : 'critical');
            
            return [
                'status' => $status,
                'response_time_ms' => $duration,
                'message' => $status === 'healthy' ? 'Cache is working properly' : 'Cache is slow'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'critical',
                'error' => $e->getMessage(),
                'message' => 'Cache system failed'
            ];
        }
    }

    /**
     * Check storage system
     */
    private function checkStorage(): array
    {
        try {
            $testFile = 'health_check_' . time() . '.txt';
            $testContent = 'Health check test file';
            
            $start = microtime(true);
            
            // Test file write
            Storage::disk('public')->put($testFile, $testContent);
            
            // Test file read
            $retrieved = Storage::disk('public')->get($testFile);
            
            // Test file delete
            Storage::disk('public')->delete($testFile);
            
            $duration = round((microtime(true) - $start) * 1000, 2);
            
            if ($retrieved !== $testContent) {
                return [
                    'status' => 'critical',
                    'message' => 'Storage read/write test failed'
                ];
            }
            
            // Check disk space
            $freeSpace = disk_free_space(storage_path());
            $totalSpace = disk_total_space(storage_path());
            $usagePercent = round((($totalSpace - $freeSpace) / $totalSpace) * 100, 1);
            
            $spaceStatus = $usagePercent < 80 ? 'healthy' : ($usagePercent < 90 ? 'warning' : 'critical');
            $timeStatus = $duration < 200 ? 'healthy' : ($duration < 1000 ? 'warning' : 'critical');
            
            $overallStatus = $this->getWorstStatus([$spaceStatus, $timeStatus]);
            
            return [
                'status' => $overallStatus,
                'response_time_ms' => $duration,
                'disk_usage_percent' => $usagePercent,
                'free_space_gb' => round($freeSpace / (1024**3), 2),
                'message' => $overallStatus === 'healthy' ? 'Storage is working properly' : 'Storage has issues'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'critical',
                'error' => $e->getMessage(),
                'message' => 'Storage system failed'
            ];
        }
    }

    /**
     * Check business logic health
     */
    private function checkBusinessLogic(): array
    {
        try {
            $issues = [];
            
            // Check for overdue maintenances
            $overdueMaintenances = Mantenimiento::where('status', 'programado')
                ->where('fecha_programada', '<', now())
                ->count();
            
            if ($overdueMaintenances > 0) {
                $issues[] = "{$overdueMaintenances} mantenimientos vencidos";
            }
            
            // Check for critical contingencies
            $criticalContingencies = Contingencia::where('prioridad', 'alta')
                ->where('estado_id', '!=', 3)
                ->count();
            
            if ($criticalContingencies > 5) {
                $issues[] = "{$criticalContingencies} contingencias críticas abiertas";
            }
            
            // Check for inactive equipment
            $inactiveEquipment = Equipo::where('status', false)->count();
            $totalEquipment = Equipo::count();
            $inactivePercent = $totalEquipment > 0 ? round(($inactiveEquipment / $totalEquipment) * 100, 1) : 0;
            
            if ($inactivePercent > 10) {
                $issues[] = "{$inactivePercent}% de equipos inactivos";
            }
            
            $status = empty($issues) ? 'healthy' : (count($issues) <= 2 ? 'warning' : 'critical');
            
            return [
                'status' => $status,
                'overdue_maintenances' => $overdueMaintenances,
                'critical_contingencies' => $criticalContingencies,
                'inactive_equipment_percent' => $inactivePercent,
                'issues' => $issues,
                'message' => empty($issues) ? 'Business logic is healthy' : 'Business logic has issues'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'critical',
                'error' => $e->getMessage(),
                'message' => 'Business logic check failed'
            ];
        }
    }

    /**
     * Check system performance
     */
    private function checkPerformance(): array
    {
        try {
            $memoryUsage = memory_get_usage(true);
            $memoryLimit = $this->parseMemoryLimit(ini_get('memory_limit'));
            $memoryPercent = round(($memoryUsage / $memoryLimit) * 100, 1);
            
            $loadAverage = sys_getloadavg();
            $cpuCores = $this->getCpuCores();
            $loadPercent = round(($loadAverage[0] / $cpuCores) * 100, 1);
            
            $memoryStatus = $memoryPercent < 70 ? 'healthy' : ($memoryPercent < 85 ? 'warning' : 'critical');
            $cpuStatus = $loadPercent < 70 ? 'healthy' : ($loadPercent < 85 ? 'warning' : 'critical');
            
            $overallStatus = $this->getWorstStatus([$memoryStatus, $cpuStatus]);
            
            return [
                'status' => $overallStatus,
                'memory_usage_percent' => $memoryPercent,
                'memory_usage_mb' => round($memoryUsage / (1024**2), 2),
                'cpu_load_percent' => $loadPercent,
                'load_average' => $loadAverage[0],
                'cpu_cores' => $cpuCores,
                'message' => $overallStatus === 'healthy' ? 'Performance is good' : 'Performance issues detected'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'warning',
                'error' => $e->getMessage(),
                'message' => 'Performance check partially failed'
            ];
        }
    }

    /**
     * Check security status
     */
    private function checkSecurity(): array
    {
        try {
            $issues = [];
            
            // Check for default passwords (simplified check)
            $defaultUsers = DB::table('usuarios')
                ->where('password', bcrypt('password'))
                ->orWhere('password', bcrypt('123456'))
                ->count();
            
            if ($defaultUsers > 0) {
                $issues[] = "{$defaultUsers} usuarios con contraseñas por defecto";
            }
            
            // Check SSL configuration
            if (!request()->isSecure() && app()->environment('production')) {
                $issues[] = "HTTPS no está configurado en producción";
            }
            
            // Check debug mode
            if (config('app.debug') && app()->environment('production')) {
                $issues[] = "Modo debug habilitado en producción";
            }
            
            $status = empty($issues) ? 'healthy' : (count($issues) <= 1 ? 'warning' : 'critical');
            
            return [
                'status' => $status,
                'default_passwords' => $defaultUsers,
                'https_enabled' => request()->isSecure(),
                'debug_mode' => config('app.debug'),
                'issues' => $issues,
                'message' => empty($issues) ? 'Security is good' : 'Security issues detected'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'warning',
                'error' => $e->getMessage(),
                'message' => 'Security check partially failed'
            ];
        }
    }

    /**
     * Calculate overall health status
     */
    private function calculateOverallHealth(array $results): array
    {
        $statuses = array_column($results, 'status');
        $criticalCount = count(array_filter($statuses, fn($s) => $s === 'critical'));
        $warningCount = count(array_filter($statuses, fn($s) => $s === 'warning'));
        
        if ($criticalCount > 0) {
            $status = 'critical';
            $message = "Sistema en estado crítico ({$criticalCount} problemas críticos)";
        } elseif ($warningCount > 2) {
            $status = 'warning';
            $message = "Sistema con advertencias ({$warningCount} advertencias)";
        } else {
            $status = 'healthy';
            $message = "Sistema funcionando correctamente";
        }
        
        return [
            'status' => $status,
            'message' => $message,
            'critical_issues' => $criticalCount,
            'warnings' => $warningCount,
            'timestamp' => now()->toISOString()
        ];
    }

    /**
     * Display results in table format
     */
    private function displayResults(array $results, array $overallHealth): void
    {
        $this->table(
            ['Component', 'Status', 'Message', 'Details'],
            collect($results)->map(function ($result, $component) {
                $status = $this->formatStatus($result['status']);
                $details = collect($result)
                    ->except(['status', 'message', 'error'])
                    ->map(fn($value, $key) => "{$key}: {$value}")
                    ->take(3)
                    ->implode(', ');
                
                return [
                    ucfirst($component),
                    $status,
                    $result['message'] ?? 'N/A',
                    $details ?: 'N/A'
                ];
            })->toArray()
        );
        
        $this->newLine();
        $overallStatus = $this->formatStatus($overallHealth['status']);
        $this->line("🏥 <options=bold>Estado General:</> {$overallStatus} - {$overallHealth['message']}");
        $this->newLine();
    }

    /**
     * Format status with colors
     */
    private function formatStatus(string $status): string
    {
        return match ($status) {
            'healthy' => '<fg=green>✓ Saludable</>',
            'warning' => '<fg=yellow>⚠ Advertencia</>',
            'critical' => '<fg=red>✗ Crítico</>',
            default => '<fg=gray>? Desconocido</>'
        };
    }

    /**
     * Get worst status from array
     */
    private function getWorstStatus(array $statuses): string
    {
        if (in_array('critical', $statuses)) return 'critical';
        if (in_array('warning', $statuses)) return 'warning';
        return 'healthy';
    }

    /**
     * Parse memory limit string to bytes
     */
    private function parseMemoryLimit(string $limit): int
    {
        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit)-1]);
        $value = (int) $limit;
        
        switch($last) {
            case 'g': $value *= 1024;
            case 'm': $value *= 1024;
            case 'k': $value *= 1024;
        }
        
        return $value;
    }

    /**
     * Get number of CPU cores
     */
    private function getCpuCores(): int
    {
        if (PHP_OS_FAMILY === 'Windows') {
            return (int) shell_exec('echo %NUMBER_OF_PROCESSORS%') ?: 1;
        } else {
            return (int) shell_exec('nproc') ?: 1;
        }
    }
}
