<?php

echo "=== ANÁLISIS DE ARCHIVOS DE MANTENIMIENTO ===\n\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conexión a base de datos exitosa.\n\n";
    
    // 1. Estructura de tabla mantenimiento
    echo "=== ESTRUCTURA DE LA TABLA mantenimiento ===\n";
    $stmt = $pdo->query("DESCRIBE mantenimiento");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columnas encontradas:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Key']}\n";
    }
    
    // 2. Verificar registros con archivos
    echo "\n=== REGISTROS CON ARCHIVOS ===\n";
    $stmt = $pdo->query("SELECT id, equipo_id, fecha_programada, fecha_mantenimiento, observacion, file FROM mantenimiento WHERE file IS NOT NULL AND file != '' LIMIT 10");
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Mantenimientos con archivos (primeros 10):\n";
    foreach ($registros as $registro) {
        echo "ID: {$registro['id']} | Equipo: {$registro['equipo_id']} | Archivo: {$registro['file']}\n";
    }
    
    // 3. Verificar archivos físicos en carpeta
    echo "\n=== ARCHIVOS FÍSICOS EN CARPETA ===\n";
    $carpetaMantenimientos = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\mantenimientos';
    
    if (is_dir($carpetaMantenimientos)) {
        $archivos = scandir($carpetaMantenimientos);
        $archivos = array_filter($archivos, function($file) {
            return $file !== '.' && $file !== '..';
        });
        
        echo "Archivos encontrados en storage/app/public/mantenimientos:\n";
        echo "Total: " . count($archivos) . " archivos\n";
        
        foreach (array_slice($archivos, 0, 10) as $archivo) {
            echo "- $archivo\n";
        }
        
        if (count($archivos) > 10) {
            echo "... y " . (count($archivos) - 10) . " archivos más\n";
        }
    } else {
        echo "❌ La carpeta $carpetaMantenimientos no existe\n";
    }
    
    // 4. Verificar coincidencias
    echo "\n=== VERIFICACIÓN DE COINCIDENCIAS ===\n";
    $stmt = $pdo->query("SELECT file FROM mantenimiento WHERE file IS NOT NULL AND file != ''");
    $archivosDB = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Archivos en la base de datos: " . count($archivosDB) . "\n";
    echo "Archivos físicos: " . count($archivos) . "\n";
    
    $coincidencias = 0;
    foreach ($archivosDB as $archivoDB) {
        if (in_array($archivoDB, $archivos)) {
            $coincidencias++;
        }
    }
    
    echo "Coincidencias: $coincidencias\n";
    
    // 5. Mostrar algunos ejemplos de archivos que no coinciden
    echo "\n=== ARCHIVOS SIN COINCIDENCIA ===\n";
    $sinCoincidencia = array_diff($archivosDB, $archivos);
    if (count($sinCoincidencia) > 0) {
        echo "Archivos en DB pero no en filesystem (primeros 5):\n";
        foreach (array_slice($sinCoincidencia, 0, 5) as $archivo) {
            echo "- $archivo\n";
        }
    }
    
    $soloEnFS = array_diff($archivos, $archivosDB);
    if (count($soloEnFS) > 0) {
        echo "\nArchivos en filesystem pero no en DB (primeros 5):\n";
        foreach (array_slice($soloEnFS, 0, 5) as $archivo) {
            echo "- $archivo\n";
        }
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DEL ANÁLISIS ===\n";
