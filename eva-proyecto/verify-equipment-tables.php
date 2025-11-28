<?php
/**
 * Script para verificar tablas y columnas relacionadas con equipos
 * Documentos, Preventivos y Observaciones
 */

require __DIR__ . '/eva-backend/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Cargar configuración de Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICACIÓN DE TABLAS Y COLUMNAS PARA HOJA DE VIDA DEL EQUIPO ===\n\n";

// 1. TABLA DE DOCUMENTOS
echo "1. TABLA: equipo_archivo\n";
echo str_repeat("-", 80) . "\n";
if (Schema::hasTable('equipo_archivo')) {
    $columns = Schema::getColumnListing('equipo_archivo');
    echo "✅ Tabla existe\n";
    echo "Columnas:\n";
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    // Verificar datos de ejemplo
    $count = DB::table('equipo_archivo')->count();
    echo "\nTotal de registros: $count\n";
    
    if ($count > 0) {
        $sample = DB::table('equipo_archivo')->first();
        echo "\nEjemplo de registro:\n";
        print_r($sample);
    }
} else {
    echo "❌ Tabla NO existe\n";
}

echo "\n\n";

// 2. TABLA DE MANTENIMIENTOS PREVENTIVOS
echo "2. TABLA: mantenimiento (preventivos)\n";
echo str_repeat("-", 80) . "\n";
if (Schema::hasTable('mantenimiento')) {
    $columns = Schema::getColumnListing('mantenimiento');
    echo "✅ Tabla existe\n";
    echo "Columnas:\n";
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    // Verificar datos de ejemplo
    $count = DB::table('mantenimiento')->count();
    echo "\nTotal de registros: $count\n";
    
    if ($count > 0) {
        $sample = DB::table('mantenimiento')->first();
        echo "\nEjemplo de registro:\n";
        print_r($sample);
    }
} else {
    echo "❌ Tabla NO existe\n";
}

echo "\n\n";

// 3. TABLA DE OBSERVACIONES
echo "3. TABLA: observaciones\n";
echo str_repeat("-", 80) . "\n";
if (Schema::hasTable('observaciones')) {
    $columns = Schema::getColumnListing('observaciones');
    echo "✅ Tabla existe\n";
    echo "Columnas:\n";
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    // Verificar datos de ejemplo
    $count = DB::table('observaciones')->count();
    echo "\nTotal de registros: $count\n";
    
    if ($count > 0) {
        $sample = DB::table('observaciones')->first();
        echo "\nEjemplo de registro:\n";
        print_r($sample);
    }
} else {
    echo "❌ Tabla NO existe\n";
}

echo "\n\n";

// 4. VERIFICAR RELACIONES CON EQUIPOS
echo "4. VERIFICACIÓN DE RELACIONES\n";
echo str_repeat("-", 80) . "\n";

// Documentos por equipo
if (Schema::hasTable('equipo_archivo')) {
    $equipoId = DB::table('equipo_archivo')->value('equipo_id');
    if ($equipoId) {
        $docsCount = DB::table('equipo_archivo')
            ->where('equipo_id', $equipoId)
            ->count();
        echo "Equipo ID $equipoId tiene $docsCount documentos\n";
    }
}

// Preventivos por equipo
if (Schema::hasTable('mantenimiento')) {
    $equipoId = DB::table('mantenimiento')->value('equipo_id');
    if ($equipoId) {
        $prevCount = DB::table('mantenimiento')
            ->where('equipo_id', $equipoId)
            ->count();
        echo "Equipo ID $equipoId tiene $prevCount mantenimientos preventivos\n";
    }
}

// Observaciones por equipo
if (Schema::hasTable('observaciones')) {
    $equipoId = DB::table('observaciones')->value('equipo_id');
    if ($equipoId) {
        $obsCount = DB::table('observaciones')
            ->where('equipo_id', $equipoId)
            ->count();
        echo "Equipo ID $equipoId tiene $obsCount observaciones\n";
    }
}

echo "\n\n";

// 5. VERIFICAR ARCHIVOS EN STORAGE
echo "5. VERIFICACIÓN DE DIRECTORIOS DE ARCHIVOS\n";
echo str_repeat("-", 80) . "\n";

$directories = [
    'Documentos Equipos' => __DIR__ . '/eva-backend/storage/app/public/equipos/archivos',
    'Mantenimientos' => __DIR__ . '/eva-backend/storage/app/public/mantenimientos',
    'Observaciones' => __DIR__ . '/eva-backend/storage/app/public/observaciones',
];

foreach ($directories as $name => $path) {
    if (is_dir($path)) {
        $files = scandir($path);
        $fileCount = count($files) - 2; // Excluir . y ..
        echo "✅ $name: $path\n";
        echo "   Archivos encontrados: $fileCount\n";
        
        if ($fileCount > 0 && $fileCount <= 5) {
            echo "   Ejemplos:\n";
            foreach (array_slice($files, 2, 5) as $file) {
                echo "     - $file\n";
            }
        }
    } else {
        echo "❌ $name: Directorio NO existe\n";
        echo "   Ruta esperada: $path\n";
    }
    echo "\n";
}

echo "\n=== VERIFICACIÓN COMPLETADA ===\n";
