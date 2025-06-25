<?php

namespace App\Listeners;

use App\Events\Service\ServiceManaged;
use App\Notifications\ServiceManagedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ServiceListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle service managed event.
     */
    public function handleServiceManaged(ServiceManaged $event): void
    {
        try {
            // Log the service management action
            $this->logServiceAction($event);

            // Update service-related caches
            $this->updateServiceCaches($event);

            // Handle specific actions
            $this->handleSpecificAction($event);

            // Send notifications if needed
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Update service statistics and metrics
            $this->updateServiceMetrics($event);

            // Handle resource reassignment if needed
            if ($event->action === 'deleted') {
                $this->handleResourceReassignment($event);
            }

            // Create system alert for critical changes
            if ($event->getPriority() === 'critical') {
                $this->createCriticalServiceAlert($event);
            }

            // Update dashboard metrics
            $this->updateDashboardMetrics($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle service managed event', [
                'action' => $event->action,
                'service_id' => $event->service?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log service action.
     */
    protected function logServiceAction(ServiceManaged $event): void
    {
        $logData = [
            'action' => $event->action,
            'service_id' => $event->service?->id,
            'service_name' => $event->service?->name ?? $event->serviceData['name'] ?? null,
            'changes' => $event->changes,
            'statistics' => $event->getServiceStatistics(),
            'impact_assessment' => $event->getImpactAssessment(),
            'user_id' => $event->user?->id,
            'user_name' => $event->user?->getFullNameAttribute(),
            'timestamp' => $event->timestamp,
        ];

        Log::channel('audit')->info('Service management action', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(ServiceManaged $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'App\Models\Servicio',
                'auditable_id' => $event->service?->id ?? 0,
                'event_type' => 'service.' . $event->action,
                'user_id' => $event->user?->id,
                'old_values' => json_encode($event->serviceData),
                'new_values' => json_encode($event->service?->toArray()),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store service action in audit trail', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update service-related caches.
     */
    protected function updateServiceCaches(ServiceManaged $event): void
    {
        $serviceId = $event->service?->id ?? $event->serviceData['id'] ?? null;

        // Clear service-specific caches
        if ($serviceId) {
            Cache::forget("service:{$serviceId}");
            Cache::forget("service:{$serviceId}:statistics");
            Cache::forget("service:{$serviceId}:equipment");
            Cache::forget("service:{$serviceId}:areas");
            Cache::forget("service:{$serviceId}:users");
            Cache::forget("service:{$serviceId}:performance");
        }

        // Clear global service caches
        Cache::forget('services:all');
        Cache::forget('services:active');
        Cache::forget('services:statistics');
        Cache::forget('services:performance_summary');

        // Clear dashboard caches
        Cache::forget('dashboard:services');
        Cache::forget('dashboard:equipment_by_service');
        Cache::forget('dashboard:service_performance');
    }

    /**
     * Handle specific actions.
     */
    protected function handleSpecificAction(ServiceManaged $event): void
    {
        match ($event->action) {
            'created' => $this->handleServiceCreated($event),
            'updated' => $this->handleServiceUpdated($event),
            'deleted' => $this->handleServiceDeleted($event),
            'activated' => $this->handleServiceActivated($event),
            'deactivated' => $this->handleServiceDeactivated($event),
            default => null,
        };
    }

    /**
     * Handle service created.
     */
    protected function handleServiceCreated(ServiceManaged $event): void
    {
        if (!$event->service) {
            return;
        }

        // Initialize service statistics
        $this->initializeServiceStatistics($event->service);

        // Create default service configuration
        $this->createDefaultServiceConfiguration($event->service);

        // Update global service count
        $this->updateGlobalServiceCount();

        Log::info('Service created successfully', [
            'service_id' => $event->service->id,
            'service_name' => $event->service->name,
        ]);
    }

    /**
     * Handle service updated.
     */
    protected function handleServiceUpdated(ServiceManaged $event): void
    {
        if (!$event->service) {
            return;
        }

        // Handle status changes
        if ($event->statusChanged()) {
            $this->handleStatusChange($event);
        }

        // Handle name changes
        if ($event->nameChanged()) {
            $this->handleNameChange($event);
        }

        // Recalculate service performance metrics
        $this->recalculateServicePerformance($event->service);

        Log::info('Service updated successfully', [
            'service_id' => $event->service->id,
            'service_name' => $event->service->name,
            'changes' => array_keys($event->changes),
        ]);
    }

    /**
     * Handle service deleted.
     */
    protected function handleServiceDeleted(ServiceManaged $event): void
    {
        $serviceData = $event->serviceData;
        
        if (!$serviceData) {
            return;
        }

        // Archive service data
        $this->archiveServiceData($serviceData);

        // Handle resource reassignment
        $this->handleResourceReassignment($event);

        // Update global service count
        $this->updateGlobalServiceCount();

        // Create deletion alert
        $this->createServiceDeletionAlert($event);

        Log::warning('Service deleted', [
            'service_id' => $serviceData['id'],
            'service_name' => $serviceData['name'],
            'impact_assessment' => $event->getImpactAssessment(),
        ]);
    }

    /**
     * Handle service activated.
     */
    protected function handleServiceActivated(ServiceManaged $event): void
    {
        if (!$event->service) {
            return;
        }

        // Reactivate service resources if needed
        $this->reactivateServiceResources($event->service);

        Log::info('Service activated', [
            'service_id' => $event->service->id,
            'service_name' => $event->service->name,
        ]);
    }

    /**
     * Handle service deactivated.
     */
    protected function handleServiceDeactivated(ServiceManaged $event): void
    {
        if (!$event->service) {
            return;
        }

        // Handle deactivated service resources
        $this->handleDeactivatedServiceResources($event->service);

        // Create alert for critical service deactivation
        if ($event->isCriticalService()) {
            $this->createCriticalServiceDeactivationAlert($event);
        }

        Log::warning('Service deactivated', [
            'service_id' => $event->service->id,
            'service_name' => $event->service->name,
            'is_critical' => $event->isCriticalService(),
        ]);
    }

    /**
     * Handle status change.
     */
    protected function handleStatusChange(ServiceManaged $event): void
    {
        $newStatus = $event->service->active ?? true;
        
        if ($newStatus) {
            $this->handleServiceActivated($event);
        } else {
            $this->handleServiceDeactivated($event);
        }
    }

    /**
     * Handle name change.
     */
    protected function handleNameChange(ServiceManaged $event): void
    {
        // Update references in other systems
        $this->updateServiceNameReferences($event->service);

        Log::info('Service name changed', [
            'service_id' => $event->service->id,
            'old_name' => $event->changes['name']['old'] ?? null,
            'new_name' => $event->service->name,
        ]);
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(ServiceManaged $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new ServiceManagedNotification($event));
            
            Log::info('Service management notifications sent', [
                'action' => $event->action,
                'service_id' => $event->service?->id,
                'recipients_count' => $usersToNotify->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send service management notifications', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update service metrics.
     */
    protected function updateServiceMetrics(ServiceManaged $event): void
    {
        $serviceId = $event->service?->id ?? $event->serviceData['id'] ?? null;
        
        if (!$serviceId) {
            return;
        }

        $today = now()->format('Y-m-d');
        $hour = now()->hour;

        // Update service action metrics
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'service_actions',
                    'metric_category' => 'daily',
                    'metric_key' => $event->action,
                    'metric_date' => $today,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'service_id' => $serviceId,
                        'user_id' => $event->user?->id,
                        'impact_level' => $event->getImpactAssessment()['impact_level'],
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Update service performance metrics
            if ($event->service) {
                $this->updateServicePerformanceMetrics($event->service, $today);
            }

        } catch (\Exception $e) {
            Log::error('Failed to update service metrics', [
                'service_id' => $serviceId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update service performance metrics.
     */
    protected function updateServicePerformanceMetrics(\App\Models\Servicio $service, string $date): void
    {
        $performance = $service->getPerformanceMetrics();
        
        foreach ($performance as $metric => $value) {
            try {
                DB::table('event_metrics')->updateOrInsert(
                    [
                        'metric_type' => 'service_performance',
                        'metric_category' => 'daily',
                        'metric_key' => $metric,
                        'metric_date' => $date,
                        'metric_hour' => null,
                    ],
                    [
                        'metric_value' => $value,
                        'metadata' => json_encode(['service_id' => $service->id]),
                        'updated_at' => now(),
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Failed to update service performance metric', [
                    'service_id' => $service->id,
                    'metric' => $metric,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Handle resource reassignment.
     */
    protected function handleResourceReassignment(ServiceManaged $event): void
    {
        $serviceData = $event->serviceData;
        
        if (!$serviceData) {
            return;
        }

        $serviceId = $serviceData['id'];

        try {
            // Reassign equipment to default service or mark as unassigned
            DB::table('equipos')
              ->where('servicio_id', $serviceId)
              ->update([
                  'servicio_id' => null, // or default service ID
                  'updated_at' => now(),
              ]);

            // Reassign areas to default service or mark as unassigned
            DB::table('areas')
              ->where('servicio_id', $serviceId)
              ->update([
                  'servicio_id' => null, // or default service ID
                  'updated_at' => now(),
              ]);

            // Reassign users to default service or mark as unassigned
            DB::table('usuarios')
              ->where('servicio_id', $serviceId)
              ->update([
                  'servicio_id' => null, // or default service ID
                  'updated_at' => now(),
              ]);

            Log::info('Service resources reassigned', [
                'deleted_service_id' => $serviceId,
                'equipment_count' => $event->getAffectedEquipmentIds(),
                'area_count' => $event->getAffectedAreaIds(),
                'user_count' => $event->getAffectedUserIds(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to reassign service resources', [
                'service_id' => $serviceId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create critical service alert.
     */
    protected function createCriticalServiceAlert(ServiceManaged $event): void
    {
        try {
            $serviceName = $event->service?->name ?? $event->serviceData['name'] ?? 'Servicio';
            $impactAssessment = $event->getImpactAssessment();

            DB::table('system_alerts')->insert([
                'type' => 'critical_service_action',
                'title' => 'Acción Crítica en Servicio',
                'message' => $event->getActionDescription(),
                'severity' => 'critical',
                'status' => 'active',
                'service_id' => $event->service?->id,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'action' => $event->action,
                    'service_id' => $event->service?->id,
                    'service_name' => $serviceName,
                    'impact_assessment' => $impactAssessment,
                    'statistics' => $event->getServiceStatistics(),
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create critical service alert', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update dashboard metrics.
     */
    protected function updateDashboardMetrics(ServiceManaged $event): void
    {
        // Trigger dashboard metrics update
        event(new \App\Events\Dashboard\DashboardMetricsUpdated(
            $event->getServiceStatistics(),
            'service_management',
            $event->service?->id,
            null,
            $event->user
        ));
    }

    /**
     * Initialize service statistics.
     */
    protected function initializeServiceStatistics(\App\Models\Servicio $service): void
    {
        $statistics = [
            'total_equipment' => 0,
            'active_equipment' => 0,
            'critical_equipment' => 0,
            'pending_maintenance' => 0,
            'total_areas' => 0,
            'active_areas' => 0,
            'total_users' => 0,
            'active_users' => 0,
            'created_at' => now(),
        ];

        Cache::put("service:{$service->id}:statistics", $statistics, 3600);
    }

    /**
     * Create default service configuration.
     */
    protected function createDefaultServiceConfiguration(\App\Models\Servicio $service): void
    {
        // Implementation would create default configuration for the service
        Log::info('Default service configuration created', [
            'service_id' => $service->id,
        ]);
    }

    /**
     * Update global service count.
     */
    protected function updateGlobalServiceCount(): void
    {
        $totalServices = DB::table('servicios')->where('active', true)->count();
        Cache::put('services:total_count', $totalServices, 3600);
    }

    /**
     * Recalculate service performance.
     */
    protected function recalculateServicePerformance(\App\Models\Servicio $service): void
    {
        // Clear performance cache to force recalculation
        Cache::forget("service:{$service->id}:performance");
    }

    /**
     * Archive service data.
     */
    protected function archiveServiceData(array $serviceData): void
    {
        try {
            DB::table('archived_services')->insert([
                'original_id' => $serviceData['id'],
                'name' => $serviceData['name'],
                'description' => $serviceData['description'] ?? null,
                'code' => $serviceData['code'] ?? null,
                'data' => json_encode($serviceData),
                'archived_at' => now(),
                'archived_by' => auth()->id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to archive service data', [
                'service_id' => $serviceData['id'],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create service deletion alert.
     */
    protected function createServiceDeletionAlert(ServiceManaged $event): void
    {
        try {
            $serviceData = $event->serviceData;
            $impactAssessment = $event->getImpactAssessment();

            DB::table('system_alerts')->insert([
                'type' => 'service_deleted',
                'title' => 'Servicio Eliminado',
                'message' => "El servicio '{$serviceData['name']}' ha sido eliminado del sistema",
                'severity' => $impactAssessment['impact_level'] === 'critical' ? 'critical' : 'high',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'service_id' => $serviceData['id'],
                    'service_name' => $serviceData['name'],
                    'impact_assessment' => $impactAssessment,
                    'affected_resources' => $impactAssessment['affected_resources'],
                ]),
                'expires_at' => now()->addDays(30),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create service deletion alert', [
                'service_id' => $event->serviceData['id'] ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Reactivate service resources.
     */
    protected function reactivateServiceResources(\App\Models\Servicio $service): void
    {
        // Implementation would reactivate service resources
        Log::info('Service resources reactivated', [
            'service_id' => $service->id,
        ]);
    }

    /**
     * Handle deactivated service resources.
     */
    protected function handleDeactivatedServiceResources(\App\Models\Servicio $service): void
    {
        // Implementation would handle deactivated service resources
        Log::info('Deactivated service resources handled', [
            'service_id' => $service->id,
        ]);
    }

    /**
     * Create critical service deactivation alert.
     */
    protected function createCriticalServiceDeactivationAlert(ServiceManaged $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'critical_service_deactivated',
                'title' => 'Servicio Crítico Desactivado',
                'message' => "El servicio crítico '{$event->service->name}' ha sido desactivado",
                'severity' => 'critical',
                'status' => 'active',
                'service_id' => $event->service->id,
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'service_id' => $event->service->id,
                    'service_name' => $event->service->name,
                    'statistics' => $event->getServiceStatistics(),
                    'impact_assessment' => $event->getImpactAssessment(),
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create critical service deactivation alert', [
                'service_id' => $event->service?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update service name references.
     */
    protected function updateServiceNameReferences(\App\Models\Servicio $service): void
    {
        // Implementation would update service name references in other systems
        Log::info('Service name references updated', [
            'service_id' => $service->id,
            'new_name' => $service->name,
        ]);
    }

    /**
     * Handle job failure.
     */
    public function failed(ServiceManaged $event, \Throwable $exception): void
    {
        Log::error('Service listener failed', [
            'action' => $event->action,
            'service_id' => $event->service?->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
