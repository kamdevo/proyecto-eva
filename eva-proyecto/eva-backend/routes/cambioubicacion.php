<?php

/**
 * Rutas API - CambioUbicacion
 * 
 * Archivo de rutas optimizado para el modelo CambioUbicacion
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CambioUbicacionController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CambioUbicacion
    Route::apiResource('cambioubicacion', CambioUbicacionController::class);
    
    // Rutas adicionales específicas
    Route::get('cambioubicacion/search/{term}', [CambioUbicacionController::class, 'search']);
    Route::get('cambioubicacion/stats', [CambioUbicacionController::class, 'stats']);
    Route::post('cambioubicacion/{id}/toggle', [CambioUbicacionController::class, 'toggle']);
    
});
