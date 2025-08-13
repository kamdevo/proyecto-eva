<?php
// Verificar datos INVIMA del equipo con conexión directa
try {
    // Conexión directa a MySQL - probando diferentes nombres de BD
    $databases = ['gestionthuv', 'proyecto_eva', 'eva', 'eva_proyecto', 'biomedical_equipment'];
    $pdo = null;
    
    foreach ($databases as $dbname) {
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=$dbname;charset=utf8", 'root', '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            echo "✅ Conectado a la base de datos: $dbname\n";
            break;
        } catch (Exception $e) {
            echo "❌ No se pudo conectar a: $dbname\n";
        }
    }
    
    if (!$pdo) {
        // Si no funciona ninguna, mostrar bases disponibles
        try {
            $pdo_temp = new PDO('mysql:host=localhost;charset=utf8', 'root', '');
            $stmt = $pdo_temp->query('SHOW DATABASES');
            $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "\n📋 BASES DE DATOS DISPONIBLES:\n";
            foreach ($databases as $db) {
                echo "   - $db\n";
            }
            return;
        } catch (Exception $e) {
            echo "❌ Error conectando a MySQL: " . $e->getMessage() . "\n";
            return;
        }
    }
    
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
        
        // Verificar si hay tabla invimas
        $stmt = $pdo->query("SHOW TABLES LIKE 'invimas'");
        if ($stmt->rowCount() > 0) {
            echo "\n🔍 TABLA invimas EXISTE\n";
            
            // Mostrar estructura de la tabla invimas
            $stmt = $pdo->query("DESCRIBE invimas");
            $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "\n📋 ESTRUCTURA DE LA TABLA invimas:\n";
            foreach ($columnas as $columna) {
                echo "   - {$columna['Field']} ({$columna['Type']}) " . ($columna['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
            }
            
            // Contar total de registros
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM invimas");
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            echo "\n📊 Total de registros en invimas: $total\n";
            
            // Mostrar algunos registros de ejemplo
            $stmt = $pdo->query("SELECT * FROM invimas LIMIT 3");
            $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "\n📋 PRIMEROS 3 REGISTROS DE LA TABLA invimas:\n";
            foreach ($registros as $i => $registro) {
                echo "--- REGISTRO " . ($i + 1) . " ---\n";
                foreach ($registro as $campo => $valor) {
                    $valorMostrar = is_string($valor) && strlen($valor) > 50 ? substr($valor, 0, 50) . "..." : $valor;
                    echo "   $campo: " . ($valorMostrar ?: 'NULL') . "\n";
                }
                echo "\n";
            }
            
            // Si el equipo tiene invima_id, buscar el registro
            if (isset($equipo['invima_id']) && $equipo['invima_id']) {
                $stmt = $pdo->prepare('SELECT * FROM invimas WHERE id = ?');
                $stmt->execute([$equipo['invima_id']]);
                $registro_invima = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($registro_invima) {
                    echo "✅ REGISTRO INVIMA ASOCIADO AL EQUIPO (ID {$equipo['invima_id']}):\n";
                    foreach ($registro_invima as $campo => $valor) {
                        $valorMostrar = is_string($valor) && strlen($valor) > 100 ? substr($valor, 0, 100) . "..." : $valor;
                        echo "   $campo: " . ($valorMostrar ?: 'NULL') . "\n";
                    }
                } else {
                    echo "\n❌ No se encontró registro INVIMA con ID: {$equipo['invima_id']}\n";
                }
            } else {
                echo "\nℹ️ El equipo no tiene invima_id asignado\n";
                
                // Verificar si el campo 'invima' contiene un número de registro
                if (isset($equipo['invima']) && $equipo['invima'] && $equipo['invima'] !== 'si' && $equipo['invima'] !== 'no') {
                    echo "🔍 Buscando registro INVIMA con número: '{$equipo['invima']}'\n";
                    
                    // Intentar buscar por diferentes campos posibles en la tabla invimas
                    $camposBusqueda = ['numero_registro', 'registro_sanitario', 'invima', 'codigo', 'numero', 'reg_sanitario'];
                    
                    foreach ($camposBusqueda as $campo) {
                        try {
                            $stmt = $pdo->prepare("SELECT * FROM invimas WHERE $campo = ?");
                            $stmt->execute([$equipo['invima']]);
                            $registro_invima = $stmt->fetch(PDO::FETCH_ASSOC);
                            
                            if ($registro_invima) {
                                echo "✅ REGISTRO INVIMA ENCONTRADO POR CAMPO '$campo':\n";
                                foreach ($registro_invima as $campoReg => $valorReg) {
                                    $valorMostrar = is_string($valorReg) && strlen($valorReg) > 100 ? substr($valorReg, 0, 100) . "..." : $valorReg;
                                    echo "   $campoReg: " . ($valorMostrar ?: 'NULL') . "\n";
                                }
                                break;
                            }
                        } catch (Exception $e) {
                            // Campo no existe, continuar silenciosamente
                        }
                    }
                    
                    if (!isset($registro_invima) || !$registro_invima) {
                        echo "❌ No se encontró registro INVIMA con número: '{$equipo['invima']}' en ningún campo\n";
                        
                        // Buscar coincidencias parciales
                        echo "\n🔍 Buscando coincidencias parciales...\n";
                        foreach ($camposBusqueda as $campo) {
                            try {
                                $stmt = $pdo->prepare("SELECT * FROM invimas WHERE $campo LIKE ? LIMIT 3");
                                $stmt->execute(['%' . $equipo['invima'] . '%']);
                                $coincidencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                
                                if (!empty($coincidencias)) {
                                    echo "📋 Coincidencias parciales en campo '$campo':\n";
                                    foreach ($coincidencias as $coincidencia) {
                                        echo "   ID: {$coincidencia['id']}, $campo: " . ($coincidencia[$campo] ?: 'NULL') . "\n";
                                    }
                                }
                            } catch (Exception $e) {
                                // Campo no existe
                            }
                        }
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
            } else {
                echo "❌ No se encontraron tablas relacionadas con INVIMA\n";
            }
        }
        
    } else {
        echo "❌ No se encontró equipo con ID 1\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
