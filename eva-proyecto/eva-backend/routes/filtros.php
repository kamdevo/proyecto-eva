<?php

/**
 * Rutas API - filtros
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
use App\Http\Controllers\Api\FiltrosController;

/*
|--------------------------------------------------------------------------
| Filters Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de filtros y búsquedas
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD de filtros guardados
    Route::apiResource('filtros', FiltrosController::class);
    
    // Gestión de filtros

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::post('filtros/{id}/aplicar', [FiltrosController::class, 'aplicar']);
        Route::post('filtros/{id}/compartir', [FiltrosController::class, 'compartir']);
        Route::post('filtros/{id}/duplicar', [FiltrosController::class, 'duplicar']);
        Route::post('filtros/{id}/toggle-favorito', [FiltrosController::class, 'toggleFavorito']);
        Route::post('filtros/{id}/toggle-publico', [FiltrosController::class, 'togglePublico']);
    
    // Filtros por categoría
        Route::get('filtros/categoria/equipos', [FiltrosController::class, 'filtrosEquipos']);
        Route::get('filtros/categoria/mantenimientos', [FiltrosController::class, 'filtrosMantenimientos']);
        Route::get('filtros/categoria/calibraciones', [FiltrosController::class, 'filtrosCalibraciones']);
        Route::get('filtros/categoria/contingencias', [FiltrosController::class, 'filtrosContingencias']);
        Route::get('filtros/categoria/tickets', [FiltrosController::class, 'filtrosTickets']);
        Route::get('filtros/categoria/repuestos', [FiltrosController::class, 'filtrosRepuestos']);
        Route::get('filtros/categoria/archivos', [FiltrosController::class, 'filtrosArchivos']);
        Route::get('filtros/categoria/contactos', [FiltrosController::class, 'filtrosContactos']);
    
    // Filtros predefinidos
        Route::get('filtros/predefinidos', [FiltrosController::class, 'predefinidos']);
        Route::get('filtros/predefinidos/equipos-criticos', [FiltrosController::class, 'equiposCriticos']);
        Route::get('filtros/predefinidos/mantenimientos-vencidos', [FiltrosController::class, 'mantenimientosVencidos']);
        Route::get('filtros/predefinidos/calibraciones-vencidas', [FiltrosController::class, 'calibracionesVencidas']);
        Route::get('filtros/predefinidos/contingencias-abiertas', [FiltrosController::class, 'contingenciasAbiertas']);
        Route::get('filtros/predefinidos/tickets-pendientes', [FiltrosController::class, 'ticketsPendientes']);
        Route::get('filtros/predefinidos/stock-bajo', [FiltrosController::class, 'stockBajo']);
    
    // Filtros del usuario
        Route::get('filtros/mis-filtros', [FiltrosController::class, 'misFiltros']);
        Route::get('filtros/favoritos', [FiltrosController::class, 'favoritos']);
        Route::get('filtros/recientes', [FiltrosController::class, 'recientes']);
        Route::get('filtros/compartidos-conmigo', [FiltrosController::class, 'compartidosConmigo']);
        Route::get('filtros/publicos', [FiltrosController::class, 'publicos']);
    
    // Búsquedas globales
        Route::post('busqueda/global', [FiltrosController::class, 'busquedaGlobal']);
        Route::post('busqueda/avanzada', [FiltrosController::class, 'busquedaAvanzada']);
        Route::get('busqueda/sugerencias/{termino}', [FiltrosController::class, 'sugerencias']);
        Route::get('busqueda/historial', [FiltrosController::class, 'historialBusquedas']);
        Route::delete('busqueda/historial/{id}', [FiltrosController::class, 'eliminarBusqueda']);
        Route::delete('busqueda/historial', [FiltrosController::class, 'limpiarHistorial']);
    
    // Filtros dinámicos por entidad
        Route::get('filtros/opciones/equipos', [FiltrosController::class, 'opcionesEquipos']);
        Route::get('filtros/opciones/mantenimientos', [FiltrosController::class, 'opcionesMantenimientos']);
        Route::get('filtros/opciones/calibraciones', [FiltrosController::class, 'opcionesCalibraciones']);
        Route::get('filtros/opciones/contingencias', [FiltrosController::class, 'opcionesContingencias']);
        Route::get('filtros/opciones/tickets', [FiltrosController::class, 'opcionesTickets']);
        Route::get('filtros/opciones/repuestos', [FiltrosController::class, 'opcionesRepuestos']);
        Route::get('filtros/opciones/archivos', [FiltrosController::class, 'opcionesArchivos']);
        Route::get('filtros/opciones/contactos', [FiltrosController::class, 'opcionesContactos']);
    
    // Filtros por campos específicos
        Route::get('filtros/campos/areas', [FiltrosController::class, 'areas']);
        Route::get('filtros/campos/servicios', [FiltrosController::class, 'servicios']);
        Route::get('filtros/campos/estados', [FiltrosController::class, 'estados']);
        Route::get('filtros/campos/tipos', [FiltrosController::class, 'tipos']);
        Route::get('filtros/campos/marcas', [FiltrosController::class, 'marcas']);
        Route::get('filtros/campos/modelos', [FiltrosController::class, 'modelos']);
        Route::get('filtros/campos/proveedores', [FiltrosController::class, 'proveedores']);
        Route::get('filtros/campos/tecnicos', [FiltrosController::class, 'tecnicos']);
        Route::get('filtros/campos/usuarios', [FiltrosController::class, 'usuarios']);
        Route::get('filtros/campos/categorias', [FiltrosController::class, 'categorias']);
    
    // Filtros por fechas
        Route::get('filtros/fechas/rangos-predefinidos', [FiltrosController::class, 'rangosFechasPredefinidos']);
        Route::post('filtros/fechas/validar-rango', [FiltrosController::class, 'validarRangoFechas']);
        Route::get('filtros/fechas/calendario/{año}/{mes}', [FiltrosController::class, 'calendarioFiltros']);
    
    // Filtros geográficos
        Route::get('filtros/ubicaciones/paises', [FiltrosController::class, 'paises']);
        Route::get('filtros/ubicaciones/ciudades/{pais}', [FiltrosController::class, 'ciudades']);
        Route::get('filtros/ubicaciones/sedes', [FiltrosController::class, 'sedes']);
        Route::get('filtros/ubicaciones/pisos/{sede}', [FiltrosController::class, 'pisos']);
    
    // Exportación de resultados filtrados
        Route::post('filtros/exportar/excel', [FiltrosController::class, 'exportarExcel']);
        Route::post('filtros/exportar/pdf', [FiltrosController::class, 'exportarPdf']);
        Route::post('filtros/exportar/csv', [FiltrosController::class, 'exportarCsv']);
    
    // Estadísticas de filtros
        Route::get('filtros/estadisticas/uso', [FiltrosController::class, 'estadisticasUso']);
        Route::get('filtros/estadisticas/mas-usados', [FiltrosController::class, 'filtrosMasUsados']);
        Route::get('filtros/estadisticas/busquedas-populares', [FiltrosController::class, 'busquedasPopulares']);
        Route::get('filtros/estadisticas/rendimiento', [FiltrosController::class, 'estadisticasRendimiento']);
    
    // Configuración de filtros
        Route::get('filtros/configuracion', [FiltrosController::class, 'configuracion']);
        Route::put('filtros/configuracion', [FiltrosController::class, 'actualizarConfiguracion']);
        Route::get('filtros/configuracion/campos-disponibles', [FiltrosController::class, 'camposDisponibles']);
        Route::get('filtros/configuracion/operadores', [FiltrosController::class, 'operadores']);
    
    // Plantillas de filtros
        Route::get('filtros/plantillas', [FiltrosController::class, 'plantillas']);
        Route::post('filtros/plantillas', [FiltrosController::class, 'crearPlantilla']);
        Route::put('filtros/plantillas/{id}', [FiltrosController::class, 'actualizarPlantilla']);
        Route::delete('filtros/plantillas/{id}', [FiltrosController::class, 'eliminarPlantilla']);
        Route::post('filtros/plantillas/{id}/aplicar', [FiltrosController::class, 'aplicarPlantilla']);
    
    // Validación de filtros
        Route::post('filtros/validar', [FiltrosController::class, 'validarFiltro']);
        Route::post('filtros/optimizar', [FiltrosController::class, 'optimizarFiltro']);
        Route::post('filtros/previsualizar', [FiltrosController::class, 'previsualizarResultados']);
});

});