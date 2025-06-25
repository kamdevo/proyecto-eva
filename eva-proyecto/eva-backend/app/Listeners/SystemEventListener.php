<?php

namespace App\Listeners;

use App\Events\BaseEvent;
use App\Notifications\SystemEventNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;

class SystemEventListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 60;

    /**
     * Handle the event.
     */
    public function handle(BaseEvent $event): void
    {
        try {
            // Log the event
            $this->logEvent($event);

            // Update system metrics
            $this->updateMetrics($event);

            // Send notifications if needed
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Cache event data if needed
            $this->cacheEventData($event);

            // Trigger automated actions
            $this->triggerAutomatedActions($event);

            // Update real-time dashboards
            $this->updateDashboards($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle system event', [
                'event_type' => $event->getEventType(),
                'event_id' => $event->timestamp,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log the event.
     */
    protected function logEvent(BaseEvent $event): void
    {
        if (!$event->shouldLog()) {
            return;
        }

        $logData = [
            'event_type' => $event->getEventType(),
            'event_category' => $event->getCategory(),
            'event_priority' => $event->getPriority(),
            'user_id' => $event->user?->id,
            'user_name' => $event->user?->getFullNameAttribute(),
            'timestamp' => $event->timestamp,
            'metadata' => $event->metadata,
            'data' => $event->getEventData(),
        ];

        // Log to appropriate channel based on category
        $channel = match ($event->getCategory()) {
            'authentication' => 'security',
            'equipment', 'maintenance', 'contingency' => 'audit',
            default => 'audit',
        };

        Log::channel($channel)->info("System Event: {$event->getEventType()}", $logData);

        // Store in database for audit trail
        $this->storeEventInDatabase($event, $logData);
    }

    /**
     * Store event in database.
     */
    protected function storeEventInDatabase(BaseEvent $event, array $logData): void
    {
        try {
            DB::table('system_events')->insert([
                'event_type' => $event->getEventType(),
                'event_category' => $event->getCategory(),
                'event_priority' => $event->getPriority(),
                'user_id' => $event->user?->id,
                'data' => json_encode($logData),
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store event in database', [
                'event_type' => $event->getEventType(),
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update system metrics.
     */
    protected function updateMetrics(BaseEvent $event): void
    {
        $cacheKey = "metrics:{$event->getCategory()}:{$event->getEventType()}";
        
        // Increment event counter
        Cache::increment($cacheKey . ':count');
        
        // Update hourly metrics
        $hourKey = $cacheKey . ':hour:' . now()->format('Y-m-d-H');
        Cache::increment($hourKey);
        Cache::expire($hourKey, 3600 * 25); // Keep for 25 hours
        
        // Update daily metrics
        $dayKey = $cacheKey . ':day:' . now()->format('Y-m-d');
        Cache::increment($dayKey);
        Cache::expire($dayKey, 86400 * 32); // Keep for 32 days
        
        // Update priority-based metrics
        if ($event->getPriority() === 'critical') {
            Cache::increment('metrics:critical_events:count');
        }
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(BaseEvent $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        // Rate limiting for notifications
        $rateLimitKey = "notifications:{$event->getEventType()}:" . now()->format('Y-m-d-H');
        $currentCount = Cache::get($rateLimitKey, 0);
        
        // Limit notifications per hour based on priority
        $maxNotifications = match ($event->getPriority()) {
            'critical' => 100,
            'high' => 50,
            'normal' => 20,
            default => 10,
        };
        
        if ($currentCount >= $maxNotifications) {
            Log::warning('Notification rate limit exceeded', [
                'event_type' => $event->getEventType(),
                'current_count' => $currentCount,
                'max_allowed' => $maxNotifications,
            ]);
            return;
        }

        try {
            Notification::send($usersToNotify, new SystemEventNotification($event));
            
            // Update rate limit counter
            Cache::increment($rateLimitKey);
            Cache::expire($rateLimitKey, 3600);
            
            Log::info('Notifications sent', [
                'event_type' => $event->getEventType(),
                'recipients_count' => $usersToNotify->count(),
                'channels' => $event->getNotificationChannels(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send notifications', [
                'event_type' => $event->getEventType(),
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Cache event data for quick access.
     */
    protected function cacheEventData(BaseEvent $event): void
    {
        // Cache recent events for dashboard
        $recentEventsKey = "recent_events:{$event->getCategory()}";
        $recentEvents = Cache::get($recentEventsKey, []);
        
        // Add new event to the beginning
        array_unshift($recentEvents, [
            'type' => $event->getEventType(),
            'priority' => $event->getPriority(),
            'timestamp' => $event->timestamp,
            'user' => $event->user?->getFullNameAttribute(),
            'data' => $event->getEventData(),
        ]);
        
        // Keep only last 50 events
        $recentEvents = array_slice($recentEvents, 0, 50);
        
        Cache::put($recentEventsKey, $recentEvents, 3600); // Cache for 1 hour
    }

    /**
     * Trigger automated actions based on event.
     */
    protected function triggerAutomatedActions(BaseEvent $event): void
    {
        // Equipment-related automations
        if ($event->getCategory() === 'equipment') {
            $this->handleEquipmentAutomations($event);
        }
        
        // Maintenance-related automations
        if ($event->getCategory() === 'maintenance') {
            $this->handleMaintenanceAutomations($event);
        }
        
        // Contingency-related automations
        if ($event->getCategory() === 'contingency') {
            $this->handleContingencyAutomations($event);
        }
        
        // Security-related automations
        if ($event->getCategory() === 'authentication') {
            $this->handleSecurityAutomations($event);
        }
    }

    /**
     * Handle equipment automations.
     */
    protected function handleEquipmentAutomations(BaseEvent $event): void
    {
        $eventType = $event->getEventType();
        
        if ($eventType === 'equipment.updated') {
            // Check if status changed to critical
            $eventData = $event->getEventData();
            if (isset($eventData['changes']['estadoequipo_id'])) {
                // Trigger maintenance schedule review
                $this->scheduleMaintenanceReview($eventData['equipment']['id']);
            }
        }
    }

    /**
     * Handle maintenance automations.
     */
    protected function handleMaintenanceAutomations(BaseEvent $event): void
    {
        $eventType = $event->getEventType();
        
        if ($eventType === 'maintenance.completed') {
            // Schedule next maintenance
            $eventData = $event->getEventData();
            $this->scheduleNextMaintenance($eventData['maintenance']['equipment']['id']);
        }
    }

    /**
     * Handle contingency automations.
     */
    protected function handleContingencyAutomations(BaseEvent $event): void
    {
        $eventType = $event->getEventType();
        
        if ($eventType === 'contingency.created' && $event->getPriority() === 'critical') {
            // Create emergency response ticket
            $this->createEmergencyTicket($event);
        }
    }

    /**
     * Handle security automations.
     */
    protected function handleSecurityAutomations(BaseEvent $event): void
    {
        $eventType = $event->getEventType();
        
        if ($eventType === 'user.logged_in' && $event->getPriority() === 'high') {
            // Log suspicious login for review
            $this->flagSuspiciousActivity($event);
        }
    }

    /**
     * Update real-time dashboards.
     */
    protected function updateDashboards(BaseEvent $event): void
    {
        // Update dashboard cache
        $dashboardKey = "dashboard:realtime:{$event->getCategory()}";
        $dashboardData = Cache::get($dashboardKey, []);
        
        // Update counters
        $dashboardData['total_events'] = ($dashboardData['total_events'] ?? 0) + 1;
        $dashboardData['last_event'] = [
            'type' => $event->getEventType(),
            'timestamp' => $event->timestamp,
            'priority' => $event->getPriority(),
        ];
        
        // Update priority counters
        $priority = $event->getPriority();
        $dashboardData['by_priority'][$priority] = ($dashboardData['by_priority'][$priority] ?? 0) + 1;
        
        Cache::put($dashboardKey, $dashboardData, 300); // Cache for 5 minutes
    }

    /**
     * Schedule maintenance review.
     */
    protected function scheduleMaintenanceReview(int $equipmentId): void
    {
        // Implementation would create a maintenance review task
        Log::info('Maintenance review scheduled', ['equipment_id' => $equipmentId]);
    }

    /**
     * Schedule next maintenance.
     */
    protected function scheduleNextMaintenance(int $equipmentId): void
    {
        // Implementation would calculate and schedule next maintenance
        Log::info('Next maintenance scheduled', ['equipment_id' => $equipmentId]);
    }

    /**
     * Create emergency ticket.
     */
    protected function createEmergencyTicket(BaseEvent $event): void
    {
        // Implementation would create an emergency response ticket
        Log::warning('Emergency ticket created', [
            'event_type' => $event->getEventType(),
            'priority' => $event->getPriority(),
        ]);
    }

    /**
     * Flag suspicious activity.
     */
    protected function flagSuspiciousActivity(BaseEvent $event): void
    {
        // Implementation would flag for security review
        Log::warning('Suspicious activity flagged', [
            'event_type' => $event->getEventType(),
            'user_id' => $event->user?->id,
        ]);
    }

    /**
     * Handle job failure.
     */
    public function failed(BaseEvent $event, \Throwable $exception): void
    {
        Log::error('System event listener failed', [
            'event_type' => $event->getEventType(),
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
