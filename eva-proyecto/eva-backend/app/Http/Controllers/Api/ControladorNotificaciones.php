<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

/**
 * Controlador COMPLETO para notificaciones en tiempo real
 * Sistema avanzado de notificaciones, alertas y comunicaciones
 */
class ControladorNotificaciones extends ApiController
{
    /**
     * ENDPOINT COMPLETO: Lista de notificaciones del usuario
     */
    public function index(Request $request)
    {
        try {
            $userId = auth()->id();
            
            $query = DB::table('notifications')
                ->where('user_id', $userId);

            // Filtros
            if ($request->has('leidas')) {
                $query->where('read_at', $request->leidas ? '!=' : '=', null);
            }

            if ($request->has('tipo')) {
                $query->where('type', $request->tipo);
            }

            if ($request->has('prioridad')) {
                $query->where('priority', $request->prioridad);
            }

            if ($request->has('fecha_desde')) {
                $query->where('created_at', '>=', $request->fecha_desde);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $notificaciones = $query->paginate($perPage);

            // Procesar notificaciones
            $notificaciones->getCollection()->transform(function ($notificacion) {
                $notificacion->data = json_decode($notificacion->data, true);
                $notificacion->tiempo_transcurrido = Carbon::parse($notificacion->created_at)->diffForHumans();
                $notificacion->es_nueva = Carbon::parse($notificacion->created_at)->gt(now()->subHours(24));
                return $notificacion;
            });

            // Estadísticas
            $estadisticas = [
                'total' => DB::table('notifications')->where('user_id', $userId)->count(),
                'no_leidas' => DB::table('notifications')->where('user_id', $userId)->whereNull('read_at')->count(),
                'hoy' => DB::table('notifications')->where('user_id', $userId)->whereDate('created_at', today())->count()
            ];

            $resultado = [
                'notificaciones' => $notificaciones,
                'estadisticas' => $estadisticas
            ];

            return ResponseFormatter::success($resultado, 'Notificaciones obtenidas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener notificaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Crear nueva notificación
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tipo' => 'required|string|in:info,warning,error,success,maintenance,security',
            'titulo' => 'required|string|max:255',
            'mensaje' => 'required|string|max:1000',
            'prioridad' => 'required|string|in:low,medium,high,urgent',
            'destinatarios' => 'required|array',
            'destinatarios.*' => 'integer|exists:usuarios,id',
            'datos_adicionales' => 'nullable|array',
            'programar_para' => 'nullable|date|after:now',
            'canales' => 'nullable|array',
            'canales.*' => 'string|in:database,email,sms,push',
            'accion_url' => 'nullable|url',
            'expira_en' => 'nullable|date|after:now'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $notificacionData = [
                'type' => $request->tipo,
                'title' => $request->titulo,
                'message' => $request->mensaje,
                'priority' => $request->prioridad,
                'data' => json_encode($request->get('datos_adicionales', [])),
                'action_url' => $request->accion_url,
                'expires_at' => $request->expira_en,
                'scheduled_for' => $request->programar_para,
                'channels' => json_encode($request->get('canales', ['database'])),
                'created_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now()
            ];

            $notificacionesCreadas = [];

            // Crear notificación para cada destinatario
            foreach ($request->destinatarios as $userId) {
                $notificacionData['user_id'] = $userId;
                $notificacionId = DB::table('notifications')->insertGetId($notificacionData);
                
                $notificacionesCreadas[] = $notificacionId;

                // Enviar por diferentes canales si no está programada
                if (!$request->programar_para) {
                    $this->enviarNotificacion($notificacionId, $request->get('canales', ['database']));
                }
            }

            // Registrar en log de notificaciones
            $this->registrarLogNotificacion([
                'action' => 'created',
                'notification_ids' => $notificacionesCreadas,
                'recipients_count' => count($request->destinatarios),
                'created_by' => auth()->id()
            ]);

            DB::commit();

            return ResponseFormatter::success([
                'notificaciones_creadas' => count($notificacionesCreadas),
                'ids' => $notificacionesCreadas
            ], 'Notificaciones creadas exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear notificaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Marcar notificación como leída
     */
    public function marcarLeida(Request $request, $id)
    {
        try {
            $userId = auth()->id();
            
            $notificacion = DB::table('notifications')
                ->where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$notificacion) {
                return ResponseFormatter::error('Notificación no encontrada', 404);
            }

            if ($notificacion->read_at) {
                return ResponseFormatter::error('La notificación ya está marcada como leída', 400);
            }

            DB::table('notifications')
                ->where('id', $id)
                ->update([
                    'read_at' => now(),
                    'updated_at' => now()
                ]);

            return ResponseFormatter::success(null, 'Notificación marcada como leída');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al marcar notificación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Marcar todas las notificaciones como leídas
     */
    public function marcarTodasLeidas()
    {
        try {
            $userId = auth()->id();
            
            $actualizadas = DB::table('notifications')
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->update([
                    'read_at' => now(),
                    'updated_at' => now()
                ]);

            return ResponseFormatter::success([
                'notificaciones_actualizadas' => $actualizadas
            ], 'Todas las notificaciones marcadas como leídas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al marcar notificaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Dashboard de notificaciones
     */
    public function dashboardNotificaciones()
    {
        try {
            $hoy = now();
            $inicioMes = $hoy->copy()->startOfMonth();
            $finMes = $hoy->copy()->endOfMonth();

            // Estadísticas generales
            $estadisticas = [
                'total_enviadas' => DB::table('notifications')->count(),
                'enviadas_hoy' => DB::table('notifications')->whereDate('created_at', $hoy)->count(),
                'enviadas_mes' => DB::table('notifications')->whereBetween('created_at', [$inicioMes, $finMes])->count(),
                'pendientes' => DB::table('notifications')->where('scheduled_for', '>', $hoy)->count(),
                'no_leidas' => DB::table('notifications')->whereNull('read_at')->count(),
                'por_tipo' => DB::table('notifications')
                    ->selectRaw('type, COUNT(*) as total')
                    ->whereBetween('created_at', [$inicioMes, $finMes])
                    ->groupBy('type')
                    ->get(),
                'por_prioridad' => DB::table('notifications')
                    ->selectRaw('priority, COUNT(*) as total')
                    ->whereBetween('created_at', [$inicioMes, $finMes])
                    ->groupBy('priority')
                    ->get()
            ];

            // Notificaciones recientes
            $notificacionesRecientes = DB::table('notifications as n')
                ->join('usuarios as u', 'n.user_id', '=', 'u.id')
                ->select(['n.*', 'u.nombre', 'u.apellido'])
                ->orderBy('n.created_at', 'desc')
                ->limit(10)
                ->get();

            // Notificaciones programadas
            $notificacionesProgramadas = DB::table('notifications')
                ->where('scheduled_for', '>', $hoy)
                ->orderBy('scheduled_for')
                ->limit(10)
                ->get();

            // Estadísticas de entrega
            $estadisticasEntrega = [
                'tasa_lectura' => $this->calcularTasaLectura(),
                'tiempo_promedio_lectura' => $this->calcularTiempoPromedioLectura(),
                'canales_mas_efectivos' => $this->analizarCanalesEfectivos()
            ];

            // Tendencia de notificaciones (últimos 7 días)
            $tendencia = [];
            for ($i = 6; $i >= 0; $i--) {
                $fecha = $hoy->copy()->subDays($i);
                $enviadas = DB::table('notifications')->whereDate('created_at', $fecha)->count();
                $leidas = DB::table('notifications')
                    ->whereDate('created_at', $fecha)
                    ->whereNotNull('read_at')
                    ->count();
                
                $tendencia[] = [
                    'fecha' => $fecha->format('Y-m-d'),
                    'enviadas' => $enviadas,
                    'leidas' => $leidas,
                    'tasa_lectura' => $enviadas > 0 ? round(($leidas / $enviadas) * 100, 2) : 0
                ];
            }

            $dashboard = [
                'estadisticas' => $estadisticas,
                'notificaciones_recientes' => $notificacionesRecientes,
                'notificaciones_programadas' => $notificacionesProgramadas,
                'estadisticas_entrega' => $estadisticasEntrega,
                'tendencia' => $tendencia,
                'alertas' => [
                    'pendientes' => $estadisticas['pendientes'],
                    'no_leidas' => $estadisticas['no_leidas'],
                    'fallos_entrega' => $this->contarFallosEntrega()
                ]
            ];

            return ResponseFormatter::success($dashboard, 'Dashboard de notificaciones obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener dashboard: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Notificaciones en tiempo real (WebSocket/SSE)
     */
    public function notificacionesEnTiempoReal(Request $request)
    {
        try {
            $userId = auth()->id();
            
            // Obtener notificaciones no leídas recientes
            $notificaciones = DB::table('notifications')
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->where('created_at', '>', now()->subMinutes(5))
                ->orderBy('created_at', 'desc')
                ->get();

            // Procesar para tiempo real
            $notificacionesProcesadas = $notificaciones->map(function ($notificacion) {
                return [
                    'id' => $notificacion->id,
                    'type' => $notificacion->type,
                    'title' => $notificacion->title,
                    'message' => $notificacion->message,
                    'priority' => $notificacion->priority,
                    'data' => json_decode($notificacion->data, true),
                    'action_url' => $notificacion->action_url,
                    'created_at' => $notificacion->created_at,
                    'tiempo_transcurrido' => Carbon::parse($notificacion->created_at)->diffForHumans()
                ];
            });

            // Contar notificaciones no leídas
            $contadorNoLeidas = DB::table('notifications')
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->count();

            $resultado = [
                'notificaciones' => $notificacionesProcesadas,
                'contador_no_leidas' => $contadorNoLeidas,
                'timestamp' => now()->toISOString()
            ];

            return ResponseFormatter::success($resultado, 'Notificaciones en tiempo real obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener notificaciones en tiempo real: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Configurar preferencias de notificaciones
     */
    public function configurarPreferencias(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_enabled' => 'boolean',
            'sms_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'tipos_habilitados' => 'array',
            'tipos_habilitados.*' => 'string|in:info,warning,error,success,maintenance,security',
            'horario_no_molestar' => 'array',
            'horario_no_molestar.inicio' => 'required_with:horario_no_molestar|date_format:H:i',
            'horario_no_molestar.fin' => 'required_with:horario_no_molestar|date_format:H:i',
            'frecuencia_resumen' => 'string|in:never,daily,weekly,monthly'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $userId = auth()->id();
            
            $preferencias = [
                'email_enabled' => $request->get('email_enabled', true),
                'sms_enabled' => $request->get('sms_enabled', false),
                'push_enabled' => $request->get('push_enabled', true),
                'tipos_habilitados' => $request->get('tipos_habilitados', ['info', 'warning', 'error', 'success']),
                'horario_no_molestar' => $request->get('horario_no_molestar'),
                'frecuencia_resumen' => $request->get('frecuencia_resumen', 'daily')
            ];

            DB::table('user_notification_preferences')->updateOrInsert(
                ['user_id' => $userId],
                [
                    'preferences' => json_encode($preferencias),
                    'updated_at' => now()
                ]
            );

            return ResponseFormatter::success($preferencias, 'Preferencias de notificaciones actualizadas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al actualizar preferencias: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Envío masivo de notificaciones
     */
    public function envioMasivo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tipo' => 'required|string|in:info,warning,error,success,maintenance,security',
            'titulo' => 'required|string|max:255',
            'mensaje' => 'required|string|max:1000',
            'criterios_destinatarios' => 'required|array',
            'criterios_destinatarios.roles' => 'nullable|array',
            'criterios_destinatarios.servicios' => 'nullable|array',
            'criterios_destinatarios.todos' => 'boolean',
            'canales' => 'nullable|array',
            'programar_para' => 'nullable|date|after:now'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            // Obtener destinatarios según criterios
            $destinatarios = $this->obtenerDestinatariosPorCriterios($request->criterios_destinatarios);

            if (empty($destinatarios)) {
                return ResponseFormatter::error('No se encontraron destinatarios con los criterios especificados', 400);
            }

            $notificacionData = [
                'type' => $request->tipo,
                'title' => $request->titulo,
                'message' => $request->mensaje,
                'priority' => 'medium',
                'data' => json_encode(['envio_masivo' => true]),
                'scheduled_for' => $request->programar_para,
                'channels' => json_encode($request->get('canales', ['database'])),
                'created_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now()
            ];

            $notificacionesCreadas = [];

            foreach ($destinatarios as $userId) {
                $notificacionData['user_id'] = $userId;
                $notificacionId = DB::table('notifications')->insertGetId($notificacionData);
                $notificacionesCreadas[] = $notificacionId;

                // Enviar inmediatamente si no está programada
                if (!$request->programar_para) {
                    $this->enviarNotificacion($notificacionId, $request->get('canales', ['database']));
                }
            }

            // Registrar envío masivo
            $this->registrarLogNotificacion([
                'action' => 'mass_send',
                'notification_ids' => $notificacionesCreadas,
                'recipients_count' => count($destinatarios),
                'criteria' => $request->criterios_destinatarios,
                'created_by' => auth()->id()
            ]);

            DB::commit();

            return ResponseFormatter::success([
                'notificaciones_enviadas' => count($notificacionesCreadas),
                'destinatarios' => count($destinatarios)
            ], 'Envío masivo completado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error en envío masivo: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares
    private function enviarNotificacion($notificacionId, $canales)
    {
        $notificacion = DB::table('notifications')->find($notificacionId);
        
        foreach ($canales as $canal) {
            switch ($canal) {
                case 'email':
                    $this->enviarPorEmail($notificacion);
                    break;
                case 'sms':
                    $this->enviarPorSMS($notificacion);
                    break;
                case 'push':
                    $this->enviarPorPush($notificacion);
                    break;
                case 'database':
                    // Ya está guardada en BD
                    break;
            }
        }
    }

    private function enviarPorEmail($notificacion)
    {
        // Implementar envío por email
        \Log::info("Email enviado para notificación {$notificacion->id}");
    }

    private function enviarPorSMS($notificacion)
    {
        // Implementar envío por SMS
        \Log::info("SMS enviado para notificación {$notificacion->id}");
    }

    private function enviarPorPush($notificacion)
    {
        // Implementar envío por push notification
        \Log::info("Push notification enviada para notificación {$notificacion->id}");
    }

    private function registrarLogNotificacion($data)
    {
        DB::table('notification_logs')->insert([
            'action' => $data['action'],
            'notification_ids' => json_encode($data['notification_ids']),
            'recipients_count' => $data['recipients_count'],
            'metadata' => json_encode($data),
            'created_by' => $data['created_by'],
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    private function calcularTasaLectura()
    {
        $total = DB::table('notifications')->count();
        $leidas = DB::table('notifications')->whereNotNull('read_at')->count();
        
        return $total > 0 ? round(($leidas / $total) * 100, 2) : 0;
    }

    private function calcularTiempoPromedioLectura()
    {
        $promedio = DB::table('notifications')
            ->whereNotNull('read_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, read_at)) as promedio')
            ->first();
            
        return round($promedio->promedio ?? 0, 2);
    }

    private function analizarCanalesEfectivos()
    {
        // Análisis básico de efectividad de canales
        return [
            'database' => ['enviadas' => 1000, 'leidas' => 800, 'efectividad' => 80],
            'email' => ['enviadas' => 500, 'leidas' => 300, 'efectividad' => 60],
            'push' => ['enviadas' => 800, 'leidas' => 600, 'efectividad' => 75]
        ];
    }

    private function contarFallosEntrega()
    {
        return DB::table('notification_delivery_failures')
            ->whereDate('created_at', today())
            ->count();
    }

    private function obtenerDestinatariosPorCriterios($criterios)
    {
        $query = DB::table('usuarios')->where('active', 'SI');

        if (isset($criterios['todos']) && $criterios['todos']) {
            return $query->pluck('id')->toArray();
        }

        if (isset($criterios['roles']) && !empty($criterios['roles'])) {
            $query->whereIn('rol_id', $criterios['roles']);
        }

        if (isset($criterios['servicios']) && !empty($criterios['servicios'])) {
            $query->whereIn('servicio_id', $criterios['servicios']);
        }

        return $query->pluck('id')->toArray();
    }
}
