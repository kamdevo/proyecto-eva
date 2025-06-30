<?php

namespace App\Notifications;

use App\Events\Ticket\TicketManaged;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TicketManagedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected TicketManaged $event;

    public function __construct(TicketManaged $event)
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
        $ticketId = $this->event->ticketData['id'] ?? 'N/A';
        $title = $this->event->ticketData['title'] ?? 'Ticket';
        $action = $this->getActionText();
        
        $mail = (new MailMessage)
                    ->subject("Ticket #{$ticketId}: {$action}")
                    ->greeting("Hola {$notifiable->getFullNameAttribute()},")
                    ->line("El ticket #{$ticketId} ha sido {$action}")
                    ->line("Título: {$title}");

        if ($this->event->isUrgentTicket()) {
            $mail->line("🚨 URGENTE - Este ticket requiere atención inmediata");
        }

        switch ($this->event->action) {
            case 'created':
                $mail->line("Prioridad: {$this->event->ticketData['priority'] ?? 'Normal'}");
                     ->line("Asignado a: {$this->event->getCurrentAssignee() ?? 'Sin asignar'}");
                break;
            case 'assigned':
                $mail->line("Asignado a: {$this->event->getCurrentAssignee()}");
                break;
            case 'status_changed':
                $mail->line("Estado anterior: {$this->event->getPreviousStatus()}")
                     ->line("Estado actual: {$this->event->getCurrentStatus()}");
                break;
            case 'escalated':
                $mail->line("⚠️ El ticket ha sido escalado")
                     ->line("Razón: {$this->event->ticketData['escalation_reason'] ?? 'No especificada'}");
                break;
        }

        return $mail->action('Ver Ticket', $this->getTicketUrl())
                    ->line('Gracias por usar el Sistema EVA.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'ticket_managed',
            'action' => $this->event->action,
            'ticket_id' => $this->event->ticketData['id'] ?? null,
            'ticket_title' => $this->event->ticketData['title'] ?? null,
            'priority' => $this->event->ticketData['priority'] ?? 'normal',
            'status' => $this->event->getCurrentStatus(),
            'assigned_to' => $this->event->getCurrentAssignee(),
            'is_urgent' => $this->event->isUrgentTicket(),
            'is_overdue' => $this->event->isOverdueTicket(),
            'age_hours' => $this->event->getTicketAgeHours(),
            'timestamp' => $this->event->timestamp,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    protected function getActionText(): string
    {
        return match ($this->event->action) {
            'created' => 'creado',
            'assigned' => 'asignado',
            'reassigned' => 'reasignado',
            'status_changed' => 'actualizado',
            'escalated' => 'escalado',
            'resolved' => 'resuelto',
            'closed' => 'cerrado',
            'reopened' => 'reabierto',
            default => 'gestionado',
        };
    }

    protected function getTicketUrl(): string
    {
        $ticketId = $this->event->ticketData['id'] ?? null;
        return config('app.frontend_url') . "/tickets/{$ticketId}";
    }
}
