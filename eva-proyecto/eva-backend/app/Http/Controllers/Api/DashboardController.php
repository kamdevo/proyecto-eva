<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Calibracion;
use App\Models\Contingencia;
use App\Models\Usuario;
use App\Models\Servicio;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * Controlador para el Dashboard principal
 * Proporciona estadísticas y datos en tiempo real
 */
class DashboardController extends ApiController
{
    /**
     * Obtener estadísticas generales del dashboard
     */
    public function getStats()
    {
        try {
            // Cache por 15 minutos
            $stats = Cache::remember('dashboard_stats', 15, function () {
                return [
                    'equipos' => [
                        'total' => Equipo::where('status', true)->count(),
                        'activos' => Equipo::where('status', true)->count(),
                        'criticos' => $this->getEquiposCriticos(),
                        'con_mantenimiento_vencido' => $this->getEquiposMantenimientoVencido()
                    ],
                'mantenimientos' => [
                    'programados_hoy' => Mantenimiento::whereDate('fecha_programada', today())
                        ->where('status', 'programado')->count(),
                    'vencidos' => Mantenimiento::where('status', 'programado')
                        ->where('fecha_programada', '<', now())->count(),
                    'completados_mes' => Mantenimiento::where('status', 'completado')
                        ->whereMonth('fecha_fin', now()->month)
                        ->whereYear('fecha_fin', now()->year)->count(),
                    'cumplimiento' => $this->getCumplimientoMantenimiento()
                ],
                'calibraciones' => [
                    'programadas_mes' => Calibracion::whereMonth('fecha', now()->month)
                        ->whereYear('fecha', now()->year)
                        ->where('estado', 'programada')->count(),
                    'vencidas' => Calibracion::where('fecha_vencimiento', '<', now())
                        ->where('estado', '!=', 'completada')->count(),
                    'completadas_mes' => Calibracion::where('estado', 'completada')
                        ->whereMonth('fecha', now()->month)
                        ->whereYear('fecha', now()->year)->count()
                ],
                'contingencias' => [
                    'activas' => Contingencia::where('estado', '!=', 'Cerrado')->count(),
                    'criticas' => Contingencia::where('severidad', 'Alta')
                        ->where('estado', '!=', 'Cerrado')->count(),
                    'nuevas_semana' => Contingencia::where('fecha', '>=', now()->subWeek())->count()
                ],
                'usuarios' => [
                    'total' => Usuario::where('estado', 1)->count(),
                    'tecnicos' => Usuario::where('rol_id', 2)->where('estado', 1)->count()
                ]
                ];
            });

            return ResponseFormatter::success($stats, 'Estadísticas del dashboard obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener gráficos para el dashboard
     */
    public function getCharts(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $charts = [
                'mantenimientos_por_mes' => $this->getMantenimientosPorMes($year),
                'calibraciones_por_mes' => $this->getCalibracionesPorMes($year),
                'equipos_por_servicio' => $this->getEquiposPorServicio(),
                'equipos_por_riesgo' => $this->getEquiposPorRiesgo(),
                'contingencias_por_severidad' => $this->getContingenciasPorSeveridad(),
                'cumplimiento_mensual' => $this->getCumplimientoMensual($year)
            ];

            return ResponseFormatter::success($charts, 'Gráficos del dashboard obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener gráficos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener alertas del dashboard
     */
    public function getAlertas()
    {
        try {
            $alertas = [
                'mantenimientos_vencidos' => Mantenimiento::with(['equipo:id,name,code'])
                    ->where('status', 'programado')
                    ->where('fecha_programada', '<', now())
                    ->orderBy('fecha_programada', 'asc')
                    ->limit(10)
                    ->get(),
                'calibraciones_vencidas' => Calibracion::with(['equipo:id,name,code'])
                    ->where('fecha_vencimiento', '<', now())
                    ->where('estado', '!=', 'completada')
                    ->orderBy('fecha_vencimiento', 'asc')
                    ->limit(10)
                    ->get(),
                'contingencias_criticas' => Contingencia::with(['equipo:id,name,code'])
                    ->where('severidad', 'Alta')
                    ->where('estado', '!=', 'Cerrado')
                    ->orderBy('fecha', 'desc')
                    ->limit(10)
                    ->get(),
                'equipos_sin_mantenimiento' => Equipo::with(['servicio:id,name', 'area:id,name'])
                    ->whereDoesntHave('mantenimientos', function($query) {
                        $query->where('created_at', '>=', now()->subMonths(6));
                    })
                    ->where('status', true)
                    ->limit(10)
                    ->get()
            ];

            return ResponseFormatter::success($alertas, 'Alertas del dashboard obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener alertas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener actividad reciente
     */
    public function getActividadReciente()
    {
        try {
            $actividades = [
                'mantenimientos_recientes' => Mantenimiento::with(['equipo:id,name,code', 'tecnico:id,nombre,apellido'])
                    ->where('status', 'completado')
                    ->orderBy('fecha_fin', 'desc')
                    ->limit(5)
                    ->get(),
                'calibraciones_recientes' => Calibracion::with(['equipo:id,name,code', 'tecnico:id,nombre,apellido'])
                    ->where('estado', 'completada')
                    ->orderBy('fecha', 'desc')
                    ->limit(5)
                    ->get(),
                'contingencias_recientes' => Contingencia::with(['equipo:id,name,code', 'usuarioReporta:id,nombre,apellido'])
                    ->orderBy('fecha', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return ResponseFormatter::success($actividades, 'Actividad reciente obtenida');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener actividad reciente: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Métodos auxiliares privados
     */
    private function getEquiposCriticos()
    {
        return Equipo::whereHas('clasificacionRiesgo', function($query) {
            $query->whereIn('name', ['ALTO', 'MEDIO ALTO']);
        })
        ->where('status', true)
        ->count();
    }

    private function getEquiposMantenimientoVencido()
    {
        return Equipo::where('fecha_mantenimiento', '<', now()->subDays(30))
            ->where('status', true)
            ->count();
    }

    private function getCumplimientoMantenimiento()
    {
        $programados = Mantenimiento::whereMonth('fecha_programada', now()->month)
            ->whereYear('fecha_programada', now()->year)->count();

        $completados = Mantenimiento::where('status', 'completado')
            ->whereMonth('fecha_programada', now()->month)
            ->whereYear('fecha_programada', now()->year)->count();

        return $programados > 0 ? round(($completados / $programados) * 100, 2) : 0;
    }

    private function getMantenimientosPorMes($year)
    {
        return Mantenimiento::whereYear('fecha_programada', $year)
            ->groupBy(DB::raw('MONTH(fecha_programada)'))
            ->selectRaw('MONTH(fecha_programada) as mes, count(*) as total')
            ->orderBy('mes')
            ->get();
    }

    private function getCalibracionesPorMes($year)
    {
        return Calibracion::whereYear('fecha', $year)
            ->groupBy(DB::raw('MONTH(fecha)'))
            ->selectRaw('MONTH(fecha) as mes, count(*) as total')
            ->orderBy('mes')
            ->get();
    }

    private function getEquiposPorServicio()
    {
        return Equipo::join('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->where('equipos.status', true)
            ->groupBy('servicios.id', 'servicios.name')
            ->selectRaw('servicios.name as servicio, count(*) as total')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();
    }

    private function getEquiposPorRiesgo()
    {
        return Equipo::join('criesgo', 'equipos.criesgo_id', '=', 'criesgo.id')
            ->where('equipos.status', true)
            ->groupBy('criesgo.id', 'criesgo.name')
            ->selectRaw('criesgo.name as riesgo, count(*) as total')
            ->get();
    }

    private function getContingenciasPorSeveridad()
    {
        return Contingencia::where('estado', '!=', 'Cerrado')
            ->groupBy('severidad')
            ->selectRaw('severidad, count(*) as total')
            ->get();
    }

    private function getCumplimientoMensual($year)
    {
        $meses = [];
        for ($i = 1; $i <= 12; $i++) {
            $programados = Mantenimiento::whereYear('fecha_programada', $year)
                ->whereMonth('fecha_programada', $i)->count();

            $completados = Mantenimiento::where('status', 'completado')
                ->whereYear('fecha_programada', $year)
                ->whereMonth('fecha_programada', $i)->count();

            $cumplimiento = $programados > 0 ? round(($completados / $programados) * 100, 2) : 0;

            $meses[] = [
                'mes' => $i,
                'programados' => $programados,
                'completados' => $completados,
                'cumplimiento' => $cumplimiento
            ];
        }

        return $meses;
    }

    /**
     * Obtener resumen ejecutivo
     */
    public function getResumenEjecutivo(Request $request)
    {
        try {
            $periodo = $request->get('periodo', 'mes'); // mes, trimestre, año

            $fechaInicio = match($periodo) {
                'mes' => now()->startOfMonth(),
                'trimestre' => now()->startOfQuarter(),
                'año' => now()->startOfYear(),
                default => now()->startOfMonth()
            };

            $resumen = [
                'periodo' => $periodo,
                'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                'fecha_fin' => now()->format('Y-m-d'),
                'equipos' => [
                    'total_inventario' => Equipo::where('status', true)->count(),
                    'valor_total' => Equipo::where('status', true)->sum('costo'),
                    'nuevos_periodo' => Equipo::where('created_at', '>=', $fechaInicio)->count()
                ],
                'mantenimientos' => [
                    'realizados' => Mantenimiento::where('status', 'completado')
                        ->where('fecha_fin', '>=', $fechaInicio)->count(),
                    'costo_total' => Mantenimiento::where('status', 'completado')
                        ->where('fecha_fin', '>=', $fechaInicio)->sum('costo'),
                    'tiempo_promedio' => Mantenimiento::where('status', 'completado')
                        ->where('fecha_fin', '>=', $fechaInicio)->avg('tiempo_real')
                ],
                'calibraciones' => [
                    'realizadas' => Calibracion::where('estado', 'completada')
                        ->where('fecha', '>=', $fechaInicio)->count(),
                    'conformes' => Calibracion::where('estado', 'completada')
                        ->where('resultado', 'conforme')
                        ->where('fecha', '>=', $fechaInicio)->count(),
                    'costo_total' => Calibracion::where('estado', 'completada')
                        ->where('fecha', '>=', $fechaInicio)->sum('costo')
                ],
                'contingencias' => [
                    'reportadas' => Contingencia::where('fecha', '>=', $fechaInicio)->count(),
                    'resueltas' => Contingencia::where('estado', 'Cerrado')
                        ->where('fecha_cierre', '>=', $fechaInicio)->count(),
                    'tiempo_promedio_resolucion' => $this->getTiempoPromedioResolucion($fechaInicio)
                ]
            ];

            return ResponseFormatter::success($resumen, 'Resumen ejecutivo obtenido');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener resumen ejecutivo: ' . $e->getMessage(), 500);
        }
    }

    private function getTiempoPromedioResolucion($fechaInicio)
    {
        $contingencias = Contingencia::where('estado', 'Cerrado')
            ->where('fecha_cierre', '>=', $fechaInicio)
            ->whereNotNull('fecha_cierre')
            ->get();

        if ($contingencias->isEmpty()) {
            return 0;
        }

        $tiempoTotal = 0;
        foreach ($contingencias as $contingencia) {
            $tiempoTotal += Carbon::parse($contingencia->fecha)->diffInHours(Carbon::parse($contingencia->fecha_cierre));
        }

        return round($tiempoTotal / $contingencias->count(), 2);
    }
}
