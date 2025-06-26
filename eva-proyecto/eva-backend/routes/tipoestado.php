<?php

/**
 * Rutas API - TipoEstado
 * 
 * Archivo de rutas optimizado para el modelo TipoEstado
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TipoEstadoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para TipoEstado
    Route::apiResource('tipoestado', TipoEstadoController::class);
    
    // Rutas adicionales específicas
    Route::get('tipoestado/search/{term}', [TipoEstadoController::class, 'search']);
    Route::get('tipoestado/stats', [TipoEstadoController::class, 'stats']);
    Route::post('tipoestado/{id}/toggle', [TipoEstadoController::class, 'toggle']);
    
});
