<?php

namespace App\Listeners;

use App\Events\Calibration\CalibrationScheduled;
use App\Notifications\CalibrationNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class CalibrationListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle calibration scheduled event.
     */
    public function handleCalibrationScheduled(CalibrationScheduled $event): void
    {
        try {
            // Log the calibration action
            $this->logCalibrationAction($event);

            // Update calibration metrics
            $this->updateCalibrationMetrics($event);

            // Send notifications
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Schedule reminders
            $this->scheduleCalibrationReminders($event);

            // Update equipment calibration status
            $this->updateEquipmentCalibrationStatus($event);

            // Create calendar entries
            $this->createCalendarEntries($event);

            // Check for calibration conflicts
            $this->checkCalibrationConflicts($event);

            // Update compliance tracking
            $this->updateComplianceTracking($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle calibration scheduled event', [
                'calibration_id' => $event->calibration?->id,
                'equipment_id' => $event->calibration?->equipo_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log calibration action.
     */
    protected function logCalibrationAction(CalibrationScheduled $event): void
    {
        $logData = [
            'calibration_id' => $event->calibration?->id,
            'equipment_id' => $event->calibration?->equipo_id,
            'equipment_code' => $event->getEquipmentInfo()['code'] ?? null,
            'scheduled_date' => $event->calibration?->fecha_programada,
            'calibration_type' => $event->calibration?->tipo_calibracion,
            'provider_id' => $event->calibration?->proveedor_id,
            'is_critical' => $event->isCriticalCalibration(),
            'user_id' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        Log::channel('audit')->info('Calibration scheduled', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(CalibrationScheduled $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'App\Models\Calibracion',
                'auditable_id' => $event->calibration?->id ?? 0,
                'event_type' => 'calibration.scheduled',
                'user_id' => $event->user?->id,
                'old_values' => null,
                'new_values' => json_encode($event->calibration?->toArray()),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store calibration action in audit trail', [
                'calibration_id' => $event->calibration?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update calibration metrics.
     */
    protected function updateCalibrationMetrics(CalibrationScheduled $event): void
    {
        $today = now()->format('Y-m-d');
        $scheduledDate = $event->calibration?->fecha_programada;

        // Update daily calibration scheduling count
        Cache::increment("calibrations:scheduled:daily:{$today}");
        
        // Update monthly calibration count
        if ($scheduledDate) {
            $month = \Carbon\Carbon::parse($scheduledDate)->format('Y-m');
            Cache::increment("calibrations:scheduled:monthly:{$month}");
        }

        // Update equipment-specific metrics
        if ($event->calibration?->equipo_id) {
            Cache::increment("equipment:{$event->calibration->equipo_id}:calibrations:count");
        }

        // Update provider-specific metrics
        if ($event->calibration?->proveedor_id) {
            Cache::increment("provider:{$event->calibration->proveedor_id}:calibrations:count");
        }

        // Store metrics in database
        $this->storeMetricsInDatabase($event, $today);
    }

    /**
     * Store metrics in database.
     */
    protected function storeMetricsInDatabase(CalibrationScheduled $event, string $date): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'calibrations',
                    'metric_category' => 'daily',
                    'metric_key' => 'scheduled',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'equipment_id' => $event->calibration?->equipo_id,
                        'provider_id' => $event->calibration?->proveedor_id,
                        'is_critical' => $event->isCriticalCalibration(),
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store critical calibration metrics
            if ($event->isCriticalCalibration()) {
                DB::table('event_metrics')->updateOrInsert(
                    [
                        'metric_type' => 'calibrations',
                        'metric_category' => 'daily',
                        'metric_key' => 'critical_scheduled',
                        'metric_date' => $date,
                        'metric_hour' => null,
                    ],
                    [
                        'metric_value' => DB::raw('metric_value + 1'),
                        'metadata' => json_encode([
                            'equipment_id' => $event->calibration?->equipo_id,
                            'user_id' => $event->user?->id,
                        ]),
                        'updated_at' => now(),
                    ]
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to store calibration metrics', [
                'calibration_id' => $event->calibration?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(CalibrationScheduled $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new CalibrationNotification($event));
            
            Log::info('Calibration notifications sent', [
                'calibration_id' => $event->calibration?->id,
                'recipients_count' => $usersToNotify->count(),
                'is_critical' => $event->isCriticalCalibration(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send calibration notifications', [
                'calibration_id' => $event->calibration?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Schedule calibration reminders.
     */
    protected function scheduleCalibrationReminders(CalibrationScheduled $event): void
    {
        if (!$event->calibration?->fecha_programada) {
            return;
        }

        $scheduledDate = \Carbon\Carbon::parse($event->calibration->fecha_programada);
        
        // Schedule reminders at different intervals
        $reminderIntervals = [
            30 => 'monthly',
            7 => 'weekly',
            1 => 'daily',
        ];

        foreach ($reminderIntervals as $days => $type) {
            $reminderDate = $scheduledDate->copy()->subDays($days);
            
            if ($reminderDate->isFuture()) {
                try {
                    DB::table('scheduled_reminders')->insert([
                        'type' => 'calibration_reminder',
                        'related_id' => $event->calibration->id,
                        'related_type' => 'App\Models\Calibracion',
                        'reminder_date' => $reminderDate,
                        'reminder_type' => $type,
                        'data' => json_encode([
                            'calibration_id' => $event->calibration->id,
                            'equipment_id' => $event->calibration->equipo_id,
                            'days_until' => $days,
                        ]),
                        'created_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to schedule calibration reminder', [
                        'calibration_id' => $event->calibration->id,
                        'reminder_type' => $type,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    /**
     * Update equipment calibration status.
     */
    protected function updateEquipmentCalibrationStatus(CalibrationScheduled $event): void
    {
        if (!$event->calibration?->equipo_id) {
            return;
        }

        try {
            // Update equipment's next calibration date
            DB::table('equipos')
              ->where('id', $event->calibration->equipo_id)
              ->update([
                  'proxima_calibracion' => $event->calibration->fecha_programada,
                  'estado_calibracion' => 'programada',
                  'updated_at' => now(),
              ]);

            // Clear equipment calibration cache
            Cache::forget("equipment:{$event->calibration->equipo_id}:calibration_status");

        } catch (\Exception $e) {
            Log::error('Failed to update equipment calibration status', [
                'equipment_id' => $event->calibration->equipo_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create calendar entries.
     */
    protected function createCalendarEntries(CalibrationScheduled $event): void
    {
        if (!$event->calibration?->fecha_programada) {
            return;
        }

        try {
            DB::table('calendar_events')->insert([
                'title' => 'Calibración: ' . ($event->getEquipmentInfo()['name'] ?? 'Equipo'),
                'description' => $event->getCalibrationDescription(),
                'event_type' => 'calibration',
                'related_id' => $event->calibration->id,
                'related_type' => 'App\Models\Calibracion',
                'start_date' => $event->calibration->fecha_programada,
                'end_date' => $event->calibration->fecha_programada,
                'all_day' => true,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'calibration_id' => $event->calibration->id,
                    'equipment_id' => $event->calibration->equipo_id,
                    'provider_id' => $event->calibration->proveedor_id,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create calendar entry for calibration', [
                'calibration_id' => $event->calibration->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check for calibration conflicts.
     */
    protected function checkCalibrationConflicts(CalibrationScheduled $event): void
    {
        if (!$event->calibration?->fecha_programada || !$event->calibration?->equipo_id) {
            return;
        }

        try {
            // Check for other calibrations on the same date for the same equipment
            $conflicts = DB::table('calibraciones')
                          ->where('equipo_id', $event->calibration->equipo_id)
                          ->where('fecha_programada', $event->calibration->fecha_programada)
                          ->where('id', '!=', $event->calibration->id)
                          ->where('estado', '!=', 'cancelada')
                          ->count();

            if ($conflicts > 0) {
                $this->createConflictAlert($event, $conflicts);
            }

            // Check for maintenance conflicts
            $maintenanceConflicts = DB::table('mantenimientos')
                                     ->where('equipo_id', $event->calibration->equipo_id)
                                     ->where('fecha_programada', $event->calibration->fecha_programada)
                                     ->where('status', 0) // Pending maintenance
                                     ->count();

            if ($maintenanceConflicts > 0) {
                $this->createMaintenanceConflictAlert($event, $maintenanceConflicts);
            }

        } catch (\Exception $e) {
            Log::error('Failed to check calibration conflicts', [
                'calibration_id' => $event->calibration->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update compliance tracking.
     */
    protected function updateComplianceTracking(CalibrationScheduled $event): void
    {
        if (!$event->calibration?->equipo_id) {
            return;
        }

        try {
            // Update compliance status
            DB::table('compliance_tracking')->updateOrInsert(
                [
                    'entity_type' => 'equipment',
                    'entity_id' => $event->calibration->equipo_id,
                    'compliance_type' => 'calibration',
                ],
                [
                    'status' => 'scheduled',
                    'next_due_date' => $event->calibration->fecha_programada,
                    'last_updated' => now(),
                    'updated_by' => $event->user?->id,
                    'metadata' => json_encode([
                        'calibration_id' => $event->calibration->id,
                        'provider_id' => $event->calibration->proveedor_id,
                    ]),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to update compliance tracking', [
                'calibration_id' => $event->calibration->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create conflict alert.
     */
    protected function createConflictAlert(CalibrationScheduled $event, int $conflictCount): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'calibration_conflict',
                'title' => 'Conflicto de Calibración',
                'message' => "Se detectaron {$conflictCount} conflictos de calibración para el equipo",
                'severity' => 'medium',
                'status' => 'active',
                'equipment_id' => $event->calibration->equipo_id,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'calibration_id' => $event->calibration->id,
                    'equipment_id' => $event->calibration->equipo_id,
                    'conflict_count' => $conflictCount,
                    'scheduled_date' => $event->calibration->fecha_programada,
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create calibration conflict alert', [
                'calibration_id' => $event->calibration->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create maintenance conflict alert.
     */
    protected function createMaintenanceConflictAlert(CalibrationScheduled $event, int $conflictCount): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'calibration_maintenance_conflict',
                'title' => 'Conflicto Calibración-Mantenimiento',
                'message' => "Calibración programada en fecha con mantenimiento pendiente",
                'severity' => 'high',
                'status' => 'active',
                'equipment_id' => $event->calibration->equipo_id,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'calibration_id' => $event->calibration->id,
                    'equipment_id' => $event->calibration->equipo_id,
                    'maintenance_conflicts' => $conflictCount,
                    'scheduled_date' => $event->calibration->fecha_programada,
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create maintenance conflict alert', [
                'calibration_id' => $event->calibration->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(CalibrationScheduled $event, \Throwable $exception): void
    {
        Log::error('Calibration listener failed', [
            'calibration_id' => $event->calibration?->id,
            'equipment_id' => $event->calibration?->equipo_id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
