<?php

namespace App\Listeners;

use App\Events\Training\TrainingScheduled;
use App\Notifications\TrainingNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class TrainingListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle training scheduled event.
     */
    public function handleTrainingScheduled(TrainingScheduled $event): void
    {
        try {
            // Log the training action
            $this->logTrainingAction($event);

            // Update training metrics
            $this->updateTrainingMetrics($event);

            // Send notifications
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Schedule training reminders
            $this->scheduleTrainingReminders($event);

            // Update user training status
            $this->updateUserTrainingStatus($event);

            // Create calendar entries
            $this->createCalendarEntries($event);

            // Check training prerequisites
            $this->checkTrainingPrerequisites($event);

            // Update compliance tracking
            $this->updateComplianceTracking($event);

            // Handle mandatory training tracking
            if ($event->isMandatoryTraining()) {
                $this->handleMandatoryTraining($event);
            }

        } catch (\Exception $e) {
            Log::error('Failed to handle training scheduled event', [
                'training_id' => $event->training?->id,
                'user_id' => $event->training?->usuario_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log training action.
     */
    protected function logTrainingAction(TrainingScheduled $event): void
    {
        $logData = [
            'training_id' => $event->training?->id,
            'user_id' => $event->training?->usuario_id,
            'training_type' => $event->training?->tipo_capacitacion,
            'scheduled_date' => $event->training?->fecha_programada,
            'is_mandatory' => $event->isMandatoryTraining(),
            'is_certification' => $event->isCertificationTraining(),
            'equipment_related' => $event->isEquipmentRelated(),
            'scheduled_by' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        Log::channel('audit')->info('Training scheduled', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(TrainingScheduled $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'App\Models\Capacitacion',
                'auditable_id' => $event->training?->id ?? 0,
                'event_type' => 'training.scheduled',
                'user_id' => $event->user?->id,
                'old_values' => null,
                'new_values' => json_encode($event->training?->toArray()),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store training action in audit trail', [
                'training_id' => $event->training?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update training metrics.
     */
    protected function updateTrainingMetrics(TrainingScheduled $event): void
    {
        $today = now()->format('Y-m-d');
        $scheduledDate = $event->training?->fecha_programada;

        // Update daily training scheduling count
        Cache::increment("trainings:scheduled:daily:{$today}");
        
        // Update monthly training count
        if ($scheduledDate) {
            $month = \Carbon\Carbon::parse($scheduledDate)->format('Y-m');
            Cache::increment("trainings:scheduled:monthly:{$month}");
        }

        // Update training type metrics
        $trainingType = $event->training?->tipo_capacitacion;
        if ($trainingType) {
            Cache::increment("trainings:type:{$trainingType}:count");
        }

        // Update user-specific metrics
        if ($event->training?->usuario_id) {
            Cache::increment("user:{$event->training->usuario_id}:trainings:count");
        }

        // Update mandatory training metrics
        if ($event->isMandatoryTraining()) {
            Cache::increment("trainings:mandatory:scheduled:daily:{$today}");
        }

        // Store metrics in database
        $this->storeMetricsInDatabase($event, $today);
    }

    /**
     * Store metrics in database.
     */
    protected function storeMetricsInDatabase(TrainingScheduled $event, string $date): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'trainings',
                    'metric_category' => 'daily',
                    'metric_key' => 'scheduled',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'user_id' => $event->training?->usuario_id,
                        'training_type' => $event->training?->tipo_capacitacion,
                        'is_mandatory' => $event->isMandatoryTraining(),
                        'scheduled_by' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store mandatory training metrics
            if ($event->isMandatoryTraining()) {
                DB::table('event_metrics')->updateOrInsert(
                    [
                        'metric_type' => 'trainings',
                        'metric_category' => 'daily',
                        'metric_key' => 'mandatory_scheduled',
                        'metric_date' => $date,
                        'metric_hour' => null,
                    ],
                    [
                        'metric_value' => DB::raw('metric_value + 1'),
                        'metadata' => json_encode([
                            'user_id' => $event->training?->usuario_id,
                            'scheduled_by' => $event->user?->id,
                        ]),
                        'updated_at' => now(),
                    ]
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to store training metrics', [
                'training_id' => $event->training?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(TrainingScheduled $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new TrainingNotification($event));
            
            Log::info('Training notifications sent', [
                'training_id' => $event->training?->id,
                'recipients_count' => $usersToNotify->count(),
                'is_mandatory' => $event->isMandatoryTraining(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send training notifications', [
                'training_id' => $event->training?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Schedule training reminders.
     */
    protected function scheduleTrainingReminders(TrainingScheduled $event): void
    {
        if (!$event->training?->fecha_programada) {
            return;
        }

        $scheduledDate = \Carbon\Carbon::parse($event->training->fecha_programada);
        
        // Schedule reminders at different intervals
        $reminderIntervals = [
            14 => 'two_weeks',
            7 => 'weekly',
            3 => 'three_days',
            1 => 'daily',
        ];

        foreach ($reminderIntervals as $days => $type) {
            $reminderDate = $scheduledDate->copy()->subDays($days);
            
            if ($reminderDate->isFuture()) {
                try {
                    DB::table('scheduled_reminders')->insert([
                        'type' => 'training_reminder',
                        'related_id' => $event->training->id,
                        'related_type' => 'App\Models\Capacitacion',
                        'reminder_date' => $reminderDate,
                        'reminder_type' => $type,
                        'data' => json_encode([
                            'training_id' => $event->training->id,
                            'user_id' => $event->training->usuario_id,
                            'days_until' => $days,
                            'is_mandatory' => $event->isMandatoryTraining(),
                        ]),
                        'created_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to schedule training reminder', [
                        'training_id' => $event->training->id,
                        'reminder_type' => $type,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    /**
     * Update user training status.
     */
    protected function updateUserTrainingStatus(TrainingScheduled $event): void
    {
        if (!$event->training?->usuario_id) {
            return;
        }

        try {
            // Update user's training record
            DB::table('user_training_status')->updateOrInsert(
                [
                    'user_id' => $event->training->usuario_id,
                    'training_type' => $event->training->tipo_capacitacion,
                ],
                [
                    'status' => 'scheduled',
                    'scheduled_date' => $event->training->fecha_programada,
                    'training_id' => $event->training->id,
                    'is_mandatory' => $event->isMandatoryTraining(),
                    'updated_at' => now(),
                ]
            );

            // Clear user training cache
            Cache::forget("user:{$event->training->usuario_id}:training_status");

        } catch (\Exception $e) {
            Log::error('Failed to update user training status', [
                'user_id' => $event->training->usuario_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create calendar entries.
     */
    protected function createCalendarEntries(TrainingScheduled $event): void
    {
        if (!$event->training?->fecha_programada) {
            return;
        }

        try {
            DB::table('calendar_events')->insert([
                'title' => 'Capacitación: ' . ($event->training->tipo_capacitacion ?? 'Entrenamiento'),
                'description' => $event->getTrainingDescription(),
                'event_type' => 'training',
                'related_id' => $event->training->id,
                'related_type' => 'App\Models\Capacitacion',
                'start_date' => $event->training->fecha_programada,
                'end_date' => $event->training->fecha_programada,
                'all_day' => false,
                'created_by' => $event->user?->id,
                'attendee_id' => $event->training->usuario_id,
                'data' => json_encode([
                    'training_id' => $event->training->id,
                    'user_id' => $event->training->usuario_id,
                    'is_mandatory' => $event->isMandatoryTraining(),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create calendar entry for training', [
                'training_id' => $event->training->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check training prerequisites.
     */
    protected function checkTrainingPrerequisites(TrainingScheduled $event): void
    {
        if (!$event->training?->usuario_id) {
            return;
        }

        try {
            // Check if user has completed prerequisite trainings
            $prerequisites = $this->getTrainingPrerequisites($event->training->tipo_capacitacion);
            
            if (empty($prerequisites)) {
                return;
            }

            $missingPrerequisites = [];
            
            foreach ($prerequisites as $prerequisite) {
                $completed = DB::table('capacitaciones')
                              ->where('usuario_id', $event->training->usuario_id)
                              ->where('tipo_capacitacion', $prerequisite)
                              ->where('estado', 'completada')
                              ->exists();
                
                if (!$completed) {
                    $missingPrerequisites[] = $prerequisite;
                }
            }

            if (!empty($missingPrerequisites)) {
                $this->createPrerequisiteAlert($event, $missingPrerequisites);
            }

        } catch (\Exception $e) {
            Log::error('Failed to check training prerequisites', [
                'training_id' => $event->training->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update compliance tracking.
     */
    protected function updateComplianceTracking(TrainingScheduled $event): void
    {
        if (!$event->training?->usuario_id || !$event->isMandatoryTraining()) {
            return;
        }

        try {
            // Update compliance status for mandatory training
            DB::table('compliance_tracking')->updateOrInsert(
                [
                    'entity_type' => 'user',
                    'entity_id' => $event->training->usuario_id,
                    'compliance_type' => 'mandatory_training',
                ],
                [
                    'status' => 'scheduled',
                    'next_due_date' => $event->training->fecha_programada,
                    'last_updated' => now(),
                    'updated_by' => $event->user?->id,
                    'metadata' => json_encode([
                        'training_id' => $event->training->id,
                        'training_type' => $event->training->tipo_capacitacion,
                    ]),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to update compliance tracking', [
                'training_id' => $event->training->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle mandatory training.
     */
    protected function handleMandatoryTraining(TrainingScheduled $event): void
    {
        // Create high-priority alert for mandatory training
        $this->createMandatoryTrainingAlert($event);

        // Update user's mandatory training status
        $this->updateMandatoryTrainingStatus($event);
    }

    /**
     * Get training prerequisites.
     */
    protected function getTrainingPrerequisites(string $trainingType): array
    {
        // Define training prerequisites
        $prerequisites = [
            'Manejo de Equipos Críticos' => ['Seguridad Básica', 'Protocolos de Emergencia'],
            'Calibración Avanzada' => ['Calibración Básica', 'Metrología'],
            'Mantenimiento Preventivo' => ['Seguridad Básica'],
        ];

        return $prerequisites[$trainingType] ?? [];
    }

    /**
     * Create prerequisite alert.
     */
    protected function createPrerequisiteAlert(TrainingScheduled $event, array $missingPrerequisites): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'training_prerequisites_missing',
                'title' => 'Prerrequisitos de Capacitación Faltantes',
                'message' => "Usuario no cumple prerrequisitos para la capacitación programada",
                'severity' => 'medium',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'training_id' => $event->training->id,
                    'user_id' => $event->training->usuario_id,
                    'missing_prerequisites' => $missingPrerequisites,
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create prerequisite alert', [
                'training_id' => $event->training->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create mandatory training alert.
     */
    protected function createMandatoryTrainingAlert(TrainingScheduled $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'mandatory_training_scheduled',
                'title' => 'Capacitación Obligatoria Programada',
                'message' => "Se ha programado una capacitación obligatoria",
                'severity' => 'high',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'training_id' => $event->training->id,
                    'user_id' => $event->training->usuario_id,
                    'training_type' => $event->training->tipo_capacitacion,
                    'scheduled_date' => $event->training->fecha_programada,
                ]),
                'expires_at' => now()->addDays(30),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create mandatory training alert', [
                'training_id' => $event->training->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update mandatory training status.
     */
    protected function updateMandatoryTrainingStatus(TrainingScheduled $event): void
    {
        try {
            DB::table('mandatory_training_status')->updateOrInsert(
                [
                    'user_id' => $event->training->usuario_id,
                    'training_type' => $event->training->tipo_capacitacion,
                ],
                [
                    'status' => 'scheduled',
                    'scheduled_date' => $event->training->fecha_programada,
                    'training_id' => $event->training->id,
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to update mandatory training status', [
                'training_id' => $event->training->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(TrainingScheduled $event, \Throwable $exception): void
    {
        Log::error('Training listener failed', [
            'training_id' => $event->training?->id,
            'user_id' => $event->training?->usuario_id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
