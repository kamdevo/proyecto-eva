<?php

/**
 * Rutas API - dashboard
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
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
|
| Rutas para dashboard y estadísticas generales
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Dashboard principal

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::get('dashboard/resumen', [DashboardController::class, 'resumen']);
        Route::get('dashboard/widgets', [DashboardController::class, 'widgets']);
        Route::post('dashboard/widgets/configurar', [DashboardController::class, 'configurarWidgets']);
    
    // Estadísticas generales
        Route::get('dashboard/estadisticas/equipos', [DashboardController::class, 'estadisticasEquipos']);
        Route::get('dashboard/estadisticas/mantenimientos', [DashboardController::class, 'estadisticasMantenimientos']);
        Route::get('dashboard/estadisticas/contingencias', [DashboardController::class, 'estadisticasContingencias']);
        Route::get('dashboard/estadisticas/tickets', [DashboardController::class, 'estadisticasTickets']);
        Route::get('dashboard/estadisticas/calibraciones', [DashboardController::class, 'estadisticasCalibraciones']);
        Route::get('dashboard/estadisticas/inventario', [DashboardController::class, 'estadisticasInventario']);
    
    // KPIs y métricas
        Route::get('dashboard/kpis', [DashboardController::class, 'kpis']);
        Route::get('dashboard/kpis/equipos', [DashboardController::class, 'kpisEquipos']);
        Route::get('dashboard/kpis/mantenimiento', [DashboardController::class, 'kpisMantenimiento']);
        Route::get('dashboard/kpis/disponibilidad', [DashboardController::class, 'kpisDisponibilidad']);
        Route::get('dashboard/kpis/cumplimiento', [DashboardController::class, 'kpisCumplimiento']);
        Route::get('dashboard/kpis/costos', [DashboardController::class, 'kpisCostos']);
    
    // Alertas y notificaciones
        Route::get('dashboard/alertas', [DashboardController::class, 'alertas']);
        Route::get('dashboard/alertas/criticas', [DashboardController::class, 'alertasCriticas']);
        Route::get('dashboard/alertas/vencimientos', [DashboardController::class, 'alertasVencimientos']);
        Route::get('dashboard/alertas/mantenimientos', [DashboardController::class, 'alertasMantenimientos']);
        Route::get('dashboard/alertas/calibraciones', [DashboardController::class, 'alertasCalibraciones']);
        Route::post('dashboard/alertas/{id}/marcar-leida', [DashboardController::class, 'marcarAlertaLeida']);
        Route::post('dashboard/alertas/marcar-todas-leidas', [DashboardController::class, 'marcarTodasAlertasLeidas']);
    
    // Gráficos y visualizaciones
        Route::get('dashboard/graficos/equipos-por-estado', [DashboardController::class, 'graficosEquiposPorEstado']);
        Route::get('dashboard/graficos/equipos-por-area', [DashboardController::class, 'graficosEquiposPorArea']);
        Route::get('dashboard/graficos/mantenimientos-mes', [DashboardController::class, 'graficosMantenimientosMes']);
        Route::get('dashboard/graficos/contingencias-mes', [DashboardController::class, 'graficosContingenciasMes']);
        Route::get('dashboard/graficos/cumplimiento-mantenimiento', [DashboardController::class, 'graficosCumplimientoMantenimiento']);
        Route::get('dashboard/graficos/disponibilidad-equipos', [DashboardController::class, 'graficosDisponibilidadEquipos']);
        Route::get('dashboard/graficos/costos-mantenimiento', [DashboardController::class, 'graficosCostosMantenimiento']);
        Route::get('dashboard/graficos/tendencias-fallas', [DashboardController::class, 'graficosTendenciasFallas']);
    
    // Reportes rápidos
        Route::get('dashboard/reportes/equipos-criticos', [DashboardController::class, 'reportesEquiposCriticos']);
        Route::get('dashboard/reportes/mantenimientos-vencidos', [DashboardController::class, 'reportesMantenimientosVencidos']);
        Route::get('dashboard/reportes/calibraciones-vencidas', [DashboardController::class, 'reportesCalibracionesVencidas']);
        Route::get('dashboard/reportes/contingencias-abiertas', [DashboardController::class, 'reportesContingenciasAbiertas']);
        Route::get('dashboard/reportes/tickets-pendientes', [DashboardController::class, 'reportesTicketsPendientes']);
        Route::get('dashboard/reportes/inventario-critico', [DashboardController::class, 'reportesInventarioCritico']);
    
    // Actividad reciente
        Route::get('dashboard/actividad-reciente', [DashboardController::class, 'actividadReciente']);
        Route::get('dashboard/actividad-reciente/equipos', [DashboardController::class, 'actividadRecienteEquipos']);
        Route::get('dashboard/actividad-reciente/mantenimientos', [DashboardController::class, 'actividadRecienteMantenimientos']);
        Route::get('dashboard/actividad-reciente/contingencias', [DashboardController::class, 'actividadRecienteContingencias']);
        Route::get('dashboard/actividad-reciente/usuarios', [DashboardController::class, 'actividadRecienteUsuarios']);
    
    // Calendario y programación
        Route::get('dashboard/calendario', [DashboardController::class, 'calendario']);
        Route::get('dashboard/calendario/mantenimientos', [DashboardController::class, 'calendarioMantenimientos']);
        Route::get('dashboard/calendario/calibraciones', [DashboardController::class, 'calendarioCalibraciones']);
        Route::get('dashboard/calendario/eventos', [DashboardController::class, 'calendarioEventos']);
    
    // Configuración del dashboard
        Route::get('dashboard/configuracion', [DashboardController::class, 'configuracion']);
        Route::put('dashboard/configuracion', [DashboardController::class, 'actualizarConfiguracion']);
        Route::post('dashboard/configuracion/reset', [DashboardController::class, 'resetearConfiguracion']);
    
    // Exportaciones del dashboard
        Route::get('dashboard/export/resumen-ejecutivo', [DashboardController::class, 'exportResumenEjecutivo']);
        Route::get('dashboard/export/kpis', [DashboardController::class, 'exportKpis']);
        Route::get('dashboard/export/graficos', [DashboardController::class, 'exportGraficos']);
    
    // Comparativas y análisis
        Route::get('dashboard/comparativas/mes-anterior', [DashboardController::class, 'comparativaMesAnterior']);
        Route::get('dashboard/comparativas/año-anterior', [DashboardController::class, 'comparativaAñoAnterior']);
        Route::get('dashboard/analisis/tendencias', [DashboardController::class, 'analisisTendencias']);
        Route::get('dashboard/analisis/predicciones', [DashboardController::class, 'analisisPredicciones']);
    
    // Tiempo real
        Route::get('dashboard/tiempo-real/equipos', [DashboardController::class, 'tiempoRealEquipos']);
        Route::get('dashboard/tiempo-real/alertas', [DashboardController::class, 'tiempoRealAlertas']);
        Route::get('dashboard/tiempo-real/actividad', [DashboardController::class, 'tiempoRealActividad']);
});

});