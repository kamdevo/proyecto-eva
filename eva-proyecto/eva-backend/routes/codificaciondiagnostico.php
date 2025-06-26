<?php

/**
 * Rutas API - CodificacionDiagnostico
 * 
 * Archivo de rutas optimizado para el modelo CodificacionDiagnostico
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CodificacionDiagnosticoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CodificacionDiagnostico
    Route::apiResource('codificaciondiagnostico', CodificacionDiagnosticoController::class);
    
    // Rutas adicionales específicas
    Route::get('codificaciondiagnostico/search/{term}', [CodificacionDiagnosticoController::class, 'search']);
    Route::get('codificaciondiagnostico/stats', [CodificacionDiagnosticoController::class, 'stats']);
    Route::post('codificaciondiagnostico/{id}/toggle', [CodificacionDiagnosticoController::class, 'toggle']);
    
});
