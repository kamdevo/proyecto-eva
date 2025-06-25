<?php

namespace App\Interactions;

use App\Models\Capacitacion;
use App\Models\Usuario;
use App\Models\Equipo;
use App\ConexionesVista\ResponseFormatter;
use App\Events\Training\TrainingScheduled;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase de interacción para gestión de capacitaciones
 * Maneja operaciones complejas relacionadas con capacitaciones y entrenamientos
 */
class InteraccionCapacitacion
{
    /**
     * Programar capacitación obligatoria para usuario
     */
    public static function programarCapacitacionObligatoria($usuarioId, $tipoCapacitacion, $fechaLimite = null)
    {
        try {
            DB::beginTransaction();

            $usuario = Usuario::findOrFail($usuarioId);

            // Verificar si ya tiene una capacitación pendiente del mismo tipo
            $capacitacionExistente = Capacitacion::where('usuario_id', $usuarioId)
                ->where('tipo_capacitacion', $tipoCapacitacion)
                ->whereIn('estado', ['programada', 'en_proceso'])
                ->first();

            if ($capacitacionExistente) {
                return ResponseFormatter::error('El usuario ya tiene una capacitación pendiente de este tipo', 400);
            }

            // Determinar fecha límite si no se proporciona
            if (!$fechaLimite) {
                $fechaLimite = self::calcularFechaLimiteCapacitacion($tipoCapacitacion);
            }

            // Crear capacitación
            $capacitacion = Capacitacion::create([
                'usuario_id' => $usuarioId,
                'tipo_capacitacion' => $tipoCapacitacion,
                'descripcion' => self::obtenerDescripcionCapacitacion($tipoCapacitacion),
                'fecha_programada' => self::calcularFechaProgramada($tipoCapacitacion),
                'fecha_limite' => $fechaLimite,
                'estado' => 'programada',
                'es_obligatoria' => true,
                'modalidad' => self::determinarModalidad($tipoCapacitacion),
                'duracion_horas' => self::obtenerDuracionCapacitacion($tipoCapacitacion),
                'programada_por' => auth()->id(),
                'created_at' => now()
            ]);

            // Actualizar estado del usuario
            self::actualizarEstadoCapacitacionUsuario($usuario, $tipoCapacitacion, 'programada');

            // Disparar evento
            event(new TrainingScheduled($capacitacion, auth()->user()));

            DB::commit();

            return ResponseFormatter::success($capacitacion, 'Capacitación obligatoria programada');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al programar capacitación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar capacitación con evaluación
     */
    public static function completarCapacitacion($capacitacionId, $datos)
    {
        try {
            DB::beginTransaction();

            $capacitacion = Capacitacion::findOrFail($capacitacionId);

            // Validar que puede ser completada
            if (!in_array($capacitacion->estado, ['programada', 'en_proceso'])) {
                return ResponseFormatter::error('La capacitación no puede ser completada en su estado actual', 400);
            }

            // Validar calificación si es requerida
            if (isset($datos['calificacion'])) {
                if ($datos['calificacion'] < 0 || $datos['calificacion'] > 100) {
                    return ResponseFormatter::error('La calificación debe estar entre 0 y 100', 400);
                }
            }

            // Determinar si aprobó
            $calificacionMinima = self::obtenerCalificacionMinima($capacitacion->tipo_capacitacion);
            $aprobo = ($datos['calificacion'] ?? 0) >= $calificacionMinima;

            // Actualizar capacitación
            $capacitacion->update([
                'estado' => $aprobo ? 'completada' : 'reprobada',
                'fecha_completado' => now(),
                'calificacion' => $datos['calificacion'] ?? null,
                'observaciones' => $datos['observaciones'] ?? null,
                'instructor' => $datos['instructor'] ?? null,
                'lugar' => $datos['lugar'] ?? null,
                'certificado_emitido' => $aprobo,
                'fecha_vencimiento_certificado' => $aprobo ? 
                    self::calcularVencimientoCertificado($capacitacion->tipo_capacitacion) : null,
                'completada_por' => auth()->id()
            ]);

            // Actualizar estado del usuario
            $usuario = $capacitacion->usuario;
            if ($usuario) {
                self::actualizarEstadoCapacitacionUsuario(
                    $usuario, 
                    $capacitacion->tipo_capacitacion, 
                    $aprobo ? 'completada' : 'reprobada'
                );

                // Si reprobó y es obligatoria, programar nueva capacitación
                if (!$aprobo && $capacitacion->es_obligatoria) {
                    self::programarCapacitacionObligatoria(
                        $usuario->id, 
                        $capacitacion->tipo_capacitacion,
                        now()->addDays(30) // 30 días para repetir
                    );
                }
            }

            // Generar certificado si aprobó
            if ($aprobo) {
                $certificado = self::generarCertificado($capacitacion);
                $capacitacion->update(['ruta_certificado' => $certificado]);
            }

            DB::commit();

            return ResponseFormatter::success($capacitacion, 
                $aprobo ? 'Capacitación completada exitosamente' : 'Capacitación reprobada');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar capacitación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Verificar capacitaciones vencidas
     */
    public static function verificarCapacitacionesVencidas()
    {
        try {
            $capacitacionesVencidas = Capacitacion::with(['usuario'])
                ->where('fecha_vencimiento_certificado', '<', now())
                ->where('estado', 'completada')
                ->where('certificado_emitido', true)
                ->get();

            $usuariosAfectados = [];

            foreach ($capacitacionesVencidas as $capacitacion) {
                // Marcar certificado como vencido
                $capacitacion->update([
                    'certificado_vencido' => true,
                    'fecha_vencimiento_real' => now()
                ]);

                // Actualizar estado del usuario
                if ($capacitacion->usuario) {
                    self::actualizarEstadoCapacitacionUsuario(
                        $capacitacion->usuario,
                        $capacitacion->tipo_capacitacion,
                        'vencida'
                    );

                    $usuariosAfectados[] = [
                        'usuario_id' => $capacitacion->usuario->id,
                        'usuario_name' => $capacitacion->usuario->getFullNameAttribute(),
                        'capacitacion_id' => $capacitacion->id,
                        'tipo_capacitacion' => $capacitacion->tipo_capacitacion,
                        'fecha_vencimiento' => $capacitacion->fecha_vencimiento_certificado,
                        'dias_vencido' => now()->diffInDays($capacitacion->fecha_vencimiento_certificado)
                    ];

                    // Programar recertificación si es obligatoria
                    if ($capacitacion->es_obligatoria) {
                        self::programarCapacitacionObligatoria(
                            $capacitacion->usuario->id,
                            $capacitacion->tipo_capacitacion
                        );
                    }
                }
            }

            return ResponseFormatter::success([
                'capacitaciones_vencidas' => $capacitacionesVencidas->count(),
                'usuarios_afectados' => $usuariosAfectados
            ], 'Verificación de capacitaciones vencidas completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al verificar capacitaciones vencidas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de capacitaciones
     */
    public static function obtenerEstadisticasCapacitaciones($filtros = [])
    {
        try {
            $query = Capacitacion::with(['usuario']);

            // Aplicar filtros
            if (isset($filtros['fecha_inicio'])) {
                $query->where('fecha_programada', '>=', $filtros['fecha_inicio']);
            }
            if (isset($filtros['fecha_fin'])) {
                $query->where('fecha_programada', '<=', $filtros['fecha_fin']);
            }
            if (isset($filtros['tipo_capacitacion'])) {
                $query->where('tipo_capacitacion', $filtros['tipo_capacitacion']);
            }

            $capacitaciones = $query->get();

            $estadisticas = [
                'total' => $capacitaciones->count(),
                'por_estado' => $capacitaciones->groupBy('estado')->map->count(),
                'por_tipo' => $capacitaciones->groupBy('tipo_capacitacion')->map->count(),
                'obligatorias' => $capacitaciones->where('es_obligatoria', true)->count(),
                'certificados_emitidos' => $capacitaciones->where('certificado_emitido', true)->count(),
                'certificados_vencidos' => $capacitaciones->where('certificado_vencido', true)->count(),
                'promedio_calificacion' => $capacitaciones->whereNotNull('calificacion')->avg('calificacion'),
                'tasa_aprobacion' => $capacitaciones->where('estado', 'completada')->count() / 
                    max($capacitaciones->whereIn('estado', ['completada', 'reprobada'])->count(), 1) * 100,
                'proximas_a_vencer' => $capacitaciones->where('fecha_vencimiento_certificado', '<=', now()->addDays(30))
                    ->where('certificado_emitido', true)
                    ->where('certificado_vencido', false)->count()
            ];

            return ResponseFormatter::success($estadisticas, 'Estadísticas de capacitaciones obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular fecha límite para capacitación
     */
    private static function calcularFechaLimiteCapacitacion($tipoCapacitacion)
    {
        $diasLimite = match($tipoCapacitacion) {
            'Seguridad Básica' => 30,
            'Manejo de Equipos Críticos' => 15,
            'Protocolos de Emergencia' => 7,
            'Calibración Avanzada' => 45,
            'Mantenimiento Preventivo' => 60,
            default => 30
        };

        return now()->addDays($diasLimite);
    }

    /**
     * Calcular fecha programada
     */
    private static function calcularFechaProgramada($tipoCapacitacion)
    {
        // Programar para la próxima semana por defecto
        return now()->addWeek();
    }

    /**
     * Obtener descripción de capacitación
     */
    private static function obtenerDescripcionCapacitacion($tipoCapacitacion)
    {
        $descripciones = [
            'Seguridad Básica' => 'Capacitación en normas básicas de seguridad hospitalaria',
            'Manejo de Equipos Críticos' => 'Entrenamiento en operación de equipos médicos críticos',
            'Protocolos de Emergencia' => 'Capacitación en procedimientos de emergencia',
            'Calibración Avanzada' => 'Entrenamiento avanzado en calibración de equipos',
            'Mantenimiento Preventivo' => 'Capacitación en técnicas de mantenimiento preventivo'
        ];

        return $descripciones[$tipoCapacitacion] ?? 'Capacitación especializada';
    }

    /**
     * Determinar modalidad
     */
    private static function determinarModalidad($tipoCapacitacion)
    {
        $modalidadesPresenciales = ['Manejo de Equipos Críticos', 'Protocolos de Emergencia'];
        return in_array($tipoCapacitacion, $modalidadesPresenciales) ? 'presencial' : 'virtual';
    }

    /**
     * Obtener duración de capacitación
     */
    private static function obtenerDuracionCapacitacion($tipoCapacitacion)
    {
        $duraciones = [
            'Seguridad Básica' => 4,
            'Manejo de Equipos Críticos' => 8,
            'Protocolos de Emergencia' => 6,
            'Calibración Avanzada' => 16,
            'Mantenimiento Preventivo' => 12
        ];

        return $duraciones[$tipoCapacitacion] ?? 4;
    }

    /**
     * Obtener calificación mínima
     */
    private static function obtenerCalificacionMinima($tipoCapacitacion)
    {
        $calificacionesCriticas = ['Manejo de Equipos Críticos', 'Protocolos de Emergencia'];
        return in_array($tipoCapacitacion, $calificacionesCriticas) ? 80 : 70;
    }

    /**
     * Calcular vencimiento de certificado
     */
    private static function calcularVencimientoCertificado($tipoCapacitacion)
    {
        $mesesVigencia = match($tipoCapacitacion) {
            'Seguridad Básica' => 12,
            'Manejo de Equipos Críticos' => 6,
            'Protocolos de Emergencia' => 6,
            'Calibración Avanzada' => 24,
            'Mantenimiento Preventivo' => 18,
            default => 12
        };

        return now()->addMonths($mesesVigencia);
    }

    /**
     * Actualizar estado de capacitación del usuario
     */
    private static function actualizarEstadoCapacitacionUsuario($usuario, $tipoCapacitacion, $estado)
    {
        $estadosCapacitacion = $usuario->estados_capacitacion ?? [];
        $estadosCapacitacion[$tipoCapacitacion] = [
            'estado' => $estado,
            'fecha_actualizacion' => now()->toISOString()
        ];

        $usuario->update(['estados_capacitacion' => $estadosCapacitacion]);
    }

    /**
     * Generar certificado
     */
    private static function generarCertificado($capacitacion)
    {
        // Implementar generación de certificado PDF
        $nombreArchivo = 'certificados/certificado_' . $capacitacion->id . '_' . time() . '.pdf';
        
        // Aquí iría la lógica para generar el PDF del certificado
        // Por ahora retornamos el nombre del archivo
        
        return $nombreArchivo;
    }
}
