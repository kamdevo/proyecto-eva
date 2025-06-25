<?php

namespace App\Events\Maintenance;

use App\Events\BaseEvent;
use App\Models\Mantenimiento;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class MaintenanceCompleted extends BaseEvent
{
    /**
     * Maintenance instance.
     */
    public Mantenimiento $maintenance;

    /**
     * Completion details.
     */
    public array $completionDetails;

    /**
     * Create a new event instance.
     */
    public function __construct(Mantenimiento $maintenance, array $completionDetails = [], ?User $user = null, array $metadata = [])
    {
        $this->maintenance = $maintenance;
        $this->completionDetails = $completionDetails;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('maintenance.completed'),
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
        return 'maintenance.completed';
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
                'completion_date' => $this->maintenance->fecha_mantenimiento,
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
                'completion_details' => $this->completionDetails,
                'updated_at' => $this->maintenance->updated_at?->toISOString(),
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority if completed late
        if ($this->wasCompletedLate()) {
            return 'high';
        }
        
        return 'normal';
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
        
        // Add email for late completions or critical equipment
        if ($this->wasCompletedLate() || $this->isCriticalEquipment()) {
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
            $query->where('servicio_id', $this->maintenance->equipo?->servicio_id)
                  ->orWhereHas('rol', function ($q) {
                      $q->whereIn('nombre', ['Administrador', 'Supervisor']);
                  });
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();
    }

    /**
     * Check if maintenance was completed late.
     */
    public function wasCompletedLate(): bool
    {
        if (!$this->maintenance->fecha_mantenimiento || !$this->maintenance->fecha_programada) {
            return false;
        }

        $scheduledDate = \Carbon\Carbon::parse($this->maintenance->fecha_programada);
        $completionDate = \Carbon\Carbon::parse($this->maintenance->fecha_mantenimiento);
        
        return $completionDate->isAfter($scheduledDate);
    }

    /**
     * Check if equipment is critical.
     */
    public function isCriticalEquipment(): bool
    {
        // Check if equipment has high risk classification
        return $this->maintenance->equipo?->criesgo_id === 1; // Assuming 1 is high risk
    }

    /**
     * Get completion delay in hours.
     */
    public function getCompletionDelay(): ?int
    {
        if (!$this->wasCompletedLate()) {
            return null;
        }

        $scheduledDate = \Carbon\Carbon::parse($this->maintenance->fecha_programada);
        $completionDate = \Carbon\Carbon::parse($this->maintenance->fecha_mantenimiento);
        
        return $scheduledDate->diffInHours($completionDate);
    }

    /**
     * Get maintenance duration.
     */
    public function getMaintenanceDuration(): ?array
    {
        if (!isset($this->completionDetails['start_time']) || !isset($this->completionDetails['end_time'])) {
            return null;
        }

        $startTime = \Carbon\Carbon::parse($this->completionDetails['start_time']);
        $endTime = \Carbon\Carbon::parse($this->completionDetails['end_time']);
        
        return [
            'hours' => $startTime->diffInHours($endTime),
            'minutes' => $startTime->diffInMinutes($endTime) % 60,
        ];
    }
}
