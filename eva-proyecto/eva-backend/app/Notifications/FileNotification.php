<?php

namespace App\Notifications;

use App\Events\File\FileUploaded;
use App\Events\File\FileProcessed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FileNotification extends Notification implements ShouldQueue
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
        $fileName = $this->event->fileName ?? basename($this->event->filePath);
        
        if ($this->event instanceof FileUploaded) {
            return $this->getUploadedMail($notifiable, $fileName);
        } elseif ($this->event instanceof FileProcessed) {
            return $this->getProcessedMail($notifiable, $fileName);
        }
        
        return (new MailMessage)->line('Notificación de archivo');
    }

    protected function getUploadedMail($notifiable, string $fileName): MailMessage
    {
        return (new MailMessage)
                    ->subject("Archivo Subido: {$fileName}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha subido un nuevo archivo: {$fileName}")
                    ->line("Tamaño: " . $this->formatFileSize($this->event->fileSize ?? 0))
                    ->line("Tipo: {$this->event->mimeType}")
                    ->line('El archivo está siendo procesado y validado.')
                    ->line('Gracias por usar el Sistema EVA.');
    }

    protected function getProcessedMail($notifiable, string $fileName): MailMessage
    {
        $mail = (new MailMessage)
                    ->subject("Archivo Procesado: {$fileName}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},");

        if ($this->event->wasSuccessful()) {
            $mail->line("✅ El archivo {$fileName} ha sido procesado exitosamente")
                 ->line("Tipo de procesamiento: {$this->event->processingType}")
                 ->line("Tiempo de procesamiento: {$this->event->getProcessingTime()} segundos");
        } else {
            $mail->line("❌ Error al procesar el archivo {$fileName}")
                 ->line("Tipo de procesamiento: {$this->event->processingType}")
                 ->line("Error: {$this->event->getErrorMessage()}");
        }

        return $mail->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        $baseData = [
            'file_path' => $this->event->filePath,
            'file_name' => $this->event->fileName ?? basename($this->event->filePath),
            'file_size' => $this->event->fileSize ?? 0,
            'mime_type' => $this->event->mimeType ?? null,
            'timestamp' => $this->event->timestamp,
        ];

        if ($this->event instanceof FileUploaded) {
            $baseData['type'] = 'file_uploaded';
        } elseif ($this->event instanceof FileProcessed) {
            $baseData['type'] = 'file_processed';
            $baseData['processing_type'] = $this->event->processingType;
            $baseData['success'] = $this->event->wasSuccessful();
            $baseData['processing_time'] = $this->event->getProcessingTime();
            if (!$this->event->wasSuccessful()) {
                $baseData['error_message'] = $this->event->getErrorMessage();
            }
        }

        return $baseData;
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    protected function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
