<?php

use Illuminate\Support\Facades\DB;

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== USUARIOS EN LA BASE DE DATOS ===\n";
echo "Total de usuarios: " . DB::table('usuarios')->count() . "\n\n";

echo "Últimos usuarios registrados:\n";
$usuarios = DB::table('usuarios')
    ->latest('fecha_registro')
    ->take(5)
    ->get(['id', 'nombre', 'apellido', 'email', 'username', 'fecha_registro']);

foreach ($usuarios as $user) {
    echo "ID: {$user->id}\n";
    echo "Nombre: {$user->nombre} {$user->apellido}\n";
    echo "Email: {$user->email}\n";
    echo "Username: {$user->username}\n";
    echo "Registrado: {$user->fecha_registro}\n";
    echo "---\n";
}
