<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Calibraciones (sin autenticación)
Route::prefix('v1')->group(function () {
    Route::apiResource('calibracion', \App\Http\Controllers\Api\CalibracionController::class);
    Route::get('export/calibraciones', [App\Http\Controllers\Api\ExportController::class, 'calibraciones']);
});

// Rutas con autenticación
Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('v1')->group(function () {
        
        // Equipos médicos e industriales (rutas protegidas)
        require __DIR__.'/equipos.php';
        
        // Mantenimiento y calibraciones
        require __DIR__.'/mantenimiento.php';

        // Exportación y reportes
        require __DIR__.'/export.php';

        // Gestión de archivos
        require __DIR__.'/archivos.php';

        // Contingencias y tickets
        require __DIR__.'/contingencias.php';

        // Dashboard y estadísticas
        require __DIR__.'/dashboard.php';

        // Repuestos e inventario
        require __DIR__.'/repuestos.php';

        // Órdenes de compra y tipos de compra
        require __DIR__.'/ordencompra.php';
        require __DIR__.'/tipocompra.php';

        // Capacitación y guías
        require __DIR__.'/capacitacion.php';

        // Contactos y propietarios
        require __DIR__.'/contactos.php';

        // Filtros y búsquedas
        require __DIR__.'/filtros.php';
    });
});

// INCLUIR RUTA ESPECÍFICA PARA MODAL DE EQUIPOS
include __DIR__ . '/equipos-modal.php';
