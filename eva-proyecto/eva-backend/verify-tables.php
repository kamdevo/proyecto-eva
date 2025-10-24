<?php
require_once 'vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== VERIFICACIÓN DE TABLAS PARA EXPORTAR PREVENTIVOS ===\n\n";

// Tablas a verificar
$tables = [
    'mantenimiento',
    'equipos', 
    'servicios',
    'areas',
    'sedes',
    'estadoequipos',
    'proveedores_mantenimiento'
];

foreach ($tables as $table) {
    echo "🔍 TABLA: $table\n";
    echo str_repeat("-", 50) . "\n";
    
    try {
        // Verificar si la tabla existe
        $exists = DB::select("SHOW TABLES LIKE '$table'");
        
        if (empty($exists)) {
            echo "❌ TABLA NO EXISTE: $table\n\n";
            continue;
        }
        
        // Obtener columnas
        $columns = DB::select("SHOW COLUMNS FROM $table");
        
        echo "✅ Tabla existe, columnas disponibles:\n";
        foreach ($columns as $column) {
            $nullable = $column->Null === 'YES' ? 'NULL' : 'NOT NULL';
            $default = $column->Default !== null ? "DEFAULT: {$column->Default}" : '';
            $extra = $column->Extra ? "({$column->Extra})" : '';
            
            echo "  • {$column->Field} [{$column->Type}] {$nullable} {$default} {$extra}\n";
        }
        
        // Contar registros
        $count = DB::table($table)->count();
        echo "📊 Total registros: $count\n";
        
        // Mostrar algunos registros de muestra si existen
        if ($count > 0) {
            $sample = DB::table($table)->limit(2)->get();
            echo "📋 Muestra de datos:\n";
            foreach ($sample as $index => $record) {
                echo "  Registro " . ($index + 1) . ":\n";
                foreach ($record as $field => $value) {
                    $displayValue = $value !== null ? substr(str_replace(["\n", "\r"], ' ', $value), 0, 50) : 'NULL';
                    echo "    $field: $displayValue\n";
                }
                echo "\n";
            }
        }
        
    } catch (\Exception $e) {
        echo "❌ ERROR verificando tabla $table: " . $e->getMessage() . "\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n\n";
}

// Verificaciones específicas para el export
echo "🎯 VERIFICACIONES ESPECÍFICAS PARA EXPORT:\n\n";

// 1. Verificar relaciones
echo "🔗 1. VERIFICANDO RELACIONES:\n";
try {
    $query = DB::table('mantenimiento as m')
        ->leftJoin('equipos as e', 'm.equipo_id', '=', 'e.id')
        ->select('m.id', 'm.equipo_id', 'e.id as equipo_real_id', 'e.name')
        ->limit(5)
        ->get();
    
    echo "✅ Relación mantenimiento -> equipos funciona\n";
    echo "📊 Muestra de relación:\n";
    foreach ($query as $item) {
        echo "  Mantenimiento ID: {$item->id}, Equipo ID: {$item->equipo_id}, Equipo encontrado: " . ($item->equipo_real_id ? "SÍ ({$item->name})" : "NO") . "\n";
    }
} catch (\Exception $e) {
    echo "❌ Error en relación mantenimiento -> equipos: " . $e->getMessage() . "\n";
}

echo "\n";

// 2. Verificar si existe campo codigo en alguna tabla relacionada
echo "🔍 2. BUSCANDO CAMPO 'codigo' EN TABLAS RELACIONADAS:\n";
$tablesForCodigo = ['mantenimiento', 'equipos', 'ordenes', 'preventivos'];

foreach ($tablesForCodigo as $table) {
    try {
        $columns = DB::select("SHOW COLUMNS FROM $table WHERE Field LIKE '%codigo%'");
        if (!empty($columns)) {
            echo "✅ Campos con 'codigo' en tabla $table:\n";
            foreach ($columns as $col) {
                echo "  • {$col->Field} [{$col->Type}]\n";
            }
        } else {
            echo "❌ No hay campos 'codigo' en tabla $table\n";
        }
    } catch (\Exception $e) {
        echo "⚠️ Tabla $table no existe o error: " . $e->getMessage() . "\n";
    }
}

echo "\n";

// 3. Buscar tabla de preventivos
echo "🔍 3. BUSCANDO TABLAS RELACIONADAS CON PREVENTIVOS:\n";
$preventiveTables = DB::select("SHOW TABLES LIKE '%preventiv%'");
if (!empty($preventiveTables)) {
    foreach ($preventiveTables as $table) {
        $tableName = array_values((array)$table)[0];
        echo "✅ Tabla encontrada: $tableName\n";
        
        $columns = DB::select("SHOW COLUMNS FROM $tableName");
        echo "  Columnas:\n";
        foreach ($columns as $column) {
            echo "    • {$column->Field} [{$column->Type}]\n";
        }
    }
} else {
    echo "❌ No se encontraron tablas de preventivos\n";
}

echo "\n";

// 4. Verificar estructura de archivo
echo "🔍 4. VERIFICANDO CAMPOS PARA ARCHIVO EN MANTENIMIENTO:\n";
try {
    $archiveColumns = DB::select("SHOW COLUMNS FROM mantenimiento WHERE Field LIKE '%archivo%' OR Field LIKE '%file%' OR Field LIKE '%documento%'");
    if (!empty($archiveColumns)) {
        echo "✅ Campos de archivo encontrados:\n";
        foreach ($archiveColumns as $col) {
            echo "  • {$col->Field} [{$col->Type}]\n";
        }
    } else {
        echo "❌ No se encontraron campos de archivo en mantenimiento\n";
    }
} catch (\Exception $e) {
    echo "❌ Error verificando campos de archivo: " . $e->getMessage() . "\n";
}

echo "\n=== FIN VERIFICACIÓN ===\n";
?>
