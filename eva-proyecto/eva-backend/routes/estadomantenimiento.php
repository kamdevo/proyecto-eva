<?php

/**
 * Rutas API - EstadoMantenimiento
 * 
 * Archivo de rutas optimizado para el modelo EstadoMantenimiento
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EstadoMantenimientoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EstadoMantenimiento
    Route::apiResource('estadomantenimiento', EstadoMantenimientoController::class);
    
    // Rutas adicionales específicas
    Route::get('estadomantenimiento/search/{term}', [EstadoMantenimientoController::class, 'search']);
    Route::get('estadomantenimiento/stats', [EstadoMantenimientoController::class, 'stats']);
    Route::post('estadomantenimiento/{id}/toggle', [EstadoMantenimientoController::class, 'toggle']);
    
});
