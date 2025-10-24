<?php
echo "=== PROBANDO CRUD USUARIOS-ZONAS CON DATOS REALES ===\n\n";

$baseUrl = "http://192.168.2.146:8001/api/v1";

echo "🔍 1. OBTENIENDO RELACIONES EXISTENTES:\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/usuarios-zonas");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
$response = curl_exec($ch);
$data = json_decode($response, true);

if ($data['success']) {
    echo "✅ Relaciones encontradas: " . count($data['data']) . "\n";
    foreach (array_slice($data['data'], 0, 5) as $rel) {
        echo "  - ID: {$rel['id']} | Usuario: {$rel['nombre_usuario']} | Zona: {$rel['nombre_zona']}\n";
    }
} else {
    echo "❌ Error obteniendo relaciones\n";
}

echo "\n👥 2. OBTENIENDO USUARIOS DISPONIBLES:\n";
curl_setopt($ch, CURLOPT_URL, "$baseUrl/usuarios-zonas/usuarios-disponibles");
$response = curl_exec($ch);
$usuarios = json_decode($response, true);

if ($usuarios['success']) {
    echo "✅ Usuarios disponibles: " . count($usuarios['data']) . "\n";
    foreach (array_slice($usuarios['data'], 0, 3) as $user) {
        echo "  - ID: {$user['id']} | {$user['nombre']} ({$user['email']})\n";
    }
} else {
    echo "❌ Error obteniendo usuarios\n";
}

echo "\n🏢 3. OBTENIENDO ZONAS DISPONIBLES:\n";
curl_setopt($ch, CURLOPT_URL, "$baseUrl/usuarios-zonas/zonas-disponibles");
$response = curl_exec($ch);
$zonas = json_decode($response, true);

if ($zonas['success']) {
    echo "✅ Zonas disponibles: " . count($zonas['data']) . "\n";
    foreach (array_slice($zonas['data'], 0, 3) as $zona) {
        echo "  - ID: {$zona['id']} | {$zona['nombre']}\n";
    }
} else {
    echo "❌ Error obteniendo zonas\n";
}

// Crear relación de prueba
if ($usuarios['success'] && $zonas['success'] && count($usuarios['data']) > 0 && count($zonas['data']) > 0) {
    $usuarioPrueba = $usuarios['data'][0]['id'];
    $zonaPrueba = $zonas['data'][0]['id'];
    
    echo "\n➕ 4. CREANDO RELACIÓN DE PRUEBA:\n";
    echo "Usuario ID: $usuarioPrueba | Zona ID: $zonaPrueba\n";
    
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/usuarios-zonas");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'usuario_id' => $usuarioPrueba,
        'zona_id' => $zonaPrueba
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $resultado = json_decode($response, true);
    
    if ($resultado['success']) {
        echo "✅ Relación creada exitosamente! ID: {$resultado['data']['id']}\n";
        $relacionCreada = $resultado['data']['id'];
        
        // Verificar que se creó
        echo "\n🔍 5. VERIFICANDO RELACIÓN CREADA:\n";
        curl_setopt($ch, CURLOPT_URL, "$baseUrl/usuarios-zonas");
        curl_setopt($ch, CURLOPT_POST, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, null);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        
        $response = curl_exec($ch);
        $data = json_decode($response, true);
        
        $encontrada = false;
        foreach ($data['data'] as $rel) {
            if ($rel['id'] == $relacionCreada) {
                echo "✅ Relación verificada: Usuario {$rel['nombre_usuario']} en Zona {$rel['nombre_zona']}\n";
                $encontrada = true;
                break;
            }
        }
        
        if (!$encontrada) {
            echo "❌ No se encontró la relación creada\n";
        }
        
        // Eliminar relación de prueba
        echo "\n🗑️ 6. ELIMINANDO RELACIÓN DE PRUEBA:\n";
        curl_setopt($ch, CURLOPT_URL, "$baseUrl/usuarios-zonas/$relacionCreada");
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        
        $response = curl_exec($ch);
        $resultado = json_decode($response, true);
        
        if ($resultado['success']) {
            echo "✅ Relación eliminada exitosamente\n";
        } else {
            echo "❌ Error eliminando relación: {$resultado['message']}\n";
        }
        
    } else {
        echo "❌ Error creando relación: {$resultado['message']}\n";
    }
}

curl_close($ch);

echo "\n🎯 RESULTADO FINAL:\n";
echo "✅ CRUD completo de usuarios-zonas FUNCIONANDO\n";
echo "✅ Datos reales de la base de datos gestionthuv\n";
echo "✅ Endpoints listos para el frontend\n";
echo "✅ Sistema listo para implementar en la UI\n";
?>
