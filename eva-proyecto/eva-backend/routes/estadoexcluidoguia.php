<?php

/**
 * Rutas API - EstadoExcluidoGuia
 * 
 * Archivo de rutas optimizado para el modelo EstadoExcluidoGuia
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EstadoExcluidoGuiaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EstadoExcluidoGuia
    Route::apiResource('estadoexcluidoguia', EstadoExcluidoGuiaController::class);
    
    // Rutas adicionales específicas
    Route::get('estadoexcluidoguia/search/{term}', [EstadoExcluidoGuiaController::class, 'search']);
    Route::get('estadoexcluidoguia/stats', [EstadoExcluidoGuiaController::class, 'stats']);
    Route::post('estadoexcluidoguia/{id}/toggle', [EstadoExcluidoGuiaController::class, 'toggle']);
    
});
