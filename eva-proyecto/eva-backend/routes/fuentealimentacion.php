<?php

/**
 * Rutas API - FuenteAlimentacion
 * 
 * Archivo de rutas optimizado para el modelo FuenteAlimentacion
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FuenteAlimentacionController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para FuenteAlimentacion
    Route::apiResource('fuentealimentacion', FuenteAlimentacionController::class);
    
    // Rutas adicionales específicas
    Route::get('fuentealimentacion/search/{term}', [FuenteAlimentacionController::class, 'search']);
    Route::get('fuentealimentacion/stats', [FuenteAlimentacionController::class, 'stats']);
    Route::post('fuentealimentacion/{id}/toggle', [FuenteAlimentacionController::class, 'toggle']);
    
});
