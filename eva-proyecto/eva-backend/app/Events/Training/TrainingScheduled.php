<?php

namespace App\Events\Training;

use App\Events\BaseEvent;
use App\Models\Capacitacion;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class TrainingScheduled extends BaseEvent
{
    /**
     * Training instance.
     */
    public Capacitacion $training;

    /**
     * Create a new event instance.
     */
    public function __construct(Capacitacion $training, ?User $user = null, array $metadata = [])
    {
        $this->training = $training;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('training.scheduled'),
            new PrivateChannel('equipment.' . $this->training->equipo_id),
            new PrivateChannel('service.' . $this->training->equipo?->servicio_id),
            new Channel('training.announcements'),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'training.scheduled';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'training' => [
                'id' => $this->training->id,
                'titulo' => $this->training->titulo,
                'descripcion' => $this->training->descripcion,
                'fecha_programada' => $this->training->fecha_programada,
                'duracion_horas' => $this->training->duracion_horas,
                'modalidad' => $this->training->modalidad,
                'estado' => $this->training->estado,
                'equipment' => [
                    'id' => $this->training->equipo_id,
                    'code' => $this->training->equipo?->code,
                    'name' => $this->training->equipo?->name,
                    'service_id' => $this->training->equipo?->servicio_id,
                    'service_name' => $this->training->equipo?->servicio?->name,
                ],
                'instructor' => [
                    'id' => $this->training->instructor_id,
                    'name' => $this->training->instructor?->nombre,
                ],
                'created_at' => $this->training->created_at?->toISOString(),
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority if scheduled soon or mandatory training
        $scheduledDate = \Carbon\Carbon::parse($this->training->fecha_programada);
        $daysDiff = now()->diffInDays($scheduledDate, false);
        
        if ($daysDiff <= 3 || $this->training->es_obligatoria) {
            return 'high';
        }
        
        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'training';
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
        
        // Add email for mandatory or urgent training
        if ($this->training->es_obligatoria || $this->getPriority() === 'high') {
            $channels[] = 'mail';
        }
        
        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Notify users in the same service
        return User::where('servicio_id', $this->training->equipo?->servicio_id)
                  ->where('estado', true)
                  ->where('active', 'true')
                  ->get();
    }

    /**
     * Check if training is mandatory.
     */
    public function isMandatory(): bool
    {
        return $this->training->es_obligatoria ?? false;
    }

    /**
     * Check if training is urgent.
     */
    public function isUrgent(): bool
    {
        $scheduledDate = \Carbon\Carbon::parse($this->training->fecha_programada);
        return now()->diffInDays($scheduledDate, false) <= 1;
    }

    /**
     * Get training duration in hours.
     */
    public function getDurationHours(): ?int
    {
        return $this->training->duracion_horas;
    }

    /**
     * Get training modality.
     */
    public function getModality(): ?string
    {
        return $this->training->modalidad;
    }
}
