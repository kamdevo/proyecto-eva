<?php

/**
 * Rutas API - VigenciaMantenimiento
 * 
 * Archivo de rutas optimizado para el modelo VigenciaMantenimiento
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VigenciaMantenimientoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para VigenciaMantenimiento
    Route::apiResource('vigenciamantenimiento', VigenciaMantenimientoController::class);
    
    // Rutas adicionales específicas
    Route::get('vigenciamantenimiento/search/{term}', [VigenciaMantenimientoController::class, 'search']);
    Route::get('vigenciamantenimiento/stats', [VigenciaMantenimientoController::class, 'stats']);
    Route::post('vigenciamantenimiento/{id}/toggle', [VigenciaMantenimientoController::class, 'toggle']);
    
});
