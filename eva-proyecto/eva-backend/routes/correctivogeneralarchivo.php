<?php

/**
 * Rutas API - CorrectivoGeneralArchivo
 * 
 * Archivo de rutas optimizado para el modelo CorrectivoGeneralArchivo
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CorrectivoGeneralArchivoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CorrectivoGeneralArchivo
    Route::apiResource('correctivogeneralarchivo', CorrectivoGeneralArchivoController::class);
    
    // Rutas adicionales específicas
    Route::get('correctivogeneralarchivo/search/{term}', [CorrectivoGeneralArchivoController::class, 'search']);
    Route::get('correctivogeneralarchivo/stats', [CorrectivoGeneralArchivoController::class, 'stats']);
    Route::post('correctivogeneralarchivo/{id}/toggle', [CorrectivoGeneralArchivoController::class, 'toggle']);
    
});
