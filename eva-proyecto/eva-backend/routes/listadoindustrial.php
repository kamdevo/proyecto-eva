<?php

/**
 * Rutas API - ListadoIndustrial
 * 
 * Archivo de rutas optimizado para el modelo ListadoIndustrial
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ListadoIndustrialController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para ListadoIndustrial
    Route::apiResource('listadoindustrial', ListadoIndustrialController::class);
    
    // Rutas adicionales específicas
    Route::get('listadoindustrial/search/{term}', [ListadoIndustrialController::class, 'search']);
    Route::get('listadoindustrial/stats', [ListadoIndustrialController::class, 'stats']);
    Route::post('listadoindustrial/{id}/toggle', [ListadoIndustrialController::class, 'toggle']);
    
});
