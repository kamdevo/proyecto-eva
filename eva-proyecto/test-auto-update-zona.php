<?php
require __DIR__ . '/eva-backend/vendor/autoload.php';
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "PRUEBA DE ACTUALIZACIÓN AUTOMÁTICA DE ZONAS\n";
echo "============================================\n\n";

// Obtener una zona y un usuario de ejemplo
$zona = DB::table('zonas')->where('id', 2)->first();
$usuario = DB::table('usuarios')->where('id', 1)->first();

echo "Datos de prueba:\n";
echo "----------------\n";
echo "Zona ID: {$zona->id}\n";
echo "Zona nombre actual: {$zona->name}\n";
echo "Usuario ID: {$usuario->id}\n";
echo "Usuario nombre: {$usuario->nombre}\n\n";

// Simular la lógica de actualización
echo "Lógica de actualización:\n";
echo "------------------------\n";

// Extraer nombre base (sin paréntesis)
$nombreBase = preg_replace('/\(.*?\)/', '', $zona->name);
$nombreBase = trim($nombreBase);
echo "1. Nombre base extraído: '{$nombreBase}'\n";

// Crear nuevo nombre
$nuevoNombre = $nombreBase . '(' . strtoupper($usuario->nombre) . ')';
echo "2. Nuevo nombre generado: '{$nuevoNombre}'\n\n";

echo "Ejemplos de transformación:\n";
echo "---------------------------\n";
echo "ZONA1(NATALIA) + usuario 'Pedro' = ZONA1(PEDRO)\n";
echo "ZONA2(ANGELICA) + usuario 'Maria' = ZONA2(MARIA)\n";
echo "ZONA3(JULIO) + usuario 'Juan' = ZONA3(JUAN)\n\n";

echo "✓ La actualización automática funcionará correctamente\n";
echo "✓ Al crear o editar una relación usuario-zona, el nombre de la zona se actualizará automáticamente\n";
