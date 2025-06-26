<?php

/**
 * Rutas API - UsuarioZona
 * 
 * Archivo de rutas optimizado para el modelo UsuarioZona
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuarioZonaController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para UsuarioZona
    Route::apiResource('usuariozona', UsuarioZonaController::class);
    
    // Rutas adicionales específicas
    Route::get('usuariozona/search/{term}', [UsuarioZonaController::class, 'search']);
    Route::get('usuariozona/stats', [UsuarioZonaController::class, 'stats']);
    Route::post('usuariozona/{id}/toggle', [UsuarioZonaController::class, 'toggle']);
    
});
