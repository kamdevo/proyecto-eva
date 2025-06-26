<?php

/**
 * Rutas API - FrecuenciaMantenimiento
 * 
 * Archivo de rutas optimizado para el modelo FrecuenciaMantenimiento
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FrecuenciaMantenimientoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para FrecuenciaMantenimiento
    Route::apiResource('frecuenciamantenimiento', FrecuenciaMantenimientoController::class);
    
    // Rutas adicionales específicas
    Route::get('frecuenciamantenimiento/search/{term}', [FrecuenciaMantenimientoController::class, 'search']);
    Route::get('frecuenciamantenimiento/stats', [FrecuenciaMantenimientoController::class, 'stats']);
    Route::post('frecuenciamantenimiento/{id}/toggle', [FrecuenciaMantenimientoController::class, 'toggle']);
    
});
