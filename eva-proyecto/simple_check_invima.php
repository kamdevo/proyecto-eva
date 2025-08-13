<?php
// Script simple para verificar datos INVIMA del equipo ID 1
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener información del equipo ID 1
    $stmt = $pdo->prepare('SELECT * FROM equipos WHERE id = 1');
    $stmt->execute();
    $equipo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($equipo) {
        echo "📋 DATOS INVIMA DEL EQUIPO ID 1:\n";
        echo "==================================\n";
        
        // Buscar todas las columnas que contengan 'invima'
        $camposInvima = [];
        foreach ($equipo as $columna => $valor) {
            if (stripos($columna, 'invima') !== false) {
                $camposInvima[] = $columna;
                echo "📌 $columna: " . ($valor ?: 'NULL') . "\n";
            }
        }
        
        // Si no hay campos invima directos, mostrar campo invima simple
        if (empty($camposInvima)) {
            echo "⚠️ No se encontraron campos con 'invima' en el nombre\n";
            if (isset($equipo['invima'])) {
                echo "📌 invima: " . ($equipo['invima'] ?: 'NULL') . "\n";
            }
        }
        
        // Verificar si hay tabla de registros INVIMA
        $stmt = $pdo->query("SHOW TABLES LIKE 'registros_invima'");
        if ($stmt->rowCount() > 0) {
            echo "\n🔍 TABLA registros_invima EXISTE\n";
            
            // Primero obtener las columnas de la tabla
            $stmt = $pdo->query("DESCRIBE registros_invima");
            $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "\n📋 ESTRUCTURA DE registros_invima:\n";
            foreach ($columnas as $columna) {
                echo "   - {$columna['Field']} ({$columna['Type']})\n";
            }
            
            // Mostrar algunos registros de ejemplo con las columnas reales
            $stmt = $pdo->query("SELECT * FROM registros_invima LIMIT 3");
            $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "\n📋 REGISTROS INVIMA DISPONIBLES (primeros 3):\n";
            foreach ($registros as $i => $registro) {
                echo "   REGISTRO " . ($i + 1) . ":\n";
                foreach ($registro as $campo => $valor) {
                    echo "     $campo: " . ($valor ?: 'NULL') . "\n";
                }
                echo "   ---\n";
            }
            
            // Si el equipo tiene campo invima, buscar el registro
            if (isset($equipo['invima']) && $equipo['invima']) {
                echo "\n🔍 Buscando registro INVIMA con número: {$equipo['invima']}\n";
                
                // Buscar por numero_registro
                $stmt = $pdo->prepare('SELECT * FROM registros_invima WHERE numero_registro = ?');
                $stmt->execute([$equipo['invima']]);
                $registro_invima = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($registro_invima) {
                    echo "✅ REGISTRO INVIMA ENCONTRADO EN BD:\n";
                    foreach ($registro_invima as $campo => $valor) {
                        echo "   $campo: " . ($valor ?: 'NULL') . "\n";
                    }
                } else {
                    echo "❌ No se encontró registro INVIMA con número: {$equipo['invima']}\n";
                    echo "💡 Esto significa que el equipo tiene un número INVIMA que no está en la tabla registros_invima\n";
                    echo "💡 El modal debería mostrar '{$equipo['invima']}' como valor predeterminado en el select\n";
                }
            }
        } else {
            echo "\n❌ Tabla registros_invima NO EXISTE\n";
        }
        
    } else {
        echo "❌ No se encontró equipo con ID 1\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
