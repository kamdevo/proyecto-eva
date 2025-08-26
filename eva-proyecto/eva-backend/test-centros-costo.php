<?php
echo "=== TEST CENTROS DE COSTO ===\n\n";

// Configuración de base de datos
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión a base de datos exitosa\n\n";
    
    // 1. Verificar que existe la tabla centros
    echo "1. Verificando tabla 'centros':\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'centros'");
    if ($stmt->rowCount() > 0) {
        echo "   ✅ Tabla 'centros' encontrada\n";
        
        // Mostrar estructura
        $stmt = $pdo->query("DESCRIBE centros");
        echo "   📋 Estructura de centros:\n";
        while ($row = $stmt->fetch()) {
            $null = $row['Null'] == 'NO' ? '[Required]' : '';
            echo "      - {$row['Field']} ({$row['Type']}) $null\n";
        }
        
        // Contar registros
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM centros");
        $total = $stmt->fetch()['total'];
        echo "      📊 Registros: $total\n\n";
        
        // Mostrar algunos registros
        if ($total > 0) {
            echo "   📋 Primeros registros:\n";
            $stmt = $pdo->query("SELECT * FROM centros LIMIT 5");
            while ($row = $stmt->fetch()) {
                echo "      ID: {$row['id']}, Nombre: " . ($row['name'] ?? $row['nombre'] ?? 'N/A') . 
                     ", Código: " . ($row['code'] ?? $row['codigo'] ?? 'N/A') . 
                     ", Estado: " . ($row['status'] ?? $row['estado'] ?? 'N/A') . "\n";
            }
            echo "\n";
        }
    } else {
        echo "   ❌ Tabla 'centros' no encontrada\n\n";
        
        // Buscar tablas similares
        echo "   🔍 Buscando tablas similares:\n";
        $stmt = $pdo->query("SHOW TABLES LIKE '%centro%'");
        while ($row = $stmt->fetch()) {
            echo "      - " . $row[0] . "\n";
        }
        echo "\n";
    }
    
    // 2. Verificar tabla usuarios y su relación con centros
    echo "2. Verificando tabla 'usuarios':\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'usuarios'");
    if ($stmt->rowCount() > 0) {
        echo "   ✅ Tabla 'usuarios' encontrada\n";
        
        // Mostrar estructura relevante
        $stmt = $pdo->query("DESCRIBE usuarios");
        echo "   📋 Campos relacionados con centros:\n";
        while ($row = $stmt->fetch()) {
            if (strpos(strtolower($row['Field']), 'centro') !== false) {
                $null = $row['Null'] == 'NO' ? '[Required]' : '';
                echo "      - {$row['Field']} ({$row['Type']}) $null\n";
            }
        }
        echo "\n";
    } else {
        echo "   ❌ Tabla 'usuarios' no encontrada\n\n";
    }
    
    // 3. Probar endpoint HTTP
    echo "3. Probando endpoint HTTP:\n";
    $url = 'http://127.0.0.1:8001/api/v1/centros';
    echo "   🌐 URL: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "   ❌ Error cURL: $error\n\n";
    } else {
        echo "   📡 Código HTTP: $httpCode\n";
        
        if ($httpCode == 200) {
            echo "   ✅ Respuesta exitosa\n";
            
            // Separar headers y body
            $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            $body = substr($response, strpos($response, "\r\n\r\n") + 4);
            
            $data = json_decode($body, true);
            if ($data) {
                echo "   📦 Datos: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
            } else {
                echo "   📦 Respuesta: " . substr($body, 0, 500) . "\n\n";
            }
        } else {
            echo "   ❌ Error HTTP $httpCode\n";
            
            // Separar headers y body para mostrar el error
            $body = substr($response, strpos($response, "\r\n\r\n") + 4);
            echo "   📝 Respuesta: " . substr($body, 0, 500) . "\n\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Error de base de datos: " . $e->getMessage() . "\n\n";
} catch (Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n\n";
}

echo "=== FIN DEL TEST ===\n";
?>
