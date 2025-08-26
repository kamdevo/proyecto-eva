<?php

echo "=== PRUEBA DE DESCARGA DE ARCHIVOS DE MANTENIMIENTO ===\n\n";

// Obtener algunos archivos de ejemplo de la base de datos
try {
    $pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "1. ARCHIVOS EN BASE DE DATOS:\n";
    $stmt = $pdo->query("SELECT id, equipo_id, file FROM mantenimiento WHERE file IS NOT NULL AND file != '' LIMIT 5");
    $archivos_bd = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($archivos_bd as $archivo) {
        echo "- ID: {$archivo['id']}, Equipo: {$archivo['equipo_id']}, Archivo: {$archivo['file']}\n";
    }
    
    echo "\n2. ARCHIVOS EN STORAGE:\n";
    $carpetaMantenimientos = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\mantenimientos';
    $archivos_storage = array_diff(scandir($carpetaMantenimientos), ['.', '..']);
    $archivos_storage = array_slice($archivos_storage, 0, 5); // Solo los primeros 5
    
    foreach ($archivos_storage as $archivo) {
        echo "- $archivo\n";
    }
    
    // Probar los endpoints con un archivo real
    if (!empty($archivos_storage)) {
        $archivoTest = array_values($archivos_storage)[0];
        echo "\n3. PROBANDO ENDPOINTS CON ARCHIVO: $archivoTest\n";
        
        $endpoints = [
            "http://127.0.0.1:8001/api/v1/download/mantenimientos/$archivoTest",
            "http://127.0.0.1:8001/api/v1/download/preventivos/$archivoTest", 
            "http://127.0.0.1:8001/api/v1/storage/mantenimientos/$archivoTest"
        ];
        
        foreach ($endpoints as $url) {
            echo "\nProbando: $url\n";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_NOBODY, true); // Solo headers
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                echo "  ❌ Error cURL: $error\n";
            } else {
                if ($httpCode == 200) {
                    echo "  ✅ HTTP $httpCode - Archivo accesible\n";
                } else {
                    echo "  ❌ HTTP $httpCode - Error\n";
                    // Obtener el body para ver el error
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                    $body = curl_exec($ch);
                    curl_close($ch);
                    echo "  Respuesta: " . substr($body, 0, 200) . "\n";
                }
            }
        }
    }
    
} catch (PDOException $e) {
    echo "Error de base de datos: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DE LA PRUEBA ===\n";
