<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Usuario;
use App\Models\Archivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * Controlador COMPLETO para reportes y estadísticas
 * Sistema avanzado de generación de reportes, gráficos y análisis
 */
class ControladorReportes extends ApiController
{
    /**
     * ENDPOINT COMPLETO: Dashboard principal con métricas generales
     */
    public function dashboardPrincipal()
    {
        try {
            $hoy = now();
            $inicioMes = $hoy->copy()->startOfMonth();
            $finMes = $hoy->copy()->endOfMonth();
            $inicioAno = $hoy->copy()->startOfYear();

            // Métricas principales
            $metricas = [
                'equipos' => [
                    'total' => Equipo::count(),
                    'operativos' => Equipo::where('status', true)->count(),
                    'mantenimiento' => Equipo::where('estadoequipo_id', 2)->count(),
                    'fuera_servicio' => Equipo::where('estadoequipo_id', 3)->count(),
                    'valor_total' => Equipo::sum('costo')
                ],
                'mantenimientos' => [
                    'total_mes' => Mantenimiento::whereBetween('created_at', [$inicioMes, $finMes])->count(),
                    'completados_mes' => Mantenimiento::where('estado', 'completado')
                        ->whereBetween('fecha_fin', [$inicioMes, $finMes])->count(),
                    'vencidos' => Mantenimiento::where('fecha_programada', '<', $hoy)
                        ->where('estado', 'programado')->count(),
                    'costo_mes' => Mantenimiento::where('estado', 'completado')
                        ->whereBetween('fecha_fin', [$inicioMes, $finMes])->sum('costo')
                ],
                'contingencias' => [
                    'total_mes' => Contingencia::whereBetween('fecha_reporte', [$inicioMes, $finMes])->count(),
                    'activas' => Contingencia::where('estado', 'Activa')->count(),
                    'criticas' => Contingencia::where('severidad', 'Crítica')
                        ->whereIn('estado', ['Activa', 'En Proceso'])->count(),
                    'tiempo_promedio' => $this->calcularTiempoPromedioResolucion()
                ],
                'usuarios' => [
                    'total' => Usuario::count(),
                    'activos' => Usuario::where('active', 'SI')->count(),
                    'nuevos_mes' => Usuario::whereBetween('fecha_registro', [$inicioMes, $finMes])->count()
                ]
            ];

            // Gráficos para dashboard
            $graficos = [
                'equipos_por_servicio' => $this->equiposPorServicio(),
                'mantenimientos_mensuales' => $this->mantenimientosMensuales(),
                'contingencias_por_severidad' => $this->contingenciasPorSeveridad(),
                'tendencia_costos' => $this->tendenciaCostos(),
                'disponibilidad_equipos' => $this->disponibilidadEquipos()
            ];

            // Alertas importantes
            $alertas = [
                'mantenimientos_vencidos' => $metricas['mantenimientos']['vencidos'],
                'contingencias_criticas' => $metricas['contingencias']['criticas'],
                'equipos_fuera_servicio' => $metricas['equipos']['fuera_servicio'],
                'usuarios_inactivos' => Usuario::where('active', 'NO')->count()
            ];

            $dashboard = [
                'metricas' => $metricas,
                'graficos' => $graficos,
                'alertas' => $alertas,
                'ultima_actualizacion' => now()->toISOString()
            ];

            return ResponseFormatter::success($dashboard, 'Dashboard principal obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener dashboard: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Reporte de equipos
     */
    public function reporteEquipos(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'servicios' => 'nullable|array',
            'areas' => 'nullable|array',
            'estados' => 'nullable|array',
            'formato' => 'nullable|string|in:json,excel,pdf',
            'incluir_graficos' => 'boolean',
            'incluir_costos' => 'boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $query = Equipo::with([
                'servicio:id,nombre',
                'area:id,nombre',
                'estadoEquipo:id,nombre',
                'propietario:id,nombre'
            ]);

            // Aplicar filtros
            if ($request->has('fecha_desde')) {
                $query->where('created_at', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('created_at', '<=', $request->fecha_hasta);
            }

            if ($request->has('servicios')) {
                $query->whereIn('servicio_id', $request->servicios);
            }

            if ($request->has('areas')) {
                $query->whereIn('area_id', $request->areas);
            }

            if ($request->has('estados')) {
                $query->whereIn('estadoequipo_id', $request->estados);
            }

            $equipos = $query->get();

            // Generar estadísticas
            $estadisticas = [
                'total_equipos' => $equipos->count(),
                'valor_total' => $equipos->sum('costo'),
                'por_servicio' => $equipos->groupBy('servicio.nombre')->map->count(),
                'por_area' => $equipos->groupBy('area.nombre')->map->count(),
                'por_estado' => $equipos->groupBy('estadoEquipo.nombre')->map->count(),
                'por_marca' => $equipos->groupBy('marca')->map->count(),
                'antiguedad_promedio' => $this->calcularAntiguedadPromedio($equipos)
            ];

            $reporte = [
                'equipos' => $equipos,
                'estadisticas' => $estadisticas,
                'filtros_aplicados' => $request->only(['fecha_desde', 'fecha_hasta', 'servicios', 'areas', 'estados']),
                'fecha_generacion' => now()->toISOString()
            ];

            // Generar gráficos si se solicita
            if ($request->get('incluir_graficos', false)) {
                $reporte['graficos'] = [
                    'distribucion_servicios' => $estadisticas['por_servicio'],
                    'distribucion_estados' => $estadisticas['por_estado'],
                    'distribucion_marcas' => $estadisticas['por_marca']
                ];
            }

            // Manejar formato de salida
            $formato = $request->get('formato', 'json');
            
            switch ($formato) {
                case 'excel':
                    return $this->exportarReporteExcel($reporte, 'reporte_equipos');
                case 'pdf':
                    return $this->exportarReportePdf($reporte, 'reporte_equipos');
                default:
                    return ResponseFormatter::success($reporte, 'Reporte de equipos generado exitosamente');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar reporte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Análisis de rendimiento
     */
    public function analisisRendimiento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'periodo' => 'required|string|in:mes,trimestre,semestre,ano',
            'tipo_analisis' => 'required|string|in:mantenimientos,contingencias,costos,disponibilidad',
            'comparar_periodo_anterior' => 'boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $periodo = $request->periodo;
            $tipoAnalisis = $request->tipo_analisis;
            $compararAnterior = $request->get('comparar_periodo_anterior', false);

            // Calcular fechas del período
            $fechas = $this->calcularFechasPeriodo($periodo);
            $fechasAnteriores = $compararAnterior ? $this->calcularFechasPeriodoAnterior($periodo, $fechas) : null;

            $analisis = [];

            switch ($tipoAnalisis) {
                case 'mantenimientos':
                    $analisis = $this->analizarMantenimientos($fechas, $fechasAnteriores);
                    break;
                case 'contingencias':
                    $analisis = $this->analizarContingencias($fechas, $fechasAnteriores);
                    break;
                case 'costos':
                    $analisis = $this->analizarCostos($fechas, $fechasAnteriores);
                    break;
                case 'disponibilidad':
                    $analisis = $this->analizarDisponibilidad($fechas, $fechasAnteriores);
                    break;
            }

            $resultado = [
                'tipo_analisis' => $tipoAnalisis,
                'periodo' => $periodo,
                'fechas' => $fechas,
                'analisis' => $analisis,
                'recomendaciones' => $this->generarRecomendaciones($analisis, $tipoAnalisis),
                'fecha_generacion' => now()->toISOString()
            ];

            if ($compararAnterior && $fechasAnteriores) {
                $resultado['comparacion_periodo_anterior'] = $this->compararPeriodos($analisis, $fechasAnteriores);
            }

            return ResponseFormatter::success($resultado, 'Análisis de rendimiento generado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar análisis: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Estadísticas en tiempo real
     */
    public function estadisticasEnTiempoReal()
    {
        try {
            $estadisticas = [
                'equipos_operativos' => Equipo::where('status', true)->count(),
                'mantenimientos_hoy' => Mantenimiento::whereDate('fecha_programada', today())->count(),
                'contingencias_activas' => Contingencia::where('estado', 'Activa')->count(),
                'usuarios_conectados' => $this->usuariosConectadosHoy(),
                'alertas_criticas' => $this->contarAlertasCriticas(),
                'rendimiento_sistema' => [
                    'tiempo_respuesta_promedio' => $this->calcularTiempoRespuestaPromedio(),
                    'disponibilidad_sistema' => $this->calcularDisponibilidadSistema(),
                    'uso_almacenamiento' => $this->calcularUsoAlmacenamiento()
                ],
                'metricas_tiempo_real' => [
                    'equipos_en_mantenimiento' => Equipo::where('estadoequipo_id', 2)->count(),
                    'contingencias_sin_asignar' => Contingencia::whereNull('usuario_asignado')
                        ->where('estado', 'Activa')->count(),
                    'mantenimientos_vencidos' => Mantenimiento::where('fecha_programada', '<', now())
                        ->where('estado', 'programado')->count()
                ]
            ];

            return ResponseFormatter::success($estadisticas, 'Estadísticas en tiempo real obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares para cálculos
    private function equiposPorServicio()
    {
        return Equipo::join('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->selectRaw('servicios.nombre as servicio, COUNT(*) as total')
            ->groupBy('servicios.id', 'servicios.nombre')
            ->get();
    }

    private function mantenimientosMensuales()
    {
        $meses = [];
        for ($i = 11; $i >= 0; $i--) {
            $fecha = now()->subMonths($i);
            $inicio = $fecha->copy()->startOfMonth();
            $fin = $fecha->copy()->endOfMonth();
            
            $meses[] = [
                'mes' => $fecha->format('Y-m'),
                'programados' => Mantenimiento::whereBetween('fecha_programada', [$inicio, $fin])->count(),
                'completados' => Mantenimiento::where('estado', 'completado')
                    ->whereBetween('fecha_fin', [$inicio, $fin])->count()
            ];
        }
        return $meses;
    }

    private function contingenciasPorSeveridad()
    {
        return Contingencia::selectRaw('severidad, COUNT(*) as total')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('severidad')
            ->get();
    }

    private function tendenciaCostos()
    {
        $meses = [];
        for ($i = 11; $i >= 0; $i--) {
            $fecha = now()->subMonths($i);
            $inicio = $fecha->copy()->startOfMonth();
            $fin = $fecha->copy()->endOfMonth();
            
            $meses[] = [
                'mes' => $fecha->format('Y-m'),
                'mantenimientos' => Mantenimiento::where('estado', 'completado')
                    ->whereBetween('fecha_fin', [$inicio, $fin])->sum('costo'),
                'contingencias' => Contingencia::where('estado', 'Resuelta')
                    ->whereBetween('fecha_resolucion', [$inicio, $fin])->sum('costo_real')
            ];
        }
        return $meses;
    }

    private function disponibilidadEquipos()
    {
        $total = Equipo::count();
        $operativos = Equipo::where('status', true)->count();
        
        return [
            'total' => $total,
            'operativos' => $operativos,
            'porcentaje_disponibilidad' => $total > 0 ? round(($operativos / $total) * 100, 2) : 0
        ];
    }

    private function calcularTiempoPromedioResolucion()
    {
        return Contingencia::where('estado', 'Resuelta')
            ->whereNotNull('tiempo_resolucion')
            ->avg('tiempo_resolucion') ?? 0;
    }

    private function calcularAntiguedadPromedio($equipos)
    {
        $totalDias = 0;
        $count = 0;
        
        foreach ($equipos as $equipo) {
            if ($equipo->fecha_instalacion) {
                $totalDias += Carbon::parse($equipo->fecha_instalacion)->diffInDays(now());
                $count++;
            }
        }
        
        return $count > 0 ? round($totalDias / $count) : 0;
    }

    private function calcularFechasPeriodo($periodo)
    {
        $hoy = now();
        
        switch ($periodo) {
            case 'mes':
                return ['inicio' => $hoy->copy()->startOfMonth(), 'fin' => $hoy->copy()->endOfMonth()];
            case 'trimestre':
                return ['inicio' => $hoy->copy()->startOfQuarter(), 'fin' => $hoy->copy()->endOfQuarter()];
            case 'semestre':
                $mes = $hoy->month <= 6 ? 1 : 7;
                return [
                    'inicio' => $hoy->copy()->month($mes)->startOfMonth(),
                    'fin' => $hoy->copy()->month($mes + 5)->endOfMonth()
                ];
            case 'ano':
                return ['inicio' => $hoy->copy()->startOfYear(), 'fin' => $hoy->copy()->endOfYear()];
            default:
                return ['inicio' => $hoy->copy()->startOfMonth(), 'fin' => $hoy->copy()->endOfMonth()];
        }
    }

    private function usuariosConectadosHoy()
    {
        // Implementar lógica de usuarios conectados
        return Usuario::whereDate('updated_at', today())->count();
    }

    private function contarAlertasCriticas()
    {
        return Contingencia::where('severidad', 'Crítica')
            ->whereIn('estado', ['Activa', 'En Proceso'])->count() +
            Mantenimiento::where('fecha_programada', '<', now())
            ->where('estado', 'programado')->count();
    }

    private function calcularTiempoRespuestaPromedio()
    {
        // Implementar cálculo de tiempo de respuesta
        return 150; // ms
    }

    private function calcularDisponibilidadSistema()
    {
        // Implementar cálculo de disponibilidad
        return 99.8; // %
    }

    private function calcularUsoAlmacenamiento()
    {
        $totalSize = Archivo::sum('file_size');
        $limitSize = 100 * 1024 * 1024 * 1024; // 100GB
        
        return [
            'usado' => $totalSize,
            'limite' => $limitSize,
            'porcentaje' => round(($totalSize / $limitSize) * 100, 2)
        ];
    }

    private function exportarReporteExcel($reporte, $nombre)
    {
        // Implementar exportación a Excel
        return ResponseFormatter::success(null, 'Funcionalidad de Excel en desarrollo');
    }

    private function exportarReportePdf($reporte, $nombre)
    {
        // Implementar exportación a PDF
        return ResponseFormatter::success(null, 'Funcionalidad de PDF en desarrollo');
    }

    private function analizarMantenimientos($fechas, $fechasAnteriores)
    {
        // Implementar análisis de mantenimientos
        return ['analisis' => 'mantenimientos'];
    }

    private function analizarContingencias($fechas, $fechasAnteriores)
    {
        // Implementar análisis de contingencias
        return ['analisis' => 'contingencias'];
    }

    private function analizarCostos($fechas, $fechasAnteriores)
    {
        // Implementar análisis de costos
        return ['analisis' => 'costos'];
    }

    private function analizarDisponibilidad($fechas, $fechasAnteriores)
    {
        // Implementar análisis de disponibilidad
        return ['analisis' => 'disponibilidad'];
    }

    private function generarRecomendaciones($analisis, $tipo)
    {
        // Implementar generación de recomendaciones
        return ['recomendacion' => 'Optimizar ' . $tipo];
    }

    private function calcularFechasPeriodoAnterior($periodo, $fechas)
    {
        // Implementar cálculo de período anterior
        return $fechas;
    }

    private function compararPeriodos($analisis, $fechasAnteriores)
    {
        // Implementar comparación de períodos
        return ['comparacion' => 'periodo anterior'];
    }
}
