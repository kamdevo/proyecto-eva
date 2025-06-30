<?php

/**
 * Rutas API - AuditoriaLog
 * 
 * Archivo de rutas optimizado para el modelo AuditoriaLog
 * con middleware de seguridad empresarial completo.
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuditoriaLogController;

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Rutas CRUD para AuditoriaLog
    Route::apiResource('auditorialog', AuditoriaLogController::class);
    
    // Rutas adicionales específicas
    Route::get('auditorialog/search/{term}', [AuditoriaLogController::class, 'search']);
    Route::get('auditorialog/stats', [AuditoriaLogController::class, 'stats']);
    Route::post('auditorialog/{id}/toggle', [AuditoriaLogController::class, 'toggle']);
    
});
