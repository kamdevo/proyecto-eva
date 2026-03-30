<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Repuesto;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * Controlador RepuestoController - API Empresarial
 * 
 * Controlador optimizado para la gestión de Repuesto
 * con funcionalidades empresariales completas.
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class RepuestoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/repuestos-inventory",
     *     tags={"Repuesto"},
     *     summary="Listar repuestos del inventario",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Lista obtenida exitosamente")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:5000',
                'search' => 'nullable|string|max:255',
                'grupo' => 'nullable|string|max:10',
                'sort_by' => 'nullable|string|max:50',
                'sort_order' => 'nullable|string|in:asc,desc'
            ]);

            $query = Repuesto::query();

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'LIKE', "%{$request->search}%")
                      ->orWhere('code', 'LIKE', "%{$request->search}%")
                      ->orWhere('grupo', 'LIKE', "%{$request->search}%");
                });
            }

            if ($request->grupo && $request->grupo !== 'all') {
                $query->where('grupo', $request->grupo);
            }

            // Ordenamiento dinámico
            $allowedSortFields = ['id', 'name', 'code', 'cantidad', 'precio', 'grupo'];
            $sortBy = in_array($request->sort_by, $allowedSortFields) ? $request->sort_by : 'name';
            $sortOrder = $request->sort_order === 'desc' ? 'desc' : 'asc';

            $data = $query->orderBy($sortBy, $sortOrder)
                          ->paginate($request->per_page ?? 500);

            return ResponseFormatter::paginated($data, 'Lista de inventario obtenida exitosamente');

        } catch (\Throwable $e) {
            Log::error('Error en RepuestoController::index', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener lista: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/repuestos-inventory",
     *     tags={"Repuesto"},
     *     summary="Crear repuesto en el inventario",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=201, description="Creado exitosamente")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'cantidad' => 'nullable|integer|min:0',
                'code' => 'required|string|max:100|unique:repuestos,code',
                'precio' => 'nullable|numeric|min:0',
                'grupo' => 'nullable|string|max:10',
                'status' => 'nullable|integer'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors()->toArray());
            }

            $item = Repuesto::create($request->except(['id']));

            return ResponseFormatter::created($item, 'Repuesto creado exitosamente');

        } catch (\Throwable $e) {
            Log::error('Error en RepuestoController::store', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al crear repuesto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/repuestos-inventory/{id}",
     *     tags={"Repuesto"},
     *     summary="Obtener repuesto del inventario",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $item = Repuesto::findOrFail($id);
            return ResponseFormatter::success($item);

        } catch (\Throwable $e) {
            Log::error('Error en RepuestoController::show', ['error' => $e->getMessage()]);
            return ResponseFormatter::notFound();
        }
    }

    /**
     * @OA\Put(
     *     path="/api/repuestos-inventory/{id}",
     *     tags={"Repuesto"},
     *     summary="Actualizar repuesto del inventario",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Actualizado exitosamente")
     * )
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $item = Repuesto::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'cantidad' => 'nullable|integer|min:0',
                'code' => 'sometimes|string|max:100|unique:repuestos,code,' . $id,
                'precio' => 'nullable|numeric|min:0',
                'grupo' => 'nullable|string|max:10',
                'status' => 'nullable|integer'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors()->toArray());
            }

            $item->update($request->except(['id']));

            return ResponseFormatter::success($item, 'Actualizado exitosamente');

        } catch (\Throwable $e) {
            Log::error('Error en RepuestoController::update', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al actualizar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/repuesto/{id}",
     *     tags={"Repuesto"},
     *     summary="Eliminar repuesto",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $item = Repuesto::findOrFail($id);
            $item->delete();

            return ResponseFormatter::success(null, 'Eliminado exitosamente');

        } catch (\Throwable $e) {
            Log::error('Error en RepuestoController::destroy', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al eliminar: ' . $e->getMessage(), 500);
        }
    }
}
