<?php
/**
 * Script de verificación para el campo guia_id en equipos
 * Ejecutar desde la raíz del proyecto backend
 */

require __DIR__ . '/eva-backend/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Cargar configuración de Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== VERIFICACIÓN DE CAMPO guia_id EN TABLA equipos ===\n\n";

try {
    // 1. Verificar si la columna guia_id existe
    echo "1. Verificando existencia de columna guia_id...\n";
    $columns = DB::select("SHOW COLUMNS FROM equipos LIKE 'guia_id'");
    
    if (empty($columns)) {
        echo "❌ ERROR: La columna guia_id NO EXISTE en la tabla equipos\n";
        echo "Solución: Ejecutar ALTER TABLE equipos ADD COLUMN guia_id INT NULL;\n\n";
    } else {
        echo "✅ La columna guia_id existe\n";
        echo "Tipo: {$columns[0]->Type}\n";
        echo "Null: {$columns[0]->Null}\n";
        echo "Default: " . ($columns[0]->Default ?? 'NULL') . "\n\n";
    }
    
    // 2. Contar total de equipos
    echo "2. Contando equipos...\n";
    $totalEquipos = DB::table('equipos')->count();
    echo "Total de equipos: {$totalEquipos}\n\n";
    
    // 3. Contar equipos con guia_id
    echo "3. Contando equipos con guia_id asignado...\n";
    $conGuiaId = DB::table('equipos')->whereNotNull('guia_id')->where('guia_id', '>', 0)->count();
    $sinGuiaId = DB::table('equipos')->where(function($q) {
        $q->whereNull('guia_id')->orWhere('guia_id', '=', 0);
    })->count();
    
    echo "Equipos con guia_id: {$conGuiaId}\n";
    echo "Equipos sin guia_id: {$sinGuiaId}\n\n";
    
    // 4. Ver distribución por guía
    if ($conGuiaId > 0) {
        echo "4. Distribución de equipos por guía:\n";
        $distribucion = DB::table('equipos')
            ->select('guia_id', DB::raw('COUNT(*) as total'))
            ->whereNotNull('guia_id')
            ->where('guia_id', '>', 0)
            ->groupBy('guia_id')
            ->orderBy('total', 'desc')
            ->get();
        
        foreach ($distribucion as $dist) {
            $guia = DB::table('guias_rapidas')->where('id', $dist->guia_id)->first();
            $nombreGuia = $guia ? $guia->name : 'Guía no encontrada';
            echo "  Guía ID {$dist->guia_id} ({$nombreGuia}): {$dist->total} equipos\n";
        }
        echo "\n";
    }
    
    // 5. Contar guías rápidas
    echo "5. Contando guías rápidas...\n";
    $totalGuias = DB::table('guias_rapidas')->count();
    echo "Total de guías: {$totalGuias}\n\n";
    
    // 6. Mostrar primeros 5 equipos con guia_id
    if ($conGuiaId > 0) {
        echo "6. Primeros 5 equipos con guia_id asignado:\n";
        $ejemplos = DB::table('equipos')
            ->whereNotNull('guia_id')
            ->where('guia_id', '>', 0)
            ->limit(5)
            ->get(['id', 'name', 'code', 'guia_id']);
        
        foreach ($ejemplos as $eq) {
            echo "  ID: {$eq->id}, Nombre: {$eq->name}, Código: {$eq->code}, guia_id: {$eq->guia_id}\n";
        }
    }
    
    echo "\n=== FIN DE VERIFICACIÓN ===\n";
    
} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
