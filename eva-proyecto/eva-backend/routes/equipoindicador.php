<?php

/**
 * Rutas API - EquipoIndicador
 * 
 * Archivo de rutas optimizado para el modelo EquipoIndicador
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoIndicadorController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoIndicador
    Route::apiResource('equipoindicador', EquipoIndicadorController::class);
    
    // Rutas adicionales específicas
    Route::get('equipoindicador/search/{term}', [EquipoIndicadorController::class, 'search']);
    Route::get('equipoindicador/stats', [EquipoIndicadorController::class, 'stats']);
    Route::post('equipoindicador/{id}/toggle', [EquipoIndicadorController::class, 'toggle']);
    
});
