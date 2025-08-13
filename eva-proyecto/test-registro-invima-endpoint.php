<?php
/**
 * Probar que el endpoint incluya correctamente los campos de registro INVIMA
 */

echo "🧪 PROBANDO REGISTRO INVIMA EN ENDPOINT\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

// Probar endpoint de equipos médicos
$medicalDevicesUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?page=1&per_page=5";

echo "🔍 PROBANDO ENDPOINT DE EQUIPOS MÉDICOS:\n";
echo "URL: $medicalDevicesUrl\n\n";

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
        echo "✅ Equipos obtenidos: " . count($equipos) . "\n\n";
        
        echo "📋 VERIFICANDO CAMPOS DE REGISTRO INVIMA:\n\n";
        
        foreach ($equipos as $index => $device) {
            echo "🔍 EQUIPO " . ($index + 1) . ":\n";
            echo "   ID: " . ($device['id'] ?? 'N/A') . "\n";
            echo "   Nombre: " . ($device['equipo']['name'] ?? 'N/A') . "\n";
            
            // Verificar campos INVIMA en diferentes ubicaciones
            $registroSanitario = null;
            $numeroInvima = null;
            $fechaVencimiento = null;
            $estadoInvima = null;
            $archivoInvima = null;
            
            // En data
            if (isset($device['data']['registroSanitario'])) {
                $registroSanitario = $device['data']['registroSanitario'];
            }
            if (isset($device['data']['numeroInvima'])) {
                $numeroInvima = $device['data']['numeroInvima'];
            }
            if (isset($device['data']['fechaVencimientoInvima'])) {
                $fechaVencimiento = $device['data']['fechaVencimientoInvima'];
            }
            if (isset($device['data']['estadoInvima'])) {
                $estadoInvima = $device['data']['estadoInvima'];
            }
            if (isset($device['data']['archivoInvima'])) {
                $archivoInvima = $device['data']['archivoInvima'];
            }
            
            // En equipo
            if (isset($device['equipo']['registro_sanitario'])) {
                $registroSanitario = $registroSanitario ?: $device['equipo']['registro_sanitario'];
            }
            
            echo "   📋 CAMPOS INVIMA:\n";
            echo "      Registro Sanitario: " . ($registroSanitario ?: 'NO ENCONTRADO') . "\n";
            echo "      Número INVIMA: " . ($numeroInvima ?: 'NO ENCONTRADO') . "\n";
            echo "      Fecha Vencimiento: " . ($fechaVencimiento ?: 'NO ENCONTRADO') . "\n";
            echo "      Estado INVIMA: " . ($estadoInvima ?: 'NO ENCONTRADO') . "\n";
            echo "      Archivo INVIMA: " . ($archivoInvima ?: 'NO ENCONTRADO') . "\n";
            
            // Verificar si tiene al menos un campo INVIMA
            $tieneInvima = $registroSanitario || $numeroInvima || $fechaVencimiento || $estadoInvima || $archivoInvima;
            
            if ($tieneInvima) {
                echo "   ✅ TIENE INFORMACIÓN INVIMA\n";
            } else {
                echo "   ❌ SIN INFORMACIÓN INVIMA\n";
                
                // Mostrar estructura para debug
                echo "   📋 Campos disponibles en 'data':\n";
                if (isset($device['data'])) {
                    foreach (array_keys($device['data']) as $key) {
                        echo "      - $key: " . (is_array($device['data'][$key]) ? 'Array' : $device['data'][$key]) . "\n";
                    }
                }
            }
            
            echo "\n";
        }
        
        // Estadísticas
        $equiposConInvima = 0;
        foreach ($equipos as $device) {
            $tieneInvima = false;
            
            if (isset($device['data']['registroSanitario']) && $device['data']['registroSanitario']) {
                $tieneInvima = true;
            }
            if (isset($device['data']['numeroInvima']) && $device['data']['numeroInvima']) {
                $tieneInvima = true;
            }
            if (isset($device['data']['estadoInvima']) && $device['data']['estadoInvima']) {
                $tieneInvima = true;
            }
            
            if ($tieneInvima) {
                $equiposConInvima++;
            }
        }
        
        echo str_repeat("=", 60) . "\n";
        echo "🎯 RESUMEN FINAL:\n\n";
        
        echo "📊 Estadísticas:\n";
        echo "   - Total equipos: " . count($equipos) . "\n";
        echo "   - Con información INVIMA: $equiposConInvima\n";
        echo "   - Sin información INVIMA: " . (count($equipos) - $equiposConInvima) . "\n";
        
        if ($equiposConInvima > 0) {
            echo "\n✅ ¡REGISTRO INVIMA SE MUESTRA CORRECTAMENTE!\n";
            echo "🎉 Los campos INVIMA están incluidos en la respuesta\n";
            
            echo "\n💡 CAMPOS DISPONIBLES EN EL FRONTEND:\n";
            echo "   - data.registroSanitario\n";
            echo "   - data.numeroInvima\n";
            echo "   - data.fechaVencimientoInvima\n";
            echo "   - data.estadoInvima\n";
            echo "   - data.archivoInvima\n";
            
            echo "\n🚀 EQUIPOS RECOMENDADOS PARA VERIFICAR:\n";
            foreach ($equipos as $device) {
                if (isset($device['data']['registroSanitario']) && $device['data']['registroSanitario']) {
                    echo "   • " . ($device['equipo']['name'] ?? 'Sin nombre') . " (ID: " . ($device['id'] ?? 'N/A') . ")\n";
                    echo "     Registro: " . $device['data']['registroSanitario'] . "\n";
                }
            }
            
        } else {
            echo "\n❌ NO SE ENCONTRÓ INFORMACIÓN INVIMA\n";
            echo "💡 Posibles causas:\n";
            echo "   - Los equipos no tienen registros INVIMA asignados\n";
            echo "   - El endpoint no está incluyendo los campos correctamente\n";
            echo "   - Los datos no se insertaron correctamente\n";
        }
        
    } else {
        echo "❌ Respuesta inesperada del endpoint\n";
        echo "Respuesta: " . substr($response, 0, 300) . "...\n";
    }
} else {
    echo "❌ Error en endpoint: HTTP $httpCode\n";
    echo "Respuesta: $response\n";
}
?>
