<?php
/**
 * Script para verificar la funcionalidad de eliminar equipos usando la ruta existente
 */

echo "=== VERIFICACIÓN DE RUTA DE ELIMINACIÓN EXISTENTE ===\n\n";

// Primero obtener algunos equipos para hacer la prueba
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => 'http://localhost:8000/api/v1/equipos/medical-devices-complete-fixed?per_page=3',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

echo "1. Listando algunos equipos...\n";
echo "HTTP Code: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['data']) && !empty($data['data'])) {
        $equipos = is_array($data['data']) ? $data['data'] : [$data['data']];
        echo "Equipos encontrados: " . count($equipos) . "\n\n";
        
        foreach (array_slice($equipos, 0, 3) as $equipo) {
            echo "- ID: {$equipo['id']} | Nombre: " . ($equipo['nombre'] ?? $equipo['name'] ?? 'N/A') . 
                 " | Placa: " . ($equipo['placa'] ?? $equipo['asset_code'] ?? 'N/A') . "\n";
        }
        
        // Tomar el último equipo para prueba
        $equipoTest = end($equipos);
        $equipoId = $equipoTest['id'];
        
        echo "\n2. Probando eliminación del equipo ID: $equipoId usando ruta existente\n";
        echo "URL: http://localhost:8000/api/v1/equipos/$equipoId\n";
        
        // Intentar eliminar usando la ruta existente
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => "http://localhost:8000/api/v1/equipos/$equipoId",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CUSTOMREQUEST => 'DELETE',
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Content-Type: application/json'
            ]
        ]);

        $deleteResponse = curl_exec($curl);
        $deleteHttpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        echo "HTTP Code de eliminación: $deleteHttpCode\n";
        echo "Respuesta: $deleteResponse\n\n";
        
        if ($deleteHttpCode === 200) {
            echo "✅ ÉXITO: Equipo eliminado correctamente\n";
        } elseif ($deleteHttpCode === 401) {
            echo "⚠️  REQUIERE AUTENTICACIÓN: La ruta necesita token de autenticación\n";
        } elseif ($deleteHttpCode === 404) {
            echo "❌ ERROR 404: Equipo no encontrado o ruta incorrecta\n";
        } elseif ($deleteHttpCode === 405) {
            echo "❌ ERROR 405: Método no permitido\n";
        } else {
            echo "❌ ERROR: Código HTTP $deleteHttpCode\n";
            $errorData = json_decode($deleteResponse, true);
            echo "Detalles: " . ($errorData['message'] ?? 'Error desconocido') . "\n";
        }
        
    } else {
        echo "No hay equipos disponibles para hacer la prueba\n";
        echo "Respuesta completa: $response\n";
    }
} else {
    echo "❌ ERROR: No se pudieron listar los equipos\n";
    echo "Respuesta: $response\n";
}

echo "\n=== VERIFICACIÓN DE CONTROLADOR ===\n";

// Verificar si existe el controlador EquipmentController
$controllerPath = 'eva-backend/app/Http/Controllers/Api/EquipmentController.php';
if (file_exists($controllerPath)) {
    echo "✅ EquipmentController existe en: $controllerPath\n";
    
    // Buscar método destroy
    $controllerContent = file_get_contents($controllerPath);
    if (strpos($controllerContent, 'public function destroy') !== false) {
        echo "✅ Método destroy() encontrado en EquipmentController\n";
    } else {
        echo "❌ Método destroy() NO encontrado en EquipmentController\n";
    }
} else {
    echo "❌ EquipmentController NO existe\n";
}

echo "\n=== FIN DE LA VERIFICACIÓN ===\n";
?>
