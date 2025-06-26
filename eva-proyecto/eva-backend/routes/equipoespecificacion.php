<?php

/**
 * Rutas API - EquipoEspecificacion
 * 
 * Archivo de rutas optimizado para el modelo EquipoEspecificacion
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoEspecificacionController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoEspecificacion
    Route::apiResource('equipoespecificacion', EquipoEspecificacionController::class);
    
    // Rutas adicionales específicas
    Route::get('equipoespecificacion/search/{term}', [EquipoEspecificacionController::class, 'search']);
    Route::get('equipoespecificacion/stats', [EquipoEspecificacionController::class, 'stats']);
    Route::post('equipoespecificacion/{id}/toggle', [EquipoEspecificacionController::class, 'toggle']);
    
});
