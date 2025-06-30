<?php

/**
 * Rutas API - contingencias
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
use App\Http\Controllers\Api\ContingenciaController;
use App\Http\Controllers\Api\TicketController;

/*
|--------------------------------------------------------------------------
| Contingencies Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de contingencias y tickets
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD de contingencias
    Route::apiResource('contingencias', ContingenciaController::class);
    
    // Gestión específica de contingencias

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::post('contingencias/{id}/asignar', [ContingenciaController::class, 'asignar']);
        Route::post('contingencias/{id}/resolver', [ContingenciaController::class, 'resolver']);
        Route::post('contingencias/{id}/cerrar', [ContingenciaController::class, 'cerrar']);
        Route::post('contingencias/{id}/reabrir', [ContingenciaController::class, 'reabrir']);
        Route::post('contingencias/{id}/escalar', [ContingenciaController::class, 'escalar']);
        Route::post('contingencias/{id}/cambiar-prioridad', [ContingenciaController::class, 'cambiarPrioridad']);
    
    // Filtros y búsquedas de contingencias
        Route::get('contingencias/filtrar/estado/{estado}', [ContingenciaController::class, 'filtrarPorEstado']);
        Route::get('contingencias/filtrar/prioridad/{prioridad}', [ContingenciaController::class, 'filtrarPorPrioridad']);
        Route::get('contingencias/filtrar/tipo/{tipo}', [ContingenciaController::class, 'filtrarPorTipo']);
        Route::get('contingencias/filtrar/equipo/{equipo}', [ContingenciaController::class, 'filtrarPorEquipo']);
        Route::get('contingencias/filtrar/area/{area}', [ContingenciaController::class, 'filtrarPorArea']);
        Route::get('contingencias/filtrar/asignado/{usuario}', [ContingenciaController::class, 'filtrarPorAsignado']);
    
    // Estados específicos de contingencias
        Route::get('contingencias/abiertas', [ContingenciaController::class, 'abiertas']);
        Route::get('contingencias/criticas', [ContingenciaController::class, 'criticas']);
        Route::get('contingencias/vencidas', [ContingenciaController::class, 'vencidas']);
        Route::get('contingencias/resueltas', [ContingenciaController::class, 'resueltas']);
        Route::get('contingencias/mis-asignadas', [ContingenciaController::class, 'misAsignadas']);
        Route::get('contingencias/sin-asignar', [ContingenciaController::class, 'sinAsignar']);
    
    // Estadísticas de contingencias
        Route::get('contingencias/estadisticas/general', [ContingenciaController::class, 'estadisticasGenerales']);
        Route::get('contingencias/estadisticas/por-tipo', [ContingenciaController::class, 'estadisticasPorTipo']);
        Route::get('contingencias/estadisticas/por-area', [ContingenciaController::class, 'estadisticasPorArea']);
        Route::get('contingencias/estadisticas/tiempo-resolucion', [ContingenciaController::class, 'tiempoResolucion']);
        Route::get('contingencias/estadisticas/tendencias', [ContingenciaController::class, 'tendencias']);
    
    // Seguimiento y comentarios
        Route::get('contingencias/{id}/seguimiento', [ContingenciaController::class, 'seguimiento']);
        Route::post('contingencias/{id}/comentarios', [ContingenciaController::class, 'agregarComentario']);
        Route::get('contingencias/{id}/comentarios', [ContingenciaController::class, 'comentarios']);
        Route::put('contingencias/{id}/comentarios/{comentario}', [ContingenciaController::class, 'editarComentario']);
        Route::delete('contingencias/{id}/comentarios/{comentario}', [ContingenciaController::class, 'eliminarComentario']);
    
    // Archivos adjuntos
        Route::post('contingencias/{id}/archivos', [ContingenciaController::class, 'subirArchivo']);
        Route::get('contingencias/{id}/archivos', [ContingenciaController::class, 'archivos']);
        Route::delete('contingencias/{id}/archivos/{archivo}', [ContingenciaController::class, 'eliminarArchivo']);
    
    // CRUD de tickets
    Route::apiResource('tickets', TicketController::class);
    
    // Gestión específica de tickets
        Route::post('tickets/{id}/asignar', [TicketController::class, 'asignar']);
        Route::post('tickets/{id}/resolver', [TicketController::class, 'resolver']);
        Route::post('tickets/{id}/cerrar', [TicketController::class, 'cerrar']);
        Route::post('tickets/{id}/reabrir', [TicketController::class, 'reabrir']);
        Route::post('tickets/{id}/cambiar-categoria', [TicketController::class, 'cambiarCategoria']);
        Route::post('tickets/{id}/cambiar-prioridad', [TicketController::class, 'cambiarPrioridad']);
    
    // Filtros de tickets
        Route::get('tickets/filtrar/estado/{estado}', [TicketController::class, 'filtrarPorEstado']);
        Route::get('tickets/filtrar/categoria/{categoria}', [TicketController::class, 'filtrarPorCategoria']);
        Route::get('tickets/filtrar/prioridad/{prioridad}', [TicketController::class, 'filtrarPorPrioridad']);
        Route::get('tickets/filtrar/asignado/{usuario}', [TicketController::class, 'filtrarPorAsignado']);
    
    // Estados específicos de tickets
        Route::get('tickets/abiertos', [TicketController::class, 'abiertos']);
        Route::get('tickets/pendientes', [TicketController::class, 'pendientes']);
        Route::get('tickets/resueltos', [TicketController::class, 'resueltos']);
        Route::get('tickets/vencidos', [TicketController::class, 'vencidos']);
        Route::get('tickets/mis-tickets', [TicketController::class, 'misTickets']);
    
    // Estadísticas de tickets
        Route::get('tickets/estadisticas/general', [TicketController::class, 'estadisticasGenerales']);
        Route::get('tickets/estadisticas/por-categoria', [TicketController::class, 'estadisticasPorCategoria']);
        Route::get('tickets/estadisticas/tiempo-resolucion', [TicketController::class, 'tiempoResolucion']);
        Route::get('tickets/estadisticas/satisfaccion', [TicketController::class, 'satisfaccion']);
    
    // Seguimiento de tickets
        Route::get('tickets/{id}/historial', [TicketController::class, 'historial']);
        Route::post('tickets/{id}/comentarios', [TicketController::class, 'agregarComentario']);
        Route::get('tickets/{id}/comentarios', [TicketController::class, 'comentarios']);
    
    // Notificaciones y alertas
        Route::get('contingencias/alertas', [ContingenciaController::class, 'alertas']);
        Route::get('tickets/alertas', [TicketController::class, 'alertas']);
        Route::post('contingencias/notificar-vencimientos', [ContingenciaController::class, 'notificarVencimientos']);
        Route::post('tickets/notificar-vencimientos', [TicketController::class, 'notificarVencimientos']);
    
    // Configuración
        Route::get('contingencias/configuracion', [ContingenciaController::class, 'configuracion']);
        Route::put('contingencias/configuracion', [ContingenciaController::class, 'actualizarConfiguracion']);
        Route::get('tickets/configuracion', [TicketController::class, 'configuracion']);
        Route::put('tickets/configuracion', [TicketController::class, 'actualizarConfiguracion']);
});

});