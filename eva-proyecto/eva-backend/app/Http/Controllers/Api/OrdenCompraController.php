<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdenCompra;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Equipo;
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
                'orden' => 'required|string|max:255',
                'fecha' => 'required|date',
                'tipo_compra_id' => 'required|integer|exists:tipos_compra,id',
                'proveedor_id' => 'nullable|integer|exists:proveedores_mantenimiento,id',
                'monto' => 'nullable|numeric|min:0',
                'descripcion' => 'nullable|string|max:1000',
                'secop_id' => 'nullable|string|max:255',
                'url_secop' => 'nullable|url|max:500',
                'status' => 'nullable|integer|in:0,1',
                'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240' // 10MB max
            ]);

            $data = $request->only([
                'orden', 'fecha', 'tipo_compra_id', 'proveedor_id',
                'monto', 'descripcion', 'secop_id', 'url_secop', 'status'
            ]);

            // Manejar subida de archivo
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('ordenes_compra', $fileName, 'public');
                $data['file'] = $filePath;
            }

            // Establecer valores por defecto
            $data['status'] = $data['status'] ?? 1;

            $item = OrdenCompra::create($data);

            // Cargar relaciones para la respuesta
            $item->load(['proveedor', 'tipoCompra']);

            Log::info('Orden de compra creada exitosamente', [
                'id' => $item->id,
                'orden' => $item->orden,
                'secop_id' => $item->secop_id
            ]);

            return ResponseFormatter::success($item, 'Orden de compra creada exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return ResponseFormatter::error(
                $e->errors(),
                'Datos de validación incorrectos',
                422
            );
        } catch (Exception $e) {
            Log::error('Error en OrdenCompraController::store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ResponseFormatter::error(null, 'Error al crear orden de compra', 500);
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

    /**
     * @OA\Post(
     *     path="/api/ordencompra/{id}/equipos",
     *     tags={"OrdenCompra"},
     *     summary="Asociar equipos a orden de compra",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la orden de compra",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="equipo_ids", type="array", @OA\Items(type="integer"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Equipos asociados exitosamente")
     * )
     */
    public function associateEquipment(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'equipo_ids' => 'required|array',
                'equipo_ids.*' => 'integer|exists:equipos,id'
            ]);

            $orden = OrdenCompra::findOrFail($id);
            $equipoIds = $request->input('equipo_ids');

            // Actualizar equipos para asociarlos con esta orden de compra
            $equiposActualizados = Equipo::whereIn('id', $equipoIds)
                ->update(['orden_compra_id' => $orden->id]);

            Log::info('Equipos asociados a orden de compra', [
                'orden_id' => $orden->id,
                'equipos_count' => $equiposActualizados,
                'equipo_ids' => $equipoIds
            ]);

            return ResponseFormatter::success([
                'orden_id' => $orden->id,
                'equipos_asociados' => $equiposActualizados,
                'equipo_ids' => $equipoIds
            ], 'Equipos asociados exitosamente');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return ResponseFormatter::error(
                $e->errors(),
                'Datos de validación incorrectos',
                422
            );
        } catch (Exception $e) {
            Log::error('Error asociando equipos a orden de compra', [
                'orden_id' => $id,
                'error' => $e->getMessage()
            ]);
            return ResponseFormatter::error(null, 'Error al asociar equipos', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/ordencompra/{id}/equipos",
     *     tags={"OrdenCompra"},
     *     summary="Obtener equipos asociados a orden de compra",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la orden de compra",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Equipos obtenidos exitosamente")
     * )
     */
    public function getAssociatedEquipment($id): JsonResponse
    {
        try {
            $orden = OrdenCompra::findOrFail($id);

            $equipos = $orden->equipos()
                ->with(['servicio', 'area', 'estado'])
                ->select([
                    'id', 'nombre', 'modelo', 'serie', 'codigo',
                    'servicio_id', 'area_id', 'estado_id', 'activo'
                ])
                ->get();

            return ResponseFormatter::success([
                'orden' => [
                    'id' => $orden->id,
                    'orden' => $orden->orden,
                    'fecha' => $orden->fecha
                ],
                'equipos' => $equipos,
                'total_equipos' => $equipos->count()
            ], 'Equipos asociados obtenidos exitosamente');

        } catch (Exception $e) {
            Log::error('Error obteniendo equipos asociados', [
                'orden_id' => $id,
                'error' => $e->getMessage()
            ]);
            return ResponseFormatter::error(null, 'Error al obtener equipos asociados', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/ordencompra/{id}/equipos/{equipoId}",
     *     tags={"OrdenCompra"},
     *     summary="Desasociar equipo de orden de compra",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la orden de compra",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="equipoId",
     *         in="path",
     *         description="ID del equipo",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Equipo desasociado exitosamente")
     * )
     */
    public function dissociateEquipment($id, $equipoId): JsonResponse
    {
        try {
            $orden = OrdenCompra::findOrFail($id);
            $equipo = Equipo::findOrFail($equipoId);

            // Verificar que el equipo esté asociado a esta orden
            if ($equipo->orden_compra_id != $orden->id) {
                return ResponseFormatter::error(
                    null,
                    'El equipo no está asociado a esta orden de compra',
                    400
                );
            }

            // Desasociar equipo
            $equipo->update(['orden_compra_id' => null]);

            Log::info('Equipo desasociado de orden de compra', [
                'orden_id' => $orden->id,
                'equipo_id' => $equipo->id
            ]);

            return ResponseFormatter::success([
                'orden_id' => $orden->id,
                'equipo_id' => $equipo->id
            ], 'Equipo desasociado exitosamente');

        } catch (Exception $e) {
            Log::error('Error desasociando equipo', [
                'orden_id' => $id,
                'equipo_id' => $equipoId,
                'error' => $e->getMessage()
            ]);
            return ResponseFormatter::error(null, 'Error al desasociar equipo', 500);
        }
    }
}
