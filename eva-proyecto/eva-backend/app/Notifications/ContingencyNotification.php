<?php

namespace App\Notifications;

use App\Events\Contingency\ContingencyCreated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ContingencyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected ContingencyCreated $event;
    protected string $notificationType;

    public function __construct(ContingencyCreated $event, string $notificationType = 'standard')
    {
        $this->event = $event;
        $this->notificationType = $notificationType;
        $this->queue = $this->event->isCritical() ? 'critical-notifications' : 'notifications';
    }

    public function via($notifiable): array
    {
        $channels = $this->event->getNotificationChannels();
        
        // Add SMS for critical contingencies
        if ($this->event->isCritical() && $this->notificationType === 'emergency') {
            $channels[] = 'sms';
        }
        
        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        $equipmentInfo = $this->event->getEquipmentInfo();
        $equipmentName = $equipmentInfo['name'] ?? $equipmentInfo['code'] ?? 'Equipo';
        
        $subject = match ($this->notificationType) {
            'emergency' => "🚨 EMERGENCIA - Contingencia Crítica: {$equipmentName}",
            'escalation' => "⚠️ ESCALAMIENTO - Contingencia: {$equipmentName}",
            default => "Contingencia Creada: {$equipmentName}",
        };
        
        $mail = (new MailMessage)
                    ->subject($subject)
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},");

        if ($this->notificationType === 'emergency') {
            $mail->line("🚨 ALERTA DE EMERGENCIA 🚨")
                 ->line("Se ha creado una contingencia crítica que requiere respuesta inmediata.");
        } elseif ($this->notificationType === 'escalation') {
            $mail->line("⚠️ ESCALAMIENTO DE CONTINGENCIA ⚠️")
                 ->line("Una contingencia ha sido escalada a nivel gerencial.");
        } else {
            $mail->line("Se ha creado una nueva contingencia en el sistema.");
        }

        $mail->line("Equipo afectado: {$equipmentName}")
             ->line("Categoría: {$this->event->contingency->categoria}")
             ->line("Prioridad: {$this->event->getPriority()}")
             ->line("Nivel de impacto: {$this->event->getImpactLevel()}");

        if ($this->event->contingency->observacion) {
            $mail->line("Descripción: {$this->event->contingency->observacion}");
        }

        if ($this->event->isCritical()) {
            $mail->line("🚨 CRÍTICO - Este equipo es crítico para las operaciones");
        }

        if ($this->event->requiresEmergencyResponse()) {
            $mail->line("⚡ RESPUESTA DE EMERGENCIA ACTIVADA");
        }

        $actionText = match ($this->notificationType) {
            'emergency' => 'Responder Emergencia',
            'escalation' => 'Revisar Escalamiento',
            default => 'Ver Contingencia',
        };

        return $mail->action($actionText, $this->getContingencyUrl())
                    ->line('Tiempo de respuesta es crítico.')
                    ->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'contingency_created',
            'notification_type' => $this->notificationType,
            'contingency_id' => $this->event->contingency->id,
            'equipment_id' => $this->event->contingency->equipo_id,
            'equipment_info' => $this->event->getEquipmentInfo(),
            'category' => $this->event->contingency->categoria,
            'priority' => $this->event->getPriority(),
            'impact_level' => $this->event->getImpactLevel(),
            'is_critical' => $this->event->isCritical(),
            'requires_emergency_response' => $this->event->requiresEmergencyResponse(),
            'description' => $this->event->contingency->observacion,
            'timestamp' => $this->event->timestamp,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'notification' => $this->toArray($notifiable),
            'urgency' => $this->event->isCritical() ? 'critical' : 'normal',
            'sound' => $this->event->isCritical() ? 'emergency' : 'default',
        ]);
    }

    protected function getContingencyUrl(): string
    {
        return config('app.frontend_url') . "/contingencias/{$this->event->contingency->id}";
    }

    public function shouldSend($notifiable): bool
    {
        // Always send emergency and escalation notifications
        if (in_array($this->notificationType, ['emergency', 'escalation'])) {
            return true;
        }

        // Check user preferences for standard notifications
        $preferences = $notifiable->notification_preferences ?? [];
        return $preferences['contingency_notifications'] ?? true;
    }
}
