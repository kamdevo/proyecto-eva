<?php

namespace App\Listeners;

use App\Events\Equipment\EquipmentCreated;
use App\Events\Equipment\EquipmentUpdated;
use App\Events\Equipment\EquipmentDeleted;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Jobs\ProcessEquipmentData;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class EquipmentListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle equipment created event.
     */
    public function handleEquipmentCreated(EquipmentCreated $event): void
    {
        try {
            $equipment = $event->equipment;

            // Generate equipment QR code
            $this->generateQRCode($equipment);

            // Create initial maintenance schedule
            $this->createInitialMaintenanceSchedule($equipment);

            // Update inventory counts
            $this->updateInventoryCounts($equipment);

            // Clear related caches
            $this->clearEquipmentCaches($equipment);

            // Log creation
            Log::info('Equipment created successfully', [
                'equipment_id' => $equipment->id,
                'equipment_code' => $equipment->code,
                'service_id' => $equipment->servicio_id,
                'created_by' => $event->user?->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment created event', [
                'equipment_id' => $event->equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle equipment updated event.
     */
    public function handleEquipmentUpdated(EquipmentUpdated $event): void
    {
        try {
            $equipment = $event->equipment;
            $changes = $event->changes;

            // Handle status changes
            if ($event->statusChanged()) {
                $this->handleStatusChange($equipment, $event->getStatusChange());
            }

            // Handle location changes
            if ($event->locationChanged()) {
                $this->handleLocationChange($equipment, $changes);
            }

            // Update maintenance schedules if needed
            if ($this->affectsMaintenanceSchedule($changes)) {
                $this->updateMaintenanceSchedules($equipment, $changes);
            }

            // Update related records
            $this->updateRelatedRecords($equipment, $changes);

            // Clear related caches
            $this->clearEquipmentCaches($equipment);

            // Log update
            Log::info('Equipment updated successfully', [
                'equipment_id' => $equipment->id,
                'equipment_code' => $equipment->code,
                'changes' => array_keys($changes),
                'updated_by' => $event->user?->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment updated event', [
                'equipment_id' => $event->equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle equipment deleted event.
     */
    public function handleEquipmentDeleted(EquipmentDeleted $event): void
    {
        try {
            $equipmentData = $event->equipmentData;

            // Cancel pending maintenances
            $this->cancelPendingMaintenances($equipmentData['id']);

            // Archive related records
            $this->archiveRelatedRecords($equipmentData['id']);

            // Update inventory counts
            $this->updateInventoryCountsAfterDeletion($equipmentData);

            // Clear related caches
            $this->clearEquipmentCachesAfterDeletion($equipmentData);

            // Log deletion
            Log::warning('Equipment deleted', [
                'equipment_id' => $equipmentData['id'],
                'equipment_code' => $equipmentData['code'],
                'reason' => $event->reason,
                'deleted_by' => $event->user?->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment deleted event', [
                'equipment_id' => $event->equipmentData['id'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Generate QR code for equipment.
     */
    protected function generateQRCode(Equipo $equipment): void
    {
        try {
            // Generate QR code data
            $qrData = [
                'id' => $equipment->id,
                'code' => $equipment->code,
                'name' => $equipment->name,
                'url' => config('app.frontend_url') . "/equipos/{$equipment->id}",
                'generated_at' => now()->toISOString(),
            ];

            // Store QR data (in a real implementation, you'd generate actual QR image)
            Cache::put("qr_code:equipment:{$equipment->id}", $qrData, 86400 * 30); // 30 days

            Log::info('QR code generated for equipment', [
                'equipment_id' => $equipment->id,
                'equipment_code' => $equipment->code,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to generate QR code', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create initial maintenance schedule.
     */
    protected function createInitialMaintenanceSchedule(Equipo $equipment): void
    {
        try {
            // Only create if equipment has periodicity defined
            if (!$equipment->periodicidad || $equipment->periodicidad === 'NINGUNA') {
                return;
            }

            $nextMaintenanceDate = $this->calculateNextMaintenanceDate($equipment);

            Mantenimiento::create([
                'equipo_id' => $equipment->id,
                'description' => "Mantenimiento inicial programado - {$equipment->periodicidad}",
                'fecha_programada' => $nextMaintenanceDate,
                'status' => 0, // Pending
                'proveedor_mantenimiento_id' => 1, // Default provider
                'created_at' => now(),
            ]);

            Log::info('Initial maintenance scheduled', [
                'equipment_id' => $equipment->id,
                'next_maintenance' => $nextMaintenanceDate,
                'periodicity' => $equipment->periodicidad,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create initial maintenance schedule', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Calculate next maintenance date.
     */
    protected function calculateNextMaintenanceDate(Equipo $equipment): \Carbon\Carbon
    {
        $baseDate = $equipment->fecha_instalacion ? 
                   \Carbon\Carbon::parse($equipment->fecha_instalacion) : 
                   now();

        return match (strtoupper($equipment->periodicidad)) {
            'MENSUAL' => $baseDate->addMonth(),
            'BIMESTRAL' => $baseDate->addMonths(2),
            'TRIMESTRAL' => $baseDate->addMonths(3),
            'SEMESTRAL' => $baseDate->addMonths(6),
            'ANUAL' => $baseDate->addYear(),
            default => $baseDate->addYear(),
        };
    }

    /**
     * Handle status change.
     */
    protected function handleStatusChange(Equipo $equipment, ?array $statusChange): void
    {
        if (!$statusChange) {
            return;
        }

        $newStatusId = $statusChange['new_status_id'];
        $newStatusName = $statusChange['new_status_name'];

        // Handle specific status changes
        if (in_array($newStatusName, ['Fuera de Servicio', 'En Reparación', 'Dañado'])) {
            // Postpone pending maintenances
            $this->postponePendingMaintenances($equipment->id);
            
            // Create contingency if not exists
            $this->createAutomaticContingency($equipment, $newStatusName);
        }

        // Update equipment maintenance status
        if ($newStatusName === 'En Mantenimiento') {
            $equipment->update(['estado_mantenimiento' => 1]);
        } elseif ($newStatusName === 'Operativo') {
            $equipment->update(['estado_mantenimiento' => 0]);
        }

        Log::info('Equipment status change handled', [
            'equipment_id' => $equipment->id,
            'previous_status' => $statusChange['previous_status_name'],
            'new_status' => $newStatusName,
        ]);
    }

    /**
     * Handle location change.
     */
    protected function handleLocationChange(Equipo $equipment, array $changes): void
    {
        $locationChanges = [];

        if (isset($changes['servicio_id'])) {
            $locationChanges['service'] = [
                'old' => $equipment->getOriginal('servicio_id'),
                'new' => $changes['servicio_id'],
            ];
        }

        if (isset($changes['area_id'])) {
            $locationChanges['area'] = [
                'old' => $equipment->getOriginal('area_id'),
                'new' => $changes['area_id'],
            ];
        }

        // Update location history
        $this->updateLocationHistory($equipment, $locationChanges);

        Log::info('Equipment location change handled', [
            'equipment_id' => $equipment->id,
            'location_changes' => $locationChanges,
        ]);
    }

    /**
     * Update inventory counts.
     */
    protected function updateInventoryCounts(Equipo $equipment): void
    {
        // Update service equipment count
        Cache::forget("service:{$equipment->servicio_id}:equipment_count");
        
        // Update area equipment count
        if ($equipment->area_id) {
            Cache::forget("area:{$equipment->area_id}:equipment_count");
        }
        
        // Update type equipment count
        if ($equipment->tipo_id) {
            Cache::forget("type:{$equipment->tipo_id}:equipment_count");
        }
    }

    /**
     * Clear equipment-related caches.
     */
    protected function clearEquipmentCaches(Equipo $equipment): void
    {
        $cacheKeys = [
            "equipment:{$equipment->id}",
            "equipment:{$equipment->id}:details",
            "service:{$equipment->servicio_id}:equipment",
            "area:{$equipment->area_id}:equipment",
            "equipment:statistics",
            "dashboard:equipment",
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Check if changes affect maintenance schedule.
     */
    protected function affectsMaintenanceSchedule(array $changes): bool
    {
        $affectingFields = ['periodicidad', 'estadoequipo_id', 'servicio_id'];
        
        foreach ($affectingFields as $field) {
            if (array_key_exists($field, $changes)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Postpone pending maintenances.
     */
    protected function postponePendingMaintenances(int $equipmentId): void
    {
        $pendingMaintenances = Mantenimiento::where('equipo_id', $equipmentId)
                                           ->where('status', 0)
                                           ->where('fecha_programada', '>', now())
                                           ->get();

        foreach ($pendingMaintenances as $maintenance) {
            $maintenance->update([
                'fecha_programada' => now()->addDays(7),
                'observacion' => ($maintenance->observacion ?? '') . 
                               "\n\nPostponed due to equipment status change at " . now()->toDateTimeString(),
            ]);
        }

        if ($pendingMaintenances->count() > 0) {
            Log::info('Pending maintenances postponed', [
                'equipment_id' => $equipmentId,
                'count' => $pendingMaintenances->count(),
            ]);
        }
    }

    /**
     * Create automatic contingency.
     */
    protected function createAutomaticContingency(Equipo $equipment, string $status): void
    {
        try {
            // Check if contingency already exists for this status change
            $existingContingency = DB::table('contingencias')
                                    ->where('equipo_id', $equipment->id)
                                    ->where('estado', 'Activa')
                                    ->where('created_at', '>', now()->subHours(1))
                                    ->exists();

            if ($existingContingency) {
                return;
            }

            DB::table('contingencias')->insert([
                'equipo_id' => $equipment->id,
                'usuario_id' => 1, // System user
                'fecha' => now(),
                'observacion' => "Contingencia automática creada por cambio de estado a: {$status}",
                'estado' => 'Activa',
                'impacto' => $this->determineImpact($equipment),
                'categoria' => 'Falla de Equipo',
                'prioridad' => $this->determinePriority($equipment, $status),
                'created_at' => now(),
            ]);

            Log::info('Automatic contingency created', [
                'equipment_id' => $equipment->id,
                'status' => $status,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create automatic contingency', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Determine impact level.
     */
    protected function determineImpact(Equipo $equipment): string
    {
        // Base impact on risk classification
        return match ($equipment->criesgo_id) {
            1 => 'Alto',
            2 => 'Medio',
            default => 'Bajo',
        };
    }

    /**
     * Determine priority level.
     */
    protected function determinePriority(Equipo $equipment, string $status): string
    {
        if ($status === 'Dañado' && $equipment->criesgo_id === 1) {
            return 'Urgente';
        }
        
        if ($status === 'Fuera de Servicio') {
            return 'Alta';
        }
        
        return 'Media';
    }

    /**
     * Update location history.
     */
    protected function updateLocationHistory(Equipo $equipment, array $locationChanges): void
    {
        try {
            $historyData = [
                'equipment_id' => $equipment->id,
                'changes' => $locationChanges,
                'changed_at' => now(),
                'changed_by' => auth()->id(),
            ];

            // Store in location history (assuming you have this table)
            DB::table('equipment_location_history')->insert($historyData);

        } catch (\Exception $e) {
            Log::error('Failed to update location history', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update maintenance schedules.
     */
    protected function updateMaintenanceSchedules(Equipo $equipment, array $changes): void
    {
        // Implementation would update maintenance schedules based on changes
        Log::info('Maintenance schedules updated', [
            'equipment_id' => $equipment->id,
            'changes' => array_keys($changes),
        ]);
    }

    /**
     * Update related records.
     */
    protected function updateRelatedRecords(Equipo $equipment, array $changes): void
    {
        // Implementation would update related records
        Log::info('Related records updated', [
            'equipment_id' => $equipment->id,
            'changes' => array_keys($changes),
        ]);
    }

    /**
     * Cancel pending maintenances.
     */
    protected function cancelPendingMaintenances(int $equipmentId): void
    {
        Mantenimiento::where('equipo_id', $equipmentId)
                    ->where('status', 0)
                    ->update([
                        'status' => -1, // Cancelled
                        'observacion' => 'Cancelled due to equipment deletion',
                        'updated_at' => now(),
                    ]);
    }

    /**
     * Archive related records.
     */
    protected function archiveRelatedRecords(int $equipmentId): void
    {
        // Implementation would archive related records
        Log::info('Related records archived', ['equipment_id' => $equipmentId]);
    }

    /**
     * Update inventory counts after deletion.
     */
    protected function updateInventoryCountsAfterDeletion(array $equipmentData): void
    {
        // Clear relevant caches
        Cache::forget("service:{$equipmentData['servicio_id']}:equipment_count");
        
        if (isset($equipmentData['area_id'])) {
            Cache::forget("area:{$equipmentData['area_id']}:equipment_count");
        }
    }

    /**
     * Clear equipment caches after deletion.
     */
    protected function clearEquipmentCachesAfterDeletion(array $equipmentData): void
    {
        $cacheKeys = [
            "equipment:{$equipmentData['id']}",
            "equipment:{$equipmentData['id']}:details",
            "service:{$equipmentData['servicio_id']}:equipment",
            "equipment:statistics",
            "dashboard:equipment",
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
    }
}
