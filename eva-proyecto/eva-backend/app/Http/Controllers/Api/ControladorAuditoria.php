<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador COMPLETO para auditoría y trazabilidad
 * Sistema avanzado de auditoría, logs y trazabilidad del sistema EVA
 */
class ControladorAuditoria extends ApiController
{
    /**
     * ENDPOINT COMPLETO: Registro de auditoría con filtros avanzados
     */
    public function registroAuditoria(Request $request)
    {
        try {
            $query = DB::table('audit_logs as al')
                ->leftJoin('usuarios as u', 'al.user_id', '=', 'u.id')
                ->select([
                    'al.*',
                    'u.nombre',
                    'u.apellido',
                    'u.email'
                ]);

            // Filtros avanzados
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('al.action', 'like', "%{$search}%")
                      ->orWhere('al.table_name', 'like', "%{$search}%")
                      ->orWhere('al.description', 'like', "%{$search}%")
                      ->orWhere('u.nombre', 'like', "%{$search}%")
                      ->orWhere('u.apellido', 'like', "%{$search}%");
                });
            }

            if ($request->has('usuario_id')) {
                $query->where('al.user_id', $request->usuario_id);
            }

            if ($request->has('accion')) {
                $query->where('al.action', $request->accion);
            }

            if ($request->has('tabla')) {
                $query->where('al.table_name', $request->tabla);
            }

            if ($request->has('fecha_desde')) {
                $query->where('al.created_at', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('al.created_at', '<=', $request->fecha_hasta);
            }

            if ($request->has('ip_address')) {
                $query->where('al.ip_address', $request->ip_address);
            }

            if ($request->has('nivel_riesgo')) {
                $query->where('al.risk_level', $request->nivel_riesgo);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'al.created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $registros = $query->paginate($perPage);

            // Agregar información adicional
            $registros->getCollection()->transform(function ($registro) {
                $registro->tiempo_transcurrido = Carbon::parse($registro->created_at)->diffForHumans();
                $registro->datos_anteriores = json_decode($registro->old_values, true);
                $registro->datos_nuevos = json_decode($registro->new_values, true);
                $registro->nivel_riesgo_texto = $this->getNivelRiesgoTexto($registro->risk_level);
                return $registro;
            });

            return ResponseFormatter::success($registros, 'Registro de auditoría obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener registro de auditoría: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Dashboard de auditoría
     */
    public function dashboardAuditoria()
    {
        try {
            $hoy = now();
            $inicioMes = $hoy->copy()->startOfMonth();
            $finMes = $hoy->copy()->endOfMonth();
            $inicioSemana = $hoy->copy()->startOfWeek();

            // Estadísticas generales
            $estadisticas = [
                'total_eventos' => DB::table('audit_logs')->count(),
                'eventos_hoy' => DB::table('audit_logs')->whereDate('created_at', $hoy)->count(),
                'eventos_semana' => DB::table('audit_logs')->whereBetween('created_at', [$inicioSemana, $hoy])->count(),
                'eventos_mes' => DB::table('audit_logs')->whereBetween('created_at', [$inicioMes, $finMes])->count(),
                'usuarios_activos_hoy' => DB::table('audit_logs')->whereDate('created_at', $hoy)
                    ->distinct('user_id')->count('user_id'),
                'eventos_criticos' => DB::table('audit_logs')->where('risk_level', 'high')->count(),
                'intentos_acceso_fallidos' => DB::table('audit_logs')
                    ->where('action', 'login_failed')->whereDate('created_at', $hoy)->count()
            ];

            // Eventos por tipo
            $eventosPorTipo = DB::table('audit_logs')
                ->selectRaw('action, COUNT(*) as total')
                ->whereBetween('created_at', [$inicioMes, $finMes])
                ->groupBy('action')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get();

            // Actividad por usuario
            $actividadPorUsuario = DB::table('audit_logs as al')
                ->join('usuarios as u', 'al.user_id', '=', 'u.id')
                ->selectRaw('u.nombre, u.apellido, COUNT(*) as total_eventos')
                ->whereBetween('al.created_at', [$inicioMes, $finMes])
                ->groupBy('u.id', 'u.nombre', 'u.apellido')
                ->orderBy('total_eventos', 'desc')
                ->limit(10)
                ->get();

            // Eventos recientes críticos
            $eventosCriticos = DB::table('audit_logs as al')
                ->leftJoin('usuarios as u', 'al.user_id', '=', 'u.id')
                ->select(['al.*', 'u.nombre', 'u.apellido'])
                ->where('al.risk_level', 'high')
                ->orderBy('al.created_at', 'desc')
                ->limit(10)
                ->get();

            // Tendencia de eventos (últimos 7 días)
            $tendenciaEventos = [];
            for ($i = 6; $i >= 0; $i--) {
                $fecha = $hoy->copy()->subDays($i);
                $eventos = DB::table('audit_logs')->whereDate('created_at', $fecha)->count();
                
                $tendenciaEventos[] = [
                    'fecha' => $fecha->format('Y-m-d'),
                    'eventos' => $eventos
                ];
            }

            // IPs más activas
            $ipsActivas = DB::table('audit_logs')
                ->selectRaw('ip_address, COUNT(*) as total')
                ->whereDate('created_at', $hoy)
                ->groupBy('ip_address')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get();

            $dashboard = [
                'estadisticas' => $estadisticas,
                'eventos_por_tipo' => $eventosPorTipo,
                'actividad_por_usuario' => $actividadPorUsuario,
                'eventos_criticos' => $eventosCriticos,
                'tendencia_eventos' => $tendenciaEventos,
                'ips_activas' => $ipsActivas,
                'alertas' => [
                    'eventos_criticos' => $estadisticas['eventos_criticos'],
                    'intentos_fallidos' => $estadisticas['intentos_acceso_fallidos'],
                    'actividad_sospechosa' => $this->detectarActividadSospechosa()
                ]
            ];

            return ResponseFormatter::success($dashboard, 'Dashboard de auditoría obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener dashboard de auditoría: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Trazabilidad de entidad específica
     */
    public function trazabilidadEntidad(Request $request, $tabla, $id)
    {
        $validator = Validator::make(['tabla' => $tabla, 'id' => $id], [
            'tabla' => 'required|string|in:equipos,usuarios,mantenimiento,contingencias,archivos',
            'id' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            // Obtener historial completo de la entidad
            $historial = DB::table('audit_logs as al')
                ->leftJoin('usuarios as u', 'al.user_id', '=', 'u.id')
                ->select([
                    'al.*',
                    'u.nombre',
                    'u.apellido',
                    'u.email'
                ])
                ->where('al.table_name', $tabla)
                ->where('al.record_id', $id)
                ->orderBy('al.created_at', 'desc')
                ->get();

            // Procesar datos para timeline
            $timeline = $historial->map(function ($evento) {
                return [
                    'id' => $evento->id,
                    'accion' => $evento->action,
                    'descripcion' => $evento->description,
                    'usuario' => $evento->nombre . ' ' . $evento->apellido,
                    'email_usuario' => $evento->email,
                    'fecha' => $evento->created_at,
                    'fecha_formateada' => Carbon::parse($evento->created_at)->format('d/m/Y H:i:s'),
                    'tiempo_transcurrido' => Carbon::parse($evento->created_at)->diffForHumans(),
                    'ip_address' => $evento->ip_address,
                    'user_agent' => $evento->user_agent,
                    'nivel_riesgo' => $evento->risk_level,
                    'cambios' => [
                        'anteriores' => json_decode($evento->old_values, true),
                        'nuevos' => json_decode($evento->new_values, true)
                    ]
                ];
            });

            // Estadísticas de la entidad
            $estadisticas = [
                'total_eventos' => $historial->count(),
                'primer_evento' => $historial->last()?->created_at,
                'ultimo_evento' => $historial->first()?->created_at,
                'usuarios_involucrados' => $historial->unique('user_id')->count(),
                'tipos_eventos' => $historial->groupBy('action')->map->count(),
                'eventos_criticos' => $historial->where('risk_level', 'high')->count()
            ];

            $resultado = [
                'entidad' => [
                    'tabla' => $tabla,
                    'id' => $id
                ],
                'estadisticas' => $estadisticas,
                'timeline' => $timeline,
                'resumen_cambios' => $this->generarResumenCambios($historial)
            ];

            return ResponseFormatter::success($resultado, 'Trazabilidad de entidad obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener trazabilidad: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Análisis de seguridad
     */
    public function analisisSeguridad(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'periodo' => 'nullable|string|in:dia,semana,mes,trimestre',
            'incluir_detalles' => 'boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $periodo = $request->get('periodo', 'semana');
            $incluirDetalles = $request->get('incluir_detalles', false);

            // Calcular fechas según período
            $fechas = $this->calcularFechasPeriodo($periodo);

            // Análisis de intentos de acceso
            $intentosAcceso = [
                'exitosos' => DB::table('audit_logs')
                    ->where('action', 'login_success')
                    ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
                    ->count(),
                'fallidos' => DB::table('audit_logs')
                    ->where('action', 'login_failed')
                    ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
                    ->count(),
                'por_ip' => DB::table('audit_logs')
                    ->selectRaw('ip_address, COUNT(*) as intentos')
                    ->where('action', 'login_failed')
                    ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
                    ->groupBy('ip_address')
                    ->orderBy('intentos', 'desc')
                    ->limit(10)
                    ->get()
            ];

            // Análisis de actividades sospechosas
            $actividadesSospechosas = [
                'accesos_fuera_horario' => $this->contarAccesosFueraHorario($fechas),
                'multiples_ips_usuario' => $this->contarMultiplesIPsPorUsuario($fechas),
                'cambios_criticos' => DB::table('audit_logs')
                    ->where('risk_level', 'high')
                    ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
                    ->count(),
                'eliminaciones_masivas' => DB::table('audit_logs')
                    ->where('action', 'delete')
                    ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
                    ->count()
            ];

            // Análisis de permisos
            $analisisPermisos = [
                'escalamiento_privilegios' => $this->detectarEscalamientoPrivilegios($fechas),
                'accesos_no_autorizados' => $this->detectarAccesosNoAutorizados($fechas),
                'cambios_permisos' => DB::table('audit_logs')
                    ->where('table_name', 'usuarios')
                    ->where('action', 'update')
                    ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
                    ->count()
            ];

            // Puntuación de riesgo
            $puntuacionRiesgo = $this->calcularPuntuacionRiesgo([
                'intentos_fallidos' => $intentosAcceso['fallidos'],
                'actividades_sospechosas' => array_sum($actividadesSospechosas),
                'cambios_criticos' => $actividadesSospechosas['cambios_criticos']
            ]);

            $analisis = [
                'periodo' => $periodo,
                'fechas' => $fechas,
                'intentos_acceso' => $intentosAcceso,
                'actividades_sospechosas' => $actividadesSospechosas,
                'analisis_permisos' => $analisisPermisos,
                'puntuacion_riesgo' => $puntuacionRiesgo,
                'recomendaciones' => $this->generarRecomendacionesSeguridad($puntuacionRiesgo)
            ];

            if ($incluirDetalles) {
                $analisis['eventos_detallados'] = $this->obtenerEventosDetallados($fechas);
            }

            return ResponseFormatter::success($analisis, 'Análisis de seguridad completado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en análisis de seguridad: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Exportar logs de auditoría
     */
    public function exportarLogs(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'formato' => 'required|string|in:csv,excel,pdf,json',
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'filtros' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $query = DB::table('audit_logs as al')
                ->leftJoin('usuarios as u', 'al.user_id', '=', 'u.id')
                ->select([
                    'al.id',
                    'al.action',
                    'al.table_name',
                    'al.record_id',
                    'al.description',
                    'u.nombre',
                    'u.apellido',
                    'u.email',
                    'al.ip_address',
                    'al.user_agent',
                    'al.risk_level',
                    'al.created_at'
                ])
                ->whereBetween('al.created_at', [$request->fecha_desde, $request->fecha_hasta]);

            // Aplicar filtros adicionales
            if ($request->has('filtros')) {
                $filtros = $request->filtros;
                
                if (isset($filtros['usuario_id'])) {
                    $query->where('al.user_id', $filtros['usuario_id']);
                }
                
                if (isset($filtros['accion'])) {
                    $query->where('al.action', $filtros['accion']);
                }
                
                if (isset($filtros['tabla'])) {
                    $query->where('al.table_name', $filtros['tabla']);
                }
            }

            $logs = $query->orderBy('al.created_at', 'desc')->get();

            // Generar archivo según formato
            $formato = $request->formato;
            $nombreArchivo = 'audit_logs_' . now()->format('Y_m_d_H_i_s');

            switch ($formato) {
                case 'csv':
                    return $this->exportarCSV($logs, $nombreArchivo);
                case 'excel':
                    return $this->exportarExcel($logs, $nombreArchivo);
                case 'pdf':
                    return $this->exportarPDF($logs, $nombreArchivo);
                case 'json':
                    return $this->exportarJSON($logs, $nombreArchivo);
                default:
                    return ResponseFormatter::error('Formato no soportado', 400);
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar logs: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares
    private function getNivelRiesgoTexto($nivel)
    {
        $niveles = [
            'low' => 'Bajo',
            'medium' => 'Medio',
            'high' => 'Alto',
            'critical' => 'Crítico'
        ];

        return $niveles[$nivel] ?? 'Desconocido';
    }

    private function detectarActividadSospechosa()
    {
        $hoy = now();
        
        // Detectar múltiples intentos fallidos desde la misma IP
        $intentosFallidos = DB::table('audit_logs')
            ->where('action', 'login_failed')
            ->whereDate('created_at', $hoy)
            ->groupBy('ip_address')
            ->havingRaw('COUNT(*) > 5')
            ->count();

        return $intentosFallidos;
    }

    private function generarResumenCambios($historial)
    {
        $cambios = [];
        
        foreach ($historial as $evento) {
            if ($evento->action === 'update') {
                $old = json_decode($evento->old_values, true);
                $new = json_decode($evento->new_values, true);
                
                if ($old && $new) {
                    foreach ($new as $campo => $valor) {
                        if (isset($old[$campo]) && $old[$campo] !== $valor) {
                            $cambios[] = [
                                'campo' => $campo,
                                'valor_anterior' => $old[$campo],
                                'valor_nuevo' => $valor,
                                'fecha' => $evento->created_at,
                                'usuario' => $evento->nombre . ' ' . $evento->apellido
                            ];
                        }
                    }
                }
            }
        }

        return $cambios;
    }

    private function calcularFechasPeriodo($periodo)
    {
        $hoy = now();
        
        switch ($periodo) {
            case 'dia':
                return ['inicio' => $hoy->copy()->startOfDay(), 'fin' => $hoy->copy()->endOfDay()];
            case 'semana':
                return ['inicio' => $hoy->copy()->startOfWeek(), 'fin' => $hoy->copy()->endOfWeek()];
            case 'mes':
                return ['inicio' => $hoy->copy()->startOfMonth(), 'fin' => $hoy->copy()->endOfMonth()];
            case 'trimestre':
                return ['inicio' => $hoy->copy()->startOfQuarter(), 'fin' => $hoy->copy()->endOfQuarter()];
            default:
                return ['inicio' => $hoy->copy()->startOfWeek(), 'fin' => $hoy->copy()->endOfWeek()];
        }
    }

    private function contarAccesosFueraHorario($fechas)
    {
        // Considerar fuera de horario: antes de 6 AM o después de 10 PM
        return DB::table('audit_logs')
            ->where('action', 'login_success')
            ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
            ->where(function($query) {
                $query->whereTime('created_at', '<', '06:00:00')
                      ->orWhereTime('created_at', '>', '22:00:00');
            })
            ->count();
    }

    private function contarMultiplesIPsPorUsuario($fechas)
    {
        return DB::table('audit_logs')
            ->select('user_id')
            ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
            ->groupBy('user_id')
            ->havingRaw('COUNT(DISTINCT ip_address) > 3')
            ->count();
    }

    private function detectarEscalamientoPrivilegios($fechas)
    {
        // Detectar cambios en roles de usuario
        return DB::table('audit_logs')
            ->where('table_name', 'usuarios')
            ->where('action', 'update')
            ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
            ->whereRaw("JSON_EXTRACT(new_values, '$.rol_id') != JSON_EXTRACT(old_values, '$.rol_id')")
            ->count();
    }

    private function detectarAccesosNoAutorizados($fechas)
    {
        // Detectar intentos de acceso a recursos sin permisos
        return DB::table('audit_logs')
            ->where('action', 'unauthorized_access')
            ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
            ->count();
    }

    private function calcularPuntuacionRiesgo($datos)
    {
        $puntuacion = 0;
        
        // Puntaje por intentos fallidos
        $puntuacion += min($datos['intentos_fallidos'] * 2, 20);
        
        // Puntaje por actividades sospechosas
        $puntuacion += min($datos['actividades_sospechosas'] * 5, 30);
        
        // Puntaje por cambios críticos
        $puntuacion += min($datos['cambios_criticos'] * 10, 50);
        
        return [
            'puntuacion' => $puntuacion,
            'nivel' => $this->determinarNivelRiesgo($puntuacion),
            'descripcion' => $this->getDescripcionRiesgo($puntuacion)
        ];
    }

    private function determinarNivelRiesgo($puntuacion)
    {
        if ($puntuacion >= 70) return 'critical';
        if ($puntuacion >= 50) return 'high';
        if ($puntuacion >= 30) return 'medium';
        return 'low';
    }

    private function getDescripcionRiesgo($puntuacion)
    {
        if ($puntuacion >= 70) return 'Riesgo crítico - Requiere atención inmediata';
        if ($puntuacion >= 50) return 'Riesgo alto - Revisar actividades sospechosas';
        if ($puntuacion >= 30) return 'Riesgo medio - Monitorear de cerca';
        return 'Riesgo bajo - Actividad normal';
    }

    private function generarRecomendacionesSeguridad($puntuacionRiesgo)
    {
        $recomendaciones = [];
        
        if ($puntuacionRiesgo['puntuacion'] >= 50) {
            $recomendaciones[] = 'Revisar inmediatamente los intentos de acceso fallidos';
            $recomendaciones[] = 'Implementar autenticación de dos factores';
            $recomendaciones[] = 'Bloquear IPs sospechosas';
        }
        
        if ($puntuacionRiesgo['puntuacion'] >= 30) {
            $recomendaciones[] = 'Aumentar la frecuencia de monitoreo';
            $recomendaciones[] = 'Revisar permisos de usuarios';
        }
        
        $recomendaciones[] = 'Mantener logs de auditoría actualizados';
        $recomendaciones[] = 'Realizar copias de seguridad regulares';
        
        return $recomendaciones;
    }

    private function obtenerEventosDetallados($fechas)
    {
        return DB::table('audit_logs')
            ->where('risk_level', 'high')
            ->whereBetween('created_at', [$fechas['inicio'], $fechas['fin']])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
    }

    private function exportarCSV($logs, $nombreArchivo)
    {
        // Implementar exportación CSV
        return ResponseFormatter::success(['archivo' => $nombreArchivo . '.csv'], 'Exportación CSV en desarrollo');
    }

    private function exportarExcel($logs, $nombreArchivo)
    {
        // Implementar exportación Excel
        return ResponseFormatter::success(['archivo' => $nombreArchivo . '.xlsx'], 'Exportación Excel en desarrollo');
    }

    private function exportarPDF($logs, $nombreArchivo)
    {
        // Implementar exportación PDF
        return ResponseFormatter::success(['archivo' => $nombreArchivo . '.pdf'], 'Exportación PDF en desarrollo');
    }

    private function exportarJSON($logs, $nombreArchivo)
    {
        $jsonData = json_encode($logs, JSON_PRETTY_PRINT);
        $filePath = storage_path('app/exports/' . $nombreArchivo . '.json');
        
        if (!is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }
        
        file_put_contents($filePath, $jsonData);
        
        return response()->download($filePath);
    }
}
