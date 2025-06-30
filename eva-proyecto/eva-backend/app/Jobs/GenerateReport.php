<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class GenerateReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 600;

    /**
     * Report type.
     */
    protected string $reportType;

    /**
     * Report parameters.
     */
    protected array $parameters;

    /**
     * User who requested the report.
     */
    protected int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $reportType, array $parameters, int $userId)
    {
        $this->reportType = $reportType;
        $this->parameters = $parameters;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Generating report', [
            'type' => $this->reportType,
            'user_id' => $this->userId,
            'parameters' => $this->parameters,
        ]);

        try {
            $reportData = $this->generateReportData();
            $filename = $this->saveReport($reportData);

            Log::info('Report generated successfully', [
                'type' => $this->reportType,
                'user_id' => $this->userId,
                'filename' => $filename,
            ]);

            // Notify user that report is ready
            $this->notifyUser($filename);

        } catch (\Exception $e) {
            Log::error('Report generation failed', [
                'type' => $this->reportType,
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate report data based on type.
     */
    protected function generateReportData(): array
    {
        return match ($this->reportType) {
            'equipos' => $this->generateEquipmentReport(),
            'mantenimientos' => $this->generateMaintenanceReport(),
            'contingencias' => $this->generateContingencyReport(),
            'inventario' => $this->generateInventoryReport(),
            'performance' => $this->generatePerformanceReport(),
            default => throw new \InvalidArgumentException("Unknown report type: {$this->reportType}")
        };
    }

    /**
     * Generate equipment report.
     */
    protected function generateEquipmentReport(): array
    {
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
                'servicios.name as servicio',
                'areas.name as area',
                'tipos.name as tipo',
                'estadoequipos.name as estado',
                'propietarios.nombre as propietario',
                'equipos.fecha_instalacion',
                'equipos.vida_util',
                'equipos.costo',
                'equipos.created_at'
            ]);

        // Apply filters
        if (isset($this->parameters['servicio_id'])) {
            $query->where('equipos.servicio_id', $this->parameters['servicio_id']);
        }

        if (isset($this->parameters['area_id'])) {
            $query->where('equipos.area_id', $this->parameters['area_id']);
        }

        if (isset($this->parameters['estado_id'])) {
            $query->where('equipos.estadoequipo_id', $this->parameters['estado_id']);
        }

        if (isset($this->parameters['fecha_desde'])) {
            $query->where('equipos.created_at', '>=', $this->parameters['fecha_desde']);
        }

        if (isset($this->parameters['fecha_hasta'])) {
            $query->where('equipos.created_at', '<=', $this->parameters['fecha_hasta']);
        }

        return [
            'title' => 'Reporte de Equipos',
            'generated_at' => now()->toISOString(),
            'parameters' => $this->parameters,
            'data' => $query->get()->toArray(),
            'summary' => [
                'total_equipos' => $query->count(),
                'equipos_activos' => $query->where('equipos.status', 1)->count(),
                'equipos_inactivos' => $query->where('equipos.status', 0)->count(),
            ]
        ];
    }

    /**
     * Generate maintenance report.
     */
    protected function generateMaintenanceReport(): array
    {
        $query = DB::table('mantenimiento')
            ->leftJoin('equipos', 'mantenimiento.equipo_id', '=', 'equipos.id')
            ->leftJoin('proveedores_mantenimiento', 'mantenimiento.proveedor_mantenimiento_id', '=', 'proveedores_mantenimiento.id')
            ->leftJoin('tecnicos', 'mantenimiento.tecnico_id', '=', 'tecnicos.id')
            ->select([
                'mantenimiento.id',
                'mantenimiento.description',
                'mantenimiento.fecha_mantenimiento',
                'mantenimiento.fecha_programada',
                'mantenimiento.status',
                'equipos.code as equipo_code',
                'equipos.name as equipo_name',
                'proveedores_mantenimiento.name as proveedor',
                'tecnicos.name as tecnico',
                'mantenimiento.created_at'
            ]);

        // Apply filters
        if (isset($this->parameters['equipo_id'])) {
            $query->where('mantenimiento.equipo_id', $this->parameters['equipo_id']);
        }

        if (isset($this->parameters['fecha_desde'])) {
            $query->where('mantenimiento.fecha_mantenimiento', '>=', $this->parameters['fecha_desde']);
        }

        if (isset($this->parameters['fecha_hasta'])) {
            $query->where('mantenimiento.fecha_mantenimiento', '<=', $this->parameters['fecha_hasta']);
        }

        return [
            'title' => 'Reporte de Mantenimientos',
            'generated_at' => now()->toISOString(),
            'parameters' => $this->parameters,
            'data' => $query->get()->toArray(),
            'summary' => [
                'total_mantenimientos' => $query->count(),
                'mantenimientos_completados' => $query->where('mantenimiento.status', 1)->count(),
                'mantenimientos_pendientes' => $query->where('mantenimiento.status', 0)->count(),
            ]
        ];
    }

    /**
     * Generate contingency report.
     */
    protected function generateContingencyReport(): array
    {
        $query = DB::table('contingencias')
            ->leftJoin('equipos', 'contingencias.equipo_id', '=', 'equipos.id')
            ->leftJoin('usuarios', 'contingencias.usuario_id', '=', 'usuarios.id')
            ->select([
                'contingencias.id',
                'contingencias.fecha',
                'contingencias.observacion',
                'contingencias.estado',
                'equipos.code as equipo_code',
                'equipos.name as equipo_name',
                'usuarios.nombre as usuario_nombre',
                'usuarios.apellido as usuario_apellido',
                'contingencias.created_at'
            ]);

        // Apply filters
        if (isset($this->parameters['equipo_id'])) {
            $query->where('contingencias.equipo_id', $this->parameters['equipo_id']);
        }

        if (isset($this->parameters['fecha_desde'])) {
            $query->where('contingencias.fecha', '>=', $this->parameters['fecha_desde']);
        }

        if (isset($this->parameters['fecha_hasta'])) {
            $query->where('contingencias.fecha', '<=', $this->parameters['fecha_hasta']);
        }

        return [
            'title' => 'Reporte de Contingencias',
            'generated_at' => now()->toISOString(),
            'parameters' => $this->parameters,
            'data' => $query->get()->toArray(),
            'summary' => [
                'total_contingencias' => $query->count(),
                'contingencias_activas' => $query->where('contingencias.estado', 'Activa')->count(),
                'contingencias_resueltas' => $query->where('contingencias.estado', 'Resuelta')->count(),
            ]
        ];
    }

    /**
     * Generate inventory report.
     */
    protected function generateInventoryReport(): array
    {
        // This would be more complex, involving equipment counts by location, status, etc.
        return [
            'title' => 'Reporte de Inventario',
            'generated_at' => now()->toISOString(),
            'parameters' => $this->parameters,
            'data' => [],
            'summary' => []
        ];
    }

    /**
     * Generate performance report.
     */
    protected function generatePerformanceReport(): array
    {
        // This would analyze system performance metrics
        return [
            'title' => 'Reporte de Rendimiento',
            'generated_at' => now()->toISOString(),
            'parameters' => $this->parameters,
            'data' => [],
            'summary' => []
        ];
    }

    /**
     * Save report to storage.
     */
    protected function saveReport(array $reportData): string
    {
        $filename = sprintf(
            'reports/%s_%s_%s.json',
            $this->reportType,
            $this->userId,
            now()->format('Y-m-d_H-i-s')
        );

        Storage::disk('local')->put($filename, json_encode($reportData, JSON_PRETTY_PRINT));

        return $filename;
    }

    /**
     * Notify user that report is ready.
     */
    protected function notifyUser(string $filename): void
    {
        $user = User::find($this->userId);
        
        if ($user) {
            // Here you could send an email or create a notification
            Log::info('Report ready for user', [
                'user_id' => $this->userId,
                'user_email' => $user->email,
                'filename' => $filename,
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Report generation job failed', [
            'type' => $this->reportType,
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
