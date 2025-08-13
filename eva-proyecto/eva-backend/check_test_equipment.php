<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

try {
    $equipos = \Illuminate\Support\Facades\DB::table('equipos')
        ->where('name', 'like', '%Test%')
        ->orWhere('code', 'like', '%TEST%')
        ->orWhere('code', 'like', '%CHECKBOX%')
        ->select('id', 'name', 'code', 'serial', 'marca', 'modelo', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

    echo "=== EQUIPOS DE PRUEBA CREADOS ===\n\n";
    
    if ($equipos->count() > 0) {
        foreach ($equipos as $equipo) {
            echo "ID: {$equipo->id}\n";
            echo "NOMBRE: {$equipo->name}\n";
            echo "CÓDIGO: {$equipo->code}\n";
            echo "SERIAL: {$equipo->serial}\n";
            echo "MARCA: {$equipo->marca}\n";
            echo "MODELO: {$equipo->modelo}\n";
            echo "FECHA CREACIÓN: {$equipo->created_at}\n";
            echo "----------------------------------------\n";
        }
    } else {
        echo "No se encontraron equipos de prueba.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
