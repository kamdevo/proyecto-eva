<?php

/**
 * Rutas API - MantenimientoInd
 * 
 * Archivo de rutas optimizado para el modelo MantenimientoInd
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MantenimientoIndController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para MantenimientoInd
    Route::apiResource('mantenimientoind', MantenimientoIndController::class);
    
    // Rutas adicionales específicas
    Route::get('mantenimientoind/search/{term}', [MantenimientoIndController::class, 'search']);
    Route::get('mantenimientoind/stats', [MantenimientoIndController::class, 'stats']);
    Route::post('mantenimientoind/{id}/toggle', [MantenimientoIndController::class, 'toggle']);
    
});
