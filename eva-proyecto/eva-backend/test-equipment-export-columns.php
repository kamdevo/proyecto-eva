<?php

/**
 * Script de prueba para verificar columnas necesarias para exportación de equipos
 * Ejecutar: php test-equipment-export-columns.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n";
echo "========================================\n";
echo "VERIFICACIÓN DE COLUMNAS PARA EXPORT\n";
echo "========================================\n\n";

try {
    // 1. Verificar tabla equipos
    echo "1️⃣  TABLA EQUIPOS:\n";
    echo "----------------------------------------\n";
    
    $equiposColumns = Schema::getColumnListing('equipos');
    echo "✅ Tabla 'equipos' existe\n";
    echo "📊 Total columnas: " . count($equiposColumns) . "\n";
    echo "Columnas: " . implode(', ', $equiposColumns) . "\n\n";
    
    // Verificar columnas clave
    $columnasNecesarias = ['id', 'code', 'name', 'marca', 'modelo', 'serial', 'status', 'created_at', 'servicio_id', 'area_id', 'estadoequipo_id'];
    echo "Verificando columnas necesarias:\n";
    foreach ($columnasNecesarias as $col) {
        if (in_array($col, $equiposColumns)) {
            echo "  ✅ $col\n";
        } else {
            echo "  ❌ $col (FALTA)\n";
        }
    }
    echo "\n";
    
    // 2. Verificar tabla servicios
    echo "2️⃣  TABLA SERVICIOS:\n";
    echo "----------------------------------------\n";
    
    if (Schema::hasTable('servicios')) {
        $serviciosColumns = Schema::getColumnListing('servicios');
        echo "✅ Tabla 'servicios' existe\n";
        echo "Columnas: " . implode(', ', $serviciosColumns) . "\n";
        
        if (in_array('name', $serviciosColumns)) {
            echo "  ✅ servicios.name existe\n";
        } else {
            echo "  ❌ servicios.name NO existe\n";
        }
        
        if (in_array('sede_id', $serviciosColumns)) {
            echo "  ✅ servicios.sede_id existe (para JOIN con sedes)\n";
        } else {
            echo "  ❌ servicios.sede_id NO existe\n";
        }
    } else {
        echo "❌ Tabla 'servicios' NO existe\n";
    }
    echo "\n";
    
    // 3. Verificar tabla areas
    echo "3️⃣  TABLA AREAS:\n";
    echo "----------------------------------------\n";
    
    if (Schema::hasTable('areas')) {
        $areasColumns = Schema::getColumnListing('areas');
        echo "✅ Tabla 'areas' existe\n";
        echo "Columnas: " . implode(', ', $areasColumns) . "\n";
        
        if (in_array('name', $areasColumns)) {
            echo "  ✅ areas.name existe\n";
        } else {
            echo "  ❌ areas.name NO existe\n";
        }
    } else {
        echo "❌ Tabla 'areas' NO existe\n";
    }
    echo "\n";
    
    // 4. Verificar tabla sedes
    echo "4️⃣  TABLA SEDES:\n";
    echo "----------------------------------------\n";
    
    if (Schema::hasTable('sedes')) {
        $sedesColumns = Schema::getColumnListing('sedes');
        echo "✅ Tabla 'sedes' existe\n";
        echo "Columnas: " . implode(', ', $sedesColumns) . "\n";
        
        if (in_array('name', $sedesColumns)) {
            echo "  ✅ sedes.name existe\n";
        } else {
            echo "  ❌ sedes.name NO existe\n";
        }
    } else {
        echo "❌ Tabla 'sedes' NO existe\n";
    }
    echo "\n";
    
    // 5. Verificar tabla estadoequipos
    echo "5️⃣  TABLA ESTADOEQUIPOS:\n";
    echo "----------------------------------------\n";
    
    if (Schema::hasTable('estadoequipos')) {
        $estadoColumns = Schema::getColumnListing('estadoequipos');
        echo "✅ Tabla 'estadoequipos' existe\n";
        echo "Columnas: " . implode(', ', $estadoColumns) . "\n";
        
        if (in_array('name', $estadoColumns)) {
            echo "  ✅ estadoequipos.name existe\n";
        } else {
            echo "  ❌ estadoequipos.name NO existe\n";
        }
    } else {
        echo "❌ Tabla 'estadoequipos' NO existe\n";
    }
    echo "\n";
    
    // 6. Verificar tabla planes_mantenimientos
    echo "6️⃣  TABLA PLANES_MANTENIMIENTOS:\n";
    echo "----------------------------------------\n";
    
    if (Schema::hasTable('planes_mantenimientos')) {
        $planesColumns = Schema::getColumnListing('planes_mantenimientos');
        echo "✅ Tabla 'planes_mantenimientos' existe\n";
        echo "Total columnas: " . count($planesColumns) . "\n";
        
        $columnasNecesariasPlanes = ['equipo_id', 'responsable', 'anio'];
        echo "Verificando columnas para subquery:\n";
        foreach ($columnasNecesariasPlanes as $col) {
            if (in_array($col, $planesColumns)) {
                echo "  ✅ $col\n";
            } else {
                echo "  ❌ $col (FALTA)\n";
            }
        }
    } else {
        echo "❌ Tabla 'planes_mantenimientos' NO existe\n";
    }
    echo "\n";
    
    // 7. Verificar tabla observaciones_equipos
    echo "7️⃣  TABLA OBSERVACIONES_EQUIPOS:\n";
    echo "----------------------------------------\n";
    
    if (Schema::hasTable('observaciones_equipos')) {
        $obsColumns = Schema::getColumnListing('observaciones_equipos');
        echo "✅ Tabla 'observaciones_equipos' existe\n";
        echo "Total columnas: " . count($obsColumns) . "\n";
        
        $columnasNecesariasObs = ['equipo_id', 'observacion', 'created_at'];
        echo "Verificando columnas para subquery:\n";
        foreach ($columnasNecesariasObs as $col) {
            if (in_array($col, $obsColumns)) {
                echo "  ✅ $col\n";
            } else {
                echo "  ❌ $col (FALTA)\n";
            }
        }
    } else {
        echo "⚠️  Tabla 'observaciones_equipos' NO existe (opcional)\n";
    }
    echo "\n";
    
    // 8. PRUEBA DE QUERY COMPLETA
    echo "8️⃣  PRUEBA DE QUERY COMPLETA:\n";
    echo "----------------------------------------\n";
    
    try {
        $query = DB::table('equipos')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
            ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
            ->leftJoin('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
            ->select(
                'equipos.id',
                'equipos.code',
                'equipos.name',
                'equipos.marca',
                'equipos.modelo',
                'equipos.serial',
                'equipos.status',
                'equipos.created_at',
                DB::raw("COALESCE(servicios.name, 'N/A') as servicio_nombre"),
                DB::raw("COALESCE(areas.name, 'N/A') as area_nombre"),
                DB::raw("COALESCE(sedes.name, 'N/A') as sede_nombre"),
                DB::raw("COALESCE(estadoequipos.name, 'N/A') as estado_equipo")
            )
            ->limit(1)
            ->first();
        
        if ($query) {
            echo "✅ Query ejecutada exitosamente\n";
            echo "Muestra de datos:\n";
            echo "  - ID: {$query->id}\n";
            echo "  - Código: {$query->code}\n";
            echo "  - Nombre: {$query->name}\n";
            echo "  - Servicio: {$query->servicio_nombre}\n";
            echo "  - Área: {$query->area_nombre}\n";
            echo "  - Sede: {$query->sede_nombre}\n";
            echo "  - Estado Equipo: {$query->estado_equipo}\n";
        } else {
            echo "⚠️  Query ejecutada pero sin resultados (tabla vacía)\n";
        }
    } catch (\Exception $e) {
        echo "❌ Error ejecutando query:\n";
        echo "   " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // 9. Contar equipos totales
    echo "9️⃣  ESTADÍSTICAS:\n";
    echo "----------------------------------------\n";
    
    $totalEquipos = DB::table('equipos')->count();
    $totalActivos = DB::table('equipos')->where('status', 1)->count();
    $totalInactivos = DB::table('equipos')->where('status', '!=', 1)->count();
    
    echo "Total de equipos: $totalEquipos\n";
    echo "Activos: $totalActivos\n";
    echo "Inactivos: $totalInactivos\n";
    echo "\n";
    
    echo "========================================\n";
    echo "✅ VERIFICACIÓN COMPLETADA\n";
    echo "========================================\n\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR GENERAL:\n";
    echo $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
