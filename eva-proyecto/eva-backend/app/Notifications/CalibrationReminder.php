<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

/**
 * Notificación para recordatorios de calibración
 * Envía recordatorios antes de la fecha de vencimiento
 */
class CalibrationReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $calibration;
    protected $equipment;
    protected $daysUntilDue;
    protected $reminderType;

    public function __construct($calibration, $equipment, $daysUntilDue, $reminderType = 'upcoming')
    {
        $this->calibration = $calibration;
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
            ->line("**Detalles de la Calibración:**")
            ->line("• Equipo: {$equipmentName}")
            ->line("• Código: {$this->equipment->code}")
            ->line("• Marca: {$this->equipment->marca}")
            ->line("• Modelo: {$this->equipment->modelo}")
            ->line("• Servicio: " . ($this->equipment->servicio->name ?? 'N/A'))
            ->line("• Área: " . ($this->equipment->area->name ?? 'N/A'))
            ->line("• Fecha de vencimiento: " . Carbon::parse($this->calibration->fecha_vencimiento)->format('d/m/Y'))
            ->line("• Última calibración: " . ($this->calibration->fecha_calibracion ? Carbon::parse($this->calibration->fecha_calibracion)->format('d/m/Y') : 'N/A'))
            ->line("• Proveedor: " . ($this->calibration->proveedor ?? 'Por asignar'));

        if ($this->reminderType === 'expired') {
            $mail->line("🔴 **Esta calibración está VENCIDA desde hace {$this->daysUntilDue} días.**")
                 ->line("El equipo NO debe utilizarse hasta que se renueve la calibración.");
        } elseif ($this->daysUntilDue <= 7) {
            $mail->line("🔴 **Calibración CRÍTICA - Vence en {$this->daysUntilDue} días**")
                 ->line("Es urgente programar la renovación de la calibración.");
        } elseif ($this->daysUntilDue <= 15) {
            $mail->line("🟡 **Calibración próxima a vencer - Quedan {$this->daysUntilDue} días**");
        } else {
            $mail->line("🟢 **Recordatorio - Quedan {$this->daysUntilDue} días para vencimiento**");
        }

        $mail->action('Ver Calibración', $this->getCalibrationUrl())
             ->line('Por favor, coordine la renovación de la calibración antes del vencimiento.')
             ->line('Recuerde que los equipos con calibración vencida no deben utilizarse.')
             ->line('Gracias por mantener la calidad y precisión de los equipos.');

        return $mail;
    }

    /**
     * Datos para la base de datos
     */
    public function toArray($notifiable): array
    {
        return [
            'type' => 'calibration_reminder',
            'reminder_type' => $this->reminderType,
            'calibration_id' => $this->calibration->id,
            'equipment_id' => $this->equipment->id,
            'equipment_name' => $this->equipment->name ?? $this->equipment->code,
            'equipment_code' => $this->equipment->code,
            'expiration_date' => $this->calibration->fecha_vencimiento,
            'last_calibration_date' => $this->calibration->fecha_calibracion,
            'days_until_due' => $this->daysUntilDue,
            'provider' => $this->calibration->proveedor,
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
            case 'expired':
                return "🔴 CALIBRACIÓN VENCIDA: {$equipmentName}";
            case 'critical':
                return "🔴 CALIBRACIÓN CRÍTICA: {$equipmentName}";
            case 'upcoming':
                if ($this->daysUntilDue <= 7) {
                    return "🔴 CALIBRACIÓN VENCE EN {$this->daysUntilDue} DÍAS: {$equipmentName}";
                } elseif ($this->daysUntilDue <= 15) {
                    return "🟡 CALIBRACIÓN VENCE EN {$this->daysUntilDue} DÍAS: {$equipmentName}";
                } else {
                    return "🟢 RECORDATORIO CALIBRACIÓN: {$equipmentName}";
                }
            default:
                return "Recordatorio de Calibración: {$equipmentName}";
        }
    }

    /**
     * Obtener el mensaje principal
     */
    private function getMainMessage($equipmentName): string
    {
        switch ($this->reminderType) {
            case 'expired':
                return "La calibración del equipo **{$equipmentName}** está VENCIDA desde hace {$this->daysUntilDue} días.";
            case 'critical':
                return "La calibración del equipo **{$equipmentName}** es CRÍTICA y debe renovarse inmediatamente.";
            case 'upcoming':
                if ($this->daysUntilDue <= 7) {
                    return "La calibración del equipo **{$equipmentName}** vence en {$this->daysUntilDue} días.";
                } else {
                    return "Recordatorio: La calibración del equipo **{$equipmentName}** vence en {$this->daysUntilDue} días.";
                }
            default:
                return "Recordatorio de calibración para el equipo **{$equipmentName}**.";
        }
    }

    /**
     * Obtener la prioridad de la notificación
     */
    private function getPriority(): string
    {
        if ($this->reminderType === 'expired') {
            return 'critical';
        } elseif ($this->daysUntilDue <= 7) {
            return 'high';
        } elseif ($this->daysUntilDue <= 15) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * URL de la calibración en el frontend
     */
    private function getCalibrationUrl(): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        return "{$frontendUrl}/calibraciones/{$this->calibration->id}";
    }
}
