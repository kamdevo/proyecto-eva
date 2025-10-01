<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== BUSCANDO TABLAS DE MANTENIMIENTO ===\n\n";

// Obtener todas las tablas
$tables = DB::select('SHOW TABLES');
$dbName = DB::connection()->getDatabaseName();

echo "Base de datos: {$dbName}\n\n";
echo "Tablas que contienen 'plan' o 'mantenimiento':\n";

foreach ($tables as $table) {
    $tableName = $table->{"Tables_in_{$dbName}"};
    
    if (stripos($tableName, 'plan') !== false || stripos($tableName, 'mantenimiento') !== false) {
        echo "  ✓ {$tableName}\n";
        
        // Mostrar conteo de registros
        try {
            $count = DB::table($tableName)->count();
            echo "    Registros: {$count}\n";
        } catch (\Exception $e) {
            echo "    Error al contar\n";
        }
    }
}

echo "\n=== FIN ===\n";
