<?php

namespace App\Events\Area;

use App\Events\BaseEvent;
use App\Models\Area;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class AreaManaged extends BaseEvent
{
    /**
     * Area instance.
     */
    public ?Area $area;

    /**
     * Management action.
     */
    public string $action;

    /**
     * Area data (for deleted areas).
     */
    public ?array $areaData;

    /**
     * Changes made (for updates).
     */
    public array $changes;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $action,
        ?Area $area = null,
        ?array $areaData = null,
        array $changes = [],
        ?User $user = null,
        array $metadata = []
    ) {
        $this->action = $action;
        $this->area = $area;
        $this->areaData = $areaData;
        $this->changes = $changes;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = array_merge(parent::broadcastOn(), [
            new Channel('area.managed'),
            new Channel('areas.updates'),
        ]);

        if ($this->area) {
            $channels[] = new PrivateChannel('area.' . $this->area->id);
            if ($this->area->servicio_id) {
                $channels[] = new PrivateChannel('service.' . $this->area->servicio_id);
            }
        }

        return $channels;
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'area.' . $this->action;
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        $data = [
            'action' => $this->action,
            'changes' => $this->changes,
        ];

        if ($this->area) {
            $data['area'] = [
                'id' => $this->area->id,
                'name' => $this->area->name,
                'description' => $this->area->description,
                'service_id' => $this->area->servicio_id,
                'service_name' => $this->area->servicio?->name,
                'equipment_count' => $this->getEquipmentCount(),
                'active' => $this->area->active ?? true,
            ];
        } elseif ($this->areaData) {
            $data['area'] = $this->areaData;
        }

        return $data;
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority for deletion or if area has many equipment
        if ($this->action === 'deleted' || $this->hasHighEquipmentCount()) {
            return 'high';
        }

        // High priority if area status changed
        if ($this->action === 'updated' && isset($this->changes['active'])) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'area';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Notify for creation, deletion, or status changes
        return in_array($this->action, ['created', 'deleted']) ||
               ($this->action === 'updated' && $this->hasSignificantChanges());
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for deletion or high impact changes
        if ($this->action === 'deleted' || $this->hasHighEquipmentCount()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        $serviceId = $this->area?->servicio_id ?? $this->areaData['servicio_id'] ?? null;

        if (!$serviceId) {
            // Notify administrators if no service specified
            return User::whereHas('rol', function ($query) {
                $query->where('nombre', 'Administrador');
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->get();
        }

        // Notify users in the same service and administrators
        return User::where(function ($query) use ($serviceId) {
            $query->where('servicio_id', $serviceId)
                  ->orWhereHas('rol', function ($q) {
                      $q->whereIn('nombre', ['Administrador', 'Supervisor']);
                  });
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();
    }

    /**
     * Get equipment count in this area.
     */
    protected function getEquipmentCount(): int
    {
        if (!$this->area) {
            return 0;
        }

        return $this->area->equipos()->count();
    }

    /**
     * Check if area has high equipment count.
     */
    protected function hasHighEquipmentCount(): bool
    {
        return $this->getEquipmentCount() > 10;
    }

    /**
     * Check if changes are significant.
     */
    protected function hasSignificantChanges(): bool
    {
        $significantFields = ['name', 'active', 'servicio_id'];
        
        foreach ($significantFields as $field) {
            if (array_key_exists($field, $this->changes)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if area was activated/deactivated.
     */
    public function statusChanged(): bool
    {
        return array_key_exists('active', $this->changes);
    }

    /**
     * Check if area was moved to different service.
     */
    public function serviceChanged(): bool
    {
        return array_key_exists('servicio_id', $this->changes);
    }

    /**
     * Get previous service ID.
     */
    public function getPreviousServiceId(): ?int
    {
        if (!$this->serviceChanged()) {
            return null;
        }

        // This would need to be passed from the controller
        return $this->changes['previous_servicio_id'] ?? null;
    }

    /**
     * Get affected equipment IDs.
     */
    public function getAffectedEquipmentIds(): array
    {
        if (!$this->area) {
            return [];
        }

        return $this->area->equipos()->pluck('id')->toArray();
    }

    /**
     * Check if area is critical (has critical equipment).
     */
    public function isCriticalArea(): bool
    {
        if (!$this->area) {
            return false;
        }

        return $this->area->equipos()
                         ->where('criesgo_id', 1) // Assuming 1 is high risk
                         ->exists();
    }

    /**
     * Get area statistics.
     */
    public function getAreaStatistics(): array
    {
        if (!$this->area) {
            return [];
        }

        return [
            'total_equipment' => $this->area->equipos()->count(),
            'active_equipment' => $this->area->equipos()->where('status', 1)->count(),
            'critical_equipment' => $this->area->equipos()->where('criesgo_id', 1)->count(),
            'pending_maintenance' => $this->area->equipos()
                                              ->where('estado_mantenimiento', 1)
                                              ->count(),
        ];
    }

    /**
     * Get action description.
     */
    public function getActionDescription(): string
    {
        $areaName = $this->area?->name ?? $this->areaData['name'] ?? 'Área';
        
        return match ($this->action) {
            'created' => "Área '{$areaName}' creada",
            'updated' => "Área '{$areaName}' actualizada",
            'deleted' => "Área '{$areaName}' eliminada",
            'activated' => "Área '{$areaName}' activada",
            'deactivated' => "Área '{$areaName}' desactivada",
            'moved' => "Área '{$areaName}' movida a otro servicio",
            default => "Acción realizada en área '{$areaName}'",
        };
    }
}
