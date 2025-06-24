<?php

namespace App\Interactions;

use App\Models\Mantenimiento;
use App\Models\Equipo;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase de interacción para gestión de mantenimientos
 * Maneja operaciones específicas de mantenimientos preventivos y correctivos
 */
class InteraccionMantenimiento
{
    /**
     * Programar mantenimiento preventivo automático
     */
    public static function programarMantenimientoAutomatico($equipoId, $fechaBase = null)
    {
        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($equipoId);
            $fechaBase = $fechaBase ? Carbon::parse($fechaBase) : now();

            // Determinar frecuencia basada en clasificación de riesgo
            $frecuenciaDias = self::obtenerFrecuenciaMantenimiento($equipo);

            if (!$frecuenciaDias) {
                return ResponseFormatter::error('No se pudo determinar la frecuencia de mantenimiento', 400);
            }

            $fechaProgramada = $fechaBase->addDays($frecuenciaDias);

            // Verificar si ya existe un mantenimiento programado cercano
            $mantenimientoExistente = Mantenimiento::where('equipo_id', $equipoId)
                ->where('status', 'programado')
                ->whereBetween('fecha_programada', [
                    $fechaProgramada->copy()->subDays(7),
                    $fechaProgramada->copy()->addDays(7)
                ])
                ->first();

            if ($mantenimientoExistente) {
                return ResponseFormatter::error('Ya existe un mantenimiento programado en fechas cercanas', 400);
            }

            // Crear mantenimiento
            $mantenimiento = Mantenimiento::create([
                'equipo_id' => $equipoId,
                'description' => 'Mantenimiento preventivo programado automáticamente',
                'fecha_programada' => $fechaProgramada,
                'tipo' => 'preventivo',
                'status' => 'programado',
                'prioridad' => self::determinarPrioridad($equipo),
                'tiempo_estimado' => self::obtenerTiempoEstimado($equipo)
            ]);

            // Actualizar fecha de próximo mantenimiento en el equipo
            $equipo->update([
                'proximo_mantenimiento' => $fechaProgramada
            ]);

            DB::commit();

            return ResponseFormatter::success($mantenimiento, 'Mantenimiento programado automáticamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al programar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar mantenimiento con validaciones
     */
    public static function completarMantenimiento($mantenimientoId, $datos)
    {
        try {
            DB::beginTransaction();

            $mantenimiento = Mantenimiento::findOrFail($mantenimientoId);

            if ($mantenimiento->status === 'completado') {
                return ResponseFormatter::error('El mantenimiento ya está completado', 400);
            }

            // Validar datos requeridos
            $datosRequeridos = ['observaciones', 'tiempo_real'];
            foreach ($datosRequeridos as $campo) {
                if (empty($datos[$campo])) {
                    return ResponseFormatter::error("El campo {$campo} es requerido", 400);
                }
            }

            // Actualizar mantenimiento
            $mantenimiento->update([
                'status' => 'completado',
                'fecha_fin' => now(),
                'observaciones' => $datos['observaciones'],
                'tiempo_real' => $datos['tiempo_real'],
                'repuestos_utilizados' => $datos['repuestos_utilizados'] ?? null,
                'costo' => $datos['costo'] ?? null,
                'calificacion' => $datos['calificacion'] ?? null
            ]);

            // Actualizar fecha de último mantenimiento en el equipo
            $equipo = $mantenimiento->equipo;
            $equipo->update([
                'ultimo_mantenimiento' => now(),
                'proximo_mantenimiento' => self::calcularProximoMantenimiento($equipo)
            ]);

            // Programar próximo mantenimiento si es preventivo
            if ($mantenimiento->tipo === 'preventivo') {
                self::programarMantenimientoAutomatico($equipo->id, now());
            }

            DB::commit();

            return ResponseFormatter::success($mantenimiento, 'Mantenimiento completado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener mantenimientos vencidos
     */
    public static function obtenerMantenimientosVencidos()
    {
        try {
            $mantenimientos = Mantenimiento::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])
            ->where('status', 'programado')
            ->where('fecha_programada', '<', now())
            ->orderBy('fecha_programada', 'asc')
            ->get();

            // Calcular días de vencimiento
            $mantenimientos->each(function ($mantenimiento) {
                $mantenimiento->dias_vencido = Carbon::parse($mantenimiento->fecha_programada)->diffInDays(now());
            });

            return ResponseFormatter::success($mantenimientos, 'Mantenimientos vencidos obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener mantenimientos vencidos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar plan de mantenimiento para un período
     */
    public static function generarPlanMantenimiento($fechaInicio, $fechaFin, $servicioId = null, $areaId = null)
    {
        try {
            $query = Equipo::with(['servicio', 'area']);

            if ($servicioId) {
                $query->where('servicio_id', $servicioId);
            }

            if ($areaId) {
                $query->where('area_id', $areaId);
            }

            $equipos = $query->where('status', true)->get();
            $plan = [];

            foreach ($equipos as $equipo) {
                $frecuencia = self::obtenerFrecuenciaMantenimiento($equipo);
                if (!$frecuencia) continue;

                $fechaActual = Carbon::parse($fechaInicio);
                $fechaLimite = Carbon::parse($fechaFin);

                // Calcular próxima fecha de mantenimiento
                $ultimoMantenimiento = $equipo->ultimo_mantenimiento 
                    ? Carbon::parse($equipo->ultimo_mantenimiento)
                    : $fechaActual->copy()->subDays($frecuencia);

                $proximaFecha = $ultimoMantenimiento->copy()->addDays($frecuencia);

                while ($proximaFecha->lte($fechaLimite)) {
                    if ($proximaFecha->gte($fechaActual)) {
                        $plan[] = [
                            'equipo_id' => $equipo->id,
                            'equipo_name' => $equipo->name,
                            'equipo_code' => $equipo->code,
                            'servicio' => $equipo->servicio->name ?? 'N/A',
                            'area' => $equipo->area->name ?? 'N/A',
                            'fecha_programada' => $proximaFecha->format('Y-m-d'),
                            'tipo' => 'preventivo',
                            'prioridad' => self::determinarPrioridad($equipo),
                            'tiempo_estimado' => self::obtenerTiempoEstimado($equipo)
                        ];
                    }
                    $proximaFecha->addDays($frecuencia);
                }
            }

            // Ordenar por fecha
            usort($plan, function ($a, $b) {
                return strcmp($a['fecha_programada'], $b['fecha_programada']);
            });

            return ResponseFormatter::success($plan, 'Plan de mantenimiento generado');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar plan: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de cumplimiento
     */
    public static function obtenerEstadisticasCumplimiento($year = null)
    {
        try {
            $year = $year ?? date('Y');

            $stats = [
                'total_programados' => Mantenimiento::whereYear('fecha_programada', $year)->count(),
                'total_completados' => Mantenimiento::where('status', 'completado')
                    ->whereYear('fecha_programada', $year)->count(),
                'total_vencidos' => Mantenimiento::where('status', 'programado')
                    ->where('fecha_programada', '<', now())
                    ->whereYear('fecha_programada', $year)->count(),
                'porcentaje_cumplimiento' => 0,
                'tiempo_promedio' => Mantenimiento::where('status', 'completado')
                    ->whereYear('fecha_programada', $year)
                    ->avg('tiempo_real'),
                'costo_total' => Mantenimiento::where('status', 'completado')
                    ->whereYear('fecha_programada', $year)
                    ->sum('costo'),
                'por_mes' => Mantenimiento::whereYear('fecha_programada', $year)
                    ->groupBy(DB::raw('MONTH(fecha_programada)'))
                    ->selectRaw('MONTH(fecha_programada) as mes, 
                                count(*) as programados,
                                sum(case when status = "completado" then 1 else 0 end) as completados')
                    ->orderBy('mes')
                    ->get(),
                'por_tipo' => Mantenimiento::whereYear('fecha_programada', $year)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total,
                                sum(case when status = "completado" then 1 else 0 end) as completados')
                    ->get()
            ];

            // Calcular porcentaje de cumplimiento
            if ($stats['total_programados'] > 0) {
                $stats['porcentaje_cumplimiento'] = round(
                    ($stats['total_completados'] / $stats['total_programados']) * 100, 2
                );
            }

            return ResponseFormatter::success($stats, 'Estadísticas de cumplimiento obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Métodos auxiliares privados
     */
    private static function obtenerFrecuenciaMantenimiento($equipo)
    {
        // Frecuencia basada en clasificación de riesgo
        $frecuencias = [
            'ALTO' => 30,      // 30 días
            'MEDIO ALTO' => 60, // 60 días
            'MEDIO' => 90,     // 90 días
            'BAJO' => 180      // 180 días
        ];

        return $frecuencias[$equipo->riesgo] ?? 90;
    }

    private static function determinarPrioridad($equipo)
    {
        $prioridades = [
            'ALTO' => 'alta',
            'MEDIO ALTO' => 'media',
            'MEDIO' => 'media',
            'BAJO' => 'baja'
        ];

        return $prioridades[$equipo->riesgo] ?? 'media';
    }

    private static function obtenerTiempoEstimado($equipo)
    {
        // Tiempo estimado en horas basado en tipo de equipo
        $tiempos = [
            'ALTO' => 4,
            'MEDIO ALTO' => 3,
            'MEDIO' => 2,
            'BAJO' => 1
        ];

        return $tiempos[$equipo->riesgo] ?? 2;
    }

    private static function calcularProximoMantenimiento($equipo)
    {
        $frecuencia = self::obtenerFrecuenciaMantenimiento($equipo);
        return now()->addDays($frecuencia);
    }
}
