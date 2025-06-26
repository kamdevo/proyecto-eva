<?php

/**
 * Rutas API - RepuestoPendiente
 * 
 * Archivo de rutas optimizado para el modelo RepuestoPendiente
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RepuestoPendienteController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para RepuestoPendiente
    Route::apiResource('repuestopendiente', RepuestoPendienteController::class);
    
    // Rutas adicionales específicas
    Route::get('repuestopendiente/search/{term}', [RepuestoPendienteController::class, 'search']);
    Route::get('repuestopendiente/stats', [RepuestoPendienteController::class, 'stats']);
    Route::post('repuestopendiente/{id}/toggle', [RepuestoPendienteController::class, 'toggle']);
    
});
