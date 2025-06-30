<?php

namespace App\Notifications;

use App\Events\Service\ServiceManaged;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ServiceManagedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Service managed event.
     */
    protected ServiceManaged $event;

    /**
     * Create a new notification instance.
     */
    public function __construct(ServiceManaged $event)
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
        $serviceName = $this->event->service?->name ?? $this->event->serviceData['name'] ?? 'Servicio';
        $action = $this->getActionText();
        
        $mail = (new MailMessage)
                    ->subject("Gestión de Servicio: {$serviceName}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("Se ha {$action} el servicio: {$serviceName}")
                    ->line($this->event->getActionDescription());

        // Add impact assessment
        $impact = $this->event->getImpactAssessment();
        if ($impact['impact_level'] !== 'low') {
            $mail->line("⚠️ Nivel de impacto: " . strtoupper($impact['impact_level']));
        }

        // Add specific information based on action
        switch ($this->event->action) {
            case 'created':
                $mail->line('El nuevo servicio está disponible para asignación de equipos y usuarios.')
                     ->action('Ver Servicio', $this->getServiceUrl());
                break;

            case 'updated':
                if (!empty($this->event->changes)) {
                    $mail->line('Cambios realizados:');
                    foreach ($this->event->changes as $field => $change) {
                        $mail->line("• {$this->getFieldLabel($field)}: {$change}");
                    }
                }
                $mail->action('Ver Servicio', $this->getServiceUrl());
                break;

            case 'deleted':
                $resources = $impact['affected_resources'];
                $mail->line('El servicio ha sido eliminado del sistema.')
                     ->line("Recursos afectados:")
                     ->line("• Equipos: {$resources['equipment']}")
                     ->line("• Áreas: {$resources['areas']}")
                     ->line("• Usuarios: {$resources['users']}")
                     ->line('Los recursos han sido reasignados automáticamente.');
                break;

            case 'activated':
                $mail->line('El servicio ha sido reactivado y está disponible.')
                     ->action('Ver Servicio', $this->getServiceUrl());
                break;

            case 'deactivated':
                $mail->line('El servicio ha sido desactivado temporalmente.')
                     ->line('Los recursos asignados mantienen su configuración.');
                break;
        }

        // Add performance metrics if available
        $performance = $this->event->getPerformanceMetrics();
        if (!empty($performance)) {
            $mail->line('Métricas de rendimiento:')
                 ->line("• Disponibilidad de equipos: {$performance['equipment_availability']}%")
                 ->line("• Cumplimiento de mantenimiento: {$performance['maintenance_compliance']}%");
        }

        // Add recommendations if any
        $recommendations = $impact['recommendations'] ?? [];
        if (!empty($recommendations)) {
            $mail->line('Recomendaciones:');
            foreach ($recommendations as $recommendation) {
                $mail->line("• {$recommendation}");
            }
        }

        if ($this->event->isCriticalService()) {
            $mail->line('🚨 Este es un servicio crítico que requiere atención inmediata.');
        }

        return $mail->line('Gracias por usar el Sistema EVA.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'type' => 'service_managed',
            'action' => $this->event->action,
            'service_id' => $this->event->service?->id,
            'service_name' => $this->event->service?->name ?? $this->event->serviceData['name'] ?? null,
            'changes' => $this->event->changes,
            'is_critical' => $this->event->isCriticalService(),
            'impact_assessment' => $this->event->getImpactAssessment(),
            'performance_metrics' => $this->event->getPerformanceMetrics(),
            'statistics' => $this->event->getServiceStatistics(),
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
            default => 'gestionado',
        };
    }

    /**
     * Get service URL.
     */
    protected function getServiceUrl(): string
    {
        $serviceId = $this->event->service?->id ?? $this->event->serviceData['id'] ?? null;
        return config('app.frontend_url') . "/servicios/{$serviceId}";
    }

    /**
     * Get field label in Spanish.
     */
    protected function getFieldLabel(string $field): string
    {
        $labels = [
            'name' => 'Nombre',
            'description' => 'Descripción',
            'code' => 'Código',
            'active' => 'Estado',
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
        
        if (isset($preferences['service_management']) && !$preferences['service_management']) {
            return false;
        }

        // Always send for critical services
        if ($this->event->isCriticalService()) {
            return true;
        }

        // Send based on impact level
        $impact = $this->event->getImpactAssessment();
        return in_array($impact['impact_level'], ['high', 'critical']);
    }

    /**
     * Get notification priority.
     */
    public function getPriority(): string
    {
        if ($this->event->isCriticalService()) {
            return 'critical';
        }

        $impact = $this->event->getImpactAssessment();
        return match ($impact['impact_level']) {
            'critical' => 'critical',
            'high' => 'high',
            'medium' => 'medium',
            default => 'normal',
        };
    }

    /**
     * Get notification tags for grouping.
     */
    public function getTags(): array
    {
        return [
            'service_management',
            'service_' . ($this->event->service?->id ?? 'unknown'),
            'action_' . $this->event->action,
            'priority_' . $this->getPriority(),
            'impact_' . $this->event->getImpactAssessment()['impact_level'],
        ];
    }
}
