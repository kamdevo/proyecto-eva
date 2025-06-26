<?php

/**
 * Rutas API - ClasificacionBiomedica
 * 
 * Archivo de rutas optimizado para el modelo ClasificacionBiomedica
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClasificacionBiomedicaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para ClasificacionBiomedica
    Route::apiResource('clasificacionbiomedica', ClasificacionBiomedicaController::class);
    
    // Rutas adicionales específicas
    Route::get('clasificacionbiomedica/search/{term}', [ClasificacionBiomedicaController::class, 'search']);
    Route::get('clasificacionbiomedica/stats', [ClasificacionBiomedicaController::class, 'stats']);
    Route::post('clasificacionbiomedica/{id}/toggle', [ClasificacionBiomedicaController::class, 'toggle']);
    
});
