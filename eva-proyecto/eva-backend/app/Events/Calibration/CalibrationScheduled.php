<?php

namespace App\Events\Calibration;

use App\Events\BaseEvent;
use App\Models\Calibracion;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class CalibrationScheduled extends BaseEvent
{
    /**
     * Calibration instance.
     */
    public Calibracion $calibration;

    /**
     * Create a new event instance.
     */
    public function __construct(Calibracion $calibration, ?User $user = null, array $metadata = [])
    {
        $this->calibration = $calibration;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('calibration.scheduled'),
            new PrivateChannel('equipment.' . $this->calibration->equipo_id),
            new PrivateChannel('service.' . $this->calibration->equipo?->servicio_id),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'calibration.scheduled';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'calibration' => [
                'id' => $this->calibration->id,
                'fecha_programada' => $this->calibration->fecha_programada,
                'tipo_calibracion' => $this->calibration->tipo_calibracion,
                'estado' => $this->calibration->estado,
                'equipment' => [
                    'id' => $this->calibration->equipo_id,
                    'code' => $this->calibration->equipo?->code,
                    'name' => $this->calibration->equipo?->name,
                    'service_id' => $this->calibration->equipo?->servicio_id,
                    'service_name' => $this->calibration->equipo?->servicio?->name,
                ],
                'provider' => [
                    'id' => $this->calibration->proveedor_id,
                    'name' => $this->calibration->proveedor?->nombre,
                ],
                'created_at' => $this->calibration->created_at?->toISOString(),
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority if scheduled soon or for critical equipment
        $scheduledDate = \Carbon\Carbon::parse($this->calibration->fecha_programada);
        $daysDiff = now()->diffInDays($scheduledDate, false);
        
        if ($daysDiff <= 1 || $this->isCriticalEquipment()) {
            return 'high';
        }
        
        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'calibration';
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
        
        // Add email for urgent calibrations
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
            $query->where('servicio_id', $this->calibration->equipo?->servicio_id)
                  ->orWhereHas('rol', function ($q) {
                      $q->whereIn('nombre', ['Administrador', 'Supervisor', 'Técnico']);
                  });
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();
    }

    /**
     * Check if equipment is critical.
     */
    protected function isCriticalEquipment(): bool
    {
        return $this->calibration->equipo?->criesgo_id === 1;
    }

    /**
     * Check if calibration is urgent.
     */
    public function isUrgent(): bool
    {
        $scheduledDate = \Carbon\Carbon::parse($this->calibration->fecha_programada);
        return now()->diffInHours($scheduledDate, false) <= 24;
    }
}
