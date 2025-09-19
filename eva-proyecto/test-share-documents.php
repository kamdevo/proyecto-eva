<?php

/**
 * Script de prueba para la funcionalidad de compartir documentos
 * Verifica que todas las rutas del backend funcionen correctamente
 */

echo "=== PRUEBAS DE FUNCIONALIDAD COMPARTIR DOCUMENTOS ===\n\n";

$baseUrl = 'http://127.0.0.1:8001/api';

// Función para hacer peticiones HTTP
function makeRequest($url, $method = 'GET', $data = null) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => 0];
    }
    
    return [
        'data' => json_decode($response, true),
        'http_code' => $httpCode,
        'raw' => $response
    ];
}

// Función para mostrar resultados
function showResult($testName, $result) {
    echo "🧪 $testName\n";
    echo "   HTTP Code: " . $result['http_code'] . "\n";
    
    if (isset($result['error'])) {
        echo "   ❌ Error: " . $result['error'] . "\n";
        return false;
    }
    
    if ($result['http_code'] >= 200 && $result['http_code'] < 300) {
        echo "   ✅ Éxito\n";
        if (isset($result['data']['success']) && $result['data']['success']) {
            if (isset($result['data']['data'])) {
                $count = is_array($result['data']['data']) ? count($result['data']['data']) : 1;
                echo "   📊 Datos: $count registros\n";
            }
            if (isset($result['data']['pagination'])) {
                $pagination = $result['data']['pagination'];
                echo "   📄 Paginación: Página {$pagination['current_page']} de {$pagination['last_page']}, Total: {$pagination['total']}\n";
            }
        }
        return true;
    } else {
        echo "   ❌ Error HTTP\n";
        if (isset($result['data']['message'])) {
            echo "   💬 Mensaje: " . $result['data']['message'] . "\n";
        }
        return false;
    }
}

echo "1️⃣ PRUEBA: Obtener equipos con paginación\n";
echo "----------------------------------------\n";

// Test 1: Obtener equipos básico
$result1 = makeRequest("$baseUrl/v1/equipos/medical-devices-complete?page=1&per_page=5");
$success1 = showResult("Obtener equipos (página 1, límite 5)", $result1);
echo "\n";

// Test 2: Obtener equipos con filtro por ID
$result2 = makeRequest("$baseUrl/v1/equipos/medical-devices-complete?consulta_id=1");
$success2 = showResult("Buscar equipo por ID (ID=1)", $result2);
echo "\n";

// Test 3: Obtener equipos con filtro por serie
$result3 = makeRequest("$baseUrl/v1/equipos/medical-devices-complete?search=ABC");
$success3 = showResult("Buscar equipos por serie (serie=ABC)", $result3);
echo "\n";

echo "2️⃣ PRUEBA: Búsqueda de equipos para compartir\n";
echo "---------------------------------------------\n";

// Test 4: Búsqueda simple
$result4 = makeRequest("$baseUrl/v1/equipos/search?limit=10");
$success4 = showResult("Búsqueda simple de equipos", $result4);
echo "\n";

// Test 5: Búsqueda con término
$result5 = makeRequest("$baseUrl/v1/equipos/search?q=equipo&limit=5");
$success5 = showResult("Búsqueda con término 'equipo'", $result5);
echo "\n";

echo "3️⃣ PRUEBA: Documentos de equipos\n";
echo "--------------------------------\n";

// Test 6: Obtener documentos de un equipo (asumiendo que existe equipo con ID 1)
$result6 = makeRequest("$baseUrl/v1/equipos/1/documents");
$success6 = showResult("Obtener documentos del equipo ID=1", $result6);
echo "\n";

// Test 7: Estadísticas de documentos
$result7 = makeRequest("$baseUrl/v1/equipos/1/documents/stats");
$success7 = showResult("Estadísticas de documentos del equipo ID=1", $result7);
echo "\n";

echo "4️⃣ PRUEBA: Compartir documento (simulación)\n";
echo "-------------------------------------------\n";

// Test 8: Intentar compartir documento (esto fallará sin datos reales, pero probamos la ruta)
$shareData = [
    'target_equipment_id' => 2
];
$result8 = makeRequest("$baseUrl/v1/equipos/1/documents/1/share", 'POST', $shareData);
$success8 = showResult("Compartir documento (equipo 1 -> equipo 2)", $result8);
echo "\n";

echo "📊 RESUMEN DE PRUEBAS\n";
echo "====================\n";

$tests = [
    'Obtener equipos paginados' => $success1,
    'Filtrar por ID' => $success2,
    'Filtrar por serie' => $success3,
    'Búsqueda simple' => $success4,
    'Búsqueda con término' => $success5,
    'Documentos de equipo' => $success6,
    'Estadísticas documentos' => $success7,
    'Compartir documento' => $success8
];

$passed = 0;
$total = count($tests);

foreach ($tests as $testName => $success) {
    $status = $success ? '✅' : '❌';
    echo "$status $testName\n";
    if ($success) $passed++;
}

echo "\n";
echo "🎯 RESULTADO FINAL: $passed/$total pruebas exitosas\n";

if ($passed === $total) {
    echo "🎉 ¡Todas las pruebas pasaron! El sistema está listo.\n";
} elseif ($passed >= $total * 0.7) {
    echo "⚠️  La mayoría de pruebas pasaron. Revisar las que fallaron.\n";
} else {
    echo "🚨 Muchas pruebas fallaron. Revisar configuración del servidor.\n";
}

echo "\n";
echo "💡 NOTAS:\n";
echo "- Asegúrate de que el servidor Laravel esté corriendo en http://127.0.0.1:8001\n";
echo "- Algunas pruebas pueden fallar si no hay datos de prueba en la base de datos\n";
echo "- La prueba de compartir documento fallará si no existen los equipos/documentos especificados\n";
echo "\n";

?>
