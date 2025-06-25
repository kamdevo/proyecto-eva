<?php

namespace App\Interactions;

use App\Models\Contingencia;
use App\Models\Equipo;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use App\Events\Contingency\ContingencyCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

/**
 * Clase de interacción para gestión de contingencias
 * Maneja operaciones complejas relacionadas con contingencias y eventos adversos
 */
class InteraccionContingencia
{
    /**
     * Crear contingencia automática por falla de equipo
     */
    public static function crearContingenciaAutomatica($equipoId, $tipoFalla, $descripcion = null)
    {
        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($equipoId);

            // Determinar severidad basada en criticidad del equipo
            $severidad = self::determinarSeveridad($equipo, $tipoFalla);
            
            // Crear contingencia
            $contingencia = Contingencia::create([
                'equipo_id' => $equipoId,
                'descripcion' => $descripcion ?? "Falla automática detectada: {$tipoFalla}",
                'fecha' => now(),
                'severidad' => $severidad,
                'tipo' => 'Falla de Equipo',
                'estado' => 'Activa',
                'usuario_reporta' => auth()->id() ?? 1, // Sistema
                'observaciones' => 'Contingencia creada automáticamente por el sistema',
                'accion_inmediata' => self::determinarAccionInmediata($tipoFalla),
                'impacto_servicio' => self::evaluarImpactoServicio($equipo),
                'requiere_notificacion' => true,
                'fecha_limite_resolucion' => self::calcularFechaLimite($severidad)
            ]);

            // Actualizar estado del equipo
            $equipo->update([
                'tiene_contingencia' => true,
                'estado_contingencia' => $severidad,
                'fecha_ultima_contingencia' => now()
            ]);

            // Crear acciones correctivas automáticas
            self::crearAccionesCorrectivas($contingencia, $tipoFalla);

            // Disparar evento
            event(new ContingencyCreated($contingencia, auth()->user()));

            DB::commit();

            return ResponseFormatter::success($contingencia, 'Contingencia creada automáticamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Escalar contingencia por tiempo o severidad
     */
    public static function escalarContingencia($contingenciaId, $motivo = 'Tiempo límite excedido')
    {
        try {
            DB::beginTransaction();

            $contingencia = Contingencia::findOrFail($contingenciaId);

            // Verificar si puede ser escalada
            if ($contingencia->estado !== 'Activa') {
                return ResponseFormatter::error('Solo se pueden escalar contingencias activas', 400);
            }

            // Determinar nuevo nivel de escalamiento
            $nuevoNivel = self::determinarNuevoNivel($contingencia->severidad);

            // Actualizar contingencia
            $contingencia->update([
                'severidad' => $nuevoNivel,
                'escalada' => true,
                'fecha_escalamiento' => now(),
                'motivo_escalamiento' => $motivo,
                'escalada_por' => auth()->id(),
                'fecha_limite_resolucion' => self::calcularFechaLimite($nuevoNivel)
            ]);

            // Notificar a nivel superior
            self::notificarEscalamiento($contingencia);

            // Crear acciones adicionales si es necesario
            if ($nuevoNivel === 'Crítica') {
                self::activarProtocoloEmergencia($contingencia);
            }

            DB::commit();

            return ResponseFormatter::success($contingencia, 'Contingencia escalada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al escalar contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Resolver contingencia con análisis de causa raíz
     */
    public static function resolverContingencia($contingenciaId, $datos)
    {
        try {
            DB::beginTransaction();

            $contingencia = Contingencia::findOrFail($contingenciaId);

            // Validar que puede ser resuelta
            if ($contingencia->estado === 'Cerrada') {
                return ResponseFormatter::error('La contingencia ya está cerrada', 400);
            }

            // Actualizar contingencia
            $contingencia->update([
                'estado' => 'Cerrada',
                'fecha_cierre' => now(),
                'resuelto_por' => auth()->id(),
                'solucion_aplicada' => $datos['solucion'] ?? null,
                'causa_raiz' => $datos['causa_raiz'] ?? null,
                'acciones_preventivas' => $datos['acciones_preventivas'] ?? null,
                'tiempo_resolucion' => $contingencia->created_at->diffInMinutes(now()),
                'costo_resolucion' => $datos['costo'] ?? null,
                'observaciones_cierre' => $datos['observaciones'] ?? null
            ]);

            // Actualizar equipo
            if ($contingencia->equipo) {
                $contingencia->equipo->update([
                    'tiene_contingencia' => false,
                    'estado_contingencia' => null
                ]);

                // Programar mantenimiento preventivo si es necesario
                if (isset($datos['programar_mantenimiento']) && $datos['programar_mantenimiento']) {
                    InteraccionMantenimiento::programarMantenimientoPreventivo(
                        $contingencia->equipo_id,
                        'Mantenimiento preventivo post-contingencia'
                    );
                }
            }

            // Generar reporte de lecciones aprendidas
            self::generarLeccionesAprendidas($contingencia, $datos);

            DB::commit();

            return ResponseFormatter::success($contingencia, 'Contingencia resuelta exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al resolver contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener contingencias críticas activas
     */
    public static function obtenerContingenciasCriticas()
    {
        try {
            $contingencias = Contingencia::with(['equipo.servicio', 'usuarioReporta'])
                ->where('estado', 'Activa')
                ->whereIn('severidad', ['Alta', 'Crítica'])
                ->orderBy('severidad', 'desc')
                ->orderBy('fecha', 'asc')
                ->get();

            $contingenciasFormateadas = $contingencias->map(function($contingencia) {
                return [
                    'id' => $contingencia->id,
                    'equipo' => $contingencia->equipo?->name,
                    'servicio' => $contingencia->equipo?->servicio?->name,
                    'descripcion' => $contingencia->descripcion,
                    'severidad' => $contingencia->severidad,
                    'fecha' => $contingencia->fecha,
                    'tiempo_transcurrido' => $contingencia->fecha->diffForHumans(),
                    'fecha_limite' => $contingencia->fecha_limite_resolucion,
                    'tiempo_restante' => $contingencia->fecha_limite_resolucion ? 
                        now()->diffForHumans($contingencia->fecha_limite_resolucion, true) : null,
                    'vencida' => $contingencia->fecha_limite_resolucion ? 
                        now()->gt($contingencia->fecha_limite_resolucion) : false,
                    'impacto_servicio' => $contingencia->impacto_servicio,
                    'escalada' => $contingencia->escalada
                ];
            });

            return ResponseFormatter::success($contingenciasFormateadas, 'Contingencias críticas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener contingencias críticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar reporte de contingencias
     */
    public static function generarReporteContingencias($filtros = [], $formato = 'excel')
    {
        try {
            $query = Contingencia::with(['equipo.servicio', 'equipo.area', 'usuarioReporta']);

            // Aplicar filtros
            if (isset($filtros['fecha_inicio'])) {
                $query->where('fecha', '>=', $filtros['fecha_inicio']);
            }
            if (isset($filtros['fecha_fin'])) {
                $query->where('fecha', '<=', $filtros['fecha_fin']);
            }
            if (isset($filtros['severidad'])) {
                $query->where('severidad', $filtros['severidad']);
            }
            if (isset($filtros['estado'])) {
                $query->where('estado', $filtros['estado']);
            }

            $contingencias = $query->orderBy('fecha', 'desc')->get();

            $datos = $contingencias->map(function($contingencia) {
                return [
                    'ID' => $contingencia->id,
                    'Equipo' => $contingencia->equipo?->name,
                    'Servicio' => $contingencia->equipo?->servicio?->name,
                    'Área' => $contingencia->equipo?->area?->name,
                    'Descripción' => $contingencia->descripcion,
                    'Fecha' => $contingencia->fecha,
                    'Severidad' => $contingencia->severidad,
                    'Estado' => $contingencia->estado,
                    'Tipo' => $contingencia->tipo,
                    'Impacto Servicio' => $contingencia->impacto_servicio,
                    'Reportado Por' => $contingencia->usuarioReporta?->getFullNameAttribute(),
                    'Tiempo Resolución (min)' => $contingencia->tiempo_resolucion,
                    'Costo Resolución' => $contingencia->costo_resolucion ?? 0,
                    'Causa Raíz' => $contingencia->causa_raiz,
                    'Solución Aplicada' => $contingencia->solucion_aplicada
                ];
            });

            $nombreArchivo = 'reporte_contingencias_' . now()->format('Y-m-d_H-i-s');
            
            if ($formato === 'excel') {
                return InteraccionExportacion::exportarAExcel($datos, $nombreArchivo);
            } else {
                return InteraccionExportacion::exportarAPDF($datos, $nombreArchivo, 'Reporte de Contingencias');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar reporte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Determinar severidad basada en equipo y tipo de falla
     */
    private static function determinarSeveridad($equipo, $tipoFalla)
    {
        // Equipos críticos siempre generan contingencias de alta severidad
        if ($equipo->es_critico) {
            return 'Crítica';
        }

        // Determinar por tipo de falla
        $fallasAltas = ['falla_total', 'incendio', 'explosion', 'fuga_peligrosa'];
        if (in_array($tipoFalla, $fallasAltas)) {
            return 'Alta';
        }

        $fallasMedias = ['falla_parcial', 'alarma_critica', 'desviacion_parametros'];
        if (in_array($tipoFalla, $fallasMedias)) {
            return 'Media';
        }

        return 'Baja';
    }

    /**
     * Determinar acción inmediata
     */
    private static function determinarAccionInmediata($tipoFalla)
    {
        $acciones = [
            'falla_total' => 'Suspender uso inmediato del equipo',
            'incendio' => 'Activar protocolo de emergencia contra incendios',
            'explosion' => 'Evacuar área y activar protocolo de emergencia',
            'fuga_peligrosa' => 'Aislar área y activar protocolo de materiales peligrosos',
            'falla_parcial' => 'Evaluar funcionalidad y determinar continuidad de uso',
            'alarma_critica' => 'Verificar parámetros y evaluar seguridad',
            'desviacion_parametros' => 'Recalibrar y verificar funcionamiento'
        ];

        return $acciones[$tipoFalla] ?? 'Evaluar situación y determinar acciones necesarias';
    }

    /**
     * Evaluar impacto en el servicio
     */
    private static function evaluarImpactoServicio($equipo)
    {
        if ($equipo->es_critico) {
            return 'Alto';
        }

        // Evaluar basado en el servicio
        $serviciosCriticos = ['UCI', 'Urgencias', 'Quirófano', 'Neonatología'];
        if (in_array($equipo->servicio?->name, $serviciosCriticos)) {
            return 'Alto';
        }

        return 'Medio';
    }

    /**
     * Calcular fecha límite de resolución
     */
    private static function calcularFechaLimite($severidad)
    {
        $horas = match($severidad) {
            'Crítica' => 2,
            'Alta' => 8,
            'Media' => 24,
            'Baja' => 72,
            default => 24
        };

        return now()->addHours($horas);
    }

    /**
     * Crear acciones correctivas automáticas
     */
    private static function crearAccionesCorrectivas($contingencia, $tipoFalla)
    {
        // Implementar lógica para crear acciones correctivas automáticas
        // basadas en el tipo de falla y la contingencia
    }

    /**
     * Determinar nuevo nivel de escalamiento
     */
    private static function determinarNuevoNivel($severidadActual)
    {
        return match($severidadActual) {
            'Baja' => 'Media',
            'Media' => 'Alta',
            'Alta' => 'Crítica',
            'Crítica' => 'Crítica', // Ya está en el nivel máximo
            default => 'Media'
        };
    }

    /**
     * Notificar escalamiento
     */
    private static function notificarEscalamiento($contingencia)
    {
        // Implementar notificaciones de escalamiento
    }

    /**
     * Activar protocolo de emergencia
     */
    private static function activarProtocoloEmergencia($contingencia)
    {
        // Implementar activación de protocolo de emergencia
    }

    /**
     * Generar lecciones aprendidas
     */
    private static function generarLeccionesAprendidas($contingencia, $datos)
    {
        // Implementar generación de documento de lecciones aprendidas
    }
}
