<?php

echo "🔍 Buscando equipo con plan de mantenimiento...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Encontrar un equipo con plan en 2024
    $stmt = $pdo->query("
        SELECT e.id, e.name, e.code, pm.responsable, fm.name as frecuencia, pm.mes1, pm.mes2, pm.mes3
        FROM equipos e
        INNER JOIN planes_mantenimientos pm ON pm.equipo_id = e.id
        LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
        WHERE pm.anio = 2024
        LIMIT 1
    ");
    $equipo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($equipo) {
        echo "✅ Equipo encontrado:\n";
        echo "  ID: " . $equipo['id'] . "\n";
        echo "  Nombre: " . $equipo['name'] . "\n";
        echo "  Código: " . $equipo['code'] . "\n";
        echo "  Responsable: " . $equipo['responsable'] . "\n";
        echo "  Frecuencia: " . $equipo['frecuencia'] . "\n";
        echo "  Meses: " . $equipo['mes1'] . ", " . ($equipo['mes2'] ?: 'N/A') . ", " . ($equipo['mes3'] ?: 'N/A') . "\n\n";
        
        // Ahora consultarlo desde el API
        $url = "http://192.168.2.146:8001/api/v1/equipos/medical-devices-complete?consulta_id=" . $equipo['id'];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        
        echo "📤 Consultando API: $url\n\n";
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            
            if (isset($data['data']['data'][0])) {
                $equipoAPI = $data['data']['data'][0];
                
                echo "✅ Respuesta del API:\n";
                echo "  Nombre: " . ($equipoAPI['name'] ?? 'N/A') . "\n";
                echo "  Incluido en Plan: " . ($equipoAPI['incluido_en_plan'] ?? 'N/A') . "\n";
                echo "  Responsable Plan: " . ($equipoAPI['responsable_plan'] ?? 'NO ASIGNADO') . "\n";
                echo "  Frecuencia Plan: " . ($equipoAPI['frecuencia_plan'] ?? 'NO DEFINIDA') . "\n";
                echo "  Mes1: " . ($equipoAPI['mes_programado1'] ?? 'N/A') . "\n";
                echo "  Año Vigente: " . ($equipoAPI['anio_vigente'] ?? 'N/A') . "\n";
            }
        } else {
            echo "❌ Error HTTP: $httpCode\n";
            echo $response . "\n";
        }
        
        curl_close($ch);
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
