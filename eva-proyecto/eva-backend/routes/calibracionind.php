<?php

/**
 * Rutas API - CalibracionInd
 * 
 * Archivo de rutas optimizado para el modelo CalibracionInd
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CalibracionIndController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CalibracionInd
    Route::apiResource('calibracionind', CalibracionIndController::class);
    
    // Rutas adicionales específicas
    Route::get('calibracionind/search/{term}', [CalibracionIndController::class, 'search']);
    Route::get('calibracionind/stats', [CalibracionIndController::class, 'stats']);
    Route::post('calibracionind/{id}/toggle', [CalibracionIndController::class, 'toggle']);
    
});
