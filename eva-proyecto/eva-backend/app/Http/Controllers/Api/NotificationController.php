<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Models\Usuario;
use App\Notifications\PreventiveMaintenanceReminder;
use App\Notifications\CalibrationReminder;
use Carbon\Carbon;

/**
 * Controlador para gestión de notificaciones y preferencias de usuario
 */
class NotificationController extends Controller
{
    /**
     * Obtener preferencias de notificación del usuario autenticado
     */
    public function getPreferences(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Obtener preferencias actuales o crear por defecto
            $preferences = DB::table('notification_preferences')
                ->where('user_id', $user->id)
                ->first();

            if (!$preferences) {
                // Crear preferencias por defecto
                $defaultPreferences = [
                    'user_id' => $user->id,
                    'maintenance_reminders' => true,
                    'calibration_reminders' => true,
                    'contingency_alerts' => true,
                    'equipment_status_changes' => true,
                    'export_notifications' => true,
                    'reminder_frequency' => 'daily',
                    'email_format' => 'html',
                    'send_time' => '08:00',
                    'created_at' => now(),
                    'updated_at' => now()
                ];

                DB::table('notification_preferences')->insert($defaultPreferences);
                $preferences = (object) $defaultPreferences;
            }

            return ResponseFormatter::success($preferences, 'Preferencias obtenidas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al obtener preferencias: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar preferencias de notificación del usuario
     */
    public function updatePreferences(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'maintenance_reminders' => 'boolean',
                'calibration_reminders' => 'boolean',
                'contingency_alerts' => 'boolean',
                'equipment_status_changes' => 'boolean',
                'export_notifications' => 'boolean',
                'reminder_frequency' => 'in:daily,weekly,monthly',
                'email_format' => 'in:html,text',
                'send_time' => 'date_format:H:i'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Datos de preferencias inválidos', 422);
            }

            $user = auth()->user();
            $data = $request->only([
                'maintenance_reminders',
                'calibration_reminders', 
                'contingency_alerts',
                'equipment_status_changes',
                'export_notifications',
                'reminder_frequency',
                'email_format',
                'send_time'
            ]);
            $data['updated_at'] = now();

            // Actualizar o crear preferencias
            DB::table('notification_preferences')
                ->updateOrInsert(
                    ['user_id' => $user->id],
                    $data
                );

            return ResponseFormatter::success($data, 'Preferencias actualizadas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al actualizar preferencias: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Enviar correo de prueba
     */
    public function sendTestEmail(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'type' => 'required|in:maintenance,calibration,general',
                'email' => 'nullable|email'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Parámetros inválidos', 422);
            }

            $user = auth()->user();
            $email = $request->email ?? $user->email;
            $type = $request->type;

            if (!$email) {
                return ResponseFormatter::error(null, 'No se encontró dirección de correo', 400);
            }

            // Crear datos de prueba según el tipo
            switch ($type) {
                case 'maintenance':
                    $this->sendTestMaintenanceEmail($email, $user);
                    break;
                case 'calibration':
                    $this->sendTestCalibrationEmail($email, $user);
                    break;
                case 'general':
                    $this->sendTestGeneralEmail($email, $user);
                    break;
            }

            return ResponseFormatter::success(null, "Correo de prueba enviado a {$email}");

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al enviar correo de prueba: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de notificaciones
     */
    public function getStats(Request $request)
    {
        try {
            $user = auth()->user();
            $days = $request->get('days', 30);
            $startDate = Carbon::now()->subDays($days);

            // Estadísticas de notificaciones enviadas
            $stats = [
                'total_sent' => DB::table('notification_logs')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                    
                'by_type' => DB::table('notification_logs')
                    ->where('created_at', '>=', $startDate)
                    ->select('type', DB::raw('count(*) as count'))
                    ->groupBy('type')
                    ->get(),
                    
                'delivery_rate' => $this->calculateDeliveryRate($startDate),
                
                'user_notifications' => DB::table('notifications')
                    ->where('notifiable_id', $user->id)
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                    
                'unread_count' => DB::table('notifications')
                    ->where('notifiable_id', $user->id)
                    ->whereNull('read_at')
                    ->count(),
                    
                'recent_notifications' => DB::table('notifications')
                    ->where('notifiable_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return ResponseFormatter::success($stats, 'Estadísticas obtenidas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Marcar notificaciones como leídas
     */
    public function markAsRead(Request $request)
    {
        try {
            $user = auth()->user();
            $notificationIds = $request->get('notification_ids', []);

            if (empty($notificationIds)) {
                // Marcar todas como leídas
                DB::table('notifications')
                    ->where('notifiable_id', $user->id)
                    ->whereNull('read_at')
                    ->update(['read_at' => now()]);
                    
                $message = 'Todas las notificaciones marcadas como leídas';
            } else {
                // Marcar específicas como leídas
                DB::table('notifications')
                    ->where('notifiable_id', $user->id)
                    ->whereIn('id', $notificationIds)
                    ->update(['read_at' => now()]);
                    
                $message = 'Notificaciones marcadas como leídas';
            }

            return ResponseFormatter::success(null, $message);

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al marcar notificaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Desuscribirse de notificaciones (con token)
     */
    public function unsubscribe(Request $request)
    {
        try {
            $token = $request->get('token');
            
            if (!$token) {
                return ResponseFormatter::error(null, 'Token de desuscripción requerido', 400);
            }

            // Decodificar token para obtener user_id
            $userId = $this->decodeUnsubscribeToken($token);
            
            if (!$userId) {
                return ResponseFormatter::error(null, 'Token de desuscripción inválido', 400);
            }

            // Desactivar todas las notificaciones para el usuario
            DB::table('notification_preferences')
                ->updateOrInsert(
                    ['user_id' => $userId],
                    [
                        'maintenance_reminders' => false,
                        'calibration_reminders' => false,
                        'contingency_alerts' => false,
                        'equipment_status_changes' => false,
                        'export_notifications' => false,
                        'updated_at' => now()
                    ]
                );

            return ResponseFormatter::success(null, 'Te has desuscrito exitosamente de todas las notificaciones');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al desuscribirse: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Enviar correo de prueba de mantenimiento
     */
    private function sendTestMaintenanceEmail($email, $user)
    {
        $equipment = (object) [
            'id' => 1,
            'name' => 'Equipo de Prueba',
            'code' => 'TEST-001',
            'marca' => 'Marca Test',
            'modelo' => 'Modelo Test',
            'servicio' => (object) ['name' => 'Servicio Test'],
            'area' => (object) ['name' => 'Área Test']
        ];

        $maintenance = (object) [
            'id' => 1,
            'fecha_programada' => Carbon::now()->addDays(3)->format('Y-m-d'),
            'responsable' => 'Proveedor Test'
        ];

        $testUser = (object) [
            'email' => $email,
            'nombre' => $user->nombre ?? 'Usuario',
            'apellido' => $user->apellido ?? 'Test'
        ];

        $testUser->notify(new PreventiveMaintenanceReminder(
            $maintenance,
            $equipment,
            3,
            'upcoming'
        ));
    }

    /**
     * Enviar correo de prueba de calibración
     */
    private function sendTestCalibrationEmail($email, $user)
    {
        $equipment = (object) [
            'id' => 1,
            'name' => 'Equipo de Calibración Test',
            'code' => 'CAL-001',
            'marca' => 'Marca Test',
            'modelo' => 'Modelo Test',
            'servicio' => (object) ['name' => 'Servicio Test'],
            'area' => (object) ['name' => 'Área Test']
        ];

        $calibration = (object) [
            'id' => 1,
            'fecha_vencimiento' => Carbon::now()->addDays(7)->format('Y-m-d'),
            'fecha_calibracion' => Carbon::now()->subMonths(11)->format('Y-m-d'),
            'proveedor' => 'Proveedor Calibración Test'
        ];

        $testUser = (object) [
            'email' => $email,
            'nombre' => $user->nombre ?? 'Usuario',
            'apellido' => $user->apellido ?? 'Test'
        ];

        $testUser->notify(new CalibrationReminder(
            $calibration,
            $equipment,
            7,
            'upcoming'
        ));
    }

    /**
     * Enviar correo de prueba general
     */
    private function sendTestGeneralEmail($email, $user)
    {
        Mail::raw(
            "Este es un correo de prueba del Sistema EVA.\n\n" .
            "Usuario: {$user->nombre} {$user->apellido}\n" .
            "Fecha: " . Carbon::now()->format('d/m/Y H:i:s') . "\n\n" .
            "Si recibes este correo, la configuración de correo está funcionando correctamente.\n\n" .
            "Sistema EVA - Gestión de Equipos Biomédicos",
            function ($message) use ($email, $user) {
                $message->to($email)
                        ->subject('Correo de Prueba - Sistema EVA')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            }
        );
    }

    /**
     * Calcular tasa de entrega
     */
    private function calculateDeliveryRate($startDate)
    {
        $total = DB::table('notification_logs')
            ->where('created_at', '>=', $startDate)
            ->count();

        $delivered = DB::table('notification_logs')
            ->where('created_at', '>=', $startDate)
            ->where('status', 'delivered')
            ->count();

        return $total > 0 ? round(($delivered / $total) * 100, 2) : 0;
    }

    /**
     * Decodificar token de desuscripción
     */
    private function decodeUnsubscribeToken($token)
    {
        try {
            // Implementar lógica de decodificación segura
            // Por ejemplo, usando base64 + hash para verificar integridad
            $decoded = base64_decode($token);
            $parts = explode('|', $decoded);
            
            if (count($parts) !== 2) {
                return null;
            }

            $userId = $parts[0];
            $hash = $parts[1];
            
            // Verificar hash
            $expectedHash = hash('sha256', $userId . config('app.key'));
            
            if (!hash_equals($expectedHash, $hash)) {
                return null;
            }

            return (int) $userId;
        } catch (\Exception $e) {
            return null;
        }
    }
}
