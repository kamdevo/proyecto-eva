<?php

/**
 * Rutas API - ProveedorMantenimiento
 * 
 * Archivo de rutas optimizado para el modelo ProveedorMantenimiento
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProveedorMantenimientoController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para ProveedorMantenimiento
    Route::apiResource('proveedormantenimiento', ProveedorMantenimientoController::class);
    
    // Rutas adicionales específicas
    Route::get('proveedormantenimiento/search/{term}', [ProveedorMantenimientoController::class, 'search']);
    Route::get('proveedormantenimiento/stats', [ProveedorMantenimientoController::class, 'stats']);
    Route::post('proveedormantenimiento/{id}/toggle', [ProveedorMantenimientoController::class, 'toggle']);
    
});
