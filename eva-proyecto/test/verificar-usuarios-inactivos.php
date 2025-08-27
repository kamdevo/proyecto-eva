<?php

/**
 * Script para verificar usuarios inactivos en el sistema
 */

echo "🔍 VERIFICANDO USUARIOS INACTIVOS EN EL SISTEMA\n";
echo "=" . str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json'
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response,
        'error' => $error
    ];
}

// Obtener todos los usuarios
echo "📋 Obteniendo lista completa de usuarios...\n";
$response = makeRequest("$baseUrl/usuarios-public?per_page=100");

if ($response['status'] !== 200 || !$response['data']['success']) {
    echo "❌ Error obteniendo usuarios: " . ($response['data']['message'] ?? $response['error']) . "\n";
    exit(1);
}

$usuarios = $response['data']['data']['data'];
$totalUsuarios = count($usuarios);

echo "✅ Total de usuarios encontrados: $totalUsuarios\n\n";

// Separar usuarios por estado
$usuariosActivos = [];
$usuariosInactivos = [];
$usuariosSinEstado = [];

foreach ($usuarios as $usuario) {
    $userData = is_array($usuario) ? (object)$usuario : $usuario;
    
    if (!isset($userData->active)) {
        $usuariosSinEstado[] = $userData;
    } elseif ($userData->active === 'false' || $userData->active === false) {
        $usuariosInactivos[] = $userData;
    } else {
        $usuariosActivos[] = $userData;
    }
}

echo "📊 RESUMEN DE ESTADOS:\n";
echo "✅ Usuarios Activos: " . count($usuariosActivos) . "\n";
echo "❌ Usuarios Inactivos: " . count($usuariosInactivos) . "\n";
echo "❓ Usuarios sin estado definido: " . count($usuariosSinEstado) . "\n\n";

// Mostrar usuarios inactivos
if (!empty($usuariosInactivos)) {
    echo "🔴 USUARIOS INACTIVOS ENCONTRADOS:\n";
    echo str_repeat("-", 80) . "\n";
    
    foreach ($usuariosInactivos as $usuario) {
        echo sprintf(
            "ID: %-4s | Username: %-20s | Email: %-30s | Nombre: %s %s\n",
            $usuario->id ?? 'N/A',
            $usuario->username ?? 'N/A',
            $usuario->email ?? 'N/A',
            $usuario->nombre ?? '',
            $usuario->apellido ?? ''
        );
    }
    echo "\n";
} else {
    echo "ℹ️  No se encontraron usuarios inactivos.\n\n";
}

// Mostrar usuarios de testing (que contengan 'test' en el nombre)
echo "🧪 USUARIOS DE TESTING (contienen 'test'):\n";
echo str_repeat("-", 80) . "\n";

$usuariosTesting = array_filter($usuarios, function($usuario) {
    $userData = is_array($usuario) ? (object)$usuario : $usuario;
    $username = strtolower($userData->username ?? '');
    $email = strtolower($userData->email ?? '');
    $nombre = strtolower($userData->nombre ?? '');
    
    return strpos($username, 'test') !== false || 
           strpos($email, 'test') !== false || 
           strpos($nombre, 'test') !== false;
});

if (!empty($usuariosTesting)) {
    foreach ($usuariosTesting as $usuario) {
        $userData = is_array($usuario) ? (object)$usuario : $usuario;
        $estado = ($userData->active ?? 'true') === 'false' ? '❌ INACTIVO' : '✅ ACTIVO';
        
        echo sprintf(
            "ID: %-4s | Username: %-20s | Email: %-30s | Estado: %s\n",
            $userData->id ?? 'N/A',
            $userData->username ?? 'N/A',
            $userData->email ?? 'N/A',
            $estado
        );
    }
} else {
    echo "ℹ️  No se encontraron usuarios de testing.\n";
}

echo "\n";

// Crear un usuario de testing inactivo si no existe
echo "🔧 CREANDO USUARIO DE TESTING INACTIVO...\n";
echo str_repeat("-", 60) . "\n";

$timestamp = time();
$testUser = [
    'nombre' => 'Usuario',
    'apellido' => 'Testing',
    'username' => "test_user_$timestamp",
    'email' => "test_user_$timestamp@testing.com",
    'password' => 'testing123',
    'telefono' => '1234567890',
    'rol_id' => 2, // Usuario normal
    'centro_id' => 1,
    'id_empresa' => 1,
    'estado' => 1,
    'active' => 'false' // INACTIVO por defecto
];

// Intentar crear el usuario (necesitaríamos token de admin)
echo "👤 Usuario de testing que se puede crear:\n";
echo "   Username: {$testUser['username']}\n";
echo "   Email: {$testUser['email']}\n";
echo "   Password: {$testUser['password']}\n";
echo "   Estado: INACTIVO (active: false)\n\n";

echo "💡 INSTRUCCIONES:\n";
echo "1. Usa las credenciales de admin para crear este usuario desde la interfaz\n";
echo "2. O ejecuta el endpoint de registro con estos datos\n";
echo "3. El usuario se creará INACTIVO por defecto\n";
echo "4. Luego podrás activarlo desde el panel de administración\n\n";

echo "🎯 USUARIOS RECOMENDADOS PARA ACTIVAR:\n";
if (!empty($usuariosInactivos)) {
    echo "Puedes activar cualquiera de los usuarios inactivos mostrados arriba.\n";
} else {
    echo "No hay usuarios inactivos actualmente. Crea uno nuevo usando los datos de testing.\n";
}

echo "\n✅ Verificación completa!\n";
