<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Servicio;
use App\Models\Area;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * Controlador para gestión completa de servicios
 * Maneja servicios hospitalarios, departamentos y unidades
 */
class ServicioController extends ApiController
{
    /**
     * Obtener lista de servicios con filtros
     */
        /**
     * @OA\GET(
     *     path="/api/servicios",
     *     tags={"Servicios"},
     *     summary="Listar servicios",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Servicio::query();

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%");
                });
            }

            if ($request->has('activo')) {
                $query->where('activo', $request->activo);
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'name');
            $orderDirection = $request->get('order_direction', 'asc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $servicios = $query->paginate($perPage);

            // Agregar estadísticas por servicio
            $servicios->getCollection()->transform(function ($servicio) {
                $servicio->total_areas = Area::where('servicio_id', $servicio->id)
                    ->where('activo', true)->count();
                $servicio->total_equipos = Equipo::where('servicio_id', $servicio->id)
                    ->where('status', true)->count();
                $servicio->total_usuarios = Usuario::where('servicio_id', $servicio->id)
                    ->where('estado', 1)->count();
                return $servicio;
            });

            return ResponseFormatter::success($servicios, 'Servicios obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener servicios: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo servicio
     */
        /**
     * @OA\POST(
     *     path="/api/servicios",
     *     tags={"Servicios"},
     *     summary="Crear nuevo servicio",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'codigo' => 'nullable|string|max:50|unique:servicios,codigo',
            'tipo' => 'nullable|string|max:100',
            'responsable' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'extension' => 'nullable|string|max:10',
            'email' => 'nullable|email|max:255',
            'ubicacion' => 'nullable|string|max:255',
            'horario_atencion' => 'nullable|string|max:255',
            'activo' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $servicioData = $request->all();
            $servicioData['activo'] = $servicioData['activo'] ?? true;
            $servicioData['created_at'] = now();

            $servicio = Servicio::create($servicioData);

            return ResponseFormatter::success($servicio, 'Servicio creado exitosamente', 201);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al crear servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar servicio específico
     */
        /**
     * @OA\GET(
     *     path="/api/servicios/{id}",
     *     tags={"Servicios"},
     *     summary="Obtener servicio específico",
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
            $servicio = Servicio::with([
                'areas:id,name,servicio_id,activo',
                'equipos:id,name,code,servicio_id,area_id,estadoequipo_id',
                'equipos.estadoEquipo:id,name',
                'usuarios:id,nombre,apellido,servicio_id,estado'
            ])->findOrFail($id);

            // Agregar estadísticas detalladas
            $servicio->estadisticas = [
                'total_areas' => $servicio->areas->where('activo', true)->count(),
                'total_equipos' => $servicio->equipos->where('status', true)->count(),
                'total_usuarios' => $servicio->usuarios->where('estado', 1)->count(),
                'equipos_por_estado' => $servicio->equipos->groupBy('estadoEquipo.name')->map->count(),
                'valor_total_equipos' => $servicio->equipos->sum('costo'),
                'areas_activas' => $servicio->areas->where('activo', true)->pluck('name'),
                'equipos_criticos' => $servicio->equipos->filter(function($equipo) {
                    return $equipo->clasificacionRiesgo &&
                           in_array($equipo->clasificacionRiesgo->name, ['ALTO', 'MEDIO ALTO']);
                })->count()
            ];

            return ResponseFormatter::success($servicio, 'Servicio obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar servicio
     */
        /**
     * @OA\PUT(
     *     path="/api/servicios/{id}",
     *     tags={"Servicios"},
     *     summary="Actualizar servicio",
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
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'codigo' => 'nullable|string|max:50|unique:servicios,codigo,' . $id,
            'tipo' => 'nullable|string|max:100',
            'responsable' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'extension' => 'nullable|string|max:10',
            'email' => 'nullable|email|max:255',
            'ubicacion' => 'nullable|string|max:255',
            'horario_atencion' => 'nullable|string|max:255',
            'activo' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $servicio = Servicio::findOrFail($id);
            $servicio->update($request->all());

            return ResponseFormatter::success($servicio, 'Servicio actualizado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al actualizar servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar servicio
     */
        /**
     * @OA\DELETE(
     *     path="/api/servicios/{id}",
     *     tags={"Servicios"},
     *     summary="Eliminar servicio",
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
            $servicio = Servicio::findOrFail($id);

            // Verificar si el servicio tiene áreas asignadas
            $areasAsignadas = Area::where('servicio_id', $id)->where('activo', true)->count();
            if ($areasAsignadas > 0) {
                return ResponseFormatter::error(
                    "No se puede eliminar el servicio porque tiene {$areasAsignadas} áreas asignadas",
                    400
                );
            }

            // Verificar si el servicio tiene equipos asignados
            $equiposAsignados = Equipo::where('servicio_id', $id)->where('status', true)->count();
            if ($equiposAsignados > 0) {
                return ResponseFormatter::error(
                    "No se puede eliminar el servicio porque tiene {$equiposAsignados} equipos asignados",
                    400
                );
            }

            // Verificar si el servicio tiene usuarios asignados
            $usuariosAsignados = Usuario::where('servicio_id', $id)->where('estado', 1)->count();
            if ($usuariosAsignados > 0) {
                return ResponseFormatter::error(
                    "No se puede eliminar el servicio porque tiene {$usuariosAsignados} usuarios asignados",
                    400
                );
            }

            $servicio->delete();

            return ResponseFormatter::success(null, 'Servicio eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de servicios
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_servicios' => Servicio::where('activo', true)->count(),
                'servicios_con_equipos' => Servicio::whereHas('equipos', function($query) {
                    $query->where('status', true);
                })->count(),
                'servicios_sin_equipos' => Servicio::whereDoesntHave('equipos', function($query) {
                    $query->where('status', true);
                })->count(),
                'por_tipo' => Servicio::where('activo', true)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->get(),
                'promedio_equipos_por_servicio' => round(
                    Equipo::where('status', true)->count() /
                    max(1, Servicio::where('activo', true)->count()),
                    2
                ),
                'promedio_areas_por_servicio' => round(
                    Area::where('activo', true)->count() /
                    max(1, Servicio::where('activo', true)->count()),
                    2
                ),
                'servicios_mas_equipos' => Servicio::withCount(['equipos' => function($query) {
                    $query->where('status', true);
                }])
                ->where('activo', true)
                ->orderBy('equipos_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'equipos_count'])
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de servicios obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activar/Desactivar servicio
     */
    public function toggleStatus($id)
    {
        try {
            $servicio = Servicio::findOrFail($id);
            $servicio->update(['activo' => !$servicio->activo]);

            $status = $servicio->activo ? 'activado' : 'desactivado';
            return ResponseFormatter::success($servicio, "Servicio {$status} exitosamente");

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al cambiar estado del servicio: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener servicios activos para selects
     */
    public function getActivos()
    {
        try {
            $servicios = Servicio::where('activo', true)
                ->orderBy('name')
                ->get(['id', 'name', 'codigo', 'tipo']);

            return ResponseFormatter::success($servicios, 'Servicios activos obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener servicios activos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener jerarquía servicio-área
     */
    public function getJerarquia()
    {
        try {
            $servicios = Servicio::with(['areas' => function($query) {
                $query->where('activo', true)->orderBy('name');
            }])
            ->where('activo', true)
            ->orderBy('name')
            ->get(['id', 'name', 'codigo']);

            return ResponseFormatter::success($servicios, 'Jerarquía servicio-área obtenida');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener jerarquía: ' . $e->getMessage(), 500);
        }
    }
}
