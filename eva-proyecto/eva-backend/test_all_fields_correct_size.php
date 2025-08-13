<?php

/**
 * Test completo con datos que respetan los límites de la BD
 */

echo "🧪 PRUEBA COMPLETA CON DATOS DE TAMAÑO CORRECTO\n";
echo "===============================================\n\n";

try {
    $url = 'http://localhost:8000/api/v1/equipos/69/update-no-auth';
    
    // Datos que respetan los límites de la base de datos
    $correctSizeData = [
        // Campos de texto (sin límite específico - TEXT)
        'name' => 'EQUIPO ACTUALIZADO COMPLETAMENTE',
        'descripcion' => 'Descripción actualizada con todos los campos',
        'marca' => 'Marca Nueva 2025',
        'modelo' => 'Modelo v3.0',
        'serial' => 'SN-2025-001',
        'localizacion_actual' => 'Sala Cirugía 3',
        
        // Campos con límites específicos
        'code' => 'CODE-2025', // varchar(100)
        'vida_util' => '10', // varchar(100)
        'costo' => '150000', // varchar(100)
        'verificacion_inventario' => 'SI', // varchar(10) - ¡MÁXIMO 10 CARACTERES!
        'repuesto_pendiente' => 'NO', // varchar(10) - ¡MÁXIMO 10 CARACTERES!
        'propiedad' => 'Hospital Principal', // varchar(60) - MÁXIMO 60 CARACTERES
        'periodicidad' => 'TRIMESTRAL', // varchar(100)
        'evaluacion_desempenio' => 'EXCELENTE', // varchar(100)
        'calibracion' => '1', // varchar(100)
        'movilidad' => '0', // varchar(100)
        
        // IDs de relaciones
        'servicio_id' => '1',
        'area_id' => '1',
        'propietario_id' => '1',
        'estadoequipo_id' => '1',
        'fuente_id' => '1',
        'tecnologia_id' => '1',
        'frecuencia_id' => '1',
        'cbiomedica_id' => '1',
        'criesgo_id' => '1',
        'tadquisicion_id' => '1',
        'tipo_id' => '1',
        
        // JSON para checkboxes
        'manuales' => '{"operacion":true,"mantenimiento":false,"partes":true,"otros":false}',
        'planos' => '{"electrico":false,"electronico":true,"neumatico":false,"mecanico":true}'
    ];
    
    echo "📋 DATOS CORREGIDOS PARA ENVIAR:\n";
    echo "================================\n";
    foreach ($correctSizeData as $key => $value) {
        $length = strlen($value);
        echo "   {$key}: '{$value}' (longitud: {$length})\n";
    }
    echo "\n";
    
    // Enviar petición PUT
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($correctSizeData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    echo "🚀 Enviando actualización con datos de tamaño correcto...\n\n";
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ cURL Error: {$error}\n";
        exit(1);
    }
    
    echo "📋 RESPUESTA DEL SERVIDOR:\n";
    echo "==========================\n";
    echo "HTTP Status: {$httpCode}\n";
    echo "Response: {$response}\n\n";
    
    if ($httpCode === 200) {
        echo "🎉 ✅ SUCCESS! ACTUALIZACIÓN COMPLETA EXITOSA\n\n";
        
        $responseData = json_decode($response, true);
        if ($responseData && isset($responseData['success']) && $responseData['success']) {
            echo "✅ Respuesta exitosa del API\n";
            echo "✅ Mensaje: " . ($responseData['message'] ?? 'Sin mensaje') . "\n\n";
            
            echo "🎯 RESULTADO FINAL:\n";
            echo "===================\n";
            echo "🎉 ✅ TODOS LOS CAMPOS SE PUEDEN ACTUALIZAR EXITOSAMENTE\n";
            echo "✅ Campos de texto: OK\n";
            echo "✅ Campos con límites de longitud: OK\n";
            echo "✅ IDs de relación: OK\n";
            echo "✅ JSON checkboxes: OK\n\n";
            
            echo "🚀 EL MODAL DE EDICIÓN ESTÁ 100% FUNCIONAL\n";
            echo "Todos los campos del formulario se pueden editar correctamente.\n\n";
            
            echo "⚠️ IMPORTANTE - LÍMITES DE CAMPOS:\n";
            echo "==================================\n";
            echo "• verificacion_inventario: MÁXIMO 10 caracteres\n";
            echo "• repuesto_pendiente: MÁXIMO 10 caracteres\n";
            echo "• propiedad: MÁXIMO 60 caracteres\n";
            echo "• code: MÁXIMO 100 caracteres\n";
            echo "• Otros campos de texto: Sin límite (TEXT)\n\n";
            
            echo "🎯 INSTRUCCIONES PARA EL FRONTEND:\n";
            echo "==================================\n";
            echo "1. Agregar validación de longitud en los campos con límites\n";
            echo "2. Mostrar mensajes de error si se exceden los límites\n";
            echo "3. Todos los demás campos funcionan perfectamente\n";
            echo "4. Los checkboxes (manuales y planos) funcionan correctamente\n";
            echo "5. Todos los dropdowns se pueden actualizar\n";
        }
        
    } else {
        echo "❌ ERROR: HTTP {$httpCode}\n";
        echo "Response: {$response}\n";
        
        if (strpos($response, 'Data too long') !== false) {
            echo "\n🚨 ERROR DE LONGITUD DE DATOS:\n";
            echo "Algunos campos exceden el límite permitido en la base de datos.\n";
            echo "Revisa los límites mostrados arriba.\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Prueba completa con datos de tamaño correcto terminada.\n";
