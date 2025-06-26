<?php

/**
 * Rutas API - contactos
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
use App\Http\Controllers\Api\ContactoController;
use App\Http\Controllers\Api\PropietarioController;

/*
|--------------------------------------------------------------------------
| Contacts Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de contactos y propietarios
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD de contactos
    Route::apiResource('contactos', ContactoController::class);
    
    // Gestión específica de contactos

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::post('contactos/{id}/toggle-status', [ContactoController::class, 'toggleStatus']);
        Route::get('contactos/{id}/equipos', [ContactoController::class, 'equipos']);
        Route::get('contactos/{id}/historial', [ContactoController::class, 'historial']);
        Route::post('contactos/{id}/asignar-equipo', [ContactoController::class, 'asignarEquipo']);
        Route::delete('contactos/{id}/desasignar-equipo/{equipo}', [ContactoController::class, 'desasignarEquipo']);
    
    // Tipos de contacto
        Route::get('contactos/tipos', [ContactoController::class, 'tipos']);
        Route::post('contactos/tipos', [ContactoController::class, 'crearTipo']);
        Route::put('contactos/tipos/{id}', [ContactoController::class, 'actualizarTipo']);
        Route::delete('contactos/tipos/{id}', [ContactoController::class, 'eliminarTipo']);
    
    // Búsquedas y filtros de contactos
        Route::get('contactos/buscar/{termino}', [ContactoController::class, 'buscar']);
        Route::post('contactos/busqueda-avanzada', [ContactoController::class, 'busquedaAvanzada']);
        Route::get('contactos/filtrar/tipo/{tipo}', [ContactoController::class, 'filtrarPorTipo']);
        Route::get('contactos/filtrar/empresa/{empresa}', [ContactoController::class, 'filtrarPorEmpresa']);
        Route::get('contactos/filtrar/area/{area}', [ContactoController::class, 'filtrarPorArea']);
        Route::get('contactos/filtrar/estado/{estado}', [ContactoController::class, 'filtrarPorEstado']);
        Route::get('contactos/activos', [ContactoController::class, 'activos']);
        Route::get('contactos/inactivos', [ContactoController::class, 'inactivos']);
    
    // Comunicación
        Route::post('contactos/{id}/enviar-email', [ContactoController::class, 'enviarEmail']);
        Route::get('contactos/{id}/emails', [ContactoController::class, 'historialEmails']);
        Route::post('contactos/{id}/llamada', [ContactoController::class, 'registrarLlamada']);
        Route::get('contactos/{id}/llamadas', [ContactoController::class, 'historialLlamadas']);
        Route::post('contactos/{id}/nota', [ContactoController::class, 'agregarNota']);
        Route::get('contactos/{id}/notas', [ContactoController::class, 'notas']);
    
    // Grupos de contactos
        Route::get('contactos/grupos', [ContactoController::class, 'grupos']);
        Route::post('contactos/grupos', [ContactoController::class, 'crearGrupo']);
        Route::put('contactos/grupos/{id}', [ContactoController::class, 'actualizarGrupo']);
        Route::delete('contactos/grupos/{id}', [ContactoController::class, 'eliminarGrupo']);
        Route::post('contactos/{id}/agregar-grupo/{grupo}', [ContactoController::class, 'agregarAGrupo']);
        Route::delete('contactos/{id}/quitar-grupo/{grupo}', [ContactoController::class, 'quitarDeGrupo']);
        Route::get('contactos/grupos/{id}/miembros', [ContactoController::class, 'miembrosGrupo']);
    
    // CRUD de propietarios
    Route::apiResource('propietarios', PropietarioController::class);
    
    // Gestión específica de propietarios
        Route::post('propietarios/{id}/toggle-status', [PropietarioController::class, 'toggleStatus']);
        Route::get('propietarios/{id}/equipos', [PropietarioController::class, 'equipos']);
        Route::get('propietarios/{id}/contratos', [PropietarioController::class, 'contratos']);
        Route::get('propietarios/{id}/facturas', [PropietarioController::class, 'facturas']);
        Route::get('propietarios/{id}/pagos', [PropietarioController::class, 'pagos']);
        Route::post('propietarios/{id}/asignar-equipo', [PropietarioController::class, 'asignarEquipo']);
        Route::delete('propietarios/{id}/desasignar-equipo/{equipo}', [PropietarioController::class, 'desasignarEquipo']);
    
    // Tipos de propietario
        Route::get('propietarios/tipos', [PropietarioController::class, 'tipos']);
        Route::post('propietarios/tipos', [PropietarioController::class, 'crearTipo']);
        Route::put('propietarios/tipos/{id}', [PropietarioController::class, 'actualizarTipo']);
        Route::delete('propietarios/tipos/{id}', [PropietarioController::class, 'eliminarTipo']);
    
    // Búsquedas y filtros de propietarios
        Route::get('propietarios/buscar/{termino}', [PropietarioController::class, 'buscar']);
        Route::post('propietarios/busqueda-avanzada', [PropietarioController::class, 'busquedaAvanzada']);
        Route::get('propietarios/filtrar/tipo/{tipo}', [PropietarioController::class, 'filtrarPorTipo']);
        Route::get('propietarios/filtrar/estado/{estado}', [PropietarioController::class, 'filtrarPorEstado']);
        Route::get('propietarios/activos', [PropietarioController::class, 'activos']);
        Route::get('propietarios/inactivos', [PropietarioController::class, 'inactivos']);
    
    // Contratos y documentos
        Route::get('propietarios/{id}/documentos', [PropietarioController::class, 'documentos']);
        Route::post('propietarios/{id}/documentos', [PropietarioController::class, 'subirDocumento']);
        Route::delete('propietarios/{id}/documentos/{documento}', [PropietarioController::class, 'eliminarDocumento']);
        Route::get('propietarios/{id}/documentos/{documento}/descargar', [PropietarioController::class, 'descargarDocumento']);
    
    // Comunicación con propietarios
        Route::post('propietarios/{id}/enviar-email', [PropietarioController::class, 'enviarEmail']);
        Route::get('propietarios/{id}/emails', [PropietarioController::class, 'historialEmails']);
        Route::post('propietarios/{id}/nota', [PropietarioController::class, 'agregarNota']);
        Route::get('propietarios/{id}/notas', [PropietarioController::class, 'notas']);
    
    // Estadísticas
        Route::get('contactos/estadisticas/general', [ContactoController::class, 'estadisticasGenerales']);
        Route::get('contactos/estadisticas/por-tipo', [ContactoController::class, 'estadisticasPorTipo']);
        Route::get('contactos/estadisticas/comunicacion', [ContactoController::class, 'estadisticasComunicacion']);
        Route::get('propietarios/estadisticas/general', [PropietarioController::class, 'estadisticasGenerales']);
        Route::get('propietarios/estadisticas/por-tipo', [PropietarioController::class, 'estadisticasPorTipo']);
        Route::get('propietarios/estadisticas/equipos', [PropietarioController::class, 'estadisticasEquipos']);
    
    // Importación y exportación
        Route::post('contactos/importar', [ContactoController::class, 'importar']);
        Route::get('contactos/exportar', [ContactoController::class, 'exportar']);
        Route::get('contactos/plantilla-importacion', [ContactoController::class, 'plantillaImportacion']);
        Route::post('propietarios/importar', [PropietarioController::class, 'importar']);
        Route::get('propietarios/exportar', [PropietarioController::class, 'exportar']);
        Route::get('propietarios/plantilla-importacion', [PropietarioController::class, 'plantillaImportacion']);
    
    // Configuración
        Route::get('contactos/configuracion', [ContactoController::class, 'configuracion']);
        Route::put('contactos/configuracion', [ContactoController::class, 'actualizarConfiguracion']);
        Route::get('propietarios/configuracion', [PropietarioController::class, 'configuracion']);
        Route::put('propietarios/configuracion', [PropietarioController::class, 'actualizarConfiguracion']);
});

});