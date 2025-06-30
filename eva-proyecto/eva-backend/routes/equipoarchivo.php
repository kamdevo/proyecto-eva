<?php

/**
 * Rutas API - EquipoArchivo
 * 
 * Archivo de rutas optimizado para el modelo EquipoArchivo
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoArchivoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoArchivo
    Route::apiResource('equipoarchivo', EquipoArchivoController::class);
    
    // Rutas adicionales específicas
    Route::get('equipoarchivo/search/{term}', [EquipoArchivoController::class, 'search']);
    Route::get('equipoarchivo/stats', [EquipoArchivoController::class, 'stats']);
    Route::post('equipoarchivo/{id}/toggle', [EquipoArchivoController::class, 'toggle']);
    
});
