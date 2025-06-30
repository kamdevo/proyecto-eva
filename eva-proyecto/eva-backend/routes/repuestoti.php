<?php

/**
 * Rutas API - RepuestoTi
 * 
 * Archivo de rutas optimizado para el modelo RepuestoTi
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RepuestoTiController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para RepuestoTi
    Route::apiResource('repuestoti', RepuestoTiController::class);
    
    // Rutas adicionales específicas
    Route::get('repuestoti/search/{term}', [RepuestoTiController::class, 'search']);
    Route::get('repuestoti/stats', [RepuestoTiController::class, 'stats']);
    Route::post('repuestoti/{id}/toggle', [RepuestoTiController::class, 'toggle']);
    
});
