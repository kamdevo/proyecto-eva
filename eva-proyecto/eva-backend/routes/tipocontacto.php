<?php

/**
 * Rutas API - TipoContacto
 * 
 * Archivo de rutas optimizado para el modelo TipoContacto
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TipoContactoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para TipoContacto
    Route::apiResource('tipocontacto', TipoContactoController::class);
    
    // Rutas adicionales específicas
    Route::get('tipocontacto/search/{term}', [TipoContactoController::class, 'search']);
    Route::get('tipocontacto/stats', [TipoContactoController::class, 'stats']);
    Route::post('tipocontacto/{id}/toggle', [TipoContactoController::class, 'toggle']);
    
});
