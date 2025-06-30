<?php

namespace App\Events\Administrator;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class AdminActionPerformed extends BaseEvent
{
    /**
     * Action performed.
     */
    public string $action;

    /**
     * Target entity type.
     */
    public ?string $targetType;

    /**
     * Target entity ID.
     */
    public ?int $targetId;

    /**
     * Action data.
     */
    public array $actionData;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        array $actionData = [],
        ?User $user = null,
        array $metadata = []
    ) {
        $this->action = $action;
        $this->targetType = $targetType;
        $this->targetId = $targetId;
        $this->actionData = $actionData;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('admin.actions'),
            new PrivateChannel('admin.user.' . $this->user?->id),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'admin.action.performed';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'action' => $this->action,
            'target_type' => $this->targetType,
            'target_id' => $this->targetId,
            'action_data' => $this->actionData,
            'performed_by' => [
                'id' => $this->user?->id,
                'name' => $this->user?->getFullNameAttribute(),
                'role' => $this->user?->rol?->nombre,
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // Critical actions get high priority
        $criticalActions = [
            'user_deleted',
            'system_config_changed',
            'security_settings_modified',
            'bulk_delete',
            'database_reset',
            'backup_restored',
        ];

        if (in_array($this->action, $criticalActions)) {
            return 'critical';
        }

        // High priority actions
        $highPriorityActions = [
            'user_created',
            'user_role_changed',
            'permissions_modified',
            'system_maintenance',
            'data_export',
            'bulk_update',
        ];

        if (in_array($this->action, $highPriorityActions)) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'administration';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        return $this->getPriority() !== 'normal';
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for critical actions
        if ($this->getPriority() === 'critical') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Notify all administrators for critical actions
        if ($this->getPriority() === 'critical') {
            return User::whereHas('rol', function ($query) {
                $query->where('nombre', 'Administrador');
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->where('id', '!=', $this->user?->id) // Don't notify the user who performed the action
            ->get();
        }

        // Notify supervisors and administrators for high priority actions
        if ($this->getPriority() === 'high') {
            return User::whereHas('rol', function ($query) {
                $query->whereIn('nombre', ['Administrador', 'Supervisor']);
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->where('id', '!=', $this->user?->id)
            ->get();
        }

        return collect();
    }

    /**
     * Check if action is critical.
     */
    public function isCriticalAction(): bool
    {
        return $this->getPriority() === 'critical';
    }

    /**
     * Check if action affects security.
     */
    public function affectsSecurity(): bool
    {
        $securityActions = [
            'user_role_changed',
            'permissions_modified',
            'security_settings_modified',
            'password_policy_changed',
            'login_attempts_reset',
        ];

        return in_array($this->action, $securityActions);
    }

    /**
     * Check if action affects system configuration.
     */
    public function affectsSystemConfig(): bool
    {
        $configActions = [
            'system_config_changed',
            'maintenance_mode_toggled',
            'backup_settings_changed',
            'notification_settings_changed',
        ];

        return in_array($this->action, $configActions);
    }

    /**
     * Get action description.
     */
    public function getActionDescription(): string
    {
        return match ($this->action) {
            'user_created' => 'Nuevo usuario creado',
            'user_updated' => 'Usuario actualizado',
            'user_deleted' => 'Usuario eliminado',
            'user_role_changed' => 'Rol de usuario modificado',
            'permissions_modified' => 'Permisos modificados',
            'system_config_changed' => 'Configuración del sistema modificada',
            'security_settings_modified' => 'Configuración de seguridad modificada',
            'bulk_delete' => 'Eliminación masiva realizada',
            'bulk_update' => 'Actualización masiva realizada',
            'data_export' => 'Exportación de datos realizada',
            'database_reset' => 'Base de datos reiniciada',
            'backup_restored' => 'Respaldo restaurado',
            'system_maintenance' => 'Mantenimiento del sistema',
            'maintenance_mode_toggled' => 'Modo de mantenimiento activado/desactivado',
            default => 'Acción administrativa realizada',
        };
    }
}
