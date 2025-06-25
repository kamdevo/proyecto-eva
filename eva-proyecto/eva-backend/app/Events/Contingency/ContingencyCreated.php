<?php

namespace App\Events\Contingency;

use App\Events\BaseEvent;
use App\Models\Contingencia;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class ContingencyCreated extends BaseEvent
{
    /**
     * Contingency instance.
     */
    public Contingencia $contingency;

    /**
     * Create a new event instance.
     */
    public function __construct(Contingencia $contingency, ?User $user = null, array $metadata = [])
    {
        $this->contingency = $contingency;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('contingency.created'),
            new PrivateChannel('equipment.' . $this->contingency->equipo_id),
            new PrivateChannel('service.' . $this->contingency->equipo?->servicio_id),
            new Channel('emergency.alerts'),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'contingency.created';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'contingency' => [
                'id' => $this->contingency->id,
                'fecha' => $this->contingency->fecha,
                'observacion' => $this->contingency->observacion,
                'estado' => $this->contingency->estado,
                'impacto' => $this->contingency->impacto,
                'categoria' => $this->contingency->categoria,
                'prioridad' => $this->contingency->prioridad,
                'equipment' => [
                    'id' => $this->contingency->equipo_id,
                    'code' => $this->contingency->equipo?->code,
                    'name' => $this->contingency->equipo?->name,
                    'service_id' => $this->contingency->equipo?->servicio_id,
                    'service_name' => $this->contingency->equipo?->servicio?->name,
                    'area_id' => $this->contingency->equipo?->area_id,
                    'area_name' => $this->contingency->equipo?->area?->name,
                ],
                'reporter' => [
                    'id' => $this->contingency->usuario_id,
                    'name' => $this->contingency->usuario?->getFullNameAttribute(),
                ],
                'created_at' => $this->contingency->created_at?->toISOString(),
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // Priority based on impact and category
        if ($this->contingency->impacto === 'Alto' || $this->contingency->prioridad === 'Urgente') {
            return 'critical';
        }
        
        if ($this->contingency->impacto === 'Medio' || $this->contingency->prioridad === 'Alta') {
            return 'high';
        }
        
        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'contingency';
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
        $channels = ['database', 'broadcast'];
        
        // Add email and SMS for critical contingencies
        if ($this->getPriority() === 'critical') {
            $channels[] = 'mail';
            // $channels[] = 'sms'; // If SMS is configured
        }
        
        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Notify based on priority and service
        $query = User::where('estado', true)->where('active', 'true');
        
        if ($this->getPriority() === 'critical') {
            // Notify all administrators and supervisors for critical contingencies
            $query->whereHas('rol', function ($q) {
                $q->whereIn('nombre', ['Administrador', 'Supervisor', 'Técnico']);
            });
        } else {
            // Notify users in the same service and administrators
            $query->where(function ($q) {
                $q->where('servicio_id', $this->contingency->equipo?->servicio_id)
                  ->orWhereHas('rol', function ($roleQuery) {
                      $roleQuery->whereIn('nombre', ['Administrador', 'Supervisor']);
                  });
            });
        }
        
        return $query->get();
    }

    /**
     * Check if contingency is critical.
     */
    public function isCritical(): bool
    {
        return $this->getPriority() === 'critical';
    }

    /**
     * Check if contingency affects critical equipment.
     */
    public function affectsCriticalEquipment(): bool
    {
        // Check if equipment has high risk classification
        return $this->contingency->equipo?->criesgo_id === 1; // Assuming 1 is high risk
    }

    /**
     * Get estimated resolution time.
     */
    public function getEstimatedResolutionTime(): ?int
    {
        // Return estimated hours based on impact and category
        return match ($this->contingency->impacto) {
            'Alto' => 2,
            'Medio' => 8,
            'Bajo' => 24,
            default => 24,
        };
    }

    /**
     * Check if contingency requires immediate attention.
     */
    public function requiresImmediateAttention(): bool
    {
        return $this->contingency->prioridad === 'Urgente' || 
               $this->contingency->impacto === 'Alto' ||
               $this->affectsCriticalEquipment();
    }
}
