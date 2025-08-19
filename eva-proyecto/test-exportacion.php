<?php

/**
 * Script de prueba para verificar la exportación de correctivos
 */

echo "🧪 TESTING EXPORTACIÓN DE CORRECTIVOS\n";
echo "=====================================\n\n";

// Test 1: Obtener datos de correctivos primero
echo "📡 Test 1: Obteniendo datos de correctivos...\n";

$listUrl = "http://localhost:8001/api/v1/correctivos-generales";
$ch1 = curl_init();
curl_setopt($ch1, CURLOPT_URL, $listUrl);
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch1, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'X-Requested-With: XMLHttpRequest'
]);
curl_setopt($ch1, CURLOPT_TIMEOUT, 30);

$listResponse = curl_exec($ch1);
$listHttpCode = curl_getinfo($ch1, CURLINFO_HTTP_CODE);
curl_close($ch1);

if ($listHttpCode !== 200) {
    echo "❌ Error al obtener correctivos: HTTP $listHttpCode\n";
    exit(1);
}

$data = json_decode($listResponse, true);
if (!isset($data['data']['correctivos'])) {
    echo "❌ No se encontraron correctivos en la respuesta\n";
    exit(1);
}

$correctivos = $data['data']['correctivos'];
echo "✅ Correctivos obtenidos: " . count($correctivos) . "\n";

// Test 2: Formatear datos para exportación (simular frontend)
echo "\n� Test 2: Formateando datos para exportación...\n";

$exportData = [];
foreach ($correctivos as $item) {
    $exportData[] = [
        'Fuente' => $item['fuente'] ?? 'Correctivos generales',
        'Responsable del mantenimiento' => $item['responsable_mantenimiento'] ?? '',
        'Equipo Id' => $item['equipo_id'] ?? '',
        'Fecha de creación de la orden' => $item['fecha_creacion'] ?? '',
        'Codigo de orden de trabajo' => $item['codigo_orden'] ?? '',
        'Descripcion de la orden' => $item['descripcion_orden'] ?? '',
        'Codificación de cierre' => $item['codificacion_cierre'] ?? '',
        'Equipo' => $item['equipo'] ?? '',
        'Codigo Equipo' => $item['codigo_equipo'] ?? '',
        'Marca' => $item['marca'] ?? '',
        'Modelo' => $item['modelo'] ?? '',
        'Serie' => $item['serie'] ?? '',
        'Estado actual del equipo' => $item['estado_actual'] ?? '',
        'Sede' => $item['sede'] ?? '',
        'Servicio' => $item['servicio'] ?? '',
        'Area' => $item['area'] ?? '',
        'Archivo' => $item['archivo'] ?? '',
        'Fecha avance' => $item['fecha_avance'] ?? '',
        'Titulo/Retro Avance1' => $item['titulo_avance1'] ?? '',
        'Descripcion avance' => $item['descripcion_avance'] ?? '',
        'Fecha avance2' => $item['fecha_avance2'] ?? '',
        'Titulo/Retro Avance2' => $item['titulo_avance2'] ?? '',
        'Descripcion avance2' => $item['descripcion_avance2'] ?? '',
        'Fecha avance3' => $item['fecha_avance3'] ?? '',
        'Titulo/Retro Avance3' => $item['titulo_avance3'] ?? '',
        'Descripcion avance3' => $item['descripcion_avance3'] ?? '',
        'Retro de cierre' => $item['retro_cierre'] ?? '',
        'Descripcion de Cierre' => $item['descripcion_cierre'] ?? '',
        'Fecha de Cierre' => $item['fecha_cierre'] ?? '',
        'Costo del equipo' => $item['costo_equipo'] ?? 0,
        'Fecha fin' => $item['fecha_fin'] ?? '',
        'Repuesto instalado' => $item['repuesto_instalado'] ?? ''
    ];
}

echo "✅ Datos formateados: " . count($exportData) . " registros\n";

// Test 3: Probar exportación a Excel
echo "\n📊 Test 3: Probando exportación a Excel...\n";

$url = "http://localhost:8001/api/v1/correctivos-generales/export";
$postData = json_encode([
    'format' => 'excel',
    'filename' => 'correctivos_test_' . date('Y-m-d_H-i-s'),
    'data' => $exportData
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'X-Requested-With: XMLHttpRequest'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($error) {
    echo "❌ Error de cURL: $error\n";
} else {
    echo "✅ Respuesta HTTP: $httpCode\n";
    echo "📄 Content-Type: $contentType\n";
    
    if ($httpCode === 200) {
        echo "✅ Exportación exitosa!\n";
        
        // Separar headers del body
        list($headers, $body) = explode("\r\n\r\n", $response, 2);
        
        // Verificar si es un archivo Excel válido
        if (strpos($contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false) {
            echo "✅ Tipo de contenido correcto: Excel\n";
            echo "✅ Tamaño del archivo: " . strlen($body) . " bytes\n";
            
            // Guardar archivo para verificación
            $filename = "test_export_" . date('Y-m-d_H-i-s') . ".xlsx";
            file_put_contents($filename, $body);
            echo "✅ Archivo guardado como: $filename\n";
            
        } else {
            echo "⚠️ Tipo de contenido inesperado\n";
            echo "📄 Primeros 500 caracteres de respuesta:\n";
            echo substr($body, 0, 500) . "...\n";
        }
        
    } else {
        echo "❌ Error HTTP $httpCode\n";
        echo "📄 Respuesta de error:\n";
        list($headers, $body) = explode("\r\n\r\n", $response, 2);
        echo $body . "\n";
    }
}

echo "\n🎯 RESULTADO FINAL:\n";
if ($httpCode === 200 && strpos($contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false) {
    echo "✅ ¡LA EXPORTACIÓN ESTÁ FUNCIONANDO PERFECTAMENTE!\n";
    echo "💡 Puedes probar la funcionalidad desde el frontend sin problemas\n";
    echo "📊 Excel generado con " . count($exportData) . " registros\n";
} else {
    echo "❌ Hay problemas con la exportación\n";
    echo "🔧 Revisa los detalles arriba para diagnóstico\n";
}

?>
