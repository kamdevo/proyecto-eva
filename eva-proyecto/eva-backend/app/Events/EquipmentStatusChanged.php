<?php

namespace App\Events;

use App\Models\Equipo;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EquipmentStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Equipment instance.
     */
    public Equipo $equipment;

    /**
     * Previous status.
     */
    public string $previousStatus;

    /**
     * New status.
     */
    public string $newStatus;

    /**
     * User who made the change.
     */
    public ?User $user;

    /**
     * Create a new event instance.
     */
    public function __construct(Equipo $equipment, string $previousStatus, string $newStatus, ?User $user = null)
    {
        $this->equipment = $equipment;
        $this->previousStatus = $previousStatus;
        $this->newStatus = $newStatus;
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('equipment.' . $this->equipment->id),
            new PrivateChannel('service.' . $this->equipment->servicio_id),
            new Channel('equipment-updates'),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'equipment_id' => $this->equipment->id,
            'equipment_code' => $this->equipment->code,
            'equipment_name' => $this->equipment->name,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->newStatus,
            'service_id' => $this->equipment->servicio_id,
            'area_id' => $this->equipment->area_id,
            'changed_by' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->getFullNameAttribute(),
            ] : null,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'equipment.status.changed';
    }
}
