<?php

namespace App\Listeners;

use App\Events\Contingency\ContingencyCreated;
use App\Notifications\ContingencyNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ContingencyListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle contingency created event.
     */
    public function handleContingencyCreated(ContingencyCreated $event): void
    {
        try {
            // Log the contingency creation
            $this->logContingencyCreation($event);

            // Update contingency metrics
            $this->updateContingencyMetrics($event);

            // Send notifications
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Handle critical contingencies
            if ($event->isCritical()) {
                $this->handleCriticalContingency($event);
            }

            // Create emergency response if needed
            if ($event->requiresEmergencyResponse()) {
                $this->createEmergencyResponse($event);
            }

            // Update equipment status
            $this->updateEquipmentStatus($event);

            // Schedule follow-up actions
            $this->scheduleFollowUpActions($event);

            // Update service impact assessment
            $this->updateServiceImpactAssessment($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle contingency created event', [
                'contingency_id' => $event->contingency?->id,
                'equipment_id' => $event->contingency?->equipo_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log contingency creation.
     */
    protected function logContingencyCreation(ContingencyCreated $event): void
    {
        $logData = [
            'contingency_id' => $event->contingency?->id,
            'equipment_id' => $event->contingency?->equipo_id,
            'equipment_code' => $event->getEquipmentInfo()['code'] ?? null,
            'priority' => $event->getPriority(),
            'impact_level' => $event->getImpactLevel(),
            'category' => $event->contingency?->categoria,
            'description' => $event->contingency?->observacion,
            'is_critical' => $event->isCritical(),
            'requires_emergency_response' => $event->requiresEmergencyResponse(),
            'user_id' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        Log::channel('audit')->info('Contingency created', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(ContingencyCreated $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'App\Models\Contingencia',
                'auditable_id' => $event->contingency?->id ?? 0,
                'event_type' => 'contingency.created',
                'user_id' => $event->user?->id,
                'old_values' => null,
                'new_values' => json_encode($event->contingency?->toArray()),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store contingency creation in audit trail', [
                'contingency_id' => $event->contingency?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update contingency metrics.
     */
    protected function updateContingencyMetrics(ContingencyCreated $event): void
    {
        $today = now()->format('Y-m-d');
        $hour = now()->hour;

        // Update daily contingency count
        Cache::increment("contingencies:daily:{$today}");
        
        // Update hourly contingency count
        Cache::increment("contingencies:hourly:{$today}:{$hour}");
        
        // Update priority-specific metrics
        $priority = $event->getPriority();
        Cache::increment("contingencies:priority:{$priority}:daily:{$today}");

        // Update equipment-specific metrics
        if ($event->contingency?->equipo_id) {
            Cache::increment("equipment:{$event->contingency->equipo_id}:contingencies:count");
        }

        // Update critical contingency metrics
        if ($event->isCritical()) {
            Cache::increment("contingencies:critical:daily:{$today}");
        }

        // Store metrics in database
        $this->storeMetricsInDatabase($event, $today, $hour);
    }

    /**
     * Store metrics in database.
     */
    protected function storeMetricsInDatabase(ContingencyCreated $event, string $date, int $hour): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'contingencies',
                    'metric_category' => 'daily',
                    'metric_key' => 'created',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'equipment_id' => $event->contingency?->equipo_id,
                        'priority' => $event->getPriority(),
                        'is_critical' => $event->isCritical(),
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store critical contingency metrics
            if ($event->isCritical()) {
                DB::table('event_metrics')->updateOrInsert(
                    [
                        'metric_type' => 'contingencies',
                        'metric_category' => 'daily',
                        'metric_key' => 'critical_created',
                        'metric_date' => $date,
                        'metric_hour' => null,
                    ],
                    [
                        'metric_value' => DB::raw('metric_value + 1'),
                        'metadata' => json_encode([
                            'equipment_id' => $event->contingency?->equipo_id,
                            'user_id' => $event->user?->id,
                        ]),
                        'updated_at' => now(),
                    ]
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to store contingency metrics', [
                'contingency_id' => $event->contingency?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(ContingencyCreated $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new ContingencyNotification($event));
            
            Log::info('Contingency notifications sent', [
                'contingency_id' => $event->contingency?->id,
                'recipients_count' => $usersToNotify->count(),
                'is_critical' => $event->isCritical(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send contingency notifications', [
                'contingency_id' => $event->contingency?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle critical contingency.
     */
    protected function handleCriticalContingency(ContingencyCreated $event): void
    {
        // Create high-priority alert
        $this->createCriticalContingencyAlert($event);

        // Escalate to management
        $this->escalateToManagement($event);

        // Update critical equipment status
        $this->updateCriticalEquipmentStatus($event);

        Log::critical('Critical contingency created', [
            'contingency_id' => $event->contingency?->id,
            'equipment_id' => $event->contingency?->equipo_id,
            'impact_level' => $event->getImpactLevel(),
        ]);
    }

    /**
     * Create emergency response.
     */
    protected function createEmergencyResponse(ContingencyCreated $event): void
    {
        try {
            // Create emergency response ticket
            DB::table('emergency_responses')->insert([
                'contingency_id' => $event->contingency->id,
                'equipment_id' => $event->contingency->equipo_id,
                'priority' => 'critical',
                'status' => 'active',
                'response_type' => 'equipment_failure',
                'description' => 'Respuesta de emergencia para contingencia crítica',
                'created_by' => $event->user?->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Notify emergency response team
            $this->notifyEmergencyResponseTeam($event);

        } catch (\Exception $e) {
            Log::error('Failed to create emergency response', [
                'contingency_id' => $event->contingency?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update equipment status.
     */
    protected function updateEquipmentStatus(ContingencyCreated $event): void
    {
        if (!$event->contingency?->equipo_id) {
            return;
        }

        try {
            // Update equipment status to indicate contingency
            DB::table('equipos')
              ->where('id', $event->contingency->equipo_id)
              ->update([
                  'tiene_contingencia' => true,
                  'estado_contingencia' => $event->getPriority(),
                  'updated_at' => now(),
              ]);

            // Clear equipment cache
            Cache::forget("equipment:{$event->contingency->equipo_id}");

        } catch (\Exception $e) {
            Log::error('Failed to update equipment status', [
                'equipment_id' => $event->contingency->equipo_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Schedule follow-up actions.
     */
    protected function scheduleFollowUpActions(ContingencyCreated $event): void
    {
        if (!$event->contingency?->id) {
            return;
        }

        $followUpIntervals = [
            'critical' => [1, 4, 24], // 1 hour, 4 hours, 24 hours
            'high' => [4, 24, 72],    // 4 hours, 24 hours, 72 hours
            'medium' => [24, 72],     // 24 hours, 72 hours
            'low' => [72],            // 72 hours
        ];

        $priority = $event->getPriority();
        $intervals = $followUpIntervals[$priority] ?? [24];

        foreach ($intervals as $hours) {
            try {
                DB::table('scheduled_follow_ups')->insert([
                    'type' => 'contingency_follow_up',
                    'related_id' => $event->contingency->id,
                    'related_type' => 'App\Models\Contingencia',
                    'follow_up_date' => now()->addHours($hours),
                    'priority' => $priority,
                    'data' => json_encode([
                        'contingency_id' => $event->contingency->id,
                        'equipment_id' => $event->contingency->equipo_id,
                        'hours_after_creation' => $hours,
                    ]),
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to schedule follow-up action', [
                    'contingency_id' => $event->contingency->id,
                    'hours' => $hours,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Update service impact assessment.
     */
    protected function updateServiceImpactAssessment(ContingencyCreated $event): void
    {
        $equipmentInfo = $event->getEquipmentInfo();
        $serviceId = $equipmentInfo['service_id'] ?? null;

        if (!$serviceId) {
            return;
        }

        try {
            // Count active contingencies for this service
            $activeContingencies = DB::table('contingencias')
                                    ->join('equipos', 'contingencias.equipo_id', '=', 'equipos.id')
                                    ->where('equipos.servicio_id', $serviceId)
                                    ->where('contingencias.estado', 'Activa')
                                    ->count();

            // Update service impact level
            $impactLevel = match (true) {
                $activeContingencies >= 5 => 'critical',
                $activeContingencies >= 3 => 'high',
                $activeContingencies >= 1 => 'medium',
                default => 'low',
            };

            Cache::put("service:{$serviceId}:impact_level", $impactLevel, 3600);
            Cache::put("service:{$serviceId}:active_contingencies", $activeContingencies, 3600);

        } catch (\Exception $e) {
            Log::error('Failed to update service impact assessment', [
                'service_id' => $serviceId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create critical contingency alert.
     */
    protected function createCriticalContingencyAlert(ContingencyCreated $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'critical_contingency',
                'title' => 'Contingencia Crítica',
                'message' => "Contingencia crítica creada para equipo {$event->getEquipmentInfo()['code'] ?? 'N/A'}",
                'severity' => 'critical',
                'status' => 'active',
                'equipment_id' => $event->contingency->equipo_id,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'contingency_id' => $event->contingency->id,
                    'equipment_id' => $event->contingency->equipo_id,
                    'priority' => $event->getPriority(),
                    'impact_level' => $event->getImpactLevel(),
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create critical contingency alert', [
                'contingency_id' => $event->contingency?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Escalate to management.
     */
    protected function escalateToManagement(ContingencyCreated $event): void
    {
        try {
            // Get management users
            $managementUsers = DB::table('usuarios')
                                ->join('roles', 'usuarios.rol_id', '=', 'roles.id')
                                ->whereIn('roles.nombre', ['Administrador', 'Supervisor', 'Director'])
                                ->where('usuarios.estado', true)
                                ->select('usuarios.*')
                                ->get();

            // Send escalation notifications
            foreach ($managementUsers as $user) {
                Notification::send($user, new ContingencyNotification($event, 'escalation'));
            }

        } catch (\Exception $e) {
            Log::error('Failed to escalate to management', [
                'contingency_id' => $event->contingency?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update critical equipment status.
     */
    protected function updateCriticalEquipmentStatus(ContingencyCreated $event): void
    {
        if (!$event->contingency?->equipo_id) {
            return;
        }

        try {
            // Mark equipment as critical
            DB::table('equipos')
              ->where('id', $event->contingency->equipo_id)
              ->update([
                  'estado_critico' => true,
                  'fecha_estado_critico' => now(),
                  'updated_at' => now(),
              ]);

        } catch (\Exception $e) {
            Log::error('Failed to update critical equipment status', [
                'equipment_id' => $event->contingency->equipo_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Notify emergency response team.
     */
    protected function notifyEmergencyResponseTeam(ContingencyCreated $event): void
    {
        try {
            // Get emergency response team members
            $emergencyTeam = DB::table('usuarios')
                              ->join('roles', 'usuarios.rol_id', '=', 'roles.id')
                              ->where('roles.nombre', 'Técnico de Emergencia')
                              ->orWhere('usuarios.es_respuesta_emergencia', true)
                              ->where('usuarios.estado', true)
                              ->select('usuarios.*')
                              ->get();

            // Send emergency notifications
            foreach ($emergencyTeam as $member) {
                Notification::send($member, new ContingencyNotification($event, 'emergency'));
            }

        } catch (\Exception $e) {
            Log::error('Failed to notify emergency response team', [
                'contingency_id' => $event->contingency?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(ContingencyCreated $event, \Throwable $exception): void
    {
        Log::error('Contingency listener failed', [
            'contingency_id' => $event->contingency?->id,
            'equipment_id' => $event->contingency?->equipo_id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
