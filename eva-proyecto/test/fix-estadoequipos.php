<?php
/**
 * Script para corregir la tabla estadoequipos y insertar datos básicos
 */

$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    echo "🔗 Conectado a la base de datos\n";
    
    // Verificar estructura de estadoequipos
    echo "📋 Verificando estructura de 'estadoequipos'...\n";
    $stmt = $pdo->query("DESCRIBE estadoequipos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hasDescription = false;
    $hasColor = false;
    
    foreach ($columns as $column) {
        echo "   - " . $column['Field'] . " (" . $column['Type'] . ")\n";
        if ($column['Field'] == 'description') $hasDescription = true;
        if ($column['Field'] == 'color') $hasColor = true;
    }
    
    // Agregar columnas faltantes si es necesario
    if (!$hasDescription) {
        echo "🔄 Agregando columna 'description'...\n";
        $pdo->exec("ALTER TABLE estadoequipos ADD COLUMN description TEXT DEFAULT NULL");
        echo "✅ Columna 'description' agregada\n";
    }
    
    if (!$hasColor) {
        echo "🔄 Agregando columna 'color'...\n";
        $pdo->exec("ALTER TABLE estadoequipos ADD COLUMN color VARCHAR(7) DEFAULT NULL");
        echo "✅ Columna 'color' agregada\n";
    }
    
    // Insertar estados básicos
    echo "📊 Insertando estados de equipos...\n";
    $pdo->exec("
        INSERT IGNORE INTO `estadoequipos` (`id`, `name`, `description`, `color`) VALUES 
        (1, 'Operativo', 'Equipo en funcionamiento normal', '#28a745'),
        (2, 'Mantenimiento', 'Equipo en mantenimiento', '#ffc107'),
        (3, 'Fuera de servicio', 'Equipo no operativo', '#dc3545'),
        (4, 'En reparación', 'Equipo siendo reparado', '#fd7e14')
        ON DUPLICATE KEY UPDATE 
        description = VALUES(description),
        color = VALUES(color)
    ");
    echo "✅ Estados de equipos insertados\n";
    
    // Insertar clasificación de riesgos
    echo "📊 Insertando clasificación de riesgos...\n";
    $pdo->exec("
        INSERT IGNORE INTO `criesgos` (`id`, `name`, `nivel`, `description`) VALUES 
        (1, 'Clase I', 'Bajo', 'Riesgo bajo'),
        (2, 'Clase IIa', 'Medio', 'Riesgo medio'),
        (3, 'Clase IIb', 'Medio-Alto', 'Riesgo medio-alto'),
        (4, 'Clase III', 'Alto', 'Riesgo alto')
    ");
    echo "✅ Clasificación de riesgos insertada\n";
    
    echo "\n🎉 CORRECCIONES COMPLETADAS\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
