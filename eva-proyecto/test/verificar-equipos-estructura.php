<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Conectar a la base de datos
    $host = 'localhost';
    $dbname = 'gestionthuv';
    $username = 'root';
    $password = '';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Conexión exitosa a la base de datos\n\n";

    // Verificar estructura de tabla equipos
    echo "🔍 ESTRUCTURA DE TABLA EQUIPOS:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    $stmt = $pdo->query("DESCRIBE equipos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . $col['Null'] . " | " . $col['Key'] . "\n";
    }
    echo "\n";

    // Verificar algunos datos de ejemplo
    echo "📋 MUESTRA DE DATOS EQUIPOS (primeros 3):\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    $stmt = $pdo->query("SELECT * FROM equipos LIMIT 3");
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($equipos as $i => $equipo) {
        echo "EQUIPO " . ($i + 1) . ":\n";
        foreach ($equipo as $key => $value) {
            echo "  $key: $value\n";
        }
        echo "\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
