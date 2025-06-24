<?php

namespace App\Interactions;

use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use App\Models\Mantenimiento;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase de interacción para gestión de equipos
 * Maneja operaciones específicas de equipos médicos e industriales
 */
class InteraccionEquipos
{
    /**
     * Duplicar equipo con validaciones
     */
    public static function duplicarEquipo($equipoId, $datos = [])
    {
        try {
            DB::beginTransaction();

            $equipoOriginal = Equipo::findOrFail($equipoId);

            // Generar nuevo código único
            $nuevoCode = self::generarCodigoUnico($equipoOriginal->code);

            // Preparar datos del nuevo equipo
            $datosNuevo = $equipoOriginal->toArray();
            unset($datosNuevo['id'], $datosNuevo['created_at'], $datosNuevo['updated_at']);

            // Aplicar cambios específicos
            $datosNuevo['code'] = $nuevoCode;
            $datosNuevo['name'] = $datos['name'] ?? $equipoOriginal->name . ' (Copia)';
            $datosNuevo['serial'] = $datos['serial'] ?? null;
            $datosNuevo['status'] = true;
            $datosNuevo['created_at'] = now();

            // Crear nuevo equipo
            $nuevoEquipo = Equipo::create($datosNuevo);

            DB::commit();

            return ResponseFormatter::success($nuevoEquipo, 'Equipo duplicado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al duplicar equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Dar de baja equipo con motivo
     */
    public static function darDeBajaEquipo($equipoId, $motivo, $usuarioId)
    {
        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($equipoId);

            // Verificar que no tenga mantenimientos pendientes
            $mantenimientosPendientes = Mantenimiento::where('equipo_id', $equipoId)
                ->where('status', 'programado')
                ->count();

            if ($mantenimientosPendientes > 0) {
                return ResponseFormatter::error(
                    'No se puede dar de baja el equipo porque tiene mantenimientos pendientes', 
                    400
                );
            }

            // Actualizar estado del equipo
            $equipo->update([
                'status' => false,
                'motivo_baja' => $motivo,
                'fecha_baja' => now(),
                'usuario_baja' => $usuarioId
            ]);

            // Cancelar mantenimientos futuros
            Mantenimiento::where('equipo_id', $equipoId)
                ->where('status', 'programado')
                ->where('fecha_programada', '>', now())
                ->update([
                    'status' => 'cancelado',
                    'motivo_cancelacion' => 'Equipo dado de baja: ' . $motivo
                ]);

            DB::commit();

            return ResponseFormatter::success($equipo, 'Equipo dado de baja exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al dar de baja equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Búsqueda avanzada de equipos
     */
    public static function busquedaAvanzada($criterios)
    {
        try {
            $query = Equipo::with(['servicio', 'area']);

            // Aplicar filtros
            if (!empty($criterios['name'])) {
                $query->where('name', 'like', '%' . $criterios['name'] . '%');
            }

            if (!empty($criterios['code'])) {
                $query->where('code', 'like', '%' . $criterios['code'] . '%');
            }

            if (!empty($criterios['marca'])) {
                $query->where('marca', 'like', '%' . $criterios['marca'] . '%');
            }

            if (!empty($criterios['modelo'])) {
                $query->where('modelo', 'like', '%' . $criterios['modelo'] . '%');
            }

            if (!empty($criterios['servicio_id'])) {
                $query->where('servicio_id', $criterios['servicio_id']);
            }

            if (!empty($criterios['area_id'])) {
                $query->where('area_id', $criterios['area_id']);
            }

            if (!empty($criterios['riesgo'])) {
                $query->where('riesgo', $criterios['riesgo']);
            }

            if (!empty($criterios['status'])) {
                $query->where('status', $criterios['status'] === 'activo');
            }

            if (!empty($criterios['fecha_desde'])) {
                $query->where('created_at', '>=', $criterios['fecha_desde']);
            }

            if (!empty($criterios['fecha_hasta'])) {
                $query->where('created_at', '<=', $criterios['fecha_hasta']);
            }

            // Filtros de mantenimiento
            if (!empty($criterios['mantenimiento_vencido'])) {
                $query->where('proximo_mantenimiento', '<', now());
            }

            if (!empty($criterios['sin_mantenimiento'])) {
                $query->whereNull('ultimo_mantenimiento');
            }

            // Ordenamiento
            $orderBy = $criterios['order_by'] ?? 'name';
            $orderDirection = $criterios['order_direction'] ?? 'asc';
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $criterios['per_page'] ?? 15;
            $equipos = $query->paginate($perPage);

            return ResponseFormatter::success($equipos, 'Búsqueda completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en la búsqueda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener equipos críticos
     */
    public static function obtenerEquiposCriticos()
    {
        try {
            $equipos = Equipo::with(['servicio', 'area'])
                ->where('riesgo', 'ALTO')
                ->where('status', true)
                ->orderBy('name')
                ->get();

            // Agregar información adicional
            $equipos->each(function ($equipo) {
                $equipo->mantenimiento_vencido = $equipo->proximo_mantenimiento && 
                    Carbon::parse($equipo->proximo_mantenimiento)->isPast();
                
                $equipo->dias_sin_mantenimiento = $equipo->ultimo_mantenimiento 
                    ? Carbon::parse($equipo->ultimo_mantenimiento)->diffInDays(now())
                    : null;
            });

            return ResponseFormatter::success($equipos, 'Equipos críticos obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos críticos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar estadísticas de equipos
     */
    public static function generarEstadisticas()
    {
        try {
            $stats = [
                'total_equipos' => Equipo::count(),
                'equipos_activos' => Equipo::where('status', true)->count(),
                'equipos_baja' => Equipo::where('status', false)->count(),
                'por_riesgo' => Equipo::where('status', true)
                    ->groupBy('riesgo')
                    ->selectRaw('riesgo, count(*) as total')
                    ->get(),
                'por_servicio' => DB::table('equipos')
                    ->join('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                    ->where('equipos.status', true)
                    ->groupBy('servicios.id', 'servicios.name')
                    ->selectRaw('servicios.name as servicio, count(*) as total')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get(),
                'por_area' => DB::table('equipos')
                    ->join('areas', 'equipos.area_id', '=', 'areas.id')
                    ->where('equipos.status', true)
                    ->groupBy('areas.id', 'areas.name')
                    ->selectRaw('areas.name as area, count(*) as total')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get(),
                'mantenimientos_vencidos' => Equipo::where('status', true)
                    ->where('proximo_mantenimiento', '<', now())
                    ->count(),
                'sin_mantenimiento' => Equipo::where('status', true)
                    ->whereNull('ultimo_mantenimiento')
                    ->count(),
                'marcas_principales' => Equipo::where('status', true)
                    ->whereNotNull('marca')
                    ->groupBy('marca')
                    ->selectRaw('marca, count(*) as total')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get(),
                'equipos_recientes' => Equipo::where('status', true)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'name', 'code', 'created_at'])
            ];

            return ResponseFormatter::success($stats, 'Estadísticas generadas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Limpiar nombres de equipos
     */
    public static function limpiarNombres($equiposIds)
    {
        try {
            DB::beginTransaction();

            $equipos = Equipo::whereIn('id', $equiposIds)->get();
            $actualizados = 0;

            foreach ($equipos as $equipo) {
                $nombreLimpio = self::limpiarTexto($equipo->name);
                
                if ($nombreLimpio !== $equipo->name) {
                    $equipo->update(['name' => $nombreLimpio]);
                    $actualizados++;
                }
            }

            DB::commit();

            return ResponseFormatter::success([
                'equipos_actualizados' => $actualizados
            ], 'Nombres limpiados exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al limpiar nombres: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Métodos auxiliares privados
     */
    private static function generarCodigoUnico($codigoBase)
    {
        $contador = 1;
        $nuevoCode = $codigoBase . '-COPY';

        while (Equipo::where('code', $nuevoCode)->exists()) {
            $contador++;
            $nuevoCode = $codigoBase . '-COPY' . $contador;
        }

        return $nuevoCode;
    }

    private static function limpiarTexto($texto)
    {
        // Eliminar espacios extra, caracteres especiales, etc.
        $texto = trim($texto);
        $texto = preg_replace('/\s+/', ' ', $texto);
        $texto = ucwords(strtolower($texto));
        
        return $texto;
    }
}
