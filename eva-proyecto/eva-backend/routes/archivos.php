<?php

/**
 * Rutas API - archivos
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
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\ArchivosController;

/*
|--------------------------------------------------------------------------
| Files Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de archivos y documentos
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD básico de archivos
    Route::apiResource('archivos', ArchivosController::class);
    
    // Subida y descarga de archivos

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::post('archivos/upload', [FileController::class, 'upload']);
        Route::get('archivos/{id}/download', [FileController::class, 'download']);
        Route::get('archivos/{id}/preview', [FileController::class, 'preview']);
        Route::get('archivos/{id}/thumbnail', [FileController::class, 'thumbnail']);
    
    // Gestión de archivos específicos
        Route::post('archivos/{id}/toggle-status', [ArchivosController::class, 'toggleStatus']);
        Route::post('archivos/buscar', [ArchivosController::class, 'buscar']);
        Route::get('archivos/estadisticas', [ArchivosController::class, 'estadisticas']);
        Route::get('archivos/tipos', [ArchivosController::class, 'tiposArchivo']);
        Route::get('archivos/categorias', [ArchivosController::class, 'categorias']);
    
    // Gestión de versiones
        Route::get('archivos/{id}/versiones', [ArchivosController::class, 'versiones']);
        Route::post('archivos/{id}/nueva-version', [ArchivosController::class, 'nuevaVersion']);
        Route::post('archivos/{id}/restaurar-version/{version}', [ArchivosController::class, 'restaurarVersion']);
        Route::delete('archivos/{id}/versiones/{version}', [ArchivosController::class, 'eliminarVersion']);
    
    // Organización y estructura
        Route::get('archivos/carpetas', [ArchivosController::class, 'carpetas']);
        Route::post('archivos/carpetas', [ArchivosController::class, 'crearCarpeta']);
        Route::put('archivos/carpetas/{id}', [ArchivosController::class, 'actualizarCarpeta']);
        Route::delete('archivos/carpetas/{id}', [ArchivosController::class, 'eliminarCarpeta']);
        Route::post('archivos/{id}/mover', [ArchivosController::class, 'moverArchivo']);
        Route::post('archivos/organizar-automatico', [ArchivosController::class, 'organizarAutomatico']);
    
    // Búsqueda avanzada
        Route::get('archivos/busqueda-avanzada', [ArchivosController::class, 'busquedaAvanzada']);
        Route::post('archivos/buscar-contenido', [ArchivosController::class, 'buscarContenido']);
        Route::get('archivos/filtrar/tipo/{tipo}', [ArchivosController::class, 'filtrarPorTipo']);
        Route::get('archivos/filtrar/categoria/{categoria}', [ArchivosController::class, 'filtrarPorCategoria']);
        Route::get('archivos/filtrar/fecha/{fecha}', [ArchivosController::class, 'filtrarPorFecha']);
    
    // Operaciones masivas
        Route::post('archivos/upload-masivo', [ArchivosController::class, 'uploadMasivo']);
        Route::post('archivos/eliminar-masivo', [ArchivosController::class, 'eliminarMasivo']);
        Route::post('archivos/mover-masivo', [ArchivosController::class, 'moverMasivo']);
        Route::post('archivos/comprimir', [ArchivosController::class, 'comprimirArchivos']);
        Route::post('archivos/descomprimir', [ArchivosController::class, 'descomprimirArchivo']);
    
    // Seguridad y validación
        Route::post('archivos/validar-integridad', [ArchivosController::class, 'validarIntegridad']);
        Route::post('archivos/{id}/escanear-virus', [ArchivosController::class, 'escanearVirus']);
        Route::get('archivos/{id}/permisos', [ArchivosController::class, 'permisos']);
        Route::put('archivos/{id}/permisos', [ArchivosController::class, 'actualizarPermisos']);
    
    // Compartir y colaboración
        Route::post('archivos/{id}/compartir', [ArchivosController::class, 'compartir']);
        Route::get('archivos/{id}/enlaces-compartidos', [ArchivosController::class, 'enlacesCompartidos']);
        Route::delete('archivos/{id}/enlaces-compartidos/{enlace}', [ArchivosController::class, 'revocarEnlace']);
        Route::post('archivos/{id}/comentarios', [ArchivosController::class, 'agregarComentario']);
        Route::get('archivos/{id}/comentarios', [ArchivosController::class, 'comentarios']);
    
    // Estadísticas y uso
        Route::get('archivos/estadisticas-uso', [ArchivosController::class, 'estadisticasUso']);
        Route::get('archivos/espacio-utilizado', [ArchivosController::class, 'espacioUtilizado']);
        Route::get('archivos/archivos-grandes', [ArchivosController::class, 'archivosGrandes']);
        Route::get('archivos/archivos-duplicados', [ArchivosController::class, 'archivosDuplicados']);
        Route::get('archivos/archivos-huerfanos', [ArchivosController::class, 'archivosHuerfanos']);
    
    // Backup y recuperación
        Route::post('archivos/backup', [ArchivosController::class, 'crearBackup']);
        Route::get('archivos/backups', [ArchivosController::class, 'listarBackups']);
        Route::post('archivos/restaurar-backup/{backup}', [ArchivosController::class, 'restaurarBackup']);
        Route::delete('archivos/backups/{backup}', [ArchivosController::class, 'eliminarBackup']);
    
    // Papelera de reciclaje
        Route::get('archivos/papelera', [ArchivosController::class, 'papelera']);
        Route::post('archivos/{id}/papelera', [ArchivosController::class, 'enviarAPapelera']);
        Route::post('archivos/{id}/restaurar', [ArchivosController::class, 'restaurarDePapelera']);
        Route::delete('archivos/{id}/eliminar-permanente', [ArchivosController::class, 'eliminarPermanente']);
        Route::post('archivos/vaciar-papelera', [ArchivosController::class, 'vaciarPapelera']);
});

});