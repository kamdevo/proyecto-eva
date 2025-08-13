<?php
/**
 * Script de verificación de validaciones del modal de equipos
 * Verifica que las validaciones de unicidad y demás funcionen correctamente
 */

echo "🔍 VERIFICACIÓN DE VALIDACIONES - MODAL DE EQUIPOS\n";
echo str_repeat("=", 60) . "\n\n";

// Test 1: Verificar ruta de equipos
echo "📡 Test 1: Verificando ruta POST equipos...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/equipos');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => 'Test Equipment ' . time(),
    'code' => 'TEST' . time(),
    'servicio_id' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    echo "❌ Error de conexión\n";
} else {
    $data = json_decode($response, true);
    echo "📊 Código HTTP: {$httpCode}\n";
    echo "📄 Respuesta: " . (json_encode($data, JSON_PRETTY_PRINT) ?: $response) . "\n";
}

echo "\n" . str_repeat("-", 40) . "\n\n";

// Test 2: Verificar validación de código único
echo "🔒 Test 2: Verificando validación de código único...\n";
$testCode = 'DUPLICATE_TEST_' . time();

// Primer intento - debería crear exitosamente
echo "🆕 Creando equipo con código: {$testCode}\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/equipos');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => 'Equipo Test Duplicado 1',
    'code' => $testCode,
    'servicio_id' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response1 = curl_exec($ch);
$httpCode1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Primer intento - Código HTTP: {$httpCode1}\n";
if ($response1) {
    $data1 = json_decode($response1, true);
    echo "📄 Respuesta: " . (json_encode($data1, JSON_PRETTY_PRINT) ?: $response1) . "\n";
}

// Segundo intento - debería fallar por código duplicado
echo "\n🔄 Intentando crear otro equipo con el mismo código...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/equipos');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => 'Equipo Test Duplicado 2',
    'code' => $testCode,
    'servicio_id' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response2 = curl_exec($ch);
$httpCode2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Segundo intento - Código HTTP: {$httpCode2}\n";
if ($response2) {
    $data2 = json_decode($response2, true);
    echo "📄 Respuesta: " . (json_encode($data2, JSON_PRETTY_PRINT) ?: $response2) . "\n";
}

echo "\n" . str_repeat("-", 40) . "\n\n";

// Test 3: Verificar validaciones de campos requeridos
echo "✅ Test 3: Verificando validaciones de campos requeridos...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/equipos');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    // Falta 'name' y 'code' requeridos
    'servicio_id' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response3 = curl_exec($ch);
$httpCode3 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Sin campos requeridos - Código HTTP: {$httpCode3}\n";
if ($response3) {
    $data3 = json_decode($response3, true);
    echo "📄 Respuesta: " . (json_encode($data3, JSON_PRETTY_PRINT) ?: $response3) . "\n";
}

echo "\n" . str_repeat("-", 40) . "\n\n";

// Test 4: Verificar validación de servicio existente
echo "🏢 Test 4: Verificando validación de servicio existente...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/equipos');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name' => 'Test Equipment Invalid Service',
    'code' => 'INVALID_SERVICE_' . time(),
    'servicio_id' => 99999 // ID que no existe
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response4 = curl_exec($ch);
$httpCode4 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Servicio inválido - Código HTTP: {$httpCode4}\n";
if ($response4) {
    $data4 = json_decode($response4, true);
    echo "📄 Respuesta: " . (json_encode($data4, JSON_PRETTY_PRINT) ?: $response4) . "\n";
}

echo "\n" . str_repeat("-", 40) . "\n\n";

// Análisis de resultados
echo "📊 ANÁLISIS DE RESULTADOS:\n";
echo str_repeat("=", 30) . "\n";

$validacionesCorrectas = 0;
$totalTests = 4;

// Test 1: Ruta accesible
if ($httpCode >= 200 && $httpCode < 500) {
    echo "✅ Test 1: Ruta POST equipos accesible\n";
    $validacionesCorrectas++;
} else {
    echo "❌ Test 1: Ruta POST equipos no accesible\n";
}

// Test 2: Validación código único
if ($httpCode1 == 201 && $httpCode2 == 422) {
    echo "✅ Test 2: Validación de código único funciona\n";
    $validacionesCorrectas++;
} else {
    echo "❌ Test 2: Validación de código único no funciona correctamente\n";
    echo "   - Primer intento: {$httpCode1} (esperado: 201)\n";
    echo "   - Segundo intento: {$httpCode2} (esperado: 422)\n";
}

// Test 3: Campos requeridos
if ($httpCode3 == 422) {
    echo "✅ Test 3: Validación de campos requeridos funciona\n";
    $validacionesCorrectas++;
} else {
    echo "❌ Test 3: Validación de campos requeridos no funciona\n";
    echo "   - Código HTTP: {$httpCode3} (esperado: 422)\n";
}

// Test 4: Servicio existente
if ($httpCode4 == 422) {
    echo "✅ Test 4: Validación de servicio existente funciona\n";
    $validacionesCorrectas++;
} else {
    echo "❌ Test 4: Validación de servicio existente no funciona\n";
    echo "   - Código HTTP: {$httpCode4} (esperado: 422)\n";
}

echo "\n📈 RESUMEN FINAL:\n";
echo "✅ Validaciones correctas: {$validacionesCorrectas}/{$totalTests}\n";
echo "📊 Porcentaje de éxito: " . round(($validacionesCorrectas/$totalTests)*100, 1) . "%\n";

if ($validacionesCorrectas == $totalTests) {
    echo "\n🎉 ¡TODAS LAS VALIDACIONES FUNCIONAN CORRECTAMENTE!\n";
    echo "✅ El modal de registro de equipos está completamente funcional\n";
} else {
    echo "\n⚠️  ALGUNAS VALIDACIONES NECESITAN CORRECCIÓN\n";
    echo "🔧 Revisar los endpoints y validaciones que fallaron\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
