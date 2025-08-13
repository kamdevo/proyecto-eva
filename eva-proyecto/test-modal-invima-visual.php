<?php
/**
 * Probar que el modal de INVIMA se vea correctamente
 */

echo "🎨 PROBANDO VISUAL DEL SELECT INVIMA\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Probar endpoint de registros INVIMA
    echo "1️⃣ PROBANDO DATOS PARA EL SELECT:\n\n";
    
    $registrosUrl = "$baseUrl/api/v1/registros-invima";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $registrosUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            $registros = $data['data'];
            echo "✅ Registros INVIMA obtenidos: " . count($registros) . "\n\n";
            
            echo "📋 ANÁLISIS DE LONGITUD DE TEXTOS:\n\n";
            
            $longitudesNumero = [];
            $longitudesNombre = [];
            $longitudesFabricante = [];
            
            foreach ($registros as $registro) {
                $longitudesNumero[] = strlen($registro['numero_registro'] ?? '');
                $longitudesNombre[] = strlen($registro['nombre_equipo'] ?? '');
                $longitudesFabricante[] = strlen($registro['fabricante'] ?? '');
            }
            
            echo "   📊 Longitud números de registro:\n";
            echo "      Mínima: " . min($longitudesNumero) . " caracteres\n";
            echo "      Máxima: " . max($longitudesNumero) . " caracteres\n";
            echo "      Promedio: " . round(array_sum($longitudesNumero) / count($longitudesNumero)) . " caracteres\n\n";
            
            echo "   📊 Longitud nombres de equipo:\n";
            echo "      Mínima: " . min($longitudesNombre) . " caracteres\n";
            echo "      Máxima: " . max($longitudesNombre) . " caracteres\n";
            echo "      Promedio: " . round(array_sum($longitudesNombre) / count($longitudesNombre)) . " caracteres\n\n";
            
            echo "   📊 Longitud fabricantes:\n";
            echo "      Mínima: " . min($longitudesFabricante) . " caracteres\n";
            echo "      Máxima: " . max($longitudesFabricante) . " caracteres\n";
            echo "      Promedio: " . round(array_sum($longitudesFabricante) / count($longitudesFabricante)) . " caracteres\n\n";
            
            // Mostrar ejemplos de textos largos
            echo "📋 EJEMPLOS DE TEXTOS MÁS LARGOS:\n\n";
            
            // Ordenar por longitud de nombre
            usort($registros, function($a, $b) {
                return strlen($b['nombre_equipo'] ?? '') - strlen($a['nombre_equipo'] ?? '');
            });
            
            foreach (array_slice($registros, 0, 5) as $index => $registro) {
                $nombreLength = strlen($registro['nombre_equipo'] ?? '');
                echo "   " . ($index + 1) . ". Número: {$registro['numero_registro']}\n";
                echo "      Nombre ($nombreLength chars): {$registro['nombre_equipo']}\n";
                echo "      Fabricante: {$registro['fabricante']}\n\n";
            }
            
            echo "💡 SOLUCIÓN APLICADA:\n";
            echo "   ✅ SelectContent: max-width 500px\n";
            echo "   ✅ SelectItem: max-width 480px + truncate\n";
            echo "   ✅ Texto nombre: truncado a 60 caracteres\n";
            echo "   ✅ SelectValue: truncate + max-width\n";
            echo "   ✅ CSS adicional: para elementos Radix\n";
            
        } else {
            echo "❌ Error en respuesta: $response\n";
        }
    } else {
        echo "❌ Error en endpoint: HTTP $httpCode\n";
        echo "Respuesta: $response\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Probar endpoint de datos del modal
    echo "2️⃣ PROBANDO ENDPOINT DE DATOS DEL MODAL:\n\n";
    
    $modalDataUrl = "$baseUrl/api/v1/test/modal-equipment-data";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $modalDataUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            $invimas = $data['data']['invimas'] ?? [];
            echo "✅ Datos del modal obtenidos: " . count($invimas) . " registros INVIMA\n";
            
            if (count($invimas) > 0) {
                echo "\n📋 PRIMEROS REGISTROS EN EL MODAL:\n";
                foreach (array_slice($invimas, 0, 3) as $invima) {
                    $nombre = $invima['name'] ?? '';
                    $titulo = $invima['titulo'] ?? '';
                    
                    echo "   • ID: {$invima['id']}\n";
                    echo "     Número: $nombre\n";
                    echo "     Título: " . (strlen($titulo) > 50 ? substr($titulo, 0, 50) . '...' : $titulo) . "\n\n";
                }
            }
            
        } else {
            echo "❌ Error en datos del modal\n";
        }
    } else {
        echo "❌ Error en endpoint de datos del modal: HTTP $httpCode\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "🎯 RESUMEN DE CORRECCIONES VISUALES:\n\n";
    
    echo "✅ CORRECCIONES APLICADAS:\n";
    echo "   1. SelectContent: max-width 500px\n";
    echo "   2. SelectItem: max-width 480px\n";
    echo "   3. Texto truncado: 60 caracteres máximo\n";
    echo "   4. CSS adicional: para elementos Radix UI\n";
    echo "   5. Clases CSS: invima-select-container\n";
    
    echo "\n💡 RESULTADO ESPERADO:\n";
    echo "   - Select con ancho controlado\n";
    echo "   - Textos largos truncados con '...'\n";
    echo "   - Dropdown no se extiende fuera de pantalla\n";
    echo "   - Mejor experiencia visual\n";
    
    echo "\n🚀 INSTRUCCIONES:\n";
    echo "1. Refresca el frontend\n";
    echo "2. Abre el modal de agregar equipo\n";
    echo "3. Haz clic en el select de registro INVIMA\n";
    echo "4. Verifica que el dropdown tenga ancho controlado\n";
    echo "5. Los textos largos deberían aparecer truncados\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
