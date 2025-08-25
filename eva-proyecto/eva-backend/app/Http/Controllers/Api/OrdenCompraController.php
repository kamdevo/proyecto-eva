<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdenCompra;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * Controlador OrdenCompraController - API Empresarial
 * 
 * Controlador optimizado para la gestión de orden_compras
 * con funcionalidades empresariales completas.
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class OrdenCompraController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/ordencompra",
     *     tags={"OrdenCompra"},
     *     summary="Listar ordencompras",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Lista obtenida exitosamente")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Sanitize and validate parameters manually for better error handling
            $page = max(1, (int)($request->get('page', 1)));
            $perPage = max(1, min(100, (int)($request->get('per_page', 15))));
            $search = $request->get('search', '');
            $status = $request->get('status', '');

            $query = OrdenCompra::query();

            // Apply search filter
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('orden', 'LIKE', "%{$search}%")
                      ->orWhere('secop_id', 'LIKE', "%{$search}%");
                });
            }

            // Apply status filter
            if (!empty($status)) {
                $query->where('status', $status);
            }

            // Order by most recent
            $query->orderBy('fecha', 'desc')
                  ->orderBy('id', 'desc');

            $data = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform the data to include computed fields
            $data->getCollection()->transform(function ($orden) {
                return [
                    'id' => $orden->id,
                    'orden' => $orden->orden,
                    'fecha' => $orden->fecha ? $orden->fecha : null,
                    'fecha_formatted' => $orden->fecha ? date('d/m/Y', strtotime($orden->fecha)) : 'Sin fecha',
                    'status' => $orden->status,
                    'status_text' => $this->getStatusText($orden->status),
                    'proveedor_id' => $orden->proveedor_id,
                    'proveedor_nombre' => 'Proveedor ' . $orden->proveedor_id,
                    'tipo_compra_id' => $orden->tipo_compra_id,
                    'tipo_compra_nombre' => 'Tipo ' . $orden->tipo_compra_id,
                    'secop_id' => $orden->secop_id,
                    'url_secop' => $orden->url_secop,
                    'file' => $orden->file,
                    'file_url' => $orden->file ? "/storage/ordenes_compra/{$orden->file}" : null,
                    'equipos_count' => 0,
                    'created_at' => null,
                    'updated_at' => null
                ];
            });

            return ResponseFormatter::success($data, 'Lista obtenida exitosamente');

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::index', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener lista', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/ordencompra",
     *     tags={"OrdenCompra"},
     *     summary="Crear ordencompra",
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

            $item = OrdenCompra::create($data);

            return ResponseFormatter::success($item, 'Creado exitosamente', 201);

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::store', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al crear', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/ordencompra/{id}",
     *     tags={"OrdenCompra"},
     *     summary="Obtener ordencompra",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $item = OrdenCompra::findOrFail($id);
            return ResponseFormatter::success($item, 'Obtenido exitosamente');

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::show', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'No encontrado', 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/ordencompra/{id}",
     *     tags={"OrdenCompra"},
     *     summary="Actualizar ordencompra",
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

            $item = OrdenCompra::findOrFail($id);
            $item->update($request->all());

            return ResponseFormatter::success($item, 'Actualizado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::update', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al actualizar', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/ordencompra/{id}",
     *     tags={"OrdenCompra"},
     *     summary="Eliminar ordencompra",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $item = OrdenCompra::findOrFail($id);
            $item->delete();

            return ResponseFormatter::success(null, 'Eliminado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::destroy', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al eliminar', 500);
        }
    }

    /**
     * Get status text for display
     */
    private function getStatusText($status)
    {
        $statusMap = [
            1 => 'Activa',
            2 => 'Aprobada',
            3 => 'En Proceso',
            4 => 'Completada',
            5 => 'Cancelada',
            0 => 'Inactiva'
        ];

        return $statusMap[$status] ?? 'Desconocido';
    }

    /**
     * Search purchase orders by term
     */
    public function search(Request $request, $term): JsonResponse
    {
        try {
            $query = OrdenCompra::with(['proveedor', 'tipoCompra'])
                ->where(function($q) use ($term) {
                    $q->where('orden', 'LIKE', "%{$term}%")
                      ->orWhere('secop_id', 'LIKE', "%{$term}%")
                      ->orWhereHas('proveedor', function($subQ) use ($term) {
                          $subQ->where('name', 'LIKE', "%{$term}%");
                      })
                      ->orWhereHas('tipoCompra', function($subQ) use ($term) {
                          $subQ->where('tipo_compra', 'LIKE', "%{$term}%");
                      });
                });

            $data = $query->orderBy('fecha', 'desc')->limit(20)->get();

            // Transform the data
            $data->transform(function ($orden) {
                return [
                    'id' => $orden->id,
                    'orden' => $orden->orden,
                    'fecha_formatted' => $orden->fecha ? $orden->fecha->format('d/m/Y') : 'Sin fecha',
                    'status_text' => $this->getStatusText($orden->status),
                    'proveedor_nombre' => $orden->proveedor ? $orden->proveedor->name : 'Sin proveedor',
                    'tipo_compra_nombre' => $orden->tipoCompra ? $orden->tipoCompra->tipo_compra : 'Sin tipo',
                    'secop_id' => $orden->secop_id,
                ];
            });

            return ResponseFormatter::success($data, 'Búsqueda completada exitosamente');

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::search', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error en la búsqueda', 500);
        }
    }

    /**
     * Get purchase orders statistics
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total' => OrdenCompra::count(),
                'activas' => OrdenCompra::where('status', 1)->count(),
                'aprobadas' => OrdenCompra::where('status', 2)->count(),
                'en_proceso' => OrdenCompra::where('status', 3)->count(),
                'completadas' => OrdenCompra::where('status', 4)->count(),
                'canceladas' => OrdenCompra::where('status', 5)->count(),
                'este_mes' => OrdenCompra::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'este_año' => OrdenCompra::whereYear('created_at', now()->year)->count(),
                'con_equipos' => OrdenCompra::has('equipos')->count(),
                'sin_equipos' => OrdenCompra::doesntHave('equipos')->count(),
            ];

            // Top providers
            $topProveedores = OrdenCompra::with('proveedor')
                ->select('proveedor_id', \DB::raw('count(*) as total'))
                ->groupBy('proveedor_id')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'proveedor' => $item->proveedor ? $item->proveedor->name : 'Sin proveedor',
                        'total_ordenes' => $item->total
                    ];
                });

            // Purchase types distribution
            $tiposCompra = OrdenCompra::with('tipoCompra')
                ->select('tipo_compra_id', \DB::raw('count(*) as total'))
                ->groupBy('tipo_compra_id')
                ->orderBy('total', 'desc')
                ->get()
                ->map(function($item) {
                    return [
                        'tipo' => $item->tipoCompra ? $item->tipoCompra->tipo_compra : 'Sin tipo',
                        'total_ordenes' => $item->total
                    ];
                });

            $stats['top_proveedores'] = $topProveedores;
            $stats['tipos_compra'] = $tiposCompra;

            return ResponseFormatter::success($stats, 'Estadísticas obtenidas exitosamente');

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::stats', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener estadísticas', 500);
        }
    }

    /**
     * Toggle purchase order status
     */
    public function toggle(Request $request, $id): JsonResponse
    {
        try {
            $orden = OrdenCompra::findOrFail($id);

            // Toggle between active (1) and inactive (0)
            $newStatus = $orden->status == 1 ? 0 : 1;
            $orden->update(['status' => $newStatus]);

            $message = $newStatus == 1 ? 'Orden activada exitosamente' : 'Orden desactivada exitosamente';

            return ResponseFormatter::success([
                'id' => $orden->id,
                'status' => $newStatus,
                'status_text' => $this->getStatusText($newStatus)
            ], $message);

        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::toggle', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al cambiar estado', 500);
        }
    }
}
