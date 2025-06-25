<?php

namespace App\Notifications;

use App\Events\Maintenance\MaintenanceScheduled;
use App\Events\Maintenance\MaintenanceCompleted;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MaintenanceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $event;

    public function __construct($event)
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
        $equipmentInfo = $this->event->getEquipmentInfo();
        $equipmentName = $equipmentInfo['name'] ?? $equipmentInfo['code'] ?? 'Equipo';
        
        if ($this->event instanceof MaintenanceScheduled) {
            return $this->getScheduledMail($notifiable, $equipmentName);
        } elseif ($this->event instanceof MaintenanceCompleted) {
            return $this->getCompletedMail($notifiable, $equipmentName);
        }
        
        return (new MailMessage)->line('Notificación de mantenimiento');
    }

    protected function getScheduledMail($notifiable, string $equipmentName): MailMessage
    {
        return (new MailMessage)
                    ->subject("Mantenimiento Programado: {$equipmentName}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha programado un mantenimiento para el equipo: {$equipmentName}")
                    ->line("Fecha programada: {$this->event->maintenance->fecha_programada}")
                    ->line("Tipo de mantenimiento: {$this->event->maintenance->tipo_mantenimiento}")
                    ->action('Ver Mantenimiento', $this->getMaintenanceUrl())
                    ->line('Gracias por usar el Sistema EVA.');
    }

    protected function getCompletedMail($notifiable, string $equipmentName): MailMessage
    {
        $mail = (new MailMessage)
                    ->subject("Mantenimiento Completado: {$equipmentName}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha completado el mantenimiento del equipo: {$equipmentName}")
                    ->line("Fecha de finalización: {$this->event->completionData['completion_date'] ?? now()}")
                    ->line("Tipo de mantenimiento: {$this->event->maintenance->tipo_mantenimiento}");

        $duration = $this->event->getMaintenanceDuration();
        if ($duration) {
            $mail->line("Duración: {$duration} horas");
        }

        if (!empty($this->event->completionData['observations'])) {
            $mail->line("Observaciones: {$this->event->completionData['observations']}");
        }

        return $mail->action('Ver Mantenimiento', $this->getMaintenanceUrl())
                    ->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        $baseData = [
            'maintenance_id' => $this->event->maintenance->id,
            'equipment_id' => $this->event->maintenance->equipo_id,
            'equipment_info' => $this->event->getEquipmentInfo(),
            'maintenance_type' => $this->event->maintenance->tipo_mantenimiento,
            'timestamp' => $this->event->timestamp,
        ];

        if ($this->event instanceof MaintenanceScheduled) {
            $baseData['type'] = 'maintenance_scheduled';
            $baseData['scheduled_date'] = $this->event->maintenance->fecha_programada;
        } elseif ($this->event instanceof MaintenanceCompleted) {
            $baseData['type'] = 'maintenance_completed';
            $baseData['completion_date'] = $this->event->completionData['completion_date'] ?? now();
            $baseData['duration_hours'] = $this->event->getMaintenanceDuration();
            $baseData['observations'] = $this->event->completionData['observations'] ?? null;
        }

        return $baseData;
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    protected function getMaintenanceUrl(): string
    {
        return config('app.frontend_url') . "/mantenimientos/{$this->event->maintenance->id}";
    }
}
