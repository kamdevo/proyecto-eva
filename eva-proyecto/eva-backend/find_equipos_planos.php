<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Buscar equipos con datos de planos
    $equipos = \Illuminate\Support\Facades\DB::table('equipos')
        ->whereNotNull('plano')
        ->where('plano', '!=', 'N;')
        ->where('plano', '!=', '')
        ->select('id', 'name', 'plano')
        ->limit(3)
        ->get();
    
    echo "=== EQUIPOS CON DATOS DE PLANOS ===\n";
    foreach($equipos as $equipo) {
        echo "ID: " . $equipo->id . "\n";
        echo "Nombre: " . $equipo->name . "\n";
        echo "Plano (raw): " . $equipo->plano . "\n";
        
        // Deserializar
        $plano_data = @unserialize($equipo->plano);
        if ($plano_data !== false) {
            echo "Plano deserializado:\n";
            print_r($plano_data);
        }
        echo "----------------------------\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
