<?php

/**
 * Rutas API - OrdenCompra
 * 
 * Archivo de rutas optimizado para el modelo OrdenCompra
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OrdenCompraController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para OrdenCompra
    Route::apiResource('ordencompra', OrdenCompraController::class);
    
    // Rutas adicionales específicas
    Route::get('ordencompra/search/{term}', [OrdenCompraController::class, 'search']);
    Route::get('ordencompra/stats', [OrdenCompraController::class, 'stats']);
    Route::post('ordencompra/{id}/toggle', [OrdenCompraController::class, 'toggle']);
    
});
