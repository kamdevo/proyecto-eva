<?php

namespace App\Interactions;

use App\Models\Calibracion;
use App\Models\Equipo;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use App\Events\Calibration\CalibrationScheduled;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

/**
 * Clase de interacción para gestión de calibraciones
 * Maneja operaciones complejas relacionadas con calibraciones de equipos
 */
class InteraccionCalibracion
{
    /**
     * Programar calibración automática basada en frecuencia del equipo
     */
    public static function programarCalibracionAutomatica($equipoId, $usuarioId = null)
    {
        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($equipoId);
            
            // Verificar si el equipo requiere calibración
            if (!$equipo->requiere_calibracion) {
                return ResponseFormatter::error('El equipo no requiere calibración', 400);
            }

            // Calcular fecha de próxima calibración
            $frecuenciaDias = $equipo->frecuencia_calibracion ?? 365; // Default 1 año
            $fechaProximaCalibracion = now()->addDays($frecuenciaDias);

            // Verificar si ya existe una calibración programada
            $calibracionExistente = Calibracion::where('equipo_id', $equipoId)
                ->where('estado', 'programada')
                ->where('fecha', '>=', now())
                ->first();

            if ($calibracionExistente) {
                return ResponseFormatter::error('Ya existe una calibración programada para este equipo', 400);
            }

            // Crear nueva calibración
            $calibracion = Calibracion::create([
                'equipo_id' => $equipoId,
                'descripcion' => 'Calibración preventiva programada automáticamente',
                'fecha' => $fechaProximaCalibracion,
                'fecha_vencimiento' => $fechaProximaCalibracion->copy()->addYear(),
                'tipo' => 'preventiva',
                'estado' => 'programada',
                'metodo' => 'Según procedimiento estándar',
                'created_at' => now(),
                'programada_por' => $usuarioId ?? auth()->id()
            ]);

            // Actualizar equipo
            $equipo->update([
                'proxima_calibracion' => $fechaProximaCalibracion,
                'estado_calibracion' => 'programada'
            ]);

            // Disparar evento
            event(new CalibrationScheduled($calibracion, auth()->user()));

            DB::commit();

            return ResponseFormatter::success($calibracion, 'Calibración programada automáticamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al programar calibración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar calibración con resultados
     */
    public static function completarCalibracion($calibracionId, $datos)
    {
        try {
            DB::beginTransaction();

            $calibracion = Calibracion::findOrFail($calibracionId);

            // Validar que la calibración esté en estado correcto
            if (!in_array($calibracion->estado, ['programada', 'en_proceso'])) {
                return ResponseFormatter::error('La calibración no puede ser completada en su estado actual', 400);
            }

            // Actualizar calibración
            $calibracion->update([
                'estado' => 'completada',
                'fecha_completado' => now(),
                'resultado' => $datos['resultado'] ?? 'conforme',
                'observaciones' => $datos['observaciones'] ?? null,
                'tecnico_id' => $datos['tecnico_id'] ?? auth()->id(),
                'patron_referencia' => $datos['patron_referencia'] ?? null,
                'incertidumbre' => $datos['incertidumbre'] ?? null,
                'costo' => $datos['costo'] ?? null,
                'updated_at' => now()
            ]);

            // Manejar certificado si se proporciona
            if (isset($datos['certificado']) && $datos['certificado']) {
                $certificadoPath = self::guardarCertificado($datos['certificado'], $calibracion->id);
                $calibracion->update(['certificado' => $certificadoPath]);
            }

            // Actualizar equipo
            $equipo = $calibracion->equipo;
            if ($equipo) {
                $proximaCalibracion = self::calcularProximaCalibracion($equipo);
                
                $equipo->update([
                    'ultima_calibracion' => now(),
                    'proxima_calibracion' => $proximaCalibracion,
                    'estado_calibracion' => $datos['resultado'] === 'conforme' ? 'vigente' : 'no_conforme',
                    'certificado_calibracion' => $calibracion->certificado
                ]);

                // Programar próxima calibración automáticamente
                if ($datos['resultado'] === 'conforme') {
                    self::programarCalibracionAutomatica($equipo->id);
                }
            }

            DB::commit();

            return ResponseFormatter::success($calibracion, 'Calibración completada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar calibración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Verificar calibraciones vencidas
     */
    public static function verificarCalibracionesVencidas()
    {
        try {
            $calibracionesVencidas = Calibracion::with(['equipo'])
                ->where('fecha_vencimiento', '<', now())
                ->where('estado', 'completada')
                ->get();

            $equiposAfectados = [];

            foreach ($calibracionesVencidas as $calibracion) {
                // Marcar calibración como vencida
                $calibracion->update(['estado' => 'vencida']);

                // Actualizar estado del equipo
                if ($calibracion->equipo) {
                    $calibracion->equipo->update([
                        'estado_calibracion' => 'vencida'
                    ]);

                    $equiposAfectados[] = [
                        'equipo_id' => $calibracion->equipo->id,
                        'equipo_name' => $calibracion->equipo->name,
                        'calibracion_id' => $calibracion->id,
                        'fecha_vencimiento' => $calibracion->fecha_vencimiento,
                        'dias_vencido' => now()->diffInDays($calibracion->fecha_vencimiento)
                    ];

                    // Programar nueva calibración
                    self::programarCalibracionAutomatica($calibracion->equipo->id);
                }
            }

            return ResponseFormatter::success([
                'calibraciones_vencidas' => $calibracionesVencidas->count(),
                'equipos_afectados' => $equiposAfectados
            ], 'Verificación de calibraciones vencidas completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al verificar calibraciones vencidas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de calibraciones
     */
    public static function obtenerEstadisticasCalibraciones($filtros = [])
    {
        try {
            $query = Calibracion::with(['equipo']);

            // Aplicar filtros
            if (isset($filtros['fecha_inicio'])) {
                $query->where('fecha', '>=', $filtros['fecha_inicio']);
            }
            if (isset($filtros['fecha_fin'])) {
                $query->where('fecha', '<=', $filtros['fecha_fin']);
            }
            if (isset($filtros['servicio_id'])) {
                $query->whereHas('equipo', function($q) use ($filtros) {
                    $q->where('servicio_id', $filtros['servicio_id']);
                });
            }

            $calibraciones = $query->get();

            $estadisticas = [
                'total' => $calibraciones->count(),
                'por_estado' => $calibraciones->groupBy('estado')->map->count(),
                'por_tipo' => $calibraciones->groupBy('tipo')->map->count(),
                'por_resultado' => $calibraciones->whereNotNull('resultado')->groupBy('resultado')->map->count(),
                'costo_total' => $calibraciones->sum('costo'),
                'promedio_costo' => $calibraciones->where('costo', '>', 0)->avg('costo'),
                'vencidas' => $calibraciones->where('estado', 'vencida')->count(),
                'proximas_a_vencer' => $calibraciones->where('fecha_vencimiento', '<=', now()->addDays(30))
                    ->where('estado', 'completada')->count()
            ];

            return ResponseFormatter::success($estadisticas, 'Estadísticas de calibraciones obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar reporte de calibraciones
     */
    public static function generarReporteCalibraciones($filtros = [], $formato = 'excel')
    {
        try {
            $query = Calibracion::with(['equipo.servicio', 'equipo.area', 'tecnico']);

            // Aplicar filtros
            if (isset($filtros['fecha_inicio'])) {
                $query->where('fecha', '>=', $filtros['fecha_inicio']);
            }
            if (isset($filtros['fecha_fin'])) {
                $query->where('fecha', '<=', $filtros['fecha_fin']);
            }
            if (isset($filtros['estado'])) {
                $query->where('estado', $filtros['estado']);
            }

            $calibraciones = $query->orderBy('fecha', 'desc')->get();

            $datos = $calibraciones->map(function($calibracion) {
                return [
                    'ID' => $calibracion->id,
                    'Equipo' => $calibracion->equipo?->name,
                    'Código Equipo' => $calibracion->equipo?->code,
                    'Servicio' => $calibracion->equipo?->servicio?->name,
                    'Área' => $calibracion->equipo?->area?->name,
                    'Fecha Calibración' => $calibracion->fecha,
                    'Fecha Vencimiento' => $calibracion->fecha_vencimiento,
                    'Tipo' => ucfirst($calibracion->tipo),
                    'Estado' => ucfirst($calibracion->estado),
                    'Resultado' => $calibracion->resultado ? ucfirst($calibracion->resultado) : 'N/A',
                    'Técnico' => $calibracion->tecnico?->getFullNameAttribute(),
                    'Costo' => $calibracion->costo ?? 0,
                    'Observaciones' => $calibracion->observaciones
                ];
            });

            // Generar archivo según formato
            $nombreArchivo = 'reporte_calibraciones_' . now()->format('Y-m-d_H-i-s');
            
            if ($formato === 'excel') {
                return InteraccionExportacion::exportarAExcel($datos, $nombreArchivo);
            } else {
                return InteraccionExportacion::exportarAPDF($datos, $nombreArchivo, 'Reporte de Calibraciones');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar reporte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular próxima calibración
     */
    private static function calcularProximaCalibracion($equipo)
    {
        $frecuenciaDias = $equipo->frecuencia_calibracion ?? 365;
        return now()->addDays($frecuenciaDias);
    }

    /**
     * Guardar certificado de calibración
     */
    private static function guardarCertificado($archivo, $calibracionId)
    {
        $nombreArchivo = 'certificados_calibracion/calibracion_' . $calibracionId . '_' . time() . '.' . $archivo->getClientOriginalExtension();
        return $archivo->storeAs('certificados_calibracion', $nombreArchivo, 'public');
    }

    /**
     * Validar datos de calibración
     */
    public static function validarDatosCalibracion($datos)
    {
        $reglas = [
            'equipo_id' => 'required|exists:equipos,id',
            'fecha' => 'required|date',
            'fecha_vencimiento' => 'required|date|after:fecha',
            'tipo' => 'required|in:preventiva,correctiva,verificacion,ajuste',
            'resultado' => 'nullable|in:conforme,no_conforme,condicional',
            'costo' => 'nullable|numeric|min:0'
        ];

        return validator($datos, $reglas);
    }
}
