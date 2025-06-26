<?php

/**
 * Rutas API - EquipoBaja
 * 
 * Archivo de rutas optimizado para el modelo EquipoBaja
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipoBajaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para EquipoBaja
    Route::apiResource('equipobaja', EquipoBajaController::class);
    
    // Rutas adicionales específicas
    Route::get('equipobaja/search/{term}', [EquipoBajaController::class, 'search']);
    Route::get('equipobaja/stats', [EquipoBajaController::class, 'stats']);
    Route::post('equipobaja/{id}/toggle', [EquipoBajaController::class, 'toggle']);
    
});
