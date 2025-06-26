<?php

/**
 * Rutas API - EquipoContacto
 * 
 * Archivo de rutas optimizado para el modelo EquipoContacto
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoContactoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoContacto
    Route::apiResource('equipocontacto', EquipoContactoController::class);
    
    // Rutas adicionales específicas
    Route::get('equipocontacto/search/{term}', [EquipoContactoController::class, 'search']);
    Route::get('equipocontacto/stats', [EquipoContactoController::class, 'stats']);
    Route::post('equipocontacto/{id}/toggle', [EquipoContactoController::class, 'toggle']);
    
});
