<?php

namespace App\Observers;

use App\Models\Equipo;
use App\Events\Equipment\EquipmentCreated;
use App\Events\Equipment\EquipmentUpdated;
use App\Events\Equipment\EquipmentDeleted;
use App\Events\EquipmentStatusChanged;
use Illuminate\Support\Facades\Log;

class EquipmentObserver
{
    /**
     * Handle the Equipment "creating" event.
     */
    public function creating(Equipo $equipment): void
    {
        // Generate unique code if not provided
        if (empty($equipment->code)) {
            $equipment->code = $this->generateUniqueCode();
        }

        // Set default values
        if (is_null($equipment->status)) {
            $equipment->status = 1; // Active by default
        }

        if (is_null($equipment->estado_mantenimiento)) {
            $equipment->estado_mantenimiento = 0; // No maintenance needed by default
        }

        Log::info('Equipment creating', [
            'code' => $equipment->code,
            'name' => $equipment->name,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Handle the Equipment "created" event.
     */
    public function created(Equipo $equipment): void
    {
        try {
            // Fire equipment created event
            event(new EquipmentCreated($equipment, auth()->user(), [
                'action' => 'created',
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]));

            Log::info('Equipment created successfully', [
                'equipment_id' => $equipment->id,
                'code' => $equipment->code,
                'name' => $equipment->name,
                'service_id' => $equipment->servicio_id,
                'user_id' => auth()->id(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment created event', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle the Equipment "updating" event.
     */
    public function updating(Equipo $equipment): void
    {
        // Store original data for comparison
        $equipment->_originalData = $equipment->getOriginal();

        Log::info('Equipment updating', [
            'equipment_id' => $equipment->id,
            'code' => $equipment->code,
            'changes' => $equipment->getDirty(),
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Handle the Equipment "updated" event.
     */
    public function updated(Equipo $equipment): void
    {
        try {
            $originalData = $equipment->_originalData ?? [];
            $changes = $equipment->getChanges();

            // Remove timestamps from changes for cleaner logging
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            // Check for status changes
            if (isset($changes['estadoequipo_id'])) {
                $this->handleStatusChange($equipment, $originalData, $changes);
            }

            // Fire equipment updated event
            event(new EquipmentUpdated($equipment, $originalData, $changes, auth()->user(), [
                'action' => 'updated',
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]));

            Log::info('Equipment updated successfully', [
                'equipment_id' => $equipment->id,
                'code' => $equipment->code,
                'changes' => array_keys($changes),
                'user_id' => auth()->id(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment updated event', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle the Equipment "deleting" event.
     */
    public function deleting(Equipo $equipment): void
    {
        // Store equipment data before deletion
        $equipment->_dataBeforeDeletion = $equipment->toArray();

        Log::warning('Equipment deleting', [
            'equipment_id' => $equipment->id,
            'code' => $equipment->code,
            'name' => $equipment->name,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Handle the Equipment "deleted" event.
     */
    public function deleted(Equipo $equipment): void
    {
        try {
            $equipmentData = $equipment->_dataBeforeDeletion ?? $equipment->toArray();

            // Fire equipment deleted event
            event(new EquipmentDeleted($equipmentData, null, auth()->user(), [
                'action' => 'deleted',
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]));

            Log::warning('Equipment deleted successfully', [
                'equipment_id' => $equipmentData['id'],
                'code' => $equipmentData['code'],
                'name' => $equipmentData['name'],
                'user_id' => auth()->id(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment deleted event', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle the Equipment "restored" event.
     */
    public function restored(Equipo $equipment): void
    {
        Log::info('Equipment restored', [
            'equipment_id' => $equipment->id,
            'code' => $equipment->code,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Handle the Equipment "force deleted" event.
     */
    public function forceDeleted(Equipo $equipment): void
    {
        Log::warning('Equipment force deleted', [
            'equipment_id' => $equipment->id,
            'code' => $equipment->code,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Handle status changes.
     */
    protected function handleStatusChange(Equipo $equipment, array $originalData, array $changes): void
    {
        $previousStatusId = $originalData['estadoequipo_id'] ?? null;
        $newStatusId = $changes['estadoequipo_id'];

        if ($previousStatusId === $newStatusId) {
            return;
        }

        // Get status names
        $previousStatus = $this->getStatusName($previousStatusId);
        $newStatus = $this->getStatusName($newStatusId);

        // Fire status changed event
        event(new EquipmentStatusChanged(
            $equipment,
            $previousStatus,
            $newStatus,
            auth()->user()
        ));

        Log::info('Equipment status changed', [
            'equipment_id' => $equipment->id,
            'code' => $equipment->code,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Get status name by ID.
     */
    protected function getStatusName(?int $statusId): string
    {
        if (!$statusId) {
            return 'Unknown';
        }

        try {
            $status = \App\Models\EstadoEquipo::find($statusId);
            return $status?->name ?? 'Unknown';
        } catch (\Exception $e) {
            Log::error('Failed to get status name', [
                'status_id' => $statusId,
                'error' => $e->getMessage(),
            ]);
            return 'Unknown';
        }
    }

    /**
     * Generate unique equipment code.
     */
    protected function generateUniqueCode(): string
    {
        $prefix = 'EQ';
        $year = date('Y');
        
        do {
            $number = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $code = "{$prefix}{$year}{$number}";
        } while (Equipo::where('code', $code)->exists());

        return $code;
    }
}
