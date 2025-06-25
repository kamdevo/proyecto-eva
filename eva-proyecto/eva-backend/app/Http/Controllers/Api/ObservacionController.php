<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Observacion;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador completo para gestión de observaciones
 * Maneja observaciones de equipos, mantenimientos y contingencias
 */
class ObservacionController extends ApiController
{
    /**
     * Obtener lista paginada de observaciones
     */
        /**
     * @OA\GET(
     *     path="/api/observaciones",
     *     tags={"Observaciones"},
     *     summary="Listar observaciones",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Observacion::with(['equipo', 'mantenimiento', 'usuario']);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('descripcion', 'like', "%{$search}%")
                      ->orWhere('observacion', 'like', "%{$search}%")
                      ->orWhere('recomendacion', 'like', "%{$search}%");
                });
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('prioridad')) {
                $query->where('prioridad', $request->prioridad);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('mantenimiento_id')) {
                $query->where('mantenimiento_id', $request->mantenimiento_id);
            }

            if ($request->has('fecha_desde')) {
                $query->whereDate('fecha', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->whereDate('fecha', '<=', $request->fecha_hasta);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'fecha');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 10);
            $observaciones = $query->paginate($perPage);

            return $this->paginatedResponse($observaciones, 'Observaciones obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener observaciones: ' . $e->getMessage());
        }
    }

    /**
     * Crear nueva observación
     */
        /**
     * @OA\POST(
     *     path="/api/observaciones",
     *     tags={"Observaciones"},
     *     summary="Crear nueva observación",
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
                'descripcion' => 'required|string',
                'observacion' => 'required|string',
                'recomendacion' => 'nullable|string',
                'tipo' => 'required|string|in:preventivo,correctivo,calibracion,inspeccion,general',
                'estado' => 'required|string|in:abierta,en_proceso,cerrada,cancelada',
                'prioridad' => 'required|string|in:baja,media,alta,critica',
                'equipo_id' => 'nullable|integer|exists:equipos,id',
                'mantenimiento_id' => 'nullable|integer|exists:mantenimientos,id',
                'fecha' => 'required|date',
                'fecha_limite' => 'nullable|date|after:fecha',
                'responsable_id' => 'nullable|integer|exists:usuarios,id',
                'costo_estimado' => 'nullable|numeric|min:0',
                'tiempo_estimado' => 'nullable|integer|min:1'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $observacion = Observacion::create([
                'descripcion' => $request->descripcion,
                'observacion' => $request->observacion,
                'recomendacion' => $request->recomendacion,
                'tipo' => $request->tipo,
                'estado' => $request->estado,
                'prioridad' => $request->prioridad,
                'equipo_id' => $request->equipo_id,
                'mantenimiento_id' => $request->mantenimiento_id,
                'usuario_id' => auth()->id(),
                'responsable_id' => $request->responsable_id,
                'fecha' => $request->fecha,
                'fecha_limite' => $request->fecha_limite,
                'costo_estimado' => $request->costo_estimado,
                'tiempo_estimado' => $request->tiempo_estimado
            ]);

            DB::commit();

            return $this->successResponse(
                $observacion->load(['equipo', 'mantenimiento', 'usuario', 'responsable']), 
                'Observación creada exitosamente', 
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear observación: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar observación específica
     */
        /**
     * @OA\GET(
     *     path="/api/observaciones/{id}",
     *     tags={"Observaciones"},
     *     summary="Obtener observación específica",
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
            $observacion = Observacion::with(['equipo', 'mantenimiento', 'usuario', 'responsable'])->find($id);

            if (!$observacion) {
                return $this->notFoundResponse('Observación no encontrada');
            }

            return $this->successResponse($observacion, 'Observación obtenida exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener observación: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar observación
     */
        /**
     * @OA\PUT(
     *     path="/api/observaciones/{id}",
     *     tags={"Observaciones"},
     *     summary="Actualizar observación",
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
            $observacion = Observacion::find($id);

            if (!$observacion) {
                return $this->notFoundResponse('Observación no encontrada');
            }

            $validator = Validator::make($request->all(), [
                'descripcion' => 'required|string',
                'observacion' => 'required|string',
                'recomendacion' => 'nullable|string',
                'tipo' => 'required|string|in:preventivo,correctivo,calibracion,inspeccion,general',
                'estado' => 'required|string|in:abierta,en_proceso,cerrada,cancelada',
                'prioridad' => 'required|string|in:baja,media,alta,critica',
                'equipo_id' => 'nullable|integer|exists:equipos,id',
                'mantenimiento_id' => 'nullable|integer|exists:mantenimientos,id',
                'fecha' => 'required|date',
                'fecha_limite' => 'nullable|date|after:fecha',
                'responsable_id' => 'nullable|integer|exists:usuarios,id',
                'costo_estimado' => 'nullable|numeric|min:0',
                'tiempo_estimado' => 'nullable|integer|min:1'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $observacion->update([
                'descripcion' => $request->descripcion,
                'observacion' => $request->observacion,
                'recomendacion' => $request->recomendacion,
                'tipo' => $request->tipo,
                'estado' => $request->estado,
                'prioridad' => $request->prioridad,
                'equipo_id' => $request->equipo_id,
                'mantenimiento_id' => $request->mantenimiento_id,
                'responsable_id' => $request->responsable_id,
                'fecha' => $request->fecha,
                'fecha_limite' => $request->fecha_limite,
                'costo_estimado' => $request->costo_estimado,
                'tiempo_estimado' => $request->tiempo_estimado
            ]);

            DB::commit();

            return $this->successResponse(
                $observacion->load(['equipo', 'mantenimiento', 'usuario', 'responsable']), 
                'Observación actualizada exitosamente'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar observación: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar observación
     */
        /**
     * @OA\DELETE(
     *     path="/api/observaciones/{id}",
     *     tags={"Observaciones"},
     *     summary="Eliminar observación",
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
            $observacion = Observacion::find($id);

            if (!$observacion) {
                return $this->notFoundResponse('Observación no encontrada');
            }

            DB::beginTransaction();
            $observacion->delete();
            DB::commit();

            return $this->successResponse(null, 'Observación eliminada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al eliminar observación: ' . $e->getMessage());
        }
    }

    /**
     * Obtener observaciones por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $equipo = Equipo::find($equipoId);

            if (!$equipo) {
                return $this->notFoundResponse('Equipo no encontrado');
            }

            $observaciones = Observacion::where('equipo_id', $equipoId)
                ->with(['usuario', 'responsable'])
                ->orderBy('fecha', 'desc')
                ->get();

            return $this->successResponse($observaciones, 'Observaciones del equipo obtenidas');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener observaciones del equipo: ' . $e->getMessage());
        }
    }

    /**
     * Obtener observaciones por mantenimiento
     */
    public function porMantenimiento($mantenimientoId)
    {
        try {
            $mantenimiento = Mantenimiento::find($mantenimientoId);

            if (!$mantenimiento) {
                return $this->notFoundResponse('Mantenimiento no encontrado');
            }

            $observaciones = Observacion::where('mantenimiento_id', $mantenimientoId)
                ->with(['usuario', 'responsable'])
                ->orderBy('fecha', 'desc')
                ->get();

            return $this->successResponse($observaciones, 'Observaciones del mantenimiento obtenidas');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener observaciones del mantenimiento: ' . $e->getMessage());
        }
    }

    /**
     * Cerrar observación
     */
    public function cerrar($id, Request $request)
    {
        try {
            $observacion = Observacion::find($id);

            if (!$observacion) {
                return $this->notFoundResponse('Observación no encontrada');
            }

            $validator = Validator::make($request->all(), [
                'solucion' => 'required|string',
                'costo_real' => 'nullable|numeric|min:0',
                'tiempo_real' => 'nullable|integer|min:1'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $observacion->update([
                'estado' => 'cerrada',
                'solucion' => $request->solucion,
                'costo_real' => $request->costo_real,
                'tiempo_real' => $request->tiempo_real,
                'fecha_cierre' => now(),
                'cerrada_por' => auth()->id()
            ]);

            DB::commit();

            return $this->successResponse($observacion, 'Observación cerrada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al cerrar observación: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas de observaciones
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total' => Observacion::count(),
                'abiertas' => Observacion::where('estado', 'abierta')->count(),
                'en_proceso' => Observacion::where('estado', 'en_proceso')->count(),
                'cerradas' => Observacion::where('estado', 'cerrada')->count(),
                'por_tipo' => Observacion::groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->pluck('total', 'tipo'),
                'por_prioridad' => Observacion::groupBy('prioridad')
                    ->selectRaw('prioridad, count(*) as total')
                    ->pluck('total', 'prioridad'),
                'vencidas' => Observacion::where('estado', '!=', 'cerrada')
                    ->where('fecha_limite', '<', now())
                    ->count(),
                'proximas_vencer' => Observacion::where('estado', '!=', 'cerrada')
                    ->whereBetween('fecha_limite', [now(), now()->addDays(7)])
                    ->count()
            ];

            return $this->successResponse($stats, 'Estadísticas obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }
}
