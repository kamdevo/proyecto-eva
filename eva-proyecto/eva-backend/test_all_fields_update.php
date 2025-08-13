<?php

/**
 * Test completo de actualización de TODOS los campos del equipo
 */

echo "🧪 PRUEBA COMPLETA DE ACTUALIZACIÓN DE TODOS LOS CAMPOS\n";
echo "======================================================\n\n";

try {
    // Datos completos para probar TODOS los campos
    $url = 'http://localhost:8000/api/v1/equipos/69/update-no-auth';
    
    $allFieldsData = [
        // Campos básicos de texto
        'name' => 'EQUIPO COMPLETAMENTE ACTUALIZADO - TODOS LOS CAMPOS',
        'code' => 'CODE-UPDATED-2025',
        'serial' => 'SERIAL-UPDATED-2025',
        'marca' => 'Marca Actualizada 2025',
        'modelo' => 'Modelo Actualizado v3.0',
        'descripcion' => 'Descripción completamente actualizada con todos los campos modificados',
        
        // IDs de relaciones (todos como string)
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
        
        // Campos numéricos
        'costo' => '150000.50',
        'vida_util' => '10',
        
        // Campos de texto adicionales
        'localizacion_actual' => 'Sala de Cirugía 3 - Piso 2',
        'verificacion_inventario' => 'Verificado el 05/08/2025',
        'repuesto_pendiente' => 'Filtro HEPA y sensor de presión',
        'propiedad' => 'Hospital Principal',
        'periodicidad' => 'Trimestral',
        'evaluacion_desempenio' => 'Excelente - 95% eficiencia',
        
        // Campos booleanos
        'calibracion' => '1',
        'movilidad' => '0',
        
        // JSON para checkboxes - TODOS los estados diferentes
        'manuales' => '{"operacion":true,"mantenimiento":false,"partes":true,"otros":false}',
        'planos' => '{"electrico":false,"electronico":true,"neumatico":false,"mecanico":true}'
    ];
    
    echo "📋 DATOS COMPLETOS A ENVIAR:\n";
    echo "============================\n";
    foreach ($allFieldsData as $key => $value) {
        echo "   {$key}: {$value}\n";
    }
    echo "\n";
    
    // Enviar petición PUT
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($allFieldsData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    echo "🚀 Enviando actualización completa...\n\n";
    
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
        echo "✅ SUCCESS! Actualización completa exitosa\n\n";
        
        // Verificar en base de datos
        echo "Verificando cambios en la base de datos...\n";
        
        $equipo = DB::table('equipos')->where('id', 69)->first();
        
        echo "📋 VERIFICACIÓN EN BASE DE DATOS:\n";
        echo "=================================\n";
        
        // Verificar campos básicos
        $basicFields = [
            'name', 'code', 'serial', 'marca', 'modelo', 'descripcion',
            'costo', 'vida_util', 'localizacion_actual', 'verificacion_inventario',
            'repuesto_pendiente', 'propiedad', 'periodicidad', 'evaluacion_desempenio'
        ];
        
        $allFieldsCorrect = true;
        
        echo "✅ CAMPOS BÁSICOS:\n";
        foreach ($basicFields as $field) {
            $expected = $allFieldsData[$field] ?? 'N/A';
            $actual = $equipo->$field ?? 'NULL';
            
            if ($expected === $actual) {
                echo "   ✅ {$field}: '{$actual}'\n";
            } else {
                echo "   ❌ {$field}: Esperado '{$expected}', Actual '{$actual}'\n";
                $allFieldsCorrect = false;
            }
        }
        
        echo "\n✅ CAMPOS DE RELACIÓN (IDs):\n";
        $relationFields = [
            'servicio_id', 'area_id', 'propietario_id', 'estadoequipo_id',
            'fuente_id', 'tecnologia_id', 'frecuencia_id', 'cbiomedica_id',
            'criesgo_id', 'tadquisicion_id', 'tipo_id'
        ];
        
        foreach ($relationFields as $field) {
            $expected = intval($allFieldsData[$field]);
            $actual = $equipo->$field ?? 0;
            
            if ($expected === $actual) {
                echo "   ✅ {$field}: {$actual}\n";
            } else {
                echo "   ❌ {$field}: Esperado {$expected}, Actual {$actual}\n";
                $allFieldsCorrect = false;
            }
        }
        
        echo "\n✅ CAMPOS BOOLEANOS:\n";
        $booleanFields = ['calibracion', 'movilidad'];
        foreach ($booleanFields as $field) {
            $expected = intval($allFieldsData[$field]);
            $actual = $equipo->$field ?? 0;
            
            if ($expected === $actual) {
                echo "   ✅ {$field}: {$actual}\n";
            } else {
                echo "   ❌ {$field}: Esperado {$expected}, Actual {$actual}\n";
                $allFieldsCorrect = false;
            }
        }
        
        echo "\n✅ CAMPOS JSON (CHECKBOXES):\n";
        
        // Verificar manuales
        $expectedManuales = json_decode($allFieldsData['manuales'], true);
        $actualManuales = json_decode($equipo->manual, true);
        
        if ($expectedManuales === $actualManuales) {
            echo "   ✅ manuales: " . $equipo->manual . "\n";
            foreach ($actualManuales as $key => $value) {
                $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
                echo "      {$key}: {$status}\n";
            }
        } else {
            echo "   ❌ manuales: JSON no coincide\n";
            echo "      Esperado: " . $allFieldsData['manuales'] . "\n";
            echo "      Actual: " . $equipo->manual . "\n";
            $allFieldsCorrect = false;
        }
        
        // Verificar planos
        $expectedPlanos = json_decode($allFieldsData['planos'], true);
        $actualPlanos = json_decode($equipo->plano, true);
        
        if ($expectedPlanos === $actualPlanos) {
            echo "   ✅ planos: " . $equipo->plano . "\n";
            foreach ($actualPlanos as $key => $value) {
                $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
                echo "      {$key}: {$status}\n";
            }
        } else {
            echo "   ❌ planos: JSON no coincide\n";
            echo "      Esperado: " . $allFieldsData['planos'] . "\n";
            echo "      Actual: " . $equipo->plano . "\n";
            $allFieldsCorrect = false;
        }
        
        echo "\n🎯 RESULTADO FINAL:\n";
        echo "===================\n";
        
        if ($allFieldsCorrect) {
            echo "🎉 ✅ ¡PERFECTO! TODOS LOS CAMPOS SE ACTUALIZARON CORRECTAMENTE\n";
            echo "✅ Campos básicos: OK\n";
            echo "✅ IDs de relación: OK\n";
            echo "✅ Campos booleanos: OK\n";
            echo "✅ JSON checkboxes: OK\n\n";
            
            echo "🚀 EL MODAL DE EDICIÓN ESTÁ 100% FUNCIONAL\n";
            echo "Todos los campos del formulario se pueden editar exitosamente.\n";
        } else {
            echo "⚠️ Algunos campos no se actualizaron correctamente.\n";
            echo "Revisa los errores marcados arriba.\n";
        }
        
    } else {
        echo "❌ ERROR: HTTP {$httpCode}\n";
        echo "Response: {$response}\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Prueba completa de todos los campos terminada.\n";
