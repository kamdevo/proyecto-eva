<?php

namespace App\Notifications;

use App\Events\Calibration\CalibrationScheduled;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class CalibrationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected CalibrationScheduled $event;

    public function __construct(CalibrationScheduled $event)
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
        
        $mail = (new MailMessage)
                    ->subject("Calibración Programada: {$equipmentName}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha programado una calibración para el equipo: {$equipmentName}")
                    ->line("Fecha programada: {$this->event->calibration->fecha_programada}")
                    ->line("Tipo de calibración: {$this->event->calibration->tipo_calibracion}");

        if ($this->event->isCriticalCalibration()) {
            $mail->line("🚨 CRÍTICO - Esta calibración es para un equipo crítico");
        }

        if ($this->event->calibration->proveedor_id) {
            $mail->line("Proveedor asignado: {$this->getProviderName()}");
        }

        return $mail->action('Ver Calibración', $this->getCalibrationUrl())
                    ->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'calibration_scheduled',
            'calibration_id' => $this->event->calibration->id,
            'equipment_id' => $this->event->calibration->equipo_id,
            'equipment_info' => $this->event->getEquipmentInfo(),
            'scheduled_date' => $this->event->calibration->fecha_programada,
            'calibration_type' => $this->event->calibration->tipo_calibracion,
            'is_critical' => $this->event->isCriticalCalibration(),
            'provider_id' => $this->event->calibration->proveedor_id,
            'timestamp' => $this->event->timestamp,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    protected function getProviderName(): string
    {
        if ($this->event->calibration->proveedor_id) {
            $provider = \App\Models\ProveedorMantenimiento::find($this->event->calibration->proveedor_id);
            return $provider?->name ?? 'Proveedor no encontrado';
        }
        return 'Sin asignar';
    }

    protected function getCalibrationUrl(): string
    {
        return config('app.frontend_url') . "/calibraciones/{$this->event->calibration->id}";
    }
}
