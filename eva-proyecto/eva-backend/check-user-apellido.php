<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// ID del usuario que estás editando (probablemente el administrador)
$userId = 131; // Cambia este ID según el usuario que estés editando

echo "🔍 Verificando usuario ID: {$userId}\n\n";

$usuario = DB::table('usuarios')->where('id', $userId)->first();

if (!$usuario) {
    echo "❌ Usuario no encontrado\n";
    exit;
}

echo "✅ Usuario encontrado:\n";
echo "   ID: {$usuario->id}\n";
echo "   Nombre: {$usuario->nombre}\n";
echo "   Apellido: '" . ($usuario->apellido ?? 'NULL') . "'\n";
echo "   Telefono: '" . ($usuario->telefono ?? 'NULL') . "'\n";
echo "   Email: {$usuario->email}\n";
echo "   Username: {$usuario->username}\n";
echo "   Rol ID: {$usuario->rol_id}\n";
echo "   Centro ID: " . ($usuario->centro_id ?? 'NULL') . "\n";
echo "   Empresa ID: " . ($usuario->id_empresa ?? 'NULL') . "\n\n";

// Verificar si el campo apellido está vacío
if (empty($usuario->apellido)) {
    echo "⚠️  PROBLEMA ENCONTRADO: El campo 'apellido' está VACÍO en la base de datos\n";
    echo "   Esto explica por qué el frontend muestra apellido vacío\n\n";
    
    echo "💡 SOLUCIÓN: Actualizar el campo apellido en la base de datos\n";
    echo "   Puedes ejecutar:\n";
    echo "   UPDATE usuarios SET apellido = 'Apellido del Usuario' WHERE id = {$userId};\n";
} else {
    echo "✅ El campo apellido tiene valor: '{$usuario->apellido}'\n";
}

echo "\n📊 Todos los campos de la tabla usuarios para este usuario:\n";
foreach ($usuario as $campo => $valor) {
    $valorMostrar = $valor ?? 'NULL';
    if (is_string($valorMostrar) && strlen($valorMostrar) > 50) {
        $valorMostrar = substr($valorMostrar, 0, 50) . '...';
    }
    echo "   {$campo}: {$valorMostrar}\n";
}
