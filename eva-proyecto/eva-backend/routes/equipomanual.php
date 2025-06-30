<?php

/**
 * Rutas API - EquipoManual
 * 
 * Archivo de rutas optimizado para el modelo EquipoManual
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoManualController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoManual
    Route::apiResource('equipomanual', EquipoManualController::class);
    
    // Rutas adicionales específicas
    Route::get('equipomanual/search/{term}', [EquipoManualController::class, 'search']);
    Route::get('equipomanual/stats', [EquipoManualController::class, 'stats']);
    Route::post('equipomanual/{id}/toggle', [EquipoManualController::class, 'toggle']);
    
});
