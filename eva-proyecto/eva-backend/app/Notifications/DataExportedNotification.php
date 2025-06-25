<?php

namespace App\Notifications;

use App\Events\Export\DataExported;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class DataExportedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected DataExported $event;

    public function __construct(DataExported $event)
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
        $mail = (new MailMessage)
                    ->subject("Exportación de Datos: {$this->event->exportType}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha completado la exportación de datos: {$this->event->exportType}");

        if ($this->event->wasSuccessful()) {
            $mail->line("✅ Exportación completada exitosamente")
                 ->line("Registros exportados: {$this->event->getRecordCount()}")
                 ->line("Tamaño del archivo: {$this->event->getFileSizeMB()} MB")
                 ->line("Formato: {$this->event->format}");

            if ($this->event->containsSensitiveData()) {
                $mail->line("⚠️ Esta exportación contiene datos sensibles")
                     ->line("Tiempo de retención: {$this->event->getComplianceInfo()['retention_period']} días");
            }
        } else {
            $mail->line("❌ La exportación falló")
                 ->line("Error: {$this->event->getErrorMessage()}");
        }

        return $mail->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'data_exported',
            'export_type' => $this->event->exportType,
            'format' => $this->event->format,
            'success' => $this->event->wasSuccessful(),
            'record_count' => $this->event->getRecordCount(),
            'file_size_mb' => $this->event->getFileSizeMB(),
            'contains_sensitive_data' => $this->event->containsSensitiveData(),
            'compliance_info' => $this->event->getComplianceInfo(),
            'timestamp' => $this->event->timestamp,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
