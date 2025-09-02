<?php

// Script para agregar la columna fecha_mantenimiento faltante

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    echo "🔧 Verificando columna fecha_mantenimiento...\n";
    
    // Verificar si la columna existe
    $columns = Schema::getColumnListing('planes_mantenimientos');
    $hasFechaMantenimiento = in_array('fecha_mantenimiento', $columns);
    
    if (!$hasFechaMantenimiento) {
        echo "➕ Agregando columna fecha_mantenimiento...\n";
        
        Schema::table('planes_mantenimientos', function ($table) {
            $table->date('fecha_mantenimiento')->nullable()->after('fecha_programada');
        });
        
        echo "✅ Columna fecha_mantenimiento agregada exitosamente\n";
    } else {
        echo "✅ La columna fecha_mantenimiento ya existe\n";
    }
    
    // Verificar también otras columnas opcionales
    $optionalColumns = [
        'observaciones' => 'text',
        'costo_estimado' => 'decimal',
        'repuestos_necesarios' => 'text',
        'frecuencia_dias' => 'integer'
    ];
    
    foreach ($optionalColumns as $columnName => $columnType) {
        if (!in_array($columnName, $columns)) {
            echo "➕ Agregando columna $columnName...\n";
            
            Schema::table('planes_mantenimientos', function ($table) use ($columnName, $columnType) {
                switch ($columnType) {
                    case 'text':
                        $table->text($columnName)->nullable();
                        break;
                    case 'decimal':
                        $table->decimal($columnName, 10, 2)->nullable();
                        break;
                    case 'integer':
                        $table->integer($columnName)->nullable();
                        break;
                }
            });
            
            echo "✅ Columna $columnName agregada\n";
        }
    }
    
    // Verificar columnas finales
    $finalColumns = Schema::getColumnListing('planes_mantenimientos');
    echo "📋 Columnas finales: " . implode(', ', $finalColumns) . "\n";
    
    // Probar una consulta simple
    echo "🔍 Probando consulta GET...\n";
    
    $testQuery = DB::table('planes_mantenimientos')
        ->select('planes_mantenimientos.*')
        ->leftJoin('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
        ->selectRaw('equipos.name as equipo_name, equipos.code as equipo_code')
        ->limit(1)
        ->first();
    
    if ($testQuery) {
        echo "✅ Consulta de prueba exitosa\n";
        echo "   - ID: {$testQuery->id}\n";
        echo "   - Tipo: " . ($testQuery->tipo_mantenimiento ?? 'NULL') . "\n";
        echo "   - Estado: " . ($testQuery->estado ?? 'NULL') . "\n";
        echo "   - Fecha programada: " . ($testQuery->fecha_programada ?? 'NULL') . "\n";
        echo "   - Fecha mantenimiento: " . ($testQuery->fecha_mantenimiento ?? 'NULL') . "\n";
    } else {
        echo "⚠️  No hay registros para probar\n";
    }
    
    echo "\n🎉 Columnas verificadas y agregadas exitosamente!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}
