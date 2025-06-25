<?php

namespace App\Notifications;

use App\Events\Area\AreaManaged;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AreaManagedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Area managed event.
     */
    protected AreaManaged $event;

    /**
     * Create a new notification instance.
     */
    public function __construct(AreaManaged $event)
    {
        $this->event = $event;
        $this->queue = 'notifications';
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return $this->event->getNotificationChannels();
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $areaName = $this->event->area?->name ?? $this->event->areaData['name'] ?? 'Área';
        $action = $this->getActionText();
        
        $mail = (new MailMessage)
                    ->subject("Gestión de Área: {$areaName}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha {$action} el área: {$areaName}")
                    ->line($this->event->getActionDescription());

        // Add specific information based on action
        switch ($this->event->action) {
            case 'created':
                $mail->line('Detalles del área:')
                     ->line("• Servicio: {$this->getServiceName()}")
                     ->line("• Estado: Activa")
                     ->action('Ver Área', $this->getAreaUrl());
                break;

            case 'updated':
                if (!empty($this->event->changes)) {
                    $mail->line('Cambios realizados:');
                    foreach ($this->event->changes as $field => $change) {
                        $mail->line("• {$this->getFieldLabel($field)}: {$change}");
                    }
                }
                $mail->action('Ver Área', $this->getAreaUrl());
                break;

            case 'deleted':
                $mail->line('El área ha sido eliminada del sistema.')
                     ->line("Equipos afectados: {$this->getAffectedEquipmentCount()}")
                     ->line('Los equipos han sido reasignados automáticamente.');
                break;

            case 'moved':
                $mail->line("El área ha sido movida al servicio: {$this->getServiceName()}")
                     ->line("Equipos reasignados: {$this->getAffectedEquipmentCount()}")
                     ->action('Ver Área', $this->getAreaUrl());
                break;
        }

        if ($this->event->isCriticalArea()) {
            $mail->line('⚠️ Esta es un área crítica que requiere atención especial.');
        }

        return $mail->line('Gracias por usar el Sistema EVA.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'type' => 'area_managed',
            'action' => $this->event->action,
            'area_id' => $this->event->area?->id,
            'area_name' => $this->event->area?->name ?? $this->event->areaData['name'] ?? null,
            'service_name' => $this->getServiceName(),
            'changes' => $this->event->changes,
            'is_critical' => $this->event->isCriticalArea(),
            'affected_equipment_count' => $this->getAffectedEquipmentCount(),
            'message' => $this->event->getActionDescription(),
            'timestamp' => $this->event->timestamp,
            'user' => [
                'id' => $this->event->user?->id,
                'name' => $this->event->user?->getFullNameAttribute(),
            ],
        ];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase($notifiable): array
    {
        return $this->toArray($notifiable);
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'notification' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now(),
        ]);
    }

    /**
     * Get action text in Spanish.
     */
    protected function getActionText(): string
    {
        return match ($this->event->action) {
            'created' => 'creado',
            'updated' => 'actualizado',
            'deleted' => 'eliminado',
            'activated' => 'activado',
            'deactivated' => 'desactivado',
            'moved' => 'movido',
            default => 'gestionado',
        };
    }

    /**
     * Get service name.
     */
    protected function getServiceName(): string
    {
        if ($this->event->area?->servicio) {
            return $this->event->area->servicio->name;
        }
        
        if (isset($this->event->areaData['servicio_id'])) {
            $servicio = \App\Models\Servicio::find($this->event->areaData['servicio_id']);
            return $servicio?->name ?? 'Servicio no encontrado';
        }
        
        return 'No asignado';
    }

    /**
     * Get affected equipment count.
     */
    protected function getAffectedEquipmentCount(): int
    {
        return count($this->event->getAffectedEquipmentIds());
    }

    /**
     * Get area URL.
     */
    protected function getAreaUrl(): string
    {
        $areaId = $this->event->area?->id ?? $this->event->areaData['id'] ?? null;
        return config('app.frontend_url') . "/areas/{$areaId}";
    }

    /**
     * Get field label in Spanish.
     */
    protected function getFieldLabel(string $field): string
    {
        $labels = [
            'name' => 'Nombre',
            'description' => 'Descripción',
            'servicio_id' => 'Servicio',
            'active' => 'Estado',
            'location' => 'Ubicación',
        ];

        return $labels[$field] ?? ucfirst($field);
    }

    /**
     * Determine if the notification should be sent.
     */
    public function shouldSend($notifiable): bool
    {
        // Don't send to the user who performed the action
        if ($this->event->user && $notifiable->id === $this->event->user->id) {
            return false;
        }

        // Check user notification preferences
        $preferences = $notifiable->notification_preferences ?? [];
        
        if (isset($preferences['area_management']) && !$preferences['area_management']) {
            return false;
        }

        // Always send for critical areas
        if ($this->event->isCriticalArea()) {
            return true;
        }

        // Send based on action importance
        $importantActions = ['created', 'deleted', 'moved'];
        return in_array($this->event->action, $importantActions);
    }

    /**
     * Get notification priority.
     */
    public function getPriority(): string
    {
        if ($this->event->isCriticalArea()) {
            return 'high';
        }

        return match ($this->event->action) {
            'deleted', 'moved' => 'high',
            'created', 'activated' => 'medium',
            default => 'normal',
        };
    }

    /**
     * Get notification tags for grouping.
     */
    public function getTags(): array
    {
        return [
            'area_management',
            'area_' . ($this->event->area?->id ?? 'unknown'),
            'action_' . $this->event->action,
            'priority_' . $this->getPriority(),
        ];
    }
}
