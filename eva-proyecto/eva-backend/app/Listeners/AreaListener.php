<?php

namespace App\Listeners;

use App\Events\Area\AreaManaged;
use App\Notifications\AreaManagedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class AreaListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle area managed event.
     */
    public function handleAreaManaged(AreaManaged $event): void
    {
        try {
            // Log the area management action
            $this->logAreaAction($event);

            // Update area-related caches
            $this->updateAreaCaches($event);

            // Handle specific actions
            $this->handleSpecificAction($event);

            // Send notifications if needed
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Update equipment assignments if needed
            if ($event->serviceChanged()) {
                $this->updateEquipmentAssignments($event);
            }

            // Update area statistics
            $this->updateAreaStatistics($event);

            // Create system alert for critical changes
            if ($event->getPriority() === 'high') {
                $this->createSystemAlert($event);
            }

        } catch (\Exception $e) {
            Log::error('Failed to handle area managed event', [
                'action' => $event->action,
                'area_id' => $event->area?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log area action.
     */
    protected function logAreaAction(AreaManaged $event): void
    {
        $logData = [
            'action' => $event->action,
            'area_id' => $event->area?->id,
            'area_name' => $event->area?->name ?? $event->areaData['name'] ?? null,
            'service_id' => $event->area?->servicio_id ?? $event->areaData['servicio_id'] ?? null,
            'changes' => $event->changes,
            'equipment_count' => $event->getAreaStatistics()['total_equipment'] ?? 0,
            'user_id' => $event->user?->id,
            'user_name' => $event->user?->getFullNameAttribute(),
            'timestamp' => $event->timestamp,
        ];

        Log::channel('audit')->info('Area management action', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(AreaManaged $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'App\Models\Area',
                'auditable_id' => $event->area?->id ?? 0,
                'event_type' => 'area.' . $event->action,
                'user_id' => $event->user?->id,
                'old_values' => json_encode($event->areaData),
                'new_values' => json_encode($event->area?->toArray()),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store area action in audit trail', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update area-related caches.
     */
    protected function updateAreaCaches(AreaManaged $event): void
    {
        $serviceId = $event->area?->servicio_id ?? $event->areaData['servicio_id'] ?? null;
        $areaId = $event->area?->id ?? $event->areaData['id'] ?? null;

        // Clear area-specific caches
        if ($areaId) {
            Cache::forget("area:{$areaId}");
            Cache::forget("area:{$areaId}:equipment");
            Cache::forget("area:{$areaId}:statistics");
        }

        // Clear service-related caches
        if ($serviceId) {
            Cache::forget("service:{$serviceId}:areas");
            Cache::forget("service:{$serviceId}:statistics");
        }

        // Clear global area caches
        Cache::forget('areas:all');
        Cache::forget('areas:active');
        Cache::forget('areas:statistics');

        // Clear dashboard caches
        Cache::forget('dashboard:areas');
        Cache::forget('dashboard:equipment_by_area');
    }

    /**
     * Handle specific actions.
     */
    protected function handleSpecificAction(AreaManaged $event): void
    {
        match ($event->action) {
            'created' => $this->handleAreaCreated($event),
            'updated' => $this->handleAreaUpdated($event),
            'deleted' => $this->handleAreaDeleted($event),
            'activated' => $this->handleAreaActivated($event),
            'deactivated' => $this->handleAreaDeactivated($event),
            'moved' => $this->handleAreaMoved($event),
            default => null,
        };
    }

    /**
     * Handle area created.
     */
    protected function handleAreaCreated(AreaManaged $event): void
    {
        if (!$event->area) {
            return;
        }

        // Initialize area statistics
        $this->initializeAreaStatistics($event->area);

        // Create default area configuration
        $this->createDefaultAreaConfiguration($event->area);

        Log::info('Area created successfully', [
            'area_id' => $event->area->id,
            'area_name' => $event->area->name,
            'service_id' => $event->area->servicio_id,
        ]);
    }

    /**
     * Handle area updated.
     */
    protected function handleAreaUpdated(AreaManaged $event): void
    {
        if (!$event->area) {
            return;
        }

        // Handle status changes
        if ($event->statusChanged()) {
            $this->handleStatusChange($event);
        }

        // Handle service changes
        if ($event->serviceChanged()) {
            $this->handleServiceChange($event);
        }

        Log::info('Area updated successfully', [
            'area_id' => $event->area->id,
            'area_name' => $event->area->name,
            'changes' => array_keys($event->changes),
        ]);
    }

    /**
     * Handle area deleted.
     */
    protected function handleAreaDeleted(AreaManaged $event): void
    {
        $areaData = $event->areaData;
        
        if (!$areaData) {
            return;
        }

        // Archive area data
        $this->archiveAreaData($areaData);

        // Handle equipment reassignment
        $this->handleEquipmentReassignment($areaData);

        // Update service statistics
        if (isset($areaData['servicio_id'])) {
            $this->updateServiceStatistics($areaData['servicio_id']);
        }

        Log::warning('Area deleted', [
            'area_id' => $areaData['id'],
            'area_name' => $areaData['name'],
            'equipment_count' => $event->getAffectedEquipmentIds(),
        ]);
    }

    /**
     * Handle area activated.
     */
    protected function handleAreaActivated(AreaManaged $event): void
    {
        if (!$event->area) {
            return;
        }

        // Reactivate equipment in this area if needed
        $this->reactivateAreaEquipment($event->area);

        Log::info('Area activated', [
            'area_id' => $event->area->id,
            'area_name' => $event->area->name,
        ]);
    }

    /**
     * Handle area deactivated.
     */
    protected function handleAreaDeactivated(AreaManaged $event): void
    {
        if (!$event->area) {
            return;
        }

        // Handle equipment in deactivated area
        $this->handleDeactivatedAreaEquipment($event->area);

        // Create alert for critical area deactivation
        if ($event->isCriticalArea()) {
            $this->createCriticalAreaAlert($event);
        }

        Log::warning('Area deactivated', [
            'area_id' => $event->area->id,
            'area_name' => $event->area->name,
            'is_critical' => $event->isCriticalArea(),
        ]);
    }

    /**
     * Handle area moved to different service.
     */
    protected function handleAreaMoved(AreaManaged $event): void
    {
        if (!$event->area) {
            return;
        }

        $previousServiceId = $event->getPreviousServiceId();
        $newServiceId = $event->area->servicio_id;

        // Update equipment service assignments
        $this->updateEquipmentServiceAssignments($event->area->id, $newServiceId);

        // Update statistics for both services
        if ($previousServiceId) {
            $this->updateServiceStatistics($previousServiceId);
        }
        $this->updateServiceStatistics($newServiceId);

        Log::info('Area moved to different service', [
            'area_id' => $event->area->id,
            'area_name' => $event->area->name,
            'previous_service_id' => $previousServiceId,
            'new_service_id' => $newServiceId,
        ]);
    }

    /**
     * Handle status change.
     */
    protected function handleStatusChange(AreaManaged $event): void
    {
        $newStatus = $event->area->active ?? true;
        
        if ($newStatus) {
            $this->handleAreaActivated($event);
        } else {
            $this->handleAreaDeactivated($event);
        }
    }

    /**
     * Handle service change.
     */
    protected function handleServiceChange(AreaManaged $event): void
    {
        $this->handleAreaMoved($event);
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(AreaManaged $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new AreaManagedNotification($event));
            
            Log::info('Area management notifications sent', [
                'action' => $event->action,
                'area_id' => $event->area?->id,
                'recipients_count' => $usersToNotify->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send area management notifications', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update equipment assignments.
     */
    protected function updateEquipmentAssignments(AreaManaged $event): void
    {
        if (!$event->area) {
            return;
        }

        $newServiceId = $event->area->servicio_id;
        $equipmentIds = $event->getAffectedEquipmentIds();

        if (empty($equipmentIds)) {
            return;
        }

        try {
            // Update equipment service assignments
            DB::table('equipos')
              ->whereIn('id', $equipmentIds)
              ->update([
                  'servicio_id' => $newServiceId,
                  'updated_at' => now(),
              ]);

            Log::info('Equipment service assignments updated', [
                'area_id' => $event->area->id,
                'new_service_id' => $newServiceId,
                'equipment_count' => count($equipmentIds),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update equipment assignments', [
                'area_id' => $event->area->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update area statistics.
     */
    protected function updateAreaStatistics(AreaManaged $event): void
    {
        $serviceId = $event->area?->servicio_id ?? $event->areaData['servicio_id'] ?? null;
        
        if (!$serviceId) {
            return;
        }

        // Update service area count
        $areaCount = DB::table('areas')
                      ->where('servicio_id', $serviceId)
                      ->where('active', true)
                      ->count();

        Cache::put("service:{$serviceId}:area_count", $areaCount, 3600);

        // Update global area statistics
        $totalAreas = DB::table('areas')->where('active', true)->count();
        Cache::put('areas:total_count', $totalAreas, 3600);
    }

    /**
     * Create system alert.
     */
    protected function createSystemAlert(AreaManaged $event): void
    {
        try {
            $severity = $event->action === 'deleted' ? 'high' : 'medium';
            $areaName = $event->area?->name ?? $event->areaData['name'] ?? 'Área';

            DB::table('system_alerts')->insert([
                'type' => 'area_management',
                'title' => 'Gestión de Área',
                'message' => $event->getActionDescription(),
                'severity' => $severity,
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'action' => $event->action,
                    'area_id' => $event->area?->id,
                    'area_name' => $areaName,
                    'equipment_count' => count($event->getAffectedEquipmentIds()),
                    'is_critical' => $event->isCriticalArea(),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create system alert for area management', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Initialize area statistics.
     */
    protected function initializeAreaStatistics(\App\Models\Area $area): void
    {
        $statistics = [
            'total_equipment' => 0,
            'active_equipment' => 0,
            'critical_equipment' => 0,
            'pending_maintenance' => 0,
            'created_at' => now(),
        ];

        Cache::put("area:{$area->id}:statistics", $statistics, 3600);
    }

    /**
     * Create default area configuration.
     */
    protected function createDefaultAreaConfiguration(\App\Models\Area $area): void
    {
        // Implementation would create default configuration for the area
        Log::info('Default area configuration created', [
            'area_id' => $area->id,
        ]);
    }

    /**
     * Archive area data.
     */
    protected function archiveAreaData(array $areaData): void
    {
        try {
            DB::table('archived_areas')->insert([
                'original_id' => $areaData['id'],
                'name' => $areaData['name'],
                'description' => $areaData['description'] ?? null,
                'servicio_id' => $areaData['servicio_id'],
                'data' => json_encode($areaData),
                'archived_at' => now(),
                'archived_by' => auth()->id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to archive area data', [
                'area_id' => $areaData['id'],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle equipment reassignment.
     */
    protected function handleEquipmentReassignment(array $areaData): void
    {
        // Implementation would handle equipment reassignment when area is deleted
        Log::info('Equipment reassignment handled for deleted area', [
            'area_id' => $areaData['id'],
        ]);
    }

    /**
     * Update service statistics.
     */
    protected function updateServiceStatistics(int $serviceId): void
    {
        // Clear service-related caches to force recalculation
        Cache::forget("service:{$serviceId}:statistics");
        Cache::forget("service:{$serviceId}:area_count");
        Cache::forget("service:{$serviceId}:equipment_count");
    }

    /**
     * Reactivate area equipment.
     */
    protected function reactivateAreaEquipment(\App\Models\Area $area): void
    {
        // Implementation would reactivate equipment when area is activated
        Log::info('Area equipment reactivated', [
            'area_id' => $area->id,
        ]);
    }

    /**
     * Handle deactivated area equipment.
     */
    protected function handleDeactivatedAreaEquipment(\App\Models\Area $area): void
    {
        // Implementation would handle equipment when area is deactivated
        Log::info('Deactivated area equipment handled', [
            'area_id' => $area->id,
        ]);
    }

    /**
     * Create critical area alert.
     */
    protected function createCriticalAreaAlert(AreaManaged $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'critical_area_deactivated',
                'title' => 'Área Crítica Desactivada',
                'message' => "El área crítica '{$event->area->name}' ha sido desactivada",
                'severity' => 'critical',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'area_id' => $event->area->id,
                    'area_name' => $event->area->name,
                    'critical_equipment_count' => $event->getAreaStatistics()['critical_equipment'] ?? 0,
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create critical area alert', [
                'area_id' => $event->area?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update equipment service assignments.
     */
    protected function updateEquipmentServiceAssignments(int $areaId, int $newServiceId): void
    {
        try {
            DB::table('equipos')
              ->where('area_id', $areaId)
              ->update([
                  'servicio_id' => $newServiceId,
                  'updated_at' => now(),
              ]);
        } catch (\Exception $e) {
            Log::error('Failed to update equipment service assignments', [
                'area_id' => $areaId,
                'new_service_id' => $newServiceId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(AreaManaged $event, \Throwable $exception): void
    {
        Log::error('Area listener failed', [
            'action' => $event->action,
            'area_id' => $event->area?->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
