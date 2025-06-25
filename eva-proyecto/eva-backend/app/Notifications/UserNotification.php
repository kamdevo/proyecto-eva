<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class UserNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
        $this->queue = 'notifications';
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $mail = (new MailMessage)
                    ->subject($this->data['title'] ?? 'Notificación del Sistema EVA')
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line($this->data['message'] ?? 'Tienes una nueva notificación.');

        // Handle different notification types
        switch ($this->data['type'] ?? 'general') {
            case 'welcome':
                $mail->line('Te damos la bienvenida al Sistema de Gestión de Equipos Médicos EVA.')
                     ->line('Aquí podrás gestionar equipos, mantenimientos, calibraciones y más.')
                     ->action('Explorar Sistema', config('app.frontend_url') . '/dashboard');
                break;

            case 'security_alert':
                $mail->line('⚠️ Se ha detectado actividad de seguridad en tu cuenta.')
                     ->line('Si no fuiste tú, por favor cambia tu contraseña inmediatamente.')
                     ->action('Cambiar Contraseña', config('app.frontend_url') . '/profile/security');
                break;

            case 'account_update':
                $mail->line('Tu información de cuenta ha sido actualizada.')
                     ->action('Ver Perfil', config('app.frontend_url') . '/profile');
                break;

            case 'system_maintenance':
                $mail->line('El sistema estará en mantenimiento programado.')
                     ->line('Fecha: ' . ($this->data['maintenance_date'] ?? 'Por definir'))
                     ->line('Duración estimada: ' . ($this->data['duration'] ?? 'Por definir'));
                break;

            default:
                if (isset($this->data['action_url']) && isset($this->data['action_text'])) {
                    $mail->action($this->data['action_text'], $this->data['action_url']);
                }
                break;
        }

        return $mail->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => $this->data['type'] ?? 'general',
            'title' => $this->data['title'] ?? 'Notificación',
            'message' => $this->data['message'] ?? '',
            'data' => $this->data['data'] ?? [],
            'action_url' => $this->data['action_url'] ?? null,
            'action_text' => $this->data['action_text'] ?? null,
            'timestamp' => now(),
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'notification' => $this->toArray($notifiable),
            'priority' => $this->data['priority'] ?? 'normal',
        ]);
    }
}
