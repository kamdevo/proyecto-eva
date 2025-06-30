<?php

/**
 * Rutas API - repuestos
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
use App\Http\Controllers\Api\RepuestosController;

/*
|--------------------------------------------------------------------------
| Spare Parts Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de repuestos e inventario
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // CRUD de repuestos
    Route::apiResource('repuestos', RepuestosController::class);
    
    // Gestión de inventario

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('repuestos/{id}/stock', [RepuestosController::class, 'stock']);
        Route::post('repuestos/{id}/entrada', [RepuestosController::class, 'entrada']);
        Route::post('repuestos/{id}/salida', [RepuestosController::class, 'salida']);
        Route::post('repuestos/{id}/ajuste', [RepuestosController::class, 'ajusteInventario']);
        Route::get('repuestos/{id}/movimientos', [RepuestosController::class, 'movimientos']);
    
    // Estados de inventario
        Route::get('repuestos/stock-bajo', [RepuestosController::class, 'stockBajo']);
        Route::get('repuestos/stock-critico', [RepuestosController::class, 'stockCritico']);
        Route::get('repuestos/sin-stock', [RepuestosController::class, 'sinStock']);
        Route::get('repuestos/vencidos', [RepuestosController::class, 'vencidos']);
        Route::get('repuestos/proximos-vencer', [RepuestosController::class, 'proximosVencer']);
    
    // Búsquedas y filtros
        Route::get('repuestos/buscar/{termino}', [RepuestosController::class, 'buscar']);
        Route::post('repuestos/busqueda-avanzada', [RepuestosController::class, 'busquedaAvanzada']);
        Route::get('repuestos/filtrar/categoria/{categoria}', [RepuestosController::class, 'filtrarPorCategoria']);
        Route::get('repuestos/filtrar/proveedor/{proveedor}', [RepuestosController::class, 'filtrarPorProveedor']);
        Route::get('repuestos/filtrar/equipo/{equipo}', [RepuestosController::class, 'filtrarPorEquipo']);
        Route::get('repuestos/filtrar/ubicacion/{ubicacion}', [RepuestosController::class, 'filtrarPorUbicacion']);
    
    // Compatibilidad con equipos
        Route::get('repuestos/{id}/equipos-compatibles', [RepuestosController::class, 'equiposCompatibles']);
        Route::post('repuestos/{id}/agregar-compatibilidad', [RepuestosController::class, 'agregarCompatibilidad']);
        Route::delete('repuestos/{id}/quitar-compatibilidad/{equipo}', [RepuestosController::class, 'quitarCompatibilidad']);
        Route::get('equipos/{id}/repuestos-compatibles', [RepuestosController::class, 'repuestosParaEquipo']);
    
    // Proveedores y compras
        Route::get('repuestos/{id}/proveedores', [RepuestosController::class, 'proveedores']);
        Route::post('repuestos/{id}/agregar-proveedor', [RepuestosController::class, 'agregarProveedor']);
        Route::put('repuestos/{id}/proveedores/{proveedor}', [RepuestosController::class, 'actualizarProveedor']);
        Route::delete('repuestos/{id}/proveedores/{proveedor}', [RepuestosController::class, 'quitarProveedor']);
        Route::get('repuestos/{id}/cotizaciones', [RepuestosController::class, 'cotizaciones']);
        Route::post('repuestos/{id}/solicitar-cotizacion', [RepuestosController::class, 'solicitarCotizacion']);
    
    // Órdenes de compra
        Route::get('repuestos/ordenes-compra', [RepuestosController::class, 'ordenesCompra']);
        Route::post('repuestos/ordenes-compra', [RepuestosController::class, 'crearOrdenCompra']);
        Route::get('repuestos/ordenes-compra/{id}', [RepuestosController::class, 'detalleOrdenCompra']);
        Route::put('repuestos/ordenes-compra/{id}', [RepuestosController::class, 'actualizarOrdenCompra']);
        Route::post('repuestos/ordenes-compra/{id}/aprobar', [RepuestosController::class, 'aprobarOrdenCompra']);
        Route::post('repuestos/ordenes-compra/{id}/rechazar', [RepuestosController::class, 'rechazarOrdenCompra']);
        Route::post('repuestos/ordenes-compra/{id}/recibir', [RepuestosController::class, 'recibirOrdenCompra']);
    
    // Solicitudes de repuestos
        Route::get('repuestos/solicitudes', [RepuestosController::class, 'solicitudes']);
        Route::post('repuestos/solicitudes', [RepuestosController::class, 'crearSolicitud']);
        Route::get('repuestos/solicitudes/{id}', [RepuestosController::class, 'detalleSolicitud']);
        Route::put('repuestos/solicitudes/{id}', [RepuestosController::class, 'actualizarSolicitud']);
        Route::post('repuestos/solicitudes/{id}/aprobar', [RepuestosController::class, 'aprobarSolicitud']);
        Route::post('repuestos/solicitudes/{id}/rechazar', [RepuestosController::class, 'rechazarSolicitud']);
        Route::post('repuestos/solicitudes/{id}/entregar', [RepuestosController::class, 'entregarSolicitud']);
    
    // Ubicaciones y almacenes
        Route::get('repuestos/ubicaciones', [RepuestosController::class, 'ubicaciones']);
        Route::post('repuestos/ubicaciones', [RepuestosController::class, 'crearUbicacion']);
        Route::put('repuestos/ubicaciones/{id}', [RepuestosController::class, 'actualizarUbicacion']);
        Route::delete('repuestos/ubicaciones/{id}', [RepuestosController::class, 'eliminarUbicacion']);
        Route::get('repuestos/ubicaciones/{id}/inventario', [RepuestosController::class, 'inventarioPorUbicacion']);
        Route::post('repuestos/{id}/cambiar-ubicacion', [RepuestosController::class, 'cambiarUbicacion']);
    
    // Categorías
        Route::get('repuestos/categorias', [RepuestosController::class, 'categorias']);
        Route::post('repuestos/categorias', [RepuestosController::class, 'crearCategoria']);
        Route::put('repuestos/categorias/{id}', [RepuestosController::class, 'actualizarCategoria']);
        Route::delete('repuestos/categorias/{id}', [RepuestosController::class, 'eliminarCategoria']);
    
    // Estadísticas e informes
        Route::get('repuestos/estadisticas/general', [RepuestosController::class, 'estadisticasGenerales']);
        Route::get('repuestos/estadisticas/movimientos', [RepuestosController::class, 'estadisticasMovimientos']);
        Route::get('repuestos/estadisticas/costos', [RepuestosController::class, 'estadisticasCostos']);
        Route::get('repuestos/estadisticas/rotacion', [RepuestosController::class, 'estadisticasRotacion']);
        Route::get('repuestos/estadisticas/proveedores', [RepuestosController::class, 'estadisticasProveedores']);
    
    // Alertas y notificaciones
        Route::get('repuestos/alertas', [RepuestosController::class, 'alertas']);
        Route::get('repuestos/alertas/stock-bajo', [RepuestosController::class, 'alertasStockBajo']);
        Route::get('repuestos/alertas/vencimientos', [RepuestosController::class, 'alertasVencimientos']);
        Route::post('repuestos/configurar-alertas', [RepuestosController::class, 'configurarAlertas']);
    
    // Importación y exportación
        Route::post('repuestos/importar', [RepuestosController::class, 'importar']);
        Route::get('repuestos/exportar', [RepuestosController::class, 'exportar']);
        Route::get('repuestos/plantilla-importacion', [RepuestosController::class, 'plantillaImportacion']);
    
    // Auditoría de inventario
        Route::get('repuestos/auditoria', [RepuestosController::class, 'auditoria']);
        Route::post('repuestos/auditoria/iniciar', [RepuestosController::class, 'iniciarAuditoria']);
        Route::post('repuestos/auditoria/{id}/contar', [RepuestosController::class, 'contarRepuesto']);
        Route::post('repuestos/auditoria/{id}/finalizar', [RepuestosController::class, 'finalizarAuditoria']);
        Route::get('repuestos/auditoria/{id}/reporte', [RepuestosController::class, 'reporteAuditoria']);
    
    // Configuración
        Route::get('repuestos/configuracion', [RepuestosController::class, 'configuracion']);
        Route::put('repuestos/configuracion', [RepuestosController::class, 'actualizarConfiguracion']);
});

});