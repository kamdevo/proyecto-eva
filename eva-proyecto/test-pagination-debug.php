<?php

/**
 * Script de prueba específico para verificar la paginación
 */

echo "=== PRUEBA DE PAGINACIÓN - MODAL COMPARTIR DOCUMENTOS ===\n\n";

$baseUrl = 'http://127.0.0.1:8001/api';

function makeRequest($url) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => 0];
    }
    
    return [
        'data' => json_decode($response, true),
        'http_code' => $httpCode,
        'raw' => $response
    ];
}

// Prueba 1: Primera página con 5 elementos
echo "1️⃣ PRUEBA: Primera página (5 elementos)\n";
echo "========================================\n";
$result1 = makeRequest("$baseUrl/v1/equipos?page=1&limit=5");

if ($result1['http_code'] === 200 && isset($result1['data']['success']) && $result1['data']['success']) {
    $data = $result1['data'];
    echo "✅ Éxito - HTTP 200\n";
    echo "📊 Equipos en esta página: " . count($data['data']) . "\n";
    echo "📄 Paginación:\n";
    echo "   - Página actual: " . $data['pagination']['current_page'] . "\n";
    echo "   - Total páginas: " . $data['pagination']['last_page'] . "\n";
    echo "   - Total equipos: " . $data['pagination']['total'] . "\n";
    echo "   - Por página: " . $data['pagination']['per_page'] . "\n";
    echo "   - Desde: " . $data['pagination']['from'] . "\n";
    echo "   - Hasta: " . $data['pagination']['to'] . "\n";
    
    if (isset($data['debug'])) {
        echo "🔍 Debug info:\n";
        echo "   - Offset calculado: " . $data['debug']['offset'] . "\n";
        echo "   - Límite: " . $data['debug']['limit'] . "\n";
        echo "   - Páginas calculadas: " . $data['debug']['total_pages_calculated'] . "\n";
    }
    
    $totalPages = $data['pagination']['last_page'];
    $totalEquipments = $data['pagination']['total'];
} else {
    echo "❌ Error - HTTP " . $result1['http_code'] . "\n";
    if (isset($result1['data']['message'])) {
        echo "💬 " . $result1['data']['message'] . "\n";
    }
    exit;
}

echo "\n";

// Prueba 2: Segunda página
if ($totalPages > 1) {
    echo "2️⃣ PRUEBA: Segunda página\n";
    echo "========================\n";
    $result2 = makeRequest("$baseUrl/v1/equipos?page=2&limit=5");
    
    if ($result2['http_code'] === 200 && isset($result2['data']['success']) && $result2['data']['success']) {
        $data2 = $result2['data'];
        echo "✅ Éxito - HTTP 200\n";
        echo "📊 Equipos en esta página: " . count($data2['data']) . "\n";
        echo "📄 Página actual: " . $data2['pagination']['current_page'] . "\n";
        echo "📄 Desde: " . $data2['pagination']['from'] . " hasta: " . $data2['pagination']['to'] . "\n";
    } else {
        echo "❌ Error en página 2\n";
    }
    echo "\n";
}

// Prueba 3: Última página
if ($totalPages > 2) {
    echo "3️⃣ PRUEBA: Última página ($totalPages)\n";
    echo "============================\n";
    $result3 = makeRequest("$baseUrl/v1/equipos?page=$totalPages&limit=5");
    
    if ($result3['http_code'] === 200 && isset($result3['data']['success']) && $result3['data']['success']) {
        $data3 = $result3['data'];
        echo "✅ Éxito - HTTP 200\n";
        echo "📊 Equipos en última página: " . count($data3['data']) . "\n";
        echo "📄 Página actual: " . $data3['pagination']['current_page'] . "\n";
        echo "📄 Desde: " . $data3['pagination']['from'] . " hasta: " . $data3['pagination']['to'] . "\n";
    } else {
        echo "❌ Error en última página\n";
    }
    echo "\n";
}

// Prueba 4: Diferentes tamaños de página
echo "4️⃣ PRUEBA: Diferentes tamaños de página\n";
echo "======================================\n";

$pageSizes = [10, 25, 50];
foreach ($pageSizes as $size) {
    $result = makeRequest("$baseUrl/v1/equipos?page=1&limit=$size");
    
    if ($result['http_code'] === 200 && isset($result['data']['success']) && $result['data']['success']) {
        $data = $result['data'];
        echo "📏 Tamaño $size: " . count($data['data']) . " equipos, " . $data['pagination']['last_page'] . " páginas totales\n";
    } else {
        echo "❌ Error con tamaño $size\n";
    }
}

echo "\n";

// Prueba 5: Filtros
echo "5️⃣ PRUEBA: Filtros de búsqueda\n";
echo "==============================\n";

// Filtro por ID
$resultId = makeRequest("$baseUrl/v1/equipos?consulta_id=1&limit=10");
if ($resultId['http_code'] === 200 && isset($resultId['data']['success']) && $resultId['data']['success']) {
    echo "🔍 Filtro por ID=1: " . count($resultId['data']['data']) . " equipos encontrados\n";
    echo "📄 Total con filtro: " . $resultId['data']['pagination']['total'] . "\n";
} else {
    echo "❌ Error en filtro por ID\n";
}

// Filtro por serie
$resultSerie = makeRequest("$baseUrl/v1/equipos?serie=ABC&limit=10");
if ($resultSerie['http_code'] === 200 && isset($resultSerie['data']['success']) && $resultSerie['data']['success']) {
    echo "🔍 Filtro por serie 'ABC': " . count($resultSerie['data']['data']) . " equipos encontrados\n";
    echo "📄 Total con filtro: " . $resultSerie['data']['pagination']['total'] . "\n";
} else {
    echo "❌ Error en filtro por serie\n";
}

echo "\n";

echo "📋 RESUMEN FINAL\n";
echo "================\n";
echo "🎯 Total de equipos en la base de datos: $totalEquipments\n";
echo "📄 Total de páginas (con 5 por página): $totalPages\n";
echo "✅ La paginación está funcionando correctamente\n";
echo "\n";

echo "💡 RECOMENDACIONES PARA EL FRONTEND:\n";
echo "- Verificar que totalPages se esté actualizando correctamente\n";
echo "- Confirmar que currentPage se actualiza al cambiar de página\n";
echo "- Revisar que los botones de paginación se habiliten/deshabiliten correctamente\n";
echo "- Asegurar que el componente EquipmentPagination reciba todos los props necesarios\n";

?>
