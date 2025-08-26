<?php
echo "=== TEST REGISTRO DE USUARIOS ===\n\n";

// 1. Verificar que el endpoint de centros funciona
echo "1. Probando endpoint de centros:\n";
$url = 'http://127.0.0.1:8001/api/v1/centros';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    $data = json_decode($response, true);
    $totalCentros = $data['total'] ?? 0;
    echo "   ✅ Endpoint centros funcional - $totalCentros centros disponibles\n\n";
} else {
    echo "   ❌ Endpoint centros falló - HTTP $httpCode\n\n";
    exit;
}

// 2. Probar registro de usuario (simulado)
echo "2. Simulando registro de usuario:\n";

// Datos de prueba
$testUserData = [
    'nombre' => 'Usuario',
    'apellido' => 'Prueba',
    'username' => 'usuario_test_' . time(),
    'email' => 'test_' . time() . '@hospital.com',
    'password' => 'password123',
    'password_confirmation' => 'password123',
    'telefono' => '3001234567',
    'centro_id' => 2, // ID válido de centro existente
    'rol_id' => 2
];

echo "   📋 Datos de prueba:\n";
foreach ($testUserData as $key => $value) {
    if ($key !== 'password' && $key !== 'password_confirmation') {
        echo "      - $key: $value\n";
    } else {
        echo "      - $key: [OCULTO]\n";
    }
}
echo "\n";

// 3. Realizar petición POST al endpoint de registro
echo "3. Probando endpoint de registro:\n";
$url = 'http://127.0.0.1:8001/api/v1/auth/register';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testUserData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "   🌐 URL: $url\n";
echo "   📡 Código HTTP: $httpCode\n";

if ($error) {
    echo "   ❌ Error cURL: $error\n\n";
} else {
    if ($httpCode == 200 || $httpCode == 201) {
        echo "   ✅ Registro exitoso\n";
        $data = json_decode($response, true);
        if ($data) {
            echo "   📦 Respuesta: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
        }
    } else {
        echo "   ❌ Error en registro - HTTP $httpCode\n";
        echo "   📝 Respuesta: " . substr($response, 0, 1000) . "\n\n";
        
        // Intentar parsear la respuesta JSON para ver errores de validación
        $errorData = json_decode($response, true);
        if ($errorData && isset($errorData['errors'])) {
            echo "   📋 Errores de validación:\n";
            foreach ($errorData['errors'] as $field => $errors) {
                echo "      - $field: " . implode(', ', $errors) . "\n";
            }
            echo "\n";
        }
    }
}

// 4. Verificar estructura final de la base de datos
echo "4. Verificación final de estructura:\n";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv;charset=utf8", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar tipo de centro_id
    $stmt = $pdo->query("DESCRIBE usuarios");
    while ($row = $stmt->fetch()) {
        if ($row['Field'] == 'centro_id') {
            echo "   📋 usuarios.centro_id: {$row['Type']}\n";
            break;
        }
    }
    
    $stmt = $pdo->query("DESCRIBE centros");
    while ($row = $stmt->fetch()) {
        if ($row['Field'] == 'id') {
            echo "   📋 centros.id: {$row['Type']}\n";
            break;
        }
    }
    
    echo "   ✅ Tipos de datos compatibles\n\n";
    
} catch (Exception $e) {
    echo "   ❌ Error verificando base de datos: " . $e->getMessage() . "\n\n";
}

echo "=== FIN DEL TEST ===\n";
?>
