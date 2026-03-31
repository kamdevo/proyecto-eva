<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sede;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
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
            $query = Sede::query();

            if ($request->search) {
                $query->where('name', 'LIKE', "%{$request->search}%");
            }

            $sortBy    = $request->sort_by ?? 'id';
            $sortOrder = $request->sort_order ?? 'desc';

            $data = $query->orderBy($sortBy, $sortOrder)
                          ->paginate($request->per_page ?? 15);

            return response()->json([
                'success' => true,
                'data'    => $data,
                'message' => 'Lista obtenida exitosamente'
            ]);

        } catch (Exception $e) {
            Log::error('🔥 [SEDE] Index: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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

            // Obtener el siguiente ID manual si es necesario (el modelo tiene incrementing=false)
            $nextId = (Sede::max('id') ?? 0) + 1;

            $item = Sede::create([
                'id' => $nextId,
                'name' => $request->name
            ]);

            return response()->json([
                'success' => true,
                'data'    => $item,
                'message' => 'Sede creada exitosamente'
            ], 201);

        } catch (Exception $e) {
            Log::error('🔥 [SEDE] Store: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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

            return response()->json([
                'success' => true,
                'data'    => $item,
                'message' => 'Sede actualizada exitosamente'
            ]);

        } catch (Exception $e) {
            Log::error('🔥 [SEDE] Update: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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
            
            // Verificar dependencias
            $serviciosCount = DB::table('servicios')->where('sede_id', $id)->count();
            if ($serviciosCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar la sede porque tiene {$serviciosCount} servicios vinculados."
                ], 400);
            }

            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sede eliminada exitosamente'
            ]);

        } catch (Exception $e) {
            Log::error('🔥 [SEDE] Destroy: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
