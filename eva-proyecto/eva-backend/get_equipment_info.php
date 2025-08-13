<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

// Configurar la aplicación
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Usar el Query Builder directamente
    $equipo = \Illuminate\Support\Facades\DB::table('equipos')
        ->where('id', 1)
        ->select('id', 'name', 'marca', 'modelo', 'serial', 'code')
        ->first();
    
    if ($equipo) {
        echo "=== INFORMACIÓN DEL EQUIPO ID 1 ===\n";
        echo "ID: " . $equipo->id . "\n";
        echo "Nombre: " . $equipo->name . "\n";
        echo "Marca: " . $equipo->marca . "\n";
        echo "Modelo: " . $equipo->modelo . "\n";
        echo "Serie: " . $equipo->serial . "\n";
        echo "Código: " . $equipo->code . "\n";
        echo "=====================================\n";
    } else {
        echo "No se encontró el equipo con ID 1\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
