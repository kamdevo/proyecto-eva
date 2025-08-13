<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Obtener el equipo con los campos de manual y plano
    $equipo = \Illuminate\Support\Facades\DB::table('equipos')
        ->where('id', 1)
        ->select('id', 'name', 'manual', 'plano')
        ->first();
    
    if ($equipo) {
        echo "=== EQUIPO ID 1 - DATOS DE MANUALES Y PLANOS ===\n";
        echo "ID: " . $equipo->id . "\n";
        echo "Nombre: " . $equipo->name . "\n";
        echo "Manual (raw): " . ($equipo->manual ?: 'NULL') . "\n";
        echo "Manual (tipo): " . gettype($equipo->manual) . "\n";
        echo "Plano (raw): " . ($equipo->plano ?: 'NULL') . "\n";
        echo "Plano (tipo): " . gettype($equipo->plano) . "\n";
        echo "==============================================\n";
        
        // Intentar deserializar manualmente
        if ($equipo->manual) {
            echo "\n=== INTENTANDO DESERIALIZAR MANUAL ===\n";
            $manual_data = @unserialize($equipo->manual);
            if ($manual_data !== false) {
                echo "Manual deserializado exitosamente:\n";
                print_r($manual_data);
            } else {
                echo "Error al deserializar manual\n";
            }
        }
        
        if ($equipo->plano) {
            echo "\n=== INTENTANDO DESERIALIZAR PLANO ===\n";
            $plano_data = @unserialize($equipo->plano);
            if ($plano_data !== false) {
                echo "Plano deserializado exitosamente:\n";
                print_r($plano_data);
            } else {
                echo "Error al deserializar plano\n";
            }
        }
        
    } else {
        echo "No se encontró el equipo con ID 1\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
