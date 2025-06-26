<?php

/**
 * Rutas API - GuiaRapidaIndicador
 * 
 * Archivo de rutas optimizado para el modelo GuiaRapidaIndicador
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GuiaRapidaIndicadorController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para GuiaRapidaIndicador
    Route::apiResource('guiarapidaindicador', GuiaRapidaIndicadorController::class);
    
    // Rutas adicionales específicas
    Route::get('guiarapidaindicador/search/{term}', [GuiaRapidaIndicadorController::class, 'search']);
    Route::get('guiarapidaindicador/stats', [GuiaRapidaIndicadorController::class, 'stats']);
    Route::post('guiarapidaindicador/{id}/toggle', [GuiaRapidaIndicadorController::class, 'toggle']);
    
});
