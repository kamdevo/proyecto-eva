<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CorrectivoGeneral;
use App\Models\Equipo;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Exception;
use Carbon\Carbon;

/**
 * Controlador CorrectivoGeneralController - API Empresarial Completa
 * 
 * Controlador empresarial completo para gestión de correctivos generales
 * con todas las funcionalidades requeridas según especificaciones.
 * 
 * Funcionalidades implementadas:
 * - Listado completo con paginación y filtros
 * - Búsqueda global en todos los campos
 * - Exportación Excel/CSV formato exacto CorrectivosEB.xls
 * - CRUD completo con validaciones empresariales
 * - Integración con equipos y usuarios
 * - Manejo robusto de errores
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class CorrectivoGeneralController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/correctivos-generales",
     *     tags={"CorrectivoGeneral"},
     *     summary="Listar correctivos generales con búsqueda y filtros",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="search", in="query", description="Búsqueda global"),
     *     @OA\Parameter(name="status", in="query", description="Filtro por estado"),
     *     @OA\Parameter(name="page", in="query", description="Página"),
     *     @OA\Parameter(name="per_page", in="query", description="Elementos por página"),
     *     @OA\Parameter(name="sort_by", in="query", description="Campo de ordenamiento"),
     *     @OA\Parameter(name="sort_direction", in="query", description="Dirección de ordenamiento"),
     *     @OA\Response(response=200, description="Lista obtenida exitosamente")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:10000',
                'search' => 'nullable|string|max:255',
                'status' => 'nullable|in:all,active,completed,in_progress,pending',
                'sort_by' => 'nullable|string|in:fecha_creacion,codigo_orden,equipo,marca,sede',
                'sort_direction' => 'nullable|in:asc,desc',
                'fecha_desde' => 'nullable|date|date_format:Y-m-d',
                'fecha_hasta' => 'nullable|date|date_format:Y-m-d|after_or_equal:fecha_desde'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Parámetros de validación incorrectos', 422);
            }

            // Query base usando DB directamente para evitar problemas con relaciones
            $query = DB::table('correctivos_generales as cg')
                ->leftJoin('equipos as e', 'cg.equipo_id', '=', 'e.id')
                ->select([
                    'cg.id',
                    'cg.created_at',
                    'cg.status',
                    'cg.equipo_id',
                    'cg.file',
                    'cg.file_orden',
                    'cg.orden',
                    'cg.fecha_inicio',
                    'cg.code_orden',
                    'cg.diagnostico',
                    'cg.code_diagnostico',
                    'cg.fecha_diagnostico',
                    'cg.description',
                    'cg.code',
                    'cg.fecha_mantenimiento',
                    'cg.repuesto_pendiente',
                    'cg.repuesto_id',
                    'cg.cierre_id',
                    'cg.tipo_falla_id',
                    'e.name as equipo_name',
                    'e.code as equipo_code',
                    'e.marca as equipo_marca',
                    'e.modelo as equipo_modelo',
                    'e.serial as equipo_serial'
                ]);

            // Búsqueda global en todos los campos usando campos reales de la BD
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('cg.code_orden', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.diagnostico', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.code_diagnostico', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.code', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.repuesto_pendiente', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.code', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.marca', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.modelo', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Filtros por estado usando campos reales
            if ($request->filled('status') && $request->status !== 'all') {
                switch ($request->status) {
                    case 'active':
                        $query->where('cg.status', 1);
                        break;
                    case 'completed':
                        $query->whereNotNull('cg.fecha_mantenimiento');
                        break;
                    case 'in_progress':
                        $query->whereNull('cg.fecha_mantenimiento')
                              ->whereNotNull('cg.fecha_diagnostico');
                        break;
                    case 'pending':
                        $query->whereNull('cg.fecha_diagnostico');
                        break;
                }
            }

            // Filtros por rango de fechas
            if ($request->filled('fecha_desde')) {
                $query->whereDate('cg.created_at', '>=', $request->fecha_desde);
            }
            
            if ($request->filled('fecha_hasta')) {
                $query->whereDate('cg.created_at', '<=', $request->fecha_hasta);
            }

            // Ordenamiento usando campos reales
            $sortBy = $request->get('sort_by', 'fecha_inicio');
            $sortDirection = $request->get('sort_direction', 'desc');
            
            // Mapear campos de ordenamiento a campos reales
            $sortMapping = [
                'fecha_creacion' => 'cg.created_at',
                'codigo_orden' => 'cg.code_orden',
                'equipo' => 'e.name',
                'marca' => 'e.marca',
                'sede' => 'e.sede'
            ];
            
            $actualSortBy = $sortMapping[$sortBy] ?? 'cg.fecha_inicio';
            $query->orderBy($actualSortBy, $sortDirection);

            // Ejecutar la consulta con paginación manual
            // Cambiar el valor por defecto de 10 a 1000 para mostrar todos los correctivos
            $perPage = $request->get('per_page', 1000);
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;

            // Contar total de registros
            $total = DB::table('correctivos_generales as cg')
                ->leftJoin('equipos as e', 'cg.equipo_id', '=', 'e.id');
            
            // Aplicar los mismos filtros para el conteo
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $total->where(function($q) use ($searchTerm) {
                    $q->where('cg.code_orden', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.diagnostico', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.code_diagnostico', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.code', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('cg.repuesto_pendiente', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.code', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.marca', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('e.modelo', 'LIKE', "%{$searchTerm}%");
                });
            }

            if ($request->filled('status') && $request->status !== 'all') {
                switch ($request->status) {
                    case 'active':
                        $total->where('cg.status', 1);
                        break;
                    case 'completed':
                        $total->whereNotNull('cg.fecha_mantenimiento');
                        break;
                    case 'in_progress':
                        $total->whereNull('cg.fecha_mantenimiento')
                              ->whereNotNull('cg.fecha_diagnostico');
                        break;
                    case 'pending':
                        $total->whereNull('cg.fecha_diagnostico');
                        break;
                }
            }

            $totalCount = $total->count();

            // Obtener los datos paginados
            $correctivos = $query->offset($offset)->limit($perPage)->get();

            // Formatear datos para el frontend usando campos directos del JOIN
            $formattedData = $correctivos->map(function ($correctivo) {
                return [
                    'id' => $correctivo->id,
                    'fuente' => 'Correctivos generales',
                    'responsable_mantenimiento' => 'Sistema EVA',
                    'equipo_id' => $correctivo->equipo_id,
                    'fecha_creacion' => $correctivo->fecha_inicio ? 
                        Carbon::parse($correctivo->fecha_inicio)->format('Y-m-d') : 
                        ($correctivo->created_at ? Carbon::parse($correctivo->created_at)->format('Y-m-d') : date('Y-m-d')),
                    'codigo_orden' => $correctivo->code_orden ?? 'SIN_CODIGO',
                    'descripcion_orden' => $correctivo->description ?? '',
                    'codificacion_cierre' => $correctivo->diagnostico ?? 'Sin Info de orden de trabajo',
                    'equipo' => $correctivo->equipo_name ?? 'Equipo no especificado',
                    'codigo_equipo' => $correctivo->equipo_code ?? '',
                    'marca' => $correctivo->equipo_marca ?? '',
                    'modelo' => $correctivo->equipo_modelo ?? '',
                    'serie' => $correctivo->equipo_serial ?? '',
                    'estado_actual' => 'Activo', // Campo no disponible en JOIN, valor por defecto
                    'sede' => '', // Campo no disponible en JOIN
                    'servicio' => '', // Campo no disponible en JOIN
                    'area' => '', // Campo no disponible en JOIN
                    'archivo' => $correctivo->file ?? '',
                    'fecha_avance' => $correctivo->fecha_diagnostico ?? '',
                    'titulo_avance1' => 'Diagnóstico',
                    'descripcion_avance' => $correctivo->diagnostico ?? '',
                    'fecha_avance2' => '',
                    'titulo_avance2' => '',
                    'descripcion_avance2' => '',
                    'fecha_avance3' => '',
                    'titulo_avance3' => '',
                    'descripcion_avance3' => '',
                    'retro_cierre' => $correctivo->fecha_mantenimiento ? 'Completado' : 'Pendiente',
                    'descripcion_cierre' => $correctivo->repuesto_pendiente ?? '',
                    'fecha_cierre' => $correctivo->fecha_mantenimiento ?? '',
                    'costo_equipo' => 0,
                    'fecha_fin' => $correctivo->fecha_mantenimiento ?? '',
                    'repuesto_instalado' => $correctivo->repuesto_pendiente ?? '',
                    'created_at' => $correctivo->fecha_inicio ?? now()->format('Y-m-d H:i:s'),
                    'updated_at' => $correctivo->fecha_mantenimiento ?? $correctivo->fecha_inicio ?? now()->format('Y-m-d H:i:s')
                ];
            });

            // Calcular datos de paginación manual
            $lastPage = ceil($totalCount / $perPage);
            $from = $totalCount > 0 ? $offset + 1 : null;
            $to = min($offset + $perPage, $totalCount);

            $response = [
                'correctivos' => $formattedData,
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => $lastPage,
                    'per_page' => $perPage,
                    'total' => $totalCount,
                    'from' => $from,
                    'to' => $to
                ]
            ];

            return ResponseFormatter::success($response, 'Correctivos obtenidos exitosamente');

        } catch (Exception $e) {
            Log::error('Error en CorrectivoGeneralController::index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ResponseFormatter::error(null, 'Error al obtener correctivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/correctivos-generales/export",
     *     tags={"CorrectivoGeneral"},
     *     summary="Exportar correctivos a Excel/CSV",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="format", type="string", enum={"excel", "csv"}),
     *             @OA\Property(property="filename", type="string"),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Archivo exportado exitosamente")
     * )
     */
    public function export(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'format' => 'required|in:excel,csv',
                'filename' => 'nullable|string|max:255',
                'data' => 'required|array'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Parámetros de exportación incorrectos', 422);
            }

            $format = $request->get('format', 'excel');
            $filename = $request->get('filename', 'correctivos_generales_' . date('Y-m-d_H-i-s'));
            $data = $request->get('data', []);

            if ($format === 'excel') {
                return $this->exportToExcelCustom($data, $filename);
            } else {
                return $this->exportToCsvCustom($data, $filename);
            }

        } catch (Exception $e) {
            Log::error('Error en CorrectivoGeneralController::export', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ResponseFormatter::error(null, 'Error al exportar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar a Excel con formato exacto de CorrectivosEB.xls (usando datos reales de BD)
     */
    protected function exportToExcelCustom(array $data, string $filename)
    {
        // Extraer los IDs de los correctivos a exportar
        $correctivoIds = array_column($data, 'id');
        
        // Consultar datos reales de la base de datos usando consulta directa
        $correctivos = DB::table('correctivos_generales as cg')
            ->leftJoin('equipos as e', 'cg.equipo_id', '=', 'e.id')
            ->select(
                'cg.*',
                'e.name as equipo_name',
                'e.code as equipo_code',
                'e.marca',
                'e.modelo', 
                'e.serial',
                'e.localizacion_actual'
            )
            ->whereIn('cg.id', $correctivoIds)
            ->get();

        Log::info("📊 [EXPORT CUSTOM] Exportando " . count($correctivos) . " correctivos filtrados con datos reales");

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Configurar encabezados exactos según CorrectivosEB.xls
        $headers = [
            'Fuente',
            'Responsable del mantenimiento',
            'Equipo Id',
            'Fecha de creación de la orden',
            'Codigo de orden de trabajo',
            'Descripcion de la orden',
            'Codificación de cierre',
            'Equipo',
            'Codigo Equipo',
            'Marca',
            'Modelo',
            'Serie',
            'Estado actual del equipo',
            'Sede',
            'Servicio',
            'Area',
            'Archivo',
            'Fecha avance',
            'Titulo/Retro Avance1',
            'Descripcion avance',
            'Fecha avance2',
            'Titulo/Retro Avance2',
            'Descripcion avance2',
            'Fecha avance3',
            'Titulo/Retro Avance3',
            'Descripcion avance3',
            'Retro de cierre',
            'Descripcion de Cierre',
            'Fecha de Cierre',
            'Costo del equipo',
            'Fecha fin',
            'Repuesto instalado'
        ];

        // Escribir encabezados
        $sheet->fromArray($headers, null, 'A1');

        // Estilo para encabezados
        $headerStyle = [
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DDDDDD']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN
                ]
            ]
        ];

        $sheet->getStyle('A1:' . \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers)) . '1')
              ->applyFromArray($headerStyle);

        // Escribir datos reales usando campos directos del JOIN
        $row = 2;
        foreach ($correctivos as $correctivo) {
            $rowData = [
                'Correctivos generales', // fuente
                'No especificado', // responsable (no existe en tabla)
                $correctivo->equipo_id ?? '', // equipo_id
                $correctivo->created_at ? date('Y-m-d', strtotime($correctivo->created_at)) : '', // fecha_creacion
                $correctivo->code_orden ?? $correctivo->code ?? '', // codigo_orden
                $correctivo->description ?? $correctivo->orden ?? '', // descripcion_orden
                $correctivo->code_diagnostico ?? '', // codificacion_cierre
                $correctivo->equipo_name ?? 'N/A', // equipo (campo del JOIN)
                $correctivo->equipo_code ?? '', // codigo_equipo (campo del JOIN)
                $correctivo->marca ?? '', // marca (campo del JOIN)
                $correctivo->modelo ?? '', // modelo (campo del JOIN)
                $correctivo->serial ?? '', // serie (campo del JOIN)
                'Activo', // estado_actual (por defecto, no está en tablas)
                $correctivo->localizacion_actual ?? '', // sede (usar localizacion_actual)
                'No especificado', // servicio (usar servicio_id si necesario)
                'No especificado', // area (no está en tablas)
                $correctivo->file ?? '', // archivo
                $correctivo->fecha_inicio ?? '', // fecha_avance
                '', // titulo_avance1 (no existe en tabla)
                $correctivo->diagnostico ?? '', // descripcion_avance
                '', // fecha_avance2 (no existe)
                '', // titulo_avance2 (no existe)
                '', // descripcion_avance2 (no existe)
                '', // fecha_avance3 (no existe)
                '', // titulo_avance3 (no existe)
                '', // descripcion_avance3 (no existe)
                '', // retro_cierre (no existe)
                '', // descripcion_cierre (no existe)
                '', // fecha_cierre (no existe)
                0, // costo_equipo (no existe)
                $correctivo->fecha_mantenimiento ?? '', // fecha_fin
                $correctivo->repuesto_id ?? '' // repuesto_instalado
            ];

            $sheet->fromArray($rowData, null, 'A' . $row);
            $row++;
        }

        // Ajustar ancho de columnas
        foreach (range('A', \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers))) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Crear respuesta de descarga
        $writer = new Xlsx($spreadsheet);
        
        return new StreamedResponse(function() use ($writer, $filename) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.xlsx"',
            'Cache-Control' => 'max-age=0'
        ]);
    }

    /**
     * Exportar a CSV
     */
    protected function exportToCsvCustom(array $data, string $filename)
    {
        return new StreamedResponse(function() use ($data, $filename) {
            $handle = fopen('php://output', 'w');
            
            // Escribir BOM para UTF-8
            fwrite($handle, "\xEF\xBB\xBF");
            
            // Encabezados
            $headers = [
                'Fuente', 'Responsable del mantenimiento', 'Equipo Id', 'Fecha de creación de la orden',
                'Codigo de orden de trabajo', 'Descripcion de la orden', 'Codificación de cierre',
                'Equipo', 'Codigo Equipo', 'Marca', 'Modelo', 'Serie', 'Estado actual del equipo',
                'Sede', 'Servicio', 'Area', 'Archivo', 'Fecha avance', 'Titulo/Retro Avance1',
                'Descripcion avance', 'Fecha avance2', 'Titulo/Retro Avance2', 'Descripcion avance2',
                'Fecha avance3', 'Titulo/Retro Avance3', 'Descripcion avance3', 'Retro de cierre',
                'Descripcion de Cierre', 'Fecha de Cierre', 'Costo del equipo', 'Fecha fin',
                'Repuesto instalado'
            ];
            
            fputcsv($handle, $headers);
            
            // Datos
            foreach ($data as $item) {
                $row = [
                    $item['Fuente'] ?? 'Correctivos generales',
                    $item['Responsable del mantenimiento'] ?? '',
                    $item['Equipo Id'] ?? '',
                    $item['Fecha de creación de la orden'] ?? '',
                    $item['Codigo de orden de trabajo'] ?? '',
                    $item['Descripcion de la orden'] ?? '',
                    $item['Codificación de cierre'] ?? '',
                    $item['Equipo'] ?? '',
                    $item['Codigo Equipo'] ?? '',
                    $item['Marca'] ?? '',
                    $item['Modelo'] ?? '',
                    $item['Serie'] ?? '',
                    $item['Estado actual del equipo'] ?? '',
                    $item['Sede'] ?? '',
                    $item['Servicio'] ?? '',
                    $item['Area'] ?? '',
                    $item['Archivo'] ?? '',
                    $item['Fecha avance'] ?? '',
                    $item['Titulo/Retro Avance1'] ?? '',
                    $item['Descripcion avance'] ?? '',
                    $item['Fecha avance2'] ?? '',
                    $item['Titulo/Retro Avance2'] ?? '',
                    $item['Descripcion avance2'] ?? '',
                    $item['Fecha avance3'] ?? '',
                    $item['Titulo/Retro Avance3'] ?? '',
                    $item['Descripcion avance3'] ?? '',
                    $item['Retro de cierre'] ?? '',
                    $item['Descripcion de Cierre'] ?? '',
                    $item['Fecha de Cierre'] ?? '',
                    $item['Costo del equipo'] ?? 0,
                    $item['Fecha fin'] ?? '',
                    $item['Repuesto instalado'] ?? ''
                ];
                fputcsv($handle, $row);
            }
            
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
            'Cache-Control' => 'max-age=0'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/correctivos-generales",
     *     tags={"CorrectivoGeneral"},
     *     summary="Crear nuevo correctivo general",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=201, description="Creado exitosamente")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipo_id' => 'required|exists:equipos,id',
                'responsable_mantenimiento' => 'required|string|max:255',
                'descripcion_orden' => 'required|string|max:1000',
                'codigo_orden' => 'nullable|string|max:50',
                'fecha_inicio' => 'nullable|date',
                'prioridad' => 'nullable|in:baja,media,alta,critica,emergencia'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Error de validación', 422);
            }

            $correctivo = CorrectivoGeneral::create([
                'fuente' => 'Correctivos generales',
                'equipo_id' => $request->equipo_id,
                'responsable_mantenimiento' => $request->responsable_mantenimiento,
                'description' => $request->descripcion_orden,
                'code_orden' => $request->codigo_orden ?? 'COR' . date('YmdHis'),
                'fecha_inicio' => $request->fecha_inicio ?? now(),
                'status' => 1,
                'estado' => 'pendiente',
                'prioridad' => $request->prioridad ?? 'media'
            ]);

            return ResponseFormatter::success($correctivo->load('equipo'), 'Correctivo creado exitosamente', 201);

        } catch (Exception $e) {
            Log::error('Error en CorrectivoGeneralController::store', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            return ResponseFormatter::error(null, 'Error al crear correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/correctivos-generales/{id}",
     *     tags={"CorrectivoGeneral"},
     *     summary="Obtener correctivo específico",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $correctivo = CorrectivoGeneral::with(['equipo', 'responsable'])->findOrFail($id);
            
            return ResponseFormatter::success($correctivo, 'Correctivo obtenido exitosamente');

        } catch (Exception $e) {
            Log::error('Error en CorrectivoGeneralController::show', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return ResponseFormatter::error(null, 'Correctivo no encontrado', 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/correctivos-generales/{id}",
     *     tags={"CorrectivoGeneral"},
     *     summary="Actualizar correctivo",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Actualizado exitosamente")
     * )
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $correctivo = CorrectivoGeneral::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'responsable_mantenimiento' => 'sometimes|string|max:255',
                'descripcion_orden' => 'sometimes|string|max:1000',
                'estado' => 'sometimes|in:pendiente,en_proceso,completado,cancelado',
                'fecha_cierre' => 'nullable|date',
                'descripcion_cierre' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Error de validación', 422);
            }

            $correctivo->update($request->all());

            return ResponseFormatter::success($correctivo->load('equipo'), 'Correctivo actualizado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en CorrectivoGeneralController::update', [
                'id' => $id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            return ResponseFormatter::error(null, 'Error al actualizar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/correctivos-generales/{id}",
     *     tags={"CorrectivoGeneral"},
     *     summary="Eliminar correctivo",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $correctivo = CorrectivoGeneral::findOrFail($id);
            $correctivo->delete();

            return ResponseFormatter::success(null, 'Correctivo eliminado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en CorrectivoGeneralController::destroy', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return ResponseFormatter::error(null, 'Error al eliminar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/correctivos-generales/export-excel",
     *     tags={"CorrectivoGeneral"},
     *     summary="Exportar TODOS los correctivos reales a Excel",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Archivo Excel descargado")
     * )
     */
    public function exportAllToExcel(Request $request): StreamedResponse
    {
        try {
            // Aumentar límites para exportaciones grandes
            set_time_limit(600); // 10 minutos
            ini_set('memory_limit', '1024M');
            
            $formato = $request->query('formato', 'completo'); // 'completo' o 'parada'
            $tipo = $request->query('tipo', null); // 'biomedico' o 'industrial'
            $limit = $request->query('limit', null); // Límite opcional
            
            Log::info("🔄 [EXPORT] Iniciando exportación a Excel - Formato: {$formato}, Tipo: {$tipo}");

            // Obtener correctivos de la tabla correctivos_generales
            // Subquery para obtener el responsable del plan de mantenimiento más reciente
            $subqueryResponsableGeneral = "(SELECT pm.responsable FROM planes_mantenimientos pm WHERE pm.equipo_id = cg.equipo_id ORDER BY pm.anio DESC LIMIT 1)";
            
            $queryGenerales = DB::table('correctivos_generales as cg')
                ->leftJoin('equipos as e', 'cg.equipo_id', '=', 'e.id')
                ->leftJoin('servicios as s', 'e.servicio_id', '=', 's.id')
                ->leftJoin('sedes as sede', 's.sede_id', '=', 'sede.id')
                ->leftJoin('estadoequipos as ee', 'e.estadoequipo_id', '=', 'ee.id')
                ->select([
                    'cg.id',
                    'cg.created_at',
                    DB::raw("cg.created_at as fecha_inicio"),
                    DB::raw("NULL as retro_cierre"),
                    DB::raw("COALESCE(sede.name, 'N/A') as sede_nombre"),
                    DB::raw("'Correctivo General' as tipo"),
                    DB::raw("COALESCE({$subqueryResponsableGeneral}, '') as responsable_nombre"),
                    'e.name as equipo_name',
                    'e.code as equipo_code', 
                    'e.marca',
                    'e.modelo',
                    'e.serial',
                    's.name as servicio_nombre',
                    DB::raw("COALESCE(ee.name, 'N/A') as estado_actual"),
                    'cg.fecha_mantenimiento as fecha_cierre',
                    DB::raw("NULL as fecha_fin"),
                    DB::raw("COALESCE(cg.description, cg.orden) as descripcion"),
                    DB::raw("NULL as tecnico_cierre_text")
                ])
                ->orderBy('cg.created_at', 'desc');

            // Filtrar por tipo de equipo si se especifica
            if ($tipo === 'biomedico') {
                $queryGenerales->where('e.tipo_id', 1);
            } elseif ($tipo === 'industrial') {
                $queryGenerales->where('e.tipo_id', 2);
            }
            
            if ($limit) {
                $queryGenerales->limit($limit);
            }
            
            $correctivosGenerales = $queryGenerales->get();

            // Obtener tickets/órdenes (tabla ordenes - todos son tickets del sistema)
            // Subquery para obtener el responsable del plan de mantenimiento más reciente
            $subqueryResponsable = "(SELECT pm.responsable FROM planes_mantenimientos pm WHERE pm.equipo_id = o.equipo_id ORDER BY pm.anio DESC LIMIT 1)";
            
            $queryTickets = DB::table('ordenes as o')
                ->leftJoin('equipos as e', 'o.equipo_id', '=', 'e.id')
                ->leftJoin('servicios as s', 'o.servicio_id', '=', 's.id')
                ->leftJoin('sedes as sede', 's.sede_id', '=', 'sede.id')
                ->leftJoin('estadoequipos as ee', 'e.estadoequipo_id', '=', 'ee.id')
                ->select([
                    'o.id',
                    DB::raw("CAST(o.fecha_inicio AS DATETIME) as created_at"),
                    'o.fecha_inicio',
                    'o.retro_cierre',
                    DB::raw("COALESCE(sede.name, 'N/A') as sede_nombre"),
                    DB::raw("'Ticket/Orden' as tipo"),
                    DB::raw("COALESCE({$subqueryResponsable}, '') as responsable_nombre"),
                    DB::raw("COALESCE(e.name, o.nombre_equipo) as equipo_name"),
                    DB::raw("COALESCE(e.code, o.codigo_equipo) as equipo_code"), 
                    DB::raw("COALESCE(e.marca, o.marca_equipo) as marca"),
                    DB::raw("COALESCE(e.modelo, o.modelo_equipo) as modelo"),
                    DB::raw("COALESCE(e.serial, o.serie_equipo) as serial"),
                    's.name as servicio_nombre',
                    DB::raw("COALESCE(ee.name, 'N/A') as estado_actual"),
                    'o.fecha_fin as fecha_cierre',
                    'o.fecha_fin',
                    'o.descripcion as descripcion',
                    'o.tecnico_cierre_text'
                ])
                ->orderBy('o.fecha_inicio', 'desc');

            // Filtrar por tipo de equipo si se especifica
            if ($tipo === 'biomedico') {
                $queryTickets->where(function($query) {
                    $query->where('e.tipo_id', 1)
                          ->orWhere('o.subproceso_id', 1); // Para tickets sin equipo asociado
                });
            } elseif ($tipo === 'industrial') {
                $queryTickets->where(function($query) {
                    $query->where('e.tipo_id', 2)
                          ->orWhere('o.subproceso_id', 2); // Para tickets sin equipo asociado
                });
            }
            
            if ($limit) {
                $queryTickets->limit($limit);
            }
            
            $tickets = $queryTickets->get();

            // Combinar ambas colecciones
            $correctivos = $correctivosGenerales->concat($tickets)->sortByDesc('created_at');

            $totalRecords = $correctivos->count();
            $totalGenerales = $correctivosGenerales->count();
            $totalTickets = $tickets->count();
            
            Log::info("📊 [EXPORT] Total de correctivos a exportar: {$totalRecords}");
            Log::info("   - Correctivos Generales: {$totalGenerales}");
            Log::info("   - Tickets/Órdenes: {$totalTickets}");

            if ($totalRecords === 0) {
                throw new Exception('No hay correctivos para exportar');
            }

            if ($formato === 'parada') {
                $tipoNombre = $tipo === 'industrial' ? 'Industrial' : 'Biomedico';
                $filename = "Parada_Equipo_{$tipoNombre}_" . date('Y-m-d') . '.xlsx';
            } else {
                $filename = 'correctivos_TODOS_' . date('Y-m-d_H-i-s') . '.xlsx';
            }

            return new StreamedResponse(function() use ($correctivos, $filename, $formato, $tipo) {
                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();

                if ($formato === 'parada') {
                    // ========== FORMATO PARADA DE EQUIPO ==========
                    $sheet->setTitle('Parada de Equipo');

                    // Agregar logo
                    $logoPath = public_path('logo_huv.jpg');
                    if (file_exists($logoPath)) {
                        $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
                        $drawing->setName('Logo HUV');
                        $drawing->setDescription('Logo Hospital Universitario del Valle');
                        $drawing->setPath($logoPath);
                        $drawing->setHeight(80);
                        $drawing->setCoordinates('A1');
                        $drawing->setWorksheet($sheet);
                    } else {
                        \Log::warning('⚠️ Logo HUV no encontrado en: ' . $logoPath);
                    }

                    // Ajustar altura de filas para el header
                    $sheet->getRowDimension('1')->setRowHeight(40);
                    $sheet->getRowDimension('2')->setRowHeight(30);
                    $sheet->getRowDimension('3')->setRowHeight(10); // Fila vacía
                    
                    // Título principal - Hospital
                    $sheet->mergeCells('C1:Q1');
                    $sheet->setCellValue('C1', 'HOSPITAL UNIVERSITARIO DEL VALLE "EVARISTO GARCÍA" ESE');
                    $sheet->getStyle('C1')->getFont()->setBold(true)->setSize(14);
                    $sheet->getStyle('C1')->getAlignment()
                        ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER)
                        ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

                    // Subtítulo - Parada de Equipo (dinámico según tipo)
                    $tipoEquipo = $tipo === 'industrial' ? 'INDUSTRIAL' : 'BIOMÉDICO';
                    $sheet->mergeCells('C2:Q2');
                    $sheet->setCellValue('C2', "PARADA DE EQUIPO {$tipoEquipo}");
                    $sheet->getStyle('C2')->getFont()->setBold(true)->setSize(12);
                    $sheet->getStyle('C2')->getAlignment()
                        ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER)
                        ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

                    // Headers de la tabla (fila 4)
                    $headers = [
                        'FECHA DE CREACIÓN',
                        'CODIFICACIÓN DE CIERRE',
                        'SEDE',
                        'TIPO',
                        'RESPONSABLE DE MANTENIMIENTO',
                        'ID',
                        'NOMBRE',
                        'CÓDIGO',
                        'MARCA',
                        'MODELO',
                        'SERIE',
                        'SERVICIO',
                        'ESTADO DEL EQUIPO',
                        'CIERRE',
                        'FECHA FIN',
                        'DESCRIPCIÓN',
                        'DESCRIPCIÓN DE CIERRE DEL TICKET'
                    ];

                    // Ajustar altura de fila de headers
                    $sheet->getRowDimension('4')->setRowHeight(30);

                    $col = 'A';
                    foreach ($headers as $header) {
                        $sheet->setCellValue($col . '4', $header);
                        $sheet->getStyle($col . '4')->getFont()->setBold(true);
                        $sheet->getStyle($col . '4')->getFill()
                            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                            ->getStartColor()->setARGB('FFFFFF00'); // Amarillo
                        $sheet->getStyle($col . '4')->getBorders()->getAllBorders()
                            ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                        $sheet->getStyle($col . '4')->getAlignment()
                            ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER)
                            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)
                            ->setWrapText(true);
                        $col++;
                    }

                    // Datos
                    $row = 5;
                    foreach ($correctivos as $correctivo) {
                        // FECHA DE CREACIÓN (con hora)
                        $fechaCreacion = $correctivo->fecha_inicio ?? $correctivo->created_at ?? '';
                        if ($fechaCreacion) {
                            $fechaCreacion = date('Y-m-d H:i:s', strtotime($fechaCreacion));
                        }
                        $sheet->setCellValueExplicit('A' . $row, $fechaCreacion, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // CODIFICACIÓN DE CIERRE
                        $sheet->setCellValueExplicit('B' . $row, $correctivo->retro_cierre ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // SEDE
                        $sheet->setCellValueExplicit('C' . $row, $correctivo->sede_nombre ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // TIPO
                        $sheet->setCellValueExplicit('D' . $row, $correctivo->tipo ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // RESPONSABLE DE MANTENIMIENTO
                        $sheet->setCellValueExplicit('E' . $row, trim($correctivo->responsable_nombre ?? ''), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // ID
                        $sheet->setCellValue('F' . $row, $correctivo->id ?? '');
                        
                        // NOMBRE del equipo
                        $sheet->setCellValueExplicit('G' . $row, $correctivo->equipo_name ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // CÓDIGO del equipo
                        $sheet->setCellValueExplicit('H' . $row, $correctivo->equipo_code ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // MARCA
                        $sheet->setCellValueExplicit('I' . $row, $correctivo->marca ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // MODELO
                        $sheet->setCellValueExplicit('J' . $row, $correctivo->modelo ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // SERIE
                        $sheet->setCellValueExplicit('K' . $row, $correctivo->serial ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // SERVICIO
                        $sheet->setCellValueExplicit('L' . $row, $correctivo->servicio_nombre ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // ESTADO DEL EQUIPO
                        $sheet->setCellValueExplicit('M' . $row, $correctivo->estado_actual ?? 'N/A', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // CIERRE (con hora)
                        $fechaCierre = $correctivo->fecha_cierre ?? '';
                        if ($fechaCierre) {
                            $fechaCierre = date('Y-m-d H:i:s', strtotime($fechaCierre));
                        }
                        $sheet->setCellValueExplicit('N' . $row, $fechaCierre, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // FECHA FIN (con hora)
                        $fechaFin = $correctivo->fecha_fin ?? '';
                        if ($fechaFin) {
                            $fechaFin = date('Y-m-d H:i:s', strtotime($fechaFin));
                        }
                        $sheet->setCellValueExplicit('O' . $row, $fechaFin, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // DESCRIPCIÓN
                        $sheet->setCellValueExplicit('P' . $row, $correctivo->descripcion ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // DESCRIPCIÓN DE CIERRE DEL TICKET
                        $sheet->setCellValueExplicit('Q' . $row, $correctivo->tecnico_cierre_text ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                        
                        // Bordes para todas las celdas de datos
                        $sheet->getStyle('A' . $row . ':Q' . $row)->getBorders()->getAllBorders()
                            ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                        
                        $row++;
                    }

                    // Auto-size columns
                    foreach (range('A', 'Q') as $col) {
                        $sheet->getColumnDimension($col)->setAutoSize(true);
                    }

                } else {
                    // ========== FORMATO COMPLETO (ORIGINAL) ==========
                    // Encabezados exactos según CorrectivosEB.xls
                    $headers = [
                    'Fuente',
                    'Responsable del mantenimiento', 
                    'Equipo Id',
                    'Fecha de creación de la orden',
                    'Codigo de orden de trabajo',
                    'Descripcion de la orden',
                    'Codificación de cierre',
                    'Equipo',
                    'Codigo Equipo',
                    'Marca',
                    'Modelo',
                    'Serie',
                    'Estado actual del equipo',
                    'Sede',
                    'Servicio',
                    'Area',
                    'Archivo',
                    'Fecha avance',
                    'Titulo/Retro Avance1',
                    'Descripcion avance',
                    'Fecha avance2',
                    'Titulo/Retro Avance2',
                    'Descripcion avance2',
                    'Fecha avance3',
                    'Titulo/Retro Avance3',
                    'Descripcion avance3',
                    'Retro de cierre',
                    'Descripcion de Cierre',
                    'Fecha de Cierre',
                    'Costo del equipo',
                    'Fecha fin',
                    'Repuesto instalado'
                ];

                // Escribir encabezados
                $sheet->fromArray($headers, null, 'A1');

                // Estilo para encabezados
                $headerStyle = [
                    'font' => ['bold' => true],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'DDDDDD']
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN
                        ]
                    ]
                ];

                $sheet->getStyle('A1:' . \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers)) . '1')
                      ->applyFromArray($headerStyle);

                // Escribir datos reales usando campos directos del JOIN
                $row = 2;
                foreach ($correctivos as $correctivo) {
                    $rowData = [
                        'Correctivos generales', // fuente
                        'No especificado', // responsable (no existe en tabla)
                        $correctivo->equipo_id ?? '', // equipo_id
                        $correctivo->created_at ? date('Y-m-d', strtotime($correctivo->created_at)) : '', // fecha_creacion
                        $correctivo->code_orden ?? $correctivo->code ?? '', // codigo_orden
                        $correctivo->description ?? $correctivo->orden ?? '', // descripcion_orden
                        $correctivo->code_diagnostico ?? '', // codificacion_cierre
                        $correctivo->equipo_name ?? 'N/A', // equipo (campo del JOIN)
                        $correctivo->equipo_code ?? '', // codigo_equipo (campo del JOIN)
                        $correctivo->marca ?? '', // marca (campo del JOIN)
                        $correctivo->modelo ?? '', // modelo (campo del JOIN)
                        $correctivo->serial ?? '', // serie (campo del JOIN)
                        'Activo', // estado_actual (por defecto, no está en tablas)
                        $correctivo->sede ?? '', // sede (campo del JOIN)
                        'No especificado', // servicio (usar servicio_id si necesario)
                        'No especificado', // area (no está en tablas)
                        $correctivo->file ?? '', // archivo
                        $correctivo->fecha_inicio ?? '', // fecha_avance
                        '', // titulo_avance1 (no existe en tabla)
                        $correctivo->diagnostico ?? '', // descripcion_avance
                        '', // fecha_avance2 (no existe)
                        '', // titulo_avance2 (no existe)
                        '', // descripcion_avance2 (no existe)
                        '', // fecha_avance3 (no existe)
                        '', // titulo_avance3 (no existe)
                        '', // descripcion_avance3 (no existe)
                        '', // retro_cierre (no existe)
                        '', // descripcion_cierre (no existe)
                        '', // fecha_cierre (no existe)
                        0, // costo_equipo (no existe)
                        $correctivo->fecha_mantenimiento ?? '', // fecha_fin
                        $correctivo->repuesto_id ?? '' // repuesto_instalado
                    ];

                    $sheet->fromArray($rowData, null, 'A' . $row);
                    $row++;
                }

                    // Auto-ajustar anchos de columnas
                    foreach (range('A', \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers))) as $col) {
                        $sheet->getColumnDimension($col)->setAutoSize(true);
                    }
                }

                // Guardar el archivo (común para ambos formatos)
                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
            }, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'max-age=0',
            ]);

        } catch (Exception $e) {
            Log::error('❌ [EXPORT] Error en exportación completa Excel', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return new StreamedResponse(function() use ($e) {
                echo json_encode(['error' => 'Error al exportar: ' . $e->getMessage()]);
            }, 500, ['Content-Type' => 'application/json']);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/correctivos-generales/export-custom",
     *     tags={"CorrectivoGeneral"},
     *     summary="Exportar correctivos personalizados/filtrados",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="format", type="string", enum={"excel", "csv"}),
     *             @OA\Property(property="filename", type="string"),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Archivo exportado exitosamente")
     * )
     */
    public function exportCustom(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'format' => 'required|in:excel,csv',
                'filename' => 'nullable|string|max:255',
                'data' => 'required|array'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Parámetros de exportación incorrectos', 422);
            }

            $format = $request->get('format', 'excel');
            $filename = $request->get('filename', 'correctivos_filtrados_' . date('Y-m-d_H-i-s'));
            $data = $request->get('data', []);

            Log::info("🔄 [EXPORT] Exportación personalizada {$format}: " . count($data) . " registros");

            if ($format === 'excel') {
                return $this->exportToExcelCustom($data, $filename);
            } else {
                return $this->exportToCsvCustom($data, $filename);
            }

        } catch (Exception $e) {
            Log::error('❌ [EXPORT] Error en exportación personalizada', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ResponseFormatter::error(null, 'Error al exportar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de correctivos
     */
    public function estadisticas(): JsonResponse
    {
        try {
            $stats = [
                'total' => CorrectivoGeneral::count(),
                'completados' => CorrectivoGeneral::whereNotNull('fecha_cierre')->count(),
                'en_proceso' => CorrectivoGeneral::whereNull('fecha_cierre')
                                               ->whereNotNull('fecha_avance')->count(),
                'pendientes' => CorrectivoGeneral::whereNull('fecha_avance')->count(),
                'vencidos' => CorrectivoGeneral::where('fecha_fin', '<', now())
                                               ->whereNotIn('estado', ['completado', 'cancelado'])
                                               ->count()
            ];

            return ResponseFormatter::success($stats, 'Estadísticas obtenidas exitosamente');

        } catch (Exception $e) {
            Log::error('Error en CorrectivoGeneralController::estadisticas', [
                'error' => $e->getMessage()
            ]);
            return ResponseFormatter::error(null, 'Error al obtener estadísticas', 500);
        }
    }
}
