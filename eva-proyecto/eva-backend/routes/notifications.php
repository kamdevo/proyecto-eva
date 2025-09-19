<?php

/**
 * Rutas API - Notifications
 * 
 * Archivo de rutas para gestión de notificaciones y recordatorios
 * con middleware de seguridad empresarial completo.
 * 
 * Middleware aplicado:
 * - auth:sanctum: Autenticación requerida
 * - throttle:60,1: Rate limiting (60 requests por minuto)
 * - cors: Cross-Origin Resource Sharing
 * - api.version: Versionado de API
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| Notification Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de notificaciones, preferencias y recordatorios
|
*/

// Ruta pública para desuscripción (no requiere autenticación)
Route::get('notifications/unsubscribe', [NotificationController::class, 'unsubscribe']);

// Agrupación de rutas con middleware de autenticación
Route::middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    
    // Gestión de preferencias de usuario
    Route::get('notifications/preferences', [NotificationController::class, 'getPreferences']);
    Route::put('notifications/preferences', [NotificationController::class, 'updatePreferences']);
    
    // Correos de prueba
    Route::post('notifications/test', [NotificationController::class, 'sendTestEmail']);
    
    // Estadísticas y seguimiento
    Route::get('notifications/stats', [NotificationController::class, 'getStats']);
    
    // Gestión de notificaciones
    Route::post('notifications/mark-read', [NotificationController::class, 'markAsRead']);
    
    // Rutas administrativas (solo para administradores)
    Route::middleware(['role:admin,super_admin'])->group(function () {
        
        // Gestión masiva de notificaciones
        Route::post('notifications/send-bulk', [NotificationController::class, 'sendBulkNotifications']);
        Route::get('notifications/logs', [NotificationController::class, 'getLogs']);
        Route::get('notifications/system-stats', [NotificationController::class, 'getSystemStats']);
        
        // Configuración del sistema
        Route::get('notifications/config', [NotificationController::class, 'getSystemConfig']);
        Route::put('notifications/config', [NotificationController::class, 'updateSystemConfig']);
        
        // Plantillas de correo
        Route::get('notifications/templates', [NotificationController::class, 'getTemplates']);
        Route::post('notifications/templates', [NotificationController::class, 'createTemplate']);
        Route::put('notifications/templates/{id}', [NotificationController::class, 'updateTemplate']);
        Route::delete('notifications/templates/{id}', [NotificationController::class, 'deleteTemplate']);
        
    });
    
});
