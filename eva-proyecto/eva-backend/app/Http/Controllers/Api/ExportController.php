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
}
