<?php

namespace App\Services;

use App\Contracts\DashboardServiceInterface;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Usuario;
use App\Models\Calibracion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardService implements DashboardServiceInterface
{
    /**
     * Obtener estadísticas principales del dashboard
     */
    public function getMainStats(): array
    {
        return Cache::remember('dashboard_main_stats', 15, function () {
            return [
                'equipos' => $this->getEquipmentStats(),
                'mantenimientos' => $this->getMaintenanceStats(),
                'contingencias' => $this->getContingencyStats(),
                'calibraciones' => $this->getCalibrationStats(),
                'usuarios' => $this->getUserStats()
            ];
        });
    }

    /**
     * Obtener estadísticas de equipos
     */
    private function getEquipmentStats(): array
    {
        $total = Equipo::count();
        $activos = Equipo::where('status', true)->count();
        $criticos = $this->getCriticalEquipment();
        $mantenimientoVencido = $this->getOverdueMaintenanceEquipment();

        return [
            'total' => $total,
            'activos' => $activos,
            'inactivos' => $total - $activos,
            'criticos' => $criticos,
            'con_mantenimiento_vencido' => $mantenimientoVencido,
            'porcentaje_activos' => $total > 0 ? round(($activos / $total) * 100, 1) : 0
        ];
    }

    /**
     * Obtener estadísticas de mantenimientos
     */
    private function getMaintenanceStats(): array
    {
        $total = Mantenimiento::count();
        $programados = Mantenimiento::where('status', 'programado')->count();
        $enProceso = Mantenimiento::where('status', 'en_proceso')->count();
        $completados = Mantenimiento::where('status', 'completado')->count();
        $vencidos = Mantenimiento::where('status', 'programado')
            ->where('fecha_programada', '<', now())
            ->count();
        $proximosVencer = Mantenimiento::where('status', 'programado')
            ->whereBetween('fecha_programada', [now(), now()->addDays(7)])
            ->count();

        return [
            'total' => $total,
            'programados' => $programados,
            'en_proceso' => $enProceso,
            'completados' => $completados,
            'vencidos' => $vencidos,
            'proximos_vencer' => $proximosVencer,
            'eficiencia' => $total > 0 ? round(($completados / $total) * 100, 1) : 0
        ];
    }

    /**
     * Obtener estadísticas de contingencias
     */
    private function getContingencyStats(): array
    {
        $total = Contingencia::count();
        $abiertas = Contingencia::where('estado_id', '!=', 3)->count(); // 3 = Cerrado
        $criticas = Contingencia::where('prioridad', 'alta')
            ->where('estado_id', '!=', 3)
            ->count();
        $resueltas = Contingencia::where('estado_id', 3)->count();

        return [
            'total' => $total,
            'abiertas' => $abiertas,
            'criticas' => $criticas,
            'resueltas' => $resueltas,
            'tasa_resolucion' => $total > 0 ? round(($resueltas / $total) * 100, 1) : 0
        ];
    }

    /**
     * Obtener estadísticas de calibraciones
     */
    private function getCalibrationStats(): array
    {
        $total = Calibracion::count();
        $vigentes = Calibracion::where('estado', 'vigente')->count();
        $vencidas = Calibracion::where('fecha_vencimiento', '<', now())->count();
        $proximasVencer = Calibracion::where('estado', 'vigente')
            ->whereBetween('fecha_vencimiento', [now(), now()->addDays(30)])
            ->count();

        return [
            'total' => $total,
            'vigentes' => $vigentes,
            'vencidas' => $vencidas,
            'proximas_vencer' => $proximasVencer,
            'cumplimiento' => $total > 0 ? round(($vigentes / $total) * 100, 1) : 0
        ];
    }

    /**
     * Obtener estadísticas de usuarios
     */
    private function getUserStats(): array
    {
        $total = Usuario::where('estado', 1)->count();
        $tecnicos = Usuario::where('rol_id', 2)->where('estado', 1)->count();
        $administradores = Usuario::where('rol_id', 1)->where('estado', 1)->count();

        return [
            'total' => $total,
            'tecnicos' => $tecnicos,
            'administradores' => $administradores,
            'otros' => $total - $tecnicos - $administradores
        ];
    }

    /**
     * Obtener equipos críticos
     */
    private function getCriticalEquipment(): int
    {
        return Equipo::where('criesgo_id', 1) // Asumiendo que 1 = Alto riesgo
            ->where('status', true)
            ->count();
    }

    /**
     * Obtener equipos con mantenimiento vencido
     */
    private function getOverdueMaintenanceEquipment(): int
    {
        return Equipo::whereHas('mantenimientos', function ($query) {
            $query->where('status', 'programado')
                  ->where('fecha_programada', '<', now());
        })->count();
    }

    /**
     * Obtener gráfico de mantenimientos por mes
     */
    public function getMaintenanceChart(): array
    {
        return Cache::remember('dashboard_maintenance_chart', 60, function () {
            $months = [];
            $data = [];

            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $months[] = $date->format('M Y');
                
                $count = Mantenimiento::whereYear('fecha_programada', $date->year)
                    ->whereMonth('fecha_programada', $date->month)
                    ->count();
                    
                $data[] = $count;
            }

            return [
                'labels' => $months,
                'data' => $data
            ];
        });
    }

    /**
     * Obtener equipos por servicio
     */
    public function getEquipmentByService(): array
    {
        return Cache::remember('dashboard_equipment_by_service', 30, function () {
            return DB::table('equipos')
                ->join('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                ->select('servicios.nombre', DB::raw('count(*) as total'))
                ->where('equipos.status', true)
                ->groupBy('servicios.id', 'servicios.nombre')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get()
                ->toArray();
        });
    }

    /**
     * Obtener alertas del dashboard
     */
    public function getDashboardAlerts(): array
    {
        return Cache::remember('dashboard_alerts', 5, function () {
            $alerts = [];

            // Mantenimientos vencidos
            $overdueCount = Mantenimiento::where('status', 'programado')
                ->where('fecha_programada', '<', now())
                ->count();
            
            if ($overdueCount > 0) {
                $alerts[] = [
                    'type' => 'danger',
                    'title' => 'Mantenimientos Vencidos',
                    'message' => "Hay {$overdueCount} mantenimiento(s) vencido(s)",
                    'count' => $overdueCount,
                    'action' => '/mantenimientos?status=vencido'
                ];
            }

            // Calibraciones próximas a vencer
            $calibrationsExpiring = Calibracion::where('estado', 'vigente')
                ->whereBetween('fecha_vencimiento', [now(), now()->addDays(30)])
                ->count();
                
            if ($calibrationsExpiring > 0) {
                $alerts[] = [
                    'type' => 'warning',
                    'title' => 'Calibraciones por Vencer',
                    'message' => "Hay {$calibrationsExpiring} calibración(es) que vence(n) en 30 días",
                    'count' => $calibrationsExpiring,
                    'action' => '/calibraciones?status=proximas_vencer'
                ];
            }

            // Contingencias críticas abiertas
            $criticalContingencies = Contingencia::where('prioridad', 'alta')
                ->where('estado_id', '!=', 3)
                ->count();
                
            if ($criticalContingencies > 0) {
                $alerts[] = [
                    'type' => 'danger',
                    'title' => 'Contingencias Críticas',
                    'message' => "Hay {$criticalContingencies} contingencia(s) crítica(s) abiertas",
                    'count' => $criticalContingencies,
                    'action' => '/contingencias?prioridad=alta&estado=abierta'
                ];
            }

            return $alerts;
        });
    }

    /**
     * Limpiar cache del dashboard
     */
    public function clearCache(): void
    {
        $cacheKeys = [
            'dashboard_main_stats',
            'dashboard_maintenance_chart',
            'dashboard_equipment_by_service',
            'dashboard_alerts'
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Obtener resumen de actividad reciente
     */
    public function getRecentActivity(): array
    {
        return Cache::remember('dashboard_recent_activity', 10, function () {
            $activities = [];

            // Mantenimientos recientes
            $recentMaintenances = Mantenimiento::with(['equipo:id,name', 'tecnico:id,nombre'])
                ->where('created_at', '>=', now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            foreach ($recentMaintenances as $maintenance) {
                $activities[] = [
                    'type' => 'maintenance',
                    'title' => 'Mantenimiento programado',
                    'description' => "Equipo: {$maintenance->equipo->name}",
                    'user' => $maintenance->tecnico->nombre ?? 'Sistema',
                    'date' => $maintenance->created_at,
                    'icon' => 'wrench'
                ];
            }

            // Contingencias recientes
            $recentContingencies = Contingencia::with(['equipo:id,name', 'usuario:id,nombre'])
                ->where('created_at', '>=', now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            foreach ($recentContingencies as $contingency) {
                $activities[] = [
                    'type' => 'contingency',
                    'title' => 'Nueva contingencia',
                    'description' => "Equipo: {$contingency->equipo->name}",
                    'user' => $contingency->usuario->nombre ?? 'Sistema',
                    'date' => $contingency->created_at,
                    'icon' => 'alert-triangle'
                ];
            }

            // Ordenar por fecha
            usort($activities, function ($a, $b) {
                return $b['date'] <=> $a['date'];
            });

            return array_slice($activities, 0, 10);
        });
    }
}
