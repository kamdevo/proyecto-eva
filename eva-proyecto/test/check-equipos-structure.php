<?php
require_once 'eva-backend/vendor/autoload.php';
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ESTRUCTURA TABLA EQUIPOS ===\n";
$columns = DB::select("DESCRIBE equipos");
foreach ($columns as $column) {
    echo "- {$column->Field} ({$column->Type})\n";
}

// Verificar primer equipo
$equipo = DB::table('equipos')->first();
if ($equipo) {
    echo "\n=== PRIMER EQUIPO (datos reales) ===\n";
    foreach ($equipo as $field => $value) {
        echo "- $field: " . substr($value ?? 'NULL', 0, 50) . "\n";
    }
}
?>
