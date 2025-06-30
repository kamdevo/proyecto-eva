<?php

namespace App\Services;

use App\Models\Mantenimiento;
use App\Models\Equipo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MantenimientoService extends BaseService
{
    /**
     * Get model instance.
     */
    protected function getModel(): Model
    {
        return new Mantenimiento();
    }

    /**
     * Get maintenance calendar data.
     */
    public function getCalendarData(string $startDate, string $endDate): array
    {
        $cacheKey = $this->getCacheKey('calendar', compact('startDate', 'endDate'));

        return Cache::remember($cacheKey, 1800, function () use ($startDate, $endDate) {
            return $this->model->whereBetween('fecha_programada', [$startDate, $endDate])
                              ->with(['equipo:id,code,name', 'proveedor:id,name', 'tecnico:id,name'])
                              ->get()
                              ->map(function ($mantenimiento) {
                                  return [
                                      'id' => $mantenimiento->id,
                                      'title' => $mantenimiento->equipo->name ?? 'Equipo sin nombre',
                                      'start' => $mantenimiento->fecha_programada,
                                      'end' => $mantenimiento->fecha_programada,
                                      'description' => $mantenimiento->description,
                                      'status' => $mantenimiento->status,
                                      'equipo_code' => $mantenimiento->equipo->code ?? '',
                                      'proveedor' => $mantenimiento->proveedor->name ?? '',
                                      'tecnico' => $mantenimiento->tecnico->name ?? '',
                                      'color' => $this->getStatusColor($mantenimiento->status),
                                  ];
                              });
        });
    }

    /**
     * Get pending maintenances.
     */
    public function getPending(int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey('pending', compact('limit'));

        return Cache::remember($cacheKey, 900, function () use ($limit) { // 15 minutes cache
            $query = $this->model->where('status', 0)
                                ->with(['equipo:id,code,name', 'proveedor:id,name', 'tecnico:id,name'])
                                ->orderBy('fecha_programada');

            if ($limit) {
                $query->limit($limit);
            }

            return $query->get();
        });
    }

    /**
     * Get overdue maintenances.
     */
    public function getOverdue(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey('overdue');

        return Cache::remember($cacheKey, 900, function () {
            return $this->model->where('status', 0)
                              ->where('fecha_programada', '<', now())
                              ->with(['equipo:id,code,name', 'proveedor:id,name', 'tecnico:id,name'])
                              ->orderBy('fecha_programada')
                              ->get();
        });
    }

    /**
     * Get maintenance statistics.
     */
    public function getStatistics(): array
    {
        $cacheKey = $this->getCacheKey('statistics');

        return Cache::remember($cacheKey, 1800, function () {
            $now = now();
            $startOfMonth = $now->copy()->startOfMonth();
            $endOfMonth = $now->copy()->endOfMonth();

            return [
                'total' => $this->model->count(),
                'completed' => $this->model->where('status', 1)->count(),
                'pending' => $this->model->where('status', 0)->count(),
                'overdue' => $this->model->where('status', 0)
                                        ->where('fecha_programada', '<', $now)
                                        ->count(),
                'this_month' => $this->model->whereBetween('fecha_programada', [$startOfMonth, $endOfMonth])
                                           ->count(),
                'completed_this_month' => $this->model->where('status', 1)
                                                     ->whereBetween('fecha_mantenimiento', [$startOfMonth, $endOfMonth])
                                                     ->count(),
                'by_provider' => $this->model->selectRaw('proveedor_mantenimiento_id, COUNT(*) as count')
                                            ->groupBy('proveedor_mantenimiento_id')
                                            ->with('proveedor:id,name')
                                            ->get(),
                'by_month' => $this->model->selectRaw('YEAR(fecha_programada) as year, MONTH(fecha_programada) as month, COUNT(*) as count')
                                         ->groupBy('year', 'month')
                                         ->orderBy('year', 'desc')
                                         ->orderBy('month', 'desc')
                                         ->limit(12)
                                         ->get(),
            ];
        });
    }

    /**
     * Schedule maintenance for equipment.
     */
    public function scheduleForEquipment(int $equipoId, array $data): Mantenimiento
    {
        $equipo = Equipo::findOrFail($equipoId);

        $maintenanceData = array_merge($data, [
            'equipo_id' => $equipoId,
            'status' => 0, // Pending
        ]);

        // Calculate next maintenance date based on equipment periodicity
        if (!isset($data['fecha_programada']) && $equipo->periodicidad) {
            $maintenanceData['fecha_programada'] = $this->calculateNextMaintenanceDate($equipo);
        }

        $mantenimiento = $this->create($maintenanceData);

        // Update equipment maintenance status
        $equipo->update(['estado_mantenimiento' => 1]);

        return $mantenimiento;
    }

    /**
     * Complete maintenance.
     */
    public function complete(int $id, array $data): Mantenimiento
    {
        $mantenimiento = $this->findById($id);
        
        if (!$mantenimiento) {
            throw new \Exception('Maintenance not found');
        }

        if ($mantenimiento->status == 1) {
            throw new \Exception('Maintenance already completed');
        }

        $updateData = array_merge($data, [
            'status' => 1,
            'fecha_mantenimiento' => $data['fecha_mantenimiento'] ?? now(),
        ]);

        $mantenimiento = $this->update($id, $updateData);

        // Update equipment maintenance status
        $equipo = $mantenimiento->equipo;
        if ($equipo) {
            $equipo->update([
                'estado_mantenimiento' => 0,
                'fecha_mantenimiento' => $mantenimiento->fecha_mantenimiento,
            ]);

            // Schedule next maintenance if equipment has periodicity
            if ($equipo->periodicidad && $equipo->periodicidad !== 'NINGUNA') {
                $this->scheduleNextMaintenance($equipo);
            }
        }

        return $mantenimiento;
    }

    /**
     * Reschedule maintenance.
     */
    public function reschedule(int $id, string $newDate, string $reason = null): Mantenimiento
    {
        $mantenimiento = $this->findById($id);
        
        if (!$mantenimiento) {
            throw new \Exception('Maintenance not found');
        }

        if ($mantenimiento->status == 1) {
            throw new \Exception('Cannot reschedule completed maintenance');
        }

        $oldDate = $mantenimiento->fecha_programada;

        $updateData = [
            'fecha_programada' => $newDate,
        ];

        if ($reason) {
            $updateData['observacion'] = ($mantenimiento->observacion ?? '') . 
                                        "\n\nReprogramado de {$oldDate} a {$newDate}. Motivo: {$reason}";
        }

        $mantenimiento = $this->update($id, $updateData);

        // Log the reschedule
        \Log::info('Maintenance rescheduled', [
            'maintenance_id' => $id,
            'old_date' => $oldDate,
            'new_date' => $newDate,
            'reason' => $reason,
            'user_id' => auth()->id(),
        ]);

        return $mantenimiento;
    }

    /**
     * Get maintenance history for equipment.
     */
    public function getHistoryForEquipment(int $equipoId, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey("history_equipment_{$equipoId}", compact('limit'));

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($equipoId, $limit) {
            return $this->model->where('equipo_id', $equipoId)
                              ->with(['proveedor:id,name', 'tecnico:id,name'])
                              ->orderBy('fecha_mantenimiento', 'desc')
                              ->limit($limit)
                              ->get();
        });
    }

    /**
     * Get upcoming maintenances.
     */
    public function getUpcoming(int $days = 30): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey('upcoming', compact('days'));

        return Cache::remember($cacheKey, 900, function () use ($days) {
            $endDate = now()->addDays($days);

            return $this->model->where('status', 0)
                              ->whereBetween('fecha_programada', [now(), $endDate])
                              ->with(['equipo:id,code,name', 'proveedor:id,name', 'tecnico:id,name'])
                              ->orderBy('fecha_programada')
                              ->get();
        });
    }

    /**
     * Calculate next maintenance date based on equipment periodicity.
     */
    protected function calculateNextMaintenanceDate(Equipo $equipo): Carbon
    {
        $lastMaintenance = $equipo->mantenimientos()
                                 ->where('status', 1)
                                 ->orderBy('fecha_mantenimiento', 'desc')
                                 ->first();

        $baseDate = $lastMaintenance ? 
                   Carbon::parse($lastMaintenance->fecha_mantenimiento) : 
                   now();

        return match (strtoupper($equipo->periodicidad)) {
            'MENSUAL' => $baseDate->addMonth(),
            'BIMESTRAL' => $baseDate->addMonths(2),
            'TRIMESTRAL' => $baseDate->addMonths(3),
            'SEMESTRAL' => $baseDate->addMonths(6),
            'ANUAL' => $baseDate->addYear(),
            default => $baseDate->addYear(), // Default to annual
        };
    }

    /**
     * Schedule next maintenance for equipment.
     */
    protected function scheduleNextMaintenance(Equipo $equipo): void
    {
        $nextDate = $this->calculateNextMaintenanceDate($equipo);

        $this->create([
            'equipo_id' => $equipo->id,
            'description' => "Mantenimiento {$equipo->periodicidad} programado automáticamente",
            'fecha_programada' => $nextDate,
            'status' => 0,
            'proveedor_mantenimiento_id' => $equipo->proveedor_mantenimiento_id ?? 1,
        ]);

        \Log::info('Next maintenance scheduled automatically', [
            'equipo_id' => $equipo->id,
            'next_date' => $nextDate,
            'periodicity' => $equipo->periodicidad,
        ]);
    }

    /**
     * Get status color for calendar display.
     */
    protected function getStatusColor(int $status): string
    {
        return match ($status) {
            0 => '#ffc107', // Pending - Yellow
            1 => '#28a745', // Completed - Green
            default => '#6c757d', // Unknown - Gray
        };
    }

    /**
     * Generate maintenance report.
     */
    public function generateReport(array $filters = []): array
    {
        $query = $this->model->with(['equipo:id,code,name', 'proveedor:id,name', 'tecnico:id,name']);

        // Apply filters
        if (!empty($filters['fecha_desde'])) {
            $query->where('fecha_programada', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $query->where('fecha_programada', '<=', $filters['fecha_hasta']);
        }

        if (!empty($filters['equipo_id'])) {
            $query->where('equipo_id', $filters['equipo_id']);
        }

        if (!empty($filters['proveedor_id'])) {
            $query->where('proveedor_mantenimiento_id', $filters['proveedor_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $maintenances = $query->orderBy('fecha_programada', 'desc')->get();

        return [
            'data' => $maintenances,
            'summary' => [
                'total' => $maintenances->count(),
                'completed' => $maintenances->where('status', 1)->count(),
                'pending' => $maintenances->where('status', 0)->count(),
                'overdue' => $maintenances->where('status', 0)
                                         ->where('fecha_programada', '<', now())
                                         ->count(),
            ],
            'filters' => $filters,
            'generated_at' => now(),
        ];
    }
}
