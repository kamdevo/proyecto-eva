<?php
/**
 * Script para corregir la tabla registros_invima
 */

$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    echo "🔗 Conectado a la base de datos\n";
    
    // Verificar estructura de registros_invima
    echo "📋 Verificando estructura de 'registros_invima'...\n";
    $stmt = $pdo->query("DESCRIBE registros_invima");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $existingColumns = [];
    foreach ($columns as $column) {
        $existingColumns[] = $column['Field'];
        echo "   - " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    
    // Columnas que necesita el controlador
    $requiredColumns = [
        'archivo_pdf' => 'VARCHAR(255) DEFAULT NULL',
        'fecha_vencimiento' => 'DATE DEFAULT NULL',
        'estado' => 'VARCHAR(50) DEFAULT NULL',
        'observaciones' => 'TEXT DEFAULT NULL'
    ];
    
    echo "\n🔄 Agregando columnas faltantes...\n";
    
    foreach ($requiredColumns as $columnName => $columnDef) {
        if (!in_array($columnName, $existingColumns)) {
            echo "   Agregando columna '$columnName'...\n";
            $pdo->exec("ALTER TABLE registros_invima ADD COLUMN $columnName $columnDef");
            echo "   ✅ Columna '$columnName' agregada\n";
        } else {
            echo "   ✅ Columna '$columnName' ya existe\n";
        }
    }
    
    echo "\n📊 Insertando algunos registros de ejemplo...\n";
    
    // Insertar algunos registros de ejemplo
    $pdo->exec("
        INSERT IGNORE INTO `registros_invima` 
        (`id`, `numero_registro`, `nombre_comercial`, `fabricante`, `importador`, `estado`) VALUES 
        (1, 'INVIMA-001', 'Monitor de Signos Vitales', 'Philips', 'Importadora Médica', 'Vigente'),
        (2, 'INVIMA-002', 'Ventilador Mecánico', 'GE Healthcare', 'Distribuidora Salud', 'Vigente'),
        (3, 'INVIMA-003', 'Desfibrilador', 'Medtronic', 'Equipos Médicos SA', 'Vigente')
    ");
    
    echo "✅ Registros de ejemplo insertados\n";
    
    echo "\n🎉 TABLA 'registros_invima' CORREGIDA EXITOSAMENTE\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
