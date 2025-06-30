<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Propietario;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador completo para gestión de propietarios
 * Maneja todas las operaciones CRUD y funcionalidades específicas
 */
class PropietarioController extends ApiController
{
    /**
     * Obtener lista paginada de propietarios
     */
        /**
     * @OA\GET(
     *     path="/api/propietarios",
     *     tags={"Propietarios"},
     *     summary="Listar propietarios",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Propietario::query();

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%");
                });
            }

            if ($request->has('activo')) {
                $query->where('activo', $request->activo);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'nombre');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 10);
            $propietarios = $query->paginate($perPage);

            return $this->paginatedResponse($propietarios, 'Propietarios obtenidos exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener propietarios: ' . $e->getMessage());
        }
    }

    /**
     * Crear nuevo propietario
     */
        /**
     * @OA\POST(
     *     path="/api/propietarios",
     *     tags={"Propietarios"},
     *     summary="Crear nuevo propietario",
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
                'codigo' => 'required|string|max:50|unique:propietarios,codigo',
                'descripcion' => 'nullable|string',
                'contacto' => 'nullable|string|max:255',
                'telefono' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'direccion' => 'nullable|string',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $propietario = Propietario::create([
                'nombre' => $request->nombre,
                'codigo' => $request->codigo,
                'descripcion' => $request->descripcion,
                'contacto' => $request->contacto,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'direccion' => $request->direccion,
                'activo' => $request->get('activo', true)
            ]);

            DB::commit();

            return $this->successResponse($propietario, 'Propietario creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear propietario: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar propietario específico
     */
        /**
     * @OA\GET(
     *     path="/api/propietarios/{id}",
     *     tags={"Propietarios"},
     *     summary="Obtener propietario específico",
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
            $propietario = Propietario::with(['equipos'])->find($id);

            if (!$propietario) {
                return $this->notFoundResponse('Propietario no encontrado');
            }

            // Agregar estadísticas
            $propietario->estadisticas = [
                'total_equipos' => $propietario->equipos->count(),
                'equipos_activos' => $propietario->equipos->where('status', 1)->count(),
                'equipos_inactivos' => $propietario->equipos->where('status', 0)->count()
            ];

            return $this->successResponse($propietario, 'Propietario obtenido exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener propietario: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar propietario
     */
        /**
     * @OA\PUT(
     *     path="/api/propietarios/{id}",
     *     tags={"Propietarios"},
     *     summary="Actualizar propietario",
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
            $propietario = Propietario::find($id);

            if (!$propietario) {
                return $this->notFoundResponse('Propietario no encontrado');
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'codigo' => 'required|string|max:50|unique:propietarios,codigo,' . $id,
                'descripcion' => 'nullable|string',
                'contacto' => 'nullable|string|max:255',
                'telefono' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'direccion' => 'nullable|string',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $propietario->update([
                'nombre' => $request->nombre,
                'codigo' => $request->codigo,
                'descripcion' => $request->descripcion,
                'contacto' => $request->contacto,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'direccion' => $request->direccion,
                'activo' => $request->get('activo', $propietario->activo)
            ]);

            DB::commit();

            return $this->successResponse($propietario, 'Propietario actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar propietario: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar propietario
     */
        /**
     * @OA\DELETE(
     *     path="/api/propietarios/{id}",
     *     tags={"Propietarios"},
     *     summary="Eliminar propietario",
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
            $propietario = Propietario::find($id);

            if (!$propietario) {
                return $this->notFoundResponse('Propietario no encontrado');
            }

            // Verificar si tiene equipos asociados
            $equiposCount = Equipo::where('propietario_id', $id)->count();
            if ($equiposCount > 0) {
                return $this->errorResponse('No se puede eliminar el propietario porque tiene equipos asociados', 409);
            }

            DB::beginTransaction();
            $propietario->delete();
            DB::commit();

            return $this->successResponse(null, 'Propietario eliminado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al eliminar propietario: ' . $e->getMessage());
        }
    }

    /**
     * Obtener propietarios activos para dropdowns
     */
    public function getActivos()
    {
        try {
            $propietarios = Propietario::where('activo', true)
                ->select('id', 'nombre', 'codigo')
                ->orderBy('nombre')
                ->get();

            return $this->successResponse($propietarios, 'Propietarios activos obtenidos');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener propietarios activos: ' . $e->getMessage());
        }
    }

    /**
     * Cambiar estado activo/inactivo
     */
    public function toggleStatus($id)
    {
        try {
            $propietario = Propietario::find($id);

            if (!$propietario) {
                return $this->notFoundResponse('Propietario no encontrado');
            }

            DB::beginTransaction();
            $propietario->activo = !$propietario->activo;
            $propietario->save();
            DB::commit();

            $status = $propietario->activo ? 'activado' : 'desactivado';
            return $this->successResponse($propietario, "Propietario {$status} exitosamente");

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al cambiar estado: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas de propietarios
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total' => Propietario::count(),
                'activos' => Propietario::where('activo', true)->count(),
                'inactivos' => Propietario::where('activo', false)->count(),
                'con_equipos' => Propietario::has('equipos')->count(),
                'sin_equipos' => Propietario::doesntHave('equipos')->count(),
                'top_propietarios' => Propietario::withCount('equipos')
                    ->orderBy('equipos_count', 'desc')
                    ->limit(5)
                    ->get(['id', 'nombre', 'equipos_count'])
            ];

            return $this->successResponse($stats, 'Estadísticas obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }

    /**
     * Obtener equipos de un propietario
     */
    public function equipos($id, Request $request)
    {
        try {
            $propietario = Propietario::find($id);

            if (!$propietario) {
                return $this->notFoundResponse('Propietario no encontrado');
            }

            $query = $propietario->equipos()->with(['servicio', 'area']);

            // Filtros
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 10);
            $equipos = $query->paginate($perPage);

            return $this->paginatedResponse($equipos, 'Equipos del propietario obtenidos');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener equipos: ' . $e->getMessage());
        }
    }
}
