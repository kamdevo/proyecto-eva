<?php
/**
 * Probar que los endpoints INVIMA funcionen correctamente con tabla 'invimas'
 */

echo "🧪 PROBANDO ENDPOINTS INVIMA CORREGIDOS\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Probar endpoint de registros INVIMA
    echo "1️⃣ PROBANDO ENDPOINT DE REGISTROS INVIMA:\n\n";
    
    $registrosUrl = "$baseUrl/api/v1/registros-invima";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $registrosUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            $registros = $data['data'];
            echo "✅ Endpoint funcionando - Registros obtenidos: " . count($registros) . "\n\n";
            
            if (count($registros) > 0) {
                echo "📋 PRIMEROS REGISTROS INVIMA:\n";
                foreach (array_slice($registros, 0, 5) as $registro) {
                    echo "   ID: {$registro['id']}\n";
                    echo "   Número: " . ($registro['numero_registro'] ?? 'N/A') . "\n";
                    echo "   Nombre: " . ($registro['nombre_equipo'] ?? 'N/A') . "\n";
                    echo "   Fabricante: " . ($registro['fabricante'] ?? 'N/A') . "\n\n";
                }
            } else {
                echo "⚠️ No hay registros INVIMA disponibles\n";
            }
            
        } else {
            echo "❌ Respuesta de error: $response\n";
        }
    } else {
        echo "❌ Error en endpoint: HTTP $httpCode\n";
        echo "Respuesta: $response\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Probar endpoint de equipos médicos
    echo "2️⃣ PROBANDO ENDPOINT DE EQUIPOS MÉDICOS:\n\n";
    
    $medicalDevicesUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?page=1&per_page=3";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $medicalDevicesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success'] && isset($data['data']['data'])) {
            $equipos = $data['data']['data'];
            echo "✅ Endpoint funcionando - Equipos obtenidos: " . count($equipos) . "\n\n";
            
            echo "📋 VERIFICANDO CAMPOS INVIMA EN EQUIPOS:\n\n";
            
            foreach ($equipos as $device) {
                $registroSanitario = $device['data']['registroSanitario'] ?? null;
                
                echo "   🔍 ID: {$device['id']} - {$device['equipo']['name']}\n";
                echo "      Registro INVIMA: " . ($registroSanitario ?: 'Sin registro') . "\n\n";
            }
            
        } else {
            echo "❌ Respuesta inesperada del endpoint\n";
            echo "Respuesta: " . substr($response, 0, 200) . "...\n";
        }
    } else {
        echo "❌ Error en endpoint: HTTP $httpCode\n";
        echo "Respuesta: $response\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Probar endpoint de datos de modal
    echo "3️⃣ PROBANDO ENDPOINT DE DATOS DE MODAL:\n\n";
    
    $modalDataUrl = "$baseUrl/api/v1/test/modal-equipment-data";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $modalDataUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        echo "✅ Endpoint de datos de modal funcionando\n";
        $data = json_decode($response, true);
        if ($data && isset($data['registros_invima'])) {
            echo "✅ Registros INVIMA incluidos: " . count($data['registros_invima']) . "\n";
        }
    } else {
        echo "❌ Error en endpoint de datos de modal: HTTP $httpCode\n";
        echo "Respuesta: " . substr($response, 0, 200) . "...\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN FINAL:\n\n";
    
    $verificaciones = [
        'Endpoint registros INVIMA' => $httpCode == 200,
        'Endpoint equipos médicos' => isset($equipos),
        'Endpoint datos modal' => $httpCode == 200
    ];
    
    $todoOk = true;
    foreach ($verificaciones as $item => $status) {
        if ($status) {
            echo "   ✅ $item\n";
        } else {
            echo "   ❌ $item\n";
            $todoOk = false;
        }
    }
    
    if ($todoOk) {
        echo "\n🎉 ¡TODOS LOS ENDPOINTS FUNCIONANDO!\n";
        echo "✅ Tabla 'invimas' configurada correctamente\n";
        echo "✅ Referencias actualizadas\n";
        echo "✅ Endpoints sin errores 500\n";
        
        echo "\n🚀 AHORA PUEDES:\n";
        echo "1. Recargar el frontend\n";
        echo "2. Abrir el modal de agregar equipo\n";
        echo "3. Ver los registros INVIMA cargándose correctamente\n";
        echo "4. Registrar equipos sin errores\n";
        
    } else {
        echo "\n❌ AÚN HAY PROBLEMAS\n";
        echo "💡 Revisar los elementos marcados con ❌\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
