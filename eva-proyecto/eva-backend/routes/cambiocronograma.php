<?php

/**
 * Rutas API - CambioCronograma
 * 
 * Archivo de rutas optimizado para el modelo CambioCronograma
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CambioCronogramaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para CambioCronograma
    Route::apiResource('cambiocronograma', CambioCronogramaController::class);
    
    // Rutas adicionales específicas
    Route::get('cambiocronograma/search/{term}', [CambioCronogramaController::class, 'search']);
    Route::get('cambiocronograma/stats', [CambioCronogramaController::class, 'stats']);
    Route::post('cambiocronograma/{id}/toggle', [CambioCronogramaController::class, 'toggle']);
    
});
