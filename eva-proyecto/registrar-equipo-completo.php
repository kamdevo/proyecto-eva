<?php
/**
 * Registrar un equipo completo desde terminal para verificar el flujo
 */

echo "🏥 REGISTRANDO EQUIPO MÉDICO COMPLETO\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Preparar datos del equipo
    echo "1️⃣ PREPARANDO DATOS DEL EQUIPO:\n\n";
    
    $equipoData = [
        'name' => 'MONITOR DE SIGNOS VITALES PRUEBA',
        'code' => 'MSV-TEST-' . date('YmdHis'),
        'descripcion' => 'Monitor de signos vitales para prueba de registro completo',
        'marca' => 'PHILIPS',
        'modelo' => 'IntelliVue MX40',
        'serial' => 'PHI-' . rand(100000, 999999),
        'registro_sanitario' => 'INVIMA-TEST-' . date('Y') . '-' . rand(100, 999),
        'numero_invima' => 'INVIMA-TEST-' . date('Y') . '-' . rand(100, 999),
        'fecha_vencimiento_invima' => date('Y-m-d', strtotime('+3 years')),
        'estado_invima' => 'Vigente',
        'fecha_ad' => date('Y-m-d'),
        'fecha_instalacion' => date('Y-m-d'),
        'vida_util' => '10 años',
        'costo' => '25000000',
        'garantia' => '2 años',
        'accesorios' => 'Cable de ECG, Sensor de SpO2, Brazalete de presión',
        'localizacion_actual' => 'UCI - Cama 5',
        'verificacion_inventario' => '1',
        'calibracion' => '1',
        'periodicidad' => 'Semestral',
        'evaluacion_desempenio' => 'Excelente',
        'movilidad' => 'Portátil',
        'propiedad' => 'Propio',
        'observacion' => 'Equipo registrado desde terminal para prueba de flujo completo',
        
        // IDs de relaciones (usar valores existentes)
        'servicio_id' => 1,
        'area_id' => 1,
        'fuente_id' => 1,
        'tecnologia_id' => 1,
        'frecuencia_id' => 1,
        'cbiomedica_id' => 1,
        'criesgo_id' => 1,
        'tadquisicion_id' => 1,
        'estadoequipo_id' => 1,
        'tipo_id' => 1, // Equipo médico
        'propietario_id' => 1,
        'status' => 1
    ];
    
    echo "📋 Datos del equipo preparados:\n";
    echo "   Nombre: {$equipoData['name']}\n";
    echo "   Código: {$equipoData['code']}\n";
    echo "   Marca: {$equipoData['marca']}\n";
    echo "   Modelo: {$equipoData['modelo']}\n";
    echo "   Serie: {$equipoData['serial']}\n";
    echo "   Registro INVIMA: {$equipoData['registro_sanitario']}\n";
    echo "   Estado INVIMA: {$equipoData['estado_invima']}\n";
    echo "   Vencimiento INVIMA: {$equipoData['fecha_vencimiento_invima']}\n";
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Insertar en base de datos
    echo "2️⃣ INSERTANDO EN BASE DE DATOS:\n\n";
    
    $columns = array_keys($equipoData);
    $placeholders = ':' . implode(', :', $columns);
    $columnsList = implode(', ', $columns);
    
    $sql = "INSERT INTO equipos ($columnsList) VALUES ($placeholders)";
    
    $stmt = $pdo->prepare($sql);
    
    foreach ($equipoData as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    
    if ($stmt->execute()) {
        $equipoId = $pdo->lastInsertId();
        echo "✅ Equipo insertado exitosamente\n";
        echo "📊 ID del equipo: $equipoId\n";
    } else {
        echo "❌ Error insertando equipo: " . implode(', ', $stmt->errorInfo()) . "\n";
        exit;
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Verificar en endpoint de archivos
    echo "3️⃣ VERIFICANDO ENDPOINT DE ARCHIVOS:\n\n";
    
    $filesUrl = "$baseUrl/api/v1/equipos/$equipoId/files";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $filesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        echo "✅ Endpoint de archivos funciona\n";
        echo "📄 Respuesta: " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        echo "❌ Error en endpoint de archivos: $response\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 4. Verificar en endpoint de equipos médicos
    echo "4️⃣ VERIFICANDO EN ENDPOINT DE EQUIPOS MÉDICOS:\n\n";
    
    $medicalDevicesUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?search=" . urlencode($equipoData['code']);
    
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
            echo "✅ Endpoint de equipos médicos funciona\n";
            echo "📊 Equipos encontrados: " . count($equipos) . "\n\n";
            
            $equipoEncontrado = null;
            foreach ($equipos as $device) {
                if ($device['id'] == $equipoId) {
                    $equipoEncontrado = $device;
                    break;
                }
            }
            
            if ($equipoEncontrado) {
                echo "🎯 EQUIPO ENCONTRADO EN API:\n";
                echo "   ID: {$equipoEncontrado['id']}\n";
                echo "   Nombre: " . ($equipoEncontrado['equipo']['name'] ?? 'N/A') . "\n";
                echo "   Código: " . ($equipoEncontrado['equipo']['code'] ?? 'N/A') . "\n";
                echo "   Marca: " . ($equipoEncontrado['equipo']['brand'] ?? 'N/A') . "\n";
                echo "   Modelo: " . ($equipoEncontrado['equipo']['model'] ?? 'N/A') . "\n";
                echo "   Serie: " . ($equipoEncontrado['equipo']['series'] ?? 'N/A') . "\n";
                
                // Verificar campos INVIMA
                echo "\n📋 CAMPOS INVIMA:\n";
                echo "   Registro Sanitario: " . ($equipoEncontrado['data']['registroSanitario'] ?? 'N/A') . "\n";
                echo "   Número INVIMA: " . ($equipoEncontrado['data']['numeroInvima'] ?? 'N/A') . "\n";
                echo "   Fecha Vencimiento: " . ($equipoEncontrado['data']['fechaVencimientoInvima'] ?? 'N/A') . "\n";
                echo "   Estado INVIMA: " . ($equipoEncontrado['data']['estadoInvima'] ?? 'N/A') . "\n";
                
                // Verificar otros campos
                echo "\n📊 OTROS CAMPOS:\n";
                echo "   Estado: " . ($equipoEncontrado['data']['status'] ?? 'N/A') . "\n";
                echo "   Clasificación: " . ($equipoEncontrado['data']['clasificacion'] ?? 'N/A') . "\n";
                echo "   Riesgo: " . ($equipoEncontrado['data']['riesgo'] ?? 'N/A') . "\n";
                echo "   Archivos: " . ($equipoEncontrado['data']['archivos'] ?? 'N/A') . "\n";
                
            } else {
                echo "❌ Equipo NO encontrado en la respuesta del API\n";
            }
            
        } else {
            echo "❌ Respuesta inesperada del endpoint\n";
        }
    } else {
        echo "❌ Error en endpoint de equipos médicos: $response\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN DE VERIFICACIÓN:\n\n";
    
    $verificaciones = [
        'Inserción en BD' => $equipoId ? true : false,
        'Endpoint de archivos' => $httpCode == 200,
        'Endpoint equipos médicos' => isset($equipoEncontrado),
        'Campos INVIMA' => isset($equipoEncontrado['data']['registroSanitario']),
        'Estructura completa' => isset($equipoEncontrado['equipo']['name'])
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
        echo "\n🎉 ¡FLUJO COMPLETO FUNCIONANDO AL 100%!\n";
        echo "✅ El equipo se registró correctamente\n";
        echo "✅ Todos los endpoints funcionan\n";
        echo "✅ Los campos INVIMA se muestran\n";
        echo "✅ La estructura es correcta\n";
        
        echo "\n🚀 DATOS PARA BUSCAR EN EL FRONTEND:\n";
        echo "   Código: {$equipoData['code']}\n";
        echo "   Nombre: {$equipoData['name']}\n";
        echo "   ID: $equipoId\n";
        echo "   Registro INVIMA: {$equipoData['registro_sanitario']}\n";
        
    } else {
        echo "\n❌ HAY PROBLEMAS EN EL FLUJO\n";
        echo "💡 Revisar los elementos marcados con ❌\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
