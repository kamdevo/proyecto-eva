<?php
echo "🔍 VERIFICACIÓN DE VALIDACIONES SIMPLES\n";
echo str_repeat("=", 50) . "\n\n";

// Test 1: Crear equipo exitoso
echo "Test 1: Crear equipo válido...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos-simple");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "Test Equipment " . time(),
    "code" => "TEST" . time(),
    "servicio_id" => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Código HTTP: {$httpCode}\n";
echo "Respuesta: {$response}\n\n";

// Test 2: Código duplicado
echo "Test 2: Código duplicado (debe fallar)...\n";
$testCode = "DUP" . time();

// Primer equipo
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos-simple");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "Equipo 1",
    "code" => $testCode,
    "servicio_id" => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response1 = curl_exec($ch);
$httpCode1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Primer equipo - Código: {$httpCode1}\n";

// Segundo equipo (debe fallar)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos-simple");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "Equipo 2",
    "code" => $testCode,
    "servicio_id" => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response2 = curl_exec($ch);
$httpCode2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Segundo equipo - Código: {$httpCode2}\n";
echo "Respuesta: {$response2}\n\n";

// Análisis
if ($httpCode == 201) {
    echo "✅ Test 1: CORRECTO - Equipo creado exitosamente\n";
} else {
    echo "❌ Test 1: FALLÓ - Código: {$httpCode}\n";
}

if ($httpCode1 == 201 && $httpCode2 == 422) {
    echo "✅ Test 2: CORRECTO - Validación de código único funciona\n";
} else {
    echo "❌ Test 2: FALLÓ - Códigos: {$httpCode1}, {$httpCode2}\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
