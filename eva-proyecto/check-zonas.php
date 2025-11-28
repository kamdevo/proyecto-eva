<?php
require __DIR__ . '/eva-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Obtener 5 zonas de ejemplo
$zonas = DB::table('zonas')->take(10)->get();

echo "ESTRUCTURA DE ZONAS:\n";
echo "====================\n\n";

foreach ($zonas as $zona) {
    echo "ID: " . $zona->id . "\n";
    echo "Nombre: " . $zona->name . "\n";
    echo "---\n";
}

echo "\nTotal de zonas: " . DB::table('zonas')->count() . "\n";
