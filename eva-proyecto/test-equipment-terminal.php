<?php

/**
 * Script para registrar un equipo desde la terminal y probar el mapeo de fechas
 */

echo "🚀 REGISTRANDO EQUIPO DESDE TERMINAL - PRUEBA DE FECHAS\n";
echo "=" . str_repeat("=", 60) . "\n\n";

// Datos del equipo con todas las fechas
$equipoData = [
    'name' => 'Equipo Test Terminal - ' . date('Y-m-d H:i:s'),
    'servicio_id' => 1,
    'marca' => 'Philips',
    'modelo' => 'MX800',
    'numero_serie' => 'TEST-TERMINAL-' . time(),
    'descripcion' => 'Equipo registrado desde terminal para probar fechas',
    
    // FECHAS CRÍTICAS (las que estaban fallando)
    'fecha_adquisicion' => '2024-01-15',
    'fecha_instalacion' => '2024-02-01', 
    'fecha_recepcion_almacen' => '2024-01-20',
    'fecha_acta_recibo' => '2024-01-25',
    'fecha_inicio_operacion' => '2024-02-05',
    'fecha_fabricacion' => '2023-12-10',
    
    // CAMPOS MAPEADOS (los que tenían nombres incorrectos)
    'codigo_inventario' => 'INV-TERMINAL-' . time(),
    'centro_costo' => 'CC-TERMINAL',
    'pais_origen' => 'Colombia',
    
    // CAMPOS ADICIONALES
    'vida_util' => '10',
    'costo' => '2500000',
    'garantia' => '36',
    'observacion' => 'Prueba de mapeo de fechas desde terminal'
];

echo "📤 DATOS A ENVIAR:\n";
foreach ($equipoData as $key => $value) {
    echo "   {$key}: {$value}\n";
}
echo "\n";

// Convertir a JSON
$jsonData = json_encode($equipoData, JSON_PRETTY_PRINT);
echo "📋 JSON GENERADO:\n{$jsonData}\n\n";

// Hacer la petición HTTP
$url = 'http://localhost:8000/api/v1/equipos';
$headers = [
    'Content-Type: application/json',
    'Accept: application/json'
];

echo "🌐 ENVIANDO PETICIÓN A: {$url}\n";

// Inicializar cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_VERBOSE, true);

// Capturar información de debug
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

// Ejecutar la petición
echo "⏳ Ejecutando petición...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

// Obtener información de debug
rewind($verbose);
$verboseLog = stream_get_contents($verbose);
fclose($verbose);

curl_close($ch);

echo "\n📥 RESPUESTA RECIBIDA:\n";
echo "   HTTP Code: {$httpCode}\n";

if ($error) {
    echo "❌ ERROR cURL: {$error}\n";
} else {
    echo "✅ Petición ejecutada sin errores de cURL\n";
}

echo "\n📄 RESPUESTA DEL SERVIDOR:\n";
if ($response) {
    // Intentar decodificar JSON
    $responseData = json_decode($response, true);
    if ($responseData) {
        echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
        
        // Analizar la respuesta
        if ($httpCode === 201 || $httpCode === 200) {
            if (isset($responseData['success']) && $responseData['success']) {
                echo "\n🎉 ¡ÉXITO! Equipo registrado correctamente\n";
                if (isset($responseData['data']['id'])) {
                    echo "   ID del equipo: {$responseData['data']['id']}\n";
                }
                
                echo "\n🔍 VERIFICACIÓN NECESARIA:\n";
                echo "   Ahora debes verificar en la base de datos que los siguientes campos NO sean NULL:\n";
                echo "   - fecha_ad (debería ser: 2024-01-15)\n";
                echo "   - fecha_instalacion (debería ser: 2024-02-01)\n";
                echo "   - fecha_recepcion_almacen (debería ser: 2024-01-20)\n";
                echo "   - codigo_antiguo (debería ser: INV-TERMINAL-" . time() . ")\n";
                echo "   - otros (debería ser: CC-TERMINAL)\n";
                echo "   - propiedad (debería ser: Colombia)\n";
                
            } else {
                echo "\n⚠️ Respuesta exitosa pero con errores en el contenido\n";
            }
        } else {
            echo "\n❌ ERROR HTTP {$httpCode}\n";
            if (isset($responseData['message'])) {
                echo "   Mensaje: {$responseData['message']}\n";
            }
        }
    } else {
        echo "Respuesta no es JSON válido:\n{$response}\n";
    }
} else {
    echo "❌ No se recibió respuesta del servidor\n";
}

if ($verboseLog) {
    echo "\n🔧 LOG DE DEBUG cURL:\n";
    echo $verboseLog . "\n";
}

echo "\n✅ Prueba desde terminal completada.\n";
echo "Si el registro fue exitoso, verifica la base de datos para confirmar que las fechas se guardaron correctamente.\n";
