<?php

/**
 * Rutas API - EquipoIndustrial
 * 
 * Archivo de rutas optimizado para el modelo EquipoIndustrial
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoIndustrialController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoIndustrial
    Route::apiResource('equipoindustrial', EquipoIndustrialController::class);
    
    // Rutas adicionales específicas
    Route::get('equipoindustrial/search/{term}', [EquipoIndustrialController::class, 'search']);
    Route::get('equipoindustrial/stats', [EquipoIndustrialController::class, 'stats']);
    Route::post('equipoindustrial/{id}/toggle', [EquipoIndustrialController::class, 'toggle']);
    
});
