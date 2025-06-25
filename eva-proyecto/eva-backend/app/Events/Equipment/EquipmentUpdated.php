<?php

namespace App\Events\Equipment;

use App\Events\BaseEvent;
use App\Models\Equipo;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class EquipmentUpdated extends BaseEvent
{
    /**
     * Equipment instance.
     */
    public Equipo $equipment;

    /**
     * Original equipment data.
     */
    public array $originalData;

    /**
     * Changed fields.
     */
    public array $changes;

    /**
     * Create a new event instance.
     */
    public function __construct(Equipo $equipment, array $originalData, array $changes, ?User $user = null, array $metadata = [])
    {
        $this->equipment = $equipment;
        $this->originalData = $originalData;
        $this->changes = $changes;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('equipment.updated'),
            new PrivateChannel('equipment.' . $this->equipment->id),
            new PrivateChannel('service.' . $this->equipment->servicio_id),
            new PrivateChannel('area.' . $this->equipment->area_id),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'equipment.updated';
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
                'status_id' => $this->equipment->estadoequipo_id,
                'status_name' => $this->equipment->estadoequipo?->name,
                'updated_at' => $this->equipment->updated_at?->toISOString(),
            ],
            'changes' => $this->changes,
            'original_data' => $this->originalData,
            'changed_fields' => array_keys($this->changes),
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority if critical fields changed
        $criticalFields = ['estadoequipo_id', 'servicio_id', 'area_id', 'status'];
        
        foreach ($criticalFields as $field) {
            if (array_key_exists($field, $this->changes)) {
                return 'high';
            }
        }
        
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
        // Notify if critical fields changed
        $criticalFields = ['estadoequipo_id', 'servicio_id', 'area_id', 'status'];
        
        foreach ($criticalFields as $field) {
            if (array_key_exists($field, $this->changes)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];
        
        // Add email for critical changes
        if ($this->getPriority() === 'high') {
            $channels[] = 'mail';
        }
        
        return $channels;
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
                      $q->whereIn('nombre', ['Administrador', 'Supervisor']);
                  });
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();
    }

    /**
     * Check if status changed.
     */
    public function statusChanged(): bool
    {
        return array_key_exists('estadoequipo_id', $this->changes);
    }

    /**
     * Check if location changed.
     */
    public function locationChanged(): bool
    {
        return array_key_exists('servicio_id', $this->changes) || 
               array_key_exists('area_id', $this->changes);
    }

    /**
     * Get status change details.
     */
    public function getStatusChange(): ?array
    {
        if (!$this->statusChanged()) {
            return null;
        }

        return [
            'previous_status_id' => $this->originalData['estadoequipo_id'] ?? null,
            'new_status_id' => $this->changes['estadoequipo_id'],
            'previous_status_name' => $this->getPreviousStatusName(),
            'new_status_name' => $this->equipment->estadoequipo?->name,
        ];
    }

    /**
     * Get previous status name.
     */
    protected function getPreviousStatusName(): ?string
    {
        $previousStatusId = $this->originalData['estadoequipo_id'] ?? null;
        
        if (!$previousStatusId) {
            return null;
        }

        $status = \App\Models\EstadoEquipo::find($previousStatusId);
        return $status?->name;
    }
}
