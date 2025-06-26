<?php

/**
 * Rutas API - CodificacionCierre
 * 
 * Archivo de rutas optimizado para el modelo CodificacionCierre
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CodificacionCierreController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CodificacionCierre
    Route::apiResource('codificacioncierre', CodificacionCierreController::class);
    
    // Rutas adicionales específicas
    Route::get('codificacioncierre/search/{term}', [CodificacionCierreController::class, 'search']);
    Route::get('codificacioncierre/stats', [CodificacionCierreController::class, 'stats']);
    Route::post('codificacioncierre/{id}/toggle', [CodificacionCierreController::class, 'toggle']);
    
});
