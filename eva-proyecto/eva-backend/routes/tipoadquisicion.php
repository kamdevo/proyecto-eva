<?php

/**
 * Rutas API - TipoAdquisicion
 * 
 * Archivo de rutas optimizado para el modelo TipoAdquisicion
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TipoAdquisicionController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para TipoAdquisicion
    Route::apiResource('tipoadquisicion', TipoAdquisicionController::class);
    
    // Rutas adicionales específicas
    Route::get('tipoadquisicion/search/{term}', [TipoAdquisicionController::class, 'search']);
    Route::get('tipoadquisicion/stats', [TipoAdquisicionController::class, 'stats']);
    Route::post('tipoadquisicion/{id}/toggle', [TipoAdquisicionController::class, 'toggle']);
    
});
