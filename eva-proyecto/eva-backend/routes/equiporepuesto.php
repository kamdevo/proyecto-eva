<?php

/**
 * Rutas API - EquipoRepuesto
 * 
 * Archivo de rutas optimizado para el modelo EquipoRepuesto
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoRepuestoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoRepuesto
    Route::apiResource('equiporepuesto', EquipoRepuestoController::class);
    
    // Rutas adicionales específicas
    Route::get('equiporepuesto/search/{term}', [EquipoRepuestoController::class, 'search']);
    Route::get('equiporepuesto/stats', [EquipoRepuestoController::class, 'stats']);
    Route::post('equiporepuesto/{id}/toggle', [EquipoRepuestoController::class, 'toggle']);
    
});
