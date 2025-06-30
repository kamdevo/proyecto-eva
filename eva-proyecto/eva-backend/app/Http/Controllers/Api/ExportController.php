<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Services\Export\Reports\EquiposReportService;
use App\Services\Export\Reports\MantenimientoReportService;
use App\Services\Export\Reports\ContingenciasReportService;
use App\Services\Export\Reports\CalibracionesReportService;
use App\Services\Export\Reports\InventarioReportService;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Exportación",
 *     description="Endpoints para exportación de reportes especializados"
 * )
 *
 * Controlador coordinador para exportación de reportes
 * Delega la funcionalidad a servicios especializados refactorizados
 *
 * Arquitectura: Patrón de inyección de dependencias con servicios especializados
 * - EquiposReportService: Reportes de equipos consolidados y críticos
 * - MantenimientoReportService: Plantillas y estadísticas de mantenimiento
 * - ContingenciasReportService: Reportes de contingencias
 * - CalibracionesReportService: Reportes de calibraciones
 * - InventarioReportService: Reportes de inventario y tickets
 */
class ExportController extends ApiController
{
    protected $equiposReportService;
    protected $mantenimientoReportService;
    protected $contingenciasReportService;
    protected $calibracionesReportService;
    protected $inventarioReportService;

    public function __construct(
        EquiposReportService $equiposReportService,
        MantenimientoReportService $mantenimientoReportService,
        ContingenciasReportService $contingenciasReportService,
        CalibracionesReportService $calibracionesReportService,
        InventarioReportService $inventarioReportService
    ) {
        $this->equiposReportService = $equiposReportService;
        $this->mantenimientoReportService = $mantenimientoReportService;
        $this->contingenciasReportService = $contingenciasReportService;
        $this->calibracionesReportService = $calibracionesReportService;
        $this->inventarioReportService = $inventarioReportService;
    }

    /**
     * @OA\Post(
     *     path="/api/export/equipos-consolidado",
     *     tags={"Exportación"},
     *     summary="Exportar reporte consolidado de equipos",
     *     description="Genera un reporte consolidado de equipos seleccionados con opciones configurables de información a incluir",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"equipos_ids", "formato", "incluir"},
     *             @OA\Property(property="equipos_ids", type="array", @OA\Items(type="integer"), description="IDs de equipos a incluir", example={1, 2, 3}),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel", "csv"}, description="Formato de exportación", example="excel"),
     *             @OA\Property(
     *                 property="incluir",
     *                 type="object",
     *                 description="Opciones de información a incluir",
     *                 @OA\Property(property="detalles_equipo", type="boolean", example=true),
     *                 @OA\Property(property="cronograma", type="boolean", example=true),
     *                 @OA\Property(property="cumplimiento", type="boolean", example=true),
     *                 @OA\Property(property="responsables", type="boolean", example=true),
     *                 @OA\Property(property="estadisticas", type="boolean", example=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Archivo de reporte generado exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar equipos consolidado
     */
    public function exportEquiposConsolidado(Request $request)
    {
        return $this->equiposReportService->exportEquiposConsolidado($request);
    }

    /**
     * @OA\Post(
     *     path="/api/export/plantilla-mantenimiento",
     *     tags={"Exportación"},
     *     summary="Exportar plantilla de mantenimiento",
     *     description="Genera una plantilla de mantenimientos programados para un año específico",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"año", "formato"},
     *             @OA\Property(property="año", type="integer", minimum=2020, maximum=2030, description="Año de la plantilla", example=2024),
     *             @OA\Property(property="mes", type="integer", minimum=1, maximum=12, description="Mes específico (opcional)", example=3),
     *             @OA\Property(property="servicio_id", type="integer", description="ID del servicio (opcional)", example=1),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel"}, description="Formato de exportación", example="excel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Plantilla de mantenimiento generada exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar plantilla de mantenimiento
     */
    public function exportPlantillaMantenimiento(Request $request)
    {
        return $this->mantenimientoReportService->exportPlantillaMantenimiento($request);
    }

    /**
     * @OA\Post(
     *     path="/api/export/contingencias",
     *     tags={"Exportación"},
     *     summary="Exportar reporte de contingencias",
     *     description="Genera un reporte de contingencias en un rango de fechas con filtros opcionales",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"fecha_desde", "fecha_hasta", "formato"},
     *             @OA\Property(property="fecha_desde", type="string", format="date", description="Fecha de inicio", example="2024-01-01"),
     *             @OA\Property(property="fecha_hasta", type="string", format="date", description="Fecha de fin", example="2024-12-31"),
     *             @OA\Property(property="estado", type="string", enum={"Activa", "En Proceso", "Resuelta"}, description="Estado de contingencia (opcional)", example="Activa"),
     *             @OA\Property(property="severidad", type="string", enum={"Baja", "Media", "Alta", "Crítica"}, description="Severidad (opcional)", example="Alta"),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel", "csv"}, description="Formato de exportación", example="excel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reporte de contingencias generado exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar reporte de contingencias
     */
    public function exportContingencias(Request $request)
    {
        return $this->contingenciasReportService->exportContingencias($request);
    }

    /**
     * @OA\Post(
     *     path="/api/export/estadisticas-cumplimiento",
     *     tags={"Exportación"},
     *     summary="Exportar estadísticas de cumplimiento de mantenimiento",
     *     description="Genera un reporte de estadísticas de cumplimiento de mantenimientos por año",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"año", "formato"},
     *             @OA\Property(property="año", type="integer", minimum=2020, maximum=2030, description="Año de las estadísticas", example=2024),
     *             @OA\Property(property="servicio_id", type="integer", description="ID del servicio (opcional)", example=1),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel"}, description="Formato de exportación", example="excel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas de cumplimiento generadas exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar estadísticas de cumplimiento
     */
    public function exportEstadisticasCumplimiento(Request $request)
    {
        return $this->mantenimientoReportService->exportEstadisticasCumplimiento($request);
    }

    /**
     * @OA\Post(
     *     path="/api/export/equipos-criticos",
     *     tags={"Exportación"},
     *     summary="Exportar reporte de equipos críticos",
     *     description="Genera un reporte de equipos clasificados como críticos",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"formato"},
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel", "csv"}, description="Formato de exportación", example="excel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reporte de equipos críticos generado exitosamente"
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Generar reporte de equipos críticos
     */
    public function exportEquiposCriticos(Request $request)
    {
        return $this->equiposReportService->exportEquiposCriticos($request);
    }

    /**
     * @OA\Post(
     *     path="/api/export/tickets",
     *     tags={"Exportación"},
     *     summary="Exportar reporte de tickets",
     *     description="Genera un reporte de tickets en un rango de fechas con filtros opcionales",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"fecha_desde", "fecha_hasta", "formato"},
     *             @OA\Property(property="fecha_desde", type="string", format="date", description="Fecha de inicio", example="2024-01-01"),
     *             @OA\Property(property="fecha_hasta", type="string", format="date", description="Fecha de fin", example="2024-12-31"),
     *             @OA\Property(property="estado", type="string", enum={"abierto", "en_proceso", "pendiente", "resuelto", "cerrado"}, description="Estado del ticket (opcional)", example="abierto"),
     *             @OA\Property(property="categoria", type="string", description="Categoría del ticket (opcional)", example="mantenimiento"),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel", "csv"}, description="Formato de exportación", example="excel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reporte de tickets generado exitosamente"
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar reporte de tickets
     */
    public function exportTickets(Request $request)
    {
        return $this->inventarioReportService->exportTickets($request);
    }

    /**
     * @OA\Post(
     *     path="/api/export/calibraciones",
     *     tags={"Exportación"},
     *     summary="Exportar reporte de calibraciones",
     *     description="Genera un reporte de calibraciones por año con filtros opcionales",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"año", "formato"},
     *             @OA\Property(property="año", type="integer", minimum=2020, maximum=2030, description="Año de las calibraciones", example=2024),
     *             @OA\Property(property="mes", type="integer", minimum=1, maximum=12, description="Mes específico (opcional)", example=3),
     *             @OA\Property(property="estado", type="string", enum={"programada", "completada", "vencida"}, description="Estado de calibración (opcional)", example="programada"),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel", "csv"}, description="Formato de exportación", example="excel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reporte de calibraciones generado exitosamente"
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar reporte de calibraciones
     */
    public function exportCalibraciones(Request $request)
    {
        return $this->calibracionesReportService->exportCalibraciones($request);
    }

    /**
     * @OA\Post(
     *     path="/api/export/inventario-repuestos",
     *     tags={"Exportación"},
     *     summary="Exportar inventario de repuestos",
     *     description="Genera un reporte del inventario de repuestos con filtros opcionales",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"formato"},
     *             @OA\Property(property="categoria", type="string", description="Categoría de repuesto (opcional)", example="filtros"),
     *             @OA\Property(property="bajo_stock", type="boolean", description="Solo repuestos con bajo stock (opcional)", example=true),
     *             @OA\Property(property="criticos", type="boolean", description="Solo repuestos críticos (opcional)", example=false),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel", "csv"}, description="Formato de exportación", example="excel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Inventario de repuestos generado exitosamente"
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar inventario de repuestos
     */
    public function exportInventarioRepuestos(Request $request)
    {
        return $this->inventarioReportService->exportInventarioRepuestos($request);
    }

    // ==========================================
    // MÉTODOS EMPRESARIALES ADICIONALES
    // ==========================================

    /**
     * @OA\Post(
     *     path="/api/export/reporte-ejecutivo",
     *     tags={"Exportación"},
     *     summary="Generar reporte ejecutivo completo",
     *     description="Genera un reporte ejecutivo consolidado con todas las métricas del sistema",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"periodo", "formato"},
     *             @OA\Property(property="periodo", type="string", enum={"mensual", "trimestral", "semestral", "anual"}, description="Período del reporte", example="mensual"),
     *             @OA\Property(property="año", type="integer", minimum=2020, maximum=2030, description="Año del reporte", example=2024),
     *             @OA\Property(property="mes", type="integer", minimum=1, maximum=12, description="Mes del reporte (para período mensual)", example=6),
     *             @OA\Property(property="formato", type="string", enum={"pdf", "excel"}, description="Formato de exportación", example="pdf"),
     *             @OA\Property(property="incluir_graficos", type="boolean", description="Incluir gráficos estadísticos", example=true),
     *             @OA\Property(property="incluir_recomendaciones", type="boolean", description="Incluir recomendaciones automáticas", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reporte ejecutivo generado exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/pdf",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Generar reporte ejecutivo completo
     */
    public function exportReporteEjecutivo(Request $request)
    {
        try {
            // Validar parámetros
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'periodo' => 'required|string|in:mensual,trimestral,semestral,anual',
                'año' => 'required|integer|min:2020|max:2030',
                'mes' => 'nullable|integer|min:1|max:12',
                'formato' => 'required|string|in:pdf,excel',
                'incluir_graficos' => 'nullable|boolean',
                'incluir_recomendaciones' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error(
                    $validator->errors(),
                    'Parámetros de reporte inválidos',
                    422
                );
            }

            // Generar reporte consolidado usando todos los servicios
            $reporteData = [
                'equipos' => $this->equiposReportService->getEstadisticasEjecutivas($request),
                'mantenimientos' => $this->mantenimientoReportService->getEstadisticasEjecutivas($request),
                'contingencias' => $this->contingenciasReportService->getEstadisticasEjecutivas($request),
                'calibraciones' => $this->calibracionesReportService->getEstadisticasEjecutivas($request),
                'inventario' => $this->inventarioReportService->getEstadisticasEjecutivas($request)
            ];

            if ($request->formato === 'pdf') {
                return $this->generarReporteEjecutivoPDF($reporteData, $request);
            } else {
                return $this->generarReporteEjecutivoExcel($reporteData, $request);
            }

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generando reporte ejecutivo', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return ResponseFormatter::error(
                null,
                'Error al generar reporte ejecutivo: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * @OA\Post(
     *     path="/api/export/dashboard-metricas",
     *     tags={"Exportación"},
     *     summary="Exportar métricas del dashboard",
     *     description="Exporta todas las métricas del dashboard en tiempo real",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"formato"},
     *             @OA\Property(property="formato", type="string", enum={"json", "excel", "csv"}, description="Formato de exportación", example="json"),
     *             @OA\Property(property="incluir_historico", type="boolean", description="Incluir datos históricos", example=false),
     *             @OA\Property(property="periodo_historico", type="integer", description="Días de histórico a incluir", example=30)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Métricas exportadas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Métricas exportadas exitosamente"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Exportar métricas del dashboard
     */
    public function exportDashboardMetricas(Request $request)
    {
        try {
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'formato' => 'required|string|in:json,excel,csv',
                'incluir_historico' => 'nullable|boolean',
                'periodo_historico' => 'nullable|integer|min:1|max:365'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error(
                    $validator->errors(),
                    'Parámetros inválidos',
                    422
                );
            }

            // Recopilar métricas de todos los servicios
            $metricas = [
                'timestamp' => now()->toISOString(),
                'usuario' => auth()->user()->name ?? 'Sistema',
                'equipos' => [
                    'total' => \App\Models\Equipo::count(),
                    'activos' => \App\Models\Equipo::where('status', 'activo')->count(),
                    'mantenimiento' => \App\Models\Equipo::where('status', 'mantenimiento')->count(),
                    'baja' => \App\Models\Equipo::where('status', 'baja')->count()
                ],
                'mantenimientos' => [
                    'programados' => \App\Models\Mantenimiento::where('estado', 'programado')->count(),
                    'en_proceso' => \App\Models\Mantenimiento::where('estado', 'en_proceso')->count(),
                    'completados' => \App\Models\Mantenimiento::where('estado', 'completado')->count(),
                    'vencidos' => \App\Models\Mantenimiento::where('fecha_programada', '<', now())->where('estado', '!=', 'completado')->count()
                ],
                'calibraciones' => [
                    'vigentes' => \App\Models\Calibracion::where('status', 1)->where('fecha_programada', '>', now())->count(),
                    'vencidas' => \App\Models\Calibracion::where('fecha_programada', '<', now())->count(),
                    'proximas' => \App\Models\Calibracion::whereBetween('fecha_programada', [now(), now()->addDays(30)])->count()
                ],
                'contingencias' => [
                    'abiertas' => \App\Models\Contingencia::where('status', 'abierta')->count(),
                    'en_proceso' => \App\Models\Contingencia::where('status', 'en_proceso')->count(),
                    'cerradas' => \App\Models\Contingencia::where('status', 'cerrada')->count()
                ],
                'usuarios' => [
                    'total' => \App\Models\Usuario::count(),
                    'activos' => \App\Models\Usuario::where('estado', 1)->count(),
                    'conectados_hoy' => \App\Models\Usuario::whereDate('updated_at', today())->count()
                ]
            ];

            // Agregar histórico si se solicita
            if ($request->get('incluir_historico', false)) {
                $dias = $request->get('periodo_historico', 30);
                $metricas['historico'] = $this->obtenerMetricasHistoricas($dias);
            }

            if ($request->formato === 'json') {
                return ResponseFormatter::success($metricas, 'Métricas exportadas exitosamente');
            } elseif ($request->formato === 'excel') {
                return $this->exportarMetricasExcel($metricas);
            } else {
                return $this->exportarMetricasCSV($metricas);
            }

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error exportando métricas dashboard', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return ResponseFormatter::error(
                null,
                'Error al exportar métricas: ' . $e->getMessage(),
                500
            );
        }
    }

    // ==========================================
    // MÉTODOS PRIVADOS DE SOPORTE
    // ==========================================

    /**
     * Generar reporte ejecutivo en PDF
     */
    private function generarReporteEjecutivoPDF(array $data, Request $request)
    {
        // Implementación del reporte PDF ejecutivo
        $html = '<html><head><title>Reporte Ejecutivo</title></head><body>';
        $html .= '<h1>REPORTE EJECUTIVO - SISTEMA EVA</h1>';
        $html .= '<p>Período: ' . ucfirst($request->periodo) . '</p>';
        $html .= '<p>Generado: ' . now()->format('d/m/Y H:i:s') . '</p>';

        foreach ($data as $seccion => $valores) {
            $html .= '<h2>' . strtoupper($seccion) . '</h2>';
            if (is_array($valores)) {
                $html .= '<ul>';
                foreach ($valores as $key => $value) {
                    $html .= '<li>' . ucfirst(str_replace('_', ' ', $key)) . ': ' . $value . '</li>';
                }
                $html .= '</ul>';
            }
        }

        $html .= '</body></html>';

        $pdf = new \Dompdf\Dompdf();
        $pdf->loadHtml($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->render();

        $filename = 'reporte_ejecutivo_' . $request->periodo . '_' . date('Y-m-d') . '.pdf';

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Generar reporte ejecutivo en Excel
     */
    private function generarReporteEjecutivoExcel(array $data, Request $request)
    {
        // Implementación del reporte Excel ejecutivo
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Configurar hoja de cálculo con datos ejecutivos
        $sheet->setTitle('Reporte Ejecutivo');
        $sheet->setCellValue('A1', 'REPORTE EJECUTIVO - SISTEMA EVA');
        $sheet->setCellValue('A2', 'Período: ' . ucfirst($request->periodo));
        $sheet->setCellValue('A3', 'Generado: ' . now()->format('d/m/Y H:i:s'));

        // Agregar datos de cada sección
        $row = 5;
        foreach ($data as $seccion => $valores) {
            $sheet->setCellValue('A' . $row, strtoupper($seccion));
            $row++;

            if (is_array($valores)) {
                foreach ($valores as $key => $value) {
                    $sheet->setCellValue('A' . $row, ucfirst(str_replace('_', ' ', $key)));
                    $sheet->setCellValue('B' . $row, $value);
                    $row++;
                }
            }
            $row++;
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = 'reporte_ejecutivo_' . $request->periodo . '_' . date('Y-m-d') . '.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);

        $writer->save($temp_file);

        return response()->download($temp_file, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Obtener métricas históricas
     */
    private function obtenerMetricasHistoricas(int $dias): array
    {
        $historico = [];

        for ($i = $dias; $i >= 0; $i--) {
            $fecha = now()->subDays($i);
            $historico[$fecha->format('Y-m-d')] = [
                'equipos_activos' => \App\Models\Equipo::where('status', 'activo')->whereDate('created_at', '<=', $fecha)->count(),
                'mantenimientos_completados' => \App\Models\Mantenimiento::where('estado', 'completado')->whereDate('updated_at', $fecha)->count(),
                'contingencias_abiertas' => \App\Models\Contingencia::where('status', 'abierta')->whereDate('created_at', $fecha)->count()
            ];
        }

        return $historico;
    }

    /**
     * Exportar métricas a Excel
     */
    private function exportarMetricasExcel(array $metricas)
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setTitle('Métricas Dashboard');
        $sheet->setCellValue('A1', 'MÉTRICAS DEL DASHBOARD - SISTEMA EVA');
        $sheet->setCellValue('A2', 'Generado: ' . $metricas['timestamp']);

        $row = 4;
        foreach ($metricas as $categoria => $datos) {
            if ($categoria === 'timestamp' || $categoria === 'usuario') continue;

            $sheet->setCellValue('A' . $row, strtoupper($categoria));
            $row++;

            if (is_array($datos)) {
                foreach ($datos as $metrica => $valor) {
                    $sheet->setCellValue('A' . $row, ucfirst(str_replace('_', ' ', $metrica)));
                    $sheet->setCellValue('B' . $row, $valor);
                    $row++;
                }
            }
            $row++;
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = 'metricas_dashboard_' . date('Y-m-d_H-i-s') . '.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);

        $writer->save($temp_file);

        return response()->download($temp_file, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Exportar métricas a CSV
     */
    private function exportarMetricasCSV(array $metricas)
    {
        $filename = 'metricas_dashboard_' . date('Y-m-d_H-i-s') . '.csv';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);

        $handle = fopen($temp_file, 'w');

        // Headers
        fputcsv($handle, ['Categoría', 'Métrica', 'Valor']);

        // Datos
        foreach ($metricas as $categoria => $datos) {
            if ($categoria === 'timestamp' || $categoria === 'usuario') continue;

            if (is_array($datos)) {
                foreach ($datos as $metrica => $valor) {
                    fputcsv($handle, [
                        ucfirst($categoria),
                        ucfirst(str_replace('_', ' ', $metrica)),
                        $valor
                    ]);
                }
            }
        }

        fclose($handle);

        return response()->download($temp_file, $filename)->deleteFileAfterSend(true);
    }
}
