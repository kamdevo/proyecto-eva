<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICACIÓN EXACTA DE TABLAS ===\n\n";

// 1. Verificar tabla mantenimiento y sus relaciones
echo "🔧 TABLA MANTENIMIENTO:\n";
try {
    $mant_columns = \Illuminate\Support\Facades\Schema::getColumnListing('mantenimiento');
    echo "Columnas: " . implode(', ', $mant_columns) . "\n";
    
    // Verificar datos de un mantenimiento para ver estructura real
    $sample_mant = \Illuminate\Support\Facades\DB::table('mantenimiento')
        ->where('equipo_id', 121)
        ->first();
    
    if ($sample_mant) {
        echo "Datos ejemplo:\n";
        foreach ($sample_mant as $key => $value) {
            echo "  $key: $value\n";
        }
    } else {
        echo "No hay mantenimientos para equipo 121\n";
    }
    
    // Buscar proveedores o técnicos
    echo "\nTablas relacionadas con proveedores:\n";
    $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
    foreach ($tables as $table) {
        $table_name = array_values((array)$table)[0];
        if (strpos(strtolower($table_name), 'proveedor') !== false || 
            strpos(strtolower($table_name), 'tecnico') !== false ||
            strpos(strtolower($table_name), 'manten') !== false) {
            echo "  - $table_name\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n📄 TABLA ARCHIVOS:\n";
try {
    $arch_columns = \Illuminate\Support\Facades\Schema::getColumnListing('archivos');
    echo "Columnas: " . implode(', ', $arch_columns) . "\n";
    
    // Verificar datos de un archivo para ver estructura real
    $sample_arch = \Illuminate\Support\Facades\DB::table('archivos')
        ->limit(1)
        ->first();
    
    if ($sample_arch) {
        echo "Datos ejemplo:\n";
        foreach ($sample_arch as $key => $value) {
            echo "  $key: " . substr($value, 0, 50) . "\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n🔗 TABLA EQUIPO_ARCHIVO:\n";
try {
    $eq_arch_columns = \Illuminate\Support\Facades\Schema::getColumnListing('equipo_archivo');
    echo "Columnas: " . implode(', ', $eq_arch_columns) . "\n";
    
    // Verificar datos de la relación
    $sample_rel = \Illuminate\Support\Facades\DB::table('equipo_archivo')
        ->where('equipo_id', 121)
        ->first();
    
    if ($sample_rel) {
        echo "Datos ejemplo para equipo 121:\n";
        foreach ($sample_rel as $key => $value) {
            echo "  $key: $value\n";
        }
    } else {
        echo "No hay archivos para equipo 121\n";
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== BÚSQUEDA DE MANTENIMIENTOS EN OTROS EQUIPOS ===\n";
try {
    $mant_count = \Illuminate\Support\Facades\DB::table('mantenimiento')->count();
    echo "Total mantenimientos en BD: $mant_count\n";
    
    if ($mant_count > 0) {
        $sample_any = \Illuminate\Support\Facades\DB::table('mantenimiento')
            ->limit(1)
            ->first();
        
        echo "Ejemplo de mantenimiento cualquiera:\n";
        foreach ($sample_any as $key => $value) {
            echo "  $key: $value\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== BÚSQUEDA DE ARCHIVOS EN OTROS EQUIPOS ===\n";
try {
    $arch_count = \Illuminate\Support\Facades\DB::table('equipo_archivo')->count();
    echo "Total relaciones equipo-archivo: $arch_count\n";
    
    if ($arch_count > 0) {
        $sample_rel_any = \Illuminate\Support\Facades\DB::table('equipo_archivo')
            ->limit(1)
            ->first();
        
        echo "Ejemplo de relación equipo-archivo:\n";
        foreach ($sample_rel_any as $key => $value) {
            echo "  $key: $value\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
