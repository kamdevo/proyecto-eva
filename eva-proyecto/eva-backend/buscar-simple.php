<?php

// Conexión directa a la base de datos sin Laravel
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 BUSCANDO EQUIPOS CON DOCUMENTOS...\n";
    echo "=" . str_repeat("=", 50) . "\n\n";
    
    // Obtener todos los archivos físicos que existen
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

    echo "📁 Archivos físicos encontrados: " . count($archivosExistentes) . "\n\n";

    if (count($archivosExistentes) > 0) {
        $placeholders = str_repeat('?,', count($archivosExistentes) - 1) . '?';

        $sql = "
            SELECT
                e.id as equipo_id,
                e.name as equipo_nombre,
                e.code as equipo_codigo,
                e.marca,
                e.modelo,
                ea.vinculo as archivo,
                a.name as tipo_documento,
                ea.created_at,
                ea.otro as descripcion
            FROM equipos e
            INNER JOIN equipo_archivo ea ON e.id = ea.equipo_id
            LEFT JOIN archivos a ON ea.archivo_id = a.id
            WHERE ea.vinculo IN ($placeholders)
            ORDER BY ea.created_at DESC
            LIMIT 15
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($archivosExistentes);
        $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $equipos = [];
    }
    
    if (count($equipos) > 0) {
        echo "✅ EQUIPOS CON DOCUMENTOS ENCONTRADOS:\n\n";
        
        foreach ($equipos as $index => $equipo) {
            echo ($index + 1) . ". 🎯 EQUIPO ID: {$equipo['equipo_id']}\n";
            echo "   📝 Nombre: " . ($equipo['equipo_nombre'] ?: 'Sin nombre') . "\n";
            echo "   🔢 Código: " . ($equipo['equipo_codigo'] ?: 'Sin código') . "\n";
            echo "   🏭 Marca: " . ($equipo['marca'] ?: 'Sin marca') . "\n";
            echo "   📄 Archivo: {$equipo['archivo']}\n";
            echo "   📋 Tipo: " . ($equipo['tipo_documento'] ?: 'Sin tipo') . "\n";
            echo "   📅 Fecha: {$equipo['created_at']}\n";
            echo "   🔗 URL: /storage/equipos/archivos/{$equipo['archivo']}\n";
            echo "   🌐 URL completa: http://localhost:8001/storage/equipos/archivos/{$equipo['archivo']}\n";
            
            // Verificar si el archivo existe físicamente
            $rutaArchivo = "storage/app/public/equipos/archivos/{$equipo['archivo']}";
            if (file_exists($rutaArchivo)) {
                $tamaño = round(filesize($rutaArchivo) / 1024, 2);
                echo "   ✅ Archivo físico: EXISTE ({$tamaño} KB)\n";
            } else {
                echo "   ❌ Archivo físico: NO EXISTE\n";
            }
            
            echo "   " . str_repeat("-", 60) . "\n\n";
        }
        
        $primer = $equipos[0];
        echo "🎯 RECOMENDACIÓN PRINCIPAL:\n";
        echo "=" . str_repeat("=", 40) . "\n";
        echo "📋 USA EL EQUIPO ID: {$primer['equipo_id']}\n";
        echo "📝 Nombre: " . ($primer['equipo_nombre'] ?: 'Sin nombre') . "\n";
        echo "🔢 Código: " . ($primer['equipo_codigo'] ?: 'Sin código') . "\n";
        echo "📄 Archivo: {$primer['archivo']}\n";
        echo "\n📋 PASOS PARA PROBAR:\n";
        echo "1. Ve al sistema EVA en el navegador\n";
        echo "2. Busca el equipo con ID: {$primer['equipo_id']}\n";
        echo "3. Haz clic en 'Ver Documentos' o el ícono de documentos\n";
        echo "4. Deberías ver el archivo: {$primer['archivo']}\n";
        echo "5. Haz clic en el archivo para visualizarlo\n";
        echo "6. El archivo debería abrirse en una nueva pestaña\n";
        
        echo "\n🔗 PRUEBA DIRECTA PRIMERO:\n";
        echo "http://localhost:8001/storage/equipos/archivos/{$primer['archivo']}\n";
        echo "Si esta URL funciona, entonces el modal también debería funcionar.\n";
        
    } else {
        echo "❌ NO HAY EQUIPOS CON DOCUMENTOS EN LA BASE DE DATOS\n";
        
        // Buscar equipos sin documentos
        $sqlEquipos = "SELECT id, name, code FROM equipos LIMIT 5";
        $stmtEquipos = $pdo->prepare($sqlEquipos);
        $stmtEquipos->execute();
        $equiposSinDocs = $stmtEquipos->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($equiposSinDocs) > 0) {
            echo "\n📋 EQUIPOS DISPONIBLES (sin documentos):\n";
            foreach ($equiposSinDocs as $equipo) {
                echo "- ID: {$equipo['id']} | " . ($equipo['name'] ?: 'Sin nombre') . " | " . ($equipo['code'] ?: 'Sin código') . "\n";
            }
            echo "\nPuedes subir un documento a cualquiera de estos equipos para probar.\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR DE CONEXIÓN: " . $e->getMessage() . "\n";
    echo "Verifica que la base de datos 'eva_db' exista y esté accesible.\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🔚 Fin de la búsqueda\n";
