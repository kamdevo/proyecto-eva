<?php

/**
 * Rutas API - RiesgoIncluidoGuia
 * 
 * Archivo de rutas optimizado para el modelo RiesgoIncluidoGuia
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RiesgoIncluidoGuiaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para RiesgoIncluidoGuia
    Route::apiResource('riesgoincluidoguia', RiesgoIncluidoGuiaController::class);
    
    // Rutas adicionales específicas
    Route::get('riesgoincluidoguia/search/{term}', [RiesgoIncluidoGuiaController::class, 'search']);
    Route::get('riesgoincluidoguia/stats', [RiesgoIncluidoGuiaController::class, 'stats']);
    Route::post('riesgoincluidoguia/{id}/toggle', [RiesgoIncluidoGuiaController::class, 'toggle']);
    
});
