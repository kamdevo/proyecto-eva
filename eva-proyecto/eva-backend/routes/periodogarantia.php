<?php

/**
 * Rutas API - PeriodoGarantia
 * 
 * Archivo de rutas optimizado para el modelo PeriodoGarantia
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PeriodoGarantiaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para PeriodoGarantia
    Route::apiResource('periodogarantia', PeriodoGarantiaController::class);
    
    // Rutas adicionales específicas
    Route::get('periodogarantia/search/{term}', [PeriodoGarantiaController::class, 'search']);
    Route::get('periodogarantia/stats', [PeriodoGarantiaController::class, 'stats']);
    Route::post('periodogarantia/{id}/toggle', [PeriodoGarantiaController::class, 'toggle']);
    
});
