<?php
// Verificar datos INVIMA del equipo ID 1 con tabla invimas
require_once 'eva-backend/config/database.php';

try {
    $pdo = getConnection();
    
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
        
        // Verificar si hay tabla invimas (no registros_invima)
        $stmt = $pdo->query("SHOW TABLES LIKE 'invimas'");
        if ($stmt->rowCount() > 0) {
            echo "\n🔍 TABLA invimas EXISTE\n";
            
            // Mostrar estructura de la tabla invimas
            $stmt = $pdo->query("DESCRIBE invimas");
            $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "\n� ESTRUCTURA DE LA TABLA invimas:\n";
            foreach ($columnas as $columna) {
                echo "   - {$columna['Field']} ({$columna['Type']}) " . ($columna['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
            }
            
            // Mostrar algunos registros de ejemplo
            $stmt = $pdo->query("SELECT * FROM invimas LIMIT 5");
            $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "\n📋 REGISTROS INVIMAS DISPONIBLES (primeros 5):\n";
            foreach ($registros as $registro) {
                echo "   ID: {$registro['id']}\n";
                // Mostrar los primeros campos para entender la estructura
                foreach ($registro as $campo => $valor) {
                    if ($campo !== 'id') {
                        echo "   $campo: " . (is_string($valor) ? substr($valor, 0, 50) : $valor) . "\n";
                        break; // Solo mostrar el primer campo después del ID para entender
                    }
                }
                echo "   ---\n";
            }
            
            // Si el equipo tiene invima_id, buscar el registro
            if (isset($equipo['invima_id']) && $equipo['invima_id']) {
                $stmt = $pdo->prepare('SELECT * FROM invimas WHERE id = ?');
                $stmt->execute([$equipo['invima_id']]);
                $registro_invima = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($registro_invima) {
                    echo "\n✅ REGISTRO INVIMA ASOCIADO AL EQUIPO:\n";
                    foreach ($registro_invima as $campo => $valor) {
                        echo "   $campo: " . ($valor ?: 'NULL') . "\n";
                    }
                } else {
                    echo "\n❌ No se encontró registro INVIMA con ID: {$equipo['invima_id']}\n";
                }
            } else {
                echo "\nℹ️ El equipo no tiene invima_id asignado\n";
                
                // Verificar si el campo 'invima' contiene un número de registro
                if (isset($equipo['invima']) && $equipo['invima'] && $equipo['invima'] !== 'si' && $equipo['invima'] !== 'no') {
                    echo "🔍 Buscando registro INVIMA con número: {$equipo['invima']}\n";
                    
                    // Intentar buscar por diferentes campos posibles
                    $camposBusqueda = ['numero_registro', 'registro_sanitario', 'invima', 'codigo'];
                    
                    foreach ($camposBusqueda as $campo) {
                        try {
                            $stmt = $pdo->prepare("SELECT * FROM invimas WHERE $campo = ?");
                            $stmt->execute([$equipo['invima']]);
                            $registro_invima = $stmt->fetch(PDO::FETCH_ASSOC);
                            
                            if ($registro_invima) {
                                echo "✅ REGISTRO INVIMA ENCONTRADO POR CAMPO '$campo':\n";
                                foreach ($registro_invima as $campoReg => $valorReg) {
                                    echo "   $campoReg: " . ($valorReg ?: 'NULL') . "\n";
                                }
                                break;
                            }
                        } catch (Exception $e) {
                            // Campo no existe, continuar
                        }
                    }
                    
                    if (!isset($registro_invima) || !$registro_invima) {
                        echo "❌ No se encontró registro INVIMA con número: {$equipo['invima']}\n";
                    }
                }
            }
        } else {
            echo "\n❌ Tabla invimas NO EXISTE\n";
            
            // Verificar qué tablas relacionadas con INVIMA existen
            $stmt = $pdo->query("SHOW TABLES LIKE '%invima%'");
            $tablasInvima = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (!empty($tablasInvima)) {
                echo "\n🔍 TABLAS RELACIONADAS CON INVIMA ENCONTRADAS:\n";
                foreach ($tablasInvima as $tabla) {
                    echo "   - $tabla\n";
                }
            }
        }
        
    } else {
        echo "❌ No se encontró equipo con ID 1\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
