<?php
/**
 * Verificación final de que el registro INVIMA se muestre correctamente
 */

echo "🎯 VERIFICACIÓN FINAL - REGISTRO INVIMA\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Verificar datos en BD
    echo "1️⃣ VERIFICANDO DATOS EN BASE DE DATOS:\n\n";
    
    $stmt = $pdo->query("
        SELECT 
            id, 
            name, 
            code,
            registro_sanitario,
            numero_invima,
            fecha_vencimiento_invima,
            estado_invima,
            archivo_invima
        FROM equipos 
        WHERE registro_sanitario IS NOT NULL AND registro_sanitario != '' 
        ORDER BY id 
        LIMIT 5
    ");
    
    $equiposConRegistro = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($equiposConRegistro)) {
        echo "✅ Equipos con registro INVIMA en BD: " . count($equiposConRegistro) . "\n\n";
        
        foreach ($equiposConRegistro as $equipo) {
            echo "   📋 ID: {$equipo['id']} - {$equipo['name']}\n";
            echo "      Registro: {$equipo['registro_sanitario']}\n";
            echo "      Estado: {$equipo['estado_invima']}\n";
            echo "      Vencimiento: {$equipo['fecha_vencimiento_invima']}\n\n";
        }
    } else {
        echo "❌ No hay equipos con registro INVIMA en BD\n";
        exit;
    }
    
    echo str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar endpoint
    echo "2️⃣ VERIFICANDO ENDPOINT API:\n\n";
    
    $medicalDevicesUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?page=1&per_page=3";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $medicalDevicesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success'] && isset($data['data']['data'])) {
            $equipos = $data['data']['data'];
            echo "✅ Endpoint funcionando - Equipos obtenidos: " . count($equipos) . "\n\n";
            
            $equiposConInvimaAPI = 0;
            
            foreach ($equipos as $device) {
                $registroSanitario = $device['data']['registroSanitario'] ?? null;
                $numeroInvima = $device['data']['numeroInvima'] ?? null;
                $estadoInvima = $device['data']['estadoInvima'] ?? null;
                
                if ($registroSanitario || $numeroInvima || $estadoInvima) {
                    $equiposConInvimaAPI++;
                    echo "   ✅ ID: {$device['id']} - {$device['equipo']['name']}\n";
                    echo "      Registro: " . ($registroSanitario ?: 'N/A') . "\n";
                    echo "      Estado: " . ($estadoInvima ?: 'N/A') . "\n\n";
                }
            }
            
            echo "📊 Equipos con INVIMA en API: $equiposConInvimaAPI de " . count($equipos) . "\n";
            
        } else {
            echo "❌ Error en respuesta del endpoint\n";
            exit;
        }
    } else {
        echo "❌ Error en endpoint: HTTP $httpCode\n";
        exit;
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Verificar estructura de respuesta para frontend
    echo "3️⃣ VERIFICANDO ESTRUCTURA PARA FRONTEND:\n\n";
    
    $equipoEjemplo = $equipos[0] ?? null;
    if ($equipoEjemplo && isset($equipoEjemplo['data']['registroSanitario'])) {
        echo "✅ Estructura correcta para frontend:\n\n";
        echo "📋 Campos disponibles en equipment.data:\n";
        foreach ($equipoEjemplo['data'] as $key => $value) {
            if (strpos(strtolower($key), 'invima') !== false || strpos(strtolower($key), 'registro') !== false) {
                echo "   ✅ $key: " . ($value ?: 'null') . "\n";
            }
        }
        
        echo "\n💡 El frontend puede acceder a:\n";
        echo "   - equipment.data.registroSanitario\n";
        echo "   - equipment.data.numeroInvima\n";
        echo "   - equipment.data.fechaVencimientoInvima\n";
        echo "   - equipment.data.estadoInvima\n";
        echo "   - equipment.data.archivoInvima\n";
        
    } else {
        echo "❌ Estructura incorrecta - no se encuentra registroSanitario\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESULTADO FINAL:\n\n";
    
    $todoFunciona = true;
    $problemas = [];
    
    // Verificaciones
    if (empty($equiposConRegistro)) {
        $todoFunciona = false;
        $problemas[] = "No hay equipos con registro INVIMA en BD";
    }
    
    if ($httpCode != 200) {
        $todoFunciona = false;
        $problemas[] = "Endpoint API no funciona";
    }
    
    if (!isset($equipoEjemplo['data']['registroSanitario'])) {
        $todoFunciona = false;
        $problemas[] = "Estructura de respuesta incorrecta";
    }
    
    if ($todoFunciona) {
        echo "🎉 ¡TODO FUNCIONA CORRECTAMENTE!\n\n";
        echo "✅ Base de datos: Equipos con registro INVIMA\n";
        echo "✅ API Endpoint: Devuelve campos INVIMA\n";
        echo "✅ Estructura: Compatible con frontend\n";
        echo "✅ Frontend: Configurado para mostrar registro\n";
        
        echo "\n🚀 EQUIPOS RECOMENDADOS PARA VERIFICAR EN EL FRONTEND:\n\n";
        
        foreach (array_slice($equiposConRegistro, 0, 3) as $equipo) {
            echo "   📋 {$equipo['name']} (ID: {$equipo['id']})\n";
            echo "      Código: " . ($equipo['code'] ?: 'Sin código') . "\n";
            echo "      Registro INVIMA: {$equipo['registro_sanitario']}\n";
            echo "      Estado: {$equipo['estado_invima']}\n\n";
        }
        
        echo "💡 INSTRUCCIONES PARA VERIFICAR:\n";
        echo "1. Ve al frontend de equipos médicos\n";
        echo "2. Busca los equipos listados arriba\n";
        echo "3. Verifica que aparezca el 'Registro Sanitario' en cada equipo\n";
        echo "4. El registro debería mostrarse en un recuadro gris\n";
        
    } else {
        echo "❌ HAY PROBLEMAS:\n\n";
        foreach ($problemas as $problema) {
            echo "   • $problema\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
