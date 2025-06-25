<?php

namespace App\Listeners;

use App\Events\Maintenance\MaintenanceScheduled;
use App\Events\Maintenance\MaintenanceCompleted;
use App\Notifications\MaintenanceNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class MaintenanceListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle maintenance scheduled event.
     */
    public function handleMaintenanceScheduled(MaintenanceScheduled $event): void
    {
        try {
            // Log the maintenance scheduling
            $this->logMaintenanceAction($event, 'scheduled');

            // Update maintenance metrics
            $this->updateMaintenanceMetrics($event);

            // Send notifications
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Schedule maintenance reminders
            $this->scheduleMaintenanceReminders($event);

            // Update equipment maintenance status
            $this->updateEquipmentMaintenanceStatus($event);

            // Check for maintenance conflicts
            $this->checkMaintenanceConflicts($event);

            // Create calendar entries
            $this->createCalendarEntries($event);

            // Update compliance tracking
            $this->updateComplianceTracking($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle maintenance scheduled event', [
                'maintenance_id' => $event->maintenance?->id,
                'equipment_id' => $event->maintenance?->equipo_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle maintenance completed event.
     */
    public function handleMaintenanceCompleted(MaintenanceCompleted $event): void
    {
        try {
            // Log the maintenance completion
            $this->logMaintenanceAction($event, 'completed');

            // Update completion metrics
            $this->updateCompletionMetrics($event);

            // Send completion notifications
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Update equipment status
            $this->updateEquipmentAfterMaintenance($event);

            // Schedule next maintenance
            $this->scheduleNextMaintenance($event);

            // Update maintenance history
            $this->updateMaintenanceHistory($event);

            // Calculate maintenance effectiveness
            $this->calculateMaintenanceEffectiveness($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle maintenance completed event', [
                'maintenance_id' => $event->maintenance?->id,
                'equipment_id' => $event->maintenance?->equipo_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log maintenance action.
     */
    protected function logMaintenanceAction($event, string $action): void
    {
        $logData = [
            'action' => $action,
            'maintenance_id' => $event->maintenance?->id,
            'equipment_id' => $event->maintenance?->equipo_id,
            'equipment_code' => $event->getEquipmentInfo()['code'] ?? null,
            'maintenance_type' => $event->maintenance?->tipo_mantenimiento,
            'scheduled_date' => $event->maintenance?->fecha_programada,
            'user_id' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        if ($action === 'completed') {
            $logData['completion_date'] = $event->completionData['completion_date'] ?? null;
            $logData['observations'] = $event->completionData['observations'] ?? null;
            $logData['duration_hours'] = $event->getMaintenanceDuration();
        }

        Log::channel('audit')->info("Maintenance {$action}", $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData, $action);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail($event, array $logData, string $action): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'App\Models\Mantenimiento',
                'auditable_id' => $event->maintenance?->id ?? 0,
                'event_type' => "maintenance.{$action}",
                'user_id' => $event->user?->id,
                'old_values' => null,
                'new_values' => json_encode($event->maintenance?->toArray()),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store maintenance action in audit trail', [
                'action' => $action,
                'maintenance_id' => $event->maintenance?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update maintenance metrics.
     */
    protected function updateMaintenanceMetrics($event): void
    {
        $today = now()->format('Y-m-d');
        $scheduledDate = $event->maintenance?->fecha_programada;

        // Update daily maintenance scheduling count
        Cache::increment("maintenances:scheduled:daily:{$today}");
        
        // Update monthly maintenance count
        if ($scheduledDate) {
            $month = \Carbon\Carbon::parse($scheduledDate)->format('Y-m');
            Cache::increment("maintenances:scheduled:monthly:{$month}");
        }

        // Update maintenance type metrics
        $maintenanceType = $event->maintenance?->tipo_mantenimiento;
        if ($maintenanceType) {
            Cache::increment("maintenances:type:{$maintenanceType}:count");
        }

        // Update equipment-specific metrics
        if ($event->maintenance?->equipo_id) {
            Cache::increment("equipment:{$event->maintenance->equipo_id}:maintenances:count");
        }

        // Store metrics in database
        $this->storeMaintenanceMetricsInDatabase($event, $today);
    }

    /**
     * Update completion metrics.
     */
    protected function updateCompletionMetrics(MaintenanceCompleted $event): void
    {
        $today = now()->format('Y-m-d');

        // Update daily completion count
        Cache::increment("maintenances:completed:daily:{$today}");
        
        // Update completion time metrics
        $duration = $event->getMaintenanceDuration();
        if ($duration) {
            Cache::put("maintenance:{$event->maintenance->id}:duration", $duration, 86400);
        }

        // Store completion metrics
        $this->storeCompletionMetricsInDatabase($event, $today);
    }

    /**
     * Store maintenance metrics in database.
     */
    protected function storeMaintenanceMetricsInDatabase($event, string $date): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'maintenances',
                    'metric_category' => 'daily',
                    'metric_key' => 'scheduled',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'equipment_id' => $event->maintenance?->equipo_id,
                        'maintenance_type' => $event->maintenance?->tipo_mantenimiento,
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to store maintenance metrics', [
                'maintenance_id' => $event->maintenance?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Store completion metrics in database.
     */
    protected function storeCompletionMetricsInDatabase(MaintenanceCompleted $event, string $date): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'maintenances',
                    'metric_category' => 'daily',
                    'metric_key' => 'completed',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'equipment_id' => $event->maintenance?->equipo_id,
                        'duration_hours' => $event->getMaintenanceDuration(),
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store duration metrics
            $duration = $event->getMaintenanceDuration();
            if ($duration) {
                DB::table('event_metrics')->updateOrInsert(
                    [
                        'metric_type' => 'maintenance_duration',
                        'metric_category' => 'daily',
                        'metric_key' => 'average',
                        'metric_date' => $date,
                        'metric_hour' => null,
                    ],
                    [
                        'metric_value' => $duration,
                        'metadata' => json_encode([
                            'maintenance_id' => $event->maintenance->id,
                            'equipment_id' => $event->maintenance->equipo_id,
                        ]),
                        'updated_at' => now(),
                    ]
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to store completion metrics', [
                'maintenance_id' => $event->maintenance?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications($event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new MaintenanceNotification($event));
            
            Log::info('Maintenance notifications sent', [
                'maintenance_id' => $event->maintenance?->id,
                'recipients_count' => $usersToNotify->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send maintenance notifications', [
                'maintenance_id' => $event->maintenance?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Schedule maintenance reminders.
     */
    protected function scheduleMaintenanceReminders($event): void
    {
        if (!$event->maintenance?->fecha_programada) {
            return;
        }

        $scheduledDate = \Carbon\Carbon::parse($event->maintenance->fecha_programada);
        
        // Schedule reminders at different intervals
        $reminderIntervals = [
            7 => 'weekly',
            3 => 'three_days',
            1 => 'daily',
        ];

        foreach ($reminderIntervals as $days => $type) {
            $reminderDate = $scheduledDate->copy()->subDays($days);
            
            if ($reminderDate->isFuture()) {
                try {
                    DB::table('scheduled_reminders')->insert([
                        'type' => 'maintenance_reminder',
                        'related_id' => $event->maintenance->id,
                        'related_type' => 'App\Models\Mantenimiento',
                        'reminder_date' => $reminderDate,
                        'reminder_type' => $type,
                        'data' => json_encode([
                            'maintenance_id' => $event->maintenance->id,
                            'equipment_id' => $event->maintenance->equipo_id,
                            'days_until' => $days,
                        ]),
                        'created_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to schedule maintenance reminder', [
                        'maintenance_id' => $event->maintenance->id,
                        'reminder_type' => $type,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    /**
     * Update equipment maintenance status.
     */
    protected function updateEquipmentMaintenanceStatus($event): void
    {
        if (!$event->maintenance?->equipo_id) {
            return;
        }

        try {
            // Update equipment's next maintenance date
            DB::table('equipos')
              ->where('id', $event->maintenance->equipo_id)
              ->update([
                  'proximo_mantenimiento' => $event->maintenance->fecha_programada,
                  'estado_mantenimiento' => 'programado',
                  'updated_at' => now(),
              ]);

            // Clear equipment maintenance cache
            Cache::forget("equipment:{$event->maintenance->equipo_id}:maintenance_status");

        } catch (\Exception $e) {
            Log::error('Failed to update equipment maintenance status', [
                'equipment_id' => $event->maintenance->equipo_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check maintenance conflicts.
     */
    protected function checkMaintenanceConflicts($event): void
    {
        if (!$event->maintenance?->fecha_programada || !$event->maintenance?->equipo_id) {
            return;
        }

        try {
            // Check for other maintenances on the same date
            $conflicts = DB::table('mantenimientos')
                          ->where('equipo_id', $event->maintenance->equipo_id)
                          ->where('fecha_programada', $event->maintenance->fecha_programada)
                          ->where('id', '!=', $event->maintenance->id)
                          ->where('status', 0) // Pending maintenance
                          ->count();

            if ($conflicts > 0) {
                $this->createMaintenanceConflictAlert($event, $conflicts);
            }

        } catch (\Exception $e) {
            Log::error('Failed to check maintenance conflicts', [
                'maintenance_id' => $event->maintenance->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create calendar entries.
     */
    protected function createCalendarEntries($event): void
    {
        if (!$event->maintenance?->fecha_programada) {
            return;
        }

        try {
            DB::table('calendar_events')->insert([
                'title' => 'Mantenimiento: ' . ($event->getEquipmentInfo()['name'] ?? 'Equipo'),
                'description' => $event->getMaintenanceDescription(),
                'event_type' => 'maintenance',
                'related_id' => $event->maintenance->id,
                'related_type' => 'App\Models\Mantenimiento',
                'start_date' => $event->maintenance->fecha_programada,
                'end_date' => $event->maintenance->fecha_programada,
                'all_day' => true,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'maintenance_id' => $event->maintenance->id,
                    'equipment_id' => $event->maintenance->equipo_id,
                    'maintenance_type' => $event->maintenance->tipo_mantenimiento,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create calendar entry for maintenance', [
                'maintenance_id' => $event->maintenance->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update compliance tracking.
     */
    protected function updateComplianceTracking($event): void
    {
        if (!$event->maintenance?->equipo_id) {
            return;
        }

        try {
            // Update compliance status
            DB::table('compliance_tracking')->updateOrInsert(
                [
                    'entity_type' => 'equipment',
                    'entity_id' => $event->maintenance->equipo_id,
                    'compliance_type' => 'maintenance',
                ],
                [
                    'status' => 'scheduled',
                    'next_due_date' => $event->maintenance->fecha_programada,
                    'last_updated' => now(),
                    'updated_by' => $event->user?->id,
                    'metadata' => json_encode([
                        'maintenance_id' => $event->maintenance->id,
                        'maintenance_type' => $event->maintenance->tipo_mantenimiento,
                    ]),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to update compliance tracking', [
                'maintenance_id' => $event->maintenance->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update equipment after maintenance.
     */
    protected function updateEquipmentAfterMaintenance(MaintenanceCompleted $event): void
    {
        if (!$event->maintenance?->equipo_id) {
            return;
        }

        try {
            // Update equipment status after maintenance
            DB::table('equipos')
              ->where('id', $event->maintenance->equipo_id)
              ->update([
                  'ultimo_mantenimiento' => $event->completionData['completion_date'] ?? now(),
                  'estado_mantenimiento' => 'completado',
                  'updated_at' => now(),
              ]);

        } catch (\Exception $e) {
            Log::error('Failed to update equipment after maintenance', [
                'equipment_id' => $event->maintenance->equipo_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Schedule next maintenance.
     */
    protected function scheduleNextMaintenance(MaintenanceCompleted $event): void
    {
        if (!$event->maintenance?->equipo_id) {
            return;
        }

        try {
            // Get equipment's maintenance frequency
            $equipment = DB::table('equipos')
                          ->join('frecuenciam', 'equipos.frecuenciam_id', '=', 'frecuenciam.id')
                          ->where('equipos.id', $event->maintenance->equipo_id)
                          ->select('frecuenciam.dias')
                          ->first();

            if ($equipment && $equipment->dias) {
                $nextMaintenanceDate = now()->addDays($equipment->dias);
                
                // Create next maintenance record
                DB::table('mantenimientos')->insert([
                    'equipo_id' => $event->maintenance->equipo_id,
                    'tipo_mantenimiento' => $event->maintenance->tipo_mantenimiento,
                    'fecha_programada' => $nextMaintenanceDate,
                    'status' => 0, // Pending
                    'observacion' => 'Mantenimiento programado automáticamente',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                Log::info('Next maintenance scheduled automatically', [
                    'equipment_id' => $event->maintenance->equipo_id,
                    'next_date' => $nextMaintenanceDate,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to schedule next maintenance', [
                'equipment_id' => $event->maintenance->equipo_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update maintenance history.
     */
    protected function updateMaintenanceHistory(MaintenanceCompleted $event): void
    {
        try {
            DB::table('maintenance_history')->insert([
                'maintenance_id' => $event->maintenance->id,
                'equipment_id' => $event->maintenance->equipo_id,
                'completion_date' => $event->completionData['completion_date'] ?? now(),
                'duration_hours' => $event->getMaintenanceDuration(),
                'observations' => $event->completionData['observations'] ?? null,
                'completed_by' => $event->user?->id,
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update maintenance history', [
                'maintenance_id' => $event->maintenance->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Calculate maintenance effectiveness.
     */
    protected function calculateMaintenanceEffectiveness(MaintenanceCompleted $event): void
    {
        // Implementation for calculating maintenance effectiveness metrics
        Log::info('Maintenance effectiveness calculation scheduled', [
            'maintenance_id' => $event->maintenance->id,
            'equipment_id' => $event->maintenance->equipo_id,
        ]);
    }

    /**
     * Create maintenance conflict alert.
     */
    protected function createMaintenanceConflictAlert($event, int $conflictCount): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'maintenance_conflict',
                'title' => 'Conflicto de Mantenimiento',
                'message' => "Se detectaron {$conflictCount} conflictos de mantenimiento para el equipo",
                'severity' => 'medium',
                'status' => 'active',
                'equipment_id' => $event->maintenance->equipo_id,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'maintenance_id' => $event->maintenance->id,
                    'equipment_id' => $event->maintenance->equipo_id,
                    'conflict_count' => $conflictCount,
                    'scheduled_date' => $event->maintenance->fecha_programada,
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create maintenance conflict alert', [
                'maintenance_id' => $event->maintenance->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed($event, \Throwable $exception): void
    {
        Log::error('Maintenance listener failed', [
            'maintenance_id' => $event->maintenance?->id,
            'equipment_id' => $event->maintenance?->equipo_id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
