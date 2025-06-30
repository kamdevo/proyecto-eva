<?php

/**
 * Rutas API - CorrectivoGeneralInd
 * 
 * Archivo de rutas optimizado para el modelo CorrectivoGeneralInd
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CorrectivoGeneralIndController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CorrectivoGeneralInd
    Route::apiResource('correctivogeneralind', CorrectivoGeneralIndController::class);
    
    // Rutas adicionales específicas
    Route::get('correctivogeneralind/search/{term}', [CorrectivoGeneralIndController::class, 'search']);
    Route::get('correctivogeneralind/stats', [CorrectivoGeneralIndController::class, 'stats']);
    Route::post('correctivogeneralind/{id}/toggle', [CorrectivoGeneralIndController::class, 'toggle']);
    
});
