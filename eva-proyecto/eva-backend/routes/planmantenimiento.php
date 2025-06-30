<?php

/**
 * Rutas API - PlanMantenimiento
 * 
 * Archivo de rutas optimizado para el modelo PlanMantenimiento
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PlanMantenimientoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para PlanMantenimiento
    Route::apiResource('planmantenimiento', PlanMantenimientoController::class);
    
    // Rutas adicionales específicas
    Route::get('planmantenimiento/search/{term}', [PlanMantenimientoController::class, 'search']);
    Route::get('planmantenimiento/stats', [PlanMantenimientoController::class, 'stats']);
    Route::post('planmantenimiento/{id}/toggle', [PlanMantenimientoController::class, 'toggle']);
    
});
