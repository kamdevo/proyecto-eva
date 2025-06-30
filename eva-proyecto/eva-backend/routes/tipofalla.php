<?php

/**
 * Rutas API - TipoFalla
 * 
 * Archivo de rutas optimizado para el modelo TipoFalla
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TipoFallaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para TipoFalla
    Route::apiResource('tipofalla', TipoFallaController::class);
    
    // Rutas adicionales específicas
    Route::get('tipofalla/search/{term}', [TipoFallaController::class, 'search']);
    Route::get('tipofalla/stats', [TipoFallaController::class, 'stats']);
    Route::post('tipofalla/{id}/toggle', [TipoFallaController::class, 'toggle']);
    
});
