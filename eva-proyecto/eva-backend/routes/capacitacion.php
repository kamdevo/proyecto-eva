<?php

/**
 * Rutas API - capacitacion
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
use App\Http\Controllers\Api\CapacitacionController;
use App\Http\Controllers\Api\GuiaRapidaController;

/*
|--------------------------------------------------------------------------
| Training Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de capacitación y guías rápidas
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD de capacitaciones
    Route::apiResource('capacitacion', CapacitacionController::class);
    
    // Gestión de capacitaciones

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('capacitacion/{id}/participantes', [CapacitacionController::class, 'participantes']);
        Route::post('capacitacion/{id}/inscribir', [CapacitacionController::class, 'inscribir']);
        Route::delete('capacitacion/{id}/desinscribir/{usuario}', [CapacitacionController::class, 'desinscribir']);
        Route::post('capacitacion/{id}/iniciar', [CapacitacionController::class, 'iniciar']);
        Route::post('capacitacion/{id}/finalizar', [CapacitacionController::class, 'finalizar']);
        Route::post('capacitacion/{id}/cancelar', [CapacitacionController::class, 'cancelar']);
        Route::post('capacitacion/{id}/reprogramar', [CapacitacionController::class, 'reprogramar']);
    
    // Asistencia y evaluación
        Route::get('capacitacion/{id}/asistencia', [CapacitacionController::class, 'asistencia']);
        Route::post('capacitacion/{id}/marcar-asistencia', [CapacitacionController::class, 'marcarAsistencia']);
        Route::get('capacitacion/{id}/evaluaciones', [CapacitacionController::class, 'evaluaciones']);
        Route::post('capacitacion/{id}/evaluar', [CapacitacionController::class, 'evaluar']);
        Route::get('capacitacion/{id}/certificados', [CapacitacionController::class, 'certificados']);
        Route::post('capacitacion/{id}/generar-certificado/{usuario}', [CapacitacionController::class, 'generarCertificado']);
    
    // Filtros y búsquedas de capacitaciones
        Route::get('capacitacion/buscar/{termino}', [CapacitacionController::class, 'buscar']);
        Route::get('capacitacion/filtrar/estado/{estado}', [CapacitacionController::class, 'filtrarPorEstado']);
        Route::get('capacitacion/filtrar/tipo/{tipo}', [CapacitacionController::class, 'filtrarPorTipo']);
        Route::get('capacitacion/filtrar/instructor/{instructor}', [CapacitacionController::class, 'filtrarPorInstructor']);
        Route::get('capacitacion/filtrar/area/{area}', [CapacitacionController::class, 'filtrarPorArea']);
        Route::get('capacitacion/programadas', [CapacitacionController::class, 'programadas']);
        Route::get('capacitacion/en-curso', [CapacitacionController::class, 'enCurso']);
        Route::get('capacitacion/finalizadas', [CapacitacionController::class, 'finalizadas']);
        Route::get('capacitacion/mis-capacitaciones', [CapacitacionController::class, 'misCapacitaciones']);
    
    // Materiales de capacitación
        Route::get('capacitacion/{id}/materiales', [CapacitacionController::class, 'materiales']);
        Route::post('capacitacion/{id}/materiales', [CapacitacionController::class, 'subirMaterial']);
        Route::delete('capacitacion/{id}/materiales/{material}', [CapacitacionController::class, 'eliminarMaterial']);
        Route::get('capacitacion/{id}/materiales/{material}/descargar', [CapacitacionController::class, 'descargarMaterial']);
    
    // Calendario de capacitaciones
        Route::get('capacitacion/calendario', [CapacitacionController::class, 'calendario']);
        Route::get('capacitacion/calendario/{fecha}', [CapacitacionController::class, 'calendarioPorFecha']);
        Route::get('capacitacion/disponibilidad/{fecha}', [CapacitacionController::class, 'disponibilidad']);
    
    // Estadísticas de capacitación
        Route::get('capacitacion/estadisticas/general', [CapacitacionController::class, 'estadisticasGenerales']);
        Route::get('capacitacion/estadisticas/participacion', [CapacitacionController::class, 'estadisticasParticipacion']);
        Route::get('capacitacion/estadisticas/efectividad', [CapacitacionController::class, 'estadisticasEfectividad']);
        Route::get('capacitacion/estadisticas/por-area', [CapacitacionController::class, 'estadisticasPorArea']);
        Route::get('capacitacion/estadisticas/por-instructor', [CapacitacionController::class, 'estadisticasPorInstructor']);
    
    // CRUD de guías rápidas
    Route::apiResource('guias-rapidas', GuiaRapidaController::class);
    
    // Gestión de guías rápidas
        Route::post('guias-rapidas/{id}/toggle-status', [GuiaRapidaController::class, 'toggleStatus']);
        Route::get('guias-rapidas/{id}/versiones', [GuiaRapidaController::class, 'versiones']);
        Route::post('guias-rapidas/{id}/nueva-version', [GuiaRapidaController::class, 'nuevaVersion']);
        Route::post('guias-rapidas/{id}/publicar', [GuiaRapidaController::class, 'publicar']);
        Route::post('guias-rapidas/{id}/archivar', [GuiaRapidaController::class, 'archivar']);
    
    // Filtros y búsquedas de guías
        Route::get('guias-rapidas/buscar/{termino}', [GuiaRapidaController::class, 'buscar']);
        Route::get('guias-rapidas/filtrar/categoria/{categoria}', [GuiaRapidaController::class, 'filtrarPorCategoria']);
        Route::get('guias-rapidas/filtrar/equipo/{equipo}', [GuiaRapidaController::class, 'filtrarPorEquipo']);
        Route::get('guias-rapidas/filtrar/area/{area}', [GuiaRapidaController::class, 'filtrarPorArea']);
        Route::get('guias-rapidas/publicadas', [GuiaRapidaController::class, 'publicadas']);
        Route::get('guias-rapidas/borradores', [GuiaRapidaController::class, 'borradores']);
        Route::get('guias-rapidas/archivadas', [GuiaRapidaController::class, 'archivadas']);
    
    // Interacción con guías
        Route::get('guias-rapidas/{id}/visualizaciones', [GuiaRapidaController::class, 'visualizaciones']);
        Route::post('guias-rapidas/{id}/marcar-vista', [GuiaRapidaController::class, 'marcarVista']);
        Route::get('guias-rapidas/{id}/comentarios', [GuiaRapidaController::class, 'comentarios']);
        Route::post('guias-rapidas/{id}/comentarios', [GuiaRapidaController::class, 'agregarComentario']);
        Route::post('guias-rapidas/{id}/valorar', [GuiaRapidaController::class, 'valorar']);
        Route::get('guias-rapidas/{id}/valoraciones', [GuiaRapidaController::class, 'valoraciones']);
    
    // Categorías de guías
        Route::get('guias-rapidas/categorias', [GuiaRapidaController::class, 'categorias']);
        Route::post('guias-rapidas/categorias', [GuiaRapidaController::class, 'crearCategoria']);
        Route::put('guias-rapidas/categorias/{id}', [GuiaRapidaController::class, 'actualizarCategoria']);
        Route::delete('guias-rapidas/categorias/{id}', [GuiaRapidaController::class, 'eliminarCategoria']);
    
    // Estadísticas de guías
        Route::get('guias-rapidas/estadisticas/general', [GuiaRapidaController::class, 'estadisticasGenerales']);
        Route::get('guias-rapidas/estadisticas/uso', [GuiaRapidaController::class, 'estadisticasUso']);
        Route::get('guias-rapidas/estadisticas/valoraciones', [GuiaRapidaController::class, 'estadisticasValoraciones']);
        Route::get('guias-rapidas/mas-vistas', [GuiaRapidaController::class, 'masVistas']);
        Route::get('guias-rapidas/mejor-valoradas', [GuiaRapidaController::class, 'mejorValoradas']);
    
    // Plantillas y formatos
        Route::get('capacitacion/plantillas', [CapacitacionController::class, 'plantillas']);
        Route::post('capacitacion/plantillas', [CapacitacionController::class, 'crearPlantilla']);
        Route::put('capacitacion/plantillas/{id}', [CapacitacionController::class, 'actualizarPlantilla']);
        Route::delete('capacitacion/plantillas/{id}', [CapacitacionController::class, 'eliminarPlantilla']);
    
    // Configuración
        Route::get('capacitacion/configuracion', [CapacitacionController::class, 'configuracion']);
        Route::put('capacitacion/configuracion', [CapacitacionController::class, 'actualizarConfiguracion']);
        Route::get('guias-rapidas/configuracion', [GuiaRapidaController::class, 'configuracion']);
        Route::put('guias-rapidas/configuracion', [GuiaRapidaController::class, 'actualizarConfiguracion']);
});

});