<?php

/**
 * Rutas API - observaciones
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
use App\Http\Controllers\Api\ObservacionController;

/*
|--------------------------------------------------------------------------
| Observations Routes - Enterprise Level
|--------------------------------------------------------------------------
|
| Rutas para gestión de observaciones con respaldo automático
| y sistema de alta disponibilidad empresarial
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD básico de observaciones
    Route::apiResource('observaciones', ObservacionController::class);
    
    // Observaciones por entidad

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('observaciones/equipo/{equipoId}', [ObservacionController::class, 'porEquipo']);
        Route::get('observaciones/mantenimiento/{mantenimientoId}', [ObservacionController::class, 'porMantenimiento']);
        Route::get('observaciones/calibracion/{calibracionId}', [ObservacionController::class, 'porCalibracion']);
        Route::get('observaciones/contingencia/{contingenciaId}', [ObservacionController::class, 'porContingencia']);
        Route::get('observaciones/ticket/{ticketId}', [ObservacionController::class, 'porTicket']);
        Route::get('observaciones/usuario/{usuarioId}', [ObservacionController::class, 'porUsuario']);
        Route::get('observaciones/area/{areaId}', [ObservacionController::class, 'porArea']);
        Route::get('observaciones/servicio/{servicioId}', [ObservacionController::class, 'porServicio']);
    
    // Gestión de estado de observaciones
        Route::post('observaciones/{id}/cerrar', [ObservacionController::class, 'cerrar']);
        Route::post('observaciones/{id}/reabrir', [ObservacionController::class, 'reabrir']);
        Route::post('observaciones/{id}/archivar', [ObservacionController::class, 'archivar']);
        Route::post('observaciones/{id}/restaurar', [ObservacionController::class, 'restaurar']);
        Route::post('observaciones/{id}/marcar-importante', [ObservacionController::class, 'marcarImportante']);
        Route::post('observaciones/{id}/quitar-importancia', [ObservacionController::class, 'quitarImportancia']);
    
    // Asignación y seguimiento
        Route::post('observaciones/{id}/asignar', [ObservacionController::class, 'asignar']);
        Route::post('observaciones/{id}/reasignar', [ObservacionController::class, 'reasignar']);
        Route::post('observaciones/{id}/desasignar', [ObservacionController::class, 'desasignar']);
        Route::get('observaciones/{id}/seguimiento', [ObservacionController::class, 'seguimiento']);
        Route::post('observaciones/{id}/actualizar-progreso', [ObservacionController::class, 'actualizarProgreso']);
    
    // Comentarios y respuestas
        Route::get('observaciones/{id}/comentarios', [ObservacionController::class, 'comentarios']);
        Route::post('observaciones/{id}/comentarios', [ObservacionController::class, 'agregarComentario']);
        Route::put('observaciones/{id}/comentarios/{comentarioId}', [ObservacionController::class, 'editarComentario']);
        Route::delete('observaciones/{id}/comentarios/{comentarioId}', [ObservacionController::class, 'eliminarComentario']);
        Route::post('observaciones/{id}/comentarios/{comentarioId}/responder', [ObservacionController::class, 'responderComentario']);
    
    // Archivos adjuntos
        Route::get('observaciones/{id}/archivos', [ObservacionController::class, 'archivos']);
        Route::post('observaciones/{id}/archivos', [ObservacionController::class, 'subirArchivo']);
        Route::get('observaciones/{id}/archivos/{archivoId}/descargar', [ObservacionController::class, 'descargarArchivo']);
        Route::delete('observaciones/{id}/archivos/{archivoId}', [ObservacionController::class, 'eliminarArchivo']);
        Route::post('observaciones/{id}/archivos/{archivoId}/marcar-principal', [ObservacionController::class, 'marcarArchivoPrincipal']);
    
    // Categorización y etiquetado
        Route::get('observaciones/categorias', [ObservacionController::class, 'categorias']);
        Route::post('observaciones/categorias', [ObservacionController::class, 'crearCategoria']);
        Route::put('observaciones/categorias/{id}', [ObservacionController::class, 'actualizarCategoria']);
        Route::delete('observaciones/categorias/{id}', [ObservacionController::class, 'eliminarCategoria']);
        Route::post('observaciones/{id}/cambiar-categoria', [ObservacionController::class, 'cambiarCategoria']);
    
        Route::get('observaciones/etiquetas', [ObservacionController::class, 'etiquetas']);
        Route::post('observaciones/etiquetas', [ObservacionController::class, 'crearEtiqueta']);
        Route::put('observaciones/etiquetas/{id}', [ObservacionController::class, 'actualizarEtiqueta']);
        Route::delete('observaciones/etiquetas/{id}', [ObservacionController::class, 'eliminarEtiqueta']);
        Route::post('observaciones/{id}/agregar-etiqueta', [ObservacionController::class, 'agregarEtiqueta']);
        Route::delete('observaciones/{id}/quitar-etiqueta/{etiquetaId}', [ObservacionController::class, 'quitarEtiqueta']);
    
    // Prioridad y urgencia
        Route::post('observaciones/{id}/cambiar-prioridad', [ObservacionController::class, 'cambiarPrioridad']);
        Route::post('observaciones/{id}/marcar-urgente', [ObservacionController::class, 'marcarUrgente']);
        Route::post('observaciones/{id}/quitar-urgencia', [ObservacionController::class, 'quitarUrgencia']);
        Route::get('observaciones/urgentes', [ObservacionController::class, 'urgentes']);
        Route::get('observaciones/alta-prioridad', [ObservacionController::class, 'altaPrioridad']);
    
    // Filtros y búsquedas
        Route::get('observaciones/buscar/{termino}', [ObservacionController::class, 'buscar']);
        Route::post('observaciones/busqueda-avanzada', [ObservacionController::class, 'busquedaAvanzada']);
        Route::get('observaciones/filtrar/estado/{estado}', [ObservacionController::class, 'filtrarPorEstado']);
        Route::get('observaciones/filtrar/categoria/{categoria}', [ObservacionController::class, 'filtrarPorCategoria']);
        Route::get('observaciones/filtrar/prioridad/{prioridad}', [ObservacionController::class, 'filtrarPorPrioridad']);
        Route::get('observaciones/filtrar/asignado/{usuarioId}', [ObservacionController::class, 'filtrarPorAsignado']);
        Route::get('observaciones/filtrar/fecha/{fecha}', [ObservacionController::class, 'filtrarPorFecha']);
    
    // Estados específicos
        Route::get('observaciones/abiertas', [ObservacionController::class, 'abiertas']);
        Route::get('observaciones/cerradas', [ObservacionController::class, 'cerradas']);
        Route::get('observaciones/archivadas', [ObservacionController::class, 'archivadas']);
        Route::get('observaciones/sin-asignar', [ObservacionController::class, 'sinAsignar']);
        Route::get('observaciones/vencidas', [ObservacionController::class, 'vencidas']);
        Route::get('observaciones/proximas-vencer', [ObservacionController::class, 'proximasVencer']);
        Route::get('observaciones/importantes', [ObservacionController::class, 'importantes']);
        Route::get('observaciones/mis-observaciones', [ObservacionController::class, 'misObservaciones']);
        Route::get('observaciones/mis-asignadas', [ObservacionController::class, 'misAsignadas']);
    
    // Estadísticas y reportes
        Route::get('observaciones/estadisticas', [ObservacionController::class, 'estadisticas']);
        Route::get('observaciones/estadisticas/general', [ObservacionController::class, 'estadisticasGenerales']);
        Route::get('observaciones/estadisticas/por-categoria', [ObservacionController::class, 'estadisticasPorCategoria']);
        Route::get('observaciones/estadisticas/por-usuario', [ObservacionController::class, 'estadisticasPorUsuario']);
        Route::get('observaciones/estadisticas/por-equipo', [ObservacionController::class, 'estadisticasPorEquipo']);
        Route::get('observaciones/estadisticas/tiempo-resolucion', [ObservacionController::class, 'estadisticasTiempoResolucion']);
        Route::get('observaciones/estadisticas/tendencias', [ObservacionController::class, 'estadisticasTendencias']);
    
    // Notificaciones y alertas
        Route::get('observaciones/alertas', [ObservacionController::class, 'alertas']);
        Route::post('observaciones/configurar-alertas', [ObservacionController::class, 'configurarAlertas']);
        Route::post('observaciones/{id}/notificar-asignado', [ObservacionController::class, 'notificarAsignado']);
        Route::post('observaciones/{id}/notificar-vencimiento', [ObservacionController::class, 'notificarVencimiento']);
        Route::post('observaciones/notificar-vencimientos-masivo', [ObservacionController::class, 'notificarVencimientosMasivo']);
    
    // Plantillas y formularios
        Route::get('observaciones/plantillas', [ObservacionController::class, 'plantillas']);
        Route::post('observaciones/plantillas', [ObservacionController::class, 'crearPlantilla']);
        Route::put('observaciones/plantillas/{id}', [ObservacionController::class, 'actualizarPlantilla']);
        Route::delete('observaciones/plantillas/{id}', [ObservacionController::class, 'eliminarPlantilla']);
        Route::post('observaciones/crear-desde-plantilla/{plantillaId}', [ObservacionController::class, 'crearDesdePlantilla']);
    
    // Operaciones masivas
        Route::post('observaciones/cerrar-masivo', [ObservacionController::class, 'cerrarMasivo']);
        Route::post('observaciones/asignar-masivo', [ObservacionController::class, 'asignarMasivo']);
        Route::post('observaciones/cambiar-categoria-masivo', [ObservacionController::class, 'cambiarCategoriaMasivo']);
        Route::post('observaciones/cambiar-prioridad-masivo', [ObservacionController::class, 'cambiarPrioridadMasivo']);
        Route::post('observaciones/archivar-masivo', [ObservacionController::class, 'archivarMasivo']);
        Route::delete('observaciones/eliminar-masivo', [ObservacionController::class, 'eliminarMasivo']);
    
    // Exportación e importación
        Route::post('observaciones/exportar', [ObservacionController::class, 'exportar']);
        Route::post('observaciones/importar', [ObservacionController::class, 'importar']);
        Route::get('observaciones/plantilla-importacion', [ObservacionController::class, 'plantillaImportacion']);
        Route::post('observaciones/validar-importacion', [ObservacionController::class, 'validarImportacion']);
    
    // Integración con otros módulos
        Route::post('observaciones/crear-desde-equipo/{equipoId}', [ObservacionController::class, 'crearDesdeEquipo']);
        Route::post('observaciones/crear-desde-mantenimiento/{mantenimientoId}', [ObservacionController::class, 'crearDesdeMantenimiento']);
        Route::post('observaciones/crear-desde-contingencia/{contingenciaId}', [ObservacionController::class, 'crearDesdeContingencia']);
        Route::post('observaciones/convertir-a-ticket/{id}', [ObservacionController::class, 'convertirATicket']);
        Route::post('observaciones/convertir-a-contingencia/{id}', [ObservacionController::class, 'convertirAContingencia']);
    
    // Configuración
        Route::get('observaciones/configuracion', [ObservacionController::class, 'configuracion']);
        Route::put('observaciones/configuracion', [ObservacionController::class, 'actualizarConfiguracion']);
        Route::get('observaciones/configuracion/flujos-trabajo', [ObservacionController::class, 'flujosTrabajoDisponibles']);
        Route::post('observaciones/configuracion/flujos-trabajo', [ObservacionController::class, 'crearFlujoTrabajo']);
        Route::put('observaciones/configuracion/flujos-trabajo/{id}', [ObservacionController::class, 'actualizarFlujoTrabajo']);
        Route::delete('observaciones/configuracion/flujos-trabajo/{id}', [ObservacionController::class, 'eliminarFlujoTrabajo']);
    
    // Auditoría de observaciones
        Route::get('observaciones/{id}/auditoria', [ObservacionController::class, 'auditoriaObservacion']);
        Route::get('observaciones/{id}/historial-cambios', [ObservacionController::class, 'historialCambios']);
        Route::get('observaciones/{id}/log-actividad', [ObservacionController::class, 'logActividad']);
});

});