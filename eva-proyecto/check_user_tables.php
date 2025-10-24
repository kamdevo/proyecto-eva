<?php

require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Buscando tablas relacionadas con usuarios y permisos:\n\n";

$tables = DB::select('SHOW TABLES');
$dbName = DB::getDatabaseName();

foreach ($tables as $table) {
    $tableName = $table->{"Tables_in_$dbName"};
    
    if (strpos($tableName, 'usuario') !== false || 
        strpos($tableName, 'permiso') !== false || 
        strpos($tableName, 'modulo') !== false ||
        strpos($tableName, 'rol') !== false ||
        strpos($tableName, 'accion') !== false ||
        strpos($tableName, 'menu') !== false) {
        echo "- $tableName\n";
        
        // Mostrar estructura de tabla
        $columns = DB::select("DESCRIBE $tableName");
        foreach ($columns as $col) {
            echo "  * {$col->Field} ({$col->Type})\n";
        }
        echo "\n";
    }
}
