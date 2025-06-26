<?php

/**
 * Rutas API - ObservacionArchivo
 * 
 * Archivo de rutas optimizado para el modelo ObservacionArchivo
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ObservacionArchivoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para ObservacionArchivo
    Route::apiResource('observacionarchivo', ObservacionArchivoController::class);
    
    // Rutas adicionales específicas
    Route::get('observacionarchivo/search/{term}', [ObservacionArchivoController::class, 'search']);
    Route::get('observacionarchivo/stats', [ObservacionArchivoController::class, 'stats']);
    Route::post('observacionarchivo/{id}/toggle', [ObservacionArchivoController::class, 'toggle']);
    
});
