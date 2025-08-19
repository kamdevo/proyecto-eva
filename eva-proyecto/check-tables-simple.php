<?php
// Script simple para verificar existencia de tablas y estructura

// Configuración de conexión directa
$host = '127.0.0.1';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VERIFICACIÓN DE BASE DE DATOS ===\n\n";
    
    // 1. Verificar qué base de datos estamos usando
    $stmt = $pdo->query("SELECT DATABASE()");
    $currentDb = $stmt->fetchColumn();
    echo "Base de datos actual: $currentDb\n\n";
    
    // 2. Listar todas las tablas
    echo "=== TABLAS EN LA BASE DE DATOS ===\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $equiposExists = false;
    $correctivosExists = false;
    
    foreach ($tables as $table) {
        echo "- $table\n";
        if ($table === 'equipos') $equiposExists = true;
        if ($table === 'correctivos_generales') $correctivosExists = true;
    }
    
    echo "\n=== VERIFICACIÓN DE TABLAS CRÍTICAS ===\n";
    echo "Tabla 'equipos' existe: " . ($equiposExists ? "SÍ" : "NO") . "\n";
    echo "Tabla 'correctivos_generales' existe: " . ($correctivosExists ? "SÍ" : "NO") . "\n\n";
    
    // 3. Si equipos existe, verificar su estructura
    if ($equiposExists) {
        echo "=== ESTRUCTURA DE TABLA 'equipos' ===\n";
        $stmt = $pdo->query("DESCRIBE equipos");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($columns as $column) {
            echo "- {$column['Field']} ({$column['Type']}) " . 
                 ($column['Key'] === 'PRI' ? '[PRIMARY KEY]' : '') . 
                 ($column['Null'] === 'NO' ? '[NOT NULL]' : '[NULL]') . "\n";
        }
        
        // Verificar algunos registros
        echo "\n=== ALGUNOS REGISTROS DE equipos ===\n";
        $stmt = $pdo->query("SELECT id, name, code FROM equipos LIMIT 5");
        $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($equipos as $equipo) {
            echo "ID: {$equipo['id']}, Nombre: {$equipo['name']}, Código: {$equipo['code']}\n";
        }
        
        // Contar total de equipos
        $stmt = $pdo->query("SELECT COUNT(*) FROM equipos");
        $totalEquipos = $stmt->fetchColumn();
        echo "\nTotal de equipos: $totalEquipos\n";
    }
    
    // 4. Si correctivos_generales existe, verificar su estructura
    if ($correctivosExists) {
        echo "\n=== ESTRUCTURA DE TABLA 'correctivos_generales' ===\n";
        $stmt = $pdo->query("DESCRIBE correctivos_generales");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($columns as $column) {
            echo "- {$column['Field']} ({$column['Type']}) " . 
                 ($column['Key'] === 'PRI' ? '[PRIMARY KEY]' : '') . 
                 ($column['Null'] === 'NO' ? '[NOT NULL]' : '[NULL]') . "\n";
        }
        
        // Contar total de correctivos
        $stmt = $pdo->query("SELECT COUNT(*) FROM correctivos_generales");
        $totalCorrectivos = $stmt->fetchColumn();
        echo "\nTotal de correctivos: $totalCorrectivos\n";
        
        // Verificar relación con equipos
        if ($equiposExists) {
            echo "\n=== VERIFICACIÓN DE RELACIÓN equipos-correctivos ===\n";
            $stmt = $pdo->query("
                SELECT cg.id, cg.equipo_id, e.name as equipo_name 
                FROM correctivos_generales cg 
                LEFT JOIN equipos e ON cg.equipo_id = e.id 
                LIMIT 5
            ");
            $relaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($relaciones as $rel) {
                echo "Correctivo ID: {$rel['id']}, Equipo ID: {$rel['equipo_id']}, Equipo: " . 
                     ($rel['equipo_name'] ?? 'NO ENCONTRADO') . "\n";
            }
        }
    }
    
} catch (PDOException $e) {
    echo "ERROR DE CONEXIÓN: " . $e->getMessage() . "\n";
}
?>
