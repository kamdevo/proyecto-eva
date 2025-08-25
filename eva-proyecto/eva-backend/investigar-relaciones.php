<?php

// Conexión directa a la base de datos
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 INVESTIGANDO RELACIONES ENTRE DOCUMENTOS Y EQUIPOS...\n";
    echo "=" . str_repeat("=", 70) . "\n\n";
    
    // 1. Verificar estructura de tabla equipo_archivo
    echo "1. ESTRUCTURA DE TABLA equipo_archivo:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    $sql = "DESCRIBE equipo_archivo";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $estructura = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($estructura as $campo) {
        echo "   {$campo['Field']} | {$campo['Type']} | {$campo['Null']} | {$campo['Key']}\n";
    }
    echo "\n";
    
    // 2. Contar registros en equipo_archivo
    echo "2. CONTEO DE REGISTROS:\n";
    echo "-" . str_repeat("-", 30) . "\n";
    $sql = "SELECT COUNT(*) as total FROM equipo_archivo";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $total = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   Total registros en equipo_archivo: {$total['total']}\n";
    
    $sql = "SELECT COUNT(DISTINCT equipo_id) as equipos_unicos FROM equipo_archivo";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $equipos = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   Equipos únicos con documentos: {$equipos['equipos_unicos']}\n";
    
    $sql = "SELECT COUNT(DISTINCT vinculo) as archivos_unicos FROM equipo_archivo WHERE vinculo IS NOT NULL";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $archivos = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   Archivos únicos registrados: {$archivos['archivos_unicos']}\n\n";
    
    // 3. Verificar archivos físicos vs registros
    echo "3. VERIFICACIÓN ARCHIVOS FÍSICOS VS REGISTROS:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    // Obtener archivos físicos
    $directorioArchivos = 'storage/app/public/equipos/archivos/';
    $archivosExistentes = [];
    
    if (is_dir($directorioArchivos)) {
        $archivos = scandir($directorioArchivos);
        foreach ($archivos as $archivo) {
            if ($archivo != '.' && $archivo != '..' && is_file($directorioArchivos . $archivo)) {
                $archivosExistentes[] = $archivo;
            }
        }
    }
    
    echo "   Archivos físicos encontrados: " . count($archivosExistentes) . "\n";
    
    // Verificar cuántos están registrados
    if (count($archivosExistentes) > 0) {
        $placeholders = str_repeat('?,', count($archivosExistentes) - 1) . '?';
        $sql = "SELECT COUNT(*) as registrados FROM equipo_archivo WHERE vinculo IN ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($archivosExistentes);
        $registrados = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "   Archivos físicos registrados en BD: {$registrados['registrados']}\n";
        echo "   Archivos físicos NO registrados: " . (count($archivosExistentes) - $registrados['registrados']) . "\n\n";
    }
    
    // 4. Mostrar algunos registros de ejemplo
    echo "4. REGISTROS DE EJEMPLO EN equipo_archivo:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    $sql = "
        SELECT 
            ea.id,
            ea.equipo_id,
            ea.archivo_id,
            ea.vinculo,
            ea.created_at,
            e.name as equipo_nombre,
            a.name as tipo_archivo
        FROM equipo_archivo ea
        LEFT JOIN equipos e ON ea.equipo_id = e.id
        LEFT JOIN archivos a ON ea.archivo_id = a.id
        ORDER BY ea.created_at DESC
        LIMIT 10
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $ejemplos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($ejemplos as $index => $registro) {
        echo ($index + 1) . ". ID: {$registro['id']}\n";
        echo "   Equipo ID: {$registro['equipo_id']} | " . ($registro['equipo_nombre'] ?: 'SIN NOMBRE') . "\n";
        echo "   Archivo ID: {$registro['archivo_id']} | " . ($registro['tipo_archivo'] ?: 'SIN TIPO') . "\n";
        echo "   Vinculo: {$registro['vinculo']}\n";
        echo "   Fecha: {$registro['created_at']}\n";
        
        // Verificar si el archivo existe
        if ($registro['vinculo']) {
            $rutaArchivo = $directorioArchivos . $registro['vinculo'];
            $existe = file_exists($rutaArchivo);
            echo "   Archivo físico: " . ($existe ? "✅ EXISTE" : "❌ NO EXISTE") . "\n";
        }
        echo "   " . str_repeat("-", 60) . "\n";
    }
    
    // 5. Buscar archivos físicos no registrados
    echo "\n5. ARCHIVOS FÍSICOS NO REGISTRADOS:\n";
    echo "-" . str_repeat("-", 40) . "\n";
    
    if (count($archivosExistentes) > 0) {
        foreach ($archivosExistentes as $archivo) {
            $sql = "SELECT COUNT(*) as existe FROM equipo_archivo WHERE vinculo = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$archivo]);
            $existe = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existe['existe'] == 0) {
                $rutaArchivo = $directorioArchivos . $archivo;
                $tamaño = round(filesize($rutaArchivo) / 1024, 2);
                echo "   📄 {$archivo} ({$tamaño} KB) - NO REGISTRADO\n";
            }
        }
    }
    
    // 6. Verificar si hay problemas en las relaciones
    echo "\n6. VERIFICACIÓN DE RELACIONES:\n";
    echo "-" . str_repeat("-", 40) . "\n";
    
    // Equipos que no existen pero tienen documentos
    $sql = "
        SELECT ea.equipo_id, COUNT(*) as documentos
        FROM equipo_archivo ea
        LEFT JOIN equipos e ON ea.equipo_id = e.id
        WHERE e.id IS NULL
        GROUP BY ea.equipo_id
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $equiposInexistentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($equiposInexistentes) > 0) {
        echo "   ⚠️ EQUIPOS INEXISTENTES CON DOCUMENTOS:\n";
        foreach ($equiposInexistentes as $equipo) {
            echo "      Equipo ID {$equipo['equipo_id']}: {$equipo['documentos']} documentos\n";
        }
    } else {
        echo "   ✅ Todos los equipos con documentos existen\n";
    }
    
    // Tipos de archivo que no existen
    $sql = "
        SELECT ea.archivo_id, COUNT(*) as documentos
        FROM equipo_archivo ea
        LEFT JOIN archivos a ON ea.archivo_id = a.id
        WHERE a.id IS NULL AND ea.archivo_id IS NOT NULL
        GROUP BY ea.archivo_id
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $tiposInexistentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($tiposInexistentes) > 0) {
        echo "   ⚠️ TIPOS DE ARCHIVO INEXISTENTES:\n";
        foreach ($tiposInexistentes as $tipo) {
            echo "      Archivo ID {$tipo['archivo_id']}: {$tipo['documentos']} documentos\n";
        }
    } else {
        echo "   ✅ Todos los tipos de archivo existen\n";
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR DE CONEXIÓN: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🔚 Fin de la investigación\n";
