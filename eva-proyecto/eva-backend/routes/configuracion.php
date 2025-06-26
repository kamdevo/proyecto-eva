<?php

/**
 * Rutas API - configuracion
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
use App\Http\Controllers\Api\ConfiguracionController;

/*
|--------------------------------------------------------------------------
| Configuration Routes - Enterprise Level
|--------------------------------------------------------------------------
|
| Rutas para configuración del sistema con respaldo automático
| y alta disponibilidad empresarial
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Configuración general del sistema

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('configuracion/general', [ConfiguracionController::class, 'configuracionGeneral']);
        Route::put('configuracion/general', [ConfiguracionController::class, 'actualizarConfiguracionGeneral']);
        Route::post('configuracion/reset-general', [ConfiguracionController::class, 'resetearConfiguracionGeneral']);
    
    // Parámetros del sistema
        Route::get('configuracion/parametros', [ConfiguracionController::class, 'parametrosSistema']);
        Route::put('configuracion/parametros', [ConfiguracionController::class, 'actualizarParametros']);
        Route::get('configuracion/parametros/categoria/{categoria}', [ConfiguracionController::class, 'parametrosPorCategoria']);
        Route::post('configuracion/parametros/validar', [ConfiguracionController::class, 'validarParametros']);
    
    // Configuración de notificaciones
        Route::get('configuracion/notificaciones', [ConfiguracionController::class, 'configuracionNotificaciones']);
        Route::put('configuracion/notificaciones', [ConfiguracionController::class, 'actualizarNotificaciones']);
        Route::post('configuracion/notificaciones/test', [ConfiguracionController::class, 'testNotificaciones']);
        Route::get('configuracion/notificaciones/plantillas', [ConfiguracionController::class, 'plantillasNotificaciones']);
        Route::post('configuracion/notificaciones/plantillas', [ConfiguracionController::class, 'crearPlantillaNotificacion']);
    
    // Configuración de mantenimientos
        Route::get('configuracion/mantenimientos', [ConfiguracionController::class, 'configuracionMantenimientos']);
        Route::put('configuracion/mantenimientos', [ConfiguracionController::class, 'actualizarConfiguracionMantenimientos']);
        Route::get('configuracion/mantenimientos/tipos', [ConfiguracionController::class, 'tiposMantenimiento']);
        Route::post('configuracion/mantenimientos/tipos', [ConfiguracionController::class, 'crearTipoMantenimiento']);
        Route::put('configuracion/mantenimientos/tipos/{id}', [ConfiguracionController::class, 'actualizarTipoMantenimiento']);
        Route::delete('configuracion/mantenimientos/tipos/{id}', [ConfiguracionController::class, 'eliminarTipoMantenimiento']);
    
    // Estado del sistema
        Route::get('configuracion/estado-sistema', [ConfiguracionController::class, 'estadoSistema']);
        Route::get('configuracion/estado-sistema/detallado', [ConfiguracionController::class, 'estadoSistemaDetallado']);
        Route::get('configuracion/estado-sistema/servicios', [ConfiguracionController::class, 'estadoServicios']);
        Route::get('configuracion/estado-sistema/base-datos', [ConfiguracionController::class, 'estadoBaseDatos']);
        Route::get('configuracion/estado-sistema/almacenamiento', [ConfiguracionController::class, 'estadoAlmacenamiento']);
    
    // Mantenimiento del sistema
        Route::post('configuracion/mantenimiento-sistema', [ConfiguracionController::class, 'mantenimientoSistema']);
        Route::post('configuracion/limpiar-cache', [ConfiguracionController::class, 'limpiarCache']);
        Route::post('configuracion/optimizar-base-datos', [ConfiguracionController::class, 'optimizarBaseDatos']);
        Route::post('configuracion/limpiar-logs', [ConfiguracionController::class, 'limpiarLogs']);
        Route::post('configuracion/limpiar-archivos-temporales', [ConfiguracionController::class, 'limpiarArchivosTemporales']);
    
    // Gestión de backups
        Route::get('configuracion/backups', [ConfiguracionController::class, 'listarBackups']);
        Route::post('configuracion/backups', [ConfiguracionController::class, 'crearBackup']);
        Route::get('configuracion/backups/{id}', [ConfiguracionController::class, 'detalleBackup']);
        Route::post('configuracion/backups/{id}/restaurar', [ConfiguracionController::class, 'restaurarBackup']);
        Route::delete('configuracion/backups/{id}', [ConfiguracionController::class, 'eliminarBackup']);
        Route::post('configuracion/backups/programar', [ConfiguracionController::class, 'programarBackup']);
        Route::get('configuracion/backups/programados', [ConfiguracionController::class, 'backupsProgramados']);
        Route::put('configuracion/backups/programados/{id}', [ConfiguracionController::class, 'actualizarBackupProgramado']);
        Route::delete('configuracion/backups/programados/{id}', [ConfiguracionController::class, 'cancelarBackupProgramado']);
    
    // Logs del sistema
        Route::get('configuracion/logs', [ConfiguracionController::class, 'logsSistema']);
        Route::get('configuracion/logs/aplicacion', [ConfiguracionController::class, 'logsAplicacion']);
        Route::get('configuracion/logs/errores', [ConfiguracionController::class, 'logsErrores']);
        Route::get('configuracion/logs/acceso', [ConfiguracionController::class, 'logsAcceso']);
        Route::get('configuracion/logs/auditoria', [ConfiguracionController::class, 'logsAuditoria']);
        Route::post('configuracion/logs/exportar', [ConfiguracionController::class, 'exportarLogs']);
        Route::delete('configuracion/logs/limpiar', [ConfiguracionController::class, 'limpiarLogsAntiguos']);
    
    // Test de conexiones
        Route::post('configuracion/test-conexiones', [ConfiguracionController::class, 'testConexiones']);
        Route::post('configuracion/test-base-datos', [ConfiguracionController::class, 'testBaseDatos']);
        Route::post('configuracion/test-email', [ConfiguracionController::class, 'testEmail']);
        Route::post('configuracion/test-almacenamiento', [ConfiguracionController::class, 'testAlmacenamiento']);
        Route::post('configuracion/test-apis-externas', [ConfiguracionController::class, 'testApisExternas']);
    
    // Configuración de seguridad
        Route::get('configuracion/seguridad', [ConfiguracionController::class, 'configuracionSeguridad']);
        Route::put('configuracion/seguridad', [ConfiguracionController::class, 'actualizarConfiguracionSeguridad']);
        Route::post('configuracion/seguridad/regenerar-claves', [ConfiguracionController::class, 'regenerarClaves']);
        Route::get('configuracion/seguridad/politicas', [ConfiguracionController::class, 'politicasSeguridad']);
        Route::put('configuracion/seguridad/politicas', [ConfiguracionController::class, 'actualizarPoliticasSeguridad']);
    
    // Configuración de rendimiento
        Route::get('configuracion/rendimiento', [ConfiguracionController::class, 'configuracionRendimiento']);
        Route::put('configuracion/rendimiento', [ConfiguracionController::class, 'actualizarConfiguracionRendimiento']);
        Route::get('configuracion/rendimiento/metricas', [ConfiguracionController::class, 'metricasRendimiento']);
        Route::post('configuracion/rendimiento/optimizar', [ConfiguracionController::class, 'optimizarRendimiento']);
    
    // Configuración de integración
        Route::get('configuracion/integraciones', [ConfiguracionController::class, 'configuracionIntegraciones']);
        Route::put('configuracion/integraciones', [ConfiguracionController::class, 'actualizarConfiguracionIntegraciones']);
        Route::post('configuracion/integraciones/{servicio}/test', [ConfiguracionController::class, 'testIntegracion']);
        Route::post('configuracion/integraciones/{servicio}/sincronizar', [ConfiguracionController::class, 'sincronizarIntegracion']);
    
    // Configuración de usuarios y permisos
        Route::get('configuracion/usuarios', [ConfiguracionController::class, 'configuracionUsuarios']);
        Route::put('configuracion/usuarios', [ConfiguracionController::class, 'actualizarConfiguracionUsuarios']);
        Route::get('configuracion/roles', [ConfiguracionController::class, 'configuracionRoles']);
        Route::post('configuracion/roles', [ConfiguracionController::class, 'crearRol']);
        Route::put('configuracion/roles/{id}', [ConfiguracionController::class, 'actualizarRol']);
        Route::delete('configuracion/roles/{id}', [ConfiguracionController::class, 'eliminarRol']);
        Route::get('configuracion/permisos', [ConfiguracionController::class, 'configuracionPermisos']);
    
    // Configuración de módulos
        Route::get('configuracion/modulos', [ConfiguracionController::class, 'configuracionModulos']);
        Route::put('configuracion/modulos/{modulo}/toggle', [ConfiguracionController::class, 'toggleModulo']);
        Route::get('configuracion/modulos/{modulo}/configuracion', [ConfiguracionController::class, 'configuracionModulo']);
        Route::put('configuracion/modulos/{modulo}/configuracion', [ConfiguracionController::class, 'actualizarConfiguracionModulo']);
    
    // Importación y exportación de configuración
        Route::post('configuracion/exportar', [ConfiguracionController::class, 'exportarConfiguracion']);
        Route::post('configuracion/importar', [ConfiguracionController::class, 'importarConfiguracion']);
        Route::post('configuracion/validar-importacion', [ConfiguracionController::class, 'validarImportacion']);
        Route::post('configuracion/reset-completo', [ConfiguracionController::class, 'resetCompleto']);
    
    // Configuración de ambiente
        Route::get('configuracion/ambiente', [ConfiguracionController::class, 'configuracionAmbiente']);
        Route::put('configuracion/ambiente', [ConfiguracionController::class, 'actualizarConfiguracionAmbiente']);
        Route::post('configuracion/ambiente/validar', [ConfiguracionController::class, 'validarConfiguracionAmbiente']);
    
    // Monitoreo y alertas de configuración
        Route::get('configuracion/monitoreo', [ConfiguracionController::class, 'configuracionMonitoreo']);
        Route::put('configuracion/monitoreo', [ConfiguracionController::class, 'actualizarConfiguracionMonitoreo']);
        Route::get('configuracion/alertas', [ConfiguracionController::class, 'alertasConfiguracion']);
        Route::post('configuracion/alertas/{id}/resolver', [ConfiguracionController::class, 'resolverAlerta']);
});

});