<?php
require_once 'eva-backend/vendor/autoload.php';

echo "🧪 PRUEBA EXPORTAR FILTRADOS (endpoint /export-custom)\n";
echo "=" . str_repeat("=", 50) . "\n";

$url = 'http://localhost:8001/api/v1/correctivos-generales/export-custom';
$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    'X-Requested-With: XMLHttpRequest'
];

// Datos de filtros (enviar solo IDs para que el backend consulte datos reales)
$postData = json_encode([
    'format' => 'excel',
    'filename' => 'correctivos_filtrados_test',
    'data' => [
        ['id' => 2],
        ['id' => 3],
        ['id' => 4]
    ]
]);

// Usar cURL para simular la petición POST
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $postData,
    CURLOPT_USERAGENT => 'Test PHP Script'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

echo "📡 Estado HTTP: $httpCode\n";
echo "📄 Content-Type: $contentType\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
} else {
    if ($httpCode === 200) {
        if (strpos($contentType, 'application/vnd.openxmlformats') !== false) {
            // Es un archivo Excel
            $filename = 'test_export_filtrados_' . date('Y-m-d_H-i-s') . '.xlsx';
            file_put_contents($filename, $response);
            $filesize = filesize($filename);
            echo "✅ Archivo Excel generado: $filename\n";
            echo "📊 Tamaño del archivo: " . number_format($filesize) . " bytes\n";
            
            // Verificar si el archivo es válido intentando abrirlo
            try {
                $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xlsx');
                $spreadsheet = $reader->load($filename);
                $worksheet = $spreadsheet->getActiveSheet();
                $highestRow = $worksheet->getHighestRow();
                $highestColumn = $worksheet->getHighestColumn();
                
                echo "📋 Filas en Excel: $highestRow (incluyendo encabezado)\n";
                echo "📋 Columnas en Excel: $highestColumn\n";
                echo "📋 Registros de datos: " . ($highestRow - 1) . "\n";
                
                // Leer algunos datos de muestra
                echo "\n📄 MUESTRA DE DATOS FILTRADOS:\n";
                for ($row = 1; $row <= min(5, $highestRow); $row++) {
                    echo "Fila $row: ";
                    for ($col = 'A'; $col <= 'H'; $col++) {
                        $value = $worksheet->getCell($col . $row)->getValue();
                        echo "[$col: " . substr($value, 0, 15) . "] ";
                    }
                    echo "\n";
                }
                
            } catch (Exception $e) {
                echo "❌ Error al leer Excel: " . $e->getMessage() . "\n";
            }
            
        } else {
            echo "❌ Respuesta no es un archivo Excel\n";
            echo "📄 Contenido (primeros 500 chars):\n";
            echo substr($response, 0, 500) . "\n";
        }
    } else {
        echo "❌ Error HTTP: $httpCode\n";
        echo "📄 Respuesta:\n$response\n";
    }
}

echo "\n✅ Prueba de exportación FILTRADOS completada\n";
?>
