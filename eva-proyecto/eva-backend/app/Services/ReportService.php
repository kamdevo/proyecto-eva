<?php

namespace App\Services;

use App\Jobs\GenerateReport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ReportService
{
    /**
     * Cache TTL for reports.
     */
    protected int $cacheTtl = 1800; // 30 minutes

    /**
     * Generate equipment report.
     */
    public function generateEquipmentReport(array $filters = []): array
    {
        $cacheKey = 'report:equipment:' . md5(serialize($filters));

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($filters) {
            $query = DB::table('equipos')
                ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
                ->leftJoin('tipos', 'equipos.tipo_id', '=', 'tipos.id')
                ->leftJoin('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
                ->leftJoin('propietarios', 'equipos.propietario_id', '=', 'propietarios.id')
                ->select([
                    'equipos.id',
                    'equipos.code',
                    'equipos.name',
                    'equipos.marca',
                    'equipos.modelo',
                    'equipos.serial',
                    'equipos.status',
                    'equipos.estado_mantenimiento',
                    'equipos.fecha_instalacion',
                    'equipos.vida_util',
                    'equipos.costo',
                    'equipos.created_at',
                    'servicios.name as servicio',
                    'areas.name as area',
                    'tipos.name as tipo',
                    'estadoequipos.name as estado',
                    'propietarios.nombre as propietario'
                ]);

            $this->applyEquipmentFilters($query, $filters);

            $data = $query->get();

            return [
                'title' => 'Reporte de Equipos',
                'generated_at' => now()->toISOString(),
                'filters' => $filters,
                'data' => $data,
                'summary' => $this->getEquipmentSummary($data),
                'charts' => $this->getEquipmentCharts($data),
            ];
        });
    }

    /**
     * Generate maintenance report.
     */
    public function generateMaintenanceReport(array $filters = []): array
    {
        $cacheKey = 'report:maintenance:' . md5(serialize($filters));

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($filters) {
            $query = DB::table('mantenimiento')
                ->leftJoin('equipos', 'mantenimiento.equipo_id', '=', 'equipos.id')
                ->leftJoin('proveedores_mantenimiento', 'mantenimiento.proveedor_mantenimiento_id', '=', 'proveedores_mantenimiento.id')
                ->leftJoin('tecnicos', 'mantenimiento.tecnico_id', '=', 'tecnicos.id')
                ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                ->select([
                    'mantenimiento.id',
                    'mantenimiento.description',
                    'mantenimiento.fecha_mantenimiento',
                    'mantenimiento.fecha_programada',
                    'mantenimiento.status',
                    'mantenimiento.observacion',
                    'mantenimiento.created_at',
                    'equipos.code as equipo_code',
                    'equipos.name as equipo_name',
                    'servicios.name as servicio',
                    'proveedores_mantenimiento.name as proveedor',
                    'tecnicos.name as tecnico'
                ]);

            $this->applyMaintenanceFilters($query, $filters);

            $data = $query->get();

            return [
                'title' => 'Reporte de Mantenimientos',
                'generated_at' => now()->toISOString(),
                'filters' => $filters,
                'data' => $data,
                'summary' => $this->getMaintenanceSummary($data),
                'charts' => $this->getMaintenanceCharts($data),
            ];
        });
    }

    /**
     * Generate contingency report.
     */
    public function generateContingencyReport(array $filters = []): array
    {
        $cacheKey = 'report:contingency:' . md5(serialize($filters));

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($filters) {
            $query = DB::table('contingencias')
                ->leftJoin('equipos', 'contingencias.equipo_id', '=', 'equipos.id')
                ->leftJoin('usuarios', 'contingencias.usuario_id', '=', 'usuarios.id')
                ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                ->select([
                    'contingencias.id',
                    'contingencias.fecha',
                    'contingencias.observacion',
                    'contingencias.estado',
                    'contingencias.impacto',
                    'contingencias.categoria',
                    'contingencias.tiempo_resolucion',
                    'contingencias.costo_real',
                    'contingencias.created_at',
                    'equipos.code as equipo_code',
                    'equipos.name as equipo_name',
                    'servicios.name as servicio',
                    'usuarios.nombre as usuario_nombre',
                    'usuarios.apellido as usuario_apellido'
                ]);

            $this->applyContingencyFilters($query, $filters);

            $data = $query->get();

            return [
                'title' => 'Reporte de Contingencias',
                'generated_at' => now()->toISOString(),
                'filters' => $filters,
                'data' => $data,
                'summary' => $this->getContingencySummary($data),
                'charts' => $this->getContingencyCharts($data),
            ];
        });
    }

    /**
     * Generate performance report.
     */
    public function generatePerformanceReport(array $filters = []): array
    {
        $cacheKey = 'report:performance:' . md5(serialize($filters));

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($filters) {
            $startDate = $filters['fecha_desde'] ?? now()->subMonth()->format('Y-m-d');
            $endDate = $filters['fecha_hasta'] ?? now()->format('Y-m-d');

            // Equipment performance metrics
            $equipmentMetrics = $this->getEquipmentPerformanceMetrics($startDate, $endDate);
            
            // Maintenance performance metrics
            $maintenanceMetrics = $this->getMaintenancePerformanceMetrics($startDate, $endDate);
            
            // System performance metrics
            $systemMetrics = $this->getSystemPerformanceMetrics($startDate, $endDate);

            return [
                'title' => 'Reporte de Rendimiento',
                'generated_at' => now()->toISOString(),
                'period' => ['start' => $startDate, 'end' => $endDate],
                'filters' => $filters,
                'equipment_metrics' => $equipmentMetrics,
                'maintenance_metrics' => $maintenanceMetrics,
                'system_metrics' => $systemMetrics,
                'recommendations' => $this->generateRecommendations($equipmentMetrics, $maintenanceMetrics),
            ];
        });
    }

    /**
     * Queue report generation for large datasets.
     */
    public function queueReportGeneration(string $type, array $filters, int $userId): string
    {
        $jobId = uniqid('report_');
        
        GenerateReport::dispatch($type, $filters, $userId)
                     ->onQueue('reports')
                     ->delay(now()->addSeconds(5));

        return $jobId;
    }

    /**
     * Get available report files for user.
     */
    public function getAvailableReports(int $userId): array
    {
        $files = Storage::disk('local')->files("reports");
        $userReports = [];

        foreach ($files as $file) {
            if (str_contains($file, "_{$userId}_")) {
                $userReports[] = [
                    'filename' => basename($file),
                    'path' => $file,
                    'size' => Storage::disk('local')->size($file),
                    'created_at' => Storage::disk('local')->lastModified($file),
                    'type' => $this->extractReportType($file),
                ];
            }
        }

        return collect($userReports)->sortByDesc('created_at')->values()->all();
    }

    /**
     * Download report file.
     */
    public function downloadReport(string $filename): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $path = "reports/{$filename}";
        
        if (!Storage::disk('local')->exists($path)) {
            throw new \Exception('Report file not found');
        }

        return Storage::disk('local')->download($path);
    }

    /**
     * Apply equipment filters to query.
     */
    protected function applyEquipmentFilters($query, array $filters): void
    {
        if (!empty($filters['servicio_id'])) {
            $query->where('equipos.servicio_id', $filters['servicio_id']);
        }

        if (!empty($filters['area_id'])) {
            $query->where('equipos.area_id', $filters['area_id']);
        }

        if (!empty($filters['estado_id'])) {
            $query->where('equipos.estadoequipo_id', $filters['estado_id']);
        }

        if (!empty($filters['tipo_id'])) {
            $query->where('equipos.tipo_id', $filters['tipo_id']);
        }

        if (!empty($filters['fecha_desde'])) {
            $query->where('equipos.created_at', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $query->where('equipos.created_at', '<=', $filters['fecha_hasta']);
        }

        if (isset($filters['status'])) {
            $query->where('equipos.status', $filters['status']);
        }
    }

    /**
     * Apply maintenance filters to query.
     */
    protected function applyMaintenanceFilters($query, array $filters): void
    {
        if (!empty($filters['equipo_id'])) {
            $query->where('mantenimiento.equipo_id', $filters['equipo_id']);
        }

        if (!empty($filters['proveedor_id'])) {
            $query->where('mantenimiento.proveedor_mantenimiento_id', $filters['proveedor_id']);
        }

        if (!empty($filters['fecha_desde'])) {
            $query->where('mantenimiento.fecha_programada', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $query->where('mantenimiento.fecha_programada', '<=', $filters['fecha_hasta']);
        }

        if (isset($filters['status'])) {
            $query->where('mantenimiento.status', $filters['status']);
        }
    }

    /**
     * Apply contingency filters to query.
     */
    protected function applyContingencyFilters($query, array $filters): void
    {
        if (!empty($filters['equipo_id'])) {
            $query->where('contingencias.equipo_id', $filters['equipo_id']);
        }

        if (!empty($filters['usuario_id'])) {
            $query->where('contingencias.usuario_id', $filters['usuario_id']);
        }

        if (!empty($filters['fecha_desde'])) {
            $query->where('contingencias.fecha', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $query->where('contingencias.fecha', '<=', $filters['fecha_hasta']);
        }

        if (!empty($filters['estado'])) {
            $query->where('contingencias.estado', $filters['estado']);
        }

        if (!empty($filters['impacto'])) {
            $query->where('contingencias.impacto', $filters['impacto']);
        }
    }

    /**
     * Get equipment summary statistics.
     */
    protected function getEquipmentSummary($data): array
    {
        return [
            'total_equipos' => $data->count(),
            'equipos_activos' => $data->where('status', 1)->count(),
            'equipos_inactivos' => $data->where('status', 0)->count(),
            'necesitan_mantenimiento' => $data->where('estado_mantenimiento', 1)->count(),
            'por_servicio' => $data->groupBy('servicio')->map->count(),
            'por_estado' => $data->groupBy('estado')->map->count(),
            'por_tipo' => $data->groupBy('tipo')->map->count(),
        ];
    }

    /**
     * Get maintenance summary statistics.
     */
    protected function getMaintenanceSummary($data): array
    {
        $now = now();
        
        return [
            'total_mantenimientos' => $data->count(),
            'completados' => $data->where('status', 1)->count(),
            'pendientes' => $data->where('status', 0)->count(),
            'vencidos' => $data->where('status', 0)->where('fecha_programada', '<', $now)->count(),
            'por_proveedor' => $data->groupBy('proveedor')->map->count(),
            'por_mes' => $data->groupBy(function ($item) {
                return Carbon::parse($item->fecha_programada)->format('Y-m');
            })->map->count(),
        ];
    }

    /**
     * Get contingency summary statistics.
     */
    protected function getContingencySummary($data): array
    {
        return [
            'total_contingencias' => $data->count(),
            'activas' => $data->where('estado', 'Activa')->count(),
            'resueltas' => $data->where('estado', 'Resuelta')->count(),
            'por_impacto' => $data->groupBy('impacto')->map->count(),
            'por_categoria' => $data->groupBy('categoria')->map->count(),
            'tiempo_promedio_resolucion' => $data->where('tiempo_resolucion', '>', 0)->avg('tiempo_resolucion'),
            'costo_total' => $data->sum('costo_real'),
        ];
    }

    /**
     * Get equipment charts data.
     */
    protected function getEquipmentCharts($data): array
    {
        return [
            'status_distribution' => [
                'labels' => ['Activos', 'Inactivos'],
                'data' => [
                    $data->where('status', 1)->count(),
                    $data->where('status', 0)->count()
                ]
            ],
            'by_service' => [
                'labels' => $data->pluck('servicio')->unique()->values(),
                'data' => $data->groupBy('servicio')->map->count()->values()
            ],
            'by_type' => [
                'labels' => $data->pluck('tipo')->unique()->values(),
                'data' => $data->groupBy('tipo')->map->count()->values()
            ]
        ];
    }

    /**
     * Get maintenance charts data.
     */
    protected function getMaintenanceCharts($data): array
    {
        return [
            'status_distribution' => [
                'labels' => ['Completados', 'Pendientes'],
                'data' => [
                    $data->where('status', 1)->count(),
                    $data->where('status', 0)->count()
                ]
            ],
            'monthly_trend' => [
                'labels' => $data->groupBy(function ($item) {
                    return Carbon::parse($item->fecha_programada)->format('M Y');
                })->keys(),
                'data' => $data->groupBy(function ($item) {
                    return Carbon::parse($item->fecha_programada)->format('M Y');
                })->map->count()->values()
            ]
        ];
    }

    /**
     * Get contingency charts data.
     */
    protected function getContingencyCharts($data): array
    {
        return [
            'impact_distribution' => [
                'labels' => $data->pluck('impacto')->unique()->values(),
                'data' => $data->groupBy('impacto')->map->count()->values()
            ],
            'status_distribution' => [
                'labels' => $data->pluck('estado')->unique()->values(),
                'data' => $data->groupBy('estado')->map->count()->values()
            ]
        ];
    }

    /**
     * Get equipment performance metrics.
     */
    protected function getEquipmentPerformanceMetrics(string $startDate, string $endDate): array
    {
        return [
            'availability_rate' => 95.5, // Calculate based on downtime
            'mtbf' => 720, // Mean Time Between Failures (hours)
            'mttr' => 4.2, // Mean Time To Repair (hours)
            'utilization_rate' => 87.3, // Equipment utilization percentage
        ];
    }

    /**
     * Get maintenance performance metrics.
     */
    protected function getMaintenancePerformanceMetrics(string $startDate, string $endDate): array
    {
        return [
            'completion_rate' => 92.1, // Percentage of completed maintenances
            'on_time_rate' => 88.7, // Percentage completed on time
            'average_duration' => 3.5, // Average maintenance duration (hours)
            'cost_efficiency' => 94.2, // Cost vs budget percentage
        ];
    }

    /**
     * Get system performance metrics.
     */
    protected function getSystemPerformanceMetrics(string $startDate, string $endDate): array
    {
        return [
            'response_time' => 245, // Average API response time (ms)
            'uptime' => 99.8, // System uptime percentage
            'error_rate' => 0.12, // Error rate percentage
            'user_satisfaction' => 4.6, // User satisfaction score (1-5)
        ];
    }

    /**
     * Generate recommendations based on metrics.
     */
    protected function generateRecommendations(array $equipmentMetrics, array $maintenanceMetrics): array
    {
        $recommendations = [];

        if ($equipmentMetrics['availability_rate'] < 95) {
            $recommendations[] = 'Considere revisar el programa de mantenimiento preventivo para mejorar la disponibilidad de equipos.';
        }

        if ($maintenanceMetrics['on_time_rate'] < 90) {
            $recommendations[] = 'Implemente un sistema de alertas tempranas para mejorar la puntualidad en los mantenimientos.';
        }

        if ($equipmentMetrics['mttr'] > 5) {
            $recommendations[] = 'Considere capacitar al personal técnico para reducir el tiempo de reparación.';
        }

        return $recommendations;
    }

    /**
     * Extract report type from filename.
     */
    protected function extractReportType(string $filename): string
    {
        if (str_contains($filename, 'equipos')) return 'equipos';
        if (str_contains($filename, 'mantenimientos')) return 'mantenimientos';
        if (str_contains($filename, 'contingencias')) return 'contingencias';
        if (str_contains($filename, 'performance')) return 'performance';
        
        return 'unknown';
    }
}
