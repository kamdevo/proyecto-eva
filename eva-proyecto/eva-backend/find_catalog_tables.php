<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Obtener todas las tablas de la base de datos
    $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
    
    echo "=== TABLAS DE CATÁLOGOS ===\n";
    foreach($tables as $table) {
        $tableName = array_values((array)$table)[0];
        
        // Filtrar tablas que contengan palabras clave
        if(strpos($tableName, 'fuente') !== false || 
           strpos($tableName, 'tecnologia') !== false || 
           strpos($tableName, 'frecuencia') !== false || 
           strpos($tableName, 'clasificacion') !== false || 
           strpos($tableName, 'estado') !== false ||
           strpos($tableName, 'biomedica') !== false ||
           strpos($tableName, 'riesgo') !== false) {
            echo $tableName . "\n";
        }
    }
    
    // También buscar algunas tablas específicas importantes
    echo "\n=== TABLAS PRINCIPALES ===\n";
    $importantTables = ['servicios', 'areas', 'sedes', 'propietarios', 'tadquisicion'];
    
    foreach($importantTables as $tableName) {
        $exists = \Illuminate\Support\Facades\DB::select("SHOW TABLES LIKE '$tableName'");
        if(!empty($exists)) {
            echo "$tableName ✅\n";
        } else {
            echo "$tableName ❌\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
