<?php
/**
 * ELIMINAR DESPUÉS DE USAR
 * Acceder: http://api.eva2.huv.gov.co/check-admin-pass.php?key=HUV2026
 */
if (!isset($_GET['key']) || $_GET['key'] !== 'HUV2026') {
    http_response_code(403); die('Acceso denegado');
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \Illuminate\Support\Facades\DB::table('usuarios')
    ->where('username', 'admin')
    ->select('id', 'username', 'email', 'password', 'active', 'estado')
    ->first();

$storedHash = $user->password ?? '';
$passToTest = $_GET['pass'] ?? 'password';

$result = [
    'usuario'          => $user->username ?? 'NO ENCONTRADO',
    'email'            => $user->email ?? '',
    'active'           => $user->active ?? '',
    'estado'           => $user->estado ?? '',
    'hash_length'      => strlen($storedHash),
    'hash_preview'     => substr($storedHash, 0, 7),   // solo el prefijo $2y$12
    'hash_full'        => $storedHash,
    'is_bcrypt'        => str_starts_with($storedHash, '$2y$'),
    'is_md5'           => strlen($storedHash) === 32 && ctype_xdigit($storedHash),
    'bcrypt_match'     => false,
    'md5_match'        => md5($passToTest) === $storedHash,
    'plain_match'      => $passToTest === $storedHash,
    'tested_password'  => $passToTest,
];

try {
    $result['bcrypt_match'] = \Illuminate\Support\Facades\Hash::check($passToTest, $storedHash);
} catch (\Exception $e) {
    $result['bcrypt_error'] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);
