<?php

/**
 * Rutas API - GuiaRapida
 * 
 * Archivo de rutas optimizado para el modelo GuiaRapida
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GuiaRapidaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para GuiaRapida
    Route::apiResource('guiarapida', GuiaRapidaController::class);
    
    // Rutas adicionales específicas
    Route::get('guiarapida/search/{term}', [GuiaRapidaController::class, 'search']);
    Route::get('guiarapida/stats', [GuiaRapidaController::class, 'stats']);
    Route::post('guiarapida/{id}/toggle', [GuiaRapidaController::class, 'toggle']);
    
});
