<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoCompra;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * Controlador TipoCompraController - API Empresarial
 * 
 * Controlador optimizado para la gestión de tipo_compras
 * con funcionalidades empresariales completas.
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class TipoCompraController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/tipocompra",
     *     tags={"TipoCompra"},
     *     summary="Listar tipocompras",
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

            $query = TipoCompra::query();

            if ($request->search) {
                $query->where('tipo_compra', 'LIKE', "%{$request->search}%");
            }

            $data = $query->where('status', 1)
                          ->orderBy('id', 'desc')
                          ->paginate($request->per_page ?? 15);

            return ResponseFormatter::success($data, 'Lista obtenida exitosamente');

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::index', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener lista', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/tipocompra",
     *     tags={"TipoCompra"},
     *     summary="Crear tipocompra",
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

            $item = TipoCompra::create($data);

            return ResponseFormatter::success($item, 'Creado exitosamente', 201);

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::store', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al crear', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/tipocompra/{id}",
     *     tags={"TipoCompra"},
     *     summary="Obtener tipocompra",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $item = TipoCompra::findOrFail($id);
            return ResponseFormatter::success($item, 'Obtenido exitosamente');

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::show', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'No encontrado', 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/tipocompra/{id}",
     *     tags={"TipoCompra"},
     *     summary="Actualizar tipocompra",
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

            $item = TipoCompra::findOrFail($id);
            $item->update($request->all());

            return ResponseFormatter::success($item, 'Actualizado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::update', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al actualizar', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/tipocompra/{id}",
     *     tags={"TipoCompra"},
     *     summary="Eliminar tipocompra",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $item = TipoCompra::findOrFail($id);
            $item->delete();

            return ResponseFormatter::success(null, 'Eliminado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::destroy', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al eliminar', 500);
        }
    }

    /**
     * Search purchase types by term
     */
    public function search(Request $request, $term): JsonResponse
    {
        try {
            $query = TipoCompra::where('tipo_compra', 'LIKE', "%{$term}%");
            $data = $query->where('status', 1)->orderBy('tipo_compra', 'asc')->limit(20)->get();

            return ResponseFormatter::success($data, 'Búsqueda completada exitosamente');

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::search', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error en la búsqueda', 500);
        }
    }

    /**
     * Get purchase types statistics
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total' => TipoCompra::count(),
                'activos' => TipoCompra::where('status', 1)->count(),
                'inactivos' => TipoCompra::where('status', 0)->count(),
                'con_ordenes' => TipoCompra::has('ordenesCompra')->count(),
                'sin_ordenes' => TipoCompra::doesntHave('ordenesCompra')->count(),
            ];

            // Most used purchase types
            $masUsados = TipoCompra::withCount('ordenesCompra')
                ->orderBy('ordenes_compra_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function($tipo) {
                    return [
                        'id' => $tipo->id,
                        'tipo_compra' => $tipo->tipo_compra,
                        'total_ordenes' => $tipo->ordenes_compra_count
                    ];
                });

            $stats['mas_usados'] = $masUsados;

            return ResponseFormatter::success($stats, 'Estadísticas obtenidas exitosamente');

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::stats', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener estadísticas', 500);
        }
    }

    /**
     * Toggle purchase type status
     */
    public function toggle(Request $request, $id): JsonResponse
    {
        try {
            $tipo = TipoCompra::findOrFail($id);

            // Toggle between active (1) and inactive (0)
            $newStatus = $tipo->status == 1 ? 0 : 1;
            $tipo->update(['status' => $newStatus]);

            $message = $newStatus == 1 ? 'Tipo de compra activado exitosamente' : 'Tipo de compra desactivado exitosamente';

            return ResponseFormatter::success([
                'id' => $tipo->id,
                'status' => $newStatus,
                'status_text' => $newStatus == 1 ? 'Activo' : 'Inactivo'
            ], $message);

        } catch (Exception $e) {
            Log::error('Error en TipoCompraController::toggle', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al cambiar estado', 500);
        }
    }
}
