<?php

/**
 * Rutas API - areas
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
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\ServicioController;

/*
|--------------------------------------------------------------------------
| Areas and Services Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de áreas y servicios
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD de áreas
    Route::apiResource('areas', AreaController::class);
    
    // Gestión específica de áreas

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('areas/{id}/equipos', [AreaController::class, 'equipos']);
        Route::get('areas/{id}/servicios', [AreaController::class, 'servicios']);
        Route::get('areas/{id}/estadisticas', [AreaController::class, 'estadisticas']);
        Route::post('areas/{id}/toggle-status', [AreaController::class, 'toggleStatus']);
        Route::post('areas/{id}/asignar-responsable', [AreaController::class, 'asignarResponsable']);
    
    // Jerarquía de áreas
        Route::get('areas/{id}/hijos', [AreaController::class, 'areasHijas']);
        Route::get('areas/{id}/padre', [AreaController::class, 'areaPadre']);
        Route::get('areas/jerarquia', [AreaController::class, 'jerarquia']);
        Route::post('areas/{id}/mover', [AreaController::class, 'moverArea']);
    
    // Filtros y búsquedas de áreas
        Route::get('areas/buscar/{termino}', [AreaController::class, 'buscar']);
        Route::get('areas/filtrar/tipo/{tipo}', [AreaController::class, 'filtrarPorTipo']);
        Route::get('areas/filtrar/estado/{estado}', [AreaController::class, 'filtrarPorEstado']);
        Route::get('areas/activas', [AreaController::class, 'activas']);
        Route::get('areas/inactivas', [AreaController::class, 'inactivas']);
    
    // CRUD de servicios
    Route::apiResource('servicios', ServicioController::class);
    
    // Gestión específica de servicios
        Route::get('servicios/{id}/equipos', [ServicioController::class, 'equipos']);
        Route::get('servicios/{id}/areas', [ServicioController::class, 'areas']);
        Route::get('servicios/{id}/estadisticas', [ServicioController::class, 'estadisticas']);
        Route::post('servicios/{id}/toggle-status', [ServicioController::class, 'toggleStatus']);
        Route::post('servicios/{id}/asignar-jefe', [ServicioController::class, 'asignarJefe']);
    
    // Relaciones entre áreas y servicios
        Route::post('areas/{area}/servicios/{servicio}/asignar', [AreaController::class, 'asignarServicio']);
        Route::delete('areas/{area}/servicios/{servicio}/desasignar', [AreaController::class, 'desasignarServicio']);
        Route::get('areas/{area}/servicios-disponibles', [AreaController::class, 'serviciosDisponibles']);
        Route::get('servicios/{servicio}/areas-disponibles', [ServicioController::class, 'areasDisponibles']);
    
    // Filtros y búsquedas de servicios
        Route::get('servicios/buscar/{termino}', [ServicioController::class, 'buscar']);
        Route::get('servicios/filtrar/tipo/{tipo}', [ServicioController::class, 'filtrarPorTipo']);
        Route::get('servicios/filtrar/estado/{estado}', [ServicioController::class, 'filtrarPorEstado']);
        Route::get('servicios/filtrar/area/{area}', [ServicioController::class, 'filtrarPorArea']);
        Route::get('servicios/activos', [ServicioController::class, 'activos']);
        Route::get('servicios/inactivos', [ServicioController::class, 'inactivos']);
    
    // Estadísticas combinadas
        Route::get('areas-servicios/estadisticas/general', [AreaController::class, 'estadisticasGenerales']);
        Route::get('areas-servicios/estadisticas/equipos', [AreaController::class, 'estadisticasEquipos']);
        Route::get('areas-servicios/estadisticas/mantenimientos', [AreaController::class, 'estadisticasMantenimientos']);
        Route::get('areas-servicios/estadisticas/contingencias', [AreaController::class, 'estadisticasContingencias']);
    
    // Reportes de áreas y servicios
        Route::get('areas/reporte/completo', [AreaController::class, 'reporteCompleto']);
        Route::get('servicios/reporte/completo', [ServicioController::class, 'reporteCompleto']);
        Route::get('areas-servicios/reporte/matriz', [AreaController::class, 'reporteMatriz']);
    
    // Configuración
        Route::get('areas/configuracion', [AreaController::class, 'configuracion']);
        Route::put('areas/configuracion', [AreaController::class, 'actualizarConfiguracion']);
        Route::get('servicios/configuracion', [ServicioController::class, 'configuracion']);
        Route::put('servicios/configuracion', [ServicioController::class, 'actualizarConfiguracion']);
});

});