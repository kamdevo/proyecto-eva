<?php

namespace App\Notifications;

use App\Events\Administrator\AdminActionPerformed;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AdminActionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Admin action event.
     */
    protected AdminActionPerformed $event;

    /**
     * Create a new notification instance.
     */
    public function __construct(AdminActionPerformed $event)
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
        
        // Set subject based on priority
        $subject = $this->getEmailSubject();
        $mailMessage->subject($subject);
        
        // Set greeting
        $mailMessage->greeting('Hola ' . $notifiable->nombre);
        
        // Add main message
        $mailMessage->line($this->getMainMessage());
        
        // Add action details
        $this->addActionDetails($mailMessage);
        
        // Add security warning for critical actions
        if ($this->event->isCriticalAction()) {
            $mailMessage->line('⚠️ **ATENCIÓN**: Esta es una acción crítica que puede afectar la seguridad del sistema.');
        }
        
        // Add action button if applicable
        $actionUrl = $this->getActionUrl();
        if ($actionUrl) {
            $mailMessage->action('Ver Detalles', $actionUrl);
        }
        
        // Add footer
        $mailMessage->line('Si no reconoce esta actividad, contacte inmediatamente al administrador del sistema.')
                   ->salutation('Sistema EVA - Administración');
        
        return $mailMessage;
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'admin_action',
            'action' => $this->event->action,
            'priority' => $this->event->getPriority(),
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
            'action_data' => [
                'action' => $this->event->action,
                'target_type' => $this->event->targetType,
                'target_id' => $this->event->targetId,
                'description' => $this->event->getActionDescription(),
            ],
            'performed_by' => [
                'id' => $this->event->user?->id,
                'name' => $this->event->user?->getFullNameAttribute(),
                'role' => $this->event->user?->rol?->nombre,
            ],
            'metadata' => [
                'timestamp' => $this->event->timestamp,
                'ip' => $this->event->metadata['ip'] ?? null,
                'affects_security' => $this->event->affectsSecurity(),
                'affects_system_config' => $this->event->affectsSystemConfig(),
            ],
            'action_url' => $this->getActionUrl(),
            'expires_at' => $this->getExpirationDate(),
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'admin_action',
            'action' => $this->event->action,
            'priority' => $this->event->getPriority(),
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
            'timestamp' => $this->event->timestamp,
            'performed_by' => [
                'id' => $this->event->user?->id,
                'name' => $this->event->user?->getFullNameAttribute(),
            ],
            'is_critical' => $this->event->isCriticalAction(),
            'affects_security' => $this->event->affectsSecurity(),
        ]);
    }

    /**
     * Get email subject.
     */
    protected function getEmailSubject(): string
    {
        $priority = $this->event->getPriority();
        
        $prefix = match ($priority) {
            'critical' => '🚨 CRÍTICO',
            'high' => '⚠️ IMPORTANTE',
            'normal' => '📋 NOTIFICACIÓN',
            default => '📋 INFORMACIÓN',
        };
        
        return "{$prefix}: Acción Administrativa - Sistema EVA";
    }

    /**
     * Get notification title.
     */
    protected function getNotificationTitle(): string
    {
        return match ($this->event->action) {
            'user_created' => 'Nuevo Usuario Creado',
            'user_updated' => 'Usuario Actualizado',
            'user_deleted' => 'Usuario Eliminado',
            'user_role_changed' => 'Rol de Usuario Modificado',
            'permissions_modified' => 'Permisos Modificados',
            'system_config_changed' => 'Configuración del Sistema Modificada',
            'security_settings_modified' => 'Configuración de Seguridad Modificada',
            'bulk_delete' => 'Eliminación Masiva Realizada',
            'bulk_update' => 'Actualización Masiva Realizada',
            'data_export' => 'Exportación de Datos Realizada',
            'database_reset' => 'Base de Datos Reiniciada',
            'backup_restored' => 'Respaldo Restaurado',
            'system_maintenance' => 'Mantenimiento del Sistema',
            default => 'Acción Administrativa Realizada',
        };
    }

    /**
     * Get main notification message.
     */
    protected function getMainMessage(): string
    {
        $userName = $this->event->user?->getFullNameAttribute() ?? 'Usuario desconocido';
        $action = $this->event->getActionDescription();
        
        return "El administrador {$userName} ha realizado la siguiente acción: {$action}";
    }

    /**
     * Get notification message for database.
     */
    protected function getNotificationMessage(): string
    {
        return $this->event->getActionDescription();
    }

    /**
     * Add action details to email.
     */
    protected function addActionDetails(MailMessage $mailMessage): void
    {
        $mailMessage->line('**Detalles de la Acción:**')
                   ->line('• Acción: ' . $this->event->getActionDescription())
                   ->line('• Realizada por: ' . ($this->event->user?->getFullNameAttribute() ?? 'Usuario desconocido'))
                   ->line('• Rol: ' . ($this->event->user?->rol?->nombre ?? 'Desconocido'))
                   ->line('• Fecha: ' . now()->format('d/m/Y H:i:s'))
                   ->line('• Prioridad: ' . ucfirst($this->event->getPriority()));

        // Add IP address if available
        if ($this->event->metadata['ip'] ?? null) {
            $mailMessage->line('• Dirección IP: ' . $this->event->metadata['ip']);
        }

        // Add target information if available
        if ($this->event->targetType && $this->event->targetId) {
            $mailMessage->line('• Objetivo: ' . $this->event->targetType . ' (ID: ' . $this->event->targetId . ')');
        }

        // Add specific details based on action type
        $this->addSpecificActionDetails($mailMessage);
    }

    /**
     * Add specific action details.
     */
    protected function addSpecificActionDetails(MailMessage $mailMessage): void
    {
        $actionData = $this->event->actionData;

        match ($this->event->action) {
            'user_created' => $this->addUserCreatedDetails($mailMessage, $actionData),
            'user_deleted' => $this->addUserDeletedDetails($mailMessage, $actionData),
            'user_role_changed' => $this->addRoleChangedDetails($mailMessage, $actionData),
            'system_config_changed' => $this->addConfigChangedDetails($mailMessage, $actionData),
            'bulk_delete' => $this->addBulkDeleteDetails($mailMessage, $actionData),
            'data_export' => $this->addDataExportDetails($mailMessage, $actionData),
            default => null,
        };
    }

    /**
     * Add user created details.
     */
    protected function addUserCreatedDetails(MailMessage $mailMessage, array $actionData): void
    {
        if (isset($actionData['email'])) {
            $mailMessage->line('• Email del nuevo usuario: ' . $actionData['email']);
        }
        if (isset($actionData['role'])) {
            $mailMessage->line('• Rol asignado: ' . $actionData['role']);
        }
    }

    /**
     * Add user deleted details.
     */
    protected function addUserDeletedDetails(MailMessage $mailMessage, array $actionData): void
    {
        if (isset($actionData['email'])) {
            $mailMessage->line('• Email del usuario eliminado: ' . $actionData['email']);
        }
        if (isset($actionData['reason'])) {
            $mailMessage->line('• Motivo: ' . $actionData['reason']);
        }
    }

    /**
     * Add role changed details.
     */
    protected function addRoleChangedDetails(MailMessage $mailMessage, array $actionData): void
    {
        if (isset($actionData['previous_role']) && isset($actionData['new_role'])) {
            $mailMessage->line('• Rol anterior: ' . $actionData['previous_role'])
                       ->line('• Nuevo rol: ' . $actionData['new_role']);
        }
    }

    /**
     * Add config changed details.
     */
    protected function addConfigChangedDetails(MailMessage $mailMessage, array $actionData): void
    {
        if (isset($actionData['config_key'])) {
            $mailMessage->line('• Configuración modificada: ' . $actionData['config_key']);
        }
        if (isset($actionData['previous_value']) && isset($actionData['new_value'])) {
            $mailMessage->line('• Valor anterior: ' . $actionData['previous_value'])
                       ->line('• Nuevo valor: ' . $actionData['new_value']);
        }
    }

    /**
     * Add bulk delete details.
     */
    protected function addBulkDeleteDetails(MailMessage $mailMessage, array $actionData): void
    {
        if (isset($actionData['entity_type'])) {
            $mailMessage->line('• Tipo de entidad: ' . $actionData['entity_type']);
        }
        if (isset($actionData['deleted_count'])) {
            $mailMessage->line('• Registros eliminados: ' . $actionData['deleted_count']);
        }
    }

    /**
     * Add data export details.
     */
    protected function addDataExportDetails(MailMessage $mailMessage, array $actionData): void
    {
        if (isset($actionData['export_type'])) {
            $mailMessage->line('• Tipo de exportación: ' . $actionData['export_type']);
        }
        if (isset($actionData['record_count'])) {
            $mailMessage->line('• Registros exportados: ' . $actionData['record_count']);
        }
    }

    /**
     * Get action URL.
     */
    protected function getActionUrl(): ?string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        
        return match ($this->event->action) {
            'user_created', 'user_updated', 'user_deleted', 'user_role_changed' => $frontendUrl . '/admin/users',
            'system_config_changed', 'security_settings_modified' => $frontendUrl . '/admin/settings',
            'bulk_delete', 'bulk_update' => $frontendUrl . '/admin/bulk-operations',
            'data_export' => $frontendUrl . '/admin/exports',
            'database_reset', 'backup_restored' => $frontendUrl . '/admin/system',
            default => $frontendUrl . '/admin/dashboard',
        };
    }

    /**
     * Get queue name based on priority.
     */
    protected function getQueueName(): string
    {
        return match ($this->event->getPriority()) {
            'critical' => 'critical-events',
            'high' => 'high-priority',
            'normal' => 'notifications',
            default => 'notifications',
        };
    }

    /**
     * Get expiration date for notification.
     */
    protected function getExpirationDate(): ?\Carbon\Carbon
    {
        return match ($this->event->getPriority()) {
            'critical' => now()->addDays(90), // Keep critical actions longer
            'high' => now()->addDays(30),
            'normal' => now()->addDays(14),
            default => now()->addDays(7),
        };
    }

    /**
     * Determine if notification should be sent immediately.
     */
    public function shouldSendImmediately(): bool
    {
        return $this->event->isCriticalAction();
    }

    /**
     * Get notification priority for sorting.
     */
    public function getPriority(): string
    {
        return $this->event->getPriority();
    }

    /**
     * Get notification category.
     */
    public function getCategory(): string
    {
        return 'administration';
    }
}
