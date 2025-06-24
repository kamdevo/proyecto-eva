<?php

namespace App\Interactions;

use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Usuario;
use App\Models\Area;
use App\Models\Servicio;
use App\Models\Propietario;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase para manejar operaciones complejas de base de datos
 */
class DatabaseInteraction
{
    /**
     * Obtener estadísticas del dashboard
     */
    public static function getDashboardStats()
    {
        try {
            $stats = [
                'equipos' => [
                    'total' => Equipo::count(),
                    'operativos' => Equipo::where('estado', 'Operativo')->count(),
                    'mantenimiento' => Equipo::where('estado', 'Mantenimiento')->count(),
                    'baja' => Equipo::where('estado', 'Baja')->count(),
                ],
                'mantenimientos' => [
                    'programados' => Mantenimiento::where('status', 'programado')->count(),
                    'en_proceso' => Mantenimiento::where('status', 'en_proceso')->count(),
                    'completados_mes' => Mantenimiento::where('status', 'completado')
                        ->whereMonth('fecha_fin', date('m'))
                        ->whereYear('fecha_fin', date('Y'))
                        ->count(),
                    'vencidos' => Mantenimiento::where('status', 'programado')
                        ->where('fecha_programada', '<', now())
                        ->count(),
                ],
                'contingencias' => [
                    'activas' => Contingencia::where('estado', '!=', 'Cerrado')->count(),
                    'criticas' => Contingencia::where('severidad', 'Crítica')
                        ->where('estado', '!=', 'Cerrado')->count(),
                    'resueltas_mes' => Contingencia::where('estado', 'Cerrado')
                        ->whereMonth('fecha_cierre', date('m'))
                        ->whereYear('fecha_cierre', date('Y'))
                        ->count(),
                ],
                'usuarios' => [
                    'total' => Usuario::where('activo', true)->count(),
                    'administradores' => Usuario::where('rol', 'administrador')->where('activo', true)->count(),
                    'tecnicos' => Usuario::where('rol', 'admin')->where('activo', true)->count(),
                ]
            ];

            // Estadísticas por riesgo
            $stats['equipos_por_riesgo'] = [
                'alto' => Equipo::where('riesgo', 'ALTO')->count(),
                'medio_alto' => Equipo::where('riesgo', 'MEDIO ALTO')->count(),
                'medio' => Equipo::where('riesgo', 'MEDIO')->count(),
                'bajo' => Equipo::where('riesgo', 'BAJO')->count(),
            ];

            // Mantenimientos por mes (últimos 6 meses)
            $stats['mantenimientos_por_mes'] = [];
            for ($i = 5; $i >= 0; $i--) {
                $fecha = Carbon::now()->subMonths($i);
                $stats['mantenimientos_por_mes'][] = [
                    'mes' => $fecha->format('M Y'),
                    'preventivos' => Mantenimiento::where('type', 'preventivo')
                        ->whereMonth('fecha_programada', $fecha->month)
                        ->whereYear('fecha_programada', $fecha->year)
                        ->count(),
                    'correctivos' => Mantenimiento::where('type', 'correctivo')
                        ->whereMonth('fecha_programada', $fecha->month)
                        ->whereYear('fecha_programada', $fecha->year)
                        ->count(),
                ];
            }

            return ResponseFormatter::success($stats, 'Estadísticas del dashboard obtenidas');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Búsqueda avanzada de equipos con múltiples filtros
     */
    public static function advancedEquipmentSearch($filters)
    {
        try {
            $query = Equipo::with(['servicio', 'area', 'propietario', 'usuarioResponsable']);

            // Aplicar filtros
            if (!empty($filters['search'])) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%")
                      ->orWhere('marca', 'like', "%{$search}%")
                      ->orWhere('modelo', 'like', "%{$search}%")
                      ->orWhere('serie', 'like', "%{$search}%");
                });
            }

            if (!empty($filters['servicio_id'])) {
                $query->where('servicio_id', $filters['servicio_id']);
            }

            if (!empty($filters['area_id'])) {
                $query->where('area_id', $filters['area_id']);
            }

            if (!empty($filters['estado'])) {
                $query->where('estado', $filters['estado']);
            }

            if (!empty($filters['riesgo'])) {
                $query->where('riesgo', $filters['riesgo']);
            }

            if (!empty($filters['marca'])) {
                $query->where('marca', $filters['marca']);
            }

            if (!empty($filters['fecha_desde'])) {
                $query->where('created_at', '>=', $filters['fecha_desde']);
            }

            if (!empty($filters['fecha_hasta'])) {
                $query->where('created_at', '<=', $filters['fecha_hasta']);
            }

            if (!empty($filters['costo_min'])) {
                $query->where('costo', '>=', $filters['costo_min']);
            }

            if (!empty($filters['costo_max'])) {
                $query->where('costo', '<=', $filters['costo_max']);
            }

            // Filtros de mantenimiento
            if (!empty($filters['mantenimiento_vencido'])) {
                $query->where('proximo_mantenimiento', '<', now());
            }

            if (!empty($filters['sin_mantenimiento'])) {
                $query->whereNull('ultimo_mantenimiento');
            }

            // Ordenamiento
            $orderBy = $filters['order_by'] ?? 'created_at';
            $orderDirection = $filters['order_direction'] ?? 'desc';
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $filters['per_page'] ?? 10;
            $equipos = $query->paginate($perPage);

            return ResponseFormatter::success($equipos, 'Búsqueda avanzada completada');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en búsqueda avanzada: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener equipos con mantenimientos vencidos
     */
    public static function getOverdueMaintenanceEquipments()
    {
        try {
            $equipos = Equipo::with(['servicio', 'area'])
                ->where('proximo_mantenimiento', '<', now())
                ->where('estado', '!=', 'Baja')
                ->orderBy('proximo_mantenimiento', 'asc')
                ->get();

            $equipos->each(function ($equipo) {
                $equipo->dias_vencido = Carbon::parse($equipo->proximo_mantenimiento)->diffInDays(now());
            });

            return ResponseFormatter::success($equipos, 'Equipos con mantenimiento vencido obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos vencidos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener resumen de cumplimiento de mantenimientos
     */
    public static function getMaintenanceComplianceSummary($year = null)
    {
        try {
            $year = $year ?? date('Y');
            
            $summary = [
                'total_programados' => 0,
                'total_ejecutados' => 0,
                'porcentaje_cumplimiento' => 0,
                'por_mes' => [],
                'por_tipo' => [],
                'por_servicio' => []
            ];

            // Resumen por mes
            for ($mes = 1; $mes <= 12; $mes++) {
                $programados = Mantenimiento::whereYear('fecha_programada', $year)
                    ->whereMonth('fecha_programada', $mes)
                    ->count();
                
                $ejecutados = Mantenimiento::whereYear('fecha_programada', $year)
                    ->whereMonth('fecha_programada', $mes)
                    ->where('status', 'completado')
                    ->count();

                $summary['por_mes'][] = [
                    'mes' => $mes,
                    'nombre_mes' => Carbon::create($year, $mes, 1)->format('F'),
                    'programados' => $programados,
                    'ejecutados' => $ejecutados,
                    'cumplimiento' => $programados > 0 ? round(($ejecutados / $programados) * 100, 2) : 0
                ];

                $summary['total_programados'] += $programados;
                $summary['total_ejecutados'] += $ejecutados;
            }

            // Calcular porcentaje total
            $summary['porcentaje_cumplimiento'] = $summary['total_programados'] > 0 
                ? round(($summary['total_ejecutados'] / $summary['total_programados']) * 100, 2) 
                : 0;

            // Resumen por tipo
            $tipos = ['preventivo', 'correctivo', 'calibracion'];
            foreach ($tipos as $tipo) {
                $programados = Mantenimiento::where('type', $tipo)
                    ->whereYear('fecha_programada', $year)
                    ->count();
                
                $ejecutados = Mantenimiento::where('type', $tipo)
                    ->whereYear('fecha_programada', $year)
                    ->where('status', 'completado')
                    ->count();

                $summary['por_tipo'][] = [
                    'tipo' => $tipo,
                    'programados' => $programados,
                    'ejecutados' => $ejecutados,
                    'cumplimiento' => $programados > 0 ? round(($ejecutados / $programados) * 100, 2) : 0
                ];
            }

            // Resumen por servicio
            $servicios = Servicio::with(['equipos.mantenimientos' => function ($query) use ($year) {
                $query->whereYear('fecha_programada', $year);
            }])->get();

            foreach ($servicios as $servicio) {
                $programados = $servicio->equipos->sum(function ($equipo) {
                    return $equipo->mantenimientos->count();
                });
                
                $ejecutados = $servicio->equipos->sum(function ($equipo) {
                    return $equipo->mantenimientos->where('status', 'completado')->count();
                });

                if ($programados > 0) {
                    $summary['por_servicio'][] = [
                        'servicio' => $servicio->nombre,
                        'programados' => $programados,
                        'ejecutados' => $ejecutados,
                        'cumplimiento' => round(($ejecutados / $programados) * 100, 2)
                    ];
                }
            }

            return ResponseFormatter::success($summary, 'Resumen de cumplimiento obtenido');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener resumen: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener equipos críticos (alto riesgo con mantenimiento vencido)
     */
    public static function getCriticalEquipments()
    {
        try {
            $equipos = Equipo::with(['servicio', 'area', 'contingencias' => function ($query) {
                $query->where('estado', '!=', 'Cerrado');
            }])
            ->where(function ($query) {
                $query->where('riesgo', 'ALTO')
                      ->orWhere('riesgo', 'MEDIO ALTO');
            })
            ->where(function ($query) {
                $query->where('proximo_mantenimiento', '<', now())
                      ->orWhereHas('contingencias', function ($q) {
                          $q->where('estado', '!=', 'Cerrado')
                            ->where('severidad', 'Alta');
                      });
            })
            ->where('estado', '!=', 'Baja')
            ->get();

            $equipos->each(function ($equipo) {
                $equipo->nivel_criticidad = self::calculateCriticalityLevel($equipo);
            });

            // Ordenar por nivel de criticidad
            $equipos = $equipos->sortByDesc('nivel_criticidad');

            return ResponseFormatter::success($equipos, 'Equipos críticos obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos críticos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular nivel de criticidad de un equipo
     */
    private static function calculateCriticalityLevel($equipo)
    {
        $criticidad = 0;

        // Puntos por riesgo
        switch ($equipo->riesgo) {
            case 'ALTO':
                $criticidad += 40;
                break;
            case 'MEDIO ALTO':
                $criticidad += 30;
                break;
            case 'MEDIO':
                $criticidad += 20;
                break;
            case 'BAJO':
                $criticidad += 10;
                break;
        }

        // Puntos por mantenimiento vencido
        if ($equipo->proximo_mantenimiento && Carbon::parse($equipo->proximo_mantenimiento)->isPast()) {
            $diasVencido = Carbon::parse($equipo->proximo_mantenimiento)->diffInDays(now());
            $criticidad += min($diasVencido * 2, 30); // Máximo 30 puntos
        }

        // Puntos por contingencias activas
        $contingenciasActivas = $equipo->contingencias->where('estado', '!=', 'Cerrado');
        $criticidad += $contingenciasActivas->count() * 10;

        // Puntos extra por contingencias críticas
        $contingenciasCriticas = $contingenciasActivas->where('severidad', 'Crítica');
        $criticidad += $contingenciasCriticas->count() * 20;

        return $criticidad;
    }

    /**
     * Obtener datos para reportes consolidados
     */
    public static function getConsolidatedReportData($filters = [])
    {
        try {
            $equipos = Equipo::with([
                'servicio', 
                'area', 
                'propietario',
                'mantenimientos' => function ($query) {
                    $query->whereYear('fecha_programada', date('Y'));
                }
            ]);

            // Aplicar filtros si existen
            if (!empty($filters['servicio_id'])) {
                $equipos->where('servicio_id', $filters['servicio_id']);
            }

            if (!empty($filters['area_id'])) {
                $equipos->where('area_id', $filters['area_id']);
            }

            if (!empty($filters['riesgo'])) {
                $equipos->where('riesgo', $filters['riesgo']);
            }

            $equipos = $equipos->get();

            // Procesar datos para el reporte
            $reportData = $equipos->map(function ($equipo) {
                $mantenimientosProgramados = $equipo->mantenimientos->count();
                $mantenimientosEjecutados = $equipo->mantenimientos->where('status', 'completado')->count();
                
                return [
                    'id' => $equipo->id,
                    'codigo' => $equipo->codigo,
                    'nombre' => $equipo->nombre,
                    'marca' => $equipo->marca,
                    'modelo' => $equipo->modelo,
                    'serie' => $equipo->serie,
                    'estado' => $equipo->estado,
                    'riesgo' => $equipo->riesgo,
                    'servicio' => $equipo->servicio->nombre ?? '',
                    'area' => $equipo->area->nombre ?? '',
                    'propietario' => $equipo->propietario->nombre ?? '',
                    'mantenimientos_programados' => $mantenimientosProgramados,
                    'mantenimientos_ejecutados' => $mantenimientosEjecutados,
                    'cumplimiento' => $mantenimientosProgramados > 0 
                        ? round(($mantenimientosEjecutados / $mantenimientosProgramados) * 100, 2) 
                        : 0,
                    'ultimo_mantenimiento' => $equipo->ultimo_mantenimiento,
                    'proximo_mantenimiento' => $equipo->proximo_mantenimiento,
                    'dias_hasta_mantenimiento' => $equipo->proximo_mantenimiento 
                        ? Carbon::parse($equipo->proximo_mantenimiento)->diffInDays(now(), false)
                        : null
                ];
            });

            return ResponseFormatter::success($reportData, 'Datos para reporte consolidado obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos del reporte: ' . $e->getMessage(), 500);
        }
    }
}
