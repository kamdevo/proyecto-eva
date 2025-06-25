<?php

namespace App\Notifications;

use App\Events\BaseEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class SystemEventNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * System event.
     */
    protected BaseEvent $event;

    /**
     * Create a new notification instance.
     */
    public function __construct(BaseEvent $event)
    {
        $this->event = $event;
        
        // Set queue based on priority
        $this->onQueue($this->getQueueName());
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return $this->event->getNotificationChannels();
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mailMessage = new MailMessage();
        
        // Set subject based on event priority and type
        $subject = $this->getEmailSubject();
        $mailMessage->subject($subject);
        
        // Set greeting
        $mailMessage->greeting('Hola ' . $notifiable->nombre);
        
        // Add event-specific content
        $this->addEventContent($mailMessage);
        
        // Add action button if applicable
        $actionUrl = $this->getActionUrl();
        if ($actionUrl) {
            $mailMessage->action($this->getActionText(), $actionUrl);
        }
        
        // Add footer
        $mailMessage->line('Este es un mensaje automático del Sistema EVA.')
                   ->salutation('Sistema EVA - Gestión de Equipos Médicos');
        
        return $mailMessage;
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => $this->event->getEventType(),
            'category' => $this->event->getCategory(),
            'priority' => $this->event->getPriority(),
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
            'data' => $this->event->getEventData(),
            'metadata' => [
                'user_id' => $this->event->user?->id,
                'user_name' => $this->event->user?->getFullNameAttribute(),
                'timestamp' => $this->event->timestamp,
                'ip' => $this->event->metadata['ip'] ?? null,
            ],
            'action_url' => $this->getActionUrl(),
            'action_text' => $this->getActionText(),
            'expires_at' => $this->getExpirationDate(),
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => $this->event->getEventType(),
            'category' => $this->event->getCategory(),
            'priority' => $this->event->getPriority(),
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
            'timestamp' => $this->event->timestamp,
            'action_url' => $this->getActionUrl(),
            'user' => [
                'id' => $this->event->user?->id,
                'name' => $this->event->user?->getFullNameAttribute(),
            ],
            'data' => $this->getMinimalEventData(),
        ]);
    }

    /**
     * Get email subject based on event.
     */
    protected function getEmailSubject(): string
    {
        $priority = $this->event->getPriority();
        $category = $this->event->getCategory();
        
        $prefix = match ($priority) {
            'critical' => '🚨 CRÍTICO',
            'high' => '⚠️ URGENTE',
            'normal' => '📋 NOTIFICACIÓN',
            default => '📋 INFORMACIÓN',
        };
        
        $categoryText = match ($category) {
            'equipment' => 'Equipo',
            'maintenance' => 'Mantenimiento',
            'contingency' => 'Contingencia',
            'authentication' => 'Seguridad',
            default => 'Sistema',
        };
        
        return "{$prefix}: {$categoryText} - Sistema EVA";
    }

    /**
     * Get notification title.
     */
    protected function getNotificationTitle(): string
    {
        return match ($this->event->getEventType()) {
            'equipment.created' => 'Nuevo Equipo Registrado',
            'equipment.updated' => 'Equipo Actualizado',
            'equipment.deleted' => 'Equipo Eliminado',
            'maintenance.scheduled' => 'Mantenimiento Programado',
            'maintenance.completed' => 'Mantenimiento Completado',
            'maintenance.overdue' => 'Mantenimiento Vencido',
            'contingency.created' => 'Nueva Contingencia Reportada',
            'contingency.resolved' => 'Contingencia Resuelta',
            'user.logged_in' => 'Inicio de Sesión',
            'user.logged_out' => 'Cierre de Sesión',
            default => 'Evento del Sistema',
        };
    }

    /**
     * Get notification message.
     */
    protected function getNotificationMessage(): string
    {
        $eventData = $this->event->getEventData();
        
        return match ($this->event->getEventType()) {
            'equipment.created' => $this->getEquipmentCreatedMessage($eventData),
            'equipment.updated' => $this->getEquipmentUpdatedMessage($eventData),
            'equipment.deleted' => $this->getEquipmentDeletedMessage($eventData),
            'maintenance.scheduled' => $this->getMaintenanceScheduledMessage($eventData),
            'maintenance.completed' => $this->getMaintenanceCompletedMessage($eventData),
            'contingency.created' => $this->getContingencyCreatedMessage($eventData),
            'user.logged_in' => $this->getUserLoggedInMessage($eventData),
            default => 'Se ha registrado un evento en el sistema.',
        };
    }

    /**
     * Add event-specific content to email.
     */
    protected function addEventContent(MailMessage $mailMessage): void
    {
        $eventData = $this->event->getEventData();
        
        // Add main message
        $mailMessage->line($this->getNotificationMessage());
        
        // Add event-specific details
        match ($this->event->getEventType()) {
            'equipment.created', 'equipment.updated', 'equipment.deleted' => $this->addEquipmentDetails($mailMessage, $eventData),
            'maintenance.scheduled', 'maintenance.completed' => $this->addMaintenanceDetails($mailMessage, $eventData),
            'contingency.created' => $this->addContingencyDetails($mailMessage, $eventData),
            default => null,
        };
        
        // Add timestamp
        $mailMessage->line('**Fecha:** ' . now()->format('d/m/Y H:i:s'));
        
        // Add user info if available
        if ($this->event->user) {
            $mailMessage->line('**Usuario:** ' . $this->event->user->getFullNameAttribute());
        }
    }

    /**
     * Get equipment created message.
     */
    protected function getEquipmentCreatedMessage(array $eventData): string
    {
        $equipment = $eventData['equipment'];
        return "Se ha registrado un nuevo equipo: {$equipment['code']} - {$equipment['name']} en el servicio {$equipment['service_name']}.";
    }

    /**
     * Get equipment updated message.
     */
    protected function getEquipmentUpdatedMessage(array $eventData): string
    {
        $equipment = $eventData['equipment'];
        $changedFields = $eventData['changed_fields'] ?? [];
        $fieldsText = implode(', ', $changedFields);
        
        return "El equipo {$equipment['code']} - {$equipment['name']} ha sido actualizado. Campos modificados: {$fieldsText}.";
    }

    /**
     * Get equipment deleted message.
     */
    protected function getEquipmentDeletedMessage(array $eventData): string
    {
        $equipment = $eventData['equipment'];
        return "El equipo {$equipment['code']} - {$equipment['name']} ha sido eliminado del sistema.";
    }

    /**
     * Get maintenance scheduled message.
     */
    protected function getMaintenanceScheduledMessage(array $eventData): string
    {
        $maintenance = $eventData['maintenance'];
        $equipment = $maintenance['equipment'];
        $scheduledDate = \Carbon\Carbon::parse($maintenance['scheduled_date'])->format('d/m/Y');
        
        return "Se ha programado mantenimiento para el equipo {$equipment['code']} - {$equipment['name']} el {$scheduledDate}.";
    }

    /**
     * Get maintenance completed message.
     */
    protected function getMaintenanceCompletedMessage(array $eventData): string
    {
        $maintenance = $eventData['maintenance'];
        $equipment = $maintenance['equipment'];
        
        return "Se ha completado el mantenimiento del equipo {$equipment['code']} - {$equipment['name']}.";
    }

    /**
     * Get contingency created message.
     */
    protected function getContingencyCreatedMessage(array $eventData): string
    {
        $contingency = $eventData['contingency'];
        $equipment = $contingency['equipment'];
        
        return "Se ha reportado una contingencia de impacto {$contingency['impacto']} en el equipo {$equipment['code']} - {$equipment['name']}.";
    }

    /**
     * Get user logged in message.
     */
    protected function getUserLoggedInMessage(array $eventData): string
    {
        $user = $eventData['user'];
        return "El usuario {$user['name']} ha iniciado sesión en el sistema.";
    }

    /**
     * Add equipment details to email.
     */
    protected function addEquipmentDetails(MailMessage $mailMessage, array $eventData): void
    {
        $equipment = $eventData['equipment'];
        
        $mailMessage->line('**Detalles del Equipo:**')
                   ->line('• Código: ' . $equipment['code'])
                   ->line('• Nombre: ' . $equipment['name'])
                   ->line('• Servicio: ' . ($equipment['service_name'] ?? 'N/A'))
                   ->line('• Área: ' . ($equipment['area_name'] ?? 'N/A'));
    }

    /**
     * Add maintenance details to email.
     */
    protected function addMaintenanceDetails(MailMessage $mailMessage, array $eventData): void
    {
        $maintenance = $eventData['maintenance'];
        $equipment = $maintenance['equipment'];
        
        $mailMessage->line('**Detalles del Mantenimiento:**')
                   ->line('• Equipo: ' . $equipment['code'] . ' - ' . $equipment['name'])
                   ->line('• Descripción: ' . $maintenance['description'])
                   ->line('• Fecha Programada: ' . \Carbon\Carbon::parse($maintenance['scheduled_date'])->format('d/m/Y H:i'));
    }

    /**
     * Add contingency details to email.
     */
    protected function addContingencyDetails(MailMessage $mailMessage, array $eventData): void
    {
        $contingency = $eventData['contingency'];
        $equipment = $contingency['equipment'];
        
        $mailMessage->line('**Detalles de la Contingencia:**')
                   ->line('• Equipo: ' . $equipment['code'] . ' - ' . $equipment['name'])
                   ->line('• Impacto: ' . $contingency['impacto'])
                   ->line('• Categoría: ' . $contingency['categoria'])
                   ->line('• Observación: ' . $contingency['observacion']);
    }

    /**
     * Get action URL.
     */
    protected function getActionUrl(): ?string
    {
        $eventData = $this->event->getEventData();
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        
        return match ($this->event->getEventType()) {
            'equipment.created', 'equipment.updated' => $frontendUrl . '/equipos/' . $eventData['equipment']['id'],
            'maintenance.scheduled', 'maintenance.completed' => $frontendUrl . '/mantenimientos/' . $eventData['maintenance']['id'],
            'contingency.created' => $frontendUrl . '/contingencias/' . $eventData['contingency']['id'],
            default => $frontendUrl . '/dashboard',
        };
    }

    /**
     * Get action text.
     */
    protected function getActionText(): string
    {
        return match ($this->event->getEventType()) {
            'equipment.created', 'equipment.updated' => 'Ver Equipo',
            'maintenance.scheduled', 'maintenance.completed' => 'Ver Mantenimiento',
            'contingency.created' => 'Ver Contingencia',
            default => 'Ir al Dashboard',
        };
    }

    /**
     * Get queue name based on priority.
     */
    protected function getQueueName(): string
    {
        return match ($this->event->getPriority()) {
            'critical' => 'critical-notifications',
            'high' => 'high-notifications',
            'normal' => 'notifications',
            default => 'low-notifications',
        };
    }

    /**
     * Get expiration date for notification.
     */
    protected function getExpirationDate(): ?\Carbon\Carbon
    {
        return match ($this->event->getPriority()) {
            'critical' => now()->addDays(30),
            'high' => now()->addDays(14),
            'normal' => now()->addDays(7),
            default => now()->addDays(3),
        };
    }

    /**
     * Get minimal event data for broadcast.
     */
    protected function getMinimalEventData(): array
    {
        $eventData = $this->event->getEventData();
        
        // Return only essential data for real-time updates
        return match ($this->event->getEventType()) {
            'equipment.created', 'equipment.updated' => [
                'equipment_id' => $eventData['equipment']['id'],
                'equipment_code' => $eventData['equipment']['code'],
                'service_id' => $eventData['equipment']['service_id'],
            ],
            'maintenance.scheduled', 'maintenance.completed' => [
                'maintenance_id' => $eventData['maintenance']['id'],
                'equipment_id' => $eventData['maintenance']['equipment']['id'],
                'scheduled_date' => $eventData['maintenance']['scheduled_date'],
            ],
            'contingency.created' => [
                'contingency_id' => $eventData['contingency']['id'],
                'equipment_id' => $eventData['contingency']['equipment']['id'],
                'impact' => $eventData['contingency']['impacto'],
            ],
            default => [],
        };
    }
}
