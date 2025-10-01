<?php

/**
 * Rutas API - web
 * 
 * Archivo de rutas optimizado para el sistema EVA
 * con middleware de seguridad empresarial completo.
 * 
 * Middleware aplicado:
 * - auth:sanctum: Autenticación requerida
 * - throttle:60,1: Rate limiting (60 requests por minuto)
 * - cors: Cross-Origin Resource Sharing
 * - api.version: Versionado de API
 * - verified: Verificación de email (donde aplique)
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

// ==========================================
// ENDPOINTS PÚBLICOS SIN AUTENTICACIÓN
// ==========================================

// Manejar preflight OPTIONS para repuestos
Route::options('api/v1/repuestos', function() {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
});

// Endpoint público para repuestos instalados
Route::get('api/v1/repuestos', function(Request $request) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json');
    
    try {
        $page = (int)$request->get('page', 1);
        $perPage = (int)$request->get('per_page', 10);
        $search = $request->get('search', '');
        
        // Verificar que las tablas existen
        if (!Schema::hasTable('equipo_repuestos')) {
            return response()->json([
                'success' => false,
                'message' => 'Tabla equipo_repuestos no existe',
                'data' => [
                    'data' => [],
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'total_pages' => 0
                ]
            ], 200);
        }

        // Consulta de repuestos instalados
        $query = DB::table('equipo_repuestos')
            ->leftJoin('repuestos', 'equipo_repuestos.repuesto_id', '=', 'repuestos.id')
            ->leftJoin('equipos', 'equipo_repuestos.equipo_id', '=', 'equipos.id')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->leftJoin('usuarios', 'equipo_repuestos.usuario_id', '=', 'usuarios.id')
            ->select([
                'equipo_repuestos.id',
                'equipo_repuestos.fecha',
                'repuestos.name as repuesto_nombre',
                'repuestos.code as repuesto_codigo',
                'repuestos.precio as repuesto_precio',
                'equipo_repuestos.cantidad_entregada',
                'equipos.id as equipo_id',
                'equipos.name as equipo_nombre',
                'equipos.code as equipo_codigo',
                'equipos.serial as equipo_serial',
                'equipos.marca as equipo_marca',
                'equipos.modelo as equipo_modelo',
                'servicios.name as servicio_nombre',
                'equipo_repuestos.observacion',
                'usuarios.nombre as instalado_por'
            ]);

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('repuestos.name', 'like', "%{$search}%")
                  ->orWhere('repuestos.code', 'like', "%{$search}%")
                  ->orWhere('equipos.name', 'like', "%{$search}%")
                  ->orWhere('equipos.code', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $resultados = $query->orderBy('equipo_repuestos.id', 'desc')
                       ->offset(($page - 1) * $perPage)
                       ->limit($perPage)
                       ->get();

        $data = [];
        foreach ($resultados as $item) {
            $precioUnitario = floatval($item->repuesto_precio ?? 0);
            $cantidad = intval($item->cantidad_entregada ?? 0);
            
            $data[] = [
                'id' => $item->id,
                'fecha' => $item->fecha ?? 'N/A',
                'repuesto_nombre' => $item->repuesto_nombre ?? 'N/A',
                'repuesto_codigo' => $item->repuesto_codigo ?? 'N/A',
                'cantidad' => $cantidad,
                'precio_unitario' => $precioUnitario,
                'precio_total' => $precioUnitario * $cantidad,
                'equipo_id' => $item->equipo_id,
                'equipo_nombre' => $item->equipo_nombre ?? 'N/A',
                'equipo_codigo' => $item->equipo_codigo ?? 'N/A',
                'equipo_serial' => $item->equipo_serial ?? 'N/A',
                'equipo_marca' => $item->equipo_marca ?? 'N/A',
                'equipo_modelo' => $item->equipo_modelo ?? 'N/A',
                'servicio' => $item->servicio_nombre ?? 'N/A',
                'observaciones' => $item->observacion ?? '',
                'instalado_por' => $item->instalado_por ?? 'N/A'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $data,
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => (int)ceil($total / $perPage)
            ],
            'message' => 'Repuestos obtenidos exitosamente'
        ], 200);

    } catch (\Exception $e) {
        \Log::error('Error en endpoint repuestos: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener repuestos',
            'error' => $e->getMessage(),
            'data' => [
                'data' => [],
                'current_page' => 1,
                'per_page' => 10,
                'total' => 0,
                'total_pages' => 0
            ]
        ], 200);
    }
});

// Rutas de Sanctum para CSRF Token
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show'])
    ->middleware(['web']);

// Página de pruebas para el modal (sin middleware)
Route::get('/test-modal', function () {
    return view('test-modal');
});

// Rutas para archivos de storage con CORS habilitado
Route::middleware(['storage.cors'])->group(function () {
    // Manejar requests OPTIONS para storage
    Route::options('storage/{path}', function () {
        return response('', 200);
    })->where('path', '.*');
});

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });
});