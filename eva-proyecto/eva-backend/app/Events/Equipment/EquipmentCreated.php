<?php

namespace App\Events\Equipment;

use App\Events\BaseEvent;
use App\Models\Equipo;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class EquipmentCreated extends BaseEvent
{
    /**
     * Equipment instance.
     */
    public Equipo $equipment;

    /**
     * Create a new event instance.
     */
    public function __construct(Equipo $equipment, ?User $user = null, array $metadata = [])
    {
        $this->equipment = $equipment;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('equipment.created'),
            new PrivateChannel('service.' . $this->equipment->servicio_id),
            new PrivateChannel('area.' . $this->equipment->area_id),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'equipment.created';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'equipment' => [
                'id' => $this->equipment->id,
                'code' => $this->equipment->code,
                'name' => $this->equipment->name,
                'service_id' => $this->equipment->servicio_id,
                'service_name' => $this->equipment->servicio?->name,
                'area_id' => $this->equipment->area_id,
                'area_name' => $this->equipment->area?->name,
                'type_id' => $this->equipment->tipo_id,
                'type_name' => $this->equipment->tipo?->name,
                'status_id' => $this->equipment->estadoequipo_id,
                'status_name' => $this->equipment->estadoequipo?->name,
                'owner_id' => $this->equipment->propietario_id,
                'owner_name' => $this->equipment->propietario?->nombre,
                'created_at' => $this->equipment->created_at?->toISOString(),
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        return 'normal';
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
        return ['database', 'broadcast'];
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Notify users in the same service and administrators
        return User::where(function ($query) {
            $query->where('servicio_id', $this->equipment->servicio_id)
                  ->orWhereHas('rol', function ($q) {
                      $q->where('nombre', 'Administrador');
                  });
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();
    }
}
