<?php

/**
 * Rutas API - EquipoExcluidoGuia
 * 
 * Archivo de rutas optimizado para el modelo EquipoExcluidoGuia
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoExcluidoGuiaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoExcluidoGuia
    Route::apiResource('equipoexcluidoguia', EquipoExcluidoGuiaController::class);
    
    // Rutas adicionales específicas
    Route::get('equipoexcluidoguia/search/{term}', [EquipoExcluidoGuiaController::class, 'search']);
    Route::get('equipoexcluidoguia/stats', [EquipoExcluidoGuiaController::class, 'stats']);
    Route::post('equipoexcluidoguia/{id}/toggle', [EquipoExcluidoGuiaController::class, 'toggle']);
    
});
