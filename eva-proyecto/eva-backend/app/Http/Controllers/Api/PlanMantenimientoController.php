<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\PlanMantenimiento;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador completo para gestión de planes de mantenimiento
 * Maneja planificación y programación de mantenimientos
 */
class PlanMantenimientoController extends ApiController
{
    /**
     * Obtener lista paginada de planes de mantenimiento
     */
        /**
     * @OA\GET(
     *     path="/api/planes-mantenimiento",
     *     tags={"Planes de Mantenimiento"},
     *     summary="Listar planes de mantenimiento",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = PlanMantenimiento::with(['equipo', 'responsable']);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhereHas('equipo', function($eq) use ($search) {
                          $eq->where('name', 'like', "%{$search}%")
                             ->orWhere('code', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('frecuencia')) {
                $query->where('frecuencia', $request->frecuencia);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('activo')) {
                $query->where('activo', $request->activo);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 10);
            $planes = $query->paginate($perPage);

            return $this->paginatedResponse($planes, 'Planes de mantenimiento obtenidos exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener planes de mantenimiento: ' . $e->getMessage());
        }
    }

    /**
     * Crear nuevo plan de mantenimiento
     */
        /**
     * @OA\POST(
     *     path="/api/planes-mantenimiento",
     *     tags={"Planes de Mantenimiento"},
     *     summary="Crear nuevo plan",
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
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'tipo' => 'required|string|in:preventivo,correctivo,predictivo,calibracion',
                'frecuencia' => 'required|string|in:diario,semanal,mensual,bimestral,trimestral,semestral,anual',
                'equipo_id' => 'required|integer|exists:equipos,id',
                'responsable_id' => 'nullable|integer|exists:usuarios,id',
                'duracion_estimada' => 'nullable|integer|min:1',
                'costo_estimado' => 'nullable|numeric|min:0',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'nullable|date|after:fecha_inicio',
                'instrucciones' => 'nullable|string',
                'materiales' => 'nullable|string',
                'herramientas' => 'nullable|string',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $plan = PlanMantenimiento::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'tipo' => $request->tipo,
                'frecuencia' => $request->frecuencia,
                'equipo_id' => $request->equipo_id,
                'responsable_id' => $request->responsable_id,
                'creado_por' => auth()->id(),
                'duracion_estimada' => $request->duracion_estimada,
                'costo_estimado' => $request->costo_estimado,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'instrucciones' => $request->instrucciones,
                'materiales' => $request->materiales,
                'herramientas' => $request->herramientas,
                'activo' => $request->get('activo', true),
                'estado' => 'activo'
            ]);

            // Generar mantenimientos programados si es necesario
            $this->generarMantenimientosProgramados($plan);

            DB::commit();

            return $this->successResponse(
                $plan->load(['equipo', 'responsable', 'creador']), 
                'Plan de mantenimiento creado exitosamente', 
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear plan de mantenimiento: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar plan de mantenimiento específico
     */
        /**
     * @OA\GET(
     *     path="/api/planes-mantenimiento/{id}",
     *     tags={"Planes de Mantenimiento"},
     *     summary="Obtener plan específico",
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
            $plan = PlanMantenimiento::with(['equipo', 'responsable', 'creador', 'mantenimientos'])->find($id);

            if (!$plan) {
                return $this->notFoundResponse('Plan de mantenimiento no encontrado');
            }

            // Agregar estadísticas del plan
            $plan->estadisticas = [
                'mantenimientos_programados' => $plan->mantenimientos->where('estado', 'programado')->count(),
                'mantenimientos_completados' => $plan->mantenimientos->where('estado', 'completado')->count(),
                'mantenimientos_vencidos' => $plan->mantenimientos->where('estado', 'programado')
                    ->where('fecha_programada', '<', now())->count(),
                'costo_total_ejecutado' => $plan->mantenimientos->where('estado', 'completado')->sum('costo'),
                'tiempo_total_ejecutado' => $plan->mantenimientos->where('estado', 'completado')->sum('tiempo_real')
            ];

            return $this->successResponse($plan, 'Plan de mantenimiento obtenido exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener plan de mantenimiento: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar plan de mantenimiento
     */
        /**
     * @OA\PUT(
     *     path="/api/planes-mantenimiento/{id}",
     *     tags={"Planes de Mantenimiento"},
     *     summary="Actualizar plan",
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
            $plan = PlanMantenimiento::find($id);

            if (!$plan) {
                return $this->notFoundResponse('Plan de mantenimiento no encontrado');
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'tipo' => 'required|string|in:preventivo,correctivo,predictivo,calibracion',
                'frecuencia' => 'required|string|in:diario,semanal,mensual,bimestral,trimestral,semestral,anual',
                'equipo_id' => 'required|integer|exists:equipos,id',
                'responsable_id' => 'nullable|integer|exists:usuarios,id',
                'duracion_estimada' => 'nullable|integer|min:1',
                'costo_estimado' => 'nullable|numeric|min:0',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'nullable|date|after:fecha_inicio',
                'instrucciones' => 'nullable|string',
                'materiales' => 'nullable|string',
                'herramientas' => 'nullable|string',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $plan->update([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'tipo' => $request->tipo,
                'frecuencia' => $request->frecuencia,
                'equipo_id' => $request->equipo_id,
                'responsable_id' => $request->responsable_id,
                'duracion_estimada' => $request->duracion_estimada,
                'costo_estimado' => $request->costo_estimado,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'instrucciones' => $request->instrucciones,
                'materiales' => $request->materiales,
                'herramientas' => $request->herramientas,
                'activo' => $request->get('activo', $plan->activo)
            ]);

            DB::commit();

            return $this->successResponse(
                $plan->load(['equipo', 'responsable', 'creador']), 
                'Plan de mantenimiento actualizado exitosamente'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar plan de mantenimiento: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar plan de mantenimiento
     */
        /**
     * @OA\DELETE(
     *     path="/api/planes-mantenimiento/{id}",
     *     tags={"Planes de Mantenimiento"},
     *     summary="Eliminar plan",
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
            $plan = PlanMantenimiento::find($id);

            if (!$plan) {
                return $this->notFoundResponse('Plan de mantenimiento no encontrado');
            }

            // Verificar si tiene mantenimientos programados
            $mantenimientosPendientes = $plan->mantenimientos()
                ->where('estado', 'programado')
                ->count();

            if ($mantenimientosPendientes > 0) {
                return $this->errorResponse(
                    'No se puede eliminar el plan porque tiene mantenimientos programados pendientes', 
                    409
                );
            }

            DB::beginTransaction();
            $plan->delete();
            DB::commit();

            return $this->successResponse(null, 'Plan de mantenimiento eliminado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al eliminar plan de mantenimiento: ' . $e->getMessage());
        }
    }

    /**
     * Obtener planes por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $equipo = Equipo::find($equipoId);

            if (!$equipo) {
                return $this->notFoundResponse('Equipo no encontrado');
            }

            $planes = PlanMantenimiento::where('equipo_id', $equipoId)
                ->where('activo', true)
                ->with(['responsable'])
                ->orderBy('tipo')
                ->orderBy('frecuencia')
                ->get();

            return $this->successResponse($planes, 'Planes del equipo obtenidos');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener planes del equipo: ' . $e->getMessage());
        }
    }

    /**
     * Activar/desactivar plan
     */
    public function toggleStatus($id)
    {
        try {
            $plan = PlanMantenimiento::find($id);

            if (!$plan) {
                return $this->notFoundResponse('Plan de mantenimiento no encontrado');
            }

            DB::beginTransaction();
            $plan->activo = !$plan->activo;
            $plan->estado = $plan->activo ? 'activo' : 'inactivo';
            $plan->save();
            DB::commit();

            $status = $plan->activo ? 'activado' : 'desactivado';
            return $this->successResponse($plan, "Plan de mantenimiento {$status} exitosamente");

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al cambiar estado: ' . $e->getMessage());
        }
    }

    /**
     * Generar mantenimientos programados para un plan
     */
    private function generarMantenimientosProgramados(PlanMantenimiento $plan)
    {
        // Esta función generaría los mantenimientos según la frecuencia
        // Por ahora solo registramos que se intentó generar
        \Log::info("Generando mantenimientos programados para plan: {$plan->id}");
    }

    /**
     * Obtener estadísticas de planes
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total' => PlanMantenimiento::count(),
                'activos' => PlanMantenimiento::where('activo', true)->count(),
                'inactivos' => PlanMantenimiento::where('activo', false)->count(),
                'por_tipo' => PlanMantenimiento::groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->pluck('total', 'tipo'),
                'por_frecuencia' => PlanMantenimiento::groupBy('frecuencia')
                    ->selectRaw('frecuencia, count(*) as total')
                    ->pluck('total', 'frecuencia'),
                'costo_total_estimado' => PlanMantenimiento::where('activo', true)->sum('costo_estimado')
            ];

            return $this->successResponse($stats, 'Estadísticas obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }
}
