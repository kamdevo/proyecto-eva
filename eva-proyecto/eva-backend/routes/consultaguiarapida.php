<?php

/**
 * Rutas API - ConsultaGuiaRapida
 * 
 * Archivo de rutas optimizado para el modelo ConsultaGuiaRapida
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ConsultaGuiaRapidaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para ConsultaGuiaRapida
    Route::apiResource('consultaguiarapida', ConsultaGuiaRapidaController::class);
    
    // Rutas adicionales específicas
    Route::get('consultaguiarapida/search/{term}', [ConsultaGuiaRapidaController::class, 'search']);
    Route::get('consultaguiarapida/stats', [ConsultaGuiaRapidaController::class, 'stats']);
    Route::post('consultaguiarapida/{id}/toggle', [ConsultaGuiaRapidaController::class, 'toggle']);
    
});
