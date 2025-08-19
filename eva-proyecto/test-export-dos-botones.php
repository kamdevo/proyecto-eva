<?php
/**
 * Test de exportación con DOS botones
 * Verifica que ambas funcionalidades funcionen correctamente
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TEST DE EXPORTACIÓN DOS BOTONES ===\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n\n";

$baseUrl = 'http://localhost:8001/api/v1/correctivos-generales';

// Headers para las peticiones
$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    'User-Agent: PostmanRuntime/7.26.8'
];

/**
 * Función para hacer peticiones HTTP
 */
function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    
    if ($method === 'POST' && $data) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'body' => $response,
        'http_code' => $httpCode,
        'error' => $error
    ];
}

echo "🔍 1. VERIFICANDO ENDPOINT BASE...\n";
$response = makeRequest($baseUrl, 'GET', null, $headers);
echo "HTTP Code: " . $response['http_code'] . "\n";
if ($response['http_code'] === 200) {
    $data = json_decode($response['body'], true);
    $totalCorrectivos = 0;
    if (isset($data['data']['correctivos'])) {
        $totalCorrectivos = count($data['data']['correctivos']);
    }
    echo "✅ Endpoint base funciona - Total correctivos disponibles: $totalCorrectivos\n";
} else {
    echo "❌ Error en endpoint base: " . $response['body'] . "\n";
}
echo "\n";

echo "🔍 2. TESTEANDO BOTÓN 'EXPORTAR TODOS' (endpoint: /export-excel)...\n";
$exportAllUrl = $baseUrl . '/export-excel';
$response = makeRequest($exportAllUrl, 'GET', null, array_merge($headers, [
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]));

echo "HTTP Code: " . $response['http_code'] . "\n";
if ($response['http_code'] === 200) {
    $contentLength = strlen($response['body']);
    echo "✅ Exportación TODOS exitosa - Archivo generado: " . number_format($contentLength) . " bytes\n";
    
    // Guardar archivo para verificar
    $filename = "test_export_todos_" . date('Y-m-d_H-i-s') . ".xlsx";
    file_put_contents($filename, $response['body']);
    echo "📁 Archivo guardado como: $filename\n";
} else {
    echo "❌ Error en exportación TODOS: " . substr($response['body'], 0, 500) . "\n";
}
echo "\n";

echo "🔍 3. TESTEANDO BOTÓN 'EXPORTAR FILTRADOS' (endpoint: /export-custom)...\n";
$exportFilteredUrl = $baseUrl . '/export-custom';

// Datos de prueba para exportación filtrada
$filteredData = [
    'format' => 'excel',
    'filename' => 'correctivos_filtrados_test',
    'data' => [
        [
            'Fuente' => 'Correctivos generales',
            'Responsable del mantenimiento' => 'Test Usuario',
            'Equipo Id' => '1001',
            'Fecha de creación de la orden' => '2024-08-19',
            'Codigo de orden de trabajo' => 'TEST001',
            'Descripcion de la orden' => 'Test de exportación filtrada',
            'Codificación de cierre' => 'En proceso',
            'Equipo' => 'Equipo de prueba',
            'Codigo Equipo' => 'TEST-001',
            'Marca' => 'Test Marca',
            'Modelo' => 'Test Modelo',
            'Serie' => 'TEST123',
            'Estado actual del equipo' => 'Activo',
            'Sede' => 'Sede Test',
            'Servicio' => 'Servicio Test',
            'Area' => 'Area Test',
            'Archivo' => '',
            'Fecha avance' => '2024-08-19',
            'Titulo/Retro Avance1' => 'Avance inicial',
            'Descripcion avance' => 'Descripción del avance',
            'Fecha avance2' => '',
            'Titulo/Retro Avance2' => '',
            'Descripcion avance2' => '',
            'Fecha avance3' => '',
            'Titulo/Retro Avance3' => '',
            'Descripcion avance3' => '',
            'Retro de cierre' => '',
            'Descripcion de Cierre' => '',
            'Fecha de Cierre' => '',
            'Costo del equipo' => 0,
            'Fecha fin' => '',
            'Repuesto instalado' => ''
        ]
    ]
];

$response = makeRequest($exportFilteredUrl, 'POST', json_encode($filteredData), array_merge($headers, [
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]));

echo "HTTP Code: " . $response['http_code'] . "\n";
if ($response['http_code'] === 200) {
    $contentLength = strlen($response['body']);
    echo "✅ Exportación FILTRADOS exitosa - Archivo generado: " . number_format($contentLength) . " bytes\n";
    
    // Guardar archivo para verificar
    $filename = "test_export_filtrados_" . date('Y-m-d_H-i-s') . ".xlsx";
    file_put_contents($filename, $response['body']);
    echo "📁 Archivo guardado como: $filename\n";
} else {
    echo "❌ Error en exportación FILTRADOS: " . substr($response['body'], 0, 500) . "\n";
    
    // Mostrar respuesta para debugging
    $responseData = json_decode($response['body'], true);
    if ($responseData) {
        echo "📋 Detalles del error:\n";
        print_r($responseData);
    }
}
echo "\n";

echo "🔍 4. VERIFICANDO ARCHIVOS GENERADOS...\n";
$files = glob("test_export_*.xlsx");
if (count($files) > 0) {
    echo "✅ Archivos Excel generados exitosamente:\n";
    foreach ($files as $file) {
        $size = filesize($file);
        echo "   - $file (" . number_format($size) . " bytes)\n";
    }
} else {
    echo "❌ No se generaron archivos Excel\n";
}
echo "\n";

echo "=== RESUMEN DEL TEST ===\n";
echo "✅ Endpoint base de correctivos: " . ($response['http_code'] === 200 ? "OK" : "ERROR") . "\n";
echo "📊 Botón 'Exportar TODOS': Verificar logs arriba\n";
echo "🔍 Botón 'Exportar FILTRADOS': Verificar logs arriba\n";
echo "\n";

echo "🎯 SIGUIENTE PASO: Abre el frontend y prueba los dos botones:\n";
echo "   1. 'Exportar TODOS' - debe exportar todos los correctivos reales\n";
echo "   2. 'Exportar Filtrados' - debe exportar solo los visibles después de filtrar\n";
echo "\nTest completado a las " . date('H:i:s') . "\n";
?>
