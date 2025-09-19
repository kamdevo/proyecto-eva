<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\CorrectivoGeneral;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de mantenimientos correctivos
 * Maneja reparaciones, correctivos generales y mantenimientos no programados
 */
class CorrectivoController extends ApiController
{
    /**
     * Obtener lista de correctivos con filtros
     */
        /**
     * @OA\GET(
     *     path="/api/correctivos",
     *     tags={"Correctivos"},
     *     summary="Listar mantenimientos correctivos",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = CorrectivoGeneral::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('descripcion', 'like', "%{$search}%")
                      ->orWhere('observaciones', 'like', "%{$search}%")
                      ->orWhereHas('equipo', function($eq) use ($search) {
                          $eq->where('name', 'like', "%{$search}%")
                             ->orWhere('code', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('tecnico_id')) {
                $query->where('tecnico_id', $request->tecnico_id);
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('prioridad')) {
                $query->where('prioridad', $request->prioridad);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha', '<=', $request->fecha_hasta);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $correctivos = $query->paginate($perPage);

            return ResponseFormatter::success($correctivos, 'Correctivos obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo correctivo
     */
        /**
     * @OA\POST(
     *     path="/api/correctivos",
     *     tags={"Correctivos"},
     *     summary="Crear nuevo correctivo",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:1000',
            'fecha' => 'required|date',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'estado' => 'nullable|in:programado,en_proceso,completado,cancelado',
            'tipo_falla' => 'nullable|string|max:255',
            'causa_falla' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'costo_estimado' => 'nullable|numeric|min:0',
            'tiempo_estimado' => 'nullable|integer|min:1',
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $correctivoData = $request->except(['archivo']);
            $correctivoData['estado'] = $correctivoData['estado'] ?? 'programado';
            $correctivoData['created_at'] = now();

            // Crear el correctivo primero
            $correctivo = CorrectivoGeneral::create($correctivoData);

            // Manejar archivo adjunto - crear registro en tabla mantenimiento
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('correctivos_asociados', $fileName, 'public');
                
                // Crear registro en tabla mantenimiento asociado al correctivo
                DB::table('mantenimiento')->insert([
                    'equipo_id' => $correctivoData['equipo_id'],
                    'file' => $fileName,
                    'fecha_mantenimiento' => now()->toDateString(),
                    'fecha_programada' => now()->toDateString(),
                    'observacion' => 'Archivo de mantenimiento correctivo - ID: ' . $correctivo->id,
                    'tipo_mantenimiento' => 'correctivo',
                    'status' => 'completado',
                    'created_at' => now()
                ]);
            }

            // Cargar relaciones para la respuesta
            $correctivo->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            DB::commit();

            return ResponseFormatter::success($correctivo, 'Correctivo creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar correctivo específico
     */
        /**
     * @OA\GET(
     *     path="/api/correctivos/{id}",
     *     tags={"Correctivos"},
     *     summary="Obtener correctivo específico",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show($id)
    {
        try {
            $correctivo = CorrectivoGeneral::with([
                'equipo:id,name,code,servicio_id,area_id,marca,modelo,serial',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido,telefono,email'
            ])->findOrFail($id);

            // Agregar URL del archivo si existe
            if ($correctivo->archivo) {
                $correctivo->archivo_url = Storage::disk('public')->url($correctivo->archivo);
            }

            return ResponseFormatter::success($correctivo, 'Correctivo obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar correctivo
     */
        /**
     * @OA\PUT(
     *     path="/api/correctivos/{id}",
     *     tags={"Correctivos"},
     *     summary="Actualizar correctivo",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:1000',
            'fecha' => 'required|date',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'estado' => 'required|in:programado,en_proceso,completado,cancelado',
            'tipo_falla' => 'nullable|string|max:255',
            'causa_falla' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'costo_estimado' => 'nullable|numeric|min:0',
            'tiempo_estimado' => 'nullable|integer|min:1',
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $correctivo = CorrectivoGeneral::findOrFail($id);
            $correctivoData = $request->except(['archivo']);

            // Actualizar el correctivo
            $correctivo->update($correctivoData);

            // Manejar actualización de archivo en tabla mantenimiento
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('correctivos_asociados', $fileName, 'public');
                
                // Buscar registro existente en tabla mantenimiento para este correctivo
                $mantenimientoExistente = DB::table('mantenimiento')
                    ->where('equipo_id', $correctivo->equipo_id)
                    ->where('observacion', 'like', '%correctivo - ID: ' . $correctivo->id . '%')
                    ->first();
                
                if ($mantenimientoExistente) {
                    // Eliminar archivo anterior si existe
                    if ($mantenimientoExistente->file && Storage::disk('public')->exists('correctivos_asociados/' . $mantenimientoExistente->file)) {
                        Storage::disk('public')->delete('correctivos_asociados/' . $mantenimientoExistente->file);
                    }
                    
                    // Actualizar registro existente
                    DB::table('mantenimiento')
                        ->where('id', $mantenimientoExistente->id)
                        ->update([
                            'file' => $fileName,
                            'fecha_mantenimiento' => now()->toDateString()
                        ]);
                } else {
                    // Crear nuevo registro en tabla mantenimiento
                    DB::table('mantenimiento')->insert([
                        'equipo_id' => $correctivo->equipo_id,
                        'file' => $fileName,
                        'fecha_mantenimiento' => now()->toDateString(),
                        'fecha_programada' => now()->toDateString(),
                        'observacion' => 'Archivo de mantenimiento correctivo - ID: ' . $correctivo->id,
                        'tipo_mantenimiento' => 'correctivo',
                        'status' => 'completado',
                        'created_at' => now()
                    ]);
                }
            }

            // Cargar relaciones para la respuesta
            $correctivo->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            if ($correctivo->archivo) {
                $correctivo->archivo_url = Storage::disk('public')->url($correctivo->archivo);
            }

            DB::commit();

            return ResponseFormatter::success($correctivo, 'Correctivo actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar correctivo
     */
        /**
     * @OA\DELETE(
     *     path="/api/correctivos/{id}",
     *     tags={"Correctivos"},
     *     summary="Eliminar correctivo",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy($id)
    {
        try {
            $correctivo = CorrectivoGeneral::findOrFail($id);

            // Solo permitir eliminar si está programado
            if ($correctivo->estado !== 'programado') {
                return ResponseFormatter::error(
                    'Solo se pueden eliminar correctivos programados',
                    400
                );
            }

            // Eliminar archivos asociados en tabla mantenimiento
            $mantenimientosAsociados = DB::table('mantenimiento')
                ->where('equipo_id', $correctivo->equipo_id)
                ->where('observacion', 'like', '%correctivo - ID: ' . $correctivo->id . '%')
                ->get();
            
            foreach ($mantenimientosAsociados as $mantenimiento) {
                // Eliminar archivo físico si existe
                if ($mantenimiento->file && Storage::disk('public')->exists('correctivos_asociados/' . $mantenimiento->file)) {
                    Storage::disk('public')->delete('correctivos_asociados/' . $mantenimiento->file);
                }
                
                // Eliminar registro de mantenimiento
                DB::table('mantenimiento')->where('id', $mantenimiento->id)->delete();
            }

            $correctivo->delete();

            return ResponseFormatter::success(null, 'Correctivo eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar correctivo
     */
        /**
     * @OA\POST(
     *     path="/api/correctivos/{id}/completar",
     *     tags={"Correctivos"},
     *     summary="Completar correctivo",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function completar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'solucion' => 'required|string|max:1000',
            'repuestos_utilizados' => 'nullable|string',
            'costo_real' => 'nullable|numeric|min:0',
            'tiempo_real' => 'nullable|integer|min:1',
            'observaciones_finales' => 'nullable|string',
            'archivo_reporte' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $correctivo = CorrectivoGeneral::findOrFail($id);

            if ($correctivo->estado === 'completado') {
                return ResponseFormatter::error('El correctivo ya está completado', 400);
            }

            $updateData = [
                'estado' => 'completado',
                'fecha_completado' => now(),
                'solucion' => $request->solucion,
                'repuestos_utilizados' => $request->repuestos_utilizados,
                'costo_real' => $request->costo_real,
                'tiempo_real' => $request->tiempo_real,
                'observaciones_finales' => $request->observaciones_finales
            ];

            // Manejar archivo de reporte
            if ($request->hasFile('archivo_reporte')) {
                $file = $request->file('archivo_reporte');
                $fileName = 'reportes_correctivos/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('reportes_correctivos', $fileName, 'public');
                $updateData['archivo_reporte'] = $filePath;
            }

            $correctivo->update($updateData);

            DB::commit();

            return ResponseFormatter::success($correctivo, 'Correctivo completado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener correctivos por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $correctivos = CorrectivoGeneral::with([
                'tecnico:id,nombre,apellido'
            ])
            ->where('equipo_id', $equipoId)
            ->orderBy('fecha', 'desc')
            ->get();

            return ResponseFormatter::success($correctivos, 'Correctivos del equipo obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener correctivos pendientes
     */
    public function pendientes()
    {
        try {
            $correctivos = CorrectivoGeneral::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])
            ->whereIn('estado', ['programado', 'en_proceso'])
            ->orderBy('prioridad', 'desc')
            ->orderBy('fecha', 'asc')
            ->get();

            return ResponseFormatter::success($correctivos, 'Correctivos pendientes obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivos pendientes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de correctivos
     */
    public function estadisticas(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $stats = [
                'total_correctivos' => CorrectivoGeneral::whereYear('fecha', $year)->count(),
                'total_completados' => CorrectivoGeneral::where('estado', 'completado')
                    ->whereYear('fecha', $year)->count(),
                'total_pendientes' => CorrectivoGeneral::whereIn('estado', ['programado', 'en_proceso'])->count(),
                'por_prioridad' => CorrectivoGeneral::whereYear('fecha', $year)
                    ->groupBy('prioridad')
                    ->selectRaw('prioridad, count(*) as total')
                    ->get(),
                'por_estado' => CorrectivoGeneral::whereYear('fecha', $year)
                    ->groupBy('estado')
                    ->selectRaw('estado, count(*) as total')
                    ->get(),
                'por_mes' => CorrectivoGeneral::whereYear('fecha', $year)
                    ->groupBy(DB::raw('MONTH(fecha)'))
                    ->selectRaw('MONTH(fecha) as mes, count(*) as total')
                    ->orderBy('mes')
                    ->get(),
                'costo_total' => CorrectivoGeneral::where('estado', 'completado')
                    ->whereYear('fecha', $year)->sum('costo_real'),
                'tiempo_promedio' => CorrectivoGeneral::where('estado', 'completado')
                    ->whereYear('fecha', $year)->avg('tiempo_real')
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de correctivos obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Subir archivo general de correctivo (no asociado a un mantenimiento específico)
     * 
     * @OA\POST(
     *     path="/api/correctivos/upload-general",
     *     tags={"Correctivos"},
     *     summary="Subir archivo general de correctivo",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="archivo", type="string", format="binary"),
     *                 @OA\Property(property="titulo", type="string"),
     *                 @OA\Property(property="descripcion", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Archivo subido exitosamente")
     * )
     */
    public function uploadGeneral(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'archivo' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif|max:10240', // 10MB max
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                $fileName = uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('correctivos_generales', $fileName, 'public');

                // Guardar información del archivo en la tabla correctivos_generales
                $correctivoData = [
                    'file' => $fileName,
                    'description' => $request->titulo . ' - ' . ($request->descripcion ?? ''),
                    'status' => 1,
                    'created_at' => now()
                ];

                $correctivoId = DB::table('correctivos_generales')->insertGetId($correctivoData);

                DB::commit();

                return ResponseFormatter::success([
                    'id' => $correctivoId,
                    'archivo' => $fileName,
                    'titulo' => $request->titulo,
                    'url' => Storage::disk('public')->url('correctivos_generales/' . $fileName)
                ], 'Archivo general subido exitosamente', 201);
            }

            return ResponseFormatter::error('No se recibió ningún archivo', 400);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al subir archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener lista de archivos generales de correctivos
     * 
     * @OA\GET(
     *     path="/api/correctivos/archivos-generales",
     *     tags={"Correctivos"},
     *     summary="Obtener archivos generales de correctivos",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Lista obtenida exitosamente")
     * )
     */
    public function archivosGenerales(Request $request)
    {
        try {
            $query = DB::table('correctivos_generales')
                ->select('id', 'file', 'description', 'created_at')
                ->whereNotNull('file')
                ->where('file', '!=', '')
                ->whereNull('equipo_id') // Solo archivos generales (sin equipo específico)
                ->orderBy('created_at', 'desc');

            if ($request->has('search')) {
                $search = $request->search;
                $query->where('description', 'like', "%{$search}%");
            }

            $archivos = $query->paginate($request->get('per_page', 15));

            // Agregar URLs a los archivos
            $archivos->getCollection()->transform(function($archivo) {
                $archivo->url = Storage::disk('public')->url('correctivos_generales/' . $archivo->file);
                // Extraer título de la descripción
                $descripcionParts = explode(' - ', $archivo->description);
                $archivo->titulo = $descripcionParts[0] ?? $archivo->description;
                return $archivo;
            });

            return ResponseFormatter::success($archivos, 'Archivos generales obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar archivo general de correctivo
     * 
     * @OA\DELETE(
     *     path="/api/correctivos/archivos-generales/{id}",
     *     tags={"Correctivos"},
     *     summary="Eliminar archivo general",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Archivo eliminado exitosamente")
     * )
     */
    public function eliminarArchivoGeneral($id)
    {
        try {
            DB::beginTransaction();

            $correctivo = DB::table('correctivos_generales')->where('id', $id)->first();

            if (!$correctivo) {
                return ResponseFormatter::error('Archivo no encontrado', 404);
            }

            // Verificar que sea un archivo general (sin equipo_id)
            if ($correctivo->equipo_id !== null) {
                return ResponseFormatter::error('No se puede eliminar un archivo asociado a un equipo específico', 400);
            }

            // Eliminar archivo físico
            if ($correctivo->file && Storage::disk('public')->exists('correctivos_generales/' . $correctivo->file)) {
                Storage::disk('public')->delete('correctivos_generales/' . $correctivo->file);
            }

            // Eliminar registro de la base de datos
            DB::table('correctivos_generales')->where('id', $id)->delete();

            DB::commit();

            return ResponseFormatter::success(null, 'Archivo eliminado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al eliminar archivo: ' . $e->getMessage(), 500);
        }
    }
}

{{ ... }}
