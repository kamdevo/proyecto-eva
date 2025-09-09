<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SecopServiceSimple;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Controlador para la integración con SECOP
 * 
 * Maneja las consultas a la API de contratación pública colombiana
 */
class SecopController extends Controller
{
    protected $secopService;

    public function __construct(SecopServiceSimple $secopService)
    {
        $this->secopService = $secopService;
    }

    /**
     * @OA\Get(
     *     path="/api/secop/consultar",
     *     tags={"SECOP"},
     *     summary="Consultar procesos SECOP",
     *     @OA\Parameter(
     *         name="entidad",
     *         in="query",
     *         description="Nombre de la entidad",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="objeto",
     *         in="query",
     *         description="Objeto del contrato",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Búsqueda general",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Consulta exitosa")
     * )
     */
    public function consultar(Request $request): JsonResponse
    {
        try {
            // Validar parámetros de entrada
            $validator = Validator::make($request->all(), [
                'entidad' => 'nullable|string|max:255',
                'objeto' => 'nullable|string|max:500',
                'search' => 'nullable|string|max:255',
                'fecha_inicio' => 'nullable|date',
                'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
                'valor_minimo' => 'nullable|numeric|min:0',
                'limit' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error(
                    $validator->errors(),
                    'Parámetros de consulta inválidos',
                    400
                );
            }

            // Preparar filtros
            $filters = $request->only([
                'entidad', 'objeto', 'search', 'fecha_inicio', 
                'fecha_fin', 'valor_minimo', 'limit'
            ]);

            // Realizar consulta
            $resultado = $this->secopService->consultarProcesos($filters);

            if (!$resultado['success']) {
                return ResponseFormatter::error(
                    $resultado['error'] ?? 'Error al consultar SECOP',
                    500
                );
            }

            Log::info('SECOP: Consulta realizada exitosamente', [
                'filtros' => $filters,
                'resultados' => count($resultado['data'])
            ]);

            return ResponseFormatter::success(
                $resultado['data'],
                'Consulta SECOP realizada exitosamente',
                200,
                [
                    'total' => $resultado['total'],
                    'filtros_aplicados' => array_filter($filters)
                ]
            );

        } catch (\Exception $e) {
            Log::error('SECOP: Error en consulta', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return ResponseFormatter::error(
                'Error interno del servidor al consultar SECOP',
                500
            );
        }
    }

    /**
     * @OA\Get(
     *     path="/api/secop/proceso/{uid}",
     *     tags={"SECOP"},
     *     summary="Obtener proceso específico por UID",
     *     @OA\Parameter(
     *         name="uid",
     *         in="path",
     *         description="UID del proceso SECOP",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Proceso encontrado")
     * )
     */
    public function obtenerProceso(string $uid): JsonResponse
    {
        try {
            // Validar UID
            if (empty($uid) || strlen($uid) < 10) {
                return ResponseFormatter::error(
                    null,
                    'UID de proceso inválido',
                    400
                );
            }

            $resultado = $this->secopService->obtenerProcesoPorUid($uid);

            if (!$resultado['success']) {
                return ResponseFormatter::error(
                    $resultado['error'] ?? 'Proceso no encontrado',
                    404
                );
            }

            return ResponseFormatter::success(
                $resultado['data'],
                'Proceso SECOP obtenido exitosamente'
            );

        } catch (\Exception $e) {
            Log::error('SECOP: Error obteniendo proceso', [
                'uid' => $uid,
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error(
                'Error al obtener proceso SECOP',
                500
            );
        }
    }

    /**
     * @OA\Get(
     *     path="/api/secop/buscar",
     *     tags={"SECOP"},
     *     summary="Buscar procesos SECOP por término",
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         description="Término de búsqueda",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Límite de resultados",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=100)
     *     ),
     *     @OA\Response(response=200, description="Búsqueda exitosa")
     * )
     */
    public function buscar(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'q' => 'nullable|string|min:3|max:255',
                'search' => 'nullable|string|min:3|max:255',
                'limit' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error(
                    $validator->errors(),
                    'Parámetros de búsqueda inválidos',
                    400
                );
            }

            // Aceptar tanto 'q' como 'search' para flexibilidad
            $searchTerm = $request->input('q') ?: $request->input('search');
            $limit = $request->input('limit', 50);

            if (empty($searchTerm)) {
                return ResponseFormatter::error(
                    'Término de búsqueda requerido (q o search)',
                    'Parámetro de búsqueda faltante',
                    400
                );
            }

            $filters = [
                'search' => $searchTerm,
                'limit' => $limit
            ];

            $resultado = $this->secopService->buscarProcesos($filters);

            if (!$resultado['success']) {
                return ResponseFormatter::error(
                    $resultado['error'] ?? 'Error al realizar búsqueda en SECOP',
                    500
                );
            }

            return ResponseFormatter::success(
                $resultado['data'],
                'Búsqueda SECOP realizada exitosamente',
                200,
                [
                    'termino_busqueda' => $searchTerm,
                    'total_resultados' => count($resultado['data'])
                ]
            );

        } catch (\Exception $e) {
            Log::error('SECOP: Error en búsqueda', [
                'termino' => $request->input('q'),
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error(
                'Error al realizar búsqueda en SECOP',
                500
            );
        }
    }

    /**
     * @OA\Get(
     *     path="/api/secop/estadisticas",
     *     tags={"SECOP"},
     *     summary="Obtener estadísticas de SECOP",
     *     @OA\Response(response=200, description="Estadísticas obtenidas")
     * )
     */
    public function estadisticas(): JsonResponse
    {
        try {
            $estadisticas = $this->secopService->obtenerEstadisticas();

            return ResponseFormatter::success(
                $estadisticas,
                'Estadísticas SECOP obtenidas exitosamente'
            );

        } catch (\Exception $e) {
            Log::error('SECOP: Error obteniendo estadísticas', [
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error(
                'Error al obtener estadísticas SECOP',
                500
            );
        }
    }

    /**
     * @OA\Post(
     *     path="/api/secop/limpiar-cache",
     *     tags={"SECOP"},
     *     summary="Limpiar caché de SECOP",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Caché limpiado")
     * )
     */
    public function limpiarCache(): JsonResponse
    {
        try {
            $resultado = $this->secopService->limpiarCache();

            if ($resultado) {
                return ResponseFormatter::success(
                    null,
                    'Caché de SECOP limpiado exitosamente'
                );
            } else {
                return ResponseFormatter::error(
                    'Error al limpiar caché de SECOP',
                    500
                );
            }

        } catch (\Exception $e) {
            Log::error('SECOP: Error limpiando caché', [
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error(
                'Error interno al limpiar caché',
                500
            );
        }
    }
}
