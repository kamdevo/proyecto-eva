<?php

namespace App\Events\Equipment;

use App\Events\BaseEvent;
use App\Models\Equipo;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class EquipmentDeleted extends BaseEvent
{
    /**
     * Equipment data before deletion.
     */
    public array $equipmentData;

    /**
     * Deletion reason.
     */
    public ?string $reason;

    /**
     * Create a new event instance.
     */
    public function __construct(array $equipmentData, ?string $reason = null, ?User $user = null, array $metadata = [])
    {
        $this->equipmentData = $equipmentData;
        $this->reason = $reason;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('equipment.deleted'),
            new PrivateChannel('service.' . $this->equipmentData['servicio_id']),
            new PrivateChannel('area.' . ($this->equipmentData['area_id'] ?? 'unknown')),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'equipment.deleted';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'equipment' => $this->equipmentData,
            'reason' => $this->reason,
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        return 'high';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'equipment';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        return true;
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        return ['database', 'mail', 'broadcast'];
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Notify administrators and supervisors
        return User::whereHas('rol', function ($query) {
            $query->whereIn('nombre', ['Administrador', 'Supervisor']);
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();
    }
}
