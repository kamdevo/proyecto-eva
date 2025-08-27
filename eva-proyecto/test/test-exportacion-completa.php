<?php

/**
 * Script para probar exportación con TODOS los correctivos reales
 */

echo "🧪 TESTING EXPORTACIÓN CON DATOS REALES COMPLETOS\n";
echo "=================================================\n\n";

// Test 1: Obtener TODOS los correctivos (paginando)
echo "📡 Obteniendo TODOS los correctivos reales (paginando)...\n";

$allCorrectivos = [];
$page = 1;
$perPage = 100; // Máximo permitido
$totalPages = 1;

do {
    $listUrl = "http://localhost:8001/api/v1/correctivos-generales?page=$page&per_page=$perPage";
    echo "🔄 Obteniendo página $page de $totalPages...\n";
    
    $ch1 = curl_init();
    curl_setopt($ch1, CURLOPT_URL, $listUrl);
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch1, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'X-Requested-With: XMLHttpRequest'
    ]);
    curl_setopt($ch1, CURLOPT_TIMEOUT, 60);

    $listResponse = curl_exec($ch1);
    $listHttpCode = curl_getinfo($ch1, CURLINFO_HTTP_CODE);
    curl_close($ch1);

    if ($listHttpCode !== 200) {
        echo "❌ Error al obtener página $page: HTTP $listHttpCode\n";
        echo "📄 Respuesta: " . substr($listResponse, 0, 500) . "\n";
        break;
    }

    $data = json_decode($listResponse, true);
    if (!isset($data['data']['correctivos'])) {
        echo "❌ No se encontraron correctivos en página $page\n";
        break;
    }

    $correctivos = $data['data']['correctivos'];
    $paginationInfo = $data['data']['pagination'] ?? [];
    
    // Actualizar información de paginación
    $totalPages = $paginationInfo['last_page'] ?? 1;
    $totalInDB = $paginationInfo['total'] ?? count($correctivos);
    
    // Agregar correctivos de esta página
    $allCorrectivos = array_merge($allCorrectivos, $correctivos);
    
    echo "✅ Página $page: " . count($correctivos) . " registros obtenidos\n";
    echo "📊 Total acumulado: " . count($allCorrectivos) . " de $totalInDB\n";
    
    $page++;
    
} while ($page <= $totalPages);

$correctivos = $allCorrectivos;
$totalFromAPI = count($correctivos);

echo "\n✅ TODOS los correctivos obtenidos: $totalFromAPI\n";
echo "📊 Total páginas procesadas: " . ($page - 1) . "\n";

// Test 2: Formatear TODOS los datos para exportación
echo "\n📋 Formateando TODOS los datos para exportación...\n";

$exportData = [];
$withDocuments = 0;
$withoutDocuments = 0;

foreach ($correctivos as $item) {
    // Contar documentos
    if (!empty($item['archivo'])) {
        $withDocuments++;
    } else {
        $withoutDocuments++;
    }
    
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
echo "📄 Con documentos: $withDocuments\n";
echo "📄 Sin documentos: $withoutDocuments\n";

// Test 3: Exportar TODOS los datos reales a Excel
echo "\n📊 Exportando TODOS los datos reales a Excel...\n";

$url = "http://localhost:8001/api/v1/correctivos-generales/export";
$postData = json_encode([
    'format' => 'excel',
    'filename' => 'correctivos_COMPLETOS_' . date('Y-m-d_H-i-s'),
    'data' => $exportData
]);

$startTime = microtime(true);

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
curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 minutos para exportaciones grandes

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

$endTime = microtime(true);
$executionTime = round($endTime - $startTime, 2);

if ($error) {
    echo "❌ Error de cURL: $error\n";
} else {
    echo "✅ Respuesta HTTP: $httpCode\n";
    echo "⏱️  Tiempo de exportación: {$executionTime} segundos\n";
    echo "📄 Content-Type: $contentType\n";
    
    if ($httpCode === 200) {
        echo "✅ ¡EXPORTACIÓN EXITOSA CON TODOS LOS DATOS REALES!\n";
        
        // Separar headers del body
        list($headers, $body) = explode("\r\n\r\n", $response, 2);
        
        if (strpos($contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false) {
            echo "✅ Tipo de contenido correcto: Excel\n";
            
            $fileSize = strlen($body);
            $fileSizeKB = round($fileSize / 1024, 2);
            $fileSizeMB = round($fileSize / (1024 * 1024), 2);
            
            echo "✅ Tamaño del archivo: $fileSize bytes ({$fileSizeKB} KB / {$fileSizeMB} MB)\n";
            
            // Guardar archivo completo
            $filename = "correctivos_COMPLETOS_" . date('Y-m-d_H-i-s') . ".xlsx";
            file_put_contents($filename, $body);
            echo "✅ Archivo COMPLETO guardado como: $filename\n";
            
        } else {
            echo "⚠️ Tipo de contenido inesperado\n";
            echo "📄 Respuesta:\n";
            echo substr($body, 0, 1000) . "...\n";
        }
        
    } else {
        echo "❌ Error HTTP $httpCode\n";
        echo "📄 Respuesta de error:\n";
        list($headers, $body) = explode("\r\n\r\n", $response, 2);
        echo $body . "\n";
    }
}

echo "\n🎯 RESULTADO FINAL - DATOS REALES COMPLETOS:\n";
echo "============================================\n";
if ($httpCode === 200 && strpos($contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false) {
    echo "✅ ¡EXPORTACIÓN DE TODOS LOS DATOS REALES EXITOSA!\n";
    echo "📊 Total de registros exportados: " . count($exportData) . "\n";
    echo "📄 Correctivos con documentos: $withDocuments\n";
    echo "📄 Correctivos sin documentos: $withoutDocuments\n";
    echo "⏱️  Tiempo total de procesamiento: {$executionTime} segundos\n";
    echo "💾 Archivo generado: {$fileSizeMB} MB\n";
    echo "🎉 ¡LA FUNCIONALIDAD FUNCIONA PERFECTAMENTE CON DATOS REALES!\n";
} else {
    echo "❌ Problemas con la exportación de datos reales\n";
    echo "🔧 Revisar detalles arriba\n";
}

?>
