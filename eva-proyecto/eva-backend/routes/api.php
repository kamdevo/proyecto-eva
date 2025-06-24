<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdministradorController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\ContingenciaController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\ModalController;
use App\Http\Controllers\Api\MantenimientoController;
use App\Http\Controllers\Api\CalibracionController;
use App\Http\Controllers\Api\CorrectivoController;
use App\Http\Controllers\Api\ArchivosController;
use App\Http\Controllers\Api\CapacitacionController;
use App\Http\Controllers\Api\RepuestosController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas (sin autenticación)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/charts', [DashboardController::class, 'getCharts']);
    Route::get('/dashboard/alertas', [DashboardController::class, 'getAlertas']);
    Route::get('/dashboard/actividad-reciente', [DashboardController::class, 'getActividadReciente']);
    Route::get('/dashboard/resumen-ejecutivo', [DashboardController::class, 'getResumenEjecutivo']);
    
    // Administrador - Gestión de usuarios
    Route::apiResource('administrador/usuarios', AdministradorController::class);
    Route::get('/administrador/zone-relations', [AdministradorController::class, 'getZoneRelations']);
    Route::post('/administrador/zone-relations', [AdministradorController::class, 'createZoneRelation']);
    Route::delete('/administrador/zone-relations/{id}', [AdministradorController::class, 'deleteZoneRelation']);
    
    // Equipos médicos
    Route::apiResource('equipos', EquipmentController::class);
    Route::get('/equipos-stats', [EquipmentController::class, 'getStats']);
    Route::post('/equipos/search-by-code', [EquipmentController::class, 'searchByCode']);
    Route::post('/equipos/{id}/dar-baja', [EquipmentController::class, 'darDeBaja']);
    Route::post('/equipos/{id}/duplicar', [EquipmentController::class, 'duplicar']);
    Route::get('/equipos/servicio/{servicioId}', [EquipmentController::class, 'porServicio']);
    Route::get('/equipos/area/{areaId}', [EquipmentController::class, 'porArea']);
    Route::get('/equipos/criticos', [EquipmentController::class, 'equiposCriticos']);
    Route::get('/equipos/estadisticas', [EquipmentController::class, 'estadisticas']);
    Route::post('/equipos/busqueda-avanzada', [EquipmentController::class, 'busquedaAvanzada']);
    Route::get('/equipos/marcas', [EquipmentController::class, 'getMarcas']);
    Route::get('/equipos/modelos/{marca}', [EquipmentController::class, 'getModelosPorMarca']);
    
    // Equipos industriales (usa el mismo controlador con filtros)
    Route::get('/equipos-industriales', [EquipmentController::class, 'index'])->defaults('tipo', 'industrial');
    
    // Áreas
    Route::apiResource('areas', AreaController::class);
    
    // Servicios
    Route::apiResource('servicios', ServicioController::class);
    
    // Contingencias
    Route::apiResource('contingencias', ContingenciaController::class);
    Route::get('/contingencias-activas', [ContingenciaController::class, 'getActive']);
    Route::get('/contingencias-cerradas', [ContingenciaController::class, 'getClosed']);
    Route::post('/contingencias/{id}/close', [ContingenciaController::class, 'close']);
    
    // Tickets
    Route::apiResource('tickets', TicketController::class);
    Route::get('/my-tickets', [TicketController::class, 'myTickets']);
    Route::get('/closed-tickets', [TicketController::class, 'closedTickets']);
    Route::post('/tickets/{id}/assign', [TicketController::class, 'assign']);
    Route::post('/tickets/{id}/close', [TicketController::class, 'close']);
    
    // Mantenimientos
    Route::get('/mantenimientos', [EquipmentController::class, 'getMaintenances']);
    Route::post('/mantenimientos', [EquipmentController::class, 'createMaintenance']);
    Route::put('/mantenimientos/{id}', [EquipmentController::class, 'updateMaintenance']);
    Route::delete('/mantenimientos/{id}', [EquipmentController::class, 'deleteMaintenance']);
    
    // Planes de mantenimiento
    Route::get('/planes-mantenimiento', [EquipmentController::class, 'getMaintenancePlans']);
    Route::post('/planes-mantenimiento', [EquipmentController::class, 'createMaintenancePlan']);
    
    // Órdenes de compra
    Route::get('/ordenes-compra', [EquipmentController::class, 'getPurchaseOrders']);
    Route::post('/ordenes-compra', [EquipmentController::class, 'createPurchaseOrder']);
    Route::put('/ordenes-compra/{id}', [EquipmentController::class, 'updatePurchaseOrder']);
    Route::delete('/ordenes-compra/{id}', [EquipmentController::class, 'deletePurchaseOrder']);
    
    // Manuales
    Route::get('/manuales', [EquipmentController::class, 'getManuals']);
    Route::post('/manuales', [EquipmentController::class, 'uploadManual']);
    Route::delete('/manuales/{id}', [EquipmentController::class, 'deleteManual']);
    
    // Contactos
    Route::get('/contactos', [EquipmentController::class, 'getContacts']);
    Route::post('/contactos', [EquipmentController::class, 'createContact']);
    Route::put('/contactos/{id}', [EquipmentController::class, 'updateContact']);
    Route::delete('/contactos/{id}', [EquipmentController::class, 'deleteContact']);
    
    // Guías rápidas
    Route::get('/guias-rapidas', [EquipmentController::class, 'getQuickGuides']);
    Route::post('/guias-rapidas', [EquipmentController::class, 'createQuickGuide']);
    
    // Equipos de baja
    Route::get('/equipos-bajas', [EquipmentController::class, 'getDecommissionedEquipment']);
    Route::post('/equipos/{id}/dar-baja', [EquipmentController::class, 'decommissionEquipment']);
    
    // Panel de control
    Route::get('/control-panel/overview', [DashboardController::class, 'getControlPanelOverview']);
    
    // Perfil de usuario
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Sistema de archivos
    Route::post('/upload/equipment-image', [FileController::class, 'uploadEquipmentImage']);
    Route::post('/upload/document', [FileController::class, 'uploadDocument']);
    Route::post('/upload/multiple-files', [FileController::class, 'uploadMultipleFiles']);
    Route::get('/download/document/{id}', [FileController::class, 'downloadDocument']);
    Route::delete('/delete/document/{id}', [FileController::class, 'deleteDocument']);
    Route::get('/equipment/{id}/documents', [FileController::class, 'getEquipmentDocuments']);
    Route::get('/file/{id}/info', [FileController::class, 'getFileInfo']);
    Route::post('/validate/file-type', [FileController::class, 'validateFileType']);
    Route::post('/files/search', [FileController::class, 'searchFiles']);
    Route::get('/files/statistics', [FileController::class, 'getFileStatistics']);
    Route::post('/files/clean-orphans', [FileController::class, 'cleanOrphanFiles']);
    Route::post('/files/compress', [FileController::class, 'compressFiles']);

    // Sistema de exportación
    Route::post('/export/equipos-consolidado', [ExportController::class, 'exportEquiposConsolidado']);
    Route::post('/export/plantilla-mantenimiento', [ExportController::class, 'exportPlantillaMantenimiento']);
    Route::post('/export/contingencias', [ExportController::class, 'exportContingencias']);
    Route::post('/export/estadisticas-cumplimiento', [ExportController::class, 'exportEstadisticasCumplimiento']);
    Route::post('/export/equipos-criticos', [ExportController::class, 'exportEquiposCriticos']);
    Route::post('/export/tickets', [ExportController::class, 'exportTickets']);
    Route::post('/export/calibraciones', [ExportController::class, 'exportCalibraciones']);
    Route::post('/export/inventario-repuestos', [ExportController::class, 'exportInventarioRepuestos']);

    // Interacciones de modales (usando ModalController)
    Route::get('/modal/add-equipment-data', [ModalController::class, 'getAddEquipmentData']);
    Route::get('/modal/preventive-maintenance-data/{equipoId?}', [ModalController::class, 'getPreventiveMaintenanceData']);
    Route::get('/modal/calibration-data/{equipoId?}', [ModalController::class, 'getCalibrationData']);
    Route::get('/modal/corrective-maintenance-data/{equipoId?}', [ModalController::class, 'getCorrectiveMaintenanceData']);
    Route::get('/modal/contingency-data/{equipoId?}', [ModalController::class, 'getContingencyData']);
    Route::get('/modal/document-data/{equipoId?}', [ModalController::class, 'getDocumentData']);
    Route::get('/modal/advanced-filters-data', [ModalController::class, 'getAdvancedFiltersData']);

    // Interacciones de botones
    Route::post('/button/decommission-equipment/{id}', function($id, \Illuminate\Http\Request $request) {
        return \App\Interactions\ButtonInteraction::decommissionEquipment($id, $request->motivo, auth()->id());
    });
    Route::post('/button/schedule-maintenance/{id}', function($id, \Illuminate\Http\Request $request) {
        return \App\Interactions\ButtonInteraction::scheduleMaintenanceAction($id, $request->all());
    });
    Route::post('/button/complete-maintenance/{id}', function($id, \Illuminate\Http\Request $request) {
        return \App\Interactions\ButtonInteraction::completeMaintenanceAction($id, $request->all());
    });
    Route::post('/button/close-contingency/{id}', function($id, \Illuminate\Http\Request $request) {
        return \App\Interactions\ButtonInteraction::closeContingencyAction($id, $request->all());
    });
    Route::post('/button/duplicate-equipment/{id}', function($id) {
        return \App\Interactions\ButtonInteraction::duplicateEquipmentAction($id);
    });
    Route::post('/button/merge-equipments', function(\Illuminate\Http\Request $request) {
        return \App\Interactions\ButtonInteraction::mergeEquipmentsAction(
            $request->equipos_principales,
            $request->equipos_secundarios,
            $request->data ?? []
        );
    });
    Route::post('/button/clean-names', function(\Illuminate\Http\Request $request) {
        return \App\Interactions\ButtonInteraction::cleanNamesAction($request->equipos_ids);
    });
    Route::post('/button/generate-qr/{id}', function($id) {
        return \App\Interactions\ButtonInteraction::generateQRCodeAction($id);
    });
    Route::post('/button/export-selected', function(\Illuminate\Http\Request $request) {
        return \App\Interactions\ButtonInteraction::exportSelectedAction($request->equipos_ids, $request->formato ?? 'excel');
    });

    // Operaciones de base de datos avanzadas
    Route::get('/database/dashboard-stats', function() {
        return \App\Interactions\DatabaseInteraction::getDashboardStats();
    });
    Route::post('/database/advanced-search', function(\Illuminate\Http\Request $request) {
        return \App\Interactions\DatabaseInteraction::advancedEquipmentSearch($request->all());
    });
    Route::get('/database/overdue-maintenance', function() {
        return \App\Interactions\DatabaseInteraction::getOverdueMaintenanceEquipments();
    });
    Route::get('/database/maintenance-compliance/{year?}', function($year = null) {
        return \App\Interactions\DatabaseInteraction::getMaintenanceComplianceSummary($year);
    });
    Route::get('/database/critical-equipments', function() {
        return \App\Interactions\DatabaseInteraction::getCriticalEquipments();
    });
    Route::post('/database/consolidated-report', function(\Illuminate\Http\Request $request) {
        return \App\Interactions\DatabaseInteraction::getConsolidatedReportData($request->all());
    });

    // Controladores especializados basados en estructura real de BD
    Route::apiResource('mantenimientos', MantenimientoController::class);
    Route::apiResource('calibraciones', CalibracionController::class);
    Route::apiResource('correctivos', CorrectivoController::class);
    Route::apiResource('archivos', ArchivosController::class);
    Route::apiResource('areas', AreaController::class);
    Route::apiResource('servicios', ServicioController::class);
    Route::apiResource('contingencias', ContingenciaController::class);
    Route::apiResource('tickets', TicketController::class);
    Route::apiResource('capacitaciones', CapacitacionController::class);
    Route::apiResource('repuestos', RepuestosController::class);

    // Rutas específicas para mantenimientos
    Route::post('/mantenimientos/{id}/completar', [MantenimientoController::class, 'completar']);
    Route::post('/mantenimientos/{id}/cancelar', [MantenimientoController::class, 'cancelar']);
    Route::get('/mantenimientos/equipo/{equipoId}', [MantenimientoController::class, 'porEquipo']);
    Route::get('/mantenimientos/vencidos', [MantenimientoController::class, 'vencidos']);
    Route::get('/mantenimientos/programados', [MantenimientoController::class, 'programados']);
    Route::get('/mantenimientos/estadisticas', [MantenimientoController::class, 'estadisticas']);

    // Rutas específicas para calibraciones
    Route::post('/calibraciones/{id}/completar', [CalibracionController::class, 'completar']);
    Route::get('/calibraciones/equipo/{equipoId}', [CalibracionController::class, 'porEquipo']);
    Route::get('/calibraciones/vencidas', [CalibracionController::class, 'vencidas']);
    Route::get('/calibraciones/programadas', [CalibracionController::class, 'programadas']);
    Route::get('/calibraciones/estadisticas', [CalibracionController::class, 'estadisticas']);
    Route::get('/calibraciones/equipos-requieren', [CalibracionController::class, 'equiposRequierenCalibracion']);



    // Rutas específicas para archivos
    Route::post('/archivos/upload-multiple', [ArchivosController::class, 'uploadMultiple']);
    Route::get('/archivos/download/{id}', [ArchivosController::class, 'download']);
    Route::get('/archivos/equipo/{equipoId}', [ArchivosController::class, 'porEquipo']);
    Route::get('/archivos/tipo/{tipo}', [ArchivosController::class, 'porTipo']);
    Route::get('/archivos/estadisticas', [ArchivosController::class, 'estadisticas']);
    Route::post('/archivos/{id}/toggle-status', [ArchivosController::class, 'toggleStatus']);
    Route::post('/archivos/buscar', [ArchivosController::class, 'buscar']);

    // Rutas específicas para áreas
    Route::get('/areas/servicio/{servicioId}', [AreaController::class, 'porServicio']);
    Route::get('/areas/estadisticas', [AreaController::class, 'estadisticas']);
    Route::post('/areas/{id}/toggle-status', [AreaController::class, 'toggleStatus']);
    Route::get('/areas/activas', [AreaController::class, 'getActivas']);

    // Rutas específicas para servicios
    Route::get('/servicios/estadisticas', [ServicioController::class, 'estadisticas']);
    Route::post('/servicios/{id}/toggle-status', [ServicioController::class, 'toggleStatus']);
    Route::get('/servicios/activos', [ServicioController::class, 'getActivos']);
    Route::get('/servicios/jerarquia', [ServicioController::class, 'getJerarquia']);

    // Rutas específicas para contingencias
    Route::post('/contingencias/{id}/cerrar', [ContingenciaController::class, 'cerrar']);
    Route::post('/contingencias/{id}/asignar', [ContingenciaController::class, 'asignar']);
    Route::get('/contingencias/equipo/{equipoId}', [ContingenciaController::class, 'porEquipo']);
    Route::get('/contingencias/abiertas', [ContingenciaController::class, 'abiertas']);
    Route::get('/contingencias/criticas', [ContingenciaController::class, 'criticas']);
    Route::get('/contingencias/estadisticas', [ContingenciaController::class, 'estadisticas']);

    // Rutas específicas para tickets
    Route::post('/tickets/{id}/asignar', [TicketController::class, 'asignar']);
    Route::post('/tickets/{id}/cerrar', [TicketController::class, 'cerrar']);
    Route::get('/tickets/abiertos', [TicketController::class, 'abiertos']);
    Route::get('/tickets/usuario/{usuarioId}', [TicketController::class, 'porUsuario']);
    Route::get('/tickets/asignados/{usuarioId}', [TicketController::class, 'asignadosA']);
    Route::get('/tickets/urgentes', [TicketController::class, 'urgentes']);
    Route::get('/tickets/estadisticas', [TicketController::class, 'estadisticas']);

    // Rutas específicas para capacitaciones
    Route::post('/capacitaciones/{id}/inscribir', [CapacitacionController::class, 'inscribir']);
    Route::post('/capacitaciones/{id}/completar', [CapacitacionController::class, 'completar']);
    Route::get('/capacitaciones/programadas', [CapacitacionController::class, 'programadas']);
    Route::get('/capacitaciones/estadisticas', [CapacitacionController::class, 'estadisticas']);

    // Rutas específicas para repuestos
    Route::post('/repuestos/{id}/entrada', [RepuestosController::class, 'entrada']);
    Route::post('/repuestos/{id}/salida', [RepuestosController::class, 'salida']);
    Route::get('/repuestos/bajo-stock', [RepuestosController::class, 'bajoStock']);
    Route::get('/repuestos/criticos', [RepuestosController::class, 'criticos']);
    Route::get('/repuestos/estadisticas', [RepuestosController::class, 'estadisticas']);

    // Rutas específicas para correctivos
    Route::post('/correctivos/{id}/completar', [CorrectivoController::class, 'completar']);
    Route::get('/correctivos/equipo/{equipoId}', [CorrectivoController::class, 'porEquipo']);
    Route::get('/correctivos/pendientes', [CorrectivoController::class, 'pendientes']);
    Route::get('/correctivos/estadisticas', [CorrectivoController::class, 'estadisticas']);

});

// Rutas para archivos y descargas adicionales
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/download/contingencia/{id}', [ContingenciaController::class, 'downloadPdf']);
    Route::get('/download/manual/{id}', [EquipmentController::class, 'downloadManual']);
});
