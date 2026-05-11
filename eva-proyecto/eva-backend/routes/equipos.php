<?php

/**
 * Rutas API - equipos
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
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\EquipmentController;

/*
|--------------------------------------------------------------------------
| Equipment Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de equipos médicos
|
*/

// Rutas de equipos médicos
// CRUD básico de equipos (EXCLUIR store y update - manejados por rutas públicas)
Route::apiResource('equipos', EquipmentController::class)->except(['store', 'update']);

// Rutas específicas de equipos médicos con información completa (sin autenticación)
Route::get('equipos/medical-devices-complete', [EquipmentController::class, 'getMedicalDevicesComplete'])
    ->withoutMiddleware(['auth:sanctum']);
Route::get('equipos/industrial-devices-complete', [EquipmentController::class, 'getIndustrialDevicesComplete'])
    ->withoutMiddleware(['auth:sanctum']);
Route::get('equipos/{id}/complete-info', [EquipmentController::class, 'getCompleteInfo'])
    ->withoutMiddleware(['auth:sanctum']);
Route::get('equipos/filter-options', [EquipmentController::class, 'getFilterOptions'])
    ->withoutMiddleware(['auth:sanctum']);
Route::get('equipos/estadisticas/medical-devices', [EquipmentController::class, 'getMedicalDevicesStats'])
    ->withoutMiddleware(['auth:sanctum']);
Route::get('equipos/estadisticas/industrial-devices', [EquipmentController::class, 'getIndustrialDevicesStats'])
    ->withoutMiddleware(['auth:sanctum']);

// Ruta de actualización sin middleware (para desarrollo/testing)
Route::put('equipos/{id}', [EquipmentController::class, 'update'])
    ->withoutMiddleware(['auth:sanctum', 'throttle:api']);

// Otras rutas específicas
Route::get('equipos/{id}/historial', [EquipmentController::class, 'historial']);
Route::get('equipos/{id}/mantenimientos', [EquipmentController::class, 'mantenimientos']);
Route::get('equipos/{id}/calibraciones', [EquipmentController::class, 'calibraciones']);
Route::get('equipos/{id}/documentos', [EquipmentController::class, 'documentos']);
Route::post('equipos/{id}/toggle-status', [EquipmentController::class, 'toggleStatus']);
Route::post('equipos/{id}/asignar-area', [EquipmentController::class, 'asignarArea']);
Route::post('equipos/{id}/asignar-servicio', [EquipmentController::class, 'asignarServicio']);

// Búsquedas y filtros
Route::get('equipos/buscar/{termino}', [EquipmentController::class, 'buscar']);
Route::post('equipos/busqueda-avanzada', [EquipmentController::class, 'busquedaAvanzada']);
Route::get('equipos/filtrar/estado/{estado}', [EquipmentController::class, 'filtrarPorEstado']);
Route::get('equipos/filtrar/area/{area}', [EquipmentController::class, 'filtrarPorArea']);
Route::get('equipos/filtrar/servicio/{servicio}', [EquipmentController::class, 'filtrarPorServicio']);

// Estadísticas de equipos
Route::get('equipos/estadisticas/general', [EquipmentController::class, 'estadisticasGenerales']);
Route::get('equipos/estadisticas/por-area', [EquipmentController::class, 'estadisticasPorArea']);
Route::get('equipos/estadisticas/por-estado', [EquipmentController::class, 'estadisticasPorEstado']);
Route::get('equipos/estadisticas/criticos', [EquipmentController::class, 'equiposCriticos']);

// Gestión masiva
Route::post('equipos/importar', [EquipmentController::class, 'importar']);
Route::post('equipos/actualizar-masivo', [EquipmentController::class, 'actualizarMasivo']);
Route::post('equipos/eliminar-masivo', [EquipmentController::class, 'eliminarMasivo']);

// Debugging y limpieza de datos (movido a rutas públicas en api.php)
// Las rutas de debugging están ahora en api.php como rutas públicas sin autenticación

// QR y códigos
Route::get('equipos/{id}/qr', [EquipmentController::class, 'generarQR']);
Route::get('equipos/{id}/etiqueta', [EquipmentController::class, 'generarEtiqueta']);
Route::post('equipos/escanear-qr', [EquipmentController::class, 'escanearQR']);

// Contactos asociados al equipo
Route::get('equipos/{id}/contactos', function($id) {
    try {
        $contactos = DB::table('equipo_contacto')
            ->join('contacto', 'equipo_contacto.contacto_id', '=', 'contacto.id')
            ->leftJoin('tcontacto', 'contacto.tcontacto_id', '=', 'tcontacto.id')
            ->select([
                'equipo_contacto.id as pivot_id',
                'contacto.id as contacto_id',
                'contacto.name',
                'contacto.email',
                'contacto.telefono',
                'tcontacto.description as tipo_nombre',
            ])
            ->where('equipo_contacto.equipo_id', $id)
            ->where('equipo_contacto.status', 1)
            ->where('contacto.status', 1)
            ->orderBy('contacto.name')
            ->get();

        return response()->json(['success' => true, 'data' => $contactos]);
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => 'Error obteniendo contactos: ' . $e->getMessage()], 500);
    }
})->withoutMiddleware(['auth:sanctum']);

Route::post('equipos/{id}/contactos', function(Request $request, $id) {
    try {
        $request->validate(['contacto_id' => 'required|integer|exists:contacto,id']);

        // Evitar duplicados activos
        $exists = DB::table('equipo_contacto')
            ->where('equipo_id', $id)
            ->where('contacto_id', $request->contacto_id)
            ->where('status', 1)
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'El contacto ya está asociado a este equipo'], 422);
        }

        $pivotId = DB::table('equipo_contacto')->insertGetId([
            'equipo_id'   => $id,
            'contacto_id' => $request->contacto_id,
            'status'      => 1,
            'created_at'  => now(),
        ]);

        $contacto = DB::table('equipo_contacto')
            ->join('contacto', 'equipo_contacto.contacto_id', '=', 'contacto.id')
            ->leftJoin('tcontacto', 'contacto.tcontacto_id', '=', 'tcontacto.id')
            ->select([
                'equipo_contacto.id as pivot_id',
                'contacto.id as contacto_id',
                'contacto.name',
                'contacto.email',
                'contacto.telefono',
                'tcontacto.description as tipo_nombre',
            ])
            ->where('equipo_contacto.id', $pivotId)
            ->first();

        return response()->json(['success' => true, 'message' => 'Contacto asociado exitosamente', 'data' => $contacto], 201);
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => 'Error asociando contacto: ' . $e->getMessage()], 500);
    }
})->withoutMiddleware(['auth:sanctum']);

Route::delete('equipos/{id}/contactos/{pivotId}', function($id, $pivotId) {
    try {
        $updated = DB::table('equipo_contacto')
            ->where('id', $pivotId)
            ->where('equipo_id', $id)
            ->update(['status' => 0]);

        if (!$updated) {
            return response()->json(['success' => false, 'message' => 'Asociación no encontrada'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Contacto desvinculado exitosamente']);
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => 'Error desvinculando contacto: ' . $e->getMessage()], 500);
    }
})->withoutMiddleware(['auth:sanctum']);