<?php

namespace App\Events\Dashboard;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class DashboardDataUpdated extends BaseEvent
{
    /**
     * Dashboard data.
     */
    public array $dashboardData;

    /**
     * Data type.
     */
    public string $dataType;

    /**
     * Create a new event instance.
     */
    public function __construct(array $dashboardData, string $dataType, ?User $user = null, array $metadata = [])
    {
        $this->dashboardData = $dashboardData;
        $this->dataType = $dataType;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('dashboard.updated'),
            new Channel('dashboard.' . $this->dataType),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'dashboard.data.updated';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'data_type' => $this->dataType,
            'data' => $this->dashboardData,
            'updated_at' => now()->toISOString(),
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority for critical metrics
        $criticalTypes = ['alerts', 'critical_equipment', 'overdue_maintenance'];
        
        if (in_array($this->dataType, $criticalTypes)) {
            return 'high';
        }
        
        return 'low';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'dashboard';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        return false; // Dashboard updates don't need notifications
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        return ['broadcast'];
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        return collect();
    }

    /**
     * Check if data contains alerts.
     */
    public function hasAlerts(): bool
    {
        return isset($this->dashboardData['alerts']) && count($this->dashboardData['alerts']) > 0;
    }

    /**
     * Get alert count.
     */
    public function getAlertCount(): int
    {
        return count($this->dashboardData['alerts'] ?? []);
    }

    /**
     * Get critical equipment count.
     */
    public function getCriticalEquipmentCount(): int
    {
        return $this->dashboardData['critical_equipment_count'] ?? 0;
    }

    /**
     * Get overdue maintenance count.
     */
    public function getOverdueMaintenanceCount(): int
    {
        return $this->dashboardData['overdue_maintenance_count'] ?? 0;
    }
}
