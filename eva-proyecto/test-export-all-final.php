<?php
require_once 'eva-backend/vendor/autoload.php';

// Configurar conexión PDO
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión a BD exitosa\n\n";
} catch (PDOException $e) {
    die("❌ Error de conexión: " . $e->getMessage() . "\n");
}

// Test endpoint exportar todos
echo "🧪 PRUEBA EXPORTAR TODOS (endpoint /export-excel)\n";
echo "=" . str_repeat("=", 50) . "\n";

$url = 'http://localhost:8001/api/v1/correctivos-generales/export-excel';
$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    'X-Requested-With: XMLHttpRequest'
];

// Usar cURL para simular la petición
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 30,
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
            $filename = 'test_export_todos_' . date('Y-m-d_H-i-s') . '.xlsx';
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
                echo "\n📄 MUESTRA DE DATOS:\n";
                for ($row = 1; $row <= min(4, $highestRow); $row++) {
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

// Verificar datos reales en BD
echo "\n🔍 VERIFICACIÓN DE DATOS EN BD:\n";
echo "=" . str_repeat("=", 40) . "\n";

$stmt = $pdo->query("SELECT COUNT(*) as total FROM correctivos_generales");
$totalCorrectivos = $stmt->fetch()['total'];
echo "📊 Total correctivos en BD: $totalCorrectivos\n";

$stmt = $pdo->query("
    SELECT 
        cg.id, cg.code, cg.description, cg.created_at,
        e.name as equipo_name, e.code as equipo_code
    FROM correctivos_generales cg 
    LEFT JOIN equipos e ON cg.equipo_id = e.id 
    ORDER BY cg.id 
    LIMIT 3
");
$muestras = $stmt->fetchAll();

echo "\n📄 MUESTRA DE DATOS REALES DE BD:\n";
foreach ($muestras as $muestra) {
    echo "ID: {$muestra['id']}, Code: {$muestra['code']}, Equipo: {$muestra['equipo_name']}, Fecha: {$muestra['created_at']}\n";
}

echo "\n✅ Prueba de exportación TODOS completada\n";
?>
