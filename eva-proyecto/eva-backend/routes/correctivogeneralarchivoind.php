<?php

/**
 * Rutas API - CorrectivoGeneralArchivoInd
 * 
 * Archivo de rutas optimizado para el modelo CorrectivoGeneralArchivoInd
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CorrectivoGeneralArchivoIndController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CorrectivoGeneralArchivoInd
    Route::apiResource('correctivogeneralarchivoind', CorrectivoGeneralArchivoIndController::class);
    
    // Rutas adicionales específicas
    Route::get('correctivogeneralarchivoind/search/{term}', [CorrectivoGeneralArchivoIndController::class, 'search']);
    Route::get('correctivogeneralarchivoind/stats', [CorrectivoGeneralArchivoIndController::class, 'stats']);
    Route::post('correctivogeneralarchivoind/{id}/toggle', [CorrectivoGeneralArchivoIndController::class, 'toggle']);
    
});
