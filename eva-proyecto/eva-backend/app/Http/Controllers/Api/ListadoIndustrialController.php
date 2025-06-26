<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ListadoIndustrial;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * Controlador ListadoIndustrialController - API Empresarial
 * 
 * Controlador optimizado para la gestión de listado_industrials
 * con funcionalidades empresariales completas.
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class ListadoIndustrialController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/listadoindustrial",
     *     tags={"ListadoIndustrial"},
     *     summary="Listar listadoindustrials",
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
                'search' => 'nullable|string|max:255'
            ]);

            $query = ListadoIndustrial::query();

            if ($request->search) {
                $query->buscar($request->search);
            }

            $data = $query->activos()
                          ->orderBy('created_at', 'desc')
                          ->paginate($request->per_page ?? 15);

            return ResponseFormatter::success($data, 'Lista obtenida exitosamente');

        } catch (Exception $e) {
            Log::error('Error en ListadoIndustrialController::index', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener lista', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/listadoindustrial",
     *     tags={"ListadoIndustrial"},
     *     summary="Crear listadoindustrial",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=201, description="Creado exitosamente")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'descripcion' => 'nullable|string|max:1000',
                'activo' => 'nullable|boolean'
            ]);

            $data = $request->all();
            $data['usuario_id'] = auth()->id();

            $item = ListadoIndustrial::create($data);

            return ResponseFormatter::success($item, 'Creado exitosamente', 201);

        } catch (Exception $e) {
            Log::error('Error en ListadoIndustrialController::store', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al crear', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/listadoindustrial/{id}",
     *     tags={"ListadoIndustrial"},
     *     summary="Obtener listadoindustrial",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $item = ListadoIndustrial::findOrFail($id);
            return ResponseFormatter::success($item, 'Obtenido exitosamente');

        } catch (Exception $e) {
            Log::error('Error en ListadoIndustrialController::show', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'No encontrado', 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/listadoindustrial/{id}",
     *     tags={"ListadoIndustrial"},
     *     summary="Actualizar listadoindustrial",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Actualizado exitosamente")
     * )
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'descripcion' => 'nullable|string|max:1000',
                'activo' => 'nullable|boolean'
            ]);

            $item = ListadoIndustrial::findOrFail($id);
            $item->update($request->all());

            return ResponseFormatter::success($item, 'Actualizado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en ListadoIndustrialController::update', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al actualizar', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/listadoindustrial/{id}",
     *     tags={"ListadoIndustrial"},
     *     summary="Eliminar listadoindustrial",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $item = ListadoIndustrial::findOrFail($id);
            $item->delete();

            return ResponseFormatter::success(null, 'Eliminado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en ListadoIndustrialController::destroy', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al eliminar', 500);
        }
    }
}
