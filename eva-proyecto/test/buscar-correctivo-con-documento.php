<?php

/**
 * Script para buscar correctivos que tengan documentos asociados
 */

// Configuración de la base de datos
$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conexión exitosa a la base de datos\n";
    echo "🔍 Buscando correctivos con documentos...\n\n";
    
    // Buscar correctivos que tengan archivos
    $query = "
        SELECT 
            cg.id,
            cg.code_orden,
            cg.description,
            cg.file,
            cg.file_orden,
            cg.fecha_inicio,
            e.name as equipo_name,
            e.code as equipo_code
        FROM correctivos_generales cg
        LEFT JOIN equipos e ON cg.equipo_id = e.id
        WHERE cg.file IS NOT NULL 
        AND cg.file != ''
        ORDER BY cg.id DESC
        LIMIT 10
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $correctivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($correctivos)) {
        echo "❌ No se encontraron correctivos con documentos.\n";
        echo "🔧 Creando un correctivo de prueba...\n";
        
        // Crear un correctivo de prueba con un archivo existente
        $archivos_disponibles = [
            '219f8bb70f87d8eed02063dc70978f4a.pdf',
            'a729e958ed40fd3bfa8dd68e73d186fe.pdf',
            'afaf9150668ab27ef0654d4496ae00bd.pdf',
            'e2a1afd892f15519c5826c87db52caef.pdf'
        ];
        
        $archivo_prueba = $archivos_disponibles[0];
        
        $insert_query = "
            INSERT INTO correctivos_generales 
            (code_orden, description, file, fecha_inicio, status, created_at, updated_at)
            VALUES 
            ('PRUEBA-DOC-001', 'Correctivo de prueba con documento para testing', ?, NOW(), 1, NOW(), NOW())
        ";
        
        $insert_stmt = $pdo->prepare($insert_query);
        $insert_stmt->execute([$archivo_prueba]);
        
        $nuevo_id = $pdo->lastInsertId();
        echo "✅ Correctivo de prueba creado con ID: $nuevo_id\n";
        echo "📄 Archivo asociado: $archivo_prueba\n";
        
        // Buscar el correctivo recién creado
        $stmt->execute();
        $correctivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo "📋 Correctivos encontrados con documentos:\n";
    echo str_repeat("=", 80) . "\n";
    
    foreach ($correctivos as $correctivo) {
        echo "🔧 ID: {$correctivo['id']}\n";
        echo "📝 Código: {$correctivo['code_orden']}\n";
        echo "📄 Descripción: {$correctivo['description']}\n";
        echo "📁 Archivo: {$correctivo['file']}\n";
        echo "📅 Fecha: {$correctivo['fecha_inicio']}\n";
        echo "🔧 Equipo: {$correctivo['equipo_name']} ({$correctivo['equipo_code']})\n";
        echo str_repeat("-", 40) . "\n";
    }
    
    // Verificar que los archivos existen en el directorio
    echo "\n🔍 Verificando archivos en el directorio...\n";
    $storage_path = __DIR__ . '/eva-proyecto/eva-backend/storage/app/public/correctivos/';
    
    foreach ($correctivos as $correctivo) {
        if ($correctivo['file']) {
            $file_path = $storage_path . $correctivo['file'];
            if (file_exists($file_path)) {
                echo "✅ {$correctivo['file']} - EXISTE\n";
            } else {
                echo "❌ {$correctivo['file']} - NO ENCONTRADO\n";
            }
        }
    }
    
    if (!empty($correctivos)) {
        $primer_correctivo = $correctivos[0];
        echo "\n🎯 PARA PROBAR:\n";
        echo "1. Abre el modal de correctivos en el frontend\n";
        echo "2. Busca el correctivo con código: {$primer_correctivo['code_orden']}\n";
        echo "3. Verifica que aparezca el botón '📄 Ver' en la columna Documentos\n";
        echo "4. Haz clic en '📄 Ver' para abrir el documento: {$primer_correctivo['file']}\n";
        echo "5. El documento debería abrirse en una nueva pestaña e imprimir automáticamente\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

?>
