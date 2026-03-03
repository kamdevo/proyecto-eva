<?php
/**
 * Script temporal para resetear contraseña del admin
 * ELIMINAR después de usar
 * Acceder via: http://api.eva2.huv.gov.co/reset-admin-pass.php?key=HUV2026
 */

define('SECRET_KEY', 'HUV2026');

if (!isset($_GET['key']) || $_GET['key'] !== SECRET_KEY) {
    http_response_code(403);
    die(json_encode(['error' => 'Acceso denegado']));
}

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$newPassword = $_GET['newpass'] ?? 'Admin2026!';

try {
    $updated = \App\Models\Usuario::where('username', 'admin')->update([
        'password' => \Illuminate\Support\Facades\Hash::make($newPassword),
        'active'   => 'true',
        'estado'   => 1,
    ]);

    $user = \App\Models\Usuario::where('username', 'admin')
        ->select('id', 'username', 'email', 'active', 'estado', 'rol_id')
        ->first();

    header('Content-Type: application/json');
    echo json_encode([
        'success'       => true,
        'rows_updated'  => $updated,
        'new_password'  => $newPassword,
        'user'          => $user,
        'message'       => 'Contraseña actualizada. Elimina este archivo del servidor.',
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
