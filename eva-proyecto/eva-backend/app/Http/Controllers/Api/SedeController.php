<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sede;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * Controlador SedeController - API Empresarial
 * 
 * Controlador optimizado para la gestión de Sede
 * con funcionalidades empresariales completas.
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class SedeController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/sede",
     *     tags={"Sede"},
     *     summary="Listar sedes",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Lista obtenida exitosamente")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'search' => 'nullable|string|max:255',
                'sort_by' => 'nullable|string|in:id,name',
                'sort_order' => 'nullable|string|in:asc,desc'
            ]);

            $query = Sede::query();

            if ($request->search) {
                $query->where('name', 'LIKE', "%{$request->search}%");
            }

            $sortBy = $request->sort_by ?? 'id';
            $sortOrder = $request->sort_order ?? 'desc';

            $data = $query->orderBy($sortBy, $sortOrder)
                          ->paginate($request->per_page ?? 10);

            return ResponseFormatter::success($data, 'Lista obtenida exitosamente');

        } catch (Exception $e) {
            Log::error('Error en SedeController::index', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener lista', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/sede",
     *     tags={"Sede"},
     *     summary="Crear sede",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=201, description="Creado exitosamente")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255'
            ]);

            $nextId = (Sede::max('id') ?? 0) + 1;

            $item = Sede::create([
                'id' => $nextId,
                'name' => $request->name
            ]);

            return ResponseFormatter::success($item, 'Creado exitosamente', 201);

        } catch (Exception $e) {
            Log::error('Error en SedeController::store', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al crear', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/sede/{id}",
     *     tags={"Sede"},
     *     summary="Obtener sede",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $item = Sede::findOrFail($id);
            return ResponseFormatter::success($item, 'Obtenido exitosamente');

        } catch (Exception $e) {
            Log::error('Error en SedeController::show', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'No encontrado', 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/sede/{id}",
     *     tags={"Sede"},
     *     summary="Actualizar sede",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Actualizado exitosamente")
     * )
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255'
            ]);

            $item = Sede::findOrFail($id);
            $item->update([
                'name' => $request->name
            ]);

            return ResponseFormatter::success($item, 'Actualizado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en SedeController::update', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al actualizar', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/sede/{id}",
     *     tags={"Sede"},
     *     summary="Eliminar sede",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $item = Sede::findOrFail($id);
            $item->delete();

            return ResponseFormatter::success(null, 'Eliminado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en SedeController::destroy', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al eliminar', 500);
        }
    }
}
