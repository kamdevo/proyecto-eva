<?php

// Conexión directa a la base de datos
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 BUSCANDO TODOS LOS EQUIPOS CON DOCUMENTOS...\n";
    echo "=" . str_repeat("=", 60) . "\n\n";
    
    // Buscar TODOS los equipos con documentos
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
        ORDER BY e.id ASC
        LIMIT 20
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($equipos) > 0) {
        echo "✅ EQUIPOS CON DOCUMENTOS ENCONTRADOS: " . count($equipos) . "\n\n";
        
        $equiposUnicos = [];
        
        foreach ($equipos as $index => $equipo) {
            // Verificar si el archivo existe físicamente
            $rutaArchivo = "storage/app/public/equipos/archivos/{$equipo['archivo']}";
            $existeArchivo = file_exists($rutaArchivo);
            $tamaño = $existeArchivo ? round(filesize($rutaArchivo) / 1024, 2) : 0;
            
            echo ($index + 1) . ". 🎯 EQUIPO ID: {$equipo['equipo_id']}\n";
            echo "   📝 Nombre: " . ($equipo['equipo_nombre'] ?: 'Sin nombre') . "\n";
            echo "   🔢 Código: " . ($equipo['equipo_codigo'] ?: 'Sin código') . "\n";
            echo "   🏭 Marca: " . ($equipo['marca'] ?: 'Sin marca') . "\n";
            echo "   📄 Archivo: {$equipo['archivo']}\n";
            echo "   📋 Tipo: " . ($equipo['tipo_documento'] ?: 'Sin tipo') . "\n";
            echo "   📅 Fecha: {$equipo['created_at']}\n";
            
            if ($existeArchivo) {
                echo "   ✅ Archivo físico: EXISTE ({$tamaño} KB)\n";
                echo "   🔗 URL: /storage/equipos/archivos/{$equipo['archivo']}\n";
                echo "   🌐 URL completa: http://localhost:8001/storage/equipos/archivos/{$equipo['archivo']}\n";
                
                // Guardar equipos únicos con archivos existentes
                if (!isset($equiposUnicos[$equipo['equipo_id']])) {
                    $equiposUnicos[$equipo['equipo_id']] = $equipo;
                }
            } else {
                echo "   ❌ Archivo físico: NO EXISTE\n";
                echo "   🔗 URL: /storage/equipos/archivos/{$equipo['archivo']} (NO FUNCIONAL)\n";
            }
            
            echo "   " . str_repeat("-", 70) . "\n\n";
        }
        
        // Mostrar resumen de equipos únicos con archivos
        if (count($equiposUnicos) > 0) {
            echo "🎯 RESUMEN - EQUIPOS ÚNICOS CON ARCHIVOS FÍSICOS:\n";
            echo "=" . str_repeat("=", 50) . "\n";
            
            $contador = 1;
            foreach ($equiposUnicos as $equipoId => $equipo) {
                echo "{$contador}. 📋 EQUIPO ID: {$equipoId}\n";
                echo "   📝 Nombre: " . ($equipo['equipo_nombre'] ?: 'Sin nombre') . "\n";
                echo "   🔢 Código: " . ($equipo['equipo_codigo'] ?: 'Sin código') . "\n";
                echo "   📄 Archivo: {$equipo['archivo']}\n";
                echo "   🔗 URL: http://localhost:8001/storage/equipos/archivos/{$equipo['archivo']}\n";
                echo "\n";
                $contador++;
            }
            
            // Recomendación
            $primerEquipo = reset($equiposUnicos);
            echo "🎯 RECOMENDACIÓN:\n";
            echo "Usa cualquiera de estos equipos para probar el modal de documentos.\n";
            echo "Recomiendo empezar con el EQUIPO ID: {$primerEquipo['equipo_id']}\n";
            
        } else {
            echo "❌ NINGÚN EQUIPO TIENE ARCHIVOS FÍSICOS EXISTENTES\n";
        }
        
    } else {
        echo "❌ NO HAY EQUIPOS CON DOCUMENTOS EN LA BASE DE DATOS\n";
        
        // Buscar equipos sin documentos
        $sqlEquipos = "SELECT id, name, code FROM equipos ORDER BY id ASC LIMIT 10";
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
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🔚 Fin de la búsqueda\n";
