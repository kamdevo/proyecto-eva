<?php

/**
 * Rutas API - mantenimiento
 * 
 * Archivo de rutas optimizado para el sistema EVA
 * con middleware de seguridad empresarial completo.
 * 
 * Middleware aplicado:
 * - auth:sanctum: Autenticación requerida
 * - throttle:60,1: Rate limiting (60 requests por minuto)
 * - cors: Cross-Origin Resource Sharing
 * - api.version: Versionado de API
 * - verified: Verificación de email (donde aplique)
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MantenimientoController;
use App\Http\Controllers\Api\CalibracionController;
use App\Http\Controllers\Api\CorrectivoController;
use App\Http\Controllers\Api\PlanMantenimientoController;

/*
|--------------------------------------------------------------------------
| Maintenance Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de mantenimientos, calibraciones y correctivos
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD de mantenimientos
    Route::apiResource('mantenimiento', MantenimientoController::class);
    
    // Rutas específicas de mantenimiento

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('mantenimiento/{id}/detalles', [MantenimientoController::class, 'detalles']);
        Route::post('mantenimiento/{id}/completar', [MantenimientoController::class, 'completar']);
        Route::post('mantenimiento/{id}/cancelar', [MantenimientoController::class, 'cancelar']);
        Route::post('mantenimiento/{id}/reprogramar', [MantenimientoController::class, 'reprogramar']);
        Route::post('mantenimiento/{id}/asignar-tecnico', [MantenimientoController::class, 'asignarTecnico']);
    
    // Filtros y búsquedas de mantenimiento
        Route::get('mantenimiento/filtrar/estado/{estado}', [MantenimientoController::class, 'filtrarPorEstado']);
        Route::get('mantenimiento/filtrar/tipo/{tipo}', [MantenimientoController::class, 'filtrarPorTipo']);
        Route::get('mantenimiento/filtrar/equipo/{equipo}', [MantenimientoController::class, 'filtrarPorEquipo']);
        Route::get('mantenimiento/filtrar/tecnico/{tecnico}', [MantenimientoController::class, 'filtrarPorTecnico']);
        Route::get('mantenimiento/pendientes', [MantenimientoController::class, 'pendientes']);
        Route::get('mantenimiento/vencidos', [MantenimientoController::class, 'vencidos']);
        Route::get('mantenimiento/proximos', [MantenimientoController::class, 'proximos']);
    
    // Estadísticas de mantenimiento
        Route::get('mantenimiento/estadisticas/general', [MantenimientoController::class, 'estadisticasGenerales']);
        Route::get('mantenimiento/estadisticas/cumplimiento', [MantenimientoController::class, 'estadisticasCumplimiento']);
        Route::get('mantenimiento/estadisticas/por-tecnico', [MantenimientoController::class, 'estadisticasPorTecnico']);
        Route::get('mantenimiento/estadisticas/por-equipo', [MantenimientoController::class, 'estadisticasPorEquipo']);
    
    // CRUD de calibraciones
    Route::apiResource('calibracion', CalibracionController::class);
        Route::get('calibracion/{id}/certificado', [CalibracionController::class, 'certificado']);
        Route::post('calibracion/{id}/aprobar', [CalibracionController::class, 'aprobar']);
        Route::post('calibracion/{id}/rechazar', [CalibracionController::class, 'rechazar']);
        Route::get('calibracion/vencimientos', [CalibracionController::class, 'vencimientos']);
        Route::get('calibracion/estadisticas', [CalibracionController::class, 'estadisticas']);
    
    // CRUD de correctivos
    Route::apiResource('correctivo', CorrectivoController::class);
        Route::post('correctivo/{id}/asignar', [CorrectivoController::class, 'asignar']);
        Route::post('correctivo/{id}/resolver', [CorrectivoController::class, 'resolver']);
        Route::get('correctivo/urgentes', [CorrectivoController::class, 'urgentes']);
        Route::get('correctivo/estadisticas', [CorrectivoController::class, 'estadisticas']);
    
    // Planes de mantenimiento
    Route::apiResource('plan-mantenimiento', PlanMantenimientoController::class);
        Route::post('plan-mantenimiento/{id}/activar', [PlanMantenimientoController::class, 'activar']);
        Route::post('plan-mantenimiento/{id}/desactivar', [PlanMantenimientoController::class, 'desactivar']);
        Route::post('plan-mantenimiento/{id}/generar-tareas', [PlanMantenimientoController::class, 'generarTareas']);
        Route::get('plan-mantenimiento/{id}/historial', [PlanMantenimientoController::class, 'historial']);
    
    // Programación y calendario
        Route::get('mantenimiento/calendario', [MantenimientoController::class, 'calendario']);
        Route::get('mantenimiento/calendario/{fecha}', [MantenimientoController::class, 'calendarioPorFecha']);
        Route::post('mantenimiento/programar-masivo', [MantenimientoController::class, 'programarMasivo']);
    
    // Notificaciones y alertas
        Route::get('mantenimiento/alertas', [MantenimientoController::class, 'alertas']);
        Route::post('mantenimiento/notificar-vencimientos', [MantenimientoController::class, 'notificarVencimientos']);
});

});