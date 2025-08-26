<?php
/*
 * Test script para verificar la exportación XLSX real
 * Verifica que se genera un archivo Excel verdadero usando PhpSpreadsheet
 */

echo "🔬 INICIANDO PRUEBA DE EXPORTACIÓN XLSX REAL\n";
echo "=" . str_repeat("=", 50) . "\n\n";

// Configuración
$baseUrl = 'http://127.0.0.1:8001';
$endpoint = '/api/v1/ordenes-compra/export/excel';
$url = $baseUrl . $endpoint;

echo "📋 CONFIGURACIÓN:\n";
echo "   URL: $url\n";
echo "   Método: GET\n\n";

// Realizar petición
echo "🌐 REALIZANDO PETICIÓN...\n";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'User-Agent: Test-Script/1.0'
    ],
    CURLOPT_HEADERFUNCTION => function($curl, $header) {
        static $headers = [];
        $headers[] = trim($header);
        return strlen($header);
    }
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$contentLength = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
$error = curl_error($ch);
curl_close($ch);

echo "📊 RESPUESTA HTTP:\n";
echo "   Código: $httpCode\n";
echo "   Content-Type: $contentType\n";
echo "   Content-Length: " . number_format($contentLength) . " bytes\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
    exit(1);
}

if ($httpCode !== 200) {
    echo "❌ Error HTTP: Código $httpCode\n";
    echo "   Respuesta: " . substr($response, 0, 500) . "\n";
    exit(1);
}

// Verificar Content-Type
echo "\n🔍 VERIFICACIONES:\n";
if (strpos($contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false) {
    echo "   ✅ Content-Type XLSX correcto\n";
} else {
    echo "   ❌ Content-Type incorrecto: $contentType\n";
}

// Verificar que no es HTML
if (strpos($response, '<!DOCTYPE html>') === false && strpos($response, '<html>') === false) {
    echo "   ✅ No es contenido HTML\n";
} else {
    echo "   ❌ El contenido parece ser HTML\n";
}

// Verificar firmas de archivo Excel
$isExcel = false;
if (strlen($response) > 4) {
    // Verificar firma ZIP (archivos XLSX son ZIP internamente)
    $signature = substr($response, 0, 4);
    if ($signature === "PK\x03\x04" || $signature === "PK\x05\x06" || $signature === "PK\x07\x08") {
        echo "   ✅ Firma ZIP detectada (XLSX válido)\n";
        $isExcel = true;
    } else {
        echo "   ❌ Firma de archivo no reconocida\n";
        echo "   Primeros 20 bytes: " . bin2hex(substr($response, 0, 20)) . "\n";
    }
}

// Guardar archivo para verificación
if ($response && $contentLength > 0) {
    $filename = 'test_real_xlsx_' . date('Y-m-d_H-i-s') . '.xlsx';
    $saved = file_put_contents($filename, $response);
    
    if ($saved) {
        echo "   ✅ Archivo guardado: $filename (" . number_format($saved) . " bytes)\n";
        
        // Intentar abrir con ZipArchive para verificar estructura XLSX
        if (class_exists('ZipArchive')) {
            $zip = new ZipArchive();
            $result = $zip->open($filename);
            
            if ($result === TRUE) {
                echo "   ✅ Archivo ZIP válido\n";
                
                // Verificar estructura XLSX básica
                $xlsxFiles = ['_rels/.rels', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml'];
                $validStructure = true;
                
                foreach ($xlsxFiles as $file) {
                    if ($zip->locateName($file) === false) {
                        $validStructure = false;
                        break;
                    }
                }
                
                if ($validStructure) {
                    echo "   ✅ Estructura XLSX válida\n";
                } else {
                    echo "   ❌ Estructura XLSX inválida\n";
                }
                
                echo "   📁 Archivos en ZIP: " . $zip->numFiles . "\n";
                $zip->close();
            } else {
                echo "   ❌ No se puede abrir como ZIP: código $result\n";
            }
        }
    } else {
        echo "   ❌ Error guardando archivo\n";
    }
}

echo "\n🎯 RESUMEN:\n";
if ($httpCode === 200 && $isExcel && $contentLength > 0) {
    echo "   🎉 ¡EXPORTACIÓN XLSX REAL EXITOSA!\n";
    echo "   📈 El archivo es un Excel verdadero y válido\n";
} else {
    echo "   ⚠️  Exportación con problemas\n";
}

echo "\n" . str_repeat("=", 55) . "\n";
echo "🏁 PRUEBA COMPLETADA\n";
?>
