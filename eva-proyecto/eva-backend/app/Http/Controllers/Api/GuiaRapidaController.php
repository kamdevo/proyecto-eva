<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\GuiaRapida;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador completo para gestión de guías rápidas
 * Maneja documentos de referencia rápida para equipos y procedimientos
 */
class GuiaRapidaController extends ApiController
{
    /**
     * Obtener lista paginada de guías rápidas
     */
        /**
     * @OA\GET(
     *     path="/api/guias",
     *     tags={"Guías Rápidas"},
     *     summary="Listar guías rápidas",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = GuiaRapida::with(['equipo', 'autor']);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhere('contenido', 'like', "%{$search}%")
                      ->orWhere('tags', 'like', "%{$search}%");
                });
            }

            if ($request->has('categoria')) {
                $query->where('categoria', $request->categoria);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('activo')) {
                $query->where('activo', $request->activo);
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 10);
            $guias = $query->paginate($perPage);

            return $this->paginatedResponse($guias, 'Guías rápidas obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener guías rápidas: ' . $e->getMessage());
        }
    }

    /**
     * Crear nueva guía rápida
     */
        /**
     * @OA\POST(
     *     path="/api/guias",
     *     tags={"Guías Rápidas"},
     *     summary="Crear nueva guía",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'contenido' => 'required|string',
                'categoria' => 'required|string|in:mantenimiento,operacion,seguridad,calibracion,limpieza,emergencia',
                'tipo' => 'required|string|in:procedimiento,checklist,troubleshooting,referencia',
                'equipo_id' => 'nullable|integer|exists:equipos,id',
                'tags' => 'nullable|string',
                'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
                'prioridad' => 'nullable|integer|min:1|max:5',
                'tiempo_estimado' => 'nullable|integer|min:1',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $data = [
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'contenido' => $request->contenido,
                'categoria' => $request->categoria,
                'tipo' => $request->tipo,
                'equipo_id' => $request->equipo_id,
                'tags' => $request->tags,
                'prioridad' => $request->get('prioridad', 3),
                'tiempo_estimado' => $request->tiempo_estimado,
                'autor_id' => auth()->id(),
                'activo' => $request->get('activo', true)
            ];

            // Manejar archivo si se subió
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('guias-rapidas', $fileName, 'public');
                $data['archivo_path'] = $filePath;
                $data['archivo_nombre'] = $file->getClientOriginalName();
                $data['archivo_tamaño'] = $file->getSize();
            }

            $guia = GuiaRapida::create($data);

            DB::commit();

            return $this->successResponse($guia->load(['equipo', 'autor']), 'Guía rápida creada exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear guía rápida: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar guía rápida específica
     */
        /**
     * @OA\GET(
     *     path="/api/guias/{id}",
     *     tags={"Guías Rápidas"},
     *     summary="Obtener guía específica",
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
            $guia = GuiaRapida::with(['equipo', 'autor'])->find($id);

            if (!$guia) {
                return $this->notFoundResponse('Guía rápida no encontrada');
            }

            // Incrementar contador de visualizaciones
            $guia->increment('visualizaciones');

            return $this->successResponse($guia, 'Guía rápida obtenida exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener guía rápida: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar guía rápida
     */
        /**
     * @OA\PUT(
     *     path="/api/guias/{id}",
     *     tags={"Guías Rápidas"},
     *     summary="Actualizar guía",
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
        try {
            $guia = GuiaRapida::find($id);

            if (!$guia) {
                return $this->notFoundResponse('Guía rápida no encontrada');
            }

            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'contenido' => 'required|string',
                'categoria' => 'required|string|in:mantenimiento,operacion,seguridad,calibracion,limpieza,emergencia',
                'tipo' => 'required|string|in:procedimiento,checklist,troubleshooting,referencia',
                'equipo_id' => 'nullable|integer|exists:equipos,id',
                'tags' => 'nullable|string',
                'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
                'prioridad' => 'nullable|integer|min:1|max:5',
                'tiempo_estimado' => 'nullable|integer|min:1',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $data = [
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'contenido' => $request->contenido,
                'categoria' => $request->categoria,
                'tipo' => $request->tipo,
                'equipo_id' => $request->equipo_id,
                'tags' => $request->tags,
                'prioridad' => $request->get('prioridad', $guia->prioridad),
                'tiempo_estimado' => $request->tiempo_estimado,
                'activo' => $request->get('activo', $guia->activo)
            ];

            // Manejar archivo si se subió uno nuevo
            if ($request->hasFile('archivo')) {
                // Eliminar archivo anterior si existe
                if ($guia->archivo_path && Storage::disk('public')->exists($guia->archivo_path)) {
                    Storage::disk('public')->delete($guia->archivo_path);
                }

                $file = $request->file('archivo');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('guias-rapidas', $fileName, 'public');
                $data['archivo_path'] = $filePath;
                $data['archivo_nombre'] = $file->getClientOriginalName();
                $data['archivo_tamaño'] = $file->getSize();
            }

            $guia->update($data);

            DB::commit();

            return $this->successResponse($guia->load(['equipo', 'autor']), 'Guía rápida actualizada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar guía rápida: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar guía rápida
     */
        /**
     * @OA\DELETE(
     *     path="/api/guias/{id}",
     *     tags={"Guías Rápidas"},
     *     summary="Eliminar guía",
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
            $guia = GuiaRapida::find($id);

            if (!$guia) {
                return $this->notFoundResponse('Guía rápida no encontrada');
            }

            DB::beginTransaction();

            // Eliminar archivo si existe
            if ($guia->archivo_path && Storage::disk('public')->exists($guia->archivo_path)) {
                Storage::disk('public')->delete($guia->archivo_path);
            }

            $guia->delete();

            DB::commit();

            return $this->successResponse(null, 'Guía rápida eliminada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al eliminar guía rápida: ' . $e->getMessage());
        }
    }

    /**
     * Obtener guías por categoría
     */
    public function porCategoria($categoria)
    {
        try {
            $guias = GuiaRapida::where('categoria', $categoria)
                ->where('activo', true)
                ->with(['equipo', 'autor'])
                ->orderBy('prioridad', 'desc')
                ->orderBy('titulo')
                ->get();

            return $this->successResponse($guias, "Guías de categoría {$categoria} obtenidas");

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener guías por categoría: ' . $e->getMessage());
        }
    }

    /**
     * Obtener guías de un equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $equipo = Equipo::find($equipoId);

            if (!$equipo) {
                return $this->notFoundResponse('Equipo no encontrado');
            }

            $guias = GuiaRapida::where('equipo_id', $equipoId)
                ->where('activo', true)
                ->with(['autor'])
                ->orderBy('categoria')
                ->orderBy('prioridad', 'desc')
                ->get();

            return $this->successResponse($guias, 'Guías del equipo obtenidas');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener guías del equipo: ' . $e->getMessage());
        }
    }

    /**
     * Cambiar estado activo/inactivo
     */
    public function toggleStatus($id)
    {
        try {
            $guia = GuiaRapida::find($id);

            if (!$guia) {
                return $this->notFoundResponse('Guía rápida no encontrada');
            }

            DB::beginTransaction();
            $guia->activo = !$guia->activo;
            $guia->save();
            DB::commit();

            $status = $guia->activo ? 'activada' : 'desactivada';
            return $this->successResponse($guia, "Guía rápida {$status} exitosamente");

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al cambiar estado: ' . $e->getMessage());
        }
    }

    /**
     * Descargar archivo de guía
     */
    public function descargarArchivo($id)
    {
        try {
            $guia = GuiaRapida::find($id);

            if (!$guia) {
                return $this->notFoundResponse('Guía rápida no encontrada');
            }

            if (!$guia->archivo_path) {
                return $this->errorResponse('La guía no tiene archivo adjunto');
            }

            if (!Storage::disk('public')->exists($guia->archivo_path)) {
                return $this->errorResponse('Archivo no encontrado en el servidor');
            }

            // Incrementar contador de descargas
            $guia->increment('descargas');

            return response()->download(
                Storage::disk('public')->path($guia->archivo_path),
                $guia->archivo_nombre
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Error al descargar archivo: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas de guías rápidas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total' => GuiaRapida::count(),
                'activas' => GuiaRapida::where('activo', true)->count(),
                'inactivas' => GuiaRapida::where('activo', false)->count(),
                'por_categoria' => GuiaRapida::groupBy('categoria')
                    ->selectRaw('categoria, count(*) as total')
                    ->pluck('total', 'categoria'),
                'por_tipo' => GuiaRapida::groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->pluck('total', 'tipo'),
                'mas_vistas' => GuiaRapida::orderBy('visualizaciones', 'desc')
                    ->limit(5)
                    ->get(['id', 'titulo', 'visualizaciones']),
                'mas_descargadas' => GuiaRapida::orderBy('descargas', 'desc')
                    ->limit(5)
                    ->get(['id', 'titulo', 'descargas']),
                'con_archivo' => GuiaRapida::whereNotNull('archivo_path')->count()
            ];

            return $this->successResponse($stats, 'Estadísticas obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }
}
