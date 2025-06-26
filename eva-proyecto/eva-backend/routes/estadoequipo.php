<?php

/**
 * Rutas API - EstadoEquipo
 * 
 * Archivo de rutas optimizado para el modelo EstadoEquipo
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EstadoEquipoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EstadoEquipo
    Route::apiResource('estadoequipo', EstadoEquipoController::class);
    
    // Rutas adicionales específicas
    Route::get('estadoequipo/search/{term}', [EstadoEquipoController::class, 'search']);
    Route::get('estadoequipo/stats', [EstadoEquipoController::class, 'stats']);
    Route::post('estadoequipo/{id}/toggle', [EstadoEquipoController::class, 'toggle']);
    
});
