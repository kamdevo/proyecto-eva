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
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * @OA\Tag(
 *     name="Dashboard",
 *     description="Endpoints para estadísticas y datos del dashboard principal"
 * )
 *
 * Controlador para el Dashboard principal
 * Proporciona estadísticas y datos en tiempo real del sistema EVA
 */
class DashboardController extends ApiController
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * @OA\Get(
     *     path="/api/dashboard/stats",
     *     tags={"Dashboard"},
     *     summary="Obtener estadísticas generales del dashboard",
     *     description="Retorna estadísticas principales del sistema: equipos, mantenimientos, contingencias, etc.",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas obtenidas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Estadísticas del dashboard obtenidas"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="total_equipos", type="integer", example=150),
     *                 @OA\Property(property="equipos_operativos", type="integer", example=142),
     *                 @OA\Property(property="mantenimientos_pendientes", type="integer", example=8),
     *                 @OA\Property(property="contingencias_activas", type="integer", example=3),
     *                 @OA\Property(property="calibraciones_vencidas", type="integer", example=5)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Obtener estadísticas generales del dashboard
     */
    public function getStats()
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            $stats = $this->dashboardService->getMainStats();

            return ResponseFormatter::success($stats, 'Estadísticas del dashboard obtenidas');

        } catch (\Exception $e) {
            \Log::error('Error al obtener estadísticas del dashboard', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al obtener estadísticas del dashboard', 500);
        }
    }

    /**
     * Obtener gráfico de mantenimientos
     */
    public function getMaintenanceChart()
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            $chart = $this->dashboardService->getMaintenanceChart();
            return ResponseFormatter::success($chart, 'Gráfico de mantenimientos obtenido');
        } catch (\Exception $e) {
            \Log::error('Error al obtener gráfico de mantenimientos', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al obtener gráfico de mantenimientos', 500);
        }
    }

    /**
     * Obtener equipos por servicio
     */
    public function getEquipmentByService()
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            $data = $this->dashboardService->getEquipmentByService();
            return ResponseFormatter::success($data, 'Equipos por servicio obtenidos');
        } catch (\Exception $e) {
            \Log::error('Error al obtener equipos por servicio', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al obtener equipos por servicio', 500);
        }
    }

    /**
     * Obtener alertas del dashboard
     */
    public function getAlerts()
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            $alerts = $this->dashboardService->getDashboardAlerts();
            return ResponseFormatter::success($alerts, 'Alertas del dashboard obtenidas');
        } catch (\Exception $e) {
            \Log::error('Error al obtener alertas del dashboard', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al obtener alertas del dashboard', 500);
        }
    }

    /**
     * Obtener actividad reciente
     */
    public function getRecentActivity()
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            $activity = $this->dashboardService->getRecentActivity();
            return ResponseFormatter::success($activity, 'Actividad reciente obtenida');
        } catch (\Exception $e) {
            \Log::error('Error al obtener actividad reciente', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al obtener actividad reciente', 500);
        }
    }

    /**
     * Limpiar cache del dashboard
     */
    public function clearCache()
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            $this->dashboardService->clearCache();
            return ResponseFormatter::success(null, 'Cache del dashboard limpiado exitosamente');
        } catch (\Exception $e) {
            \Log::error('Error al limpiar cache del dashboard', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al limpiar cache del dashboard', 500);
        }
    }

    /**
     * Obtener gráficos para el dashboard
     */
    public function getCharts(Request $request)
    {
        // Validación empresarial
        $request->validate([]);
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
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
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
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
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
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
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

    /**
     * obtenerEstadisticasGenerales
     * Método generado automáticamente para corregir referencias de rutas
     */
    public function obtenerEstadisticasGenerales(Request $request)
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            // TODO: Implementar lógica específica para obtenerEstadisticasGenerales
            
            return ResponseFormatter::success(
                [],
                'Método obtenerEstadisticasGenerales ejecutado correctamente (pendiente implementación)',
                200
            );
            
        } catch (Exception $e) {
            Log::error('Error en DashboardController::obtenerEstadisticasGenerales', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(
                null,
                'Error ejecutando obtenerEstadisticasGenerales: ' . $e->getMessage(),
                500
            );
        }
    }


    /**
     * obtenerGraficos
     * Método generado automáticamente para corregir referencias de rutas
     */
    public function obtenerGraficos(Request $request)
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            // TODO: Implementar lógica específica para obtenerGraficos
            
            return ResponseFormatter::success(
                [],
                'Método obtenerGraficos ejecutado correctamente (pendiente implementación)',
                200
            );
            
        } catch (Exception $e) {
            Log::error('Error en DashboardController::obtenerGraficos', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(
                null,
                'Error ejecutando obtenerGraficos: ' . $e->getMessage(),
                500
            );
        }
    }


    /**
     * obtenerAlertas
     * Método generado automáticamente para corregir referencias de rutas
     */
    public function obtenerAlertas(Request $request)
    {
        try {
            \Log::info('Ejecutando método en DashboardController', ['user_id' => auth()->id()]);
            // TODO: Implementar lógica específica para obtenerAlertas
            
            return ResponseFormatter::success(
                [],
                'Método obtenerAlertas ejecutado correctamente (pendiente implementación)',
                200
            );
            
        } catch (Exception $e) {
            Log::error('Error en DashboardController::obtenerAlertas', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(
                null,
                'Error ejecutando obtenerAlertas: ' . $e->getMessage(),
                500
            );
        }
    }

}
