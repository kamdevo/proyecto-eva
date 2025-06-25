<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Area;
use App\Models\Servicio;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * Controlador para gestión completa de áreas
 * Maneja áreas hospitalarias, servicios y ubicaciones
 */
class AreaController extends ApiController
{
    /**
     * Obtener lista de áreas con filtros
     */
        /**
     * @OA\GET(
     *     path="/api/areas",
     *     tags={"Áreas"},
     *     summary="Listar áreas",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\GET(
     *     path="/api/areas",
     *     tags={"Áreas"},
     *     summary="Listar áreas",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Area::with(['servicio:id,name']);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%");
                });
            }

            if ($request->has('servicio_id')) {
                $query->where('servicio_id', $request->servicio_id);
            }

            // Note: 'activo' column doesn't exist in actual database
            // Remove this filter or add the column to database if needed

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'name');
            $orderDirection = $request->get('order_direction', 'asc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $areas = $query->paginate($perPage);

            // Agregar conteo de equipos por área
            $areas->getCollection()->transform(function ($area) {
                $area->total_equipos = Equipo::where('area_id', $area->id)->count();
                return $area;
            });

            return ResponseFormatter::success($areas, 'Áreas obtenidas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener áreas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nueva área
     */
        /**
     * @OA\POST(
     *     path="/api/areas",
     *     tags={"Áreas"},
     *     summary="Crear nueva área",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\POST(
     *     path="/api/areas",
     *     tags={"Áreas"},
     *     summary="Crear nueva área",
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
            'codigo' => 'nullable|string|max:50|unique:areas,codigo',
            'servicio_id' => 'nullable|exists:servicios,id',
            'tipo' => 'nullable|string|max:100',
            'ubicacion' => 'nullable|string|max:255',
            'responsable' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'extension' => 'nullable|string|max:10',
            'capacidad' => 'nullable|integer|min:1',
            'activo' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $areaData = $request->all();
            $areaData['activo'] = $areaData['activo'] ?? true;
            $areaData['created_at'] = now();

            $area = Area::create($areaData);

            // Cargar relaciones para la respuesta
            $area->load(['servicio:id,name']);

            return ResponseFormatter::success($area, 'Área creada exitosamente', 201);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al crear área: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar área específica
     */
        /**
     * @OA\GET(
     *     path="/api/areas/{id}",
     *     tags={"Áreas"},
     *     summary="Obtener área específica",
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
        /**
     * @OA\GET(
     *     path="/api/areas/{id}",
     *     tags={"Áreas"},
     *     summary="Obtener área específica",
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
            $area = Area::with([
                'servicio:id,name',
                'equipos:id,name,code,marca,modelo,estadoequipo_id',
                'equipos.estadoEquipo:id,name'
            ])->findOrFail($id);

            // Agregar estadísticas del área
            $area->estadisticas = [
                'total_equipos' => $area->equipos->count(),
                'equipos_activos' => $area->equipos->where('status', true)->count(),
                'equipos_por_estado' => $area->equipos->groupBy('estadoEquipo.name')->map->count(),
                'valor_total_equipos' => $area->equipos->sum('costo')
            ];

            return ResponseFormatter::success($area, 'Área obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener área: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar área
     */
        /**
     * @OA\PUT(
     *     path="/api/areas/{id}",
     *     tags={"Áreas"},
     *     summary="Actualizar área",
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
        /**
     * @OA\PUT(
     *     path="/api/areas/{id}",
     *     tags={"Áreas"},
     *     summary="Actualizar área",
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
            'codigo' => 'nullable|string|max:50|unique:areas,codigo,' . $id,
            'servicio_id' => 'nullable|exists:servicios,id',
            'tipo' => 'nullable|string|max:100',
            'ubicacion' => 'nullable|string|max:255',
            'responsable' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'extension' => 'nullable|string|max:10',
            'capacidad' => 'nullable|integer|min:1',
            'activo' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $area = Area::findOrFail($id);
            $area->update($request->all());

            // Cargar relaciones para la respuesta
            $area->load(['servicio:id,name']);

            return ResponseFormatter::success($area, 'Área actualizada exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al actualizar área: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar área
     */
        /**
     * @OA\DELETE(
     *     path="/api/areas/{id}",
     *     tags={"Áreas"},
     *     summary="Eliminar área",
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
        /**
     * @OA\DELETE(
     *     path="/api/areas/{id}",
     *     tags={"Áreas"},
     *     summary="Eliminar área",
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
            $area = Area::findOrFail($id);

            // Verificar si el área tiene equipos asignados
            $equiposAsignados = Equipo::where('area_id', $id)->where('status', true)->count();

            if ($equiposAsignados > 0) {
                return ResponseFormatter::error(
                    "No se puede eliminar el área porque tiene {$equiposAsignados} equipos asignados",
                    400
                );
            }

            $area->delete();

            return ResponseFormatter::success(null, 'Área eliminada exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar área: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener áreas por servicio
     */
    public function porServicio($servicioId)
    {
        try {
            $areas = Area::where('servicio_id', $servicioId)
                ->where('activo', true)
                ->orderBy('name')
                ->get();

            // Agregar conteo de equipos
            $areas->each(function ($area) {
                $area->total_equipos = Equipo::where('area_id', $area->id)
                    ->where('status', true)->count();
            });

            return ResponseFormatter::success($areas, 'Áreas del servicio obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener áreas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de áreas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_areas' => Area::where('activo', true)->count(),
                'areas_con_equipos' => Area::whereHas('equipos', function($query) {
                    $query->where('status', true);
                })->count(),
                'areas_sin_equipos' => Area::whereDoesntHave('equipos', function($query) {
                    $query->where('status', true);
                })->count(),
                'por_servicio' => Area::join('servicios', 'areas.servicio_id', '=', 'servicios.id')
                    ->where('areas.activo', true)
                    ->groupBy('servicios.id', 'servicios.name')
                    ->selectRaw('servicios.name as servicio, count(*) as total')
                    ->get(),
                'por_tipo' => Area::where('activo', true)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->get(),
                'capacidad_total' => Area::where('activo', true)->sum('capacidad'),
                'promedio_equipos_por_area' => round(
                    Equipo::where('status', true)->count() /
                    max(1, Area::where('activo', true)->count()),
                    2
                )
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de áreas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activar/Desactivar área
     */
    public function toggleStatus($id)
    {
        try {
            $area = Area::findOrFail($id);
            $area->update(['activo' => !$area->activo]);

            $status = $area->activo ? 'activada' : 'desactivada';
            return ResponseFormatter::success($area, "Área {$status} exitosamente");

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al cambiar estado del área: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener áreas activas para selects
     */
    public function getActivas()
    {
        try {
            $areas = Area::where('activo', true)
                ->orderBy('name')
                ->get(['id', 'name', 'codigo', 'servicio_id']);

            return ResponseFormatter::success($areas, 'Áreas activas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener áreas activas: ' . $e->getMessage(), 500);
        }
    }
}
