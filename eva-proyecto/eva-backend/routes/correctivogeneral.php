<?php

/**
 * Rutas API - CorrectivoGeneral
 * 
 * Archivo de rutas optimizado para el modelo CorrectivoGeneral
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CorrectivoGeneralController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CorrectivoGeneral
    Route::apiResource('correctivogeneral', CorrectivoGeneralController::class);
    
    // Rutas adicionales específicas
    Route::get('correctivogeneral/search/{term}', [CorrectivoGeneralController::class, 'search']);
    Route::get('correctivogeneral/stats', [CorrectivoGeneralController::class, 'stats']);
    Route::post('correctivogeneral/{id}/toggle', [CorrectivoGeneralController::class, 'toggle']);
    
});
