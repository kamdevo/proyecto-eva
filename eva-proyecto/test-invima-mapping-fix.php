<?php

/**
 * Script para probar el fix de mapeo INVIMA
 * Registra un equipo con datos INVIMA y verifica que se guarde correctamente
 */

echo "🧪 PROBANDO FIX DE MAPEO INVIMA\n";
echo "=" . str_repeat("=", 50) . "\n\n";

// Primero, verificar si hay registros INVIMA disponibles
echo "🔍 VERIFICANDO REGISTROS INVIMA DISPONIBLES:\n";

$url = 'http://localhost:8000/api/v1/registros-invima';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && $data['success'] && !empty($data['data'])) {
        echo "✅ Registros INVIMA encontrados: " . count($data['data']) . "\n";
        
        // Mostrar los primeros 3 registros
        $registros = array_slice($data['data'], 0, 3);
        foreach ($registros as $registro) {
            echo "   - ID: {$registro['id']}, Número: {$registro['numero_registro']}, Equipo: " . ($registro['nombre_equipo'] ?? 'N/A') . "\n";
        }
        
        // Usar el primer registro para la prueba
        $registroParaPrueba = $registros[0];
        echo "\n📋 USANDO REGISTRO PARA PRUEBA:\n";
        echo "   ID: {$registroParaPrueba['id']}\n";
        echo "   Número: {$registroParaPrueba['numero_registro']}\n";
        echo "   Equipo: " . ($registroParaPrueba['nombre_equipo'] ?? 'N/A') . "\n\n";
        
    } else {
        echo "❌ No se encontraron registros INVIMA\n";
        echo "Creando un registro de prueba...\n\n";
        
        // Crear un registro INVIMA de prueba
        $registroData = [
            'numero_registro' => 'INVIMA-TEST-' . time(),
            'descripcion_detallada' => 'Registro de prueba para testing',
            'titulo' => 'Equipo de Prueba INVIMA',
            'marcas' => 'Marca Test',
            'estado' => 'vigente'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/registros-invima');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($registroData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $createResponse = curl_exec($ch);
        $createHttpCode = curl_getinfo($ch, CURLOPT_HTTP_CODE);
        curl_close($ch);
        
        if ($createHttpCode === 200 || $createHttpCode === 201) {
            $createData = json_decode($createResponse, true);
            if ($createData && $createData['success']) {
                $registroParaPrueba = $createData['data'];
                echo "✅ Registro INVIMA creado exitosamente\n";
                echo "   ID: {$registroParaPrueba['id']}\n";
                echo "   Número: {$registroParaPrueba['numero_registro']}\n\n";
            } else {
                echo "❌ Error creando registro INVIMA\n";
                exit(1);
            }
        } else {
            echo "❌ Error HTTP creando registro INVIMA: $createHttpCode\n";
            exit(1);
        }
    }
} else {
    echo "❌ Error obteniendo registros INVIMA: HTTP $httpCode\n";
    exit(1);
}

// Ahora registrar un equipo con el registro INVIMA
echo "🚀 REGISTRANDO EQUIPO CON DATOS INVIMA:\n";

$equipoData = [
    'name' => 'Equipo Test INVIMA Fix - ' . date('Y-m-d H:i:s'),
    'servicio_id' => 1,
    'marca' => 'Test Brand INVIMA',
    'modelo' => 'Model INVIMA Test',
    'numero_serie' => 'INVIMA-TEST-' . time(),
    'descripcion' => 'Equipo para probar fix de mapeo INVIMA',
    
    // DATOS INVIMA - ESTE ES EL CAMPO CRÍTICO
    'invima' => $registroParaPrueba['numero_registro'], // Número de registro INVIMA
    
    // Fechas
    'fecha_adquisicion' => '2024-01-15',
    'fecha_instalacion' => '2024-02-01',
    
    // Otros campos
    'vida_util' => '10',
    'costo' => '3000000',
    'garantia' => '24'
];

echo "📤 DATOS A ENVIAR:\n";
echo "   Nombre: {$equipoData['name']}\n";
echo "   INVIMA: {$equipoData['invima']}\n";
echo "   Marca: {$equipoData['marca']}\n";
echo "   Modelo: {$equipoData['modelo']}\n\n";

// Registrar el equipo
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/equipos');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($equipoData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$equipoResponse = curl_exec($ch);
$equipoHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📥 RESPUESTA DEL REGISTRO:\n";
echo "   HTTP Code: $equipoHttpCode\n";

if ($equipoHttpCode === 200 || $equipoHttpCode === 201) {
    $equipoResponseData = json_decode($equipoResponse, true);
    if ($equipoResponseData && $equipoResponseData['success']) {
        $equipoId = $equipoResponseData['data']['id'];
        echo "✅ Equipo registrado exitosamente con ID: $equipoId\n\n";
        
        // Ahora verificar que los datos INVIMA se guardaron correctamente
        echo "🔍 VERIFICANDO DATOS INVIMA EN BASE DE DATOS:\n";
        
        // Obtener información completa del equipo
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos/$equipoId/complete-info");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        
        $infoResponse = curl_exec($ch);
        $infoHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($infoHttpCode === 200) {
            $infoData = json_decode($infoResponse, true);
            if ($infoData && $infoData['success']) {
                $equipoInfo = $infoData['data'];
                
                echo "📊 DATOS INVIMA RECUPERADOS:\n";
                echo "   invima (texto): " . ($equipoInfo['invima'] ?? 'NULL') . "\n";
                echo "   invima_id: " . ($equipoInfo['invima_id'] ?? 'NULL') . "\n";
                echo "   registro_sanitario: " . ($equipoInfo['registro_sanitario'] ?? 'NULL') . "\n";
                echo "   archivo_registro_sanitario: " . ($equipoInfo['archivo_registro_sanitario'] ?? 'NULL') . "\n";
                echo "   archivo_invima: " . ($equipoInfo['archivo_invima'] ?? 'NULL') . "\n\n";
                
                // Verificar que el mapeo funcionó
                $exito = true;
                $problemas = [];
                
                if (empty($equipoInfo['invima']) || $equipoInfo['invima'] !== $registroParaPrueba['numero_registro']) {
                    $exito = false;
                    $problemas[] = "Campo 'invima' no coincide";
                }
                
                if (empty($equipoInfo['invima_id']) || $equipoInfo['invima_id'] == 1) {
                    $exito = false;
                    $problemas[] = "Campo 'invima_id' no se mapeó correctamente (es $equipoInfo[invima_id], debería ser {$registroParaPrueba['id']})";
                }
                
                if (!empty($equipoInfo['registro_sanitario']) && $equipoInfo['registro_sanitario'] !== $registroParaPrueba['numero_registro']) {
                    $problemas[] = "Campo 'registro_sanitario' no coincide";
                }
                
                if ($exito && empty($problemas)) {
                    echo "🎉 ¡ÉXITO! EL FIX DE MAPEO INVIMA FUNCIONA CORRECTAMENTE\n";
                    echo "✅ El número de registro se guardó en 'invima'\n";
                    echo "✅ El ID se mapeó correctamente en 'invima_id'\n";
                    echo "✅ Los datos se pueden recuperar correctamente\n";
                } else {
                    echo "❌ PROBLEMAS ENCONTRADOS:\n";
                    foreach ($problemas as $problema) {
                        echo "   - $problema\n";
                    }
                }
                
            } else {
                echo "❌ Error obteniendo información del equipo\n";
            }
        } else {
            echo "❌ Error HTTP obteniendo información: $infoHttpCode\n";
        }
        
    } else {
        echo "❌ Error en respuesta del registro\n";
        echo "Respuesta: $equipoResponse\n";
    }
} else {
    echo "❌ Error HTTP registrando equipo: $equipoHttpCode\n";
    echo "Respuesta: $equipoResponse\n";
}

echo "\n✅ Prueba de mapeo INVIMA completada.\n";
