<?php
echo "=== PRUEBA DIRECTA CREAR USUARIO ===\n\n";

// Datos del usuario
$usuario = [
    'nombre' => 'Test Usuario',
    'apellido' => 'Apellido Test', 
    'telefono' => '123456789',
    'email' => 'test' . time() . '@test.com',
    'username' => 'testuser' . time(),
    'password' => 'password123',
    'rol_id' => 3
];

echo "Datos a enviar:\n";
echo "Email: {$usuario['email']}\n";
echo "Username: {$usuario['username']}\n\n";

// Llamada con CURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://192.168.2.146:8001/api/v1/usuarios");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($usuario));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

// Ejecutar
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "RESULTADO:\n";
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

if ($httpCode === 200 || $httpCode === 201) {
    $data = json_decode($response, true);
    if (isset($data['success']) && $data['success']) {
        echo "✅ ¡ÉXITO! Usuario creado con ID: {$data['data']['id']}\n";
        echo "✅ Mensaje: {$data['message']}\n";
        
        // Verificar que se guardó
        echo "\n🔍 VERIFICANDO EN BD:\n";
        curl_setopt($ch, CURLOPT_URL, "http://192.168.2.146:8001/api/v1/usuarios");
        curl_setopt($ch, CURLOPT_POST, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, null);
        
        $listResponse = curl_exec($ch);
        $listData = json_decode($listResponse, true);
        
        if ($listData && isset($listData['data']['data'])) {
            $found = false;
            foreach ($listData['data']['data'] as $user) {
                if ($user['email'] === $usuario['email']) {
                    echo "✅ Usuario encontrado: {$user['nombre']} - {$user['email']}\n";
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                echo "❌ Usuario no encontrado en la lista\n";
            }
        }
        
    } else {
        echo "❌ Error en respuesta: {$data['message']}\n";
    }
} else {
    echo "❌ Error HTTP $httpCode\n";
}

curl_close($ch);
?>
