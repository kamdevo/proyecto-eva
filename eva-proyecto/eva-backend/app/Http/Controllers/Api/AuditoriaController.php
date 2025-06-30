<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditoriaLog;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * Controlador AuditoriaController - API Empresarial
 * 
 * Controlador optimizado para la gestión de auditorías del sistema
 * con funcionalidades empresariales completas de trazabilidad y control.
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class AuditoriaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/auditoria",
     *     tags={"Auditoria"},
     *     summary="Listar registros de auditoría",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Número de página",
     *         @OA\Schema(type="integer", minimum=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Registros por página",
     *         @OA\Schema(type="integer", minimum=1, maximum=100)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Término de búsqueda",
     *         @OA\Schema(type="string")
     *     ),
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
                'fecha_inicio' => 'nullable|date',
                'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
                'usuario_id' => 'nullable|integer|exists:usuarios,id',
                'accion' => 'nullable|string|max:100'
            ]);

            Log::info('Consultando registros de auditoría', [
                'user_id' => auth()->id(),
                'filters' => $request->only(['search', 'fecha_inicio', 'fecha_fin', 'usuario_id', 'accion'])
            ]);

            $query = AuditoriaLog::query()->with(['usuario']);

            // Filtros de búsqueda
            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('accion', 'LIKE', "%{$request->search}%")
                      ->orWhere('tabla', 'LIKE', "%{$request->search}%")
                      ->orWhere('descripcion', 'LIKE', "%{$request->search}%")
                      ->orWhere('ip_address', 'LIKE', "%{$request->search}%");
                });
            }

            // Filtro por fechas
            if ($request->fecha_inicio) {
                $query->whereDate('created_at', '>=', $request->fecha_inicio);
            }

            if ($request->fecha_fin) {
                $query->whereDate('created_at', '<=', $request->fecha_fin);
            }

            // Filtro por usuario
            if ($request->usuario_id) {
                $query->where('usuario_id', $request->usuario_id);
            }

            // Filtro por acción
            if ($request->accion) {
                $query->where('accion', $request->accion);
            }

            $data = $query->orderBy('created_at', 'desc')
                          ->paginate($request->per_page ?? 15);

            return ResponseFormatter::success($data, 'Lista de auditoría obtenida exitosamente');

        } catch (Exception $e) {
            Log::error('Error en AuditoriaController::index', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(null, 'Error al obtener registros de auditoría', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/auditoria",
     *     tags={"Auditoria"},
     *     summary="Crear registro de auditoría",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"accion", "tabla"},
     *             @OA\Property(property="accion", type="string", example="CREATE"),
     *             @OA\Property(property="tabla", type="string", example="equipos"),
     *             @OA\Property(property="registro_id", type="integer", example=1),
     *             @OA\Property(property="descripcion", type="string", example="Equipo creado"),
     *             @OA\Property(property="datos_anteriores", type="object"),
     *             @OA\Property(property="datos_nuevos", type="object")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Registro creado exitosamente")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'accion' => 'required|string|in:CREATE,UPDATE,DELETE,VIEW,LOGIN,LOGOUT',
                'tabla' => 'required|string|max:100',
                'registro_id' => 'nullable|integer',
                'descripcion' => 'required|string|max:500',
                'datos_anteriores' => 'nullable|array',
                'datos_nuevos' => 'nullable|array'
            ]);

            $data = $request->all();
            $data['usuario_id'] = auth()->id();
            $data['ip_address'] = $request->ip();
            $data['user_agent'] = $request->userAgent();

            $auditoria = AuditoriaLog::create($data);

            Log::info('Registro de auditoría creado', [
                'auditoria_id' => $auditoria->id,
                'accion' => $data['accion'],
                'tabla' => $data['tabla'],
                'user_id' => auth()->id()
            ]);

            return ResponseFormatter::success($auditoria, 'Registro de auditoría creado exitosamente', 201);

        } catch (Exception $e) {
            Log::error('Error en AuditoriaController::store', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(null, 'Error al crear registro de auditoría', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/auditoria/{id}",
     *     tags={"Auditoria"},
     *     summary="Obtener registro de auditoría específico",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Registro obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $auditoria = AuditoriaLog::with(['usuario'])->findOrFail($id);

            Log::info('Consultando registro de auditoría específico', [
                'auditoria_id' => $id,
                'user_id' => auth()->id()
            ]);

            return ResponseFormatter::success($auditoria, 'Registro de auditoría obtenido exitosamente');

        } catch (Exception $e) {
            Log::error('Error en AuditoriaController::show', [
                'error' => $e->getMessage(),
                'auditoria_id' => $id,
                'user_id' => auth()->id()
            ]);
            
            return ResponseFormatter::error(null, 'Registro de auditoría no encontrado', 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/auditoria/{id}",
     *     tags={"Auditoria"},
     *     summary="Actualizar registro de auditoría",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Registro actualizado exitosamente")
     * )
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'descripcion' => 'sometimes|required|string|max:500',
                'observaciones' => 'nullable|string|max:1000'
            ]);

            $auditoria = AuditoriaLog::findOrFail($id);
            $auditoria->update($request->only(['descripcion', 'observaciones']));

            Log::info('Registro de auditoría actualizado', [
                'auditoria_id' => $id,
                'user_id' => auth()->id(),
                'cambios' => $request->only(['descripcion', 'observaciones'])
            ]);

            return ResponseFormatter::success($auditoria, 'Registro de auditoría actualizado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en AuditoriaController::update', [
                'error' => $e->getMessage(),
                'auditoria_id' => $id,
                'user_id' => auth()->id()
            ]);
            
            return ResponseFormatter::error(null, 'Error al actualizar registro de auditoría', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/auditoria/{id}",
     *     tags={"Auditoria"},
     *     summary="Eliminar registro de auditoría",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Registro eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $auditoria = AuditoriaLog::findOrFail($id);
            
            // Crear registro de auditoría para la eliminación
            AuditoriaLog::create([
                'accion' => 'DELETE',
                'tabla' => 'auditoria_logs',
                'registro_id' => $id,
                'descripcion' => "Eliminación de registro de auditoría ID: $id",
                'datos_anteriores' => $auditoria->toArray(),
                'usuario_id' => auth()->id(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            $auditoria->delete();

            Log::warning('Registro de auditoría eliminado', [
                'auditoria_id' => $id,
                'user_id' => auth()->id()
            ]);

            return ResponseFormatter::success(null, 'Registro de auditoría eliminado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en AuditoriaController::destroy', [
                'error' => $e->getMessage(),
                'auditoria_id' => $id,
                'user_id' => auth()->id()
            ]);
            
            return ResponseFormatter::error(null, 'Error al eliminar registro de auditoría', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/auditoria/estadisticas",
     *     tags={"Auditoria"},
     *     summary="Obtener estadísticas de auditoría",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Estadísticas obtenidas exitosamente")
     * )
     */
    public function estadisticas(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'fecha_inicio' => 'nullable|date',
                'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio'
            ]);

            $query = AuditoriaLog::query();

            if ($request->fecha_inicio) {
                $query->whereDate('created_at', '>=', $request->fecha_inicio);
            }

            if ($request->fecha_fin) {
                $query->whereDate('created_at', '<=', $request->fecha_fin);
            }

            $estadisticas = [
                'total_registros' => $query->count(),
                'por_accion' => $query->selectRaw('accion, COUNT(*) as total')
                                    ->groupBy('accion')
                                    ->pluck('total', 'accion'),
                'por_tabla' => $query->selectRaw('tabla, COUNT(*) as total')
                                   ->groupBy('tabla')
                                   ->orderByDesc('total')
                                   ->limit(10)
                                   ->pluck('total', 'tabla'),
                'usuarios_activos' => $query->distinct('usuario_id')->count('usuario_id'),
                'registros_hoy' => AuditoriaLog::whereDate('created_at', today())->count(),
                'registros_semana' => AuditoriaLog::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count()
            ];

            Log::info('Estadísticas de auditoría consultadas', [
                'user_id' => auth()->id(),
                'periodo' => [
                    'inicio' => $request->fecha_inicio,
                    'fin' => $request->fecha_fin
                ]
            ]);

            return ResponseFormatter::success($estadisticas, 'Estadísticas de auditoría obtenidas exitosamente');

        } catch (Exception $e) {
            Log::error('Error en AuditoriaController::estadisticas', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return ResponseFormatter::error(null, 'Error al obtener estadísticas de auditoría', 500);
        }
    }
}
