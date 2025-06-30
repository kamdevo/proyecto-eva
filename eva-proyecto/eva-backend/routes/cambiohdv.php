<?php

/**
 * Rutas API - CambioHdv
 * 
 * Archivo de rutas optimizado para el modelo CambioHdv
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CambioHdvController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CambioHdv
    Route::apiResource('cambiohdv', CambioHdvController::class);
    
    // Rutas adicionales específicas
    Route::get('cambiohdv/search/{term}', [CambioHdvController::class, 'search']);
    Route::get('cambiohdv/stats', [CambioHdvController::class, 'stats']);
    Route::post('cambiohdv/{id}/toggle', [CambioHdvController::class, 'toggle']);
    
});
