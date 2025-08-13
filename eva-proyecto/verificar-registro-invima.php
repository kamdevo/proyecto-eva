<?php
/**
 * Verificar que el registro INVIMA se muestre correctamente
 */

echo "🔍 VERIFICANDO REGISTRO INVIMA DE EQUIPOS\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Verificar equipos con registro INVIMA en la BD
    echo "1️⃣ EQUIPOS CON REGISTRO INVIMA EN LA BASE DE DATOS:\n\n";
    
    $stmt = $pdo->query("
        SELECT 
            id, 
            name, 
            code,
            registro_sanitario,
            archivo_invima,
            CASE 
                WHEN registro_sanitario IS NOT NULL AND registro_sanitario != '' THEN 'Sí'
                ELSE 'No'
            END as tiene_registro
        FROM equipos 
        WHERE registro_sanitario IS NOT NULL AND registro_sanitario != '' 
        ORDER BY id 
        LIMIT 10
    ");
    
    $equiposConRegistro = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($equiposConRegistro)) {
        echo "❌ No se encontraron equipos con registro INVIMA\n";
        
        // Verificar si hay equipos sin registro
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM equipos WHERE registro_sanitario IS NULL OR registro_sanitario = ''");
        $sinRegistro = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "📊 Equipos sin registro INVIMA: $sinRegistro\n";
        
        // Mostrar algunos equipos para verificar estructura
        echo "\n📋 ESTRUCTURA DE ALGUNOS EQUIPOS:\n";
        $stmt = $pdo->query("SELECT id, name, code, registro_sanitario, archivo_invima FROM equipos LIMIT 5");
        $equiposMuestra = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($equiposMuestra as $equipo) {
            echo "   ID: {$equipo['id']}\n";
            echo "   Nombre: " . ($equipo['name'] ?: 'Sin nombre') . "\n";
            echo "   Registro: " . ($equipo['registro_sanitario'] ?: 'NULL') . "\n";
            echo "   Archivo: " . ($equipo['archivo_invima'] ?: 'NULL') . "\n\n";
        }
        
    } else {
        echo "✅ Equipos con registro INVIMA encontrados: " . count($equiposConRegistro) . "\n\n";
        
        printf("%-5s %-30s %-15s %-25s %-15s\n", "ID", "NOMBRE", "CÓDIGO", "REGISTRO INVIMA", "ARCHIVO");
        echo str_repeat("-", 90) . "\n";
        
        foreach ($equiposConRegistro as $equipo) {
            printf("%-5s %-30s %-15s %-25s %-15s\n",
                $equipo['id'],
                substr($equipo['name'] ?: 'Sin nombre', 0, 29),
                substr($equipo['code'] ?: 'Sin código', 0, 14),
                substr($equipo['registro_sanitario'], 0, 24),
                $equipo['archivo_invima'] ? 'Sí' : 'No'
            );
        }
    }
    
    echo "\n" . str_repeat("-", 60) . "\n\n";
    
    // 2. Verificar endpoint de equipos médicos
    echo "2️⃣ VERIFICANDO ENDPOINT DE EQUIPOS MÉDICOS:\n\n";
    
    $medicalDevicesUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?page=1&per_page=5";
    
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
            
            echo "📋 VERIFICANDO REGISTRO INVIMA EN RESPUESTA:\n\n";
            
            foreach (array_slice($equipos, 0, 5) as $index => $device) {
                echo "🔍 EQUIPO " . ($index + 1) . ":\n";
                echo "   ID: " . ($device['id'] ?? 'N/A') . "\n";
                echo "   Nombre: " . ($device['equipo']['name'] ?? 'N/A') . "\n";
                
                // Verificar diferentes campos donde puede estar el registro
                $registroSanitario = null;
                $archivoInvima = null;
                
                // Buscar en diferentes ubicaciones
                if (isset($device['equipo']['registro_sanitario'])) {
                    $registroSanitario = $device['equipo']['registro_sanitario'];
                }
                if (isset($device['registro_sanitario'])) {
                    $registroSanitario = $device['registro_sanitario'];
                }
                if (isset($device['data']['registroSanitario'])) {
                    $registroSanitario = $device['data']['registroSanitario'];
                }
                
                if (isset($device['equipo']['archivo_invima'])) {
                    $archivoInvima = $device['equipo']['archivo_invima'];
                }
                if (isset($device['archivo_invima'])) {
                    $archivoInvima = $device['archivo_invima'];
                }
                
                echo "   Registro INVIMA: " . ($registroSanitario ?: 'NO ENCONTRADO') . "\n";
                echo "   Archivo INVIMA: " . ($archivoInvima ?: 'NO ENCONTRADO') . "\n";
                
                // Mostrar estructura completa para debug
                if (!$registroSanitario) {
                    echo "   📋 Campos disponibles en 'equipo':\n";
                    if (isset($device['equipo'])) {
                        foreach (array_keys($device['equipo']) as $key) {
                            echo "      - $key\n";
                        }
                    }
                    
                    echo "   📋 Campos disponibles en 'data':\n";
                    if (isset($device['data'])) {
                        foreach (array_keys($device['data']) as $key) {
                            echo "      - $key\n";
                        }
                    }
                }
                
                echo "\n";
            }
            
        } else {
            echo "❌ Respuesta inesperada del endpoint\n";
        }
    } else {
        echo "❌ Error en endpoint: HTTP $httpCode\n";
    }
    
    echo "\n" . str_repeat("-", 60) . "\n\n";
    
    // 3. Verificar tabla registros_invima
    echo "3️⃣ VERIFICANDO TABLA REGISTROS_INVIMA:\n\n";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'registros_invima'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Tabla 'registros_invima' existe\n";
        
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM registros_invima");
        $totalRegistros = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "📊 Total registros INVIMA: $totalRegistros\n\n";
        
        if ($totalRegistros > 0) {
            echo "📋 PRIMEROS REGISTROS INVIMA:\n";
            $stmt = $pdo->query("SELECT * FROM registros_invima LIMIT 5");
            $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($registros as $registro) {
                echo "   ID: {$registro['id']}\n";
                echo "   Número: " . ($registro['numero_registro'] ?: 'N/A') . "\n";
                echo "   Nombre: " . ($registro['nombre_comercial'] ?: 'N/A') . "\n";
                echo "   Fabricante: " . ($registro['fabricante'] ?: 'N/A') . "\n";
                echo "   Estado: " . ($registro['estado'] ?: 'N/A') . "\n\n";
            }
        }
        
    } else {
        echo "❌ Tabla 'registros_invima' NO existe\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 DIAGNÓSTICO FINAL:\n\n";
    
    if (!empty($equiposConRegistro)) {
        echo "✅ Hay equipos con registro INVIMA en la BD\n";
        echo "💡 Verificar que el endpoint los incluya correctamente\n";
    } else {
        echo "❌ No hay equipos con registro INVIMA\n";
        echo "💡 Posibles acciones:\n";
        echo "   1. Agregar registros INVIMA a algunos equipos\n";
        echo "   2. Verificar que el campo se llame 'registro_sanitario'\n";
        echo "   3. Importar datos de registros INVIMA\n";
    }
    
    echo "\n🔧 CAMPOS A VERIFICAR EN EL FRONTEND:\n";
    echo "   - registro_sanitario\n";
    echo "   - archivo_invima\n";
    echo "   - data.registroSanitario\n";
    echo "   - equipo.registro_sanitario\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
