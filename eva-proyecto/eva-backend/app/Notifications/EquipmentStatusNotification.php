<?php

namespace App\Notifications;

use App\Events\EquipmentStatusChanged;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class EquipmentStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Equipment status change event.
     */
    protected EquipmentStatusChanged $event;

    /**
     * Create a new notification instance.
     */
    public function __construct(EquipmentStatusChanged $event)
    {
        $this->event = $event;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Add email for critical status changes
        if ($this->isCriticalStatus($this->event->newStatus)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $equipment = $this->event->equipment;
        $subject = $this->isCriticalStatus($this->event->newStatus) 
            ? 'ALERTA: Cambio de Estado Crítico en Equipo'
            : 'Cambio de Estado en Equipo';

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hola ' . $notifiable->nombre)
            ->line('Se ha registrado un cambio de estado en el siguiente equipo:')
            ->line('**Código:** ' . $equipment->code)
            ->line('**Nombre:** ' . $equipment->name)
            ->line('**Servicio:** ' . ($equipment->servicio?->name ?? 'N/A'))
            ->line('**Área:** ' . ($equipment->area?->name ?? 'N/A'))
            ->line('**Estado Anterior:** ' . $this->event->previousStatus)
            ->line('**Estado Actual:** ' . $this->event->newStatus)
            ->when($this->event->user, function ($mail) {
                return $mail->line('**Cambiado por:** ' . $this->event->user->getFullNameAttribute());
            })
            ->line('**Fecha:** ' . now()->format('d/m/Y H:i:s'))
            ->action('Ver Equipo', url('/equipos/' . $equipment->id))
            ->line($this->getStatusMessage())
            ->salutation('Sistema EVA - Gestión de Equipos');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        $equipment = $this->event->equipment;

        return [
            'type' => 'equipment_status_change',
            'title' => 'Cambio de Estado en Equipo',
            'message' => $this->getDatabaseMessage(),
            'equipment' => [
                'id' => $equipment->id,
                'code' => $equipment->code,
                'name' => $equipment->name,
                'service_name' => $equipment->servicio?->name,
                'area_name' => $equipment->area?->name,
            ],
            'status_change' => [
                'previous' => $this->event->previousStatus,
                'new' => $this->event->newStatus,
                'is_critical' => $this->isCriticalStatus($this->event->newStatus),
            ],
            'changed_by' => $this->event->user ? [
                'id' => $this->event->user->id,
                'name' => $this->event->user->getFullNameAttribute(),
            ] : null,
            'timestamp' => now()->toISOString(),
            'action_url' => '/equipos/' . $equipment->id,
        ];
    }

    /**
     * Check if status is critical.
     */
    protected function isCriticalStatus(string $status): bool
    {
        return in_array($status, ['Fuera de Servicio', 'En Reparación', 'Dañado']);
    }

    /**
     * Get status-specific message.
     */
    protected function getStatusMessage(): string
    {
        return match ($this->event->newStatus) {
            'Fuera de Servicio' => 'Este equipo requiere atención inmediata ya que está fuera de servicio.',
            'En Reparación' => 'El equipo está actualmente en proceso de reparación.',
            'Dañado' => 'ATENCIÓN: El equipo presenta daños y requiere revisión urgente.',
            'Operativo' => 'El equipo ha vuelto a estado operativo.',
            'En Mantenimiento' => 'El equipo está programado para mantenimiento.',
            default => 'Se ha actualizado el estado del equipo.',
        };
    }

    /**
     * Get database message.
     */
    protected function getDatabaseMessage(): string
    {
        $equipment = $this->event->equipment;
        
        return sprintf(
            'El equipo %s (%s) ha cambiado de estado de "%s" a "%s"',
            $equipment->code,
            $equipment->name,
            $this->event->previousStatus,
            $this->event->newStatus
        );
    }

    /**
     * Get notification priority.
     */
    public function getPriority(): string
    {
        return $this->isCriticalStatus($this->event->newStatus) ? 'high' : 'normal';
    }

    /**
     * Get notification category.
     */
    public function getCategory(): string
    {
        return 'equipment';
    }

    /**
     * Determine if notification should be sent immediately.
     */
    public function shouldSendImmediately(): bool
    {
        return $this->isCriticalStatus($this->event->newStatus);
    }
}
