<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 Buscando usuario 'invitado' o 'administrador131@gmail.com'\n\n";

// Buscar por username
$usuario = DB::table('usuarios')
    ->where('username', 'invitado')
    ->orWhere('email', 'administrador131@gmail.com')
    ->first();

if (!$usuario) {
    echo "❌ Usuario no encontrado\n";
    echo "Buscando todos los usuarios con nombre 'administrador'...\n\n";
    
    $usuarios = DB::table('usuarios')
        ->where('nombre', 'like', '%administrador%')
        ->get();
    
    foreach ($usuarios as $u) {
        echo "ID: {$u->id} | Nombre: {$u->nombre} | Username: {$u->username} | Email: {$u->email} | Apellido: '" . ($u->apellido ?? 'VACÍO') . "'\n";
    }
    exit;
}

echo "✅ Usuario encontrado:\n";
echo "   ID: {$usuario->id}\n";
echo "   Nombre: {$usuario->nombre}\n";
echo "   Apellido: '" . ($usuario->apellido ?? 'NULL/VACÍO') . "' " . (empty($usuario->apellido) ? "⚠️ VACÍO" : "✅") . "\n";
echo "   Telefono: '" . ($usuario->telefono ?? 'NULL/VACÍO') . "' " . (empty($usuario->telefono) ? "⚠️ VACÍO" : "✅") . "\n";
echo "   Email: {$usuario->email}\n";
echo "   Username: {$usuario->username}\n";
echo "   Rol ID: {$usuario->rol_id}\n";
echo "   Centro ID: " . ($usuario->centro_id ?? 'NULL') . "\n\n";

// Verificar campos vacíos
$camposVacios = [];
if (empty($usuario->apellido)) $camposVacios[] = 'apellido';
if (empty($usuario->telefono)) $camposVacios[] = 'telefono';

if (!empty($camposVacios)) {
    echo "⚠️  PROBLEMA: Los siguientes campos están VACÍOS en la BD:\n";
    foreach ($camposVacios as $campo) {
        echo "   - {$campo}\n";
    }
    echo "\n💡 SOLUCIÓN SQL:\n";
    echo "UPDATE usuarios SET ";
    $updates = [];
    if (in_array('apellido', $camposVacios)) $updates[] = "apellido = 'García'";
    if (in_array('telefono', $camposVacios)) $updates[] = "telefono = '3001234567'";
    echo implode(', ', $updates);
    echo " WHERE id = {$usuario->id};\n";
} else {
    echo "✅ Todos los campos tienen valores\n";
}
