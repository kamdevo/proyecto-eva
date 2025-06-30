<?php

/**
 * Rutas API - ServicioIndustrial
 * 
 * Archivo de rutas optimizado para el modelo ServicioIndustrial
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServicioIndustrialController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para ServicioIndustrial
    Route::apiResource('servicioindustrial', ServicioIndustrialController::class);
    
    // Rutas adicionales específicas
    Route::get('servicioindustrial/search/{term}', [ServicioIndustrialController::class, 'search']);
    Route::get('servicioindustrial/stats', [ServicioIndustrialController::class, 'stats']);
    Route::post('servicioindustrial/{id}/toggle', [ServicioIndustrialController::class, 'toggle']);
    
});
