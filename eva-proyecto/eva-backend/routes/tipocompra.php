<?php

/**
 * Rutas API - TipoCompra
 * 
 * Archivo de rutas optimizado para el modelo TipoCompra
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TipoCompraController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para TipoCompra
    Route::apiResource('tipocompra', TipoCompraController::class);
    
    // Rutas adicionales específicas
    Route::get('tipocompra/search/{term}', [TipoCompraController::class, 'search']);
    Route::get('tipocompra/stats', [TipoCompraController::class, 'stats']);
    Route::post('tipocompra/{id}/toggle', [TipoCompraController::class, 'toggle']);
    
});
