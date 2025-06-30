<?php

/**
 * Rutas API - auditoria
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
use App\Http\Controllers\Api\AuditoriaController;

/*
|--------------------------------------------------------------------------
| Audit Routes - Enterprise Level
|--------------------------------------------------------------------------
|
| Rutas para auditoría y trazabilidad con respaldo automático
| y sistema de alta disponibilidad empresarial
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Registro de auditoría principal

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('auditoria/registro', [AuditoriaController::class, 'registroAuditoria']);
        Route::get('auditoria/registro/filtrado', [AuditoriaController::class, 'registroFiltrado']);
        Route::get('auditoria/registro/buscar', [AuditoriaController::class, 'buscarEnRegistro']);
        Route::post('auditoria/registro/exportar', [AuditoriaController::class, 'exportarRegistro']);
    
    // Dashboard de auditoría
        Route::get('auditoria/dashboard', [AuditoriaController::class, 'dashboardAuditoria']);
        Route::get('auditoria/dashboard/resumen', [AuditoriaController::class, 'resumenAuditoria']);
        Route::get('auditoria/dashboard/metricas', [AuditoriaController::class, 'metricasAuditoria']);
        Route::get('auditoria/dashboard/graficos', [AuditoriaController::class, 'graficosAuditoria']);
    
    // Trazabilidad de entidades
        Route::get('auditoria/trazabilidad/{tabla}/{id}', [AuditoriaController::class, 'trazabilidadEntidad']);
        Route::get('auditoria/trazabilidad/{tabla}/{id}/detallada', [AuditoriaController::class, 'trazabilidadDetallada']);
        Route::get('auditoria/trazabilidad/{tabla}/{id}/cronologia', [AuditoriaController::class, 'cronologiaEntidad']);
        Route::get('auditoria/trazabilidad/{tabla}/{id}/cambios', [AuditoriaController::class, 'cambiosEntidad']);
        Route::get('auditoria/trazabilidad/{tabla}/{id}/usuarios', [AuditoriaController::class, 'usuariosQueModificaron']);
    
    // Análisis de seguridad
        Route::post('auditoria/analisis-seguridad', [AuditoriaController::class, 'analisisSeguridad']);
        Route::get('auditoria/analisis-seguridad/intentos-acceso', [AuditoriaController::class, 'intentosAccesoSospechosos']);
        Route::get('auditoria/analisis-seguridad/patrones-anomalos', [AuditoriaController::class, 'patronesAnomalos']);
        Route::get('auditoria/analisis-seguridad/actividad-inusual', [AuditoriaController::class, 'actividadInusual']);
        Route::post('auditoria/analisis-seguridad/generar-reporte', [AuditoriaController::class, 'generarReporteSeguridad']);
    
    // Exportación de logs
        Route::post('auditoria/exportar-logs', [AuditoriaController::class, 'exportarLogs']);
        Route::post('auditoria/exportar-logs/rango', [AuditoriaController::class, 'exportarLogsPorRango']);
        Route::post('auditoria/exportar-logs/usuario', [AuditoriaController::class, 'exportarLogsPorUsuario']);
        Route::post('auditoria/exportar-logs/entidad', [AuditoriaController::class, 'exportarLogsPorEntidad']);
        Route::get('auditoria/exportaciones', [AuditoriaController::class, 'historialExportaciones']);
        Route::get('auditoria/exportaciones/{id}/descargar', [AuditoriaController::class, 'descargarExportacion']);
    
    // Eventos críticos
        Route::get('auditoria/eventos-criticos', [AuditoriaController::class, 'eventosCriticos']);
        Route::get('auditoria/eventos-criticos/sin-revisar', [AuditoriaController::class, 'eventosCriticosSinRevisar']);
        Route::get('auditoria/eventos-criticos/por-tipo', [AuditoriaController::class, 'eventosCriticosPorTipo']);
        Route::get('auditoria/eventos-criticos/recientes', [AuditoriaController::class, 'eventosCriticosRecientes']);
        Route::post('auditoria/eventos-criticos/{id}/marcar-revisado', [AuditoriaController::class, 'marcarEventoRevisado']);
        Route::post('auditoria/eventos-criticos/marcar-todos-revisados', [AuditoriaController::class, 'marcarTodosEventosRevisados']);
    
    // Marcado de revisión
        Route::post('auditoria/marcar-revisado', [AuditoriaController::class, 'marcarRevisado']);
        Route::post('auditoria/marcar-revisado/lote', [AuditoriaController::class, 'marcarRevisadoLote']);
        Route::get('auditoria/pendientes-revision', [AuditoriaController::class, 'pendientesRevision']);
        Route::get('auditoria/revisados', [AuditoriaController::class, 'registrosRevisados']);
    
    // Estadísticas por usuario
        Route::get('auditoria/estadisticas-usuario/{usuarioId}', [AuditoriaController::class, 'estadisticasUsuario']);
        Route::get('auditoria/estadisticas-usuario/{usuarioId}/actividad', [AuditoriaController::class, 'actividadUsuario']);
        Route::get('auditoria/estadisticas-usuario/{usuarioId}/accesos', [AuditoriaController::class, 'accesosUsuario']);
        Route::get('auditoria/estadisticas-usuario/{usuarioId}/modificaciones', [AuditoriaController::class, 'modificacionesUsuario']);
        Route::get('auditoria/estadisticas-usuario/{usuarioId}/errores', [AuditoriaController::class, 'erroresUsuario']);
    
    // Generación de reportes
        Route::post('auditoria/generar-reporte', [AuditoriaController::class, 'generarReporte']);
        Route::post('auditoria/generar-reporte/personalizado', [AuditoriaController::class, 'generarReportePersonalizado']);
        Route::post('auditoria/generar-reporte/cumplimiento', [AuditoriaController::class, 'generarReporteCumplimiento']);
        Route::post('auditoria/generar-reporte/actividad', [AuditoriaController::class, 'generarReporteActividad']);
        Route::get('auditoria/reportes', [AuditoriaController::class, 'listarReportes']);
        Route::get('auditoria/reportes/{id}', [AuditoriaController::class, 'detalleReporte']);
        Route::get('auditoria/reportes/{id}/descargar', [AuditoriaController::class, 'descargarReporte']);
        Route::delete('auditoria/reportes/{id}', [AuditoriaController::class, 'eliminarReporte']);
    
    // Alertas de seguridad
        Route::get('auditoria/alertas-seguridad', [AuditoriaController::class, 'alertasSeguridad']);
        Route::get('auditoria/alertas-seguridad/activas', [AuditoriaController::class, 'alertasSeguridadActivas']);
        Route::get('auditoria/alertas-seguridad/criticas', [AuditoriaController::class, 'alertasSeguridadCriticas']);
        Route::post('auditoria/alertas-seguridad/{id}/resolver', [AuditoriaController::class, 'resolverAlertaSeguridad']);
        Route::post('auditoria/alertas-seguridad/{id}/escalar', [AuditoriaController::class, 'escalarAlertaSeguridad']);
        Route::post('auditoria/alertas-seguridad/configurar', [AuditoriaController::class, 'configurarAlertasSeguridad']);
    
    // Configuración de auditoría
        Route::get('auditoria/configuracion', [AuditoriaController::class, 'configuracionAuditoria']);
        Route::put('auditoria/configuracion', [AuditoriaController::class, 'actualizarConfiguracionAuditoria']);
        Route::get('auditoria/configuracion/reglas', [AuditoriaController::class, 'reglasAuditoria']);
        Route::post('auditoria/configuracion/reglas', [AuditoriaController::class, 'crearReglaAuditoria']);
        Route::put('auditoria/configuracion/reglas/{id}', [AuditoriaController::class, 'actualizarReglaAuditoria']);
        Route::delete('auditoria/configuracion/reglas/{id}', [AuditoriaController::class, 'eliminarReglaAuditoria']);
    
    // Retención de datos
        Route::get('auditoria/retencion', [AuditoriaController::class, 'politicasRetencion']);
        Route::put('auditoria/retencion', [AuditoriaController::class, 'actualizarPoliticasRetencion']);
        Route::post('auditoria/retencion/aplicar', [AuditoriaController::class, 'aplicarPoliticasRetencion']);
        Route::get('auditoria/retencion/estadisticas', [AuditoriaController::class, 'estadisticasRetencion']);
    
    // Integridad de datos
        Route::post('auditoria/verificar-integridad', [AuditoriaController::class, 'verificarIntegridad']);
        Route::get('auditoria/integridad/reporte', [AuditoriaController::class, 'reporteIntegridad']);
        Route::post('auditoria/integridad/reparar', [AuditoriaController::class, 'repararIntegridad']);
    
    // Monitoreo en tiempo real
        Route::get('auditoria/monitoreo/tiempo-real', [AuditoriaController::class, 'monitoreoTiempoReal']);
        Route::get('auditoria/monitoreo/eventos-recientes', [AuditoriaController::class, 'eventosRecientes']);
        Route::get('auditoria/monitoreo/actividad-actual', [AuditoriaController::class, 'actividadActual']);
    
    // Cumplimiento normativo
        Route::get('auditoria/cumplimiento', [AuditoriaController::class, 'estadoCumplimiento']);
        Route::get('auditoria/cumplimiento/normativas', [AuditoriaController::class, 'normativasAplicables']);
        Route::post('auditoria/cumplimiento/evaluar', [AuditoriaController::class, 'evaluarCumplimiento']);
        Route::get('auditoria/cumplimiento/reporte', [AuditoriaController::class, 'reporteCumplimiento']);
    
    // Backup y recuperación de auditoría
        Route::post('auditoria/backup', [AuditoriaController::class, 'crearBackupAuditoria']);
        Route::get('auditoria/backups', [AuditoriaController::class, 'listarBackupsAuditoria']);
        Route::post('auditoria/backups/{id}/restaurar', [AuditoriaController::class, 'restaurarBackupAuditoria']);
        Route::delete('auditoria/backups/{id}', [AuditoriaController::class, 'eliminarBackupAuditoria']);

    // Análisis forense
        Route::post('auditoria/forense/iniciar', [AuditoriaController::class, 'iniciarAnalisisForense']);
        Route::get('auditoria/forense/{id}', [AuditoriaController::class, 'estadoAnalisisForense']);
        Route::get('auditoria/forense/{id}/resultados', [AuditoriaController::class, 'resultadosAnalisisForense']);
        Route::post('auditoria/forense/{id}/finalizar', [AuditoriaController::class, 'finalizarAnalisisForense']);
});

});