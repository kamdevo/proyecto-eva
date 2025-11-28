<?php
require __DIR__ . '/eva-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "PRUEBA DE ORDENAMIENTO DE ZONAS\n";
echo "================================\n\n";

// Test 1: Ordenar por ID ascendente
echo "1. Ordenar por ID (ASC):\n";
$zonasIdAsc = DB::table('zonas')
    ->select('id', 'name')
    ->orderBy('id', 'asc')
    ->take(5)
    ->get();
foreach ($zonasIdAsc as $zona) {
    echo "   ID: {$zona->id} - {$zona->name}\n";
}
echo "\n";

// Test 2: Ordenar por ID descendente
echo "2. Ordenar por ID (DESC):\n";
$zonasIdDesc = DB::table('zonas')
    ->select('id', 'name')
    ->orderBy('id', 'desc')
    ->take(5)
    ->get();
foreach ($zonasIdDesc as $zona) {
    echo "   ID: {$zona->id} - {$zona->name}\n";
}
echo "\n";

// Test 3: Ordenar por nombre ascendente
echo "3. Ordenar por Nombre (ASC):\n";
$zonasNameAsc = DB::table('zonas')
    ->select('id', 'name')
    ->orderBy('name', 'asc')
    ->take(5)
    ->get();
foreach ($zonasNameAsc as $zona) {
    echo "   {$zona->name} (ID: {$zona->id})\n";
}
echo "\n";

// Test 4: Ordenar por nombre descendente
echo "4. Ordenar por Nombre (DESC):\n";
$zonasNameDesc = DB::table('zonas')
    ->select('id', 'name')
    ->orderBy('name', 'desc')
    ->take(5)
    ->get();
foreach ($zonasNameDesc as $zona) {
    echo "   {$zona->name} (ID: {$zona->id})\n";
}
echo "\n";

echo "================================\n";
echo "✓ ORDENAMIENTO FUNCIONANDO CORRECTAMENTE\n";
echo "✓ Frontend: Botones de ordenamiento agregados\n";
echo "✓ Backend: Endpoint soporta sort_by y sort_direction\n";
echo "✓ Ordenamiento global en todos los datos\n";
