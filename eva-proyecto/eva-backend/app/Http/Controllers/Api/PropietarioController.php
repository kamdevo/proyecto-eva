<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
            $query = DB::table('propietarios');

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('nombre', 'like', "%{$search}%");
            }

            // Ordenamiento (aceptar sort_order o sort_direction)
            $sortBy = $request->get('sort_by', 'nombre');
            $sortOrder = $request->get('sort_direction', $request->get('sort_order', 'asc'));
            
            // Mapear campos si es necesario
            $sortFieldMap = [
                'id' => 'id',
                'nombre' => 'nombre'
            ];
            
            $sortField = $sortFieldMap[$sortBy] ?? 'nombre';
            $sortDir = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'asc';
            
            $query->orderBy($sortField, $sortDir);

            // Paginación
            $perPage = $request->get('per_page', 10);
            $total = $query->count();
            $propietarios = $query->paginate($perPage);

            // Agregar conteo de equipos para cada propietario
            $propietarios->getCollection()->transform(function ($propietario) {
                $propietario->equipos_count = DB::table('equipos')
                    ->where('propietario_id', $propietario->id)
                    ->count();
                
                // Agregar URL completa del logo si existe
                if ($propietario->logo) {
                    $propietario->logo_url = url('storage/equipos/images/' . $propietario->logo);
                }
                
                return $propietario;
            });

            return response()->json([
                'success' => true,
                'data' => $propietarios->items(),
                'pagination' => [
                    'total' => $propietarios->total(),
                    'per_page' => $propietarios->perPage(),
                    'current_page' => $propietarios->currentPage(),
                    'last_page' => $propietarios->lastPage(),
                    'from' => $propietarios->firstItem(),
                    'to' => $propietarios->lastItem()
                ],
                'message' => 'Propietarios obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener propietarios: ' . $e->getMessage()
            ], 500);
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
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $logoName = null;
            
            // Logo es opcional
            if ($request->hasFile('logo')) {
                $logo = $request->file('logo');
                $logoName = time() . '_' . uniqid() . '.' . $logo->getClientOriginalExtension();
                $logo->move(public_path('storage/equipos/images'), $logoName);
            }

            $insertData = [
                'nombre' => $request->nombre,
                'logo' => $logoName
            ];

            $propietarioId = DB::table('propietarios')->insertGetId($insertData);

            $propietario = DB::table('propietarios')->where('id', $propietarioId)->first();
            
            if ($propietario->logo) {
                $propietario->logo_url = url('storage/equipos/images/' . $propietario->logo);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $propietario,
                'message' => 'Propietario creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear propietario: ' . $e->getMessage()
            ], 500);
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
            $propietario = DB::table('propietarios')->where('id', $id)->first();

            if (!$propietario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Propietario no encontrado'
                ], 404);
            }

            // Agregar estadísticas
            $totalEquipos = DB::table('equipos')->where('propietario_id', $id)->count();
            $equiposActivos = DB::table('equipos')->where('propietario_id', $id)->where('status', 1)->count();
            
            $propietario->equipos_count = $totalEquipos;
            $propietario->equipos_activos = $equiposActivos;
            $propietario->equipos_inactivos = $totalEquipos - $equiposActivos;
            
            if ($propietario->logo) {
                $propietario->logo_url = url('storage/equipos/images/' . $propietario->logo);
            }

            return response()->json([
                'success' => true,
                'data' => $propietario,
                'message' => 'Propietario obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener propietario: ' . $e->getMessage()
            ], 500);
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
            $propietario = DB::table('propietarios')->where('id', $id)->first();

            if (!$propietario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Propietario no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $updateData = [
                'nombre' => $request->nombre
            ];

            // Manejar logo
            if ($request->hasFile('logo')) {
                // Eliminar logo anterior si existe
                if ($propietario->logo && file_exists(public_path('storage/equipos/images/' . $propietario->logo))) {
                    unlink(public_path('storage/equipos/images/' . $propietario->logo));
                }
                
                $logo = $request->file('logo');
                $logoName = time() . '_' . uniqid() . '.' . $logo->getClientOriginalExtension();
                $logo->move(public_path('storage/equipos/images'), $logoName);
                $updateData['logo'] = $logoName;
            }

            DB::table('propietarios')->where('id', $id)->update($updateData);

            $propietarioActualizado = DB::table('propietarios')->where('id', $id)->first();
            
            if ($propietarioActualizado->logo) {
                $propietarioActualizado->logo_url = url('storage/equipos/images/' . $propietarioActualizado->logo);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $propietarioActualizado,
                'message' => 'Propietario actualizado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar propietario: ' . $e->getMessage()
            ], 500);
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
            $propietario = DB::table('propietarios')->where('id', $id)->first();

            if (!$propietario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Propietario no encontrado'
                ], 404);
            }

            // Verificar si tiene equipos asociados
            $equiposCount = DB::table('equipos')->where('propietario_id', $id)->count();
            if ($equiposCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el propietario porque tiene ' . $equiposCount . ' equipos asociados'
                ], 409);
            }

            DB::beginTransaction();
            
            // Eliminar logo si existe
            if ($propietario->logo && file_exists(public_path('storage/equipos/images/' . $propietario->logo))) {
                unlink(public_path('storage/equipos/images/' . $propietario->logo));
            }
            
            DB::table('propietarios')->where('id', $id)->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Propietario eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar propietario: ' . $e->getMessage()
            ], 500);
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
