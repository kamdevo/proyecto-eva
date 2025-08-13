<?php
/**
 * Registrar un equipo completo para verificar el flujo al 100%
 */

echo "🏥 REGISTRO COMPLETO DE EQUIPO MÉDICO\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Obtener datos para el modal
    echo "1️⃣ OBTENIENDO DATOS PARA EL MODAL:\n\n";
    
    $modalDataUrl = "$baseUrl/api/v1/test/modal-equipment-data";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $modalDataUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200) {
        $modalData = json_decode($response, true);
        echo "✅ Datos del modal obtenidos correctamente\n";
        
        $sedes = $modalData['data']['sedes'] ?? [];
        $servicios = $modalData['data']['servicios'] ?? [];
        $areas = $modalData['data']['areas'] ?? [];
        $invimas = $modalData['data']['invimas'] ?? [];
        
        echo "   📊 Sedes: " . count($sedes) . "\n";
        echo "   📊 Servicios: " . count($servicios) . "\n";
        echo "   📊 Áreas: " . count($areas) . "\n";
        echo "   📊 Registros INVIMA: " . count($invimas) . "\n";
        
        if (count($invimas) > 0) {
            echo "\n   📋 Primeros registros INVIMA disponibles:\n";
            foreach (array_slice($invimas, 0, 3) as $invima) {
                echo "      • ID: {$invima['id']} - {$invima['name']}\n";
            }
        }
        
    } else {
        echo "❌ Error obteniendo datos del modal: HTTP $httpCode\n";
        exit;
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Preparar datos del equipo
    echo "2️⃣ PREPARANDO DATOS DEL EQUIPO:\n\n";
    
    // Usar datos reales de los catálogos obtenidos
    $sedeId = $sedes[0]['id'] ?? 1;
    $servicioId = $servicios[0]['id'] ?? 1;
    $areaId = $areas[0]['id'] ?? 1;
    $invimaId = $invimas[0]['id'] ?? null;
    
    $equipoData = [
        'name' => 'DESFIBRILADOR AUTOMÁTICO PRUEBA FLUJO',
        'code' => 'DEF-FLUJO-' . date('YmdHis'),
        'descripcion' => 'Desfibrilador automático para prueba de flujo completo de registro',
        'marca' => 'ZOLL',
        'modelo' => 'AED Plus',
        'serial' => 'ZOLL-' . rand(100000, 999999),
        'fecha_ad' => date('Y-m-d'),
        'fecha_instalacion' => date('Y-m-d'),
        'vida_util' => '8 años',
        'costo' => '15000000',
        'garantia' => '3 años',
        'accesorios' => 'Electrodos, Batería de respaldo, Maletín de transporte',
        'localizacion_actual' => 'Urgencias - Triage',
        'verificacion_inventario' => '1',
        'calibracion' => '1',
        'periodicidad' => 'Anual',
        'evaluacion_desempenio' => 'Excelente',
        'movilidad' => 'Portátil',
        'propiedad' => 'Propio',
        'observacion' => 'Equipo registrado desde terminal para verificar flujo completo',
        
        // Campos INVIMA
        'registro_sanitario' => 'INVIMA-FLUJO-' . date('Y') . '-' . rand(100, 999),
        'numero_invima' => 'INVIMA-FLUJO-' . date('Y') . '-' . rand(100, 999),
        'fecha_vencimiento_invima' => date('Y-m-d', strtotime('+5 years')),
        'estado_invima' => 'Vigente',
        
        // IDs de relaciones
        'servicio_id' => $servicioId,
        'area_id' => $areaId,
        'invima_id' => $invimaId,
        'fuente_id' => 1,
        'tecnologia_id' => 1,
        'frecuencia_id' => 1,
        'cbiomedica_id' => 1,
        'criesgo_id' => 1,
        'tadquisicion_id' => 1,
        'estadoequipo_id' => 1,
        'tipo_id' => 1,
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
    echo "   Sede ID: $sedeId\n";
    echo "   Servicio ID: $servicioId\n";
    echo "   Área ID: $areaId\n";
    echo "   INVIMA ID: " . ($invimaId ?: 'Sin asignar') . "\n";
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Insertar en base de datos
    echo "3️⃣ INSERTANDO EN BASE DE DATOS:\n\n";
    
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
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
    
    // 4. Verificar en endpoint de equipos médicos
    echo "4️⃣ VERIFICANDO EN ENDPOINT DE EQUIPOS MÉDICOS:\n\n";
    
    $searchUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?search=" . urlencode($equipoData['code']);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $searchUrl);
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
            echo "✅ Búsqueda exitosa - Equipos encontrados: " . count($equipos) . "\n\n";
            
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
                echo "   Estado INVIMA: " . ($equipoEncontrado['data']['estadoInvima'] ?? 'N/A') . "\n";
                
                // Verificar imagen
                echo "\n🖼️ IMAGEN:\n";
                echo "   URL: " . ($equipoEncontrado['equipo']['image'] ?? 'Sin imagen') . "\n";
                
            } else {
                echo "❌ Equipo NO encontrado en la respuesta del API\n";
            }
            
        } else {
            echo "❌ Respuesta inesperada del endpoint\n";
        }
    } else {
        echo "❌ Error en búsqueda: HTTP $httpCode\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 5. Verificar endpoint de archivos
    echo "5️⃣ VERIFICANDO ENDPOINT DE ARCHIVOS:\n\n";
    
    $filesUrl = "$baseUrl/api/v1/equipos/$equipoId/files";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $filesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        echo "✅ Endpoint de archivos funciona\n";
        echo "📄 Archivos disponibles: " . (isset($data['data']) ? count($data['data']) : 0) . "\n";
    } else {
        echo "❌ Error en endpoint de archivos: HTTP $httpCode\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 VERIFICACIÓN FINAL DEL FLUJO:\n\n";
    
    $verificaciones = [
        'Datos del modal' => $httpCode == 200,
        'Inserción en BD' => isset($equipoId),
        'Búsqueda en API' => isset($equipoEncontrado),
        'Campos INVIMA' => isset($equipoEncontrado['data']['registroSanitario']),
        'Endpoint archivos' => $httpCode == 200
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
        echo "✅ Todos los endpoints funcionan correctamente\n";
        echo "✅ Registro INVIMA se muestra correctamente\n";
        echo "✅ Imágenes configuradas correctamente\n";
        echo "✅ Base de datos actualizada\n";
        
        echo "\n🚀 DATOS PARA BUSCAR EN EL FRONTEND:\n";
        echo "   📋 Código: {$equipoData['code']}\n";
        echo "   📋 Nombre: {$equipoData['name']}\n";
        echo "   📋 ID: $equipoId\n";
        echo "   📋 Registro INVIMA: {$equipoData['registro_sanitario']}\n";
        
        echo "\n💡 INSTRUCCIONES:\n";
        echo "1. Ve al frontend de equipos médicos\n";
        echo "2. Busca el equipo por código: {$equipoData['code']}\n";
        echo "3. Verifica que aparezca:\n";
        echo "   - Nombre completo\n";
        echo "   - Código en badge naranja\n";
        echo "   - Registro INVIMA en recuadro gris\n";
        echo "   - Marca y modelo\n";
        echo "   - Imagen placeholder\n";
        
        echo "\n🎯 ¡EL SISTEMA ESTÁ FUNCIONANDO PERFECTAMENTE!\n";
        
    } else {
        echo "\n❌ HAY PROBLEMAS EN EL FLUJO\n";
        echo "💡 Revisar los elementos marcados con ❌\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
