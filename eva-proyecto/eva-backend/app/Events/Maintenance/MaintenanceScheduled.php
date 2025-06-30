<?php

namespace App\Events\Maintenance;

use App\Events\BaseEvent;
use App\Models\Mantenimiento;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class MaintenanceScheduled extends BaseEvent
{
    /**
     * Maintenance instance.
     */
    public Mantenimiento $maintenance;

    /**
     * Create a new event instance.
     */
    public function __construct(Mantenimiento $maintenance, ?User $user = null, array $metadata = [])
    {
        $this->maintenance = $maintenance;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('maintenance.scheduled'),
            new PrivateChannel('equipment.' . $this->maintenance->equipo_id),
            new PrivateChannel('service.' . $this->maintenance->equipo?->servicio_id),
            new PrivateChannel('provider.' . $this->maintenance->proveedor_mantenimiento_id),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'maintenance.scheduled';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'maintenance' => [
                'id' => $this->maintenance->id,
                'description' => $this->maintenance->description,
                'scheduled_date' => $this->maintenance->fecha_programada,
                'status' => $this->maintenance->status,
                'equipment' => [
                    'id' => $this->maintenance->equipo_id,
                    'code' => $this->maintenance->equipo?->code,
                    'name' => $this->maintenance->equipo?->name,
                    'service_id' => $this->maintenance->equipo?->servicio_id,
                    'service_name' => $this->maintenance->equipo?->servicio?->name,
                ],
                'provider' => [
                    'id' => $this->maintenance->proveedor_mantenimiento_id,
                    'name' => $this->maintenance->proveedor?->name,
                ],
                'technician' => [
                    'id' => $this->maintenance->tecnico_id,
                    'name' => $this->maintenance->tecnico?->name,
                ],
                'created_at' => $this->maintenance->created_at?->toISOString(),
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority if scheduled for today or tomorrow
        $scheduledDate = \Carbon\Carbon::parse($this->maintenance->fecha_programada);
        $daysDiff = now()->diffInDays($scheduledDate, false);
        
        return $daysDiff <= 1 ? 'high' : 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'maintenance';
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
        
        // Add email for urgent maintenance
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
        // Notify users in the same service, technicians, and administrators
        return User::where(function ($query) {
            $query->where('servicio_id', $this->maintenance->equipo?->servicio_id)
                  ->orWhereHas('rol', function ($q) {
                      $q->whereIn('nombre', ['Administrador', 'Supervisor', 'Técnico']);
                  });
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();
    }

    /**
     * Check if maintenance is urgent.
     */
    public function isUrgent(): bool
    {
        $scheduledDate = \Carbon\Carbon::parse($this->maintenance->fecha_programada);
        return now()->diffInHours($scheduledDate, false) <= 24;
    }

    /**
     * Check if maintenance is overdue.
     */
    public function isOverdue(): bool
    {
        $scheduledDate = \Carbon\Carbon::parse($this->maintenance->fecha_programada);
        return $scheduledDate->isPast();
    }
}
