<?php

/**
 * Rutas API - export
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
use App\Http\Controllers\Api\ExportController;

/*
|--------------------------------------------------------------------------
| Export Routes
|--------------------------------------------------------------------------
|
| Rutas para exportación de reportes y documentos
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Exportaciones de equipos

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('export/equipos-consolidado', [ExportController::class, 'equiposConsolidado']);
        Route::get('export/equipos-criticos', [ExportController::class, 'equiposCriticos']);
        Route::get('export/equipos-por-area', [ExportController::class, 'equiposPorArea']);
        Route::get('export/equipos-por-estado', [ExportController::class, 'equiposPorEstado']);
        Route::get('export/inventario-equipos', [ExportController::class, 'inventarioEquipos']);
    
    // Exportaciones de mantenimiento
        Route::get('export/plantilla-mantenimiento', [ExportController::class, 'plantillaMantenimiento']);
        Route::get('export/estadisticas-cumplimiento', [ExportController::class, 'estadisticasCumplimiento']);
        Route::get('export/mantenimientos-pendientes', [ExportController::class, 'mantenimientosPendientes']);
        Route::get('export/mantenimientos-vencidos', [ExportController::class, 'mantenimientosVencidos']);
        Route::get('export/historial-mantenimientos', [ExportController::class, 'historialMantenimientos']);
    
    // Exportaciones de calibraciones
        Route::get('export/calibraciones', [ExportController::class, 'calibraciones']);
        Route::get('export/calibraciones-vencidas', [ExportController::class, 'calibracionesVencidas']);
        Route::get('export/certificados-calibracion', [ExportController::class, 'certificadosCalibracion']);
    
    // Exportaciones de contingencias
        Route::get('export/contingencias', [ExportController::class, 'contingencias']);
        Route::get('export/contingencias-criticas', [ExportController::class, 'contingenciasCriticas']);
        Route::get('export/analisis-contingencias', [ExportController::class, 'analisisContingencias']);
    
    // Exportaciones de inventario
        Route::get('export/inventario-repuestos', [ExportController::class, 'inventarioRepuestos']);
        Route::get('export/repuestos-criticos', [ExportController::class, 'repuestosCriticos']);
        Route::get('export/movimientos-inventario', [ExportController::class, 'movimientosInventario']);
    
    // Exportaciones de tickets
        Route::get('export/tickets', [ExportController::class, 'tickets']);
        Route::get('export/tickets-abiertos', [ExportController::class, 'ticketsAbiertos']);
        Route::get('export/analisis-tickets', [ExportController::class, 'analisisTickets']);
    
    // Reportes personalizados
        Route::post('export/reporte-personalizado', [ExportController::class, 'reportePersonalizado']);
        Route::get('export/dashboard-ejecutivo', [ExportController::class, 'dashboardEjecutivo']);
        Route::get('export/kpis-generales', [ExportController::class, 'kpisGenerales']);
        Route::get('export/analisis-tendencias', [ExportController::class, 'analisisTendencias']);
        Route::get('export/reporte-comparativo', [ExportController::class, 'reporteComparativo']);
    
    // Exportaciones programadas
        Route::get('export/programados', [ExportController::class, 'exportesProgramados']);
        Route::post('export/programar', [ExportController::class, 'programarExporte']);
        Route::delete('export/programados/{id}', [ExportController::class, 'cancelarExporteProgramado']);
    
    // Historial de exportaciones
        Route::get('export/historial', [ExportController::class, 'historialExportaciones']);
        Route::get('export/historial/{id}/descargar', [ExportController::class, 'descargarExporte']);
        Route::delete('export/historial/{id}', [ExportController::class, 'eliminarExporte']);
    
    // Configuración de exportaciones
        Route::get('export/configuracion', [ExportController::class, 'configuracionExporte']);
        Route::put('export/configuracion', [ExportController::class, 'actualizarConfiguracion']);
        Route::get('export/plantillas', [ExportController::class, 'plantillasDisponibles']);
        Route::post('export/plantillas', [ExportController::class, 'crearPlantilla']);
        Route::put('export/plantillas/{id}', [ExportController::class, 'actualizarPlantilla']);
        Route::delete('export/plantillas/{id}', [ExportController::class, 'eliminarPlantilla']);
});

});