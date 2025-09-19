<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

/**
 * Notificación para recordatorios de mantenimiento preventivo
 * Envía recordatorios antes de la fecha programada
 */
class PreventiveMaintenanceReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $maintenance;
    protected $equipment;
    protected $daysUntilDue;
    protected $reminderType;

    public function __construct($maintenance, $equipment, $daysUntilDue, $reminderType = 'upcoming')
    {
        $this->maintenance = $maintenance;
        $this->equipment = $equipment;
        $this->daysUntilDue = $daysUntilDue;
        $this->reminderType = $reminderType;
        $this->queue = 'notifications';
    }

    /**
     * Canales de notificación
     */
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Mensaje de correo electrónico
     */
    public function toMail($notifiable): MailMessage
    {
        $equipmentName = $this->equipment->name ?? $this->equipment->code ?? 'Equipo';
        $subject = $this->getSubject($equipmentName);
        
        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting("Hola {$notifiable->nombre} {$notifiable->apellido},")
            ->line($this->getMainMessage($equipmentName))
            ->line("**Detalles del Mantenimiento:**")
            ->line("• Equipo: {$equipmentName}")
            ->line("• Código: {$this->equipment->code}")
            ->line("• Marca: {$this->equipment->marca}")
            ->line("• Modelo: {$this->equipment->modelo}")
            ->line("• Servicio: " . ($this->equipment->servicio->name ?? 'N/A'))
            ->line("• Área: " . ($this->equipment->area->name ?? 'N/A'))
            ->line("• Fecha programada: " . Carbon::parse($this->maintenance->fecha_programada)->format('d/m/Y'))
            ->line("• Responsable: " . ($this->maintenance->responsable ?? 'Por asignar'));

        if ($this->reminderType === 'overdue') {
            $mail->line("⚠️ **Este mantenimiento está VENCIDO desde hace {$this->daysUntilDue} días.**")
                 ->line("Es necesario programar y ejecutar el mantenimiento lo antes posible.");
        } elseif ($this->daysUntilDue <= 1) {
            $mail->line("🔴 **Mantenimiento URGENTE - Vence hoy o mañana**");
        } elseif ($this->daysUntilDue <= 3) {
            $mail->line("🟡 **Mantenimiento próximo - Quedan {$this->daysUntilDue} días**");
        } else {
            $mail->line("🟢 **Recordatorio - Quedan {$this->daysUntilDue} días**");
        }

        $mail->action('Ver Mantenimiento', $this->getMaintenanceUrl())
             ->line('Por favor, coordine la ejecución del mantenimiento en la fecha programada.')
             ->line('Gracias por mantener los equipos en óptimas condiciones.');

        return $mail;
    }

    /**
     * Datos para la base de datos
     */
    public function toArray($notifiable): array
    {
        return [
            'type' => 'preventive_maintenance_reminder',
            'reminder_type' => $this->reminderType,
            'maintenance_id' => $this->maintenance->id,
            'equipment_id' => $this->equipment->id,
            'equipment_name' => $this->equipment->name ?? $this->equipment->code,
            'equipment_code' => $this->equipment->code,
            'scheduled_date' => $this->maintenance->fecha_programada,
            'days_until_due' => $this->daysUntilDue,
            'responsible' => $this->maintenance->responsable,
            'service' => $this->equipment->servicio->name ?? null,
            'area' => $this->equipment->area->name ?? null,
            'priority' => $this->getPriority(),
            'timestamp' => now(),
        ];
    }

    /**
     * Obtener el asunto del correo
     */
    private function getSubject($equipmentName): string
    {
        switch ($this->reminderType) {
            case 'overdue':
                return "🔴 MANTENIMIENTO VENCIDO: {$equipmentName}";
            case 'urgent':
                return "🔴 MANTENIMIENTO URGENTE: {$equipmentName}";
            case 'upcoming':
                if ($this->daysUntilDue <= 1) {
                    return "🔴 MANTENIMIENTO HOY/MAÑANA: {$equipmentName}";
                } elseif ($this->daysUntilDue <= 3) {
                    return "🟡 MANTENIMIENTO EN {$this->daysUntilDue} DÍAS: {$equipmentName}";
                } else {
                    return "🟢 RECORDATORIO MANTENIMIENTO: {$equipmentName}";
                }
            default:
                return "Recordatorio de Mantenimiento: {$equipmentName}";
        }
    }

    /**
     * Obtener el mensaje principal
     */
    private function getMainMessage($equipmentName): string
    {
        switch ($this->reminderType) {
            case 'overdue':
                return "El mantenimiento preventivo del equipo **{$equipmentName}** está VENCIDO desde hace {$this->daysUntilDue} días.";
            case 'urgent':
                return "El mantenimiento preventivo del equipo **{$equipmentName}** es URGENTE.";
            case 'upcoming':
                if ($this->daysUntilDue <= 1) {
                    return "El mantenimiento preventivo del equipo **{$equipmentName}** está programado para HOY o MAÑANA.";
                } else {
                    return "El mantenimiento preventivo del equipo **{$equipmentName}** está programado en {$this->daysUntilDue} días.";
                }
            default:
                return "Recordatorio de mantenimiento preventivo para el equipo **{$equipmentName}**.";
        }
    }

    /**
     * Obtener la prioridad de la notificación
     */
    private function getPriority(): string
    {
        if ($this->reminderType === 'overdue') {
            return 'critical';
        } elseif ($this->daysUntilDue <= 1) {
            return 'high';
        } elseif ($this->daysUntilDue <= 3) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * URL del mantenimiento en el frontend
     */
    private function getMaintenanceUrl(): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        return "{$frontendUrl}/mantenimientos/{$this->maintenance->id}";
    }
}
