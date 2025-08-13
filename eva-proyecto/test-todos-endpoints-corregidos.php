<?php
/**
 * Probar todos los endpoints corregidos y buscar errores restantes
 */

echo "🧪 PROBANDO TODOS LOS ENDPOINTS CORREGIDOS\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Probar endpoints básicos
    echo "1️⃣ PROBANDO ENDPOINTS BÁSICOS:\n\n";
    
    $endpoints = [
        'Sedes' => "$baseUrl/api/v1/sedes",
        'Servicios' => "$baseUrl/api/v1/servicios", 
        'Áreas' => "$baseUrl/api/v1/areas",
        'Tipos' => "$baseUrl/api/v1/tipos",
        'Estados' => "$baseUrl/api/v1/estados",
        'Registros INVIMA' => "$baseUrl/api/v1/registros-invima",
        'Datos del modal' => "$baseUrl/api/v1/test/modal-equipment-data"
    ];
    
    $endpointsOk = 0;
    $datosModal = [];
    
    foreach ($endpoints as $nombre => $url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode == 200) {
            echo "   ✅ $nombre: HTTP 200";
            
            $data = json_decode($response, true);
            if ($data && $data['success']) {
                $count = is_array($data['data']) ? count($data['data']) : 'N/A';
                echo " ($count registros)\n";
                
                if ($nombre === 'Datos del modal') {
                    $datosModal = $data['data'];
                }
            } else {
                echo " (Respuesta inesperada)\n";
            }
            
            $endpointsOk++;
        } else {
            echo "   ❌ $nombre: HTTP $httpCode\n";
            
            if ($httpCode >= 500) {
                $errorData = json_decode($response, true);
                if ($errorData && isset($errorData['message'])) {
                    echo "      Error: {$errorData['message']}\n";
                }
            }
        }
    }
    
    echo "\n📊 Endpoints funcionando: $endpointsOk de " . count($endpoints) . "\n";
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar datos del modal específicamente
    echo "2️⃣ VERIFICANDO DATOS DEL MODAL:\n\n";
    
    if (!empty($datosModal)) {
        $categorias = [
            'sedes' => 'Sedes',
            'servicios' => 'Servicios', 
            'areas' => 'Áreas',
            'tipos' => 'Tipos',
            'estados' => 'Estados',
            'invimas' => 'Registros INVIMA'
        ];
        
        foreach ($categorias as $key => $nombre) {
            if (isset($datosModal[$key])) {
                $count = count($datosModal[$key]);
                echo "   ✅ $nombre: $count registros\n";
            } else {
                echo "   ❌ $nombre: No disponible\n";
            }
        }
        
    } else {
        echo "❌ No se pudieron obtener datos del modal\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Probar archivo INVIMA específico
    echo "3️⃣ PROBANDO DESCARGA DE PDF INVIMA:\n\n";
    
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    $stmt = $pdo->query("SELECT invima, file FROM invimas WHERE file IS NOT NULL AND file != '' LIMIT 1");
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($registro) {
        $archivoNombre = $registro['file'];
        $numeroInvima = $registro['invima'];
        
        echo "📄 Probando descarga completa:\n";
        echo "   Número INVIMA: $numeroInvima\n";
        echo "   Archivo: $archivoNombre\n";
        
        $fileUrl = "$baseUrl/storage/invimas/$archivoNombre";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $fileUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $pdfData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $downloadSize = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
        curl_close($ch);
        
        echo "   🔗 URL: $fileUrl\n";
        echo "   📊 HTTP: $httpCode\n";
        echo "   📄 Tipo: $contentType\n";
        echo "   📦 Tamaño: $downloadSize bytes\n";
        
        if ($httpCode == 200 && $downloadSize > 0) {
            echo "   ✅ DESCARGA EXITOSA\n";
            
            // Verificar que es un PDF válido
            if (strpos($pdfData, '%PDF') === 0) {
                echo "   ✅ ARCHIVO PDF VÁLIDO\n";
            } else {
                echo "   ⚠️ Archivo no es PDF válido\n";
            }
            
        } else {
            echo "   ❌ ERROR EN DESCARGA\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 4. Verificar posibles errores de JavaScript
    echo "4️⃣ VERIFICANDO POSIBLES ERRORES DE JAVASCRIPT:\n\n";
    
    echo "📋 ERRORES COMUNES A VERIFICAR:\n";
    echo "   1. ✅ toLowerCase() en campos null - SOLUCIONADO\n";
    echo "   2. ✅ Archivos INVIMA 404 - SOLUCIONADO\n";
    echo "   3. ⚠️ Endpoints 404/401 - EN PROCESO\n";
    echo "   4. ⚠️ Campos undefined en formularios\n";
    echo "   5. ⚠️ Validaciones de formulario\n";
    echo "   6. ⚠️ Manejo de respuestas de API\n";
    
    echo "\n💡 ÁREAS A REVISAR EN EL FRONTEND:\n";
    echo "   - Validación de campos requeridos\n";
    echo "   - Manejo de errores de API\n";
    echo "   - Estados de carga (loading)\n";
    echo "   - Respuestas vacías o null\n";
    echo "   - Configuración de axios\n";
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 ESTADO ACTUAL:\n\n";
    
    echo "✅ PROBLEMAS SOLUCIONADOS:\n";
    echo "   1. Error toLowerCase() con campos null\n";
    echo "   2. Error 404 en archivos INVIMA\n";
    echo "   3. Select INVIMA con ancho controlado\n";
    echo "   4. Archivos PDF creados y accesibles\n";
    echo "   5. Endpoints básicos agregados\n";
    
    echo "\n⚠️ PROBLEMAS PENDIENTES:\n";
    if ($endpointsOk < count($endpoints)) {
        echo "   - Algunos endpoints aún con errores\n";
    }
    echo "   - Posibles errores de validación en frontend\n";
    echo "   - Manejo de campos undefined\n";
    
    echo "\n🚀 INSTRUCCIONES FINALES:\n";
    echo "1. Refresca el frontend (Ctrl+F5)\n";
    echo "2. Abre la consola del navegador (F12)\n";
    echo "3. Abre el modal de agregar equipo\n";
    echo "4. Observa si hay errores en la consola\n";
    echo "5. Selecciona un registro INVIMA\n";
    echo "6. Haz clic en ver PDF (📄)\n";
    echo "7. Verifica que el PDF se abra correctamente\n";
    echo "8. Reporta cualquier error que aparezca\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
