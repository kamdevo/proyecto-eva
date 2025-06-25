<?php

namespace App\Listeners;

use App\Events\EquipmentStatusChanged;
use App\Models\User;
use App\Notifications\EquipmentStatusNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class EquipmentEventListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(EquipmentStatusChanged $event): void
    {
        try {
            // Log the status change
            Log::channel('audit')->info('Equipment status changed', [
                'equipment_id' => $event->equipment->id,
                'equipment_code' => $event->equipment->code,
                'previous_status' => $event->previousStatus,
                'new_status' => $event->newStatus,
                'changed_by' => $event->user?->id,
                'service_id' => $event->equipment->servicio_id,
                'timestamp' => now()->toISOString(),
            ]);

            // Determine if this status change requires notifications
            if ($this->shouldNotify($event->previousStatus, $event->newStatus)) {
                $this->sendNotifications($event);
            }

            // Update related maintenance schedules if needed
            if ($this->affectsMaintenanceSchedule($event->newStatus)) {
                $this->updateMaintenanceSchedule($event);
            }

            // Create system alert if critical
            if ($this->isCriticalStatusChange($event->newStatus)) {
                $this->createSystemAlert($event);
            }

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment status change event', [
                'equipment_id' => $event->equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Determine if notifications should be sent.
     */
    protected function shouldNotify(string $previousStatus, string $newStatus): bool
    {
        $criticalStatuses = ['Fuera de Servicio', 'En Reparación', 'Dañado'];
        
        return in_array($newStatus, $criticalStatuses) || 
               (in_array($previousStatus, $criticalStatuses) && $newStatus === 'Operativo');
    }

    /**
     * Send notifications to relevant users.
     */
    protected function sendNotifications(EquipmentStatusChanged $event): void
    {
        // Get users who should be notified
        $usersToNotify = $this->getUsersToNotify($event);

        if ($usersToNotify->isNotEmpty()) {
            Notification::send($usersToNotify, new EquipmentStatusNotification($event));
        }
    }

    /**
     * Get users who should be notified.
     */
    protected function getUsersToNotify(EquipmentStatusChanged $event): \Illuminate\Database\Eloquent\Collection
    {
        // Get users from the same service
        $serviceUsers = User::where('servicio_id', $event->equipment->servicio_id)
                           ->where('estado', true)
                           ->get();

        // Get administrators
        $admins = User::whereHas('rol', function ($query) {
                      $query->where('nombre', 'Administrador');
                  })
                  ->where('estado', true)
                  ->get();

        // Get supervisors
        $supervisors = User::whereHas('rol', function ($query) {
                           $query->where('nombre', 'Supervisor');
                       })
                       ->where('estado', true)
                       ->get();

        return $serviceUsers->merge($admins)->merge($supervisors)->unique('id');
    }

    /**
     * Check if status change affects maintenance schedule.
     */
    protected function affectsMaintenanceSchedule(string $newStatus): bool
    {
        return in_array($newStatus, ['Fuera de Servicio', 'En Reparación', 'Dañado']);
    }

    /**
     * Update maintenance schedule based on status change.
     */
    protected function updateMaintenanceSchedule(EquipmentStatusChanged $event): void
    {
        // If equipment is out of service, postpone scheduled maintenance
        if (in_array($event->newStatus, ['Fuera de Servicio', 'En Reparación', 'Dañado'])) {
            $pendingMaintenances = $event->equipment->mantenimientos()
                                                  ->where('status', 0)
                                                  ->where('fecha_programada', '>', now())
                                                  ->get();

            foreach ($pendingMaintenances as $maintenance) {
                $maintenance->update([
                    'observacion' => ($maintenance->observacion ?? '') . 
                                   "\n\nMantenimiento postponed due to equipment status change to: {$event->newStatus}",
                    'fecha_programada' => now()->addDays(7), // Postpone by 7 days
                ]);
            }

            Log::info('Maintenance schedules updated due to equipment status change', [
                'equipment_id' => $event->equipment->id,
                'new_status' => $event->newStatus,
                'postponed_maintenances' => $pendingMaintenances->count(),
            ]);
        }
    }

    /**
     * Check if this is a critical status change.
     */
    protected function isCriticalStatusChange(string $newStatus): bool
    {
        return in_array($newStatus, ['Fuera de Servicio', 'Dañado']);
    }

    /**
     * Create system alert for critical status changes.
     */
    protected function createSystemAlert(EquipmentStatusChanged $event): void
    {
        // Create alert record (you would have an alerts table)
        $alertData = [
            'type' => 'equipment_critical_status',
            'title' => 'Equipo en Estado Crítico',
            'message' => "El equipo {$event->equipment->code} - {$event->equipment->name} ha cambiado a estado: {$event->newStatus}",
            'severity' => 'high',
            'equipment_id' => $event->equipment->id,
            'service_id' => $event->equipment->servicio_id,
            'created_by' => $event->user?->id,
            'data' => json_encode([
                'equipment_code' => $event->equipment->code,
                'equipment_name' => $event->equipment->name,
                'previous_status' => $event->previousStatus,
                'new_status' => $event->newStatus,
                'service_name' => $event->equipment->servicio?->name,
                'area_name' => $event->equipment->area?->name,
            ]),
            'created_at' => now(),
        ];

        // Insert alert (assuming you have an alerts table)
        \DB::table('system_alerts')->insert($alertData);

        Log::warning('Critical equipment status alert created', [
            'equipment_id' => $event->equipment->id,
            'equipment_code' => $event->equipment->code,
            'new_status' => $event->newStatus,
            'alert_data' => $alertData,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(EquipmentStatusChanged $event, \Throwable $exception): void
    {
        Log::error('Equipment event listener failed', [
            'equipment_id' => $event->equipment->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
