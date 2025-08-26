<?php

echo "=== ANÁLISIS DE ARCHIVOS INVIMA - UBICACIÓN Y CONSISTENCIA ===\n\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "1. REGISTROS INVIMA EN BASE DE DATOS:\n";
    $stmt = $pdo->query("SELECT id, invima, titulo, file FROM invimas WHERE file IS NOT NULL AND file != '' LIMIT 10");
    $registrosDb = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Registros con archivos en BD:\n";
    foreach ($registrosDb as $registro) {
        echo "- ID: {$registro['id']}, INVIMA: {$registro['invima']}, Archivo: {$registro['file']}\n";
    }
    
    echo "\n2. ARCHIVOS EN CARPETA /invimas/:\n";
    $carpetaInvimas = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\invimas';
    $archivosInvimas = array_diff(scandir($carpetaInvimas), ['.', '..']);
    echo "Total archivos físicos: " . count($archivosInvimas) . "\n";
    foreach (array_slice($archivosInvimas, 0, 10) as $archivo) {
        echo "- $archivo\n";
    }
    
    echo "\n3. ARCHIVOS EN CARPETA /equipos/registros_sanitarios/:\n";
    $carpetaRegistros = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\equipos\registros_sanitarios';
    if (is_dir($carpetaRegistros)) {
        $archivosRegistros = array_diff(scandir($carpetaRegistros), ['.', '..']);
        echo "Total archivos físicos: " . count($archivosRegistros) . "\n";
        foreach (array_slice($archivosRegistros, 0, 10) as $archivo) {
            echo "- $archivo\n";
        }
    } else {
        echo "❌ Carpeta no existe: $carpetaRegistros\n";
    }
    
    echo "\n4. ANÁLISIS DE CONSISTENCIA:\n";
    
    // Verificar si los archivos en BD existen físicamente
    $archivosNoEncontrados = [];
    $archivosEncontrados = [];
    
    foreach ($registrosDb as $registro) {
        $archivoDb = $registro['file'];
        
        // Verificar en /invimas/
        $rutaInvimas = $carpetaInvimas . '/' . basename($archivoDb);
        
        // Verificar en /equipos/registros_sanitarios/
        $rutaRegistros = $carpetaRegistros . '/' . basename($archivoDb);
        
        // También verificar la ruta completa si incluye subcarpetas
        $rutaCompleta = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\\' . str_replace('/', '\\', $archivoDb);
        
        if (file_exists($rutaInvimas)) {
            $archivosEncontrados[] = "✅ {$registro['invima']} → /invimas/" . basename($archivoDb);
        } elseif (file_exists($rutaRegistros)) {
            $archivosEncontrados[] = "📁 {$registro['invima']} → /equipos/registros_sanitarios/" . basename($archivoDb);
        } elseif (file_exists($rutaCompleta)) {
            $archivosEncontrados[] = "🔗 {$registro['invima']} → ruta completa: $archivoDb";
        } else {
            $archivosNoEncontrados[] = "❌ {$registro['invima']} → NO ENCONTRADO: $archivoDb";
        }
    }
    
    echo "ARCHIVOS ENCONTRADOS:\n";
    foreach ($archivosEncontrados as $archivo) {
        echo "$archivo\n";
    }
    
    if (!empty($archivosNoEncontrados)) {
        echo "\nARCHIVOS NO ENCONTRADOS:\n";
        foreach ($archivosNoEncontrados as $archivo) {
            echo "$archivo\n";
        }
    }
    
    echo "\n5. PROBLEMA IDENTIFICADO:\n";
    echo "📝 CÓDIGO ACTUAL: Guarda en 'equipos/registros_sanitarios'\n";
    echo "📁 ENDPOINTS: Buscan en 'invimas/'\n";
    echo "💾 ARCHIVOS FÍSICOS: Principalmente en 'invimas/'\n";
    echo "\n⚠️  INCONSISTENCIA: El código y las rutas no están alineados\n";
    
} catch (PDOException $e) {
    echo "Error de base de datos: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DEL ANÁLISIS ===\n";
