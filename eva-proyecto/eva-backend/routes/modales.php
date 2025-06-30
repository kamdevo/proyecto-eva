<?php

/**
 * Rutas API - modales
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
use App\Http\Controllers\Api\ModalController;

/*
|--------------------------------------------------------------------------
| Modal Interaction Routes - Enterprise Level
|--------------------------------------------------------------------------
|
| Rutas para interacciones modales con respaldo automático
| y sistema de alta disponibilidad empresarial
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Modales de equipos

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('modal/add-equipment-data', [ModalController::class, 'getAddEquipmentData']);
        Route::get('modal/edit-equipment-data/{id}', [ModalController::class, 'getEditEquipmentData']);
        Route::get('modal/equipment-details/{id}', [ModalController::class, 'getEquipmentDetails']);
        Route::get('modal/equipment-history/{id}', [ModalController::class, 'getEquipmentHistory']);
        Route::get('modal/equipment-documents/{id}', [ModalController::class, 'getEquipmentDocuments']);
        Route::get('modal/equipment-maintenance-schedule/{id}', [ModalController::class, 'getEquipmentMaintenanceSchedule']);
    
    // Modales de mantenimiento preventivo
        Route::get('modal/preventive-maintenance-data/{equipoId?}', [ModalController::class, 'getPreventiveMaintenanceData']);
        Route::get('modal/preventive-maintenance-form/{equipoId}', [ModalController::class, 'getPreventiveMaintenanceForm']);
        Route::get('modal/preventive-maintenance-history/{equipoId}', [ModalController::class, 'getPreventiveMaintenanceHistory']);
        Route::get('modal/preventive-maintenance-templates', [ModalController::class, 'getPreventiveMaintenanceTemplates']);
        Route::get('modal/preventive-maintenance-checklist/{id}', [ModalController::class, 'getPreventiveMaintenanceChecklist']);
    
    // Modales de calibración
        Route::get('modal/calibration-data/{equipoId?}', [ModalController::class, 'getCalibrationData']);
        Route::get('modal/calibration-form/{equipoId}', [ModalController::class, 'getCalibrationForm']);
        Route::get('modal/calibration-history/{equipoId}', [ModalController::class, 'getCalibrationHistory']);
        Route::get('modal/calibration-certificates/{equipoId}', [ModalController::class, 'getCalibrationCertificates']);
        Route::get('modal/calibration-standards', [ModalController::class, 'getCalibrationStandards']);
        Route::get('modal/calibration-schedule/{equipoId}', [ModalController::class, 'getCalibrationSchedule']);
    
    // Modales de mantenimiento correctivo
        Route::get('modal/corrective-maintenance-data/{equipoId?}', [ModalController::class, 'getCorrectiveMaintenanceData']);
        Route::get('modal/corrective-maintenance-form/{equipoId}', [ModalController::class, 'getCorrectiveMaintenanceForm']);
        Route::get('modal/corrective-maintenance-diagnosis/{equipoId}', [ModalController::class, 'getCorrectiveMaintenanceDiagnosis']);
        Route::get('modal/corrective-maintenance-parts/{equipoId}', [ModalController::class, 'getCorrectiveMaintenanceParts']);
        Route::get('modal/corrective-maintenance-costs/{id}', [ModalController::class, 'getCorrectiveMaintenanceCosts']);
    
    // Modales de contingencias
        Route::get('modal/contingency-data/{equipoId?}', [ModalController::class, 'getContingencyData']);
        Route::get('modal/contingency-form/{equipoId}', [ModalController::class, 'getContingencyForm']);
        Route::get('modal/contingency-history/{equipoId}', [ModalController::class, 'getContingencyHistory']);
        Route::get('modal/contingency-resolution/{id}', [ModalController::class, 'getContingencyResolution']);
        Route::get('modal/contingency-impact-analysis/{id}', [ModalController::class, 'getContingencyImpactAnalysis']);
    
    // Modales de documentos
        Route::get('modal/document-data/{equipoId?}', [ModalController::class, 'getDocumentData']);
        Route::get('modal/document-upload-form/{equipoId}', [ModalController::class, 'getDocumentUploadForm']);
        Route::get('modal/document-viewer/{id}', [ModalController::class, 'getDocumentViewer']);
        Route::get('modal/document-versions/{id}', [ModalController::class, 'getDocumentVersions']);
        Route::get('modal/document-permissions/{id}', [ModalController::class, 'getDocumentPermissions']);
    
    // Modales de filtros avanzados
        Route::get('modal/advanced-filters-data', [ModalController::class, 'getAdvancedFiltersData']);
        Route::get('modal/filter-builder', [ModalController::class, 'getFilterBuilder']);
        Route::get('modal/saved-filters', [ModalController::class, 'getSavedFilters']);
        Route::get('modal/filter-templates', [ModalController::class, 'getFilterTemplates']);
        Route::post('modal/validate-filter', [ModalController::class, 'validateFilter']);
    
    // Modales de reportes
        Route::get('modal/report-generator', [ModalController::class, 'getReportGenerator']);
        Route::get('modal/report-templates', [ModalController::class, 'getReportTemplates']);
        Route::get('modal/report-preview/{id}', [ModalController::class, 'getReportPreview']);
        Route::get('modal/report-schedule-form', [ModalController::class, 'getReportScheduleForm']);
        Route::get('modal/export-options', [ModalController::class, 'getExportOptions']);
    
    // Modales de usuarios y permisos
        Route::get('modal/user-form/{id?}', [ModalController::class, 'getUserForm']);
        Route::get('modal/user-permissions/{id}', [ModalController::class, 'getUserPermissions']);
        Route::get('modal/role-assignment/{id}', [ModalController::class, 'getRoleAssignment']);
        Route::get('modal/user-activity/{id}', [ModalController::class, 'getUserActivity']);
        Route::get('modal/password-reset-form/{id}', [ModalController::class, 'getPasswordResetForm']);
    
    // Modales de configuración
        Route::get('modal/system-settings', [ModalController::class, 'getSystemSettings']);
        Route::get('modal/notification-settings', [ModalController::class, 'getNotificationSettings']);
        Route::get('modal/backup-settings', [ModalController::class, 'getBackupSettings']);
        Route::get('modal/security-settings', [ModalController::class, 'getSecuritySettings']);
        Route::get('modal/integration-settings', [ModalController::class, 'getIntegrationSettings']);
    
    // Modales de inventario y repuestos
        Route::get('modal/spare-part-form/{id?}', [ModalController::class, 'getSparePartForm']);
        Route::get('modal/inventory-movement/{id}', [ModalController::class, 'getInventoryMovement']);
        Route::get('modal/stock-adjustment/{id}', [ModalController::class, 'getStockAdjustment']);
        Route::get('modal/purchase-order-form/{id?}', [ModalController::class, 'getPurchaseOrderForm']);
        Route::get('modal/supplier-form/{id?}', [ModalController::class, 'getSupplierForm']);
    
    // Modales de capacitación
        Route::get('modal/training-form/{id?}', [ModalController::class, 'getTrainingForm']);
        Route::get('modal/training-enrollment/{id}', [ModalController::class, 'getTrainingEnrollment']);
        Route::get('modal/training-evaluation/{id}', [ModalController::class, 'getTrainingEvaluation']);
        Route::get('modal/training-certificate/{id}', [ModalController::class, 'getTrainingCertificate']);
        Route::get('modal/training-materials/{id}', [ModalController::class, 'getTrainingMaterials']);
    
    // Modales de áreas y servicios
        Route::get('modal/area-form/{id?}', [ModalController::class, 'getAreaForm']);
        Route::get('modal/service-form/{id?}', [ModalController::class, 'getServiceForm']);
        Route::get('modal/area-equipment/{id}', [ModalController::class, 'getAreaEquipment']);
        Route::get('modal/service-areas/{id}', [ModalController::class, 'getServiceAreas']);
        Route::get('modal/area-hierarchy', [ModalController::class, 'getAreaHierarchy']);
    
    // Modales de tickets
        Route::get('modal/ticket-form/{id?}', [ModalController::class, 'getTicketForm']);
        Route::get('modal/ticket-assignment/{id}', [ModalController::class, 'getTicketAssignment']);
        Route::get('modal/ticket-resolution/{id}', [ModalController::class, 'getTicketResolution']);
        Route::get('modal/ticket-escalation/{id}', [ModalController::class, 'getTicketEscalation']);
        Route::get('modal/ticket-history/{id}', [ModalController::class, 'getTicketHistory']);
    
    // Validación de datos de modales
        Route::post('modal/validate-data/{type}', [ModalController::class, 'validateModalData']);
        Route::post('modal/save-draft/{type}', [ModalController::class, 'saveModalDraft']);
        Route::get('modal/load-draft/{type}', [ModalController::class, 'loadModalDraft']);
        Route::delete('modal/clear-draft/{type}', [ModalController::class, 'clearModalDraft']);
});

});