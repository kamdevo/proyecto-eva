<?php

namespace App\Notifications;

use App\Events\Training\TrainingScheduled;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TrainingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected TrainingScheduled $event;

    public function __construct(TrainingScheduled $event)
    {
        $this->event = $event;
        $this->queue = 'notifications';
    }

    public function via($notifiable): array
    {
        return $this->event->getNotificationChannels();
    }

    public function toMail($notifiable): MailMessage
    {
        $trainingType = $this->event->training->tipo_capacitacion;
        
        $mail = (new MailMessage)
                    ->subject("Capacitación Programada: {$trainingType}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha programado una capacitación: {$trainingType}")
                    ->line("Fecha programada: {$this->event->training->fecha_programada}");

        if ($this->event->isMandatoryTraining()) {
            $mail->line("📋 OBLIGATORIO - Esta capacitación es obligatoria");
        }

        if ($this->event->isCertificationTraining()) {
            $mail->line("🏆 CERTIFICACIÓN - Esta capacitación otorga certificación");
        }

        if ($this->event->isEquipmentRelated()) {
            $mail->line("🔧 Relacionada con equipos específicos");
        }

        return $mail->action('Ver Capacitación', $this->getTrainingUrl())
                    ->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'training_scheduled',
            'training_id' => $this->event->training->id,
            'user_id' => $this->event->training->usuario_id,
            'training_type' => $this->event->training->tipo_capacitacion,
            'scheduled_date' => $this->event->training->fecha_programada,
            'is_mandatory' => $this->event->isMandatoryTraining(),
            'is_certification' => $this->event->isCertificationTraining(),
            'is_equipment_related' => $this->event->isEquipmentRelated(),
            'timestamp' => $this->event->timestamp,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    protected function getTrainingUrl(): string
    {
        return config('app.frontend_url') . "/capacitaciones/{$this->event->training->id}";
    }
}
