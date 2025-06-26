<?php

/**
 * Rutas API - equipos
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
use App\Http\Controllers\Api\EquipmentController;

/*
|--------------------------------------------------------------------------
| Equipment Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de equipos médicos
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD básico de equipos
    Route::apiResource('equipos', EquipmentController::class);
    
    // Rutas específicas de equipos

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('equipos/{id}/historial', [EquipmentController::class, 'historial']);
        Route::get('equipos/{id}/mantenimientos', [EquipmentController::class, 'mantenimientos']);
        Route::get('equipos/{id}/calibraciones', [EquipmentController::class, 'calibraciones']);
        Route::get('equipos/{id}/documentos', [EquipmentController::class, 'documentos']);
        Route::post('equipos/{id}/toggle-status', [EquipmentController::class, 'toggleStatus']);
        Route::post('equipos/{id}/asignar-area', [EquipmentController::class, 'asignarArea']);
        Route::post('equipos/{id}/asignar-servicio', [EquipmentController::class, 'asignarServicio']);
    
    // Búsquedas y filtros
        Route::get('equipos/buscar/{termino}', [EquipmentController::class, 'buscar']);
        Route::post('equipos/busqueda-avanzada', [EquipmentController::class, 'busquedaAvanzada']);
        Route::get('equipos/filtrar/estado/{estado}', [EquipmentController::class, 'filtrarPorEstado']);
        Route::get('equipos/filtrar/area/{area}', [EquipmentController::class, 'filtrarPorArea']);
        Route::get('equipos/filtrar/servicio/{servicio}', [EquipmentController::class, 'filtrarPorServicio']);
    
    // Estadísticas de equipos
        Route::get('equipos/estadisticas/general', [EquipmentController::class, 'estadisticasGenerales']);
        Route::get('equipos/estadisticas/por-area', [EquipmentController::class, 'estadisticasPorArea']);
        Route::get('equipos/estadisticas/por-estado', [EquipmentController::class, 'estadisticasPorEstado']);
        Route::get('equipos/estadisticas/criticos', [EquipmentController::class, 'equiposCriticos']);
    
    // Gestión masiva
        Route::post('equipos/importar', [EquipmentController::class, 'importar']);
        Route::post('equipos/actualizar-masivo', [EquipmentController::class, 'actualizarMasivo']);
        Route::post('equipos/eliminar-masivo', [EquipmentController::class, 'eliminarMasivo']);
    
    // QR y códigos
        Route::get('equipos/{id}/qr', [EquipmentController::class, 'generarQR']);
        Route::get('equipos/{id}/etiqueta', [EquipmentController::class, 'generarEtiqueta']);
        Route::post('equipos/escanear-qr', [EquipmentController::class, 'escanearQR']);
});

});