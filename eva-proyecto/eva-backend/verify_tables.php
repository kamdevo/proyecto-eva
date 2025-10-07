<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap de Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== VERIFICACIÓN DE TABLAS RELACIONADAS CON EQUIPOS ===\n\n";

try {
    // 1. Verificar si existen las tablas que usa getUserHistory
    $tablesToCheck = [
        'observaciones',
        'archivos_equipos', 
        'archivos',
        'equipo_archivo',
        'mantenimientos',
        'usuarios'
    ];
    
    echo "1. VERIFICANDO EXISTENCIA DE TABLAS:\n";
    foreach ($tablesToCheck as $table) {
        $exists = Schema::hasTable($table);
        echo "   - {$table}: " . ($exists ? "✓ EXISTE" : "❌ NO EXISTE") . "\n";
    }
    
    echo "\n2. ESTRUCTURA DE TABLA 'observaciones':\n";
    if (Schema::hasTable('observaciones')) {
        $columns = DB::select('DESCRIBE observaciones');
        foreach ($columns as $column) {
            echo "   - {$column->Field} ({$column->Type}) " . ($column->Null === 'NO' ? 'NOT NULL' : 'NULLABLE') . "\n";
        }
    }
    
    echo "\n3. ESTRUCTURA DE TABLA 'archivos' (si existe):\n";
    if (Schema::hasTable('archivos')) {
        $columns = DB::select('DESCRIBE archivos');
        foreach ($columns as $column) {
            echo "   - {$column->Field} ({$column->Type}) " . ($column->Null === 'NO' ? 'NOT NULL' : 'NULLABLE') . "\n";
        }
    }
    
    echo "\n4. ESTRUCTURA DE TABLA 'equipo_archivo' (si existe):\n";
    if (Schema::hasTable('equipo_archivo')) {
        $columns = DB::select('DESCRIBE equipo_archivo');
        foreach ($columns as $column) {
            echo "   - {$column->Field} ({$column->Type}) " . ($column->Null === 'NO' ? 'NOT NULL' : 'NULLABLE') . "\n";
        }
    }
    
    echo "\n5. BUSCAR TABLAS QUE CONTENGAN 'archivo' EN EL NOMBRE:\n";
    $tables = DB::select('SHOW TABLES');
    $databaseName = DB::connection()->getDatabaseName();
    $tableColumn = "Tables_in_{$databaseName}";
    
    foreach ($tables as $table) {
        $tableName = $table->$tableColumn;
        if (stripos($tableName, 'archivo') !== false) {
            echo "   - ENCONTRADA: {$tableName}\n";
        }
    }
    
    echo "\n6. BUSCAR TABLAS QUE CONTENGAN 'observ' EN EL NOMBRE:\n";
    foreach ($tables as $table) {
        $tableName = $table->$tableColumn;
        if (stripos($tableName, 'observ') !== false) {
            echo "   - ENCONTRADA: {$tableName}\n";
        }
    }
    
    echo "\n7. BUSCAR TABLAS QUE CONTENGAN 'mantenimiento' EN EL NOMBRE:\n";
    foreach ($tables as $table) {
        $tableName = $table->$tableColumn;
        if (stripos($tableName, 'mantenimiento') !== false) {
            echo "   - ENCONTRADA: {$tableName}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DE VERIFICACIÓN ===\n";
